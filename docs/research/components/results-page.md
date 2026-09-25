# Spécification — Gabarit « page de résultats »

> Gabarit servi pour `/fr/france-FR/<ville>/results`, `/<région>/<département>/<ville>`, `/<région>/<département>`, `/<région>`, `/<…>/<code postal>` et toutes ces formes préfixées par un slug de spécialité (`/dermatologues/…`). Référence capturée : `https://teleconsultation.tessan.io/fr/france-FR/nice/results`, horloge figée au **vendredi 25/09/2026 15:00 Europe/Paris** (`tools/capture.mjs` → `FIXED_TIME`).
>
> Composants enfants spécifiés à part : carte de pharmacie → `pharmacy-card.md` ; statut d'ouverture → `opening-status.md` ; carte Google → `map.md` ; modale de réservation → `booking-modal.md` ; formulaire de recherche (module 5915) → `search-form.md` ; fil d'Ariane → `breadcrumb.md` (le §7 ci-dessous en donne l'algorithme côté page) ; en-tête → `header.md` ; pied de page → `footer.md`. Ces composants ne sont décrits ici que dans la mesure où la page les pilote.

## 0. Sources (alias utilisés dans tout le document)

| Alias | Fichier |
|---|---|
| [CSS] | `docs/research/css/323d88a92ac6be07.css` (Tailwind v4.1.14 compilé) |
| [C375] [C768] [C1440] | `docs/research/pages/results/computed-{375,768,1440}.json` (URL `/fr/france-FR/nice/results`) |
| [OUT] | `docs/research/pages/specialty-city/outline.txt` (URL `/dermatologues/provence-alpes-cote-d-azur/alpes-maritimes/nice`) |
| [JS128] | `docs/research/js/pretty/128-230074a16c9361a5.js` (module 2128 = composant page ; module 9306 = section résultats) |
| [JS990] | `docs/research/js/pretty/990-ede1d18ec8eaf918.js` (45 départements/régions, 1506 URL, 4173 données, 7864 spécialités) |
| [JS467] | `docs/research/js/pretty/467-4c092da56609776e.js` (2785 fil d'Ariane, 5915 formulaire de recherche) |
| [ROUTE] | `docs/research/js/app_%5B...location%5D_page-dd2d5ccd760c83a1.js` (aiguillage de la route catch-all) |
| [META] | `docs/reference/capture-meta.json` (titres/descriptions capturés) |
| [HOV] | `docs/research/hover-states.json` |
| [TOK] | `docs/research/tokens.json` |
| [PNG] | `docs/reference/results-{375,768,1440}.png`, `docs/reference/states/unknown-city-1440.png` |

Conversion des unités Tailwind : `--spacing: .25rem` = 4 px ([CSS] `@layer theme`), `--radius: .625rem` = 10 px ([CSS] `:root`), `rounded-md` = `calc(var(--radius) - 2px)` = 8 px ([CSS]).

---

## 1. Aiguillage de la route (catch-all `app/[...location]`)

Source : [ROUTE] (composant `7853`).

```
segments = params.location            // tableau des segments d'URL
si segments.length >= 2 :
    avantDernier = segments[len-2], dernier = segments[len-1]
    si Number(avantDernier) est un nombre (!isNaN)            → FICHE (bundle 541)
    ou si avantDernier === "pharmacie" et dernier numérique   → FICHE
sinon                                                           → PAGE (module 2128 = accueil/résultats)
```

- `/provence-alpes-cote-d-azur/alpes-maritimes/nice/557/pharmacie-saint-barthelemy` → avant-dernier `557` numérique → fiche.
- `/fr/france-FR/nice/results` → avant-dernier `nice` → page (résultats).
- La page `/` utilise le même composant 2128 (mode accueil).

---

## 2. Ordre des sections (mode « résultats »)

Le composant 2128 a deux rendus : **mode accueil** (`k === true`) et **mode résultats** (`k === false`) ([JS128] l.544-891). Ce gabarit = mode résultats :

| # | Élément | Classes racine | Source |
|---|---|---|---|
| 0 | Header (layout, hors page) | `bg-white shadow-sm border-b border-gray-200 top-0 z-50` — hauteur 81 px (80 + bordure 1) | [C1440] `header:16` |
| 1 | Section « héros » : fil d'Ariane, h1, paragraphe, carte de recherche | `section.p-6.bg-slate-50 > div.max-w-[1328px].mx-auto` | [JS128] l.661-883 |
| 2 | Section résultats (module 9306) : h2 compteur + grille liste/carte | `div.bg-slate-50.p-6.pb-12` | [JS128] l.918-992 |
| 3 | Section « à proximité » : départements puis régions | `div.bg-slate-50.p-6.pb-12` | [JS128] l.14-247 |
| 4 | Footer (layout) | `footer.bg-[#0f352d].text-white` | [C1440] `footer:18` |

Enveloppe : `<div><main>…</main></div>` ([JS128] l.524-526). Pas de bascule liste/carte, pas de pagination, pas de filtre supplémentaire (tous les résultats sont rendus dans la liste).

---

## 3. Structure DOM exacte (mode résultats)

Les chaînes de classes sont copiées de [JS128]/[JS467] et confirmées par [OUT] / [C1440].

```html
<div>
 <main>
  <!-- 1. HÉROS -->
  <section class="p-6 bg-slate-50">
   <div class="max-w-[1328px] mx-auto">
    <nav aria-label="breadcrumb" data-slot="breadcrumb" class="hidden md:block mb-6">
     <ol data-slot="breadcrumb-list" class="text-muted-foreground flex flex-wrap items-center gap-1.5 text-sm break-words sm:gap-2.5">
      <li data-slot="breadcrumb-item" class="inline-flex items-center gap-1.5">
       <button data-slot="breadcrumb-link" class="hover:text-foreground transition-colors hover:underline cursor-pointer">Trouver un dispositif de téléconsultation</button>
      </li>
      <li data-slot="breadcrumb-separator" role="presentation" aria-hidden="true" class="[&>svg]:size-3.5"><svg class="lucide lucide-chevron-right"/></li>
      <!-- item spécialité : BreadcrumbPage (span) ou bouton, voir §7 -->
      <li data-slot="breadcrumb-item" class="inline-flex items-center gap-1.5">
       <span data-slot="breadcrumb-page" role="link" aria-disabled="true" aria-current="page" class="text-foreground font-normal">Spécialités médicales</span>
      </li>
      <!-- puis, pour chaque item de localisation : séparateur + item ; le dernier est un span breadcrumb-page -->
     </ol>
    </nav>
    <h1 class="text-center text-3xl text-gray-800 mb-5">Les dispositifs de téléconsultation Tessan <span class="text-tessan-green-hover">autour de vous</span></h1>
    <p class="text-center text-gray-600 mb-10">Tessan, c'est une téléconsultation augmentée par des dispositifs médicaux connectés (stéthoscope, thermomètre, tensiomètre, dermatoscope...) pour un examen fiable, accompagné sur place par un professionnel de santé.</p>
    <div class="mx-auto bg-white p-6 md:p-8 rounded-lg shadow-lg">
     <form class="flex flex-col lg:flex-row gap-4 md:gap-[1.2rem] items-stretch"> … formulaire de recherche (module 5915, props inline=true) … </form>
    </div>
   </div>
  </section>

  <!-- 2. RÉSULTATS (module 9306, showList=true) -->
  <div class="bg-slate-50 p-6 pb-12">
   <div class="max-w-[1328px] mx-auto">
    <div class="bg-white p-6 md:p-8 rounded-lg shadow-lg">
     <h2 class="text-center text-2xl text-gray-800 mb-6 font-bold">5 dispositifs de téléconsultation Tessan autour de vous</h2>
     <div class="grid grid-cols-1 lg:grid-cols-[35%_1fr] gap-5">
      <div class="flex flex-col gap-6 overflow-y-auto max-h-[calc(3*280px+2*24px)]">
       <!-- PharmacyCard × N (key = pharmacy.id), voir pharmacy-card.md -->
      </div>
      <div class="rounded-r-md overflow-hidden shadow-md h-[calc(3*280px+2*24px)] lg:sticky lg:top-24">
       <!-- MapView (pharmacies = résultats), voir map.md -->
      </div>
     </div>
    </div>
   </div>
  </div>

  <!-- 3. À PROXIMITÉ -->
  <div class="bg-slate-50 p-6 pb-12">
   <div class="max-w-[1328px] mx-auto">
    <div class="mb-8">
     <div class="bg-white rounded-lg shadow-lg p-8">
      <h2 class="text-2xl text-gray-800 mb-6" style="font-family: Recoleta, recoleta, &quot;recoleta Fallback&quot;, sans-serif">Les dispositifs de téléconsultation Tessan dans les départements à proximité</h2>
      <p class="text-gray-600 mb-6">Explorez les dispositifs disponibles dans les 10 départements les plus proches</p>
      <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
       <button class="bg-slate-50 hover:bg-tessan-green hover:text-white transition-colors rounded-lg p-4 text-center group cursor-pointer">
        <p class="font-semibold text-gray-800 group-hover:text-white mb-1">Alpes-Maritimes</p>
        <p class="text-sm text-gray-500 group-hover:text-white">15 dispositifs</p>
       </button> <!-- × 10 max -->
      </div>
     </div>
    </div>
    <div>
     <div class="bg-white rounded-lg shadow-lg p-8">
      <h2 class="text-2xl text-gray-800 mb-6" style="font-family: Recoleta, …">Les dispositifs de téléconsultation Tessan dans les régions à proximité</h2>
      <p class="text-gray-600 mb-6">Explorez les dispositifs disponibles dans les 10 régions les plus proches</p>
      <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4"> … même bouton … </div>
     </div>
    </div>
   </div>
  </div>
 </main>
</div>
```

Remarques :
- Les textes capturés par l'outil (`( 0.0 km )`, `06100  Nice`, `5 dispositif s …`, `15  dispositifs`) contiennent des espaces **artificiels** : `tools/recon/dump-styles.js` joint les nœuds texte par `' '`. Rendu réel : `(0.0 km)`, `06100 Nice `, `5 dispositifs …`, `15 dispositifs` (JSX [JS128] l.945-948, l.171-173).
- `h1`–`h6` héritent de la règle de base [CSS] `h1,h2,h3,h4,h5,h6{font-family:"Recoleta",var(--font-recoleta),sans-serif;font-weight:400}` ; le corps : `body{font-family:"Plus Jakarta Sans",var(--font-plus-jakarta),sans-serif}` [CSS].

---

## 4. Valeurs résolues par viewport (mesurées)

### 4.1 Boîtes principales (x, y, largeur × hauteur en px)

| Élément | 375 × 812 [C375] | 768 × 1024 [C768] | 1440 × 900 [C1440] |
|---|---|---|---|
| `section.p-6.bg-slate-50` (héros) | 0, 81 — 375 × 572 | 0, 81 — 768 × 560.4 | 0, 81 — 1440 × 344 |
| `div.max-w-[1328px]` (héros) | 24, 105 — 327 × 524 | 24, 105 — 720 × 512.4 | 56, 105 — 1328 × 296 |
| `nav` fil d'Ariane | **absent** (`hidden md:block`) | 24, 105 — 720 × 50 (2 lignes) | 56, 105 — 1328 × 20 |
| `h1` | 24, 105 — 327 × 108 (3 lignes) | 24, 179 — 720 × 72 (2 lignes) | 56, 149 — 1328 × 36 |
| `p` intro | 24, 233 — 327 × 144 (6 lignes) | 24, 271 — 720 × 72 | 56, 205 — 1328 × 48 |
| carte de recherche | 24, 417 — 327 × 212 | 24, 383 — 720 × 234.4 | 56, 293 — 1328 × 108 |
| `form` | 48, 441 — 279 × 164 (colonne) | 56, 415 — 656 × 170.4 (colonne) | 88, 325 — 1264 × 44 (ligne) |
| section résultats `div.bg-slate-50.p-6.pb-12` | 0, 653 — 375 × 2036 | 0, 641.4 — 768 × 1988 | 0, 425 — 1440 × 1080 |
| carte blanche résultats | 24, 677 — 327 × 1964 | 24, 665.4 — 720 × 1916 | 56, 449 — 1328 × 1008 |
| `h2` compteur | 48, 701 — 279 × 96 (3 lignes) | 56, 697.4 — 656 × 32 | 88, 481 — 1264 × 32 |
| grille liste/carte | 48, 821 — 279 × 1796 | 56, 753.4 — 656 × 1796 | 88, 537 — 1264 × 888 |
| `gridTemplateColumns` | `279px` | `656px` | `442.391px 801.609px` |
| liste (colonne 1) | 48, 821 — 279 × 888 | 56, 753.4 — 656 × 888 | 88, 537 — 442.4 × 888 |
| conteneur carte | 48, **1729** — 279 × 888 (sous la liste) | 56, **1661.4** — 656 × 888 | 550.4, 537 — 801.6 × 888 |
| 1ʳᵉ carte de pharmacie | 48, 821 — 279 × 286 | 56, 753.4 — 656 × 258 | 88, 537 — 442.4 × 258 |
| section « à proximité » (départements, carte p-8) | 24, 2713 — 327 × 896 | 24, 2653.4 — 720 × 592 | 56, 1529 — 1328 × 368 |
| grille départements `gridTemplateColumns` | `123.5px 123.5px` | `208px 208px 208px` | `240px ×5` |
| hauteur document (`scrollHeight`) | 6761 | 5421 | 2956 |

Empilement mobile/tablette (< 1024 px, `grid-cols-1`) : liste (hauteur max 888) **au-dessus** de la carte (888), écart 20 px (`gap-5`) : 821 + 888 + 20 = 1729 à 375 ([C375]) ; 753.4 + 888 + 20 = 1661.4 à 768 ([C768]). À ≥ 1024 px : 2 colonnes `35% 1fr` ([CSS] `.lg\:grid-cols-\[35\%_1fr\]{grid-template-columns:35% 1fr}`) ; 35 % × 1264 = 442.4 ([C1440]).

### 4.2 Styles calculés (identiques aux 3 viewports sauf mention)

| Élément | Police | Taille / interligne | Graisse | Couleur | Autres | Source |
|---|---|---|---|---|---|---|
| section héros | Plus Jakarta Sans | 16 / 24 | 400 | fg `oklch(0.141 0.005 285.823)` | fond slate-50 `oklch(0.984 0.003 247.858)` ; padding 24 | [C1440] ; [CSS] `.p-6{padding:calc(var(--spacing)*6)}` |
| `ol` fil d'Ariane | Plus Jakarta Sans | 14 / 20 | 400 | muted-foreground `oklch(0.552 0.016 285.938)` | `gap` 10 px (≥ 640, `sm:gap-2.5`), 6 px sinon | [C1440] ; [CSS] `.sm\:gap-2\.5` |
| lien d'Ariane (`button`) | idem | 14 / 20 | 400 | muted-foreground ; survol → foreground `oklch(0.141 0.005 285.823)` + souligné | transition couleurs 0.15 s | [HOV] `breadcrumb` ; [C1440] |
| page d'Ariane (`span`) | idem | 14 / 20 | 400 | foreground `oklch(0.141 0.005 285.823)` | — | [C1440] |
| séparateur | — | icône 14 × 14 | — | muted-foreground | `[&>svg]:size-3.5` | [C1440] (li 14 × 14) |
| `h1` | Recoleta | **30 / 36** (fixe, pas de variante responsive) | 400 | gray-800 `oklch(0.278 0.033 256.848)` | `text-align:center` ; `margin-bottom:20px` | [C375]/[C768]/[C1440] |
| `h1 > span` | Recoleta | 30 / 36 | 400 | `rgb(29, 92, 77)` = `#1d5c4d` (`--tessan-green-hover`) | — | [C1440] ; [CSS] `:root --tessan-green-hover:#1d5c4d` |
| `p` intro | Plus Jakarta Sans | 16 / 24 | 400 | gray-600 `oklch(0.446 0.03 256.802)` | centré ; `margin-bottom:40px` | [C1440] |
| carte de recherche | — | — | — | fond `#fff` | padding 24 (< 768) / 32 (≥ 768) ; radius 10 ; ombre `shadow-lg` = `0 10px 15px -3px #0000001a, 0 4px 6px -4px #0000001a` | [C375]/[C1440] ; [CSS] `.shadow-lg` |
| section résultats | — | — | — | fond slate-50 | padding 24 24 **48** 24 | [C1440] ; [CSS] `.pb-12` |
| carte blanche résultats | — | — | — | `#fff` | padding 24 (< 768) / 32 (≥ 768) ; radius 10 ; `shadow-lg` | [C375]/[C768]/[C1440] |
| `h2` compteur | Recoleta | 24 / 32 | **700** | gray-800 | centré ; `margin-bottom:24px` | [C1440] |
| grille | — | — | — | — | `gap:20px` | [C1440] ; [CSS] `.gap-5` |
| liste | — | — | — | — | `display:flex; flex-direction:column; gap:24px; overflow-y:auto; max-height:888px` | [C1440] ; [CSS] `.max-h-\[calc\(3\*280px\+2\*24px\)\]{max-height:888px}` |
| conteneur carte | — | — | — | — | `height:888px; overflow:hidden; border-radius:0 8px 8px 0; box-shadow: 0 4px 6px -1px #0000001a, 0 2px 4px -2px #0000001a` ; ≥ 1024 : `position:sticky; top:96px` | [C1440] ; [CSS] `.h-\[calc\(3\*280px\+2\*24px\)\]{height:888px}`, `.shadow-md`, `.lg\:top-24` |
| carte « à proximité » | — | — | — | `#fff` | padding 32 à tous viewports ; radius 10 ; `shadow-lg` ; bloc départements `margin-bottom:32px` (`mb-8`) | [C1440]/[C375] |
| `h2` « à proximité » | Recoleta | 24 / 32 | **400** | gray-800 | aligné à gauche ; `margin-bottom:24px` | [C1440] |
| `p` « Explorez… » | Plus Jakarta Sans | 16 / 24 | 400 | gray-600 | `margin-bottom:24px` | [C1440] |
| bouton département/région | Plus Jakarta Sans | 16 / 24 | 400 | — | fond slate-50 ; padding 16 ; radius 10 ; centré ; transition 0.15 s ; survol : fond `#0f352d`, texte blanc | [C1440] ; [HOV] `dept-card` |
| nom dép./région | idem | 16 / 24 | 600 | gray-800 → blanc au survol du bouton (`group-hover`) | `margin-bottom:4px` | [C1440] |
| compteur dép./région | idem | 14 / 20 | 400 | gray-500 `oklch(0.551 0.027 264.364)` → blanc au survol | — | [C1440] |

Note « sticky » : la grille aligne les deux colonnes sur la même rangée de 888 px ; la carte ayant la même hauteur que la rangée, `lg:sticky lg:top-24` n'a aucun effet visible (déduit du CSS : l'élément collant ne peut pas se déplacer dans une rangée de même hauteur que lui ; non testé en défilement).

---

## 5. Algorithme d'analyse de l'URL (chargement direct)

Source : [JS128] l.270-435 ; helpers [JS990] module 1506 (l.438-473), module 45 (l.5-224), module 4173 (l.513-892), module 7864 (l.2475-2562).

### 5.1 Helpers

| Helper | Définition exacte |
|---|---|
| `slugify(s)` (1506 `_`) | `s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g,"").replace(/[^a-z0-9]+/g,"-").replace(/^-+\|-+$/g,"")` — ex. « Provence-Alpes-Côte d'Azur » → `provence-alpes-cote-d-azur` |
| `matchSlug(segment, liste)` (1506 `r5`) | premier élément de `liste` dont `slugify(élément) === slugify(segment)`, sinon `null` |
| `buildPath(items, specialtySlug)` (1506 `vR`) | `"/" + [specialtySlug] + items.map(i => slugify(i.label))` joints par `/` ; `"/"` si vide et sans spécialité |
| `parsePath(pathname)` (1506 `yP`) | segments non vides ; si `segments[0]` ∈ slugs de spécialités → `{specialtySlug: segments[0], locationSegments: segments.slice(1)}` sinon `{specialtySlug: null, locationSegments: segments}` |
| `deptCode(cp)` (45 `aZ`) | `""` si `cp` < 2 car. ; si `cp` commence par `"20"` : 3ᵉ car. `"0"` ou `"1"` → `"2A"`, sinon `"2B"` ; sinon `cp.substring(0,2)` |
| `regionOf(cp)` (45 `pG`) | `REGIONS[deptCode(cp)] \|\| ""` |
| `deptName(cp)` (45 `hl`) | `DEPTS[deptCode(cp)] \|\| deptCode(cp)` (les DOM « 97x » renvoient `"97"`, région `""`) |
| `haversine(a,b)` (4173 `m`) | rayon **6371 km**, formule `2·atan2(√s, √(1−s))·6371` |

Spécialités (7864, [JS990] l.2483-2540) :

| id | slug d'URL | libellé (`label`) | catégories acceptées (`specialisations`) |
|---|---|---|---|
| medecine-generaliste | `medecins-generalistes` | Généraliste | Médecin généraliste |
| dermatologie | `dermatologues` | Dermatologue | Dermatologue, Dermatologiste, Dermatologue pédiatrique, Allergologue |
| pediatrie | `pediatres` | Pédiatre | Pédiatre, Pediatrician |
| ophtalmologie | `ophtalmologistes` | Ophtalmologue | Ophtalmologiste, Ophtalmologiste pédiatrique, Orthoptiste |
| geriatrie | `geriatres` | Gériatre | Gériatre, Gériatre pédiatrique |
| pneumologie | `pneumologues` | Pneumologue | Pneumologue, Pneumologue pédiatrique, pneumologist, Pneumologie |

Filtre spécialité `filterBySpecialty(list, labelOuSlug)` (7864 `OX`) : garde les pharmacies dont `services` (= `[categorie_principale, categorie_secondaire_1…6]` non vides, ou `["Téléconsultation Tessan"]` si tous vides — 4173 l.540-549) contient au moins une des `specialisations`.

### 5.2 Étapes (dans l'ordre)

```
à chaque changement de pathname (effet [searchParams, initialisé, pathname]) :
0. si pathname déjà traité (ref === pathname) et pathname !== "/" → ne rien faire.
1. si sessionStorage.navigationFromSearch === "true" (et pathname !== "/") :
      résultats  = JSON.parse(sessionStorage.searchResults)
      requête    = sessionStorage.searchQuery || ""
      coords     = JSON.parse(sessionStorage.searchCoords) si non vide, sinon null
      spécialité = sessionStorage.searchSpecialisation || ""
      supprimer les 5 clés (searchResults, searchQuery, searchCoords, searchSpecialisation, navigationFromSearch)
      → MODE RÉSULTATS avec ces valeurs telles quelles ; FIN.
2. {specialtySlug, locationSegments} = parsePath(pathname) ; spec = spécialité du slug (ou null).
3. si spec et locationSegments vide (ex. /dermatologues) :
      résultats = filterBySpecialty(TOUTES, spec.label) ; requête = "" ; coords = null
      → MODE RÉSULTATS (ordre = ordre base, aucune distance). FIN.
4. si locationSegments non vide :
      toutes = toutes les pharmacies actives (ordre base : nom_etablissement ASC)
      dernier = locationSegments[last]
      si /^\d{5}$/.test(dernier) : requête = dernier ; liste = toutes.filter(cp === dernier)
      sinon, pour i de last à 0 (du DERNIER segment vers le premier) :
          a. ville = matchSlug(seg, toutes.map(p => p.ville).filter(Boolean))
             si ville : requête = ville ; liste = toutes.filter(p.ville.toLowerCase() === ville.toLowerCase()) ; STOP
          b. dép = matchSlug(seg, noms des 96 départements)
             si dép : requête = dép ; liste = toutes.filter(deptName(p.cp) === dép) ; STOP
          c. rég = matchSlug(seg, noms des 13 régions)
             si rég : requête = rég ; liste = toutes.filter(regionOf(p.cp) === rég) ; STOP
      si requête non vide ET liste non vide :
          centre = liste[0].coordonnees                       // 1er élément dans l'ordre base
          liste  = sortByDistance(liste, centre)              // 4173 FD, voir §6
          liste  = await applyMinimumResults(liste, centre)   // 4173 X$, voir §6.2
          t = spec?.label || searchParams.get("specialisation")
          si t : liste = filterBySpecialty(liste, t) ; spécialité = t ;
                 si le paramètre ?specialisation était présent : history.replaceState({}, "", pathname)
          → MODE RÉSULTATS (résultats = liste, requête, coords = centre)
      sinon → MODE ACCUEIL avec toutes les pharmacies (repli « ville inconnue », §10)
      en cas d'exception → MODE ACCUEIL avec toutes les pharmacies
5. pathname === "/" : mode accueil (hors périmètre).
```

Conséquences à reproduire :
- Les segments `fr`, `france-FR`, `results` ne correspondent à rien et sont ignorés ; seul `nice` matche (ville « Nice »).
- Priorité par segment : **ville > département > région**, en partant du dernier segment. `/ile-de-france/paris` matche la *ville* Paris.
- `/provence-alpes-cote-d-azur/alpes-maritimes` (pas de ville) → département « Alpes-Maritimes ».
- Un code postal n'est reconnu que s'il est le **dernier** segment.
- Recharger une page atteinte via la recherche (sessionStorage) recalcule les résultats **à partir de l'URL** (filtre par ville) : le contenu peut différer de celui obtenu juste après la recherche.

---

## 6. Ordre des résultats et règle du minimum

### 6.1 Tri par distance (`FD`, [JS990] l.601-620)

```
sortByDistance(liste, centre):
  pour chaque p : d = haversine(centre, p) ; p.distance = d.toFixed(1) + " km"   // ex. "1.6 km"
  trier par parseFloat(p.distance.replace(" km","")) croissant
```
Le tri porte sur la valeur **arrondie à 0,1 km** ; les ex æquo conservent l'ordre base (tri stable). Le centre étant la 1ʳᵉ pharmacie de la liste filtrée (ordre `nom_etablissement` ASC, puis ordre d'insertion), celle-ci affiche `(0.0 km)`.

