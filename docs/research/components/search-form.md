# Composant — Formulaire de recherche (spécialité + ville + géolocalisation + autocomplétion)

> Composant unique réutilisé en mode `inline` sur l'accueil, les pages résultats et la fiche (carte « Effectuer une nouvelle recherche »). Module webpack **5915** (`docs/research/js/pretty/467-4c092da56609776e.js` l. 86-786), sous-composant `m` = champ Google Places (l. 111-318), sous-composant `d` = `Input` shadcn/ui (l. 97-107).
> Le clone n'utilisera pas Google Places : le rendu de la liste de suggestions doit néanmoins reproduire le style `.pac-container` de l'original (§6).

## Sources abrégées

| Alias | Fichier |
|---|---|
| `H375` / `H768` / `H1440` | `docs/research/pages/home/computed-{375,768,1440}.json` — préfixe commun `div:20>main:0>section:0>div:0>div:2>form:0` noté `F` |
| `JS` | `docs/research/js/pretty/467-4c092da56609776e.js` |
| `SPEC` | `docs/research/js/pretty/990-ede1d18ec8eaf918.js` module 7864 (l. 2475-2562, spécialités) ; module 45 (l. 5-224, départements/régions) ; module 4173 (l. 513-892, accès données) |
| `PAGE` | `docs/research/js/pretty/128-230074a16c9361a5.js` (callback `onSearchSubmit` = fonction `R`, l. 436-488) |
| `CSS` | `docs/research/css/323d88a92ac6be07.css` |
| `PAC` | `docs/research/css/b2e1955b359df2cc.css` (styles `.pac-*`) |
| `HOV` | `docs/research/hover-states.json` |
| `DOM` | `docs/research/pages/home/dom.html` |
| `OUT` | `docs/research/pages/home/outline.txt` |
| Captures | `docs/reference/states/specialites-open-1440.png`, `autocomplete-open-1440.png`, `geoloc-granted-1440.png`, `hover-specialites-*-1440.png`, `hover-recherche-*-1440.png` |

