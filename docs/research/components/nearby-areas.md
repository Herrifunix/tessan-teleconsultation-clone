# Composant — Zones à proximité (départements / régions)

> Deux cartes blanches en bas de l'accueil et des pages résultats : « Les dispositifs de téléconsultation Tessan dans les départements à proximité » et « … dans les régions à proximité », chacune avec une grille de 10 boutons.
> Composant `d` du module 2128 (`docs/research/js/pretty/128-230074a16c9361a5.js` l. 14-252). Une variante existe sur la fiche (§7).

## Sources abrégées

| Alias | Fichier |
|---|---|
| `NA` | `docs/research/js/pretty/128-230074a16c9361a5.js` l. 14-252 (composant), l. 489-521 (callback `onCityClick` = fonction `T`), l. 436-488 (fonction `R` de navigation) |
| `GEO` | `docs/research/js/pretty/990-ede1d18ec8eaf918.js` module 45 (l. 5-224 : `rc` départements→région, `UY` départements→nom, `aZ` code département, `hl` nom département, `pG` région) ; module 4173 (l. 513-892 : chargement des dispositifs) ; module 1506 (slug/URL) |
| `H375` / `H768` / `H1440` | `docs/research/pages/home/computed-{375,768,1440}.json` — préfixe `div:20>main:0>div:2` noté `Z` |
| `R1440` | `docs/research/pages/results/computed-1440.json` — préfixe `div:17>main:0>div:2` |
| `HOV` | `docs/research/hover-states.json` clé `dept-card` |
| `CSS` | `docs/research/css/323d88a92ac6be07.css` |
| `DOM` | `docs/research/pages/home/dom.html` |
| `FICHE` | `docs/research/js/pretty/541-add46bd6cf5ba31f.js` l. 437-503 (calcul), l. 1105-1245 (rendu) |
| Captures | `docs/reference/home-{375,768,1440}.png`, `docs/reference/states/hover-dept-card-{before,after}-1440.png` |

---

## 1. Structure DOM (classes exactes, `NA` + `DOM`)

### 1.1 État chargé

```html
<div class="bg-slate-50 p-6 pb-12">
  <div class="max-w-[1328px] mx-auto">

    <!-- Carte 1 : rendue seulement si la liste des départements est non vide -->
    <div class="mb-8">
      <div class="bg-white rounded-lg shadow-lg p-8">
        <h2 class="text-2xl text-gray-800 mb-6"
            style="font-family: Recoleta, recoleta, &quot;recoleta Fallback&quot;, sans-serif;">Les dispositifs de téléconsultation Tessan dans les départements à proximité</h2>
        <p class="text-gray-600 mb-6">Explorez les dispositifs disponibles dans les 10 départements les plus proches</p>
        <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          <button class="bg-slate-50 hover:bg-tessan-green hover:text-white transition-colors rounded-lg p-4 text-center group cursor-pointer">
            <p class="font-semibold text-gray-800 group-hover:text-white mb-1">Val-de-Marne</p>
            <p class="text-sm text-gray-500 group-hover:text-white">15 dispositifs</p>
          </button>
          … (≤ 10 boutons)
        </div>
      </div>
    </div>

    <!-- Carte 2 : rendue seulement si la liste des régions est non vide (div wrapper SANS classe) -->
    <div>
      <div class="bg-white rounded-lg shadow-lg p-8">
        <h2 class="text-2xl text-gray-800 mb-6" style="font-family: Recoleta, recoleta, &quot;recoleta Fallback&quot;, sans-serif;">Les dispositifs de téléconsultation Tessan dans les régions à proximité</h2>
        <p class="text-gray-600 mb-6">Explorez les dispositifs disponibles dans les 10 régions les plus proches</p>
        <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4"> … </div>
      </div>
    </div>
  </div>
</div>
```

- Les boutons n'ont pas de `type` explicite (hors formulaire → aucun effet), clé React = code département / nom de région.
- Le compteur est rendu à partir de 3 nœuds texte `{n}`, `" "`, `"dispositifs"` → texte final `15 dispositifs` (une seule espace ; les dumps `computed-*.json` affichent deux espaces à cause de la concaténation des nœuds — `DOM` confirme une seule espace).
- Le `h2` porte un `style` inline Recoleta (police de titre ; même famille que la règle de base `h1…h6`).

### 1.2 État de chargement (pendant le calcul, `NA` l. 96-117)