Exemple mesuré (Nice, [C1440]) : Saint Barthélémy 0.0 km · Nice Etoile 1.6 km · Grande Corniche 2.6 km · de l'Ariane 4.3 km · Saint-Isidore 5.8 km (reproduit à l'identique avec `src/data/locations.json`, où Saint Barthélémy est la 1ʳᵉ ligne niçoise).

### 6.2 Règle du minimum de résultats (`X$`, [JS990] l.781-799)

```
applyMinimumResults(liste, lat, lng):
  MIN = parseInt("3"), AJOUT = parseInt("5")
  si liste.length > 3 : retourner liste                      // 4 résultats ou plus : inchangé
  autres = toutes les pharmacies, distance calculée depuis (lat,lng), triées par distance exacte (4173 _Q)
  ajout  = autres.filter(p => !ids(liste).has(p.id)).slice(0, 5)
  retourner [...liste, ...ajout]                              // ≤ 3 résultats → + les 5 plus proches
  (en cas d'erreur : liste inchangée)
```
- Dédoublonnage par `id` = `parseInt(code_magasin)`.
- Les pharmacies ajoutées portent aussi une `distance` « x.x km » depuis le centre.
- Le filtre de spécialité (étape 4) est appliqué **après** cette règle : la liste finale peut redescendre sous 4.
- Exemple avec l'échantillon `src/data` : `/provence-alpes-cote-d-azur/alpes-maritimes/la-trinite` → Pharmacie la Trinité (0.0 km) + de l'Ariane 1.2 · Grande Corniche 4.3 · Saint Barthélémy 5.5 · Nice Etoile 6.1 · PHARMACIE DE FAMAJOR (Tourrette-Levens) 6.4 → **6** résultats, h2 « 6 dispositifs de téléconsultation Tessan autour de vous ».

