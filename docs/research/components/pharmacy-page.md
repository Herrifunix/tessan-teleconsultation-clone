# Fiche point de vente — spec de reconstruction (`pharmacy-page`)

Page « fiche » d'un dispositif / d'une pharmacie de https://teleconsultation.tessan.io/ (Next.js App Router + Tailwind CSS v4.1.14 + shadcn/ui + lucide-react).
Exemple de référence : `/provence-alpes-cote-d-azur/alpes-maritimes/nice/557/pharmacie-saint-barthelemy`
(Pharmacie Saint Barthélémy, Nice, code magasin 557), capturée le vendredi 2026-09-25 à 15:00 heure de Paris
(`_fixedTime: 2026-09-25T13:00:00.000Z`, `docs/reference/capture-meta.json`).

Cette spec est découpée en 5 fichiers, à lire dans l'ordre :

| # | Fichier | Contenu |
|---|---------|---------|
| 1 | `pharmacy-page.md` (ce fichier) | sources, routes, états chargement / non trouvée / 429, titre, squelette et espacements, fil d'Ariane, h1, carte « Effectuer une nouvelle recherche », récapitulatif mobile/tablette, ambiguïtés |
| 2 | `pharmacy-page-main-card.md` | carte d'information principale (nom, adresse, statut, boutons), texte de statut, description, carrousel photo |
| 3 | `pharmacy-page-hours-map.md` | carte « Horaires d'ouverture » + carte Google Maps |
| 4 | `pharmacy-page-faq.md` | section « Foire Aux Questions » |
| 5 | `pharmacy-page-nearby.md` | « Les dispositifs … à proximité » (carte de pharmacie partagée), départements et régions à proximité |

