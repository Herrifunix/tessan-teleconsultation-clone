# Décisions techniques

Chaque décision compare les options selon trois critères : **fidélité visuelle**, **fiabilité du déploiement**, **complexité**. Les mesures citées sont reproductibles avec les scripts de `tools/`.

---

## (a) Librairie de carte

L'original utilise **Google Maps JavaScript API** (clé d'API liée au domaine `tessan.io`), `@googlemaps/markerclusterer` avec l'algorithme **SuperCluster** (`radius: 65`, `maxZoom: 11`), des icônes SVG 50×50 pour les clusters et `/marker.svg` 32×48 pour les pharmacies (spec : `docs/research/components/map.md`).

| Option | Fidélité | Déploiement | Complexité |
|---|---|---|---|
| Google Maps JS API | Parfaite (même rendu de tuiles) | ❌ exige une clé d'API et une facturation ; réutiliser la clé de Tessan serait illégitime | Faible |
| MapLibre GL + tuiles vectorielles (OpenFreeMap) | Bonne (style personnalisable) | ✅ sans clé | Élevée : ~800 Ko de JS, réécriture des marqueurs/clusters/popups en couches GL |
| **Leaflet 1.9 + SuperCluster + tuiles raster sans clé** | Très bonne pour tout ce qui n'est pas la tuile : **même algorithme de regroupement et mêmes paramètres**, mêmes icônes, même popup (composant React identique), mêmes zooms (6, 15, 16) | ✅ sans clé, 160 Ko (48 Ko gzip), chargé à la demande | Faible |

**Choix : Leaflet + SuperCluster.** Le regroupement est calculé par la même bibliothèque que l'original (`supercluster`, mêmes `radius`/`maxZoom`), les clusters sont dessinés avec le même SVG, la popup réutilise la carte de pharmacie.

**Fond de carte** — comparé visuellement au rendu Google aux zooms 6 (France) et 13 (Nice), mêmes centre et zoom (`/tmp` → captures dans la transcription) :

| Fond | Résultat |
|---|---|
| CARTO Voyager / Positron | ❌ en 2026, tuiles filigranées « API KEY REQUIRED » |
| OpenStreetMap standard | ✅ sans clé, mais très coloré (occupations du sol), éloigné du style Google |
| Esri World Street Map | ✅ sans clé, dominante beige |
| **Esri World Topographic** | ✅ sans clé, sol gris clair, routes grises, eau bleu clair : le plus proche des fonds sans clé **pour la teinte générale aux zooms ville** (couleur moyenne à ±4 niveaux au zoom 16) ; **écart assumé au zoom France** : palette pâle (mer ≈ 214/242/255, terre ≈ 243/248/238) face au cyan et au vert d'eau de Google (mer 120/213/233, terre 193/239/218), libellés en anglais, relief et bâti plus marqués au zoom rue. Un filtre de couleur calibré a été écarté : passer de ces teintes peu contrastées aux teintes saturées de Google demanderait des pentes de 2,5 à 4,3 par canal, ce qui dégraderait routes, libellés et texture. |

**Choix : Esri World Topographic**, avec bascule tuile par tuile vers OpenStreetMap en cas d'erreur, attributions affichées. Les tuiles restent un écart intrinsèque : elles sont **masquées** dans les diffs pixel.

---

## (b) Source des données

L'original lit la table Supabase `gmb_locations` (1 807 lignes actives, 11 Mo JSON) avec une clé publique, plus `/api/pharmacies/<code>` (description, photos) et `/api/can-reserve/<id>`.

| Option | Fidélité | Déploiement | Complexité |
|---|---|---|---|
| Interroger la Supabase de Tessan en direct | Parfaite (mêmes chiffres partout) | ❌ dépendance à une base tierce, usage non autorisé de leur clé, CORS/limites | Faible |
| Base complète copiée (1 807 lignes) | Très bonne | ⚠️ 11 Mo de données d'un tiers publiées ; contraire à la consigne d'échantillon | Faible |
| **Échantillon réel de 58 points (même format) + compléments** | Identique pour les villes échantillonnées (Nice : mêmes 5 résultats, mêmes distances, même ordre) ; les comptes « départements/régions à proximité » et les clusters diffèrent | ✅ fichiers statiques (19 + 28 Ko gzip) | Faible |