Mesures de pixels (couleurs d'anneau, bordures) : échantillonnées sur ces captures (outil sharp, lecture RGB brute) — coordonnées données entre parenthèses.

---

## 1. Structure DOM (classes exactes)

Source : `DOM` (état initial) + `JS` l. 490-757 (états conditionnels).

```html
<form class="flex flex-col lg:flex-row gap-4 md:gap-[1.2rem] items-stretch">

  <!-- (a) Sélecteur de spécialité -->
  <div class="w-full md:min-w-[280px] md:w-auto relative">
    <button type="button"
      class="w-full h-11 flex items-center font-semibold justify-between space-x-2 border rounded-lg px-4 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-300 cursor-pointer border-tessan-green-hover text-tessan-green-hover hover:bg-tessan-green-hover hover:text-white">
      <span class="truncate">Spécialités médicales</span>
      <svg … width="20" height="20" class="lucide lucide-chevron-down transition-transform" aria-hidden="true"><path d="m6 9 6 6 6-6"></path></svg>
    </button>
    <!-- panneau, rendu seulement si ouvert -->
    <div class="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg z-50 overflow-hidden">
      <button type="button" class="w-full text-left px-4 py-3 hover:bg-tessan-green/10 transition-colors border-b border-gray-100 last:border-b-0 cursor-pointer ">
        <div class="font-semibold text-gray-800 flex items-center justify-between"><span>Généraliste</span></div>
        <div class="text-xs text-gray-500 mt-1"></div>
      </button>
      … (6 boutons au total)
      <!-- seulement si une spécialité est sélectionnée -->
      <button type="button" class="w-full text-left px-4 py-2 text-sm text-tessan-green-hover hover:bg-gray-50 border-t border-gray-200 cursor-pointer">Effacer le filtre</button>
    </div>
  </div>

  <!-- (b) Champ ville + boutons internes -->
  <div class="relative flex-1">
    <input class="flex bg-transparent py-1 text-base shadow-xs transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 md:text-sm w-full h-11 border border-gray-300 placeholder-gray-700 rounded-lg px-4 pr-24 focus:outline-none focus:ring-2 focus:ring-blue-300 pac-target-input"
           placeholder="Ville / Code postal" autocomplete="off" type="text" value="">
    <!-- bouton effacer : rendu seulement si la valeur est non vide -->
    <button type="button" class="absolute top-1/2 right-12 -translate-y-1/2 text-gray-400 hover:text-red-500 transition-colors cursor-pointer" title="Effacer la recherche">
      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
    </button>
    <button type="button" class="absolute top-1/2 right-4 -translate-y-1/2 text-gray-400 hover:text-tessan-green-hover transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer" title="Me géolocaliser">
      <svg … width="20" height="20" class="lucide lucide-locate-fixed" aria-hidden="true">…</svg>
    </button>
  </div>

  <!-- (c) Soumission -->
  <button type="submit" class="w-full md:min-w-[288px] md:w-auto h-11 flex items-center justify-center gap-2 bg-tessan-green hover:bg-tessan-green-hover text-white font-semibold rounded-lg px-4 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer">
    <svg … width="20" height="20" class="lucide lucide-search" aria-hidden="true">…</svg>
    <span>Recherche</span>
  </button>
</form>
```

Détails :
- La chaîne de classes de l'`input` est le résultat de `cn()` (tailwind-merge) entre les classes shadcn (`flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 …`, `JS` l. 102) et les classes passées (`w-full h-11 border border-gray-300 placeholder-gray-700 rounded-lg px-4 pr-24 focus:outline-none focus:ring-2 focus:ring-blue-300`, `JS` l. 600) : `h-9`, `rounded-md`, `border-input`, `px-3` ont été éliminés. `pac-target-input` est ajoutée par Google.
- Variantes de la classe du bouton spécialité : si une spécialité est sélectionnée, la fin devient `border-tessan-green bg-tessan-green text-white` (pas de classes hover) au lieu de `border-tessan-green-hover text-tessan-green-hover hover:bg-tessan-green-hover hover:text-white` (`JS` l. 503-507).
- Chevron : `transition-transform` + `rotate-180` quand le panneau est ouvert (`JS` l. 514-517).
- Item sélectionné : classe additionnelle `bg-tessan-green/10` (la chaîne de base finit par une espace, `JS` l. 531-535) et un `<span class="text-tessan-green">✓</span>` après le libellé.
- Pendant la géolocalisation, l'icône est remplacée par lucide **loader-circle** `class="animate-spin"` 20 px et le bouton est `disabled` (`JS` l. 721-728).
- Pendant une recherche, le contenu du bouton submit devient `loader-circle.animate-spin` (20 px) + `<span>Recherche...</span>` et le bouton est `disabled` (`JS` l. 733-756).
- Icônes : lucide `chevron-down`, `locate-fixed`, `search`, `loader-circle` (toutes `stroke-width 2`, `stroke-linecap/linejoin round`, 20 px). La croix d'effacement est un SVG écrit à la main (2 lignes).

Contexte d'insertion (hors composant, voir `home-page.md`) : `div.mx-auto.bg-white.p-6.md:p-8.rounded-lg.shadow-lg`.

Variante non-`inline` (présente dans le code, **non utilisée** sur les pages capturées, `JS` l. 759-785) : `section.py-12.md:py-20.bg-slate-50 > div.max-w-[1328px].mx-auto.px-4.text-center > h1.text-2xl.md:text-3xl.font-bold.text-gray-800` « Trouver `<span class="text-tessan-green-hover">une téléconsultation</span>` avec un médecin » + `div.mt-8.md:mt-10.mx-auto.bg-white.p-4.md:p-6.lg:p-8.rounded-lg.shadow-lg` contenant le formulaire. À ne pas implémenter sauf besoin.

---

## 2. Valeurs CSS résolues

### 2.1 Disposition du formulaire

| Propriété | 375 | 768 | 1440 | Source |
|---|---|---|---|---|
| direction | colonne | colonne | **ligne** (`lg:flex-row`, ≥ 1024) | `H375/H768/H1440 F` flexDirection |
| gap | 16 px | 19.2 px (`1.2rem`, ≥ 768) | 19.2 px | idem `gap` ; `CSS .md\:gap-\[1\.2rem\]` |
| align-items | stretch | stretch | stretch | idem |
| boîte | x 48, y 637, 279 × 164 | x 56, y 517, 656 × 170.4 | x 88, y 369, 1264 × 44 | idem rect |
| (a) spécialité | 279 × 44 | 656 × 44 | **280** × 44 | `F>div:0` rect |
| (b) champ | 279 × 44 (y 697) | 656 × 44 (y 580.2) | **657.6** × 44 (x 387.2) | `F>div:1` rect |
| (c) bouton | 279 × 44 (y 757) | 656 × 44 (y 643.4) | **288** × 44 (x 1064) | `F>button:2` rect |

À ≥ 1024 : 280 + 19.2 + 657.6 + 19.2 + 288 = 1264 (`md:min-w-[280px] md:w-auto` / `flex-1` / `md:min-w-[288px] md:w-auto`, `CSS`). Entre 768 et 1023 les `min-w` s'appliquent mais la colonne `items-stretch` étire tout à 100 %.

### 2.2 (a) Bouton « Spécialités médicales »

| Propriété | Valeur (identique aux 3 largeurs sauf mention) | Source |
|---|---|---|
| hauteur | 44 px (`h-11`) | `F>div:0>button:0` rect.h ; `CSS .h-11` |
| display | flex, `justify-content:space-between`, `align-items:center` | idem |
| padding | 0 16px | idem paddingLeft/Right |
| bordure | 1px solide `rgb(29,92,77)` = `#1d5c4d` (`--tessan-green-hover`) | `H375 F>div:0>button:0` borderTopColor/Width |
| radius | 10 px (`rounded-lg` = `var(--radius)` .625rem) | `H1440` borderRadius |
| fond | transparent | idem |
| texte | Plus Jakarta Sans 16px / 24px, **600**, `#1d5c4d`, `text-align:center` | idem |
| libellé `span.truncate` | `overflow:hidden; white-space:nowrap; text-overflow:ellipsis` ; 174 × 24, x = bouton + 17 ; `margin-right:8px` (`space-x-2`) | `F>div:0>button:0>span:0` ; `CSS :where(.space-x-2>…)` |
| chevron | 20 × 20, `currentColor`, collé au bord droit intérieur (x = bouton + largeur − 1 − 16 − 20) | déduit de `justify-between` + padding |
| transition | couleurs 0.15s `cubic-bezier(.4,0,.2,1)` ; chevron `transform` 0.15s | `H1440` transitionDuration ; `CSS .transition-transform` |

### 2.3 Panneau déroulant des spécialités (ouvert)

Mesuré sur `specialites-open-1440.png` (pixels) + classes `JS` l. 519-568.

| Propriété | Valeur | Source |
|---|---|---|
| position | `absolute; top:100%; left:0; right:0; margin-top:8px` → y 421 à 1440 (369 + 44 + 8), largeur = bouton (280) | classes `JS` l. 524 ; pixel (200,421) = `#e5e7eb` |
| fond / bordure | blanc / 1px `#e5e7eb` (gray-200) | pixels (200,421), (88,500), (367,500) |
| radius / ombre / z | 10 px / `shadow-lg` = `0 10px 15px -3px #0000001a, 0 4px 6px -4px #0000001a` / 50 | `CSS .rounded-lg`, `.shadow-lg`, `.z-50` |
| item | `px-4 py-3` ; hauteur 52 px + séparateur 1px `#f3f4f6` (gray-100) ; dernier sans séparateur → panneau 319 px (421 → 739) | pixels (200,474) = `#f3f4f6`, (200,739) = `#e5e7eb` |
| libellé item | 16px / 24px, 600, gray-800 `oklch(27.8% .033 256.848)` ; flex `justify-between` | classes ; `TOK color.gray-800` |
| description item | `div.text-xs.text-gray-500.mt-1` vide (descriptions `""` dans `SPEC`) → hauteur 0 mais `margin-top:4px` conservée (d'où 12+24+4+12 = 52) | `SPEC` l. 2485-2540 |
| survol item | fond `color-mix(in oklab, #0f352d 10%, transparent)` (≈ `#e7ebea` sur blanc), transition-colors | `CSS .hover\:bg-tessan-green\/10:hover` |
| item sélectionné | même fond permanent + « ✓ » en `#0f352d` à droite | `JS` l. 534, 541-546 |
| « Effacer le filtre » | `px-4 py-2`, 14px/20px (`text-sm`), 400, `#1d5c4d`, `border-top:1px #e5e7eb`, survol fond gray-50 `oklch(98.5% .002 247.839)` ; hauteur ≈ 37 px | `JS` l. 557-566 ; `CSS` |

### 2.4 (b) Champ « Ville / Code postal »

| Propriété | 375 | 768 | 1440 | Source |
|---|---|---|---|---|
| hauteur | 44 | 44 | 44 | `F>div:1>input:0` rect.h |
| padding | 4px 96px 4px 16px | idem | idem | idem padding* (`py-1`, `px-4`, `pr-24`) |
| police | 16px / 24px (`text-base`) | **14px / 20px** (`md:text-sm`) | 14px / 20px | `H375/H768/H1440 F>div:1>input:0` |
| couleur texte | `oklch(0.141 0.005 285.823)` (foreground ≈ `#09090b`) | idem | idem | idem color |
| placeholder | couleur `var(--muted-foreground)` = `oklch(55.2% .016 285.938)` (≈ `#71717b`) — la règle `placeholder:text-muted-foreground` (octet 32328) est postérieure à `.placeholder-gray-700` (octet 28289) dans `CSS`, même spécificité → elle gagne | | | `CSS` offsets |
| bordure | 1px solide `oklch(0.872 0.01 258.338)` (gray-300 ≈ `#d1d5dc`) | idem | idem | idem borderTopColor ; pixel (387,391) = `#d1d5dc` |
| radius | 10 px | idem | idem | `H1440` borderRadius |
| ombre repos (`shadow-xs`) | `0 1px 2px 0 rgba(0,0,0,.05)` | idem | idem | `H1440` boxShadow |
| fond | transparent | | | idem |
| `autocomplete` | `off` | | | `DOM` |

Boutons internes (20 × 20, sans padding, `top:50%` + `translate-y:-50%`) :

| Bouton | position | 375 | 768 | 1440 | couleur repos | survol | Source |
|---|---|---|---|---|---|---|---|
| Géolocaliser | `right:16px` | x 291, y 709 | x 676, y 592.2 | x 1008.8, y 381 | gray-400 `oklch(0.707 0.022 261.325)` (≈ `#99a1af`) | `#1d5c4d` | `F>div:1>button:1` ; `CSS .hover\:text-tessan-green-hover:hover` |
| Effacer (si valeur) | `right:48px` | x 259 (calculé) | x 644 (calculé) | x 976.8 (calculé) | gray-400 | red-500 `oklch(63.7% .237 25.331)` (≈ `#fb2c36`) | classes `JS` l. 619 ; `CSS .right-12`, `.hover\:text-red-500:hover` |

### 2.5 (c) Bouton « Recherche »

| Propriété | Valeur | Source |
|---|---|---|
| hauteur / padding | 44 / 0 16px | `F>button:2` |
| display | flex, centré, gap 8 | idem |
| fond repos | `rgb(15,53,45)` `#0f352d` | idem ; `HOV recherche.before.bg` |
| fond survol | `rgb(29,92,77)` `#1d5c4d` | `HOV recherche.after.bg` |
| texte | blanc, 16px/24px, 600 ; « Recherche » 86 × 24 | `F>button:2>span:1` |
| radius | 10 px | `F>button:2` borderRadius |
| icône | lucide `search` 20 px blanc | `DOM` |

Note : sur `docs/reference/home-375.png` le bouton apparaît plus clair (`#1d5c4d`) — artefact de survol émulé lors de la capture ; la valeur mesurée `H375 F>button:2` backgroundColor est bien `rgb(15, 53, 45)`.

---

## 3. États

| Élément | État | Valeur exacte | Source |
|---|---|---|---|
| Spécialité (aucune choisie) | repos | fond transparent, bordure + texte `#1d5c4d` | `HOV specialites.before` (`bg rgba(0,0,0,0)`, `color rgb(29,92,77)`) |
| | :hover | fond `#1d5c4d`, texte blanc (chevron blanc) | `HOV specialites.after` |
| | :focus (clic souris) | anneau 2 px `blue-300` = `oklch(80.9% .105 251.813)` ≈ `#8ec5ff`, collé à l'extérieur de la bordure ; `outline:none` | pixels (86-87,391) et (200,367-368) = `#8ec5ff` sur `specialites-open-1440.png` ; `CSS .focus\:ring-2`, `.focus\:ring-blue-300` |
| | ouvert | chevron `rotate(180deg)` ; panneau §2.3 | `JS` l. 517-520 |
| Spécialité (choisie) | repos | fond + bordure `#0f352d`, texte blanc, libellé = nom de la spécialité (ex. « Dermatologue ») ; **pas** d'effet hover | `JS` l. 506-509 ; capture `autocomplete-open-1440.png` |
| Champ ville | :focus | bordure inchangée gray-300 + **anneau 1 px** `var(--ring)` = `oklch(70.5% .015 286.067)` ≈ `#9f9fa9` + `shadow-xs`. Explication : `focus-visible:ring-1 focus-visible:ring-ring` (octets 35871/36697) sont après `focus:ring-2 focus:ring-blue-300` (35105/35373) et un `input` texte focalisé correspond toujours à `:focus-visible` → l'anneau bleu ne s'affiche jamais | pixels (386,391) = `#9f9fa9`, (387,391) = `#d1d5dc` sur `autocomplete-open-1440.png` ; `CSS` |
| Champ ville | disabled | `cursor:not-allowed; opacity:.5` (jamais utilisé) | classes shadcn |
| Géolocaliser | en cours | `disabled` → `opacity:.5; cursor:not-allowed`, icône loader tournante (`animation: spin 1s linear infinite`) | `JS` l. 721-727 ; `TOK animation.spin` |
| Recherche | :hover | fond `#1d5c4d` | `HOV recherche.after` |
| | :focus (clic) | anneau 2 px blue-500 `oklch(62.3% .214 259.815)` (≈ `#2b7fff`) avec **décalage 2 px blanc** (`--tw-ring-offset-color` initial `#fff`) | `CSS .focus\:ring-offset-2:focus`, `@property --tw-ring-offset-color` |
| | chargement | `disabled` → `opacity:.5`, `cursor:not-allowed` ; contenu « loader tournant + Recherche... » | `JS` l. 733-756 |
| Tous `hover:` | | uniquement sous `@media (hover:hover)` | `CSS` |
| `:active` | | aucun style | — |

---

## 4. Comportement

### 4.1 Sélecteur de spécialité

| Déclencheur | Effet | Source |
|---|---|---|
| Clic bouton | bascule ouvert/fermé | `JS` l. 501 (`E(!N)`) |
| `mousedown` hors du conteneur `div.relative` | ferme | `JS` l. 474-484 |
| Clic sur un item | si c'est la spécialité déjà choisie → la désélectionne (`null`), sinon la sélectionne ; ferme le panneau | `JS` l. 464-466 (`V`) |
| Clic « Effacer le filtre » | désélectionne (valeur `""`, libellé par défaut) ; ferme | `JS` l. 561 |
| Changement de spécialité **après une première recherche** (drapeau interne mis à `true` au premier submit) et si le champ ville est non vide ou des coordonnées existent | relance automatiquement la recherche (même logique que submit) ; rien au premier rendu | `JS` l. 467-473 |
| Clavier | aucun support spécifique (pas d'Échap, pas de flèches) | — |

Spécialités (ordre d'affichage, `SPEC` module 7864) :

| id | slug URL | libellé affiché | valeurs `services` acceptées pour le filtre |
|---|---|---|---|
| `medecine-generaliste` | `medecins-generalistes` | Généraliste | Médecin généraliste |
| `dermatologie` | `dermatologues` | Dermatologue | Dermatologue, Dermatologiste, Dermatologue pédiatrique, Allergologue |
| `pediatrie` | `pediatres` | Pédiatre | Pédiatre, Pediatrician |
| `ophtalmologie` | `ophtalmologistes` | Ophtalmologue | Ophtalmologiste, Ophtalmologiste pédiatrique, Orthoptiste |
| `geriatrie` | `geriatres` | Gériatre | Gériatre, Gériatre pédiatrique |
| `pneumologie` | `pneumologues` | Pneumologue | Pneumologue, Pneumologue pédiatrique, pneumologist, Pneumologie |

(`services` d'un dispositif = `categorie_principale` + `categorie_secondaire_1…6` non vides ; si aucune, `["Téléconsultation Tessan"]` — `SPEC` module 4173 l. 540-549.)

### 4.2 Champ ville

| Déclencheur | Effet | Source |
|---|---|---|
| Focus | déclenche le chargement paresseux de l'API Google Maps si pas encore chargée | `JS` l. 308-310 |
| Saisie | met à jour la valeur ; si la valeur devient vide (après `trim`) → oublie coordonnées et code postal mémorisés | `JS` l. 576-579 |
| Liste de suggestions (Google Places `Autocomplete`, `types:["geocode"]`, `componentRestrictions:{country:"fr"}`) | apparaît sous le champ dès la saisie ; styles §6 | `JS` l. 139-150 ; capture `autocomplete-open-1440.png` (saisie « Nice » → « Nice France », « Nicey France », « Nicey-sur-Aire France ») |
| **Sélection d'une suggestion** (clic ou flèches + Entrée) | la valeur du champ devient le texte Google de la suggestion (ex. `Nice, France` ◇) ; coordonnées mémorisées ; code postal mémorisé s'il existe dans `address_components` ; puis **soumission automatique du formulaire après 100 ms** (bouton → spinner « Recherche... » désactivé) | `JS` l. 155-175, 580-597 ; vérifié en direct |
| Entrée, liste Google **fermée**, valeur non vide | `preventDefault` ; prédiction Google n°1 pour le texte → détails → valeur = adresse formatée, coordonnées/code postal mémorisés → submit après 100 ms ; si aucune prédiction ou échec → submit immédiat avec le texte brut ; nouvelle frappe Entrée ignorée pendant la requête | `JS` l. 187-300 |
| Entrée, liste Google **ouverte** | laissé au comportement natif (Google + submit natif du formulaire) ◇ | `JS` l. 191-192 |

Pour le clone (sans Google), comportement équivalent recommandé : suggestions locales (villes de l'échantillon + départements/régions si souhaité), libellé `« <Ville> » + « France »`, sélection = valeur `<Ville>, France` + coordonnées de la ville + soumission 100 ms plus tard ; Entrée sans sélection = première suggestion si elle existe, sinon texte brut.

### 4.3 Bouton « Effacer la recherche » (×)

Visible uniquement si la valeur est non vide. Au clic (`JS` l. 603-642) :
1. vide le champ, oublie coordonnées et code postal ;
2. passe le bouton submit en chargement (« Recherche... ») ;
3. charge **tous** les dispositifs et appelle `onSearchSubmit(tous, "", undefined, null, null)` — la spécialité sélectionnée est ignorée — ce qui, côté page, remet l'état « accueil » et navigue vers `/` (`PAGE` l. 487) ;
4. fin du chargement.

### 4.4 Bouton « Me géolocaliser »

`JS` l. 643-729 :
1. Si `navigator.geolocation` absent → `alert("La géolocalisation n'est pas supportée par votre navigateur")`.
2. Sinon : état « en cours » (bouton désactivé + spinner) puis `getCurrentPosition` (options par défaut).
3. Succès : coordonnées mémorisées, puis géocodage inverse (Google `Geocoder`) :
   - OK → fin du spinner ; code postal (`postal_code`) mémorisé s'il existe ; **le champ reçoit le nom de la commune** (`locality`), à défaut le code postal, à défaut l'adresse formatée. **Pas de soumission automatique** (vérifié en direct : capture `geoloc-granted-1440.png`, champ = « Nice », croix visible).
   - Échec → `alert("Impossible de déterminer votre adresse")`.
   - Google indisponible → `alert("Le service de géolocalisation n'est pas disponible")`.
4. Erreur de géolocalisation → fin du spinner puis `alert(...)` :
   - `PERMISSION_DENIED` → `Vous avez refusé l'accès à votre position` (vérifié en direct)
   - `POSITION_UNAVAILABLE` → `Votre position n'est pas disponible`
   - `TIMEOUT` → `La demande de géolocalisation a expiré`
   - autre → `Erreur de géolocalisation`

Conséquence (fidèle à l'original) : après une géolocalisation, le code postal mémorisé filtre la recherche suivante sur **ce code postal exact**, et les coordonnées restent utilisées tant que le champ n'est pas vidé, même si l'utilisateur retape une autre ville sans choisir de suggestion.

### 4.5 Soumission (`onSubmit`, fonction `K`, `JS` l. 355-462)

1. `preventDefault`, chargement = vrai, drapeau « a déjà cherché » = vrai.
2. `coords` = coordonnées mémorisées si le champ est non vide, sinon aucune. `terme` = partie avant la première virgule (`trim`).
3. Choix des candidats :
   - `terme` = nom de **région** (comparaison insensible à la casse avec les valeurs de `SPEC` module 45 `rc`) → tous les dispositifs de cette région ; coordonnées = cache local ou géocodage `"<terme>, France"`.
   - `terme` = nom de **département** (`UY`) → tous les dispositifs du département ; idem coordonnées.
   - sinon, si `coords` → tous les dispositifs triés par distance (haversine, R = 6371 km), **20 premiers**.
   - sinon, si champ non vide → géocodage `"<terme>, France"` → 20 plus proches ; en cas d'échec : dispositifs dont `ville` contient `terme` (ILIKE `%terme%`).
   - sinon (champ vide) → tous les dispositifs.
4. Si un code postal est mémorisé → ne garder que `codePostal === code`.
5. Si une spécialité est choisie → ne garder que les dispositifs dont `services` intersecte ses `specialisations`.
6. Si `coords` → « minimum de résultats » : si ≤ 3 résultats, ajouter jusqu'à 5 dispositifs les plus proches non déjà présents (`SPEC` module 4173 fonction `g`, l. 781-799).
7. `onSearchSubmit(résultats, valeurDuChamp || "", libelléSpécialité | undefined, coords | null, codePostal | null)`.
8. Erreur → `alert("Une erreur est survenue lors de la recherche. Veuillez réessayer.")`. Dans tous les cas, chargement = faux.

### 4.6 Contrat `onSearchSubmit` côté page (`PAGE` fonction `R`, l. 436-488)

| Cas | Effet |
|---|---|
| champ vide **et** spécialité choisie | stocke les résultats en `sessionStorage` (`searchResults`, `searchQuery=""`, `searchCoords=""`, `searchSpecialisation`, `navigationFromSearch="true"`) puis `router.push("/<slug spécialité>")` (ex. `/dermatologues`) |
| champ non vide et ≥ 1 résultat | construit le fil d'Ariane à partir du **premier résultat** (région, département, ville, code postal — voir `breadcrumb.md` §4.2) puis `router.push` vers l'URL slugifiée (ex. `/provence-alpes-cote-d-azur/alpes-maritimes/nice`, préfixée par le slug de spécialité si choisie) ; mêmes clés `sessionStorage` |
| champ non vide et 0 résultat | la page passe en vue « résultats » (liste vide) **sans navigation** ◇ (déduit du code) |
| champ vide et pas de spécialité | vue accueil + `router.push("/")` |

Slug : minuscules, suppression des diacritiques (NFD), toute suite de caractères non `[a-z0-9]` → `-`, tirets de bord supprimés (`SPEC` module 1506 fonction `_`).

---

## 5. Textes exacts

| Emplacement | Texte |
|---|---|
| Bouton spécialité (défaut) | `Spécialités médicales` |
| Items | `Généraliste` · `Dermatologue` · `Pédiatre` · `Ophtalmologue` · `Gériatre` · `Pneumologue` |
| Coche | `✓` (U+2713) |
| Lien de réinitialisation | `Effacer le filtre` |
| Placeholder | `Ville / Code postal` (espaces simples autour de « / ») — `JS` l. 598 |
| `title` croix | `Effacer la recherche` |
| `title` géolocalisation | `Me géolocaliser` |
| Bouton submit | `Recherche` ; en chargement `Recherche...` (trois points ASCII) |
| Alertes | voir §4.4 et §4.5 (apostrophes droites U+0027) |

(Variante `country="US"` présente dans le code — « Medical specialties », « City / ZIP code », « Search »… — jamais utilisée par les pages FR.)

---

## 6. Liste de suggestions `.pac-container` (autocomplétion)

CSS de l'original (`PAC`, intégral) appliqué au conteneur que Google ajoute à la fin du `<body>` (`div.pac-container.pac-logo`, `OUT` home dernière ligne) :

| Sélecteur | Déclarations | Source |
|---|---|---|
| `.pac-container` | `background-color:#ffffff; border:1px solid #e5e7eb; border-radius:.5rem; box-shadow:0 10px 15px -3px rgb(0 0 0/.1),0 4px 6px -4px rgb(0 0 0/.1); margin-top:.25rem; font-family:inherit; z-index:9999` | `PAC` |
| `.pac-container:after` | `display:none` (pas de logo « powered by Google » — confirmé sur la capture) | `PAC` |
| `.pac-item` | `padding:.75rem 1rem; cursor:pointer; border-top:1px solid #f3f4f6; line-height:1.5; font-size:.875rem; transition:background-color .15s ease` | `PAC` |
| `.pac-item:first-child` | `border-top:none` | `PAC` |
| `.pac-item-selected, .pac-item:hover` | `background-color:#f9fafb` | `PAC` |
| `.pac-icon` | 20×20, `margin-right:.75rem`, pictogramme « map-pin » vert `#0F352D` en data-URI | `PAC` |
| `.pac-icon-marker` | `display:none` → **aucune icône visible** (l'icône Google porte les deux classes) | `PAC` ; capture |
| `.pac-item-query` | `color:#111827; font-weight:500; font-size:.875rem` | `PAC` |
| `.pac-matched` | `font-weight:600; color:#0F352D` (partie correspondant à la saisie) | `PAC` |
| `.pac-item-query + span` | `color:#6b7280; font-size:.8125rem` (texte secondaire « France ») | `PAC` |
| `.pac-logo:after` | `opacity:.6; margin:.5rem 1rem` (sans effet visible) | `PAC` |
| `@media (max-width:640px)` | `.pac-container{max-width:calc(100vw - 2rem)}` ; `.pac-item{padding:.625rem .875rem}` | `PAC` |

Mesures sur `autocomplete-open-1440.png` (pixels) :
- conteneur : bordure haute y 417 (= bas du champ 413 + 4 px de `margin-top`), bordure basse y 557 ; bords gauche/droit x 387 / 1042 → **même largeur et même x que le champ** (Google aligne le conteneur sur l'input) ;
- items ≈ 45 px (12 + 21 + 12) séparés par 1 px `#f3f4f6` (y 464, 510) ; 3 suggestions pour « Nice » ;
- texte : requête en 14 px, partie correspondante « Nice » en 600 `#0F352D`, reste de la requête (« y », « y-sur-Aire ») en 500 `#111827`, puis « France » 13 px `#6b7280` après une espace ;
- police héritée du `body` (Plus Jakarta Sans).

Styles Google de base non surchargés (position absolue, `overflow:hidden`, `white-space:nowrap`, `text-overflow:ellipsis` sur `.pac-item`) : non capturés dans le dépôt — à reproduire d'après la capture.

Structure d'un item Google (pour réutiliser le CSS tel quel) : `<div class="pac-item"><span class="pac-icon pac-icon-marker"></span><span class="pac-item-query"><span class="pac-matched">Nice</span></span><span>France</span></div>` ; item survolé/sélectionné au clavier : classe `pac-item-selected`.

## 7. Incertitudes

- ◇ Texte exact écrit par Google dans le champ après sélection (« Nice, France » attendu) non relevé dans les captures.
- ◇ Enchaînement exact quand on presse Entrée alors que la liste Google est ouverte (mélange submit natif / `place_changed`).
- Le cas « 0 résultat avec champ non vide » n'a pas été observé en direct.
