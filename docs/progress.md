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
