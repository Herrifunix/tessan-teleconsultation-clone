# Page — Accueil `/` (assemblage)

> Assemblage de la vue « accueil » : en-tête global, héro (h1 + h5 d'introduction), carte de recherche, carte de la carte interactive, zones à proximité, pied de page ; plus les états de chargement et le cas « ville inconnue ».
> Composants détaillés ailleurs : `header.md`, `footer.md`, `search-form.md`, `nearby-areas.md`, `cookie-consent.md`, `breadcrumb.md` (absent ici). La carte Google elle-même (marqueurs, clusters, popups) relève de `map.md` ; seul son conteneur et ses boutons superposés sont décrits ici.

## Sources abrégées

| Alias | Fichier |
|---|---|
| `H375` / `H768` / `H1440` | `docs/research/pages/home/computed-{375,768,1440}.json` (viewports 375×812, 768×1024, 1440×900 ; `scrollHeight` 5597 / 4271 / 2632) |
| `PAGE` | `docs/research/js/pretty/128-230074a16c9361a5.js` module 2128 (composant `g` l. 254-893, `Suspense` `x` l. 895-916) ; module 9306 (bloc carte, l. 918-993) |
| `MAP` | `docs/research/js/pretty/990-ede1d18ec8eaf918.js` module 9382 (boutons superposés l. 2859-2900) |
| `URL` | `docs/research/js/pretty/990-ede1d18ec8eaf918.js` module 1506 (`yP` analyse du chemin, `r5` correspondance par slug) ; module 7864 (spécialités) ; module 45 (régions/départements) |
| `DOM` | `docs/research/pages/home/dom.html` |
| `INFO` | `docs/research/pages/home/info.json` ; `docs/reference/capture-meta.json` |
| `CSS` | `docs/research/css/323d88a92ac6be07.css` |
| `HOV` | `docs/research/hover-states.json` |
| Captures | `docs/reference/home-{375,768,1440}.png`, `docs/reference/states/unknown-city-1440.png` |

Préfixes de chemins : `S` = `div:20>main:0>section:0>div:0` (héro), `M` = `div:20>main:0>div:1` (bloc carte), `Z` = `div:20>main:0>div:2` (zones).

---

## 1. Document

| Élément | Valeur | Source |
|---|---|---|
| `<html lang>` | `fr` | `DOM` |
| `<title>` | `Trouvez le dispositif de téléconsultation Tessan` | `INFO.title` |
| `meta description` | `Trouvez une cabine de téléconsultation en pharmacie près de chez vous et consultez un médecin en quelques minutes grâce aux dispositifs Tessan` | `INFO.metas` |
| `meta viewport` | `width=device-width, initial-scale=1` | `INFO.metas` |
| favicon | `<link rel="icon" href="/favicon.ico" type="image/x-icon" sizes="32x32">` | `DOM` |
| `<body>` | `class="__variable_2392b8 __variable_764305 antialiased"` → variables `--font-plus-jakarta`, `--font-recoleta` ; `-webkit-font-smoothing:antialiased; -moz-osx-font-smoothing:grayscale` ; fond `var(--background)` blanc, texte `var(--foreground)` ; police `"Plus Jakarta Sans", var(--font-plus-jakarta), sans-serif` | `DOM` ; `CSS` (`.antialiased`, règle `body`) |
| Titres `h1…h6` | `font-family:"Recoleta", var(--font-recoleta), sans-serif; font-weight:400` (base) | `CSS` base layer |

Ordre des enfants de `<body>` (`DOM`) : UI CookieYes (voile, revisit, bannière, modale) · `next-route-announcer` · `<header>` · `<div><main>…</main></div>` · `<footer>` · `div.pac-container.pac-logo` (ajouté par Google Places, vide tant qu'aucune saisie).

---

## 2. Structure de `<main>` (vue accueil, `PAGE` l. 544-658)

```html
<div>
  <main>
    <!-- 2.1 Héro + recherche -->
    <section class="p-6 bg-slate-50">
      <div class="max-w-[1328px] mx-auto">
        <h1 class="text-center text-2xl md:text-3xl text-gray-800 mb-8 mt-3 md:mt-5">Les dispositifs de téléconsultation Tessan <span class="text-tessan-green-hover">autour de vous</span></h1>
        <h5 class="text-center text-l md:text-xl text-gray-800 mb-8"
            style="font-family: &quot;Plus Jakarta Sans&quot;, &quot;Plus Jakarta Sans&quot;, &quot;Plus Jakarta Sans Fallback&quot;, sans-serif;">Tessan, c'est une <strong> téléconsultation augmentée par des dispositifs médicaux connectés </strong>(stéthoscope, thermomètre, tensiomètre, dermatoscope...) pour un examen fiable, accompagné sur place par un professionnel de santé. Plus de <strong> 500 médecins généralistes et spécialistes</strong>  – dermatologues, pédiatres, ophtalmologues et d'autres disciplines – vous prennent en charge dans plus de <strong> 1 600 pharmacies et lieux de santé </strong> partout en France. Il y a forcément une cabine ou une borne Tessan près de chez vous !</h5>
        <div class="mx-auto bg-white p-6 md:p-8 rounded-lg shadow-lg">
          <form …>…</form>            <!-- search-form.md -->
        </div>
      </div>
    </section>

    <!-- 2.2 Bloc carte (module 9306, showList = false) -->
    <div class="bg-slate-50 p-6 pb-12">
      <div class="max-w-[1328px] mx-auto">
        <div class="bg-white p-6 md:p-8 rounded-lg shadow-lg">
          <div class="rounded-md overflow-hidden shadow-md h-[calc(100vh-400px)] min-h-[600px]">
            <div style="position: relative; width: 100%; height: 100%;">
              … carte Google (voir map.md) …
              <div class="absolute top-4 left-4 flex flex-col gap-2 z-10">
                <button class="bg-white hover:bg-[#fcf5cc] text-tessan-green rounded-lg shadow-lg p-3 transition-colors duration-200 flex items-center gap-2 font-medium cursor-pointer" title="Réinitialiser la vue">
                  <svg class="lucide lucide-maximize2 lucide-maximize-2" …/> <span class="hidden sm:inline">Réinitialiser</span></button>
                <button class="bg-white hover:bg-[#fcf5cc] text-tessan-green rounded-lg shadow-lg p-3 transition-colors duration-200 flex items-center gap-2 font-medium cursor-pointer" title="Me géolocaliser">
                  <svg class="lucide lucide-locate-fixed" …/> <span class="hidden sm:inline font-bold">Me géolocaliser</span></button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 2.3 Zones à proximité (isHomepage = true) -->
    <div class="bg-slate-50 p-6 pb-12"> … </div>   <!-- nearby-areas.md -->
  </main>
</div>
```

Points notables :
- `text-l` n'existe pas dans Tailwind (aucune règle dans `CSS`) → le `h5` hérite de 16px/24px sous 768 px ; `md:text-xl` s'applique ensuite.
- Le `h5` a un `style` inline Plus Jakarta Sans (sinon il serait en Recoleta via la règle de base). Graisse de base 400, `strong` = `bolder` → 700.
- Les espaces **dans** les `<strong>` et le double espace avant « – dermatologues » font partie du texte source (`PAGE` l. 571-586) ; le rendu HTML les réduit à une espace.
- **Pas de fil d'Ariane** sur l'accueil.
- Pas d'écart entre sections : elles se suivent sur fond slate-50 ; seules les cartes blanches sont espacées par les paddings.

---

## 3. Valeurs CSS résolues

### 3.1 Héro (`section.p-6.bg-slate-50`)

| Élément | Propriété | 375 | 768 | 1440 | Source |
|---|---|---|---|---|---|
| section | fond | slate-50 `oklch(0.984 0.003 247.858)` (≈ `#f8fafc`) | idem | idem | `H* div:20>main:0>section:0` |
| section | padding | 24 | 24 | 24 | idem |
| section | y / hauteur | 81 / 768 | 81 / 662.4 | 81 / 388 | idem rect |
| conteneur | largeur / x | 327 / 24 | 720 / 24 | 1328 / 56 | `H* S` rect |
| h1 | police | Recoleta **24px / 32px**, 400 | Recoleta **30px / 36px** | 30px / 36px | `H* S>h1:0` ; `CSS .text-2xl`, `.md\:text-3xl` |
| h1 | couleur | gray-800 `oklch(0.278 0.033 256.848)` (≈ `#1e2939`) | idem | idem | idem |
| h1 | alignement | center | center | center | idem |
| h1 | margin-top / bottom | **12** / 32 | **20** / 32 | 20 / 32 | idem marginTop/Bottom |
| h1 | lignes / hauteur | 3 / 96 (y 117) | 2 / 72 (y 125) | 1 / 36 (y 125) | idem rect |
| span « autour de vous » | couleur | `rgb(29,92,77)` = `#1d5c4d` (`--tessan-green-hover`) | idem | idem | `H* S>h1:0>span:0` |
| h5 | police | Plus Jakarta Sans **16px / 24px**, 400 | **20px / 28px** | 20px / 28px | `H* S>h5:1` |
| h5 | couleur / align / margin-bottom | gray-800 / center / 32 | idem | idem | idem |
| h5 | lignes / hauteur | 14 / 336 (y 245) | 8 / 224 (y 229) | 4 / 112 (y 193) | idem rect |
| strong | graisse | 700 | 700 | 700 | `H* S>h5:1>strong:*` |
| carte recherche | fond / radius / ombre | blanc / 10 px / `shadow-lg` `0 10px 15px -3px rgba(0,0,0,.1), 0 4px 6px -4px rgba(0,0,0,.1)` | idem | idem | `H1440 S>div:2` |
| carte recherche | padding | **24** | **32** | 32 | `H375/H768/H1440 S>div:2` |
| carte recherche | boîte | x 24, y 613, 327 × 212 | x 24, y 485, 720 × 234.4 | x 56, y 337, 1328 × 108 | idem rect |

### 3.2 Bloc carte (`M`)

| Élément | Propriété | 375 | 768 | 1440 | Source |
|---|---|---|---|---|---|
| wrapper | padding | 24 24 **48** 24 | idem | idem | `H* M` |
| wrapper | y / hauteur | 849 / 720 | 743.4 / 760 | 469 / 736 | `H* M` rect |
| carte blanche | padding / radius / ombre | **24** / 10 / shadow-lg | **32** / 10 / shadow-lg | 32 / 10 / shadow-lg | `H* M>div:0>div:0` |
| conteneur carte | hauteur | **600** (calc(812 − 400) = 412 < min 600) | **624** (1024 − 400) | **600** (900 − 400 = 500 < 600) | `H* M>div:0>div:0>div:0` rect.h ; `CSS .h-\[calc\(100vh-400px\)\]`, `.min-h-\[600px\]` |
| conteneur carte | largeur | 279 | 656 | 1264 | idem rect.w |
| conteneur carte | radius / ombre / overflow | 8 px (`rounded-md` = radius − 2px) / `shadow-md` `0 4px 6px -1px rgba(0,0,0,.1), 0 2px 4px -2px rgba(0,0,0,.1)` / hidden | idem | idem | idem |
| pile de boutons | position | absolute, `top:16px; left:16px`, flex colonne, gap 8, z 10 | idem | idem | `H* …>div:1` (classe `absolute top-4 left-4 …`) |
| bouton superposé | boîte | **44 × 44** (icône seule ; libellés `hidden` < 640 px) | 180 × 48 | 180 × 48 | `H375/H768/H1440` boutons `fcf5cc` |
| bouton superposé | style | fond blanc, texte `#0f352d`, radius 10, `padding:12px`, gap 8, 16px/24px 500, `shadow-lg` ; libellé « Me géolocaliser » en 700 | idem | idem | idem ; `MAP` l. 2863-2897 |
| bouton superposé | :hover | fond `rgb(252,245,204)` = `#fcf5cc`, transition-colors **200 ms** (`duration-200`) | | | `HOV map-reset.after` ; `CSS` |

Vue initiale de la carte : France entière (lien Google relevé `ll=46.603354,1.888334&z=6`, `INFO.links`), tous les dispositifs en clusters (voir `map.md`).

### 3.3 Zones à proximité (`Z`) — voir `nearby-areas.md`

| | 375 | 768 | 1440 | Source |
|---|---|---|---|---|
| y / hauteur | 1569 / 1976 | 1503.4 / 1288 | 1205 / 816 | `H* Z` rect |

### 3.4 Récapitulatif vertical (pixels, `H*` rect)

| Bloc | 375 | 768 | 1440 |
|---|---|---|---|
| header | 0 → 81 | 0 → 81 | 0 → 81 |
| héro | 81 → 849 | 81 → 743.4 | 81 → 469 |
| carte | 849 → 1569 | 743.4 → 1503.4 | 469 → 1205 |
| zones | 1569 → 3545 | 1503.4 → 2791.4 | 1205 → 2021 |
| footer | 3545 → 5596.8 | 2791.4 → 4271.2 | 2021 → 2632 |

---

## 4. États de la page

### 4.1 Chargement initial (`PAGE` l. 529-543 et fallback `Suspense` l. 895-916)

Tant que l'analyse de l'URL et le chargement des dispositifs ne sont pas terminés, `<main>` contient uniquement :

```html
<div class="flex items-center justify-center min-h-screen bg-slate-50">
  <div class="text-center">
    <div class="inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-tessan-green border-r-transparent"></div>
    <p class="mt-4 text-lg text-gray-600">Chargement...</p>
  </div>
</div>
```

| Élément | Valeur | Source |
|---|---|---|
| conteneur | `min-height:100vh`, flex centré, fond slate-50 | classes ; `CSS` |
| spinner | 48 × 48, cercle, bordure 4 px `#0f352d` sauf côté droit transparent, `animation: spin 1s linear infinite` | `CSS .h-12`, `.border-4`, `.border-r-transparent`, `.animate-spin` ; `TOK animation.spin` |
| texte | `Chargement...` 18px / 28px (`text-lg`), gray-600 `oklch(44.6% .03 256.802)`, `margin-top:16px`, centré | `CSS .text-lg`, `TOK text.lg` |

Header et footer restent affichés (layout) ; le footer est repoussé sous la ligne de flottaison par `min-h-screen`. Le même écran sert de `fallback` Suspense. Une fois la vue accueil rendue, la carte « zones à proximité » affiche brièvement son propre état `Chargement...` (voir `nearby-areas.md` §1.2). Non capturé (transitoire) : dimensions déduites des classes.

### 4.2 Choix de la vue (analyse d’URL, `PAGE` l. 270-434)

| Situation | Vue rendue |
|---|---|
| chemin `/` sans paramètre | **accueil** : tous les dispositifs sur la carte, zones calculées depuis Paris |
| `/` avec `?fromSearch=true` et `sessionStorage.searchResults` + `searchQuery` présents | vue résultats avec ces données, puis `history.replaceState({}, "", "/")` (chemin hérité) |
| chemin ≠ `/` arrivé par une recherche (`sessionStorage.navigationFromSearch === "true"`) | vue résultats avec les données stockées (clés supprimées ensuite) |
| `/<slug spécialité>` seul (ex. `/dermatologues`) | vue résultats filtrée par spécialité |
| autre chemin : segments analysés (après un éventuel slug de spécialité en tête) | si le dernier segment est un code postal à 5 chiffres → filtrage par CP ; sinon, du dernier au premier segment, premier segment dont le slug correspond à une **ville** des données, sinon à un **département**, sinon à une **région** → filtrage correspondant |
| → correspondance trouvée **et** ≥ 1 dispositif | vue résultats (fil d'Ariane, liste, carte), origine = 1er dispositif |
| → **aucune correspondance** (ou 0 dispositif) | **vue accueil** (voir 4.3) |

### 4.3 Ville inconnue (vérifié en direct : `/fr/france-FR/choisy-le-roi/results`)

- Segments `fr`, `france-FR`, `choisy-le-roi`, `results` : aucun ne correspond à une ville/département/région des données (Choisy-le-Roi n'a aucun dispositif) → la page rend **exactement la vue accueil** : h1 « … autour de vous », h5 d'introduction, formulaire vide, carte de France avec tous les dispositifs, zones calculées depuis Paris (mêmes 10 + 10 que l'accueil).
- **L'URL reste inchangée** (pas de redirection, pas de `replaceState`).
- **Pas de fil d'Ariane**, pas de liste de résultats, pas de message d'erreur.
- Capture : `docs/reference/states/unknown-city-1440.png` (visuellement identique à `home-1440.png`, revisit cookie visible).
- Cas particulier du code : si le dernier segment est un code postal à 5 chiffres sans dispositif, la vue accueil s'affiche **avec une carte vide** (la liste filtrée, vide, est passée à la carte) — déduit du code (`PAGE` l. 340-394), non vérifié en direct.
- `<title>` sur cette URL : non capturé (les pages résultats valides ont la forme `Téléconsultation à Nice (france-FR) - Tessan`, `docs/reference/capture-meta.json` ; le gabarit serveur n'est pas dans les bundles clients).

---

## 5. Comportement (interactions propres à la page)

| Déclencheur | Effet | Source |
|---|---|---|
| Soumission du formulaire | voir `search-form.md` §4.5-4.6 (navigation vers l'URL de résultats ou `/<slug spécialité>`) | `PAGE` l. 436-488 |
| Clic sur un marqueur de la carte d'accueil | dispositifs situés à ≤ 10 km (haversine) du marqueur, triés par distance → même navigation qu'une recherche avec la requête = `ville` du marqueur (ou `Autour du point sélectionné` si vide) et l'origine = marqueur | `PAGE` l. 610-651 |
| Clic sur une carte département/région | voir `nearby-areas.md` §5 | `PAGE` l. 489-521 |
| « Réinitialiser » (carte) | `panTo` du centre initial puis zoom 6 après 300 ms, ferme la popup — détail dans `map.md` | `MAP` l. 2684-2686, 2865 |
| « Me géolocaliser » (carte) | si autorisé : `panTo` position + zoom 15 ; aucun message en cas de refus | `MAP` l. 2878-2888 |
| Navigation interne vers `/` (fil d'Ariane, bouton ×, recherche vide) | la page est remontée : écran de chargement puis vue accueil | déduit : la route `/` est distincte de la route `[...location]` (chunk `app_[...location]_page` séparé, `docs/research/js/`) |

---

## 6. Textes exacts

| Emplacement | Texte |
|---|---|
| h1 | `Les dispositifs de téléconsultation Tessan ` + span `autour de vous` |
| h5 (nœuds successifs, espaces conservées) | `Tessan, c'est une ` · **` téléconsultation augmentée par des dispositifs médicaux connectés `** · `(stéthoscope, thermomètre, tensiomètre, dermatoscope...) pour un examen fiable, accompagné sur place par un professionnel de santé. Plus de ` · **` 500 médecins généralistes et spécialistes`** · `  – dermatologues, pédiatres, ophtalmologues et d'autres disciplines – vous prennent en charge dans plus de ` · **` 1 600 pharmacies et lieux de santé `** · ` partout en France. Il y a forcément une cabine ou une borne Tessan près de chez vous !` |
| Caractères | apostrophes droites U+0027 (`c'est`, `d'autres`) ; tirets demi-cadratin U+2013 (`–`) ; `1 600` avec espace **simple** ; espace simple avant `!` ; `...` = trois points ASCII (vérifié dans `PAGE` et `DOM`, aucun `&nbsp;` hors CookieYes) |
| Boutons carte | `Réinitialiser` (title `Réinitialiser la vue`) · `Me géolocaliser` (title `Me géolocaliser`) |
| Chargement | `Chargement...` |

---

## 7. Incertitudes

- États de chargement non capturés (transitoires) ; valeurs issues des classes.
- `<title>` d'une URL de ville inconnue non relevé.
- La carte vide pour un code postal inconnu est une déduction du code.
- `docs/reference/home-375.png` montre le bouton « Recherche » en `#1d5c4d` (pixels (60,765) et (300,790)) alors que le dump `H375 …>form:0>button:2` mesure `rgb(15, 53, 45)` : survol résiduel pendant la capture mobile. Le clone doit garder `#0f352d` au repos ; prévoir un masque ou une tolérance sur cette zone lors du diff pixel à 375 (à 768, pixels (80,660) = `#0f352d`, conforme).