### 6.3 Autres provenances des résultats (arrivée via sessionStorage)

| Déclencheur | Résultats stockés | Ordre |
|---|---|---|
| Soumission du formulaire avec lieu choisi dans l'autocomplétion, géolocalisation, ou texte géocodé « <texte>, France » (module 5915, [JS467] l.355-452) | toutes les pharmacies triées par distance au point (4173 `_Q`), `.slice(0, 20)` ; puis filtre code postal (si l'adresse choisie en a un), filtre spécialité, puis `applyMinimumResults` | distance exacte croissante, distances affichées |
| Soumission d'un texte non géocodable (échec du géocodeur) | recherche `ville ILIKE %texte%` (4173 `I9`), puis filtres | ordre base, **sans distance** |
| Soumission avec champ vide | toutes les pharmacies (+ filtre spécialité) ; navigation `/` (ou `/<slug-spécialité>` si une spécialité est choisie) | ordre base |
| Soumission d'un nom exact de région/département (insensible à la casse) | `filter(regionOf/deptName === nom)` ; point = géocodage « <nom>, France » (mis en cache) | ordre base **sans tri ni distance** ; la règle du minimum n'ajoute des pharmacies (avec distance) que si ≤ 3 résultats |
| Clic sur un bouton département/région (§9) | filtre + `sortByDistance` depuis la 1ʳᵉ + règle du minimum ([JS128] l.489-523) | distance arrondie |
| Clic sur un marqueur de la carte d'accueil | pharmacies à **≤ 10 km** du marqueur cliqué, `sortByDistance` depuis celui-ci ; **pas** de règle du minimum ([JS128] l.610-650) | distance arrondie |

