# Plan de travail

Mission : reproduire https://teleconsultation.tessan.io/ fidèlement, puis le déployer.

## Phases
1. **Reconnaissance** — accès (fr-FR, Europe/Paris, UA réel), cartographie des gabarits, prototype d'extraction sur l'accueil, captures de référence (375/768/1440 + états), CSS source de vérité → `docs/research/tokens.json`, modèle d'interaction, données (40–60 points de vente, ≥6 villes), assets, specs par composant, DECISIONS.md.
2. **Fondations** — Vite + React + TS + React Router, tokens → variables CSS, routes identiques, tests e2e écrits d'abord, `npm run verify`.
3. **Construction** — composant par composant, mobile-first, accessibilité, sécurité, performance.
4. **Vérification** — boucle capture → pixelmatch → composites → corrections (≥3 itérations), puis 2 évaluateurs indépendants.
5. **Livraison** — push main, déploiement, curl 200, e2e publics, README.

## État
- [x] Phase 1 — accès documenté, 3 gabarits × 3 viewports + 33 états capturés, 137 jetons, 17 specs, modèle d'interaction (`docs/research/interactions.md`), 58 points réels.
- [x] Phase 2 — stack figée, 142 tests e2e (dont matrice 39 cas et 22 tests de non-régression), `npm run verify`.
- [x] Phase 3 — 3 gabarits, carte, recherche, réservation, cookies ; a11y, sécurité, performance.
- [x] Phase 4 — 3 itérations de diff (0,44 à 1,07 % hors masques), 2 évaluateurs indépendants (voir `docs/progress.md`).
- [x] Phase 5 — dépôt public, Vercel, curl 200, e2e publics verts, README.

Écart de processus assumé : les composants ont été livrés dans un seul commit (`3f32b6e`) au lieu d'un commit par composant (P3-01 reste en échec, sans réécriture d'historique possible sans force-push).
