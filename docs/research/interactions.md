# Modèle d'interaction de l'original

Relevé sur https://teleconsultation.tessan.io/ (pilote Playwright `tools/recon/driver.mjs`, lecture des modules applicatifs `docs/research/js/module-index.json`).
Chaque ligne indique le déclencheur, l'état avant → après, la capture de référence, la spec détaillée et le test e2e qui vérifie le clone.
Les captures d'états sont dans `docs/reference/states/`.

| Composant | Déclencheur | Avant → après | Capture de référence | Spec | e2e du clone |
|---|---|---|---|---|---|
| En-tête : liens de navigation | survol | texte gris 700 → vert Tessan `#0f352d` (sans soulignement) ; liens vers tessan.io | `hover-nav-link-before/after-1440.png` | `components/header.md` | `navigation.spec.ts` (liens externes) |
| En-tête : « Compte patient » | survol / clic | fond `#0f352d` → `#153f3f` ; ouvre l'espace patient tessan.io | `hover-compte-patient-*-1440.png` | `components/header.md` | `navigation.spec.ts` |
| Menu mobile | — | **aucun burger** : sous 1024 px la nav est `hidden lg:flex`, seuls logo et « Compte patient » restent | `docs/reference/home-375.png` | `components/header.md` | `a11y-responsive.spec.ts` |
| Menu « Spécialités médicales » | clic, clavier (↑ ↓ Entrée Échap) | fermé → liste de 7 spécialités ; sélection = bouton plein vert + coche ; « Effacer le filtre » ; relance la recherche si une recherche a déjà eu lieu | `specialites-open-1440.png`, `hover-specialites-*-1440.png` | `components/search-form.md` | `search.spec.ts`, `matrix.spec.ts` |
| Champ ville / code postal | saisie | vide → liste de suggestions (Google Places dans l'original, villes de l'échantillon + API Adresse dans le clone) | `autocomplete-open-1440.png` | `components/search-form.md` | `search.spec.ts`, `matrix.spec.ts` |
| Bouton « Recherche » | clic / Entrée | géocodage → URL de ville, liste triée par distance (20 plus proches), défilement en haut | `hover-recherche-*-1440.png` | `components/search-form.md`, `components/results-page.md` | `search.spec.ts` |
| Géolocalisation | clic sur le viseur | demande de permission → position → 20 plus proches ; refus → `alert` « Vous avez refusé l'accès à votre position » | `geoloc-granted-1440.png` | `components/search-form.md` | `search.spec.ts`, `matrix.spec.ts` |
| Carte : clusters | clic | cluster → zoom +3 centré | `docs/reference/home-1440.png` | `components/map.md` | `map.spec.ts`, `matrix.spec.ts` |
| Carte : marqueur | clic | fenêtre d'info (nom, adresse, statut, boutons) | `marker-popup-1440.png` | `components/map.md` | `map.spec.ts`, `matrix.spec.ts` |
| Carte : « Réinitialiser », plein écran | clic / survol | vue initiale ; plein écran natif | `hover-map-reset-*-1440.png` | `components/map.md` | `map.spec.ts`, `matrix.spec.ts` |
| Synchronisation liste → carte | clic sur une carte de la liste | la carte se centre (zoom 16) et ouvre la fenêtre d'info ; pas de défilement automatique vers la carte | `hover-card-*-1440.png` | `components/pharmacy-card.md` | `results.spec.ts`, `matrix.spec.ts` |
| « Réserver un créneau » | clic | modale en 4 étapes (spécialité → créneau → e-mail → confirmation) | `booking-modal*-1440.png`, `hover-reserver-*-1440.png` | `components/booking-modal.md` | `booking.spec.ts`, `matrix.spec.ts` |
| « Voir plus » | clic | navigation vers la fiche | `hover-voir-plus-*-1440.png` | `components/pharmacy-card.md` | `results.spec.ts`, `matrix.spec.ts` |
| Départements / régions à proximité | survol / clic | carte gris clair → fond vert, texte blanc ; navigation vers la zone | `hover-dept-card-*-1440.png` | `components/nearby-areas.md` | `navigation.spec.ts`, `matrix.spec.ts` |
| Fil d'Ariane | survol / clic | souligné ; navigation (masqué sous 768 px) | `hover-breadcrumb-*-1440.png` | `components/breadcrumb.md` | `navigation.spec.ts`, `matrix.spec.ts` |
| Fiche : carrousel photo | clic sur les flèches | image n / N | `docs/reference/fiche-1440.png` | `components/pharmacy-page.md` | `fiche.spec.ts`, `matrix.spec.ts` |
| Fiche : FAQ (accordéon) | clic | question fermée → réponse dépliée, chevron tourné | `faq-open-1440.png` | `components/pharmacy-page-faq.md` | `fiche.spec.ts`, `matrix.spec.ts` |
| Bannière cookies (CookieYes) | chargement / clic | bannière → « Tout accepter » / « Tout refuser » / « Personnaliser » (préférences par catégorie) → bouton flottant de consentement | `cookie-banner-*.png`, `cookie-preferences-1440.png` | `components/cookie-consent.md` | `cookies.spec.ts`, `matrix.spec.ts` |
| Ville inconnue | URL directe | « 0 dispositif… » + zones à proximité | `unknown-city-1440.png` | `components/results-page.md` | `search.spec.ts` |
| Pied de page | survol / clic | liens vers tessan.io soulignés au survol ; « Nous contacter » `#feee80` → `#f0e060` ; icônes sociales opacité 80 % | `docs/reference/home-1440.png` | `components/footer.md` | `navigation.spec.ts` |
| Pagination | — | **aucune** : la liste affiche tous les résultats (20 au plus après recherche) | `docs/reference/results-1440.png` | `components/results-page.md` | `results.spec.ts` |
| Bascule liste / carte mobile | — | **aucune** : sous 1024 px la carte est empilée sous la liste | `docs/reference/results-375.png` | `components/results-page.md` | `matrix.spec.ts` |
