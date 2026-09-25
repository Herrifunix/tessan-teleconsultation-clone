# Composant — Fil d'Ariane (`Breadcrumb` shadcn/ui)

> Présent sur la page **résultats** (et pages spécialité / région / département / ville) et sur la **fiche** d'un dispositif. **Absent** de l'accueil (y compris quand l'URL est une ville inconnue, voir `home-page.md`).
> Masqué sous 768 px (`hidden md:block`).

## Sources abrégées

| Alias | Fichier |
|---|---|
| `BC` | `docs/research/js/pretty/467-4c092da56609776e.js` module **2785** (l. 5-78) : primitives `Qp` Breadcrumb, `AB` List, `J5` Item, `w1` Link, `tJ` Page, `tH` Separator |
| `PAGE` | `docs/research/js/pretty/128-230074a16c9361a5.js` l. 663-845 (composition sur la page résultats ; `Breadcrumb` ouvert l. 666) |
| `FICHE` | `docs/research/js/pretty/541-add46bd6cf5ba31f.js` l. 560-643 (composition sur la fiche) |
| `URL` | `docs/research/js/pretty/990-ede1d18ec8eaf918.js` module 1506 (l. 438-473 : `_` slugify, `vR` construction d'URL) ; module 45 (l. 5-224 : tables départements `UY` / régions `rc`, fonctions `aZ`, `hl`, `pG`) |
| `R768` / `R1440` | `docs/research/pages/results/computed-{768,1440}.json` (URL `/fr/france-FR/nice/results`) — préfixe `div:17>main:0>section:0>div:0>nav:0` noté `N` |
| `F768` / `F1440` | `docs/research/pages/fiche/computed-{768,1440}.json` — préfixe `div:25>main:0>div:0>section:0>div:0>nav:0` |
| `HOV` | `docs/research/hover-states.json` clé `breadcrumb` |
| `CSS` | `docs/research/css/323d88a92ac6be07.css` |
| Outlines | `docs/research/pages/specialty-city/outline.txt` l. 4-25, `docs/research/pages/fiche/outline.txt` l. 5-29 |
| Captures | `docs/reference/results-1440.png` (haut de page), `docs/reference/states/hover-breadcrumb-before-1440.png` / `-after-1440.png` |

---

## 1. Structure DOM (classes exactes)

Primitives (`BC`) :

```html
<nav aria-label="breadcrumb" data-slot="breadcrumb" class="hidden md:block mb-6">
  <ol data-slot="breadcrumb-list"
      class="text-muted-foreground flex flex-wrap items-center gap-1.5 text-sm break-words sm:gap-2.5">

    <!-- élément cliquable : BreadcrumbLink asChild fusionné sur un <button> -->
    <li data-slot="breadcrumb-item" class="inline-flex items-center gap-1.5">
      <button data-slot="breadcrumb-link" class="hover:text-foreground transition-colors hover:underline cursor-pointer">Trouver un dispositif de téléconsultation</button>
    </li>

    <!-- séparateur -->
    <li data-slot="breadcrumb-separator" role="presentation" aria-hidden="true" class="[&>svg]:size-3.5">
      <svg class="lucide lucide-chevron-right" …><path d="m9 18 6-6-6-6"/></svg>
    </li>

    <!-- page courante / élément non cliquable -->
    <li data-slot="breadcrumb-item" class="inline-flex items-center gap-1.5">
      <span data-slot="breadcrumb-page" role="link" aria-disabled="true" aria-current="page"
            class="text-foreground font-normal">Spécialités médicales</span>
    </li>
    …
  </ol>
</nav>
```

- `BreadcrumbLink` utilise `asChild` (Radix `Slot`) : les classes `hover:text-foreground transition-colors` sont fusionnées avec celles du `<button>` enfant `hover:underline cursor-pointer` → chaîne finale observée `hover:text-foreground transition-colors hover:underline cursor-pointer` (outlines).
- Les liens sont des `<button>` (navigation JS), **pas** des `<a href>`.
- Séparateur : icône lucide `chevron-right` (taille par défaut 24, réduite à 14 × 14 par `[&>svg]:size-3.5`), `stroke-width 2`, `currentColor`.
- Plusieurs éléments peuvent être des `span` « page » (ex. « Spécialités médicales » en 2e position ET le dernier élément).

---

## 2. Valeurs CSS résolues

| Élément | Propriété | 375 | 768 | 1440 | Source |
|---|---|---|---|---|---|
| `nav` | display | **none** (absent du dump) | block | block | `docs/research/pages/results/computed-375.json` (aucun `nav` sous `section:0`) ; `R768/R1440 N` |
| `nav` | margin-bottom | — | 24 px | 24 px | `R768/R1440 N` marginBottom |
| `nav` | boîte (résultats Nice) | — | x 24, y 105, 720 × **50** (2 lignes) | x 56, y 105, 1328 × 20 | `R768/R1440 N` rect |
| `ol` | police | — | Plus Jakarta Sans 14px / 20px, 400 | idem | `R1440 N>ol:0` |
| `ol` | couleur | — | `oklch(0.552 0.016 285.938)` (`--muted-foreground` ≈ `#71717b`) | idem | idem color |
| `ol` | disposition | — | flex, `flex-wrap:wrap`, `align-items:center`, `overflow-wrap:break-word` | idem | `CSS .break-words` |
| `ol` | gap | — | **10 px** (`sm:gap-2.5`, ≥ 640 px ; 6 px en dessous mais le nav est alors masqué) | 10 px | `R768/R1440 N>ol:0` gap |
| `li` item | disposition | — | inline-flex, `align-items:center`, gap 6 px | idem | `R1440 N>ol:0>li:0` gap |
| `li` séparateur | boîte | — | 14 × 14, décalé de +3 px en y (centré sur la ligne de 20 px) | idem (x 331, y 108) | `R1440 N>ol:0>li:1` rect |
| bouton lien | police / couleur | — | 14px / 20px, 400, muted-foreground | idem | `R1440 N>ol:0>li:0>button:0` |
| `span` page | police / couleur | — | 14px / 20px, **400** (`font-normal`), `oklch(0.141 0.005 285.823)` (`--foreground` ≈ `#09090b`) | idem | `R1440 N>ol:0>li:2>span:0` |

Géométrie mesurée, page résultats « Nice » à 1440 (`R1440 N>ol:0>li:*`) :

| # | Élément | x | largeur |
|---|---|---|---|
| li:0 | bouton « Trouver un dispositif de téléconsultation » | 56 | 265 |
| li:1 | › | 331 | 14 |
| li:2 | span « Spécialités médicales » | 355 | 141 |
| li:3 | › | 506 | 14 |
| li:4 | bouton « Provence-Alpes-Côte d'Azur » | 530 | 190 |
| li:5 | › | 730 | 14 |
| li:6 | bouton « Alpes-Maritimes » | 754 | 107 |
| li:7 | › | 871 | 14 |
| li:8 | span « Nice » | 895 | 29 |

À 768 (`R768`) la ligne se replie après le 3e séparateur : « Alpes-Maritimes » passe à x 24, y 135 (interligne 20 + gap 10).

Sur la fiche (`F1440`) : nav x 80, y 153, 1280 × 20 (conteneur plus étroit, voir spec fiche) ; dernier élément = span nom du point de vente (ex. « Pharmacie Saint Barthélémy », x 982, 185 px). À 768 (`F768`) : 2 lignes (h 50).

Contexte vertical (page résultats) : le `nav` est le premier enfant de `section.p-6.bg-slate-50 > div.max-w-[1328px].mx-auto` ; il est suivi du `h1.text-center.text-3xl.text-gray-800.mb-5` (y 149 à 1440 = 105 + 20 + 24, `R1440 div:17>main:0>section:0>div:0>h1:1`).

---

## 3. États

| Élément | État | Valeur | Source |
|---|---|---|---|
| bouton lien | repos | `color: oklch(0.552 0.016 285.938)`, pas de soulignement | `HOV breadcrumb.before` |
| bouton lien | :hover | `color: oklch(0.141 0.005 285.823)` + `text-decoration: underline` ; transition de couleur 0.15s `cubic-bezier(.4,0,.2,1)` (le soulignement apparaît sans transition) | `HOV breadcrumb.after` (`td: underline`) ; `CSS .hover\:text-foreground:hover`, `.hover\:underline:hover` ; capture `hover-breadcrumb-after-1440.png` |
| span page | toutes | aucun changement (non interactif, `aria-disabled="true"`) | `BC` |
| tous | :focus / :active | aucun style spécifique | — |

`hover:` compilés sous `@media (hover:hover)` (`CSS`).

---

## 4. Comportement et composition

### 4.1 Fonction d'URL (`URL` module 1506)

- `slug(label)` : minuscules → `normalize("NFD")` → suppression des diacritiques `[̀-ͯ]` → toute suite de caractères hors `[a-z0-9]` remplacée par `-` → suppression des `-` en tête/queue. Ex. « Provence-Alpes-Côte d'Azur » → `provence-alpes-cote-d-azur` ; « Île-de-France » → `ile-de-france` ; « Val-d'Oise » → `val-d-oise`.
- `url(items, slugSpécialité)` : `"/" + [slugSpécialité + "/"] + items.map(slug).join("/")` ; sans items : `"/" + slugSpécialité` ou `"/"`.
- Région / département d'un code postal (`URL` module 45) : département = 2 premiers caractères, sauf codes commençant par `20` → `2A` si 3e caractère `0` ou `1`, sinon `2B` ; nom du département via table `UY` (repli : le code lui-même) ; région via table `rc` (repli : chaîne vide).

### 4.2 Page résultats (`PAGE` l. 666-845)

Ordre des éléments :
1. **Bouton** `Trouver un dispositif de téléconsultation` → `router.push("/")` puis `window.scrollTo({top:0, behavior:"smooth"})`.
2. Séparateur.
3. Élément spécialité :
   - aucune spécialité active → **span** `Spécialités médicales` ;
   - spécialité active **et** recherche de lieu avec ≥ 1 résultat → **bouton** avec le libellé de la spécialité (ex. `Dermatologue`) → `router.push("/<slug spécialité>")` + scroll en haut lisse ;
   - spécialité active sans lieu (page `/dermatologues`) → **span** avec le libellé.
4. Si une recherche de lieu est active (`q` = texte recherché) et qu'il y a ≥ 1 résultat : liste calculée à partir du **premier résultat** `r0` (région `R0`, département `D0` de son code postal) et de `t` = partie de `q` avant la 1re virgule :

| Cas | Éléments ajoutés (dans l'ordre) |
|---|---|
| `t` = 5 chiffres (code postal) | `R0` (si non vide) ; puis si `r0.ville` et `D0` diffèrent (insensible à la casse) : `D0`, `r0.ville` ; sinon `r0.ville` s'il existe, sinon `D0` ; puis `t` (type code postal) |
| `t` = nom de région exact | `t` |
| `t` = nom de département exact | `R0` (si non vide), `t` |
| sinon (ville) | `R0` (si non vide) ; `D0` si différent de `t` (insensible à la casse) ; `t` |

   Chaque élément est précédé d'un séparateur. Le **dernier** est un span page ; les autres sont des boutons → `router.push(url(items[0..i], slugSpécialité))` + scroll en haut lisse.

Exemple mesuré (`/fr/france-FR/nice/results`) : `Trouver un dispositif de téléconsultation › Spécialités médicales › Provence-Alpes-Côte d'Azur › Alpes-Maritimes › Nice` ; « Provence-Alpes-Côte d'Azur » → `/provence-alpes-cote-d-azur`, « Alpes-Maritimes » → `/provence-alpes-cote-d-azur/alpes-maritimes`.
Exemple avec spécialité (`docs/research/pages/specialty-city/outline.txt`) : `Trouver un dispositif de téléconsultation › Dermatologue › Provence-Alpes-Côte d'Azur › Alpes-Maritimes › Nice` (« Dermatologue » bouton).

### 4.3 Fiche d’un dispositif (`FICHE` l. 560-643)

1. **Bouton** `Trouver un dispositif de téléconsultation` → `router.push("/")` (sans appel explicite à `scrollTo`).
2. Séparateur + **span** `Spécialités médicales` (toujours non cliquable).
3. Dispositif hors États-Unis : à partir de son code postal et de sa ville `v` : région (si non vide), département (si différent de `v`, insensible à la casse), ville `v` (si non vide) — chacun précédé d'un séparateur, **tous des boutons** → `router.push(url(items[0..i]))` (sans spécialité) + scroll en haut lisse.
   Dispositif US (`pays` ∈ US/USA/U.S./U.S.A./UNITED STATES…) : séparateur + span `v`.
4. Séparateur + **span** nom du point de vente (`nom`).

Exemple (`docs/research/pages/fiche/outline.txt`) : `Trouver un dispositif de téléconsultation › Spécialités médicales › Provence-Alpes-Côte d'Azur › Alpes-Maritimes › Nice › Pharmacie Saint Barthélémy` (« Nice » est ici un bouton).

---

## 5. Textes exacts

| Texte | Source |
|---|---|
| `Trouver un dispositif de téléconsultation` | `PAGE` l. 684 ; `FICHE` l. 173 |
| `Spécialités médicales` | `PAGE` l. 715 ; `FICHE` l. 174 |
| Libellés de spécialités : `Généraliste`, `Dermatologue`, `Pédiatre`, `Ophtalmologue`, `Gériatre`, `Pneumologue` | module 7864 |
| Noms de régions/départements : tables `rc`/`UY` (ex. `Provence-Alpes-Côte d'Azur` avec apostrophe droite U+0027, `Île-de-France`, `Val-d'Oise`, `Côtes-d'Armor`) | `URL` module 45 |
| `aria-label` du nav : `breadcrumb` | `BC` l. 23 |

## 6. Incertitudes

- La casse du libellé « ville » dépend de la source : texte tapé par l'utilisateur (après recherche) ou valeur `ville` des données (URL analysée). Non normalisé par l'original.
- Le comportement de `window.scrollTo` lisse dépend de `prefers-reduced-motion` côté navigateur (l'original ne le teste pas).