**Choix : échantillon de 58 points de vente réels** (53 au départ, plus 5 départements listés « à proximité » de Nice par l’original, ajoutés en itération 3) (`src/data/locations.json`, lignes brutes au format Supabase, triées comme la requête de l'original), plus `src/data/pharmacy-extras.json` (description, photos, `canBook`) récupéré depuis les API de l'original, et `src/data/sample-selection.json` qui justifie chaque ligne. Sélection reproductible : `tools/data/select-sample.py` puis `tools/data/build-data.py`.

- Villes demandées : Paris (7), Nice (5 + les 2 voisins de la fiche), Lyon (5), Marseille (5), Franconville (1 + ses 5 plus proches, pour reproduire la règle « ≤ 3 résultats → +5 »), **Choisy-le-Roi : aucun dispositif n'existe dans les données réelles** → les 4 plus proches (Orly, Vitry, Villejuif, Ivry), exactement ceux que l'original liste en tête pour cette recherche.
- Couverture : ≥ 10 départements et ≥ 10 régions pour que les grilles « à proximité » gardent 10 cartes, comme l'original.
- Cas limites réels inclus : nom très long (68 caractères, Saint-Étienne), noms composés et apostrophes (« Verneuil d'Avre et d'Iton »), pharmacies sans réservation possible (`canBook: false`).
- Les données sont chargées **à l'exécution** (`fetch` d'un JSON émis par Vite), comme l'original charge Supabase : l'état « Chargement... » existe et les tests peuvent injecter des cas limites (horaires absents).
- Photos : URL publiques du CDN Partoo, **comme l'original** (pas de copie des photos dans le dépôt).

---

## (c) Cible de déploiement

| Option | Fidélité | Déploiement | Complexité |
|---|---|---|---|
| **Vercel** (`vercel --prod`) | Routes identiques à la racine du domaine | ✅ `vercel whoami` = `herrifunix` ; réécriture SPA → **200** sur toute route profonde | Faible |
| GitHub Pages | Routes préfixées par `/tessan-teleconsultation-clone/` ; le repli `404.html` renvoie un statut **404** sur les routes profondes | ⚠️ contraire à l'exigence « curl route profonde = 200 » sans pré-générer chaque route | Moyenne |
| Netlify / Cloudflare Pages | Équivalent à Vercel | ❌ pas d'identifiants disponibles dans l'environnement | Faible |

**Choix : Vercel**, `vercel.json` avec réécriture de toutes les routes non statiques vers `index.html`, en-tête `X-Robots-Tag: noindex, nofollow`, cache long pour les polices.

---

## Autres décisions

### Stack : Vite + React + TypeScript + React Router, Tailwind v4 (même version que l'original)
L'original est un Next.js (App Router) avec Tailwind **4.1.14**, shadcn/ui et lucide-react. Le clone est une SPA Vite (la consigne), mais reprend **Tailwind 4.1.14** et **lucide-react** : mêmes utilitaires, mêmes icônes, et donc mêmes déclarations CSS générées. Le thème par défaut de Tailwind n'est **pas** importé : `src/styles/tokens.css` est généré depuis `docs/research/tokens.json` (137 valeurs mesurées, chacune avec sa provenance) ; aucune couleur ou taille n'existe en dehors de ces tokens. Les valeurs « arbitraires » de l'original (`bg-[#FFF198]`, `max-w-[1328px]`…) sont devenues des tokens nommés (`bg-yellow-cta`, `max-w-page`…).

Versions figées : Vite 7.3.6 (Tailwind 4.1.14 ne supporte pas Vite 8), TypeScript 5.9.3 (typescript-eslint < 6.1), React 19.3.0, React Router 8.4.0 (Node ≥ 22.22 → `.nvmrc` 22.22.2).

### Route unique « attrape-tout »
L'original n'a qu'une route catch-all (`app/[...location]`). Le clone reproduit le même analyseur d'URL : `/`, `/fr/france-FR/<ville>/results`, `/<région>/<département>/<ville>`, préfixe de spécialité (`/dermatologues/…`), code postal final, et fiche `/<…>/<code_magasin>/<slug>` (ou `/<code>/<slug>`, `/pharmacie/<code>`). Une ville inconnue affiche la vue d'accueil sans changer l'URL, comme l'original.

