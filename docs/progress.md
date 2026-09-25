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