La page de destination est calculée par `R` ([JS128] l.436-488) : items d'Ariane (§7) → `buildPath(items, slugSpécialité)`, écriture de `searchResults`, `searchQuery`, `searchCoords`, `searchSpecialisation`, `navigationFromSearch="true"` dans `sessionStorage`, puis `router.push(chemin)`. Sans requête ni spécialité → `router.push("/")`. Avec spécialité seule → `router.push("/" + slugSpécialité)`.

---

## 7. Fil d'Ariane

Source : [JS128] l.666-846 ; primitives shadcn [JS467] l.5-78. Visible uniquement ≥ 768 px (`hidden md:block`).

### 7.1 Construction

1. Item fixe : **bouton** « Trouver un dispositif de téléconsultation » → `router.push("/")` puis `window.scrollTo({top:0, behavior:"smooth"})`.
2. Séparateur (`ChevronRight` lucide, 14 × 14).
3. Item spécialité :
   - aucune spécialité → **span** (page) « Spécialités médicales » (couleur foreground, donc plus foncé que les liens — visible sur [PNG] 1440) ;
   - spécialité + requête + résultats non vides → **bouton** `<label>` → `router.push("/" + slug)` + défilement en haut (ex. « Dermatologue » → `/dermatologues`, [OUT]) ;
   - spécialité sans localisation → **span** `<label>`.
