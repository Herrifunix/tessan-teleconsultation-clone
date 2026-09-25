# Spécification — Carte de pharmacie (liste de résultats + popup de carte)

> Composant `PharmacyCard` (module **91**, export `A`, [JS990] l.225-436). Utilisé (1) dans la colonne liste de la page de résultats avec `onFocus`, (2) dans la popup de marqueur de la carte **sans** `onFocus` (voir `map.md` §7). Référence : `/fr/france-FR/nice/results`, horloge figée **vendredi 25/09/2026 15:00 Europe/Paris**.

## 0. Sources

| Alias | Fichier |
|---|---|
| [JS990] | `docs/research/js/pretty/990-ede1d18ec8eaf918.js` — module 91 (carte), 3674 (hook « peut réserver »), 1506 (URL), 45 (départements), 4173 (mapping des données), 6504 (statut) |
| [JS128] | `docs/research/js/pretty/128-230074a16c9361a5.js` — module 9306 (liste qui instancie les cartes) |
| [C375] [C768] [C1440] | `docs/research/pages/results/computed-{375,768,1440}.json` (1ʳᵉ carte : « Pharmacie Saint Barthélémy ») |
| [POP] | `docs/research/pages/specialty-city/popup.json` (carte rendue dans la popup, « Pharmacie Nice Etoile ») |
| [OUT] | `docs/research/pages/specialty-city/outline.txt` |
| [CSS] | `docs/research/css/323d88a92ac6be07.css` |
| [HOV] | `docs/research/hover-states.json` (clés `card`, `reserver`, `voir-plus`) |
| [PNG] | `docs/reference/results-{375,768,1440}.png`, `docs/reference/states/hover-card-*`, `hover-reserver-*`, `hover-voir-plus-*`, `marker-popup-1440.png` |
| [DATA] | `src/data/locations.json` (lignes Supabase brutes), `src/data/pharmacy-extras.json` (`canBook`) |

---

## 1. Modèle de données consommé

Mapping d'une ligne `gmb_locations` → objet `Pharmacy` ([JS990] module 4173, fonction `i`, l.530-600) :

| Champ `Pharmacy` | Calcul | Utilisé par la carte |
|---|---|---|
| `id` | `parseInt(code_magasin) \|\| 0` | clé React, URL « Voir plus » |
| `nom` | `nom_poi \|\| nom_etablissement \|\| "Sans nom"` | titre, slug d'URL |
| `adresse` | `adresse \|\| ""` | ligne 1 |
| `ville` | `ville \|\| ""` | ligne 2, URL |
| `codePostal` | `code_postal \|\| ""` | ligne 2, URL (région/département) |
| `coordonnees` | `{lat: latitude \|\| 0, lng: longitude \|\| 0}` | lien d'itinéraire, carte |
| `horaires` | `{lundi: horaires_tc_lundi \|\| "Fermé", …, dimanche: horaires_tc_dimanche \|\| "Fermé"}` | statut (voir `opening-status.md`) |
| `services` | catégories principale + secondaires 1-6 non vides, sinon `["Téléconsultation Tessan"]` | filtre spécialité (hors carte) |
| `distance` | `null` à la création ; `"x.x km"` (`toFixed(1) + " km"`) après tri par distance | lien « (x.x km) » |
| `codeMagasin` | `code_magasin` | clé « peut réserver » (repli) |
| `idTechnique` | `id_technique \|\| ""` (ex. `CAB_PHA_542_06100_1`) | clé « peut réserver », modale |