Le header et le footer appartiennent au layout (hors de cette spec : `header.md`, `footer.md`). Le header mesure 81 px de haut (80 + bordure basse 1 px) à toutes les largeurs.
Composants partagés spécifiés à part (cette spec ne décrit que leur usage sur la fiche) : carte de pharmacie → `pharmacy-card.md` ;
texte de statut → `opening-status.md` ; carte géographique → `map.md` ; modale de réservation → `booking-modal.md` ; gabarit résultats (cible des liens
du fil d'Ariane, des départements et régions) → `results-page.md`.

---

## 0. Sources, abréviations, conventions

| Abréviation | Fichier |
|---|---|
| `[OUT:n]` | `docs/research/pages/fiche/outline.txt`, ligne n (DOM complet avec classes et styles inline) |
| `[C375]`, `[C768]`, `[C1440]` | `docs/research/pages/fiche/computed-{375,768,1440}.json` — chemins raccourcis : `M>` = `div:25>main:0>div:0>` |
| `[JS541:n]` | `docs/research/js/pretty/541-add46bd6cf5ba31f.js` ligne n (toute la fiche : `g` = description + carrousel, `N` = carte principale, `P` = page) |
| `[JS990:n]` | `docs/research/js/pretty/990-ede1d18ec8eaf918.js` ligne n (module 45 = régions/départements l.5-224, 91 = carte partagée l.225-437, 1506 = URL l.438-473, 3674 = canBook l.474-512, 4173 = données l.513-900, 6504 = statut l.958-1101, 9382 = carte l.2563-2960) |
| `[JS467:n]` | `docs/research/js/pretty/467-4c092da56609776e.js` (2785 = fil d'Ariane shadcn, 5299 = icône loader, 5915 = formulaire de recherche) |
| `[ROUTER]` | `docs/research/js/app_%5B...location%5D_page-dd2d5ccd760c83a1.js` (aiguillage fiche / résultats) |
| `[CSS]` | `docs/research/css/323d88a92ac6be07.css` (déclarations utilitaires exactes) |
| `[API]` | `docs/research/pages/fiche/api-pharmacies-557.json` |
| `[FAQ]` | `docs/research/pages/fiche/faq.json` |
| `[HOV]` | `docs/research/hover-states.json` |
| `[META]` | `docs/reference/capture-meta.json` |
| `[TOK]` | `docs/research/tokens.json` |
| captures | `docs/reference/fiche-{375,768,1440}.png` (état par défaut), `docs/reference/states/faq-open-1440.png` |

**Attention — FAQ ouverte dans les dumps.** Dans les trois dumps `computed-*.json` (375, 768 **et aussi 1440**), le 1er item de la FAQ est ouvert
(élément `M>section:3>div:0>div:1>div:0>div:1` présent). L'état par défaut est **tout fermé** (captures PNG). La preuve :
`scrollHeight` du dump − hauteur de la réponse ouverte = `scrollHeight` de la capture : 6218 − 89 = 6129 (1440), 9185 − 117 = 9068 (768), 13105 − 229 = 12876 (375).
Toutes les positions Y de cette spec situées après la FAQ sont **corrigées pour l'état fermé**.

Conventions :
- Rects au format `[x, y, largeur×hauteur]` en px CSS, y mesuré depuis le haut du document.
- Tailwind v4 : `--spacing: .25rem` → `p-6` = 24 px, `gap-3` = 12 px, etc. `rounded-lg` = `var(--radius)` = `.625rem` = **10 px** ; `rounded-md` = 8 px ; `rounded-full` = `3.40282e38px` [TOK radius].
- Toutes les variantes `hover:` / `group-hover:` sont compilées dans `@media (hover:hover){…}` [CSS] → aucun effet de survol sur écran tactile.
- Transitions Tailwind : durée par défaut `.15s`, courbe `cubic-bezier(.4,0,.2,1)` [TOK transition].
- `<button>` : le preflight Tailwind v4 ne met **pas** `cursor:pointer` ; seul `.cursor-pointer{cursor:pointer}` le fait [CSS]. Un bouton sans cette classe a le curseur par défaut (flèche).
- `svg` est `display:block` (preflight) ; les icônes sont des icônes **lucide** (`stroke="currentColor"`, `stroke-width="2"`, `fill="none"`, extrémités/jointures `round`), classe `lucide lucide-<nom>` ; `size` = attributs `width`/`height`.

Couleurs utilisées (valeur calculée exacte, puis équivalent hex Tailwind v4) :

| Nom | Valeur calculée | ≈ hex |
|---|---|---|
| tessan-green | `rgb(15, 53, 45)` | `#0f352d` |
| tessan-green-hover | `rgb(29, 92, 77)` | `#1d5c4d` |
| vert « Ouvert » `text-[#238700]` | `rgb(35, 135, 0)` | `#238700` |
| red-600 (« Fermé ») | `oklch(0.577 0.245 27.325)` | `#e7000b` |
| jaune CTA `bg-[#FFF198]` / survol | `rgb(255, 241, 152)` / `#f5e76b` | |
| crème survol `#fcf5cc` | `rgb(252, 245, 204)` | |
| gray-800 | `oklch(0.278 0.033 256.848)` | `#1e2939` |
| gray-700 | `oklch(0.373 0.034 259.733)` | `#364153` |
| gray-600 | `oklch(0.446 0.03 256.802)` | `#4a5565` |
| gray-500 | `oklch(0.551 0.027 264.364)` | `#6a7282` |
| gray-400 | `oklch(0.707 0.022 261.325)` | `#99a1af` |
| gray-300 | `oklch(0.872 0.01 258.338)` | `#d1d5dc` |
| gray-200 | `oklch(0.928 0.006 264.531)` | `#e5e7eb` |
| slate-50 (fond de page) | `oklch(0.984 0.003 247.858)` | `#f8fafc` |
| slate-100 | `oklch(0.968 0.007 247.896)` | `#f1f5f9` |
| foreground (texte par défaut) | `oklch(0.141 0.005 285.823)` | `#09090b` |
| muted-foreground | `oklch(0.552 0.016 285.938)` | `#71717b` |
| FAQ (inline) | `#0f352d` ; bordure réponse `#f0ece4` | |

Polices : texte courant « Plus Jakarta Sans » 16 px / 24 px, couleur foreground (body). Titres `h1–h6` : règle globale
`h1,h2,h3,h4,h5,h6{font-family:"Recoleta",var(--font-recoleta),sans-serif;font-weight:400}` [CSS] ; la plupart des titres de cette page
forcent en plus la famille en style inline `font-family: Recoleta, recoleta, "recoleta Fallback", sans-serif`. Recoleta n'étant pas
redistribuable, le clone utilise la police libre calibrée décrite dans [TOK font.serif] / `DECISIONS.md`. Ombres :
`shadow-lg` = `0 10px 15px -3px #0000001a, 0 4px 6px -4px #0000001a` ; `shadow-md` = `0 4px 6px -1px #0000001a, 0 2px 4px -2px #0000001a` ;
`shadow-sm` = `0 1px 3px 0 #0000001a, 0 1px 2px -1px #0000001a` ; `shadow-xs` = `0 1px 2px 0 #0000000d` ; `shadow-xl` = `0 20px 25px -5px #0000001a, 0 8px 10px -6px #0000001a` [CSS].

---

## 1. Routes acceptées

L'original a une seule route catch-all `app/[...location]/page`. L'aiguillage [ROUTER] :

```
seg = params.location            // tableau de segments d'URL
si seg.length >= 2 :
    avant   = seg[seg.length - 2]
    dernier = seg[seg.length - 1]
    si !isNaN(Number(avant))  OU  (avant === "pharmacie" ET !isNaN(Number(dernier)))
        → rendre la FICHE
→ sinon rendre la page RÉSULTATS
```

Calcul de l'identifiant dans la fiche [JS541:383-398] : `params.id` s'il existe ; sinon, si `seg.length >= 2` et `avant` numérique → `Number(avant)` ;
sinon si `avant === "pharmacie"` et `dernier` numérique → `Number(dernier)` ; sinon `0` (→ « Pharmacie non trouvée »).

| Format | Exemple | id |
|---|---|---|
| `/<région>/<département>/<ville>/<id>/<slug>` (forme canonique produite par tous les liens internes) | `/provence-alpes-cote-d-azur/alpes-maritimes/nice/557/pharmacie-saint-barthelemy` | 557 |
| `/<région>/<ville>/<id>/<slug>` (département omis quand son nom = la ville, insensible à la casse) | `/ile-de-france/paris/1340/<slug>` | 1340 |
| `/<id>/<slug>` (format du champ `siteWeb` de l'API : `https://teleconsultation.tessan.io/557/pharmacie-saint-barthelemy` [API]) | `/557/pharmacie-saint-barthelemy` | 557 |
| `/pharmacie/<id>` | `/pharmacie/557` | 557 |

Règles importantes :
- Le slug final et les segments de préfixe **ne sont jamais validés** : `/x/y/557/nimporte-quoi` affiche la fiche 557, sans redirection vers l'URL canonique.
- `/557` (un seul segment) → page résultats ; `/pharmacie/abc` → page résultats ; `/fr/france-FR/nice/results` → résultats (`avant` = `nice`).
- `Number()` : `"0557"` → 557.

Construction de l'URL canonique (utilisée par les cartes « à proximité », « Voir plus », etc.) [JS990:438-473] :
`k7(vR(segments), id, nom)` = `"/" + segments.map(slug).join("/") + "/" + id + "/" + slug(nom)` avec
`segments = [région (si connue), département (si non vide et ≠ ville, comparaison en minuscules), ville (si non vide)]`.

`slug(s)` (fonction `_` du module 1506) : `s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g,"").replace(/[^a-z0-9]+/g,"-").replace(/^-+|-+$/g,"")`.
Ex. « Provence-Alpes-Côte d'Azur » → `provence-alpes-cote-d-azur` ; « Île-de-France » → `ile-de-france` ; « Pharmacie Saint Barthélémy » → `pharmacie-saint-barthelemy`.

Région et département sont dérivés **du code postal** (module 45, [JS990:5-224]) :
- code département `aZ(cp)` : `""` si `cp.length < 2` ; si `cp` commence par `"20"` → `"2A"` quand le 3e caractère est `"0"` ou `"1"`, sinon `"2B"` ; sinon `cp.substring(0,2)`.
- région `pG(cp)` = table `code → région` (13 régions métropolitaines, noms exacts, ex. `"Provence-Alpes-Côte d'Azur"`, `"Île-de-France"`, `"Centre-Val de Loire"`), `""` si inconnue (DOM, étranger).
- nom de département `hl(cp)` = table `code → nom` (ex. `"06"` → `"Alpes-Maritimes"`, `"2B"` → `"Haute-Corse"`), et **le code lui-même** si absent de la table (ex. `"97"`).

Clone (Vite + React Router) : une route `/*` avec le même discriminant ; réécriture SPA pour le rechargement direct (P5-03, CL-07).

---

## 2. État de chargement (« Chargement... »)

Séquence de l'original [JS541:407-513] :
1. `loading = true`.
2. `GET /api/pharmacies/<id>`.
3. Si statut 429 → voir §4.
4. `pharmacy = res.ok ? await res.json() : null`.
5. Si `pharmacy` et pays ≠ US : chargement de **tous** les points de vente actifs, calcul des distances (haversine, R = 6371 km), tri croissant, exclusion de la pharmacie elle-même (`e.id !== pharmacy.id`) → listes « à proximité », départements, régions (voir `pharmacy-page-nearby.md`).
6. `loading = false`. Toute exception → `pharmacy = null`, `loading = false`.

L'état de chargement couvre donc aussi l'étape 5 : la fiche n'apparaît qu'une fois tout calculé. Il remplace **tout** le contenu de la page (le header et le footer du layout restent).

DOM exact [JS541:515-533] :

```html
<div class="max-w-[1328px] mx-auto px-4 py-20 text-center">
  <svg class="lucide lucide-loader-circle animate-spin mx-auto mb-4" width="48" height="48" viewBox="0 0 24 24"
       fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
  </svg>
  <h1 class="text-2xl text-gray-800" style="font-family: Recoleta, recoleta, &quot;recoleta Fallback&quot;, sans-serif;">Chargement...</h1>
</div>
```

| Élément | Valeurs (identiques à 375 / 768 / 1440 ; dérivées des classes, pas de dump pour cet état) |
|---|---|
| conteneur | `max-width:1328px; margin:0 auto; padding:80px 16px; text-align:center` ; hauteur totale 80+48+16+32+80 = **256 px** |
| spinner | 48×48, `display:block; margin:0 auto 16px`, trait `currentColor` = foreground `#09090b`, `animation: spin 1s linear infinite` (`@keyframes spin{to{transform:rotate(1turn)}}` [CSS]) |
| h1 | Recoleta 400, 24 px / 32 px (`text-2xl`, line-height `calc(2/1.5)`), gray-800, centré |
| texte | `Chargement...` (trois points ASCII, pas d'ellipse `…`) |

Le texte est codé en dur en français (même pour une pharmacie US). Respecter `prefers-reduced-motion` dans le clone (P3-05) : spinner immobile.

---

## 3. État « Pharmacie non trouvée »

Rendu quand `pharmacy` est `null` après chargement : réponse HTTP non OK (404…), identifiant `0`, exception réseau/JSON, ou après l'alerte 429.

```html
<div class="max-w-[1328px] mx-auto px-4 py-20 text-center">
  <h1 class="text-2xl text-gray-800" style="font-family: Recoleta, recoleta, &quot;recoleta Fallback&quot;, sans-serif;">Pharmacie non trouvée</h1>
</div>
```

Mêmes valeurs que §2 sans le spinner ; hauteur 80+32+80 = **192 px**. Texte exact : `Pharmacie non trouvée` (codé en dur, français).
Aucun lien de retour, aucun autre contenu.

---

## 4. Réponse 429 (limitation de débit)

Si `GET /api/pharmacies/<id>` répond **429** [JS541:412-420] : lecture du corps JSON, `console.warn("[Client] Rate limit atteint:", corps)`, puis
alerte native bloquante `window.alert` avec le texte exact :

```
Trop de requêtes. Veuillez patienter quelques instants avant de rafraîchir la page.
```

puis `pharmacy = null`, `loading = false` → état « Pharmacie non trouvée » (§3). Le clone n'ayant pas d'API rate-limitée, ce chemin
n'est à reproduire que si une couche de données asynchrone peut renvoyer 429.

---

## 5. Titre de page et meta description

Valeurs capturées [META `fiche-*`] (identiques aux 3 largeurs) :

- `<title>` : `Pharmacie Saint Barthélémy - Téléconsultation à Nice` → motif **`${nom} - Téléconsultation à ${ville}`** (tiret ASCII entouré d'espaces, « T » majuscule, « à » accentué).
- `<meta name="description">` : `Consultez un médecin en téléconsultation à Pharmacie Saint Barthélémy, 51 Av. Alfred Borriglione, 06100 Nice.` → motif
  **`Consultez un médecin en téléconsultation à ${nom}, ${adresse}, ${codePostal} ${ville}.`**

Ces valeurs viennent des métadonnées serveur de Next (absentes des bundles client). Dans le clone SPA : les poser (`document.title` + meta) dès que la pharmacie est connue.
Titre pendant le chargement / pour « non trouvée » : non capturé (voir Ambiguïtés).

---

## 6. Squelette de la page et espacements

```html
<div>                                              <!-- wrapper sans classe -->
  <main class="bg-slate-50 min-h-screen py-12">
    <div class="max-w-[1328px] mx-auto">
      <section class="p-6 bg-slate-50">
        <div class="max-w-[1328px] mx-auto">
          <nav aria-label="breadcrumb" data-slot="breadcrumb" class="hidden md:block mb-6">…</nav>   <!-- §7 -->
          <h1 class="text-3xl md:text-3xl text-center text-gray-800 mb-8" style="…">…</h1>           <!-- §8 -->
          <div class="mx-auto bg-white p-6 md:p-8 rounded-lg shadow-lg">…</div>                      <!-- §9 -->
        </div>
      </section>
      <div class="p-6"> carte principale </div>                 <!-- pharmacy-page-main-card.md -->
      <div class="p-6"> horaires + carte </div>                 <!-- pharmacy-page-hours-map.md -->
      <section> FAQ </section>                                  <!-- conditionnelle, pharmacy-page-faq.md -->
      <div class="p-6"> dispositifs à proximité </div>          <!-- conditionnel, pharmacy-page-nearby.md -->
      <div class="p-6"> départements à proximité </div>         <!-- conditionnel -->
      <div class="p-6"> régions à proximité </div>              <!-- conditionnel -->
    </div>
  </main>
</div>
```

`main` : fond slate-50 `#f8fafc`, `min-height:100vh`, `padding:48px 0` [C1440 `div:25>main:0`]. Conteneur `max-width:1328px`, centré.
Chaque bloc `p-6` = padding 24 px sur les 4 côtés ; les cartes blanches sont donc à 24 px des bords du conteneur, et deux cartes consécutives
sont séparées de 48 px (24 + 24).

Géométrie horizontale :

| | 375 | 768 | 1440 |
|---|---|---|---|
| conteneur 1328 | x=0, w=375 | x=0, w=768 | x=56, w=1328 |
| contenu des blocs `p-6` (cartes) | x=24, w=327 | x=24, w=720 | x=80, w=1280 |

Géométrie verticale, **FAQ fermée** (y / hauteur ; sources [C375]/[C768]/[C1440], corrigées de la réponse FAQ ouverte après la FAQ) :

| Bloc | 375 | 768 | 1440 |
|---|---|---|---|
| header (layout) | 0 / 81 | 0 / 81 | 0 / 81 |
| `main` (padding-top 48) | 81 | 81 | 81 |
| `section.p-6` (fil + h1 + recherche) | 129 / 498.7 | 129 / 524.8 | 129 / 326.2 |
| · `nav` fil d'Ariane | masqué | 153 / 50 (2 lignes) | 153 / 20 |
| · h1 « Votre dispositif… » | 153 / 126.7 (3 lignes) | 227 / 84.5 (2 lignes) | 197 / 42.2 (1 ligne) |
| · carte de recherche | 311.7 / 292 | 343.5 / 286.4 | 271.2 / 160 |
| `div.p-6` carte principale | 627.7 / 3809 | 653.8 / 2621 | 455.2 / 2103 |
| `div.p-6` horaires + carte | 4436.7 / 1111 | 3274.8 / 1063 | 2558.2 / 612 |
| `section` FAQ (haut du h2 ; 8 px de marge au-dessus) | 5555.7 / 1108 | 4345.8 / 784 | 3178.2 / 712 |
| `div.p-6` à proximité | 6663.7 / 2124 | 5129.8 / 1106 | 3890.2 / 748 |
| `div.p-6` départements | 8787.7 / 920 | 6235.8 / 640 | 4638.2 / 416 |
| `div.p-6` régions | 9707.7 / 1068 | 6875.8 / 664 | 5054.2 / 416 |
| fin de `main` (padding-bottom 48) → début footer | 10823.7 | 7587.8 | 5518.2 |
| hauteur totale du document [META] | 12876 | 9068 | 6129 |

Blocs conditionnels : la FAQ n'existe que si `nomEtablissement === "Cabine Téléconsultation Médecin Tessan"` ; les trois derniers blocs seulement si leur liste est non vide ; aucun des quatre pour une pharmacie US (voir §10).

---

## 7. Fil d'Ariane

Composant shadcn/ui `Breadcrumb` [JS467 module 2785] ; masqué sous 768 px (`hidden md:block`), `margin-bottom:24px`. Source [OUT:5-28], [JS541:560-646].

```html
<nav aria-label="breadcrumb" data-slot="breadcrumb" class="hidden md:block mb-6">
  <ol data-slot="breadcrumb-list" class="text-muted-foreground flex flex-wrap items-center gap-1.5 text-sm break-words sm:gap-2.5">
    <li data-slot="breadcrumb-item" class="inline-flex items-center gap-1.5">
      <button data-slot="breadcrumb-link" class="hover:text-foreground transition-colors hover:underline cursor-pointer">Trouver un dispositif de téléconsultation</button>
    </li>
    <li data-slot="breadcrumb-separator" role="presentation" aria-hidden="true" class="[&>svg]:size-3.5"><svg class="lucide lucide-chevron-right"><path d="m9 18 6-6-6-6"/></svg></li>
    <li class="inline-flex items-center gap-1.5">
      <span data-slot="breadcrumb-page" role="link" aria-disabled="true" aria-current="page" class="text-foreground font-normal">Spécialités médicales</span>
    </li>
    <!-- pour chaque niveau : séparateur + li > button -->
    … Provence-Alpes-Côte d'Azur › Alpes-Maritimes › Nice …
    <li class="[&>svg]:size-3.5">…chevron…</li>
    <li class="inline-flex items-center gap-1.5"><span data-slot="breadcrumb-page" role="link" aria-disabled="true" aria-current="page" class="text-foreground font-normal">Pharmacie Saint Barthélémy</span></li>
  </ol>
</nav>
```

Items dans l'ordre :

| # | Libellé | Élément | Clic |
|---|---|---|---|
| 1 | `Trouver un dispositif de téléconsultation` | button | `router.push("/")` |
| 2 | `Spécialités médicales` | span non cliquable (couleur foreground) | — |
| 3 | région = `pG(codePostal)` (omise si `""`) | button | `push("/<région>")` puis `window.scrollTo({top:0, behavior:"smooth"})` |
| 4 | département = `hl(codePostal)` — **omis si égal à la ville** (comparaison `toLowerCase()`) ou vide | button | `push("/<région>/<département>")` + scroll haut lisse |
| 5 | ville = `pharmacy.ville` (omise si vide) | button | `push("/<région>[/<département>]/<ville>")` + scroll haut lisse |
| 6 | nom = `pharmacy.nom` | span non cliquable (foreground) | — |

Un séparateur chevron précède chaque item à partir du 2e. Le lien de chaque niveau est construit avec les niveaux **précédents inclus**
(`segments.slice(0, index+1)` → `vR`), chaque libellé passant par `slug()`. Ex. 557 : `/provence-alpes-cote-d-azur`, `/provence-alpes-cote-d-azur/alpes-maritimes`,
`/provence-alpes-cote-d-azur/alpes-maritimes/nice`. Pour Paris 75001 le département « Paris » = ville → `… › Île-de-France › Paris › <nom>`.
Pharmacie US : `Trouver… › Spécialités médicales › <ville en span non cliquable> › <nom>` (libellés anglais, voir §10).

Valeurs calculées (identiques à 768 et 1440 ; nav absente du DOM rendu à 375) [C768]/[C1440 `M>section:0>div:0>nav:0…`] :

| Élément | Valeurs |
|---|---|
| `ol` | flex, wrap, `align-items:center`, `gap:10px` (`sm:gap-2.5` ; 6 px sous 640 px mais la nav y est masquée), 14 px / 20 px, couleur muted-foreground `#71717b`, `overflow-wrap:break-word` |
| `li` item | `display:inline-flex` (calculé `flex`), `align-items:center`, `gap:6px`, hauteur 20 |
| bouton | police héritée (Plus Jakarta Sans 14/20, 400), couleur muted-foreground, fond transparent, padding 0, `transition: color … .15s` ; **survol** : couleur foreground `oklch(0.141 0.005 285.823)` + `text-decoration: underline` [HOV breadcrumb] |
| span page | 14/20, 400, couleur foreground `#09090b` |
| séparateur | `li` `display:list-item`, svg 14×14 (`[&>svg]:size-3.5`), trait muted-foreground ; rect 14×14 centré verticalement (ex. `[355,156,14×14]` à 1440) |
| largeurs 1440 | « Trouver un dispositif de téléconsultation » 265 ; « Spécialités médicales » 141 ; « Provence-Alpes-Côte d'Azur » 190 ; « Alpes-Maritimes » 107 ; « Nice » 29 ; « Pharmacie Saint Barthélémy » 185 |
| 1440 | une ligne : `[80,153,1280×20]` |
| 768 | deux lignes, `[24,153,720×50]` (20 + 10 d'écart + 20) ; la 2e ligne commence à « Alpes-Maritimes » (`li:6` à `[24,183]`), le chevron après « Provence-Alpes-Côte d'Azur » reste en fin de 1re ligne (`li:5` à x=698) |

---

## 8. Titre h1 « Votre dispositif de téléconsultation Tessan à <Ville> »

Source [OUT:29-30], [JS541:647-663].

```html
<h1 class="text-3xl md:text-3xl text-center text-gray-800 mb-8"
    style="font-family: Recoleta, recoleta, &quot;recoleta Fallback&quot;, sans-serif; font-size: 2.2rem;">
  Votre dispositif de téléconsultation Tessan à <span class="text-tessan-green-hover">Nice</span>
</h1>
```

Texte : `"Votre dispositif de téléconsultation Tessan à"` + `" "` + `<span>{pharmacy.ville}</span>` (US : `Your Tessan telehealth device in`).

| | 375 | 768 | 1440 |
|---|---|---|---|
| rect h1 [C*] | `[24,153,327×126.7]` (3 lignes) | `[24,227,720×84.5]` (2 lignes : « … Tessan à » / « Nice ») | `[80,197,1280×42.2]` (1 ligne) |
| police | Recoleta **400**, **35.2 px** (style inline `2.2rem` qui écrase `text-3xl`), line-height **42.24 px** (= `var(--text-3xl--line-height)` = `calc(2.25/1.875)` = 1.2 × 35.2) | idem | idem |
| couleur | gray-800 `#1e2939` ; span ville : tessan-green-hover `rgb(29, 92, 77)` | idem | idem |
| alignement / marge | centré, `margin-bottom:32px` | idem | idem |

---

## 9. Carte « Effectuer une nouvelle recherche »

Source [OUT:31-46], [JS541:664-739]. Le formulaire est le composant partagé `SearchForm` (module 5915, [JS467]) rendu en mode `inline` (sans sa section/son titre d'accueil).

```html
<div class="mx-auto bg-white p-6 md:p-8 rounded-lg shadow-lg">
  <div class="mb-6 flex items-center gap-3">
    <svg class="lucide lucide-search text-gray-500" width="20" height="20">…</svg>
    <h2 class="text-lg text-gray-700" style="font-family: Plus Jakarta Sans, &quot;Plus Jakarta Sans&quot;, &quot;Plus Jakarta Sans Fallback&quot;, sans-serif;">Effectuer une nouvelle recherche</h2>
  </div>
  <form class="flex flex-col lg:flex-row gap-4 md:gap-[1.2rem] items-stretch">
    <div class="w-full md:min-w-[280px] md:w-auto relative">
      <button type="button" class="w-full h-11 flex items-center font-semibold justify-between space-x-2 border rounded-lg px-4 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-300 cursor-pointer border-tessan-green-hover text-tessan-green-hover hover:bg-tessan-green-hover hover:text-white">
        <span class="truncate">Spécialités médicales</span>
        <svg class="lucide lucide-chevron-down transition-transform" width="20" height="20"/>
      </button>
    </div>
    <div class="relative flex-1">
      <input type="text" placeholder="Ville / Code postal" class="flex bg-transparent py-1 text-base shadow-xs transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 md:text-sm w-full h-11 border border-gray-300 placeholder-gray-700 rounded-lg px-4 pr-24 focus:outline-none focus:ring-2 focus:ring-blue-300 pac-target-input">
      <button type="button" title="Me géolocaliser" class="absolute top-1/2 right-4 -translate-y-1/2 text-gray-400 hover:text-tessan-green-hover transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"><svg class="lucide lucide-locate-fixed" width="20" height="20"/></button>
    </div>
    <button type="submit" class="w-full md:min-w-[288px] md:w-auto h-11 flex items-center justify-center gap-2 bg-tessan-green hover:bg-tessan-green-hover text-white font-semibold rounded-lg px-4 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer">
      <svg class="lucide lucide-search" width="20" height="20"/><span>Recherche</span>
    </button>
  </form>
</div>
```

Valeurs calculées :

| Élément | 375 | 768 | 1440 |
|---|---|---|---|
| carte (rect) | `[24,311.7,327×292]` | `[24,343.5,720×286.4]` | `[80,271.2,1280×160]` |
| carte : padding / fond / rayon / ombre | 24 px ; blanc ; 10 px ; shadow-lg | **32 px** ; idem | 32 px ; idem |
| ligne titre (`mb-6` 24 px, `gap:12px`, centrée verticalement) | `[48,335.7,279×56]` — le h2 passe sur **2 lignes** (« Effectuer une nouvelle » / « recherche », `[78,335.7,249×56]`) | `[56,375.5,656×28]` | `[112,303.2,1216×28]` |
| icône loupe | 20×20, gray-500 `#6a7282` ; **à 375 elle rétrécit à 18 px de large** (élément flex `flex-shrink:1` : 20+12+276 > 279, le manque de 29 px est réparti au prorata 20/276) — d'où le h2 à x=78 | 20×20 | 20×20 (h2 à x = 112+20+12 = 144) |
| h2 | Plus Jakarta Sans **400**, 18 px / 28 px, gray-700 `#364153` | idem | idem ; largeur 276 |
| formulaire | colonne, `gap:16px`, hauteur 164 (3×44 + 2×16) | colonne, `gap:19.2px` (`md:gap-[1.2rem]`), hauteur 170.4 | **ligne**, `gap:19.2px`, `align-items:stretch`, hauteur 44 |
| bouton spécialités | 279×44 | 656×44 | **280×44** (`md:min-w-[280px]`) |
| champ ville | 279×44, **16 px** | 656×44, **14 px** (`md:text-sm`) | **609.6×44**, 14 px (flex-1) |
| bouton Recherche | 279×44 | 656×44 | **288×44** (`md:min-w-[288px]`) |

Détails du formulaire partagé (mesurés [C1440]) : bouton spécialités — bordure 1 px `#1d5c4d`, texte `#1d5c4d` 16 px **600**, rayon 10, padding 0 16 px,
`justify-content:space-between`, libellé `Spécialités médicales` tronqué (`truncate`, marge droite 8 px via `space-x-2`), chevron-down 20 px ; survol : fond `#1d5c4d` + texte blanc [HOV specialites].
Champ — hauteur 44, padding `4px 96px 4px 16px`, bordure 1 px gray-300 `#d1d5dc`, rayon 10, `shadow-xs`, placeholder `Ville / Code postal` ; focus : anneau 2 px blue-300.
Bouton géolocaliser — 20×20, absolu à 16 px du bord droit, centré verticalement, gray-400 `#99a1af`, survol `#1d5c4d`, `title="Me géolocaliser"`.
Bouton Recherche — fond `#0f352d`, texte blanc 16 px 600, rayon 10, padding 0 16, `gap:8px`, loupe 20 + `Recherche` ; survol `#1d5c4d` [HOV recherche] ;
focus : anneau 2 px blue-500 décalé de 2 px. Aucune spécialité n'est présélectionnée sur la fiche. Pour une pharmacie US : `Medical specialties`, `City / ZIP code`, `Search`, pays `US`.

Comportement de soumission propre à la fiche (`onSearchSubmit(résultats, requête, spécialité, coords, codePostal)`) [JS541:686-736] :
1. Ni requête ni spécialité → `router.push("/")`.
2. Si au moins un résultat **et** une requête : `d = requête.split(",")[0].trim()` ; `cp = résultats[0].codePostal` ;
   - si `d` est un nom de région connu → segments `[{région d}]` ;
   - sinon si `d` est un nom de département connu → `[{région(cp)}, {département d}]` ;
   - sinon → `[{région(cp)}, {département(cp) si ≠ d}, {ville d}]` ;
   - puis `{codePostal}` ajouté s'il est fourni ; chemin = `vR(segments)` (tous slugifiés, sans spécialité dans l'URL).
   - `sessionStorage` : `searchResults` (JSON des résultats), `searchQuery`, `searchCoords` (JSON ou `""`), `searchSpecialisation` (ou `""`), `navigationFromSearch = "true"` ; puis `router.push(chemin)`.
3. Sinon → `router.push("/")`.

---

## 10. Variante pays « US »

`isUS(p)` = `p.pays.trim().toUpperCase()` ∈ `US, USA, U.S., U.S.A., UNITED STATES, UNITED STATES OF AMERICA, ÉTATS-UNIS, ETATS-UNIS` [JS541:136-150].
Pour une telle fiche : libellés anglais (`Find a telehealth device`, `Medical specialties`, `Your Tessan telehealth device in`, `Start a new search`,
`Opening hours`, `Open`/`Closed`, `Book a slot`, `Directions`, jours `Monday…Sunday`, statut « Open · Closes at … »), fil d'Ariane réduit (§7),
formulaire en pays US, **ni FAQ, ni à proximité, ni départements, ni régions** (le calcul n'est même pas lancé). Aucune pharmacie US dans les données du clone : variante à implémenter à l'identique mais non testable visuellement.

---

## 11. Récapitulatif mobile / tablette (breakpoints `sm` 640, `md` 768, `lg` 1024)

| Zone | < 768 (mesuré à 375) | 768 – 1023 (mesuré à 768) | ≥ 1024 (mesuré à 1440) |
|---|---|---|---|
| fil d'Ariane | masqué | visible, peut passer sur 2 lignes | visible, 1 ligne |
| h1 « Votre dispositif… » | 35.2 px, 3 lignes | 35.2 px, 2 lignes | 35.2 px, 1 ligne |
| carte recherche | padding 24, titre sur 2 lignes, champs empilés `gap 16`, champ ville 16 px | padding 32, champs empilés pleine largeur `gap 19.2` | padding 32, champs en ligne 280 / flex / 288 |
| carte principale | padding **16**, h1 nom **20/28**, adresse **14/20**, statut 14/20 (« Ouvert » 16/24), boutons **empilés pleine largeur** 52 / 34 / 38 px de haut, textes téléphone/itinéraire **12 px**, `gap` colonne 16 | padding 24, h1 **30/36**, adresse **16/24**, statut 16/24 (« Ouvert » 18/28), boutons empilés pleine largeur 56 / 40 / 44, textes 16 px, `gap` 24 | padding 24, infos à gauche et **boutons en ligne à droite** (`lg:flex-row`, centrés verticalement, `flex-wrap`), adresse **18/28** |
| photo (flottant `w-1/2`) | 147.5×110.6 à droite, texte en colonne de 123.5 px à gauche ; flèches 40×40 recouvrant presque toute la photo | 336×252 | 616×462 |
| horaires + carte | 1 colonne ; lignes d'horaires qui **passent sur 2 lignes** (vendredi, mercredi) ; carte 263×500, boutons carte icône seule 44×44 | 1 colonne ; carte 656×500 **sous** les horaires ; boutons carte avec libellé (≥ 640) | 2 colonnes 588 + 40 + 588 ; carte `sticky top:96px` |
| FAQ | titre 40 px sur 2 lignes ; questions sur 2–3 lignes (items 88–136 px) | items 64 px, 3 derniers sur 2 lignes (88 px) | items 64 px |
| à proximité | 1 colonne (263 px) | 2 colonnes (320 px) | 3 colonnes (394.7 px) |
| départements / régions | 2 colonnes (123.5 px) | 3 colonnes (208 px) | 5 colonnes (230.4 px) |

Détail par élément dans chaque fichier de composant.

---

## 12. Données du clone

Les données locales (`src/data/locations.json` = lignes `gmb_locations` brutes, 53 points de vente ; `src/data/pharmacy-extras.json` = `images`,
`description`, `nomEtablissement`, `canBook` par code magasin) remplacent l'API. Transformation d'une ligne brute en objet « pharmacie » : fonction `i` du
module 4173 [JS990:530-600] (`id = parseInt(code_magasin)`, `nom = nom_poi || nom_etablissement || "Sans nom"`, `horaires.<jour> = horaires_tc_<jour> || "Fermé"`,
`coordonnees = {lat: latitude, lng: longitude}`, `description = description_longue`, `pays`, `idTechnique`, `codeMagasin`…). Cas de test utiles :

| Cas | Codes magasin |
|---|---|
| référence (5 photos, FAQ, canBook) | 557 (Nice) |
| `canBook = false` (pas de bouton « Réserver un créneau ») | 1877, 1908, 1063, 1013 |
| 0 photo (texte pleine largeur) | 1459, 1476, 1386 |
| 1 photo (pas de flèches ni compteur) | 1340, 1535, 1408, 1311, 1615 |
| pas de FAQ (`nomEtablissement` différent) | 305 (« PHARMACIE DE FAMAJOR »), 1063 (« Centre de Téléconsultation Ophtalmologique Tessan ») |
| noms longs (CL-09) | 330, 455, 491, 842, 1063 |
| département = ville (fil et URL sans département) | 1340, 1535 (Paris) |
| Corse (`20200` → 2B Haute-Corse) | 1615 |

Avec 53 points de vente (contre 1 807 sur l'original), les listes « à proximité », départements et régions (et leurs compteurs) **diffèrent** de la capture de référence.

---

## 13. Ambiguïtés et écarts connus

1. **FAQ ouverte dans les dumps** (y compris 1440, contrairement à ce qui était annoncé) : l'état par défaut est fermé ; valeurs corrigées ci-dessus.
2. **Titre / meta pendant le chargement et pour « non trouvée »** : non capturés (métadonnées serveur). Proposition : garder le titre par défaut du site (`Trouvez le dispositif de téléconsultation Tessan`, [META home]) jusqu'au chargement.
3. **Fuseau horaire** : l'original calcule « Ouvert / Fermé » et l'ordre des jours avec l'heure **locale du navigateur** (`getDay()/getHours()`) ; l'exigence CL-13 du clone impose Europe/Paris. À implémenter en Europe/Paris (divergence volontaire, invisible pour un visiteur en France).
4. **Capture 768** : le bouton téléphone y apparaît en vert clair `#1d5c4d` alors que la valeur calculée [C768] est `rgb(15, 53, 45)` — artefact de survol lors de la capture ; l'état par défaut est `#0f352d`.
5. **Textes des dumps** : les champs `text` concatènent les nœuds texte avec des espaces (« 06100  Nice », « ( 1.6 km ) », « 47  dispositifs ») ; le rendu réel est `06100 Nice`, `(1.6 km)`, `47 dispositifs` (un seul espace, cf. JSX et captures).
6. **État de chargement** : l'original l'affiche pendant toute la récupération (y compris le chargement des 1 807 points de vente). Avec des données locales synchrones, il peut ne durer qu'une frame ; il doit néanmoins exister (même DOM) si la source de données est asynchrone.
7. **Carte Google Maps** : le clone utilise Leaflet sans clé (checklist P2-08, `DECISIONS.md`) ; le rendu des tuiles ne peut donc pas être identique. Seuls le conteneur, les boutons superposés, le zoom 16 et le comportement sont spécifiés ici ; équivalences dans `map.md` §10.
8. **Double navigation** sur la carte « à proximité » : dans l'original le clic sur le nom déclenche deux `router.push` identiques (span + carte) ; le clone n'en fait qu'un (sans effet visible).