4. Si requête `f` non vide et résultats non vides — `r0 = résultats[0]`, `région = regionOf(r0.cp)`, `dép = deptName(r0.cp)`, `o = f.split(",")[0].trim()` :

| Cas | Items ajoutés (dans l'ordre) |
|---|---|
| `o` = code postal (5 chiffres) | région (si non vide) ; si `r0.ville` et `dép` et `dép ≠ ville` (insensible à la casse) : département puis ville ; sinon ville si présente, sinon département ; puis `o` (code postal) |
| `o` = nom de région | `o` |
| `o` = nom de département | région (si non vide) ; `o` |
| sinon (ville) | région (si non vide) ; département si `dép.toLowerCase() ≠ o.toLowerCase()` ; `o` |

5. Chaque item est précédé d'un séparateur. Le **dernier** est un `span` page ; les autres sont des boutons dont le clic fait `router.push(buildPath(items.slice(0, index+1), slugSpécialité))` + `scrollTo` fluide.

Exemples :
- `/fr/france-FR/nice/results` → Trouver un dispositif de téléconsultation › **Spécialités médicales** › Provence-Alpes-Côte d'Azur › Alpes-Maritimes › **Nice** ([C1440] l.17-30). Le bouton « Alpes-Maritimes » mène à `/provence-alpes-cote-d-azur/alpes-maritimes`.
- `/dermatologues/provence-alpes-cote-d-azur/alpes-maritimes/nice` → … › Dermatologue (bouton → `/dermatologues`) › Provence-Alpes-Côte d'Azur (→ `/dermatologues/provence-alpes-cote-d-azur`) › Alpes-Maritimes › Nice ([OUT] l.5-24).
- Paris : département « Paris » = ville « Paris » → pas d'item département.

### 7.2 Classes et états

| Partie | Classes | État survol | Source |
|---|---|---|---|
| `nav` | `hidden md:block mb-6` | — | [JS128] l.667 |
| `ol` | `text-muted-foreground flex flex-wrap items-center gap-1.5 text-sm break-words sm:gap-2.5` | — | [JS467] l.33 |
| `li` item | `inline-flex items-center gap-1.5` | — | [JS467] l.43 |
| bouton lien | `hover:text-foreground transition-colors hover:underline cursor-pointer` (fusion de `hover:text-foreground transition-colors` + `hover:underline cursor-pointer`) | couleur `oklch(0.552 0.016 285.938)` → `oklch(0.141 0.005 285.823)` + `text-decoration: underline` | [HOV] `breadcrumb` ; captures `hover-breadcrumb-{before,after}-1440.png` |
| `span` page | `text-foreground font-normal` + `role="link" aria-disabled="true" aria-current="page"` | aucun | [JS467] l.56-66 |
| séparateur | `li[role=presentation][aria-hidden=true].[&>svg]:size-3.5` contenant `lucide-chevron-right` (24 → 14 px) | — | [JS467] l.67-77 |

À 768 px le fil passe sur 2 lignes (hauteur 50 = 20 + 10 + 20) ([C768]).

---

## 8. Textes exacts

| Emplacement | Texte |
|---|---|
| h1 | `Les dispositifs de téléconsultation Tessan ` + span `autour de vous` |
| p intro | `Tessan, c'est une téléconsultation augmentée par des dispositifs médicaux connectés (stéthoscope, thermomètre, tensiomètre, dermatoscope...) pour un examen fiable, accompagné sur place par un professionnel de santé.` (trois points ASCII `...`) |
| h2 compteur | `{N} dispositif{N > 1 ? "s" : ""} de téléconsultation Tessan autour de vous` — ex. `5 dispositifs …`, `1 dispositif …`, `0 dispositif …` |
| h2 départements | `Les dispositifs de téléconsultation Tessan dans les départements à proximité` |
| p départements | `Explorez les dispositifs disponibles dans les {n} départements les plus proches` |
| h2 régions | `Les dispositifs de téléconsultation Tessan dans les régions à proximité` |
| p régions | `Explorez les dispositifs disponibles dans les {n} régions les plus proches` |
| compteur bouton | `{count} dispositifs` si count > 1, sinon `{count} dispositif` |
| chargement page | `Chargement...` |
| chargement « à proximité » | `Chargement...` |
| alerte (clic dép./région sans résultat) | `Aucune pharmacie trouvée pour {nom}` |
| alerte (erreur) | `Une erreur est survenue lors de la recherche. Veuillez réessayer.` |
| Ariane | `Trouver un dispositif de téléconsultation`, `Spécialités médicales` |

---

## 9. Section « départements / régions à proximité »

Source : [JS128] l.14-247.

- Point de référence : `searchCoords` (= centre des résultats) si présent, sinon **Paris (48.8566, 2.3522)** (cas `/dermatologues` sans lieu).
- Départements : regrouper **toutes** les pharmacies par `deptCode(cp)`, calculer la distance haversine moyenne au point de référence, trier croissant, garder **10**. Nom = `deptName(code + "000")` si code à 2 caractères. Régions : même calcul par `regionOf(cp)` (clé vide ignorée).
- Rendu : bloc départements (`div.mb-8`) puis bloc régions ; chaque bloc n'est rendu que s'il est non vide.
- Pendant le calcul : `div.bg-slate-50.p-6.pb-12 > div.max-w-[1328px].mx-auto > div.bg-white.p-6.md:p-8.rounded-lg.shadow-lg > div.text-center.py-8` avec spinner `inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-tessan-green border-r-transparent` et `p.mt-4.text-gray-600` « Chargement... ».
- Clic sur un bouton (nom) : charger toutes les pharmacies ; filtrer par région (si le nom est une région) ou département ; si ≥ 1 résultat : centre = 1er, `sortByDistance`, `applyMinimumResults`, navigation `R` vers `/<slug-région>` ou `/<slug-région>/<slug-département>` + `window.scrollTo({top:0, behavior:"smooth"})` ; sinon `alert("Aucune pharmacie trouvée pour <nom>")`.
- Valeurs mesurées (Nice, 1440, [C1440] l.159-223) : départements Alpes-Maritimes 15, Var 47, Alpes-de-Haute-Provence 10, Hautes-Alpes 6, Bouches-du-Rhône 39, Vaucluse 27, Haute-Corse 8, Drôme 26, Gard 33, Isère 31 ; régions PACA 144, Corse 11, Auvergne-Rhône-Alpes 195, Bourgogne-Franche-Comté 102, Occitanie 198, Grand Est 169, Nouvelle-Aquitaine 183, Centre-Val de Loire 66, Île-de-France 211, Pays de la Loire 97 (jeu complet de 1 807 lignes ; avec l'échantillon `src/data` les chiffres seront différents).
- Boutons : 5 colonnes × 240 px (1440), 3 × 208 (768), 2 × 123.5 (375) ; hauteur 80 px (nom sur 1 ligne) ou 104 px (nom sur 2 lignes, les autres boutons de la rangée s'étirent) ([C1440] l.159-188).

---

## 10. États de la page

| État | Rendu | Source |
|---|---|---|
| Chargement initial (`w === true`) | `div.flex.items-center.justify-center.min-h-screen.bg-slate-50 > div.text-center` : spinner `inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-tessan-green border-r-transparent` + `p.mt-4.text-lg.text-gray-600` « Chargement... » (même rendu en fallback `Suspense`) | [JS128] l.526-543, l.895-915 |
| Résultats (cas nominal) | §3 | — |
| Ville/lieu inconnu (aucun segment ne matche, ou 0 pharmacie) | **mode accueil** sur l'URL demandée (l'URL n'est pas modifiée) : h1 `text-center text-2xl md:text-3xl text-gray-800 mb-8 mt-3 md:mt-5`, paragraphe h5 enrichi, carte de recherche vide, carte seule de toutes les pharmacies (hauteur `calc(100vh-400px)` min 600), sections « à proximité » depuis Paris. Ex. `/fr/france-FR/choisy-le-roi/results` (aucune pharmacie à Choisy-le-Roi) | [JS128] l.394, l.545-658 ; [PNG] `states/unknown-city-1440.png` ; `docs/progress.md` |
| 0 résultat après filtre de spécialité | mode résultats : h2 « 0 dispositif de téléconsultation Tessan autour de vous », liste vide, carte au centre France zoom 6 (pas de `fitBounds`) | [JS128] l.945-948 ; [JS990] l.2652 |
| Spécialité seule (`/dermatologues`) | mode résultats, toutes les pharmacies de la spécialité en ordre base, **sans distance** (pas de lien « (x km) »), Ariane « … › Dermatologue » (span), sections « à proximité » depuis Paris | [JS128] l.312-330 |

Le changement de `results` réinitialise la pharmacie focalisée (`useEffect(() => setFocused(null), [results])`, [JS128] l.927-929).

---

## 11. Formulaire de recherche dans la carte « héros » (contrat)

Rendu `inline` du module 5915 ([JS467] l.490-758) avec :
- `initialCity` = requête résolue (ex. « Nice », « Alpes-Maritimes », « 06100 ») → valeur du champ ;
- `initialSpecialtyId` = `id` de la spécialité courante (sinon `null`) → bouton spécialité plein (`border-tessan-green bg-tessan-green text-white`, [OUT] l.28) ; sans spécialité : `border-tessan-green-hover text-tessan-green-hover hover:bg-tessan-green-hover hover:text-white` libellé « Spécialités médicales » ;
- `onSearchSubmit = R` (§6.3), `clearCity = 0`, clé React `0` (la prop `resetFilters` n'est passée qu'en mode accueil) ([JS128] l.866-879).
Dimensions mesurées : bouton spécialité 280 × 44 (≥ 768 : `md:min-w-[280px]`), champ `flex-1`, bouton « Recherche » 288 × 44 (`md:min-w-[288px]`) à 1440 ; empilés pleine largeur (44 px chacun, écart 16 px à 375 / 19.2 px à 768) ([C375] [C768] [C1440]).

---

## 12. Titre de page et métadonnées

| URL | `<title>` | `<meta name="description">` | Source |
|---|---|---|---|
| `/fr/france-FR/nice/results` | `Téléconsultation à Nice (france-FR) - Tessan` | `Trouvez une cabine de téléconsultation à Nice. Consultez un médecin rapidement.` | [META] `results-*` |
| `/` (référence) | `Trouvez le dispositif de téléconsultation Tessan` | `Trouvez une cabine de téléconsultation en pharmacie près de chez vous et consultez un médecin en quelques minutes grâce aux dispositifs Tessan` | [META] `home-*` |

Le titre est produit côté serveur (`generateMetadata`, absent des bundles clients : aucune écriture de `document.title` dans `docs/research/js`). **Non mesuré** pour `/<région>/<département>/<ville>` et les pages spécialité. Hypothèse de reconstruction (à valider) : pour `/fr/<pays>/<ville>/results` → `Téléconsultation à {Ville} ({pays}) - Tessan` avec `{Ville}` = segment ville capitalisé (ou nom de ville trouvé dans les données) et `{pays}` = 2ᵉ segment brut ; pour les autres formes, utiliser `Téléconsultation à {nom du lieu résolu} - Tessan` et la même description.

---

## 13. Liens et navigations

| Élément | Destination | Mécanisme |
|---|---|---|
| Ariane « Trouver un dispositif… » | `/` | `router.push` + scroll top fluide |
| Ariane spécialité (bouton) | `/<slug-spécialité>` | idem |
| Ariane lieu (bouton) | `buildPath(items[0..i], slugSpécialité)` | idem |
| Bouton département | `/<slug-région>/<slug-département>` (jamais de préfixe spécialité : `T` appelle `R` sans spécialité, qui est donc effacée) | `R` + sessionStorage |
| Bouton région | `/<slug-région>` | idem |
| Carte de pharmacie « Voir plus » | `/<slug-région>/<slug-département>/<slug-ville>/<id>/<slug-nom>` (département omis si égal à la ville) | voir `pharmacy-card.md` |
| Lien distance « (x.x km) » | `https://www.google.com/maps/dir/?api=1&destination=<lat>,<lng>` (nouvel onglet) | voir `pharmacy-card.md` |

---

## Annexe A — Table départements → régions (module 45, [JS990] l.13-219)

Utilisée par `deptName`, `regionOf`, le fil d'Ariane, l'analyse d'URL et la section « à proximité ». Aucune entrée pour `20` (remplacé par 2A/2B) ni pour les DOM (97x).

| Code | Département (`hl`) | Région (`pG`) | slug département | slug région |
|---|---|---|---|---|
| 01 | Ain | Auvergne-Rhône-Alpes | ain | auvergne-rhone-alpes |
| 02 | Aisne | Hauts-de-France | aisne | hauts-de-france |
| 03 | Allier | Auvergne-Rhône-Alpes | allier | auvergne-rhone-alpes |
| 04 | Alpes-de-Haute-Provence | Provence-Alpes-Côte d'Azur | alpes-de-haute-provence | provence-alpes-cote-d-azur |
| 05 | Hautes-Alpes | Provence-Alpes-Côte d'Azur | hautes-alpes | provence-alpes-cote-d-azur |
| 06 | Alpes-Maritimes | Provence-Alpes-Côte d'Azur | alpes-maritimes | provence-alpes-cote-d-azur |
| 07 | Ardèche | Auvergne-Rhône-Alpes | ardeche | auvergne-rhone-alpes |
| 08 | Ardennes | Grand Est | ardennes | grand-est |
| 09 | Ariège | Occitanie | ariege | occitanie |
| 10 | Aube | Grand Est | aube | grand-est |
| 11 | Aude | Occitanie | aude | occitanie |
| 12 | Aveyron | Occitanie | aveyron | occitanie |
| 13 | Bouches-du-Rhône | Provence-Alpes-Côte d'Azur | bouches-du-rhone | provence-alpes-cote-d-azur |
| 14 | Calvados | Normandie | calvados | normandie |
| 15 | Cantal | Auvergne-Rhône-Alpes | cantal | auvergne-rhone-alpes |
| 16 | Charente | Nouvelle-Aquitaine | charente | nouvelle-aquitaine |
| 17 | Charente-Maritime | Nouvelle-Aquitaine | charente-maritime | nouvelle-aquitaine |
| 18 | Cher | Centre-Val de Loire | cher | centre-val-de-loire |
| 19 | Corrèze | Nouvelle-Aquitaine | correze | nouvelle-aquitaine |
| 2A | Corse-du-Sud | Corse | corse-du-sud | corse |
| 2B | Haute-Corse | Corse | haute-corse | corse |
| 21 | Côte-d'Or | Bourgogne-Franche-Comté | cote-d-or | bourgogne-franche-comte |
| 22 | Côtes-d'Armor | Bretagne | cotes-d-armor | bretagne |
| 23 | Creuse | Nouvelle-Aquitaine | creuse | nouvelle-aquitaine |
| 24 | Dordogne | Nouvelle-Aquitaine | dordogne | nouvelle-aquitaine |
| 25 | Doubs | Bourgogne-Franche-Comté | doubs | bourgogne-franche-comte |
| 26 | Drôme | Auvergne-Rhône-Alpes | drome | auvergne-rhone-alpes |
| 27 | Eure | Normandie | eure | normandie |
| 28 | Eure-et-Loir | Centre-Val de Loire | eure-et-loir | centre-val-de-loire |
| 29 | Finistère | Bretagne | finistere | bretagne |
| 30 | Gard | Occitanie | gard | occitanie |
| 31 | Haute-Garonne | Occitanie | haute-garonne | occitanie |
| 32 | Gers | Occitanie | gers | occitanie |
| 33 | Gironde | Nouvelle-Aquitaine | gironde | nouvelle-aquitaine |
| 34 | Hérault | Occitanie | herault | occitanie |
| 35 | Ille-et-Vilaine | Bretagne | ille-et-vilaine | bretagne |
| 36 | Indre | Centre-Val de Loire | indre | centre-val-de-loire |
| 37 | Indre-et-Loire | Centre-Val de Loire | indre-et-loire | centre-val-de-loire |
| 38 | Isère | Auvergne-Rhône-Alpes | isere | auvergne-rhone-alpes |
| 39 | Jura | Bourgogne-Franche-Comté | jura | bourgogne-franche-comte |
| 40 | Landes | Nouvelle-Aquitaine | landes | nouvelle-aquitaine |
| 41 | Loir-et-Cher | Centre-Val de Loire | loir-et-cher | centre-val-de-loire |
| 42 | Loire | Auvergne-Rhône-Alpes | loire | auvergne-rhone-alpes |
| 43 | Haute-Loire | Auvergne-Rhône-Alpes | haute-loire | auvergne-rhone-alpes |
| 44 | Loire-Atlantique | Pays de la Loire | loire-atlantique | pays-de-la-loire |
| 45 | Loiret | Centre-Val de Loire | loiret | centre-val-de-loire |
| 46 | Lot | Occitanie | lot | occitanie |
| 47 | Lot-et-Garonne | Nouvelle-Aquitaine | lot-et-garonne | nouvelle-aquitaine |
| 48 | Lozère | Occitanie | lozere | occitanie |
| 49 | Maine-et-Loire | Pays de la Loire | maine-et-loire | pays-de-la-loire |
| 50 | Manche | Normandie | manche | normandie |
| 51 | Marne | Grand Est | marne | grand-est |
| 52 | Haute-Marne | Grand Est | haute-marne | grand-est |
| 53 | Mayenne | Pays de la Loire | mayenne | pays-de-la-loire |
| 54 | Meurthe-et-Moselle | Grand Est | meurthe-et-moselle | grand-est |
| 55 | Meuse | Grand Est | meuse | grand-est |
| 56 | Morbihan | Bretagne | morbihan | bretagne |
| 57 | Moselle | Grand Est | moselle | grand-est |
| 58 | Nièvre | Bourgogne-Franche-Comté | nievre | bourgogne-franche-comte |
| 59 | Nord | Hauts-de-France | nord | hauts-de-france |
| 60 | Oise | Hauts-de-France | oise | hauts-de-france |
| 61 | Orne | Normandie | orne | normandie |
| 62 | Pas-de-Calais | Hauts-de-France | pas-de-calais | hauts-de-france |
| 63 | Puy-de-Dôme | Auvergne-Rhône-Alpes | puy-de-dome | auvergne-rhone-alpes |
| 64 | Pyrénées-Atlantiques | Nouvelle-Aquitaine | pyrenees-atlantiques | nouvelle-aquitaine |
| 65 | Hautes-Pyrénées | Occitanie | hautes-pyrenees | occitanie |
| 66 | Pyrénées-Orientales | Occitanie | pyrenees-orientales | occitanie |
| 67 | Bas-Rhin | Grand Est | bas-rhin | grand-est |
| 68 | Haut-Rhin | Grand Est | haut-rhin | grand-est |
| 69 | Rhône | Auvergne-Rhône-Alpes | rhone | auvergne-rhone-alpes |
| 70 | Haute-Saône | Bourgogne-Franche-Comté | haute-saone | bourgogne-franche-comte |
| 71 | Saône-et-Loire | Bourgogne-Franche-Comté | saone-et-loire | bourgogne-franche-comte |
| 72 | Sarthe | Pays de la Loire | sarthe | pays-de-la-loire |
| 73 | Savoie | Auvergne-Rhône-Alpes | savoie | auvergne-rhone-alpes |
| 74 | Haute-Savoie | Auvergne-Rhône-Alpes | haute-savoie | auvergne-rhone-alpes |
| 75 | Paris | Île-de-France | paris | ile-de-france |
| 76 | Seine-Maritime | Normandie | seine-maritime | normandie |
| 77 | Seine-et-Marne | Île-de-France | seine-et-marne | ile-de-france |
| 78 | Yvelines | Île-de-France | yvelines | ile-de-france |
| 79 | Deux-Sèvres | Nouvelle-Aquitaine | deux-sevres | nouvelle-aquitaine |
| 80 | Somme | Hauts-de-France | somme | hauts-de-france |
| 81 | Tarn | Occitanie | tarn | occitanie |
| 82 | Tarn-et-Garonne | Occitanie | tarn-et-garonne | occitanie |
| 83 | Var | Provence-Alpes-Côte d'Azur | var | provence-alpes-cote-d-azur |
| 84 | Vaucluse | Provence-Alpes-Côte d'Azur | vaucluse | provence-alpes-cote-d-azur |
| 85 | Vendée | Pays de la Loire | vendee | pays-de-la-loire |
| 86 | Vienne | Nouvelle-Aquitaine | vienne | nouvelle-aquitaine |
| 87 | Haute-Vienne | Nouvelle-Aquitaine | haute-vienne | nouvelle-aquitaine |
| 88 | Vosges | Grand Est | vosges | grand-est |
| 89 | Yonne | Bourgogne-Franche-Comté | yonne | bourgogne-franche-comte |
| 90 | Territoire de Belfort | Bourgogne-Franche-Comté | territoire-de-belfort | bourgogne-franche-comte |
| 91 | Essonne | Île-de-France | essonne | ile-de-france |
| 92 | Hauts-de-Seine | Île-de-France | hauts-de-seine | ile-de-france |
| 93 | Seine-Saint-Denis | Île-de-France | seine-saint-denis | ile-de-france |
| 94 | Val-de-Marne | Île-de-France | val-de-marne | ile-de-france |
| 95 | Val-d'Oise | Île-de-France | val-d-oise | ile-de-france |

Régions distinctes (13) : Auvergne-Rhône-Alpes, Bourgogne-Franche-Comté, Bretagne, Centre-Val de Loire, Corse, Grand Est, Hauts-de-France, Normandie, Nouvelle-Aquitaine, Occitanie, Pays de la Loire, Provence-Alpes-Côte d'Azur, Île-de-France.

---

## 14. Ambiguïtés / points non vérifiés

1. **Titres** des gabarits `/<région>/<dép>/<ville>` et spécialité : non capturés (§12).
2. **Ordre base** : la requête Supabase trie par `nom_etablissement` ; presque toutes les lignes portent « Cabine Téléconsultation Médecin Tessan », l'ordre réel des ex æquo dépend de la base. Le clone doit conserver l'ordre de `src/data/locations.json` (déjà trié de façon stable, `tools/data/build-data.py`).
3. La barre de défilement de la liste n'apparaît pas sur les captures headless (barres superposées) ; comportement natif du navigateur attendu.
4. Chiffres de la section « à proximité » : dépendants du jeu de données complet ; avec l'échantillon ils seront plus petits.