### Polices : Recoleta n'est pas redistribuable
- **Plus Jakarta Sans** (SIL OFL) : fichiers identiques à ceux de l'original, auto-hébergés et préchargés.
- **Recoleta** est une police commerciale (« © 2018 Jorge Cisterna. All rights reserved », Latinotype ; le fichier servi porte la mention « wf-rip »). La publier dans un dépôt public serait une violation de licence : **refusé**.
- Remplacement : **« TC Serif »**, instances statiques de **Fraunces** (SIL OFL) générées par `tools/fonts/build-serif.py` (`opsz` 9, `SOFT` 100, `WONK` 0) après une recherche systématique (graisse × axe optique) minimisant le diff pixel et l'écart de densité d'encre avec Recoleta : graisses Fraunces 375/475/575/675 pour 400/500/600/700.
- Calibration (`tools/fonts/calibrate-serif.mjs`) : `size-adjust` par graisse **aux tailles réellement utilisées** (Recoleta est hintée : sa largeur n'est pas proportionnelle à la taille), `ascent-override`/`descent-override` recalculés pour conserver l'interligne `normal` de Recoleta. Résultat : noms en gras 20 px à ±1,4 % de largeur, interligne identique.
- **Roboto** (Apache 2.0) pour la popup de carte, car l'original y hérite de la police de `.gm-style`.

### Géocodage : API Adresse avec repli Géoplateforme
Source principale : `api-adresse.data.gouv.fr` (exigée). Depuis l'environnement de développement, cet hôte réinitialise la connexion TLS, alors que son successeur officiel **`data.geopf.fr/geocodage`** (IGN, même format GeoJSON, mêmes paramètres) répond. Le clone interroge l'API Adresse puis, en cas d'échec réseau ou HTTP, la Géoplateforme, dans un **budget global de 5 s** ; au-delà, message clair (« Le service de recherche d'adresses ne répond pas… »). Si le géocodage échoue mais qu'une ville de l'échantillon correspond, la recherche aboutit quand même (équivalent du repli `ilike` de l'original).

### Autocomplétion
L'original utilise Google Places Autocomplete. Le clone propose d'abord les **villes de l'échantillon** (instantané, insensible à la casse et aux accents, tolérant aux fautes de frappe par distance de Levenshtein, noms composés), puis les **communes de l'API Adresse** (différé de 250 ms). Le rendu reprend exactement la personnalisation `.pac-container` de l'original. Le champ est un `combobox` ARIA complet (flèches, Entrée, Échap).

### Statut ouvert / fermé en Europe/Paris
L'original calcule le statut avec l'heure locale du navigateur (`getHours()/getDay()`), donc faux pour un visiteur hors de France. Le clone reprend **exactement le même algorithme et les mêmes textes** mais lit l'heure dans le fuseau `Europe/Paris` (`Intl.DateTimeFormat`), testé avec une horloge simulée dans trois fuseaux.

### Réservation : parcours reproduit, aucun envoi
Les 4 étapes, le planning par spécialité, les jours fériés et la génération des créneaux de 2 h sont reproduits. Le clone n'ayant pas de serveur et s'agissant d'un service médical, **aucune réservation n'est simulée comme réelle** : l'étape finale reprend la mise en page de confirmation mais indique qu'aucune réservation n'a été transmise, avec un lien vers le vrai service.

### Bannière cookies
Reproduction de la bannière CookieYes (textes, couleurs, dimensions, responsive, centre de préférences et bouton de rappel). Le clone ne charge **aucun** traceur : le choix est seulement mémorisé dans `localStorage`.

### Sécurité et sémantique (sans effet visuel)
- Description des pharmacies : l'original l'injecte avec `dangerouslySetInnerHTML` ; le clone la transforme en nœuds React par un parseur limité (`<b>`, `<i>`, `<br>`, listes « - »), le reste est ignoré. Règle ESLint interdisant `dangerouslySetInnerHTML` et `innerHTML`.
- Lien de distance : vraie URL Google Maps (`target="_blank"`, `rel="noopener"`) au lieu de `href="#"` + `window.open`. « Itinéraire » devient un lien. Cartes en `<article>`, horaires en `<table>`, modales `role="dialog"` nommées.
- Paramètres de l'API encodés avec `encodeURIComponent`, aucun secret (aucune clé n'est nécessaire).

### Non-indexation
`<meta name="robots" content="noindex, nofollow">`, en-tête `X-Robots-Tag`, `robots.txt` en `Disallow: /`, et mention « Reproduction réalisée dans le cadre d'un test technique — non affiliée à Tessan » dans le pied de page.

### Accès au site d'origine pendant la reconnaissance
Le site est derrière un « Vercel Security Checkpoint » lié à l'IP ; le proxy de l'environnement change d'IP à chaque connexion. Solution : rejouer toutes les requêtes `*.tessan.io` sur **un seul tunnel keep-alive** (`tools/recon/sticky.mjs`), et épingler la seule clé publique du CA du proxy dans Chromium plutôt que de désactiver la vérification TLS.

### Code source de l'original
Les bundles JavaScript de l'original ont été téléchargés et dé-minifiés **localement** pour l'analyse, mais ne sont **pas publiés** (`.gitignore`) : seules mes spécifications (`docs/research/components/`) et les données mesurées le sont.
