# Récapitulatif final

- **Site** : https://tessan-teleconsultation-clone.vercel.app (Vercel, production, non indexé)
- **Dépôt** : https://github.com/Herrifunix/tessan-teleconsultation-clone (public, branche `main`)

## Extraits réels

`npm run verify` (`docs/qa/verify.txt`) : exit 0
```
> npm run lint && npm run typecheck && npm run build && npm run test:e2e && npm run capture:clone && npm run diff
✓ built in 3.58s
  142 passed (1.2m)
home-1440    diff 0.68 % hors masques · home-375 0.79 % · home-768 0.73 %
results-375  diff 1.06 % · results-768 0.91 % · results-1440 0.92 %
fiche-375    diff 0.67 % · fiche-768 0.57 % · fiche-1440 0.43 %
```

e2e contre l'URL publique (`docs/qa/e2e-public.txt`) :
```
PLAYWRIGHT_BASE_URL=https://tessan-teleconsultation-clone.vercel.app npx playwright test
  142 passed (1.5m)
```

`curl -sSI` (`docs/qa/curl-public.txt`) : `HTTP/2 200` sur `/`, `/fr/france-FR/nice/results`, la fiche et `robots.txt`, avec `x-robots-tag: noindex, nofollow`.

`npm run done-check` (`docs/qa/done-check.txt`) :
```
✗ P3-01 — statut "fail"
✗ DOD-08 — statut "fail"
Checklist : 158 pass / 2 fail (total 160)
```

## Écarts restants et raisons
- **P3-01 / DOD-08** : les composants ont été livrés dans un seul commit au lieu d'un par composant. Le rattraper exigerait un force-push, interdit. `done-check` reste donc en échec sur cette exigence de processus, et DOD-08 en découle ; toutes les autres exigences sont prouvées.
- **Police serif** : Recoleta est commerciale, remplacée par Fraunces (OFL) calibrée. Encombrement et retours à la ligne identiques ; forme des lettres différente, +4,6 % de largeur sur le nom de la fiche en 30 px.
- **Fond de carte** : tuiles Esri sans clé au lieu de Google. Palette plus pâle au zoom France, libellés en anglais, relief au zoom rue.
- **Données** : échantillon de 58 points réels ; les compteurs par zone et la densité de la carte diffèrent de l'original.
- **Suggestions** : villes de l'échantillon + API Adresse au lieu de Google Places.
- **Réservation** : sans envoi (démonstration).
- **Pied de page** : mention de non-affiliation ajoutée, ce qui ajoute 16 à 40 px en bas de page.
