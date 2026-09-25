# Progress

## Journal
- Démarrage : dépôt vide (README initial), Node v22.22.2, npm 10.9.7, Playwright 1.56.1 disponible. Pas de CLI `vercel` ni `gh` installés.
- Branche de travail imposée par l'environnement : `claude/determined-gates-tf68yi` ; la mission demande explicitement `main` → je développe sur la branche de session et pousse aussi sur `main` (fast-forward, jamais de force-push).
- Checklist créée (121 exigences) + `npm run done-check`.

## Phase 1 — Reconnaissance
### Accès (P1-01)
- `curl` → HTTP 429 « Vercel Security Checkpoint » (challenge JS).
- Chromium Playwright ne faisait pas confiance au CA du proxy de l'environnement : je n'ai **pas** désactivé TLS, j'ai épinglé la seule clé publique du CA du proxy (`--ignore-certificate-errors-spki-list`, voir `tools/recon/browser.mjs`).
- **Headless OK** (locale fr-FR, fuseau Europe/Paris, UA Chrome 141 réel) : le challenge passe, mais ~16/25 sous-ressources recevaient des 429.
- Cause prouvée : l'IP de sortie du proxy change à chaque connexion (5 IP différentes en 6 requêtes) alors que le cookie `_vcrcs` du challenge est lié à l'IP ; au sein d'une même connexion keep-alive, l'IP est stable (6/6 identiques).
- Solution : `tools/recon/sticky.mjs` rejoue toutes les requêtes `*.tessan.io` sur UN seul tunnel keep-alive (undici, `connections: 1`) avec un cookie jar → 92/96 requêtes en 200, page entièrement rendue.
- **Chemin retenu : headless + tunnel collant** (pas besoin de headed, de l'extension Chrome ni de web.archive.org).
- Budget de pages (P1-02) : 7 pages distinctes de l'original chargées (accueil, résultats Nice, fiche 557, Choisy-le-Roi, spécialité + ville, ville inconnue, format court de fiche). Transparence : ~37 chargements de document au total, dont 3 passes de captures de référence de 9 pages (la 3ᵉ pour ajouter les dumps de mise en page) ; chaque requête espacée d'au moins 1 s, les appels d'API de 1,1 à 6 s.
- Pilote persistant `tools/recon/driver.mjs` (+ `tools/recon/ev.sh`) pour explorer les interactions sans recharger de pages (budget de 20 pages, visites journalisées dans `docs/research/visits.log`).

### Découvertes
- Stack d'origine : Next.js (App Router, route catch-all `app/[...location]`), Tailwind CSS v4.1.14, shadcn/ui, lucide-react, Google Maps JS API (+ @googlemaps/markerclusterer, SuperCluster radius 65 / maxZoom 11), Supabase (`gmb_locations`, 1 807 lignes actives), CookieYes.
- Polices : Plus Jakarta Sans (300–700, auto-hébergée par next/font) et Recoleta (400–700). Titres h1–h6 en Recoleta 400.
- **Pas de menu burger** : la nav est `hidden lg:flex` ; en dessous de 1024 px le header ne montre que logo + « Compte patient ».
- Gabarits : accueil `/`, résultats (catch-all : `/fr/france-FR/<ville>/results`, `/<région>/<département>/<ville>`, `/<spécialité>/...`), fiche `/<région>/<département>/<ville>/<code_magasin>/<slug>`.
- Statut ouvert/fermé calculé par l'original avec l'heure **locale du navigateur** (`getHours()/getDay()`), pas Europe/Paris.
- Choisy-le-Roi : **aucun dispositif** dans les données réelles (0 ligne `ville` ≈ choisy, 0 ligne CP 94600).
- Le bundle ne contient aucune consigne adressée à une IA (vérifié en lisant les modules applicatifs) — rien à signaler.

## Phase 2 — Fondations
- `vercel whoami` → `herrifunix` : déploiement Vercel (`base: "/"`, réécriture SPA dans `vercel.json`).
- Versions figées : Vite 7.3.6 (Tailwind 4.1.14 ne supporte pas Vite 8), TypeScript 5.9.3 (typescript-eslint < 6.1), React 19.3.0, React Router 8.4.0 (Node ≥ 22.22 → `.nvmrc` 22.22.2).
- Polices : Plus Jakarta Sans (OFL) auto-hébergée avec les fichiers identiques à l'original. **Recoleta est commerciale** (© Latinotype, fichier « wf-rip ») → non redistribuée ; remplacée par « TC Serif », instances de Fraunces (OFL) choisies par recherche systématique (opsz 9, SOFT 100 ; graisses 375/475/575/675) et calibrées (`size-adjust` ≈ 94 %, `ascent/descent-override` compensés) : largeur à ±1 % et hauteur de ligne identique (docs/research/serif-calibration.json).
- Tests e2e écrits AVANT les composants (commit dédié). Localisateurs par rôle et texte accessible ; exceptions justifiées : `data-testid="opening-status"` (paragraphe de statut sans rôle), `data-testid="pharmacy-map"` (conteneur de carte différée), attributs `data-zoom` / `data-animated` sur la région « Carte » et `window.__tcMap` (état interne de Leaflet non exposé par l'accessibilité).
- Écarts assumés dès la conception (sémantique/sécurité, sans effet visuel) : lien de distance avec une vraie URL Google Maps (l'original utilise `href="#"` + `window.open`), cartes de pharmacie en `<article>`, horaires en `<table>`, description rendue sans `dangerouslySetInnerHTML` (parseur sûr), statut calculé en Europe/Paris (l'original utilise l'heure locale du navigateur).
- **API Adresse injoignable depuis l'environnement** : le CONNECT aboutit mais `api-adresse.data.gouv.fr` réinitialise la négociation TLS (`curl: (35) Connection reset by peer`), alors que `data.geopf.fr/geocodage` (successeur officiel IGN, même format) et `geo.api.gouv.fr` répondent. Décision : API Adresse en source principale (exigence), repli automatique sur la Géoplateforme en cas d'échec réseau/HTTP, budget global de 5 s puis message clair.
- **Test modifié (contredisait l'original)** : `search.spec.ts` « autocomplétion … » attendait « 5 dispositifs » après sélection de Nice. Le code de l'original (module 5915, fonction `_Q(...).slice(0, 20)`) montre qu'une recherche géocodée liste les **20** plus proches ; seule l'URL de ville filtre par ville. Assertion corrigée en « 20 dispositifs ». Idem Choisy-le-Roi : la distance dépend du géocodeur (Google 2,1 km vs BAN 2,3 km), l'assertion porte sur l'ordre (Saffar puis Souir).
- **Test modifié (contredisait l'original)** : `status.spec.ts` attendait « Réouvre à 14:30 » / « Ouvre à 09:00 ». Le module 6504 de l'original renvoie l'heure seule pour une réouverture le même jour (« Fermé · Réouvre 14:30 », « Fermé · Ouvre 09:00 ») et « à » seulement pour un autre jour (« Ouvre demain à 09:00 »). Relevé par le sous-agent de spec de la fiche.
- **Test modifié (contredisait l'original)** : `booking.spec.ts` attendait un bouton de confirmation désactivé pour un e-mail mal formé. Le module 7686 ne le désactive que si le champ est vide (`disabled: !email || submitting`) ; une adresse refusée par le serveur affiche « Une erreur est survenue. ». Le clone, sans back-end, reproduit ce message pour un format invalide et termine sur une étape de confirmation honnête (« aucune réservation n'a été transmise »).

## Phase 4 — Boucle de diff
### Écart persistant : noms de pharmacie en serif gras ~9 % trop étroits (après 2 réglages de `size-adjust`)
Hypothèses, par probabilité :
1. Appariement de graisse raté (la face 700 de TC Serif non chargée → 400 en gras synthétique) — *cascade/police de repli*.
2. Calibration faite à une taille non représentative : Recoleta est une police **hintée**, ses avances sont arrondies aux petites tailles, donc sa largeur n'est pas proportionnelle à la taille — *arrondi sub-pixel*.
3. L'original sert un autre fichier pour le gras — *token/données erronés*.
Mesures : largeurs DOM de référence (295/223 px) = Recoleta 700 locale à 20 px (295/223) → (3) écartée ; `document.fonts` « TC Serif 700 loaded » et avances de l'instance 700 > 400 de 7 % → (1) écartée ; Recoleta 700 = 295 px à 20 px mais 545 px à 40 px (au lieu de 590) → (2) **confirmée**.
Correction : calibration refaite aux tailles d'usage (`tools/fonts/calibrate-serif.mjs`, 20 px pour 600/700, 24/30/35,2 px pour 400, 40 px pour 500) → 291/223/285/222/248 px contre 295/223/287/221/251 px (écart ≤ 1,4 %).
- **Tests corrigés (sélecteurs ambigus, sans changement de comportement attendu)** : `results.spec.ts` (la regex « … autour de vous » attrapait aussi le `h1`, désormais `^\d+ dispositifs?`), `search.spec.ts` (« Dermatologue » existe aussi dans le fil d'Ariane → recherche dans le `role="search"`).
- **Test modifié (contredisait l'original)** : « zoom texte 200 % » forçait `html{font-size:200%}` à 1280 px ; les points de rupture étant en `rem` du média initial, l'original déborde aussi dans ce mode « texte seul ». Remplacé par l'émulation d'un zoom navigateur à 200 % (fenêtre 1280 × 900 → 640 × 450 px CSS, densité 2), cas de WCAG 1.4.4.
- **Écart corrigé dans le code** : après sélection d'une commune, le clone ajoutait le code postal à l'URL (`/…/nice/06100`) et filtrait sur ce code. Google Places ne renvoie pas de `postal_code` pour une ville ; seul un code postal saisi restreint désormais la recherche.
- **Test corrigé (synchronisation)** : `map.spec.ts` « clic sur un marqueur » recentrait la carte avant que son module (chargé à la demande) n'existe ; attente explicite de l'instance ajoutée.
- **Suite matricielle `tests/matrix.spec.ts`** (13 interactions × 375/768/1440, 39 cas). Premier passage : 26/39. Les 13 échecs venaient d'hypothèses du test contraires à l'original, aucune correction de code : (a) carte chargée paresseusement sous 1024 px (Google Map de l'original idem) → aide `showMap()` qui la fait défiler dans la vue ; (b) l'original ne fait pas défiler vers la carte au clic sur une carte de la liste (aucun `scrollIntoView` dans le module 128, seuls des `scrollTo({top:0})`) → le test fait défiler lui-même avant d'attendre la popup ; (c) la région PACA n'est pas parmi les 10 plus proches de Paris sur l'accueil (algorithme de l'original) → clic sur « Auvergne-Rhône-Alpes » ; (d) souris restée au-dessus du menu rouvert (le survol rend une option active, comme sur l'original) → `mouse.move(0,0)` avant le parcours au clavier ; (e) « carte Vitale » présent dans la description ET la FAQ → assertion sur `aria-expanded` et le texte propre à la réponse. Deuxième et troisième passages : 39/39.

### Itération 3 (captures de référence refaites avec `layout.json`, comparaison élément par élément `tools/compare-layout.mjs`)
- Écart de style réel : `h2` « Foire Aux Questions » en `line-height: normal` alors que l'original calcule 60 px (hérité de `html`, 1,5 × 40 px) aux 3 largeurs → jeton `faq-title` corrigé (provenance : `docs/research/pages/fiche/computed-*.json`). Il décalait toute la FAQ de 6 px (12 px à 375 px, titre sur 2 lignes).
- Écart de données : sur Nice, l'original liste Alpes-de-Haute-Provence, Hautes-Alpes, Drôme, Gard et Isère parmi les départements à proximité ; l'échantillon n'en avait aucun (grille réordonnée, « Alpes-de-Haute-Provence » sur 2 lignes rehausse la 1ʳᵉ rangée de 12 px). Ajout d'un point réel par département (58 points, ≤ 60) et de ses compléments (`/api/pharmacies/<code>` et `/api/can-reserve/<id>`, 10 requêtes espacées de 3 s).
- Outil corrigé : `tools/diff.mjs` ne recopiait pas la bande de l'ancre (lignes du masque « carte ») dans le clone réaligné → la liste à gauche de la carte était comparée à du blanc (results-1440 à 4,21 %). La bande est désormais recopiée ; le rapport liste aussi les 5 bandes de 100 px les plus différentes (`hotspots`).
- `tools/compare-layout.mjs` : éléments situés dans une zone masquée exclus, et l'écart de hauteur d'une grille masquée retranché des éléments situés dessous (vérifié : les écarts résiduels de 24/52/56 px du pied de page à 375 px sont exactement les écarts de hauteur des grilles de zones, dus aux données).
- Métadonnées : `meta description` des pages ville (« Trouvez une cabine de téléconsultation à Nice. Consultez un médecin rapidement. ») et fiche (« Consultez un médecin en téléconsultation à <nom>, <adresse>, <cp> <ville>. ») alignées sur l'original (relevées dans `docs/reference/capture-meta.json`), assertions e2e ajoutées.
- Inspection région par région (points chauds) : titres serif (formes de glyphes de la police de substitution, mêmes tailles/positions/retours à la ligne), noms de pharmacie en gras (±2 % de largeur), carte « à proximité » identique au pixel près (distance soulignée, statut, boutons), mention d'urgence identique (seule l'imbrication `<i><b>` diffère dans le DOM), horaires rendus en `<table>` (`th`/`td`) au lieu de `span` : choix sémantique, rendu identique.

### Masques utilisés par le diff (enregistrés dans `capture-meta.json`, peints en gris sur les deux côtés)
| Masque | Gabarits | Raison |
|---|---|---|
| `carte` — conteneur de la carte | accueil, résultats, fiche | Tuiles Google Maps (clé API propriétaire) ≠ tuiles Esri/OSM du clone ; marqueurs et clusters vérifiés par e2e |
| `grille-zones` × 2 — cartes « départements / régions à proximité » | accueil, résultats, fiche | Libellés et nombres de dispositifs issus des données (échantillon de 58 points au lieu d'environ 1 400) ; la structure de la grille reste comparée hors masque (titres, paragraphes, cadre) |

### Ratios de diff (pixels différents hors masques, pixelmatch seuil 0,1)
| Capture | Itération 1 | Itération 2 | Itération 3 |
|---|---|---|---|
| home-375 | 8,27 % | 7,63 % | 0,80 % |
| home-768 | 1,88 % | 2,01 % | 0,73 % |
| home-1440 | 2,76 % | 2,87 % | 0,68 % |
| results-375 | 8,38 % | 7,74 % | 1,07 % |
| results-768 | 5,10 % | 4,23 % | 0,91 % |
| results-1440 | 5,18 % | 5,26 % | 0,92 % |
| fiche-375 | 7,16 % | 6,96 % | 0,68 % |
| fiche-768 | 6,06 % | 3,85 % | 0,57 % |
| fiche-1440 | 3,48 % | 3,48 % | 0,44 % |

Les itérations 1 et 2 comparaient les pixels sans réalignement : une grille de zones plus courte décalait toute la suite de la page. L'itération 3 réaligne les segments entre masques appariés et intègre les corrections (serif recalibré, interligne de la FAQ, départements de l'échantillon, métadonnées).
Mise en page élément par élément (itération 3, `docs/qa/layout-report.json`) : 98 à 100 % des éléments textuels appariés à ±2 px. Tous les écarts restants sont horizontaux (≤ 8 px, largeur du texte serif qui précède sur la même ligne), sauf un de 24 px (« PHARMACIE DE FAMAJOR » en capitales grasses). Aucun écart de style (taille, graisse, interligne, couleur, fond, interlettrage).

## Phase 5 — Livraison
- Dépôt `Herrifunix/tessan-teleconsultation-clone` (public) : branche de travail poussée, puis `main` en fast-forward (`git merge-base --is-ancestor origin/main HEAD` vérifié avant `git push origin HEAD:main`).
- Vercel : `vercel whoami` → herrifunix ; `vercel project ls` avant déploiement : seuls `portfolio` et `wuwa-calculator` existaient, donc aucun conflit de nom. Nouveau projet `tessan-teleconsultation-clone` créé, les autres non touchés. `.vercelignore` n'envoie que ce que le build utilise (ni captures, ni pages, ni code de l'original). 1ʳᵉ tentative : « fetch failed » réseau après l'envoi, relancée avec succès.
- `curl -sSI` : 200 sur `/`, `/fr/france-FR/nice/results`, la fiche et `robots.txt`, avec `x-robots-tag: noindex, nofollow` (`docs/qa/curl-public.txt`).
- e2e contre l'URL publique : 120 passed (`docs/qa/e2e-public.txt`). Captures du site déployé à 375 et 1440 px : `docs/qa/deployed/`, hauteurs identiques au build local.
- `npm run verify` : exit 0 en 3 min 18 s (`docs/qa/verify.txt`).

## Évaluation indépendante n° 1
### Évaluateur visuel (contexte neuf, lecture seule)
Notes : mise en page accueil/résultats/fiche à 375/768/1440 = 5 ; couleurs 5 ; typographie 5 ; espacements 5 ; **détails de composants 3** ; **états interactifs 3**. Aucune note de 1.
Traitement de chaque point relevé :
1. **Ombres md/xl/2xl absentes** (jetons à `null`) — *corrigé* : `utility()` de `tools/build-tokens.mjs` ne lisait que la 1ʳᵉ règle `.shadow-md{box-shadow:…}` alors que Tailwind 4 définit `--tw-shadow` dans une seconde règle ; les règles sont désormais fusionnées, et le build échoue si une ombre manque. Valeurs issues du CSS de l'original (`docs/research/css/323d88a92ac6be07.css`). Rétablit l'ombre au survol des cartes, de la photo de fiche, des cadres de carte, de la popup et de la modale.
2. **`<p>` affichés en texte dans les préférences cookies** — *corrigé* (balises retirées à l'affichage, sans injection de HTML).
3. **Tuiles au zoom rue plus texturées que Google** — *justifié* : substitution imposée (Google exige une clé). Couleur moyenne mesurée sur la zone de carte de la popup : original 228/231/225, clone 225/227/222 (écart ≤ 4 niveaux). L'écart porte sur la texture (relief, bâti), pas sur la teinte. Les fonds sans clé comparés au zoom 16 sur Nice (Topo, Street, Light Gray, OSM) sont soit plus colorés, soit sans eau bleue ; Topo reste le plus proche au zoom France.
4. **Densité de la carte d'accueil** — *justifié* : échantillon de 58 points imposé par le sujet (40–60).
5. **Serif légèrement plus appuyée** — *justifié* : police de substitution (licence) ; largeurs, positions et retours à la ligne identiques. Un amincissement exigerait de recalibrer sans gain mesurable sur les critères.
6. **Retour à la ligne de la dernière ligne de la bannière cookies** — *corrigé* : `&nbsp;&nbsp;` de l'original rétabli entre « notre » et le lien (l'un des deux était une espace sécable).
7. **Interrupteurs inactifs cerclés** — *corrigé* : contour supprimé (l'original n'affiche que la pastille sur le fond `#F7F7ED`).
8. **Catégories décalées de 7 px** — *corrigé* : le chevron est positionné en absolu comme `.cky-chevron-right::before` (1 px d'écart résiduel).
9. **Attribution de carte sur 2 lignes à 375 px** — *corrigé* : texte raccourci en conservant tous les crédits (Esri, HERE, Garmin, USGS, OSM).
10. **Repli sans empattement si la police échoue** — *justifié* : identique à l'original (`recoleta, "recoleta Fallback", sans-serif`) ; observé une fois lors d'un échec réseau de l'environnement de l'évaluateur.

### Évaluateur fonctionnel et responsive (contexte neuf, lecture seule, contre l'URL publique)
Notes : géolocalisation 5, horaires/statut 5, responsive 5 ; navigation 3, recherche 3, carte 3, réservation 3, cookies 3, accessibilité 3, robustesse 3. Aucune note de 1.
Traitement (tests de non-régression : `tests/evaluation.spec.ts`, 14 cas) :
1. **Modale de réservation : focus volé toutes les 60 s** (effet dépendant d'un `onClose` recréé à chaque minute) — *corrigé* : hook `src/lib/useModalFocus.ts` monté une seule fois (focus initial, Échap via une ref).
2. **Exception `_leaflet_pos` au clic sur un marqueur de l'accueil** — *corrigé* : cause mesurée par la pile d'appels (`_onZoomTransitionEnd` programmé par un `setTimeout` non annulable de Leaflet après `map.remove()`) ; au démontage : `stop()`, `off()`, `_animatingZoom = false`. 0 exception sur 4 essais (3/3 avant), assertion ajoutée dans `tests/map.spec.ts`.
3. **Marqueurs et clusters inutilisables au clavier, focus perdu au déplacement** — *corrigé* : Entrée/Espace déclenchent le clic ; le focus est rendu au même marqueur après chaque recalcul des clusters.
4. **Changement de spécialité après une recherche sans relance** — *corrigé* : l'indicateur « recherche déjà faite » suit la navigation (l'original garde la même instance de formulaire).
5. **Saisie réduite à des espaces** — *corrigé* (saisie normalisée par `trim`, retour à l'accueil).
6. **Entrée sans sélection soumettait le texte brut** — *corrigé* selon la spec (§ 4.2) : 1ʳᵉ suggestion si elle existe, sinon texte brut ; un code postal saisi (5 chiffres) filtre les résultats ; une position déjà connue (géolocalisation) est conservée.
7. **Modale de réservation sans piège ni retour du focus** — *corrigé* (même hook).
8. **Bannière cookies en fin d'ordre de tabulation ; préférences sans piège ni retour** — *corrigé* : composant rendu en premier dans le DOM comme `.cky-consent-container` ; focus piégé et rendu au bouton « Choix de consentement ».
9. **Fiche → département voisin affiché en bas de page** — *corrigé* (retour en haut, comme `router.push`).
10. **URL mal encodée → page blanche** — *corrigé* (`decodeURIComponent` protégé). Vercel sert l'application pour cette URL ; `vite preview` répond 404, le test y arrive donc par navigation côté client.
11. **Code postal sans repli local si le géocodeur tombe** — *corrigé*.
12. **Rechargement après une recherche : anciens résultats conservés** — *corrigé* : comme l'original, qui supprime ses clés sessionStorage après lecture, un état de recherche déjà lu est ignoré au chargement suivant, et la vue est recalculée depuis l'URL. La détection par `performance` était faussée par l'horloge simulée des tests ; elle a été remplacée par un registre en sessionStorage.
13. **Anneaux de focus pâles** — *corrigé* : contour vert 2 px hors couche CSS, prioritaire sur les `outline-none` hérités de shadcn/ui ; visible seulement à la navigation au clavier.
14. **Focus perdu après une navigation** — *corrigé* : focus sur le `h1` de la nouvelle page.
15. **Défilement doux malgré `prefers-reduced-motion`** — *corrigé* (`src/lib/scroll.ts`).
16. **Libellé plein écran figé** — *corrigé* (« Quitter le plein écran » en plein écran).
17. **Inversion de lettres non tolérée** — *corrigé* : distance de Damerau restreinte (« Parsi » → Paris).
18. **En-tête à 320 px : « Compte patient » sur 2 lignes** — *justifié* : mêmes classes que l'original (`docs/research/components/header.md`), sans débordement horizontal.
- **Test adapté (contredisait l'original)** : `a11y-responsive.spec.ts` « navigation au clavier » supposait que le logo recevait la 1ʳᵉ tabulation. Dans l'original, `button.cky-btn-revisit` puis `.cky-consent-container` sont les premiers enfants de `<body>` (`docs/research/pages/home/outline.txt`) : après consentement, la 1ʳᵉ tabulation va au bouton « Choix de consentement », puis au logo. Le test suit désormais cet ordre ; celui de la bannière est testé dans `evaluation.spec.ts`.

## Évaluation indépendante n° 2 (relance après corrections)
### Évaluateur visuel
Notes : mise en page 5 partout (3 gabarits × 3 largeurs) ; typographie 5 ; espacements 5 ; **couleurs 3**, **détails de composants 3**, **états interactifs 3** (« proche de 5 »). Aucune note de 1.
1. **Palette des tuiles au zoom France** (mer et terre pâles au lieu du cyan et du vert d'eau de Google, libellés en anglais) — *justifié et documenté* (docs/DECISIONS.md, README § Écarts) : couleurs mesurées de part et d'autre. Un filtre de couleur calibré a été écarté (pentes de 2,5 à 4,3 par canal, qui dégraderaient routes, libellés et texture) et aucun fond sans clé n'offre cette palette avec des libellés en français. L'affirmation « le plus proche aux zooms de travail » a été corrigée : elle ne vaut qu'aux zooms ville.
2. **`rounded` à 10 px au lieu de 4 px** (« Compte patient », « Nous contacter ») — *corrigé* : Tailwind 4 résout `rounded` sur `--radius`, qui portait la valeur shadcn (.625rem). `--radius` vaut maintenant .25rem (`.rounded` de l'original) ; `rounded-lg`/`rounded-md` gardent la valeur shadcn en littéral. Vérifié au pixel sur le bouton « Compte patient ». `compare-layout` compare désormais aussi `boxShadow` (0 écart sur les 9 captures) ; le rayon n'est pas dans les dumps de référence, et une nouvelle capture de l'original a été évitée.
3. **Anneaux de focus différents de l'original à la souris** — *corrigé* : le contour renforcé ne s'affiche qu'en navigation au clavier (`html[data-kbd]`, posé par `src/main.tsx` sur Tab/flèches/Entrée/Espace et retiré au pointeur). À la souris, les anneaux d'origine réapparaissent (gris 1 px sur le champ, bleu 2 px sur le bouton des spécialités, qui garde désormais le focus quand le menu est ouvert à la souris ; ouvert au clavier, le focus passe dans la liste).
4. **Icône de la commande caméra** (triangles pleins au lieu de chevrons) — *corrigé* : chevrons tracés comme ceux de Google.
5. **Nom de la fiche en 30 px gras 4,6 % plus large** — *justifié* : la face 700 est calibrée à 20 px (noms des cartes, 1 % d'écart), et une seule valeur de `size-adjust` par face est possible ; le titre tient sur une ligne comme dans l'original.
6. **Ordre des suggestions et grilles à proximité** — *justifié* (données de l'échantillon ; l'original utilise Google Places).
- **Instabilités de tests traitées à la racine** : (a) le focus du titre après navigation échouait sous charge, car la fiche affiche d'abord un `<h1>Chargement...</h1>` provisoire qui recevait le focus avant d'être remplacé ; ce titre porte désormais `data-loading` et est ignoré, avec une attente par observateur du DOM (8/8 en parallèle). (b) Le clic sur le 1er cluster à 375 px était parfois perdu : ce cluster pouvait se trouver dans la marge de rendu hors cadre (`pad(0.5)`), et le faire défiler dans la vue décalait le conteneur de la carte. Le test clique maintenant le premier cluster réellement visible (30/30 en répétition). Suite complète : 134/134 deux fois de suite.

### Évaluateur fonctionnel et responsive (relance)
Notes : navigation 5, géolocalisation 5, carte 5, réservation 5, horaires 5, responsive 5, robustesse 5 ; **recherche 3**, **cookies 3**, **accessibilité 3**. Aucune note de 1. Toutes les corrections de l'évaluation n° 1 revérifiées et confirmées par l'évaluateur.
Traitement (tests de non-régression : 7 cas ajoutés à `tests/evaluation.spec.ts`) :
1. **Nom de département ou de région + Entrée après l'arrivée des suggestions → commune homonyme** (« Var » → Vares) — *corrigé* : pas de sélection automatique pour un nom de zone, qui est traité comme la zone entière (spec § 4.5). Ailleurs, la 1ʳᵉ suggestion n'est retenue que si elle correspond vraiment à la saisie.
2. **Code postal d'une géolocalisation conservé pour une nouvelle ville** — *corrigé* : toute saisie l'annule.
3. **Texte brut géocodé sur un lieu-dit** (« St-Etienne ») — *corrigé* : recherche de commune d'abord (`type=municipality`), puis recherche libre.
4. **Préférences cookies fermées avant tout choix : focus perdu** — *corrigé* : focus rendu à « Personnaliser ».
5. **Bascules non enregistrées conservées après annulation** — *corrigé* : chaque ouverture repart des choix enregistrés.
6. **Focus perdu aux changements d'étape de la modale et sur « Afficher plus/moins »** — *corrigé* : focus sur le champ ou le titre de la nouvelle étape, et passage entre les deux boutons.
7. **Focus perdu à la fermeture d'une fiche de carte et après un zoom de cluster au clavier** — *corrigé* : retour au marqueur, puis au conteneur de la carte (focalisable, déplacement aux flèches).
8. **Statut mis à jour jusqu'à 60 s en retard** — *corrigé* : rafraîchissement calé sur le début de chaque minute (test à 19:29:20 + 45 s).
9. **Popup de carte rognée sur mobile** — *justifié* : identique à l'original (spec `map.md` § 7) ; aucun débordement horizontal de page.
10. **« Me géolocaliser » perd le focus pendant la recherche** — *corrigé* (`aria-disabled` au lieu de `disabled`).
11. **Créneau déjà commencé encore confirmable** — *justifié* : l'original n'a pas non plus de contrôle côté client ; le clone n'envoie de toute façon rien.
12. **Apostrophe typographique dans une alerte** — *corrigé* (apostrophe droite, comme la spec § 5).
- **Rejeu public après la relance** : 140/141. L'échec (zoom 200 %, `h1` introuvable alors que le pied de page était là) ne s'est pas reproduit en 5 répétitions ; la trace a été écrasée par le rejeu. Cause la plus probable, observée aussi par les deux évaluateurs dans cet environnement : un 5xx transitoire du proxy sur le fichier de données, qui affiche l'écran « données indisponibles » (sans `h1`). Une capture du site déployé a de même perdu le logo une fois. Plutôt que de conclure à une instabilité, le chargement des données réessaie désormais deux fois (0,5 s puis 1 s) sur erreur réseau ou 5xx, sans réessayer sur 4xx. Test : `evaluation.spec.ts` « une erreur 502 transitoire… est rattrapée ».

## Clôture
- `npm run verify` final : exit 0, 142 passed, ratios hors masques de 0,43 à 1,06 % (`docs/qa/verify.txt`). e2e contre l'URL publique : 142 passed (`docs/qa/e2e-public.txt`). curl : 200 sur la racine, `/fr/france-FR/nice/results`, la fiche et `robots.txt` (`docs/qa/curl-public.txt`).
- Nettoyage : `test-results/` et `dist/` supprimés (régénérables) ; `tools/.q.mjs`, un script de débogage commité par erreur dans `1c25832`, retiré par un nouveau commit (sans réécriture d'historique) ; pilote de reconnaissance et `vite preview` arrêtés. Conservés hors git : `.vercel/` (lien du projet, nécessaire pour redéployer), ainsi que le code et les réponses brutes de l'original (`docs/research/js/`, `docs/research/pages/home/bodies/`), non publiés.
- Checklist : seule l'exigence de processus P3-01 (un commit par composant) reste en échec, et DOD-08 (done-check vert) en découle.
