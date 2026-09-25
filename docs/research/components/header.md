# Composant — En-tête global (`<header>`)

> Spec de reconstruction fidèle. Toutes les valeurs numériques citent leur source.
> Présent sur **toutes** les pages (accueil, résultats, fiche) via le layout racine, **sauf** les chemins commençant par `/embed` (le layout rend alors uniquement `children`, sans header ni footer — `docs/research/js/pretty/app_layout-ae5373d3d10bafec.js`, fonction `d`, test `pathname.startsWith("/embed")`).

## Sources abrégées

| Alias | Fichier |
|---|---|
| `H375` / `H768` / `H1440` | `docs/research/pages/home/computed-{375,768,1440}.json` (getComputedStyle, viewport 375×812, 768×1024, 1440×900) |
| `CSS` | `docs/research/css/323d88a92ac6be07.css` (Tailwind compilé de l'original) |
| `HOV` | `docs/research/hover-states.json` |
| `TOK` | `docs/research/tokens.json` |
| `DOM` | `docs/research/pages/home/dom.html` |
| `LAYOUT` | `docs/research/js/pretty/app_layout-ae5373d3d10bafec.js` (module 1501, composant `c`) |
| `NET` | `docs/research/pages/home/network.json` |

---

## 1. Structure DOM (classes exactes de l'original)

Source : `DOM` (extrait `<header …>`) et `LAYOUT` l. 14-69.

```html
<header class="bg-white shadow-sm border-b border-gray-200 top-0 z-50">
  <nav class="max-w-[1328px] mx-auto flex justify-between items-center h-[80px] px-6">
    <!-- 1. Logo -->
    <div class="flex items-center">
      <a class="font-bold cursor-pointer" href="https://www.tessan.io/">
        <img alt="Logo Tessan" width="91" height="50" decoding="async" data-nimg="1"
             src="/logo.svg" style="color: transparent;">
      </a>
    </div>
    <!-- 2. Navigation (masquée < 1024 px) -->
    <div class="hidden lg:flex items-center gap-12">
      <a class="text-base text-gray-700 hover:text-tessan-green font-medium transition-colors cursor-pointer"
         href="https://www.tessan.io/la-teleconsultation-augmentee">Téléconsultation</a>
      <a class="text-base text-gray-700 hover:text-tessan-green font-medium transition-colors cursor-pointer"
         href="https://www.tessan.io/medecins">Vous êtes médecin ?</a>
      <a class="text-base text-gray-700 hover:text-tessan-green font-medium transition-colors cursor-pointer"
         href="https://www.tessan.io/">Vous êtes un professionnel ?</a>
    </div>
    <!-- 3. Bouton « Compte patient » -->
    <div class="flex items-center">
      <a class="flex items-center gap-2 bg-[#0f352d] text-white text-base px-6 py-3 rounded font-semibold hover:bg-[#153f3f] transition-colors cursor-pointer"
         href="https://patient.prod.tessan.cloud/auth/login">
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none"
             stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
             class="lucide lucide-user" aria-hidden="true">…</svg>Compte patient
      </a>
    </div>
  </nav>
</header>
```

Remarques structurelles :
- **Pas de menu burger** : aucun bouton, aucun panneau mobile. En dessous de 1024 px, la `div` de navigation est simplement `display:none` (`hidden lg:flex`) ; il ne reste que le logo à gauche et « Compte patient » à droite (`justify-between`). Vérifié : l'élément `header:19>nav:0>div:1` est absent des dumps `H375` et `H768` (éléments `display:none` non exportés) et présent dans `H1440`.
- Le header **n'est pas collant** : `top-0 z-50` sont présents mais sans classe `sticky`/`fixed` ; aucune propriété `position` n'est exportée dans `H1440 header:19` (donc `static`). Il défile avec la page.
- L'icône est `lucide-react` **User** (`size 18` → `LAYOUT` l. 64 : `(0, t.jsx)(a.A, { size: 18 })`, `a = r(508)`), placée **avant** le texte. `aria-hidden="true"`.
- `<img>` rendu par `next/image` : `width="91" height="50"`, mais `img{height:auto;max-width:100%}` (preflight, `CSS` base layer) → hauteur réelle = ratio du SVG.
- Liens = `next/link` vers des URL absolues externes : navigation pleine page, **même onglet** (aucun `target`).

---

## 2. Valeurs CSS résolues

Breakpoints Tailwind réels (`TOK` `breakpoint`) : `sm` 640 px (40rem), `md` 768 px (48rem), `lg` 1024 px (64rem). Le header ne change qu'à `lg`.

### 2.1 `<header>`

| Propriété | 375 | 768 | 1440 | Source |
|---|---|---|---|---|
| Hauteur totale | 81 px (80 nav + 1 bordure) | 81 px | 81 px | `H375/H768/H1440` path `header:19` rect.h |
| Largeur | 375 | 768 | 1440 | idem rect.w |
| background-color | `rgb(255,255,255)` | idem | idem | `H1440 header:19` |
| border-bottom | `1px solid oklch(0.928 0.006 264.531)` (= gray-200 ≈ `#e5e7eb`) | idem | idem | `H1440 header:19` borderBottomWidth/Color |
| box-shadow (`shadow-sm`) | `0 1px 3px 0 rgba(0,0,0,.1), 0 1px 2px -1px rgba(0,0,0,.1)` | idem | idem | `H1440 header:19` boxShadow ; `CSS .shadow-sm` |
| z-index | 50 (sans effet, position static) | idem | idem | `H1440 header:19` zIndex |
| font (hérité du body) | Plus Jakarta Sans 16px/24px 400, color `oklch(0.141 0.005 285.823)` | idem | idem | `H1440 header:19` |

### 2.2 `<nav>` (conteneur)

| Propriété | 375 | 768 | 1440 | Source |
|---|---|---|---|---|
| max-width | 1328 px | 1328 px | 1328 px | `H1440 header:19>nav:0` maxWidth ; `CSS .max-w-\[1328px\]` |
| largeur rendue | 375 | 768 | 1328 | `H375/H768/H1440 header:19>nav:0` rect.w |
| x | 0 | 0 | 56 (marges auto 56 px) | idem rect.x, `H1440` marginLeft/Right `56px` |
| hauteur | 80 px | 80 | 80 | `H* header:19>nav:0` height ; `CSS .h-\[80px\]` |
| padding-inline | 24 px | 24 | 24 | `H* header:19>nav:0` paddingLeft/Right |
| display / alignement | flex, `justify-content:space-between`, `align-items:center` | idem | idem | `H* header:19>nav:0` |

### 2.3 Logo

| Propriété | 375 | 768 | 1440 | Source |
|---|---|---|---|---|
| Boîte `img` | x 24, y 29.8, 91 × 20.36 px | x 24, y 29.8, 91 × 20.36 | x 80, y 29.8, 91 × 20.36 | `H375/H768/H1440 header:19>nav:0>div:0>a:0>img:0` |
| Ratio SVG | ≈ 4.47 : 1 (91 / 20.3594) | | | idem width/height |
| Couleur dominante du tracé | ≈ `#23374d` (mot « TESSAN » espacé, capitales fines) | | | pixels mesurés sur `docs/reference/home-1440.png` zone x80-171 y30-50 |
| Fichier | `/logo.svg` (servi par l'original, **non présent** dans le dépôt : seulement référencé dans `NET`) | | | `NET` url `https://teleconsultation.tessan.io/logo.svg` |

Le `<a>` parent a `font-bold` (700) sans effet visuel (pas de texte).

### 2.4 Liens de navigation (≥ 1024 px uniquement)

| Propriété | Valeur (1440) | Source |
|---|---|---|
| Conteneur | flex, `align-items:center`, `gap:48px`, x 363, y 28, 603 × 24 | `H1440 header:19>nav:0>div:1` |
| Lien « Téléconsultation » | x 363, 131 × 24 | `H1440 …>div:1>a:0` |
| Lien « Vous êtes médecin ? » | x 542, 158 × 24 | `H1440 …>div:1>a:1` |
| Lien « Vous êtes un professionnel ? » | x 748, 218 × 24 | `H1440 …>div:1>a:2` |
| Police | Plus Jakarta Sans, 16px / 24px, weight 500 | `H1440 …>div:1>a:*` fontSize/lineHeight/fontWeight |
| Couleur repos | `oklch(0.373 0.034 259.733)` (gray-700 ≈ `#364153`) | `H1440 …>a:0` color ; `HOV nav-link.before.color` |
| Couleur survol | `rgb(15, 53, 45)` = `#0f352d` (`--tessan-green`) | `HOV nav-link.after.color` ; `CSS .hover\:text-tessan-green:hover` |
| Transition | `color, background-color, border-color, outline-color, text-decoration-color, fill, stroke, --tw-gradient-*` 0.15s `cubic-bezier(.4,0,.2,1)` | `H1440 …>a:0` transitionProperty/Duration ; `TOK transition` |
| Décoration | aucune (pas de soulignement, ni au survol) | `HOV nav-link.after.td = none` |

Position horizontale : avec `justify-between`, l'espace libre (1280 − 91 − 603 − 202 = 384 px) est réparti en deux gouttières de 192 px ; les liens ne sont donc **pas** centrés sur la page mais entre logo et bouton (x = 80 + 91 + 192 = 363, cf. `H1440`).

### 2.5 Bouton « Compte patient »

| Propriété | 375 | 768 | 1440 | Source |
|---|---|---|---|---|
| Boîte | x 149, y 16, 202 × 48 | x 542, y 16, 202 × 48 | x 1158, y 16, 202 × 48 | `H375/H768/H1440 header:19>nav:0>div:2>a:0` |
| display | flex, `align-items:center`, gap 8 px | idem | idem | idem `gap` |
| padding | 12px 24px | idem | idem | idem paddingTop/Right |
| border-radius | 4 px (`rounded` = .25rem) | idem | idem | idem borderRadius ; `CSS .rounded` |
| Police | Plus Jakarta Sans 16px / 24px, 600 | idem | idem | idem |
| Couleur texte | `rgb(255,255,255)` | idem | idem | idem ; `HOV compte-patient.before.color` |
| Fond repos | `rgb(15,53,45)` = `#0f352d` | idem | idem | idem ; `HOV compte-patient.before.bg` |
| Fond survol | `rgb(21,63,63)` = `#153f3f` | idem | idem | `HOV compte-patient.after.bg` ; `CSS .hover\:bg-\[\#153f3f\]:hover` |
| Icône | lucide `user`, 18 × 18, `stroke-width 2`, `currentColor` (blanc) | | | `DOM` svg `width="18"` |
| Transition | transition-colors 0.15s | | | idem transitionDuration |

---

## 3. États

| Élément | État | Valeur exacte | Source |
|---|---|---|---|
| Lien nav | repos | color gray-700 `oklch(0.373 0.034 259.733)` | `HOV nav-link.before` |
| Lien nav | :hover | color `#0f352d` ; fond, ombre, opacité inchangés | `HOV nav-link.after` |
| Compte patient | :hover | bg `#153f3f`, texte blanc inchangé | `HOV compte-patient.after` |
| Tous | :focus | aucun style spécifique dans les classes ; outline navigateur par défaut, couleur de contour globale `*{outline-color: color-mix(in oklab, var(--ring) 50%, transparent)}` | `CSS` base layer |
| Tous | :active / :disabled | aucun style défini | classes `LAYOUT` |

Tous les `hover:` de Tailwind v4 sont compilés dans `@media (hover:hover){…}` (`CSS`, `css-analysis.json` `media`) : sur écran tactile, aucun effet de survol.

---

## 4. Comportement

- Aucun JavaScript propre au header (pas d'état, pas de burger, pas de scroll-spy, pas de changement au défilement).
- Clic logo → `https://www.tessan.io/` (site vitrine, même onglet).
- Clic « Compte patient » → `https://patient.prod.tessan.cloud/auth/login` (même onglet).
- Responsive : un seul point de bascule, `lg` = 1024 px (`display:none` → `display:flex` pour la nav). À 768 px le header est donc identique au 375 px, seule la largeur change.

---

## 5. Textes exacts

| Emplacement | Texte (verbatim) |
|---|---|
| `alt` du logo | `Logo Tessan` |
| Lien 1 | `Téléconsultation` |
| Lien 2 | `Vous êtes médecin ?` (espace simple U+0020 avant « ? » — `LAYOUT` l. 48 `"Vous \xeates m\xe9decin ?"`) |
| Lien 3 | `Vous êtes un professionnel ?` (espace simple avant « ? ») |
| Bouton | `Compte patient` |

## 6. Liens

| Élément | href | target |
|---|---|---|
| Logo | `https://www.tessan.io/` | — |
| Téléconsultation | `https://www.tessan.io/la-teleconsultation-augmentee` | — |
| Vous êtes médecin ? | `https://www.tessan.io/medecins` | — |
| Vous êtes un professionnel ? | `https://www.tessan.io/` | — |
| Compte patient | `https://patient.prod.tessan.cloud/auth/login` | — |

## 7. Points d'attention / incertitudes

- Le fichier `/logo.svg` n'est pas dans le dépôt ; seule sa présence réseau et son rendu (91 × 20.36 px, couleur ≈ `#23374d`) sont documentés. Le footer réutilise le même fichier en blanc (filtre `brightness-0 invert`, voir `footer.md`).
- `font-bold` sur le lien du logo et `z-50` sur le header n'ont aucun effet visible ; à conserver pour la fidélité des classes, sans incidence.