```html
<div class="bg-slate-50 p-6 pb-12">
  <div class="max-w-[1328px] mx-auto">
    <div class="bg-white p-6 md:p-8 rounded-lg shadow-lg">
      <div class="text-center py-8">
        <div class="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-tessan-green border-r-transparent"></div>
        <p class="mt-4 text-gray-600">Chargement...</p>
      </div>
    </div>
  </div>
</div>
```
Spinner : cercle 32 × 32, bordure 4 px `#0f352d` avec côté droit transparent, rotation `spin 1s linear infinite` (`CSS .animate-spin`, `TOK animation.spin`). Texte 16px/24px gray-600, `margin-top:16px`. Non capturé à l'écran (état transitoire) : dimensions déduites des classes.

---

## 2. Valeurs CSS résolues (état chargé)

| Élément | Propriété | 375 | 768 | 1440 | Source |
|---|---|---|---|---|---|
| section | fond / padding | slate-50 `oklch(0.984 0.003 247.858)` (≈ `#f8fafc`) / 24 24 **48** 24 | idem | idem | `H* Z` backgroundColor, padding* |
| section | y / hauteur (accueil) | 1569 / 1976 | 1503.4 / 1288 | 1205 / 816 | `H* Z` rect |
| conteneur | largeur | 327 | 720 | 1328 (max) | `H* Z>div:0` |
| carte dépts wrapper | margin-bottom | 32 | 32 | 32 | `H* Z>div:0>div:0` marginBottom |
| carte | fond / radius / ombre | blanc / 10 px / `0 10px 15px -3px rgba(0,0,0,.1), 0 4px 6px -4px rgba(0,0,0,.1)` | idem | idem | `H* Z>div:0>div:0>div:0` |
| carte | padding | **32** (fixe, `p-8`) | 32 | 32 | idem |
| carte dépts | hauteur | 896 | 568 | 344 | idem rect.h |
| carte régions | hauteur | 976 | 616 | 368 | `H* Z>div:0>div:1>div:0` rect.h |
| h2 | police | Recoleta 24px / 32px, 400, gray-800 `oklch(0.278 0.033 256.848)` (≈ `#1e2939`) | idem | idem | `H* Z>div:0>div:0>div:0>h2:0` |
| h2 | lignes / margin-bottom | 4 lignes (128 px) / 24 | 2 lignes (64) / 24 | 1 ligne (32) / 24 | idem rect.h, marginBottom |
| p intro | police | Plus Jakarta Sans 16px / 24px, 400, gray-600 `oklch(0.446 0.03 256.802)` (≈ `#4a5565`) | idem | idem | `…>p:1` |
| p intro | hauteur / margin-bottom | 72 (dépts, 3 lignes) · 48 (régions) / 24 | 24 / 24 | 24 / 24 | idem |
| grille | colonnes | `123.5px 123.5px` (2) | `208px 208px 208px` (3, ≥ 768) | `240px ×5` (5, ≥ 1024) | `…>div:2` gridTemplateColumns |
| grille | gap | 16 | 16 | 16 | idem gap |
| grille | hauteur dépts / régions | 584 / 688 | 368 / 416 | 176 / 200 | `H* Z>div:0>div:*>div:0>div:2` rect.h |
| bouton | fond / radius / padding | slate-50 / 10 px / 16 px | idem | idem | `…>div:2>button:0` |
| bouton | alignement texte | center | idem | idem | idem textAlign |
| bouton | hauteur type | 104 (nom sur 2 lignes) ; 124 si compteur replié | 80 (1 ligne) | 80 ; 104 si nom sur 2 lignes (« Bourgogne-Franche-Comté ») | idem rect.h ; capture `home-1440.png` |
| nom (p:0) | police | 16px / 24px, **600**, gray-800 ; margin-bottom 4 | idem | idem | `…>button:0>p:0` |
| compteur (p:1) | police | 14px / 20px, 400, gray-500 `oklch(0.551 0.027 264.364)` (≈ `#6a7282`) | idem | idem | `…>button:0>p:1` |

Hauteur d'un bouton = 16 + 24 × (lignes du nom) + 4 + 20 × (lignes du compteur) + 16. Les lignes d'une même rangée de grille s'alignent sur le bouton le plus haut (`align-items: normal` → stretch).

---

## 3. États

| Élément | État | Valeur | Source |
|---|---|---|---|
| bouton | repos | fond `oklch(0.984 0.003 247.858)`, nom gray-800, compteur gray-500 | `HOV dept-card.before` |
| bouton | :hover | fond `rgb(15,53,45)` `#0f352d` ; nom et compteur **blancs** (`group-hover:text-white`) | `HOV dept-card.after` ; capture `hover-dept-card-after-1440.png` |
| bouton | transition | seul le fond est animé (`transition-colors` 0.15s `cubic-bezier(.4,0,.2,1)` sur le bouton) ; la couleur des `p` change **instantanément** (pas de transition sur les `p`) | classes `NA` |
| bouton | :focus / :active | aucun style spécifique | — |

