# Plan de travail

Mission : reproduire https://teleconsultation.tessan.io/ fidèlement, puis le déployer.

## Phases
1. **Reconnaissance** — accès (fr-FR, Europe/Paris, UA réel), cartographie des gabarits, prototype d'extraction sur l'accueil, captures de référence (375/768/1440 + états), CSS source de vérité → `docs/research/tokens.json`, modèle d'interaction, données (40–60 points de vente, ≥6 villes), assets, specs par composant, DECISIONS.md.
2. **Fondations** — Vite + React + TS + React Router, tokens → variables CSS, routes identiques, tests e2e écrits d'abord, `npm run verify`.
3. **Construction** — composant par composant, mobile-first, accessibilité, sécurité, performance.
4. **Vérification** — boucle capture → pixelmatch → composites → corrections (≥3 itérations), puis 2 évaluateurs indépendants.
5. **Livraison** — push main, déploiement, curl 200, e2e publics, README.

## État
- [ ] Phase 1
- [ ] Phase 2
- [ ] Phase 3
- [ ] Phase 4
- [ ] Phase 5