`canBook` (bouton « Réserver un créneau ») : pour le clone, lu dans [DATA] `pharmacy-extras.json[code_magasin].canBook` (l'original l'obtient par l'API, §5.3). Dans l'échantillon : `canBook = false` pour 1877 (Orly), 1908 (Taverny), 1013 (Fonsorbes), 1063 (Verneuil) ; `true` pour les 49 autres.

---

## 2. Structure DOM exacte

```html
<!-- Fragment : la carte + (si ouverte) la modale en portail -->
<div class="bg-white p-5 border border-gray-200 rounded-lg hover:shadow-xl transition cursor-pointer"   onClick={onFocus}>
 <div class="flex gap-4">
  <div class="flex-1">
   <div class="flex justify-between items-start">
    <h3 class="text-gray-800 text-xl flex-1">
     <span class="cursor-pointer font-bold" onClick={onFocus}>Pharmacie Saint Barthélémy</span>
     <!-- uniquement si pharmacy.distance est non vide -->
     <a href="#" class="cursor-pointer">
      <span class="text-base font-normal underline cursor-pointer ml-2">(0.0 km)</span>
     </a>
    </h3>
   </div>
   <p class="text-gray-500 font-medium text-base">51 Av. Alfred Borriglione</p>
   <p class="text-gray-500 font-medium text-base mb-3">06100 Nice </p>          <!-- enfants : [codePostal, " ", ville, " "] -->
   <p class="font-medium mb-3 flex items-center gap-1.5 text-gray-700">
    <svg class="lucide lucide-clock h-5 w-5 text-[#238700]"/>                 <!-- fermé : text-red-600 -->
    <span class="font-extrabold text-base text-[#238700]">Ouvert</span>         <!-- fermé : text-red-600, texte « Fermé » -->
    <!-- si displayText contient " · " : -->
    {" "}<span class="text-xs">•</span>{" "}Ferme à 19:30
   </p>
   <div class="flex flex-col gap-2 w-full">
    <!-- uniquement si canBook === true -->
    <button data-cta="reserver_creneau" class="w-full flex items-center justify-center gap-2 bg-tessan-green hover:bg-tessan-green-hover text-white font-semibold rounded-lg h-11 px-3 transition-colors text-base cursor-pointer">
     <svg class="lucide lucide-calendar-days" width="18" height="18"/>
     <span>Réserver un créneau</span>
    </button>
    <button data-slot="button" data-cta="voir_plus_pharmacie" class="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md font-medium transition-all disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive shadow-xs hover:text-accent-foreground dark:bg-input/30 dark:border-input dark:hover:bg-input/50 py-2 has-[>svg]:px-3 border-tessan-green hover:opacity-[.7] border border-none bg-[#FFF198] text-tessan-green w-full h-10 px-3 cursor-pointer text-base">
     <svg class="lucide lucide-info w-4 h-4"/>{" "}<span class="truncate">Voir plus</span>
    </button>
   </div>
  </div>
 </div>
</div>
{modalOuverte && <BookingModal pharmacy={pharmacy} onClose={() => setOpen(false)}/>}   <!-- portail dans document.body, voir booking-modal.md -->
```

- La chaîne de classes « Voir plus » est celle **effectivement rendue** (fusion `tailwind-merge` du bouton shadcn variante `outline`, taille `default`, et des classes passées), relevée dans [POP] `outer`. Les classes d'origine sont dans [JS990] l.233-257 (cva) et l.416-417.
- Icônes lucide (24 × 24 par défaut, `stroke-width` 2, `stroke="currentColor"`, `fill="none"`) : `clock` (module 6983), `calendar-days` (383, `size={18}`), `info` (3327). Correspondance vérifiée dans `docs/research/js/950-bc85ee46b8dc195f.js`.
- Les espaces `" "` dans le `<p>` de statut et dans « Voir plus » sont des nœuds texte blancs dans un conteneur flex : ils ne produisent **aucun** espace visible ; l'espacement vient uniquement de `gap` (voir mesures §3.2).

---

## 3. Valeurs résolues

### 3.1 Boîtes mesurées (1ʳᵉ carte, x / y / l × h en px)

| Élément | 375 [C375] | 768 [C768] | 1440 [C1440] |
|---|---|---|---|
| carte (racine) | 48 / 821 — 279 × **286** | 56 / 753.4 — 656 × 258 | 88 / 537 — 442.4 × 258 |
| zone de contenu (`flex gap-4`, `flex-1`) | 69 / 842 — 237 × 244 | 77 / 774.4 — 614 × 216 | 109 / 558 — 400.4 × 216 |
| `h3` | 237 × **56** (nom sur 2 lignes) | 614 × 28 | 400.4 × 28 |
| `span` nom | 170 × 55 | 295 × 27 | 295 × 27 |
| `a` distance | 190 / 870 — 67 × 27 (suit le nom en ligne 2) | 372 / 774.4 — 67 × 27 | 404 / 558 — 67 × 27 |
| `span` « (0.0 km) » | 59 × 22 | 59 × 22 | 412 / 562 — 59 × 22 |
| `p` adresse | 237 × 24 | 614 × 24 | 109 / 586 — 400.4 × 24 |
| `p` CP + ville | 237 × 24 | 614 × 24 | 109 / 610 — 400.4 × 24 |
| `p` statut | 69 / 958 — 237 × 24 | 77 / 862.4 — 614 × 24 | 109 / 646 — 400.4 × 24 |
| `span` « Ouvert » | 95 / 958 — 58 × 24 | 103 — 58 × 24 | 135 / 646 — 58 × 24 |
| `span` « • » | 159 / 962 — 6 × 16 | 167 — 6 × 16 | 199 / 650 — 6 × 16 |
| conteneur boutons | 237 × 92 | 614 × 92 | 109 / 682 — 400.4 × 92 |
| « Réserver un créneau » | 69 / 994 — 237 × 44 | 77 / 898.4 — 614 × 44 | 109 / 682 — 400.4 × 44 |
| libellé « Réserver… » | 119.5 / 1004 — 162 × 24 | 316 — 162 × 24 | 241.2 / 692 — 162 × 24 |
| « Voir plus » | 69 / 1046 — 237 × 40 | 77 / 950.4 — 614 × 40 | 109 / 734 — 400.4 × 40 |
| libellé « Voir plus » | 167 / 1054 — 65 × 24 | 363.5 — 65 × 24 | 288.7 / 742 — 65 × 24 |
| cartes suivantes (y) | 1131, 1441, 1751, 2061 (pas 310 = 286 + 24) | 1035.4, … (pas 282) | 819, 1101, 1383, 1665 (pas 282 = 258 + 24) |

Décomposition verticale (1440) : bordure 1 + padding 20 + h3 28 + adresse 24 + CP 24 + `mb-3` 12 + statut 24 + `mb-3` 12 + boutons 92 (44 + 8 + 40) + padding 20 + bordure 1 = **258** ([C1440]). À 375 le nom passe sur 2 lignes → 286.

Carte sans bouton « Réserver » (`canBook` faux) : conteneur boutons = 40 → hauteur 206 (1440) (calculé : 258 − 44 − 8).

### 3.2 Styles calculés (valeurs identiques aux 3 viewports) [C1440]

| Élément | Police | Taille / interligne | Graisse | Couleur | Autres |
|---|---|---|---|---|---|
| racine | Plus Jakarta Sans | 16 / 24 | 400 | `oklch(0.141 0.005 285.823)` | fond `#fff` ; padding 20 ; bordure 1 px `oklch(0.928 0.006 264.531)` (gray-200) ; radius **10 px** ; ombre `none` au repos ; `transition-property: color, background-color, border-color, outline-color, text-decoration-color, fill, stroke, --tw-gradient-from, --tw-gradient-via, --tw-gradient-to, opacity, box-shadow, transform, translate, scale, rotate, filter, -webkit-backdrop-filter, backdrop-filter, display, content-visibility, overlay, pointer-events` ; durée 0.15 s ; courbe `cubic-bezier(.4,0,.2,1)` |
| `div.flex.gap-4` | — | — | — | — | `gap:16px` (un seul enfant : aucun effet) |
| `div.flex.justify-between.items-start` | — | — | — | — | `justify-content:space-between; align-items:flex-start` |
| `h3` | **Recoleta** (règle de base h1–h6) | **20 / 28** | 400 | gray-800 `oklch(0.278 0.033 256.848)` | — |
| `span` nom | Recoleta | 20 / 28 | **700** | gray-800 | inline |
| `span` distance | Recoleta | **16 / 24** | 400 | gray-800 (hérité) | `text-decoration-line: underline` ; `margin-left: 8px` |
| `p` adresse, `p` CP | Plus Jakarta Sans | 16 / 24 | **500** | gray-500 `oklch(0.551 0.027 264.364)` | CP : `margin-bottom:12px` |
| `p` statut | Plus Jakarta Sans | 16 / 24 | 500 | gray-700 `oklch(0.373 0.034 259.733)` | `display:flex; align-items:center; gap:6px; margin-bottom:12px` |
| icône horloge | — | 20 × 20 | — | ouvert `#238700` / fermé red-600 `oklch(57.7% .245 27.325)` | `h-5 w-5` |
| `span` « Ouvert » / « Fermé » | Plus Jakarta Sans | 16 / 24 | **800** | idem icône | — |
| `span` « • » | Plus Jakarta Sans | **12 / 16** | 500 | gray-700 | 6 × 16 |
| texte « Ferme à 19:30 » | Plus Jakarta Sans | 16 / 24 | 500 | gray-700 | nœud texte |
| conteneur boutons | — | — | — | — | `flex-direction:column; gap:8px; width:100%` |
| « Réserver un créneau » | Plus Jakarta Sans | 16 / 24 | **600** | `#fff` | fond `#0f352d` ; hauteur 44 ; padding 0 12 ; radius 10 ; `gap:8px` ; centré ; transition couleurs 0.15 s (`color, background-color, border-color, outline-color, text-decoration-color, fill, stroke, --tw-gradient-*`) |
| icône calendrier | — | 18 × 18 | — | `#fff` | — |
| « Voir plus » | Plus Jakarta Sans | 16 / 24 | **500** | `#0f352d` | fond `#fff198` ; hauteur 40 ; padding 8 12 ; radius **8 px** ; bordure : `border-style:none` (aucune) ; ombre `0 1px 2px 0 rgba(0,0,0,.05)` (`shadow-xs`) ; `white-space:nowrap` ; `transition: all 0.15s` |
| icône info | — | 16 × 16 | — | `#0f352d` | — |
| libellé « Voir plus » | idem | 16 / 24 | 500 | `#0f352d` | `overflow:hidden; text-overflow:ellipsis; white-space:nowrap` (`truncate`) |

Positions internes (1440) : horloge x = 109, « Ouvert » x = 135 (109 + 20 + 6), « • » x = 199 (193 + 6), texte ≈ 211 ([C1440]). « Réserver » : contenu 18 + 8 + 162 = 188 centré (libellé x = 241.2). « Voir plus » : 16 + 8 + 65 = 89 centré (libellé x = 288.7).

Sources CSS : `.p-5{padding:calc(var(--spacing)*5)}`, `.rounded-lg{border-radius:var(--radius)}`, `.rounded-md{border-radius:calc(var(--radius) - 2px)}`, `.h-11{height:calc(var(--spacing)*11)}`, `.h-10{height:calc(var(--spacing)*10)}`, `.px-3`, `.py-2`, `.gap-1\.5{gap:calc(var(--spacing)*1.5)}`, `.ml-2`, `.mb-3`, `.font-extrabold{font-weight:var(--font-weight-extrabold)}` (800), `.text-\[\#238700\]{color:#238700}`, `.bg-\[\#FFF198\]{background-color:#fff198}`, `.border-none{border-style:none}`, `.shadow-xs{--tw-shadow:0 1px 2px 0 …#0000000d}` — tous dans [CSS].

---

## 4. États

| État | Élément | Avant | Après | Source |
|---|---|---|---|---|
| survol | carte | `box-shadow: none` | `0 20px 25px -5px rgba(0,0,0,.1), 0 8px 10px -6px rgba(0,0,0,.1)` (`shadow-xl`), transition 0.15 s | [HOV] `card` ; [CSS] `.hover\:shadow-xl:hover` ; `hover-card-after-1440.png` |
| survol | « Réserver un créneau » | fond `rgb(15, 53, 45)` | fond `rgb(29, 92, 77)` (`#1d5c4d`), texte blanc inchangé | [HOV] `reserver` |
| survol | « Voir plus » | fond `rgb(255, 241, 152)`, texte `rgb(15, 53, 45)`, opacité 1 | fond inchangé, texte `oklch(0.21 0.006 285.885)` (`--accent-foreground`), **opacité 0.7** (tout le bouton, icône comprise) | [HOV] `voir-plus` ; [CSS] `.hover\:opacity-\[\.7\]:hover{opacity:.7}`, `.hover\:text-accent-foreground:hover` |
| survol | lien distance, nom | aucun changement (déjà souligné / curseur main) | — | [JS990] l.301-323 |
| focus clavier | « Voir plus » | — | `:focus-visible` → anneau 3 px `color-mix(in oklab, var(--ring) 50%, transparent)` (`--ring: oklch(70.5% .015 286.067)`) ajouté à `shadow-xs` ; `outline:none` | [CSS] `.focus-visible\:ring-\[3px\]`, `.focus-visible\:ring-ring\/50` |
| focus clavier | « Réserver », lien distance | — | contour natif du navigateur ; couleur de contour globale `*{outline-color: color-mix(in oklab, var(--ring) 50%, transparent)}` | [CSS] `@layer base` |
| focus | racine de la carte | — | non focalisable (`div` sans `tabindex`, pas d'accès clavier) | [JS990] l.287-291 |
| désactivé | — | aucun état désactivé utilisé (les classes `disabled:*` du bouton shadcn ne s'appliquent jamais) | — | — |
| sélection | carte de liste | — | **aucune** mise en évidence de la carte active (ni bordure ni fond) quand sa popup est ouverte ; la liste ne défile pas vers la carte quand on clique un marqueur | [JS128] l.959-965 |

---

## 5. Comportements

### 5.1 Clic sur la carte / sur le nom (liste de résultats)
- `onClick={onFocus}` sur la racine **et** sur le `span` du nom (le clic sur le nom appelle donc `onFocus` deux fois ; sans effet visible).
- `onFocus` (module 9306, [JS128] l.962) = `setFocusedPharmacy(pharmacy)` → la carte fait `panTo(lat,lng)`, `setZoom(16)` et ouvre la popup de cette pharmacie (voir `map.md` §6). Vérifié en direct.
- Recliquer la **même** carte après « Réinitialiser » ne recentre pas la carte (la valeur d'état est identique → l'effet React ne se relance pas) ; cliquer une autre carte fonctionne.
- Dans la popup de la carte, la racine n'a pas de `onFocus` : le clic sur le corps de la carte ne fait rien.

### 5.2 Lien distance « (x.x km) »
- Affiché seulement si `distance` est non vide (absent sur `/dermatologues` sans lieu).
- `onClick` : `e.stopPropagation()` (la carte n'est pas focalisée) puis `window.open("https://www.google.com/maps/dir/?api=1&destination=" + lat + "," + lng, "_blank")` — ex. `https://www.google.com/maps/dir/?api=1&destination=43.7148516,7.26141699`. Vérifié en direct (nouvel onglet).
- `href="#"` sans `preventDefault()` : l'action par défaut s'exécute aussi → le hash `#` est ajouté à l'URL courante et la page remonte en haut (**déduit du code**, non vérifié en direct). Le clone peut reproduire ce comportement ou le neutraliser (à décider dans DECISIONS.md).

### 5.3 Bouton « Réserver un créneau »
- Rendu seulement si `canBook === true`. Original : hook module 3674 ([JS990] l.474-512) :
  - clé = `idTechnique || codeMagasin || ""` ; clé vide → `false` ;
  - `GET /api/can-reserve/<encodeURIComponent(clé)>` → JSON `{canBook: boolean}` ; réponse non OK → `false` ; erreur réseau → `false` ;
  - cache mémoire par clé (Map module) + dédoublonnage des requêtes en vol ; valeur initiale `false` tant que la réponse n'est pas arrivée (le bouton apparaît après coup, la carte grandit de 52 px).
  - Clone : valeur statique issue de `pharmacy-extras.json` (pas de saut de mise en page).
- `onClick` : `e.stopPropagation()` puis ouverture de la modale (`BookingModal`, portail `document.body`), voir `booking-modal.md`. La modale est rendue comme **frère** de la carte dans un Fragment : les clics dans la modale ne remontent pas jusqu'à la carte.

### 5.4 Bouton « Voir plus »
`onClick` ([JS990] l.391-414) :
```
e.stopPropagation()
items = []
région = regionOf(codePostal) ; dép = deptName(codePostal) ; ville = pharmacy.ville || ""
si région : items.push(région)
si dép et dép.toLowerCase() !== ville.toLowerCase() : items.push(dép)
si ville : items.push(ville)
chemin = "/" + items.map(slugify).join("/")            // "/" si vide
url    = chemin + "/" + pharmacy.id + "/" + slugify(pharmacy.nom)
si window.self !== window.top (page dans une iframe) : window.open("https://teleconsultation.tessan.io" + url, "_blank")
sinon : router.push(url)
```
`slugify`, `regionOf`, `deptName` : voir `results-page.md` §5.1. Exemples (échantillon) :

| code_magasin | URL |
|---|---|
| 557 | `/provence-alpes-cote-d-azur/alpes-maritimes/nice/557/pharmacie-saint-barthelemy` (vérifié : `docs/reference/capture-meta.json` → `fiche-*`) |
| 1340 | `/ile-de-france/paris/1340/pharmacie-louvre-victoire` (département « Paris » = ville → omis) |
| 1615 | `/corse/haute-corse/ville-di-pietrabugno/1615/pharmacie-petri-guasco` (CP 20200 → 2B) |
| 390 | `/auvergne-rhone-alpes/rhone/lyon/390/pharmacie-du-dauphin-totum` |

Aucune spécialité n'est ajoutée au chemin. Pas d'ancre `<a>` : navigation client (pas d'ouverture au clic milieu).

### 5.5 Statut d'ouverture
`status = computeOpeningStatus(pharmacy.horaires)` à chaque rendu (pas de minuterie de rafraîchissement). Découpage `displayText.split(" · ")` : partie 0 → `span` gras coloré ; partie 1 (si présente) → `span.text-xs` « • » + texte. Détails et tous les textes possibles : `opening-status.md`.

---

## 6. Variante « popup de carte » (même composant, mesurée)

Rendue dans l'`OverlayView` Google (voir `map.md` §7), à l'intérieur de `div.shadow-2xl.rounded-[15px].overflow-hidden.bg-white` (largeur 380 px). Tout le contenu hérite de `.gm-style` : **Roboto, Arial, sans-serif 11 px / 400** ; seuls les éléments ayant une classe de taille la redéfinissent. Mesures [POP] (1440) :

| Élément | Boîte | Police | Taille | Graisse | Couleur |
|---|---|---|---|---|---|
| carte | 380 × 258 (padding 20, radius 10) | Roboto | 11 px | 400 | — |
| zone contenu | 338 × 216 | — | — | — | — |
| `h3` | 338 × 28 | Recoleta (règle h3) | 20 px | 400 | gray-800 |
| nom « Pharmacie Nice Etoile » | 223 × 27 | Recoleta | 20 px | 700 | gray-800 |
| « (1.6 km) » | 53 × 22 | Recoleta | 16 px | 400 | gray-800 |
| adresse / CP | 338 × 24 | **Roboto** | 16 px | 500 | gray-500 |
| `p` statut | 338 × 24 | Roboto | **11 px** (texte « Ferme à 20:00 » hérité de `.gm-style`) | 500 | gray-700 |
| « Ouvert » | 48 × 24 | Roboto | 16 px | 800 | `rgb(35, 135, 0)` |
| « • » | 4 × 16 | Roboto | 12 px | 500 | gray-700 |
| « Réserver un créneau » | 338 × 44 ; libellé 150 × 24 | Roboto | 16 px | 600 | blanc sur `#0f352d` |
| « Voir plus » | 338 × 40 ; libellé 63 × 24 | Roboto | 16 px | 500 | `#0f352d` sur `#fff198` |

Conséquence visible ([PNG] `marker-popup-1440.png`) : dans la popup, « Ferme à 20:00 » est petit (11 px) et la police des lignes non titrées est Roboto. Un nom long peut faire passer « (2.6 km) » à la ligne (ex. « Pharmacie Grande Corniche (2.6 km) », [PNG] `booking-modal-1440.png` en arrière-plan).

---

## 7. Textes exacts

| Emplacement | Texte |
|---|---|
| distance | `(` + `x.x km` + `)` — ex. `(0.0 km)`, `(1.6 km)` (point décimal, pas de virgule) |
| ligne CP | `{codePostal} {ville} ` (espace final) |
| statut | voir `opening-status.md` (`Ouvert`, `Fermé`, `Ferme à 19:30`, …) ; séparateur `•` (U+2022) |
| bouton 1 | `Réserver un créneau` |
| bouton 2 | `Voir plus` |
| nom par défaut | `Sans nom` (si `nom_poi` et `nom_etablissement` vides) |

Attributs de suivi : `data-cta="reserver_creneau"`, `data-cta="voir_plus_pharmacie"`, `data-slot="button"` (sur « Voir plus »).

---

## 8. Liens

| Élément | Cible | Onglet |
|---|---|---|
| « (x.x km) » | `https://www.google.com/maps/dir/?api=1&destination=<lat>,<lng>` | nouvel onglet (`window.open(…, "_blank")`) |
| « Voir plus » | `/<région>/<département?>/<ville>/<id>/<slug-nom>` | même onglet (`router.push`) ; nouvel onglet vers `https://teleconsultation.tessan.io…` si la page est dans une iframe |
| « Réserver un créneau » | ouvre la modale (pas de navigation) | — |

---

## 9. Ambiguïtés

1. Saut en haut de page après clic sur la distance (`href="#"` sans `preventDefault`) : déduit du code, non observé.
2. Popup à 375 px : la popup mesure 380 px alors que la carte fait 279 px de large ; elle est rognée par `overflow-hidden` du conteneur (non capturé).
3. `canBook` réel dépend d'une API privée ; l'échantillon fige la valeur relevée le 25/09/2026.