`hover:` et `group-hover:` sont compilés sous `@media (hover:hover)` (`CSS`).

---

## 4. Algorithme (`NA` l. 18-94)

Entrées : `searchCoords` (coordonnées de la recherche courante, ou `null`), `isHomepage` (booléen).

1. Afficher l'état de chargement.
2. Charger **tous** les dispositifs actifs (table `gmb_locations`, `actif_inactif = 'Actif'`, triés par `nom_etablissement` croissant, `GEO` module 4173 fonction `l`).
3. Origine : si `searchCoords` non nul **et** `isHomepage` faux → `searchCoords` ; sinon **Paris (48.8566, 2.3522)**. → Sur l'accueil l'origine est toujours Paris.
4. Départements : pour chaque dispositif dont le code département `aZ(codePostal)` est non vide (code postal ≥ 2 caractères ; `20x` → `2A` si x ∈ {0,1} sinon `2B`, sinon 2 premiers caractères) : distance haversine (rayon 6371 km) entre l'origine et `(latitude, longitude)` du dispositif (valeurs nulles → 0) ; regrouper par code département : `count` et moyenne des distances.
   Nom affiché = `hl(code + "000")` = nom de la table `UY` (repli : le code, ex. `97` pour l'outre-mer).
5. Trier par **distance moyenne croissante**, garder les **10 premiers**.
6. Régions : même calcul en regroupant par `pG(codePostal)` (région de la table `rc` ; codes sans région — outre-mer — ignorés). Top 10 par distance moyenne.
7. Fin du chargement. Recalcul (avec retour à l'état de chargement) à chaque changement de `searchCoords` ou `isHomepage`.

Particularités fidèles à reproduire :
- Le classement utilise la **moyenne** des distances, pas le dispositif le plus proche.
- Un point aberrant fait chuter un département : dans les données réelles, un dispositif de Paris (code magasin `662`, CP `75014`) a une latitude de `8.82938268` (≈ 4 451 km de Paris) ; la moyenne des 23 dispositifs parisiens vaut ≈ 196.6 km → **Paris (75) est 24e et n'apparaît pas** dans la liste de l'accueil. Reproduction exacte faite sur l'export complet (1 807 lignes, fichier de travail non versionné `/tmp/claude-0/data/all.json` utilisé par `tools/data/build-data.py`).
- Les dispositifs US (ex. Brooklyn, ZIP `11209`) sont rattachés au département « 11 » (Aude/Occitanie) par le préfixe du code postal.
- Le texte d'introduction utilise la longueur réelle de la liste (`… dans les {n} départements les plus proches`), toujours au pluriel.
- `dispositif` au singulier si `count` = 1, sinon `dispositifs`.

### 4.1 Résultat attendu sur l'accueil (origine Paris, données réelles)

Mesuré (`H1440 Z…>button:*>p:*`, identique à 375/768) et reproduit par calcul :

| # | Département | Nb | dist. moy. (km) | | # | Région | Nb | dist. moy. (km) |
|---|---|---|---|---|---|---|---|---|
| 1 | Val-de-Marne | 15 | 9.4 | | 1 | Île-de-France | 211 | 43.7 |
| 2 | Hauts-de-Seine | 21 | 9.6 | | 2 | Hauts-de-France | 220 | 168.4 |
| 3 | Seine-Saint-Denis | 28 | 10.7 | | 3 | Normandie | 118 | 169.3 |
| 4 | Val-d'Oise | 37 | 23.2 | | 4 | Centre-Val de Loire | 66 | 240.1 |
| 5 | Yvelines | 23 | 28.9 | | 5 | Bourgogne-Franche-Comté | 102 | 273.5 |
| 6 | Essonne | 20 | 30.1 | | 6 | Pays de la Loire | 97 | 274.9 |
| 7 | Seine-et-Marne | 44 | 43.8 | | 7 | Grand Est | 169 | 291.5 |
| 8 | Oise | 25 | 65.0 | | 8 | Bretagne | 92 | 393.4 |
| 9 | Eure-et-Loir | 9 | 71.6 | | 9 | Auvergne-Rhône-Alpes | 195 | 413.0 |
| 10 | Eure | 18 | 102.5 | | 10 | Nouvelle-Aquitaine | 183 | 435.5 |

### 4.2 Exemple page résultats (origine = coordonnées de la recherche « Nice », `R1440`)

Départements : Alpes-Maritimes 15 · Var 47 · Alpes-de-Haute-Provence 10 · Hautes-Alpes 6 · Bouches-du-Rhône 39 · Vaucluse 27 · Haute-Corse 8 · Drôme 26 · Gard 33 · Isère 31.
Régions : Provence-Alpes-Côte d'Azur 144 · Corse 11 · Auvergne-Rhône-Alpes 195 · Bourgogne-Franche-Comté 102 · Occitanie 198 · Grand Est 169 · Nouvelle-Aquitaine 183 · Centre-Val de Loire 66 · Île-de-France 211 · Pays de la Loire 97.

> ⚠️ Données du clone : l'échantillon `src/data/locations.json` (53 lignes) donne un tout autre résultat (Paris 7 en tête, puis 93 : 1, 94 : 4…). Pour une fidélité visuelle, le clone doit soit calculer sur un jeu couvrant les 1 807 dispositifs (au minimum `latitude`, `longitude`, `code_postal`), soit embarquer les agrégats. Décision à consigner dans `docs/DECISIONS.md`.

---

## 5. Comportement au clic (`onCityClick` = `T`, `NA` l. 489-521)

Argument : le **nom** affiché (nom de département ou de région).

1. Charger tous les dispositifs.
2. Si le nom est une région (`rc`) → dispositifs de cette région ; si c'est un département (`UY`) → dispositifs de ce département ; sinon → dispositifs dont `ville` contient le texte (ILIKE).
3. Si ≥ 1 résultat : origine = coordonnées du **premier** (ordre alphabétique de `nom_etablissement`), tri par distance à cette origine, règle « minimum de résultats » (si ≤ 3, compléter avec jusqu'à 5 plus proches), puis `R(résultats, nom, undefined, origine)` :
   - région → fil `[{région}]` → `router.push("/<slug région>")` (ex. `/ile-de-france`) ;
   - département → fil `[{région du 1er résultat}, {département}]` → `router.push("/<slug région>/<slug département>")` (ex. `/ile-de-france/val-de-marne`) ;
   - résultats + requête + coordonnées stockés dans `sessionStorage` (`searchResults`, `searchQuery`, `searchCoords`, `searchSpecialisation=""`, `navigationFromSearch="true"`) pour la page de destination ;
   - puis `window.scrollTo({ top: 0, behavior: "smooth" })`.
4. Si 0 résultat : `alert("Aucune pharmacie trouvée pour " + nom)` (pas de ponctuation finale).
5. Erreur : `alert("Une erreur est survenue lors de la recherche. Veuillez réessayer.")`.

Aucun indicateur de chargement pendant ce traitement. La spécialité éventuellement sélectionnée dans le formulaire est ignorée.

---

## 6. Textes exacts

| Emplacement | Texte |
|---|---|
| Titre carte 1 | `Les dispositifs de téléconsultation Tessan dans les départements à proximité` |
| Intro carte 1 | `Explorez les dispositifs disponibles dans les ` + n + ` départements les plus proches` |
| Titre carte 2 | `Les dispositifs de téléconsultation Tessan dans les régions à proximité` |
| Intro carte 2 | `Explorez les dispositifs disponibles dans les ` + n + ` régions les plus proches` |
| Compteur | n + ` ` + (`dispositifs` si n > 1, sinon `dispositif`) |
| Chargement | `Chargement...` (trois points ASCII) |
| Alertes | `Aucune pharmacie trouvée pour <nom>` · `Une erreur est survenue lors de la recherche. Veuillez réessayer.` |

Noms : tables `GEO` module 45 (ex. `Val-d'Oise` avec apostrophe droite, `Île-de-France`, `Centre-Val de Loire`, `Provence-Alpes-Côte d'Azur`, `Auvergne-Rhône-Alpes`, `Bourgogne-Franche-Comté`).

---

## 7. Variante fiche (`FICHE`) — voir aussi `pharmacy-page-nearby.md`

Sur la fiche d'un dispositif (hors US) les deux cartes existent avec les **mêmes** `h2`, `p`, grilles et boutons, mais :
- wrappers `div.p-6` (chaque carte dans son propre `div.p-6`, pas de `bg-slate-50 … pb-12` ni de `mb-8`) ;
- origine = le dispositif affiché ; distances = celles de tous les autres dispositifs (arrondies à 0.1 km) ;
- **le département du dispositif est exclu** de la liste des départements (la région ne l'est pas) ;
- clic département → premier dispositif de ce département → `router.push(url([{région}, {département}]))` ; clic région → `router.push(url([{région}]))` ; ni `sessionStorage`, ni `scrollTo`, ni alerte.

## 8. Incertitudes

- Dimensions de l'état de chargement non mesurées (transitoire).
- Les distances moyennes du tableau §4.1 sont un recalcul hors navigateur (même formule) ; l'ordre et les effectifs correspondent exactement aux dumps mesurés.
