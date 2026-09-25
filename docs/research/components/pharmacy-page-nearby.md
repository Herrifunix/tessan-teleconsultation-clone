# Fiche — dispositifs, départements et régions à proximité

Suite de `pharmacy-page.md` (abréviations au §0). Source : [JS541:407-503] (calculs), [JS541:1049-1247] (rendu), carte partagée module 91 [JS990:225-437],
[OUT:280-480]. Les trois blocs sont absents pour une pharmacie US et chacun n'est rendu que si sa liste est non vide.

## 1. Données : distances, listes

Après le chargement de la pharmacie `P` (toujours pendant l'état « Chargement... ») :

1. Tous les points de vente actifs sont chargés (original : table Supabase `gmb_locations`, `actif_inactif = "Actif"`, par pages de 1000 ; clone : `src/data`).
2. Pour chacun : distance haversine depuis `P.coordonnees` (R = **6371** km, [JS990:770-780]) ; `distance = d.toFixed(1) + " km"` (point décimal, ex. `1.6 km`), `distanceNum = d` ;
   filtre `distanceNum <= 999999` (donc tous) ; tri croissant sur `distanceNum` [JS990:687-729].
3. `autres = liste.filter(e => e.id !== P.id)`.
4. **À proximité** = `autres.slice(0, 6)`.
5. **Départements** : pour chaque `e` de `autres`, `code = aZ(e.codePostal)` ; ignoré si vide ou égal à `aZ(P.codePostal)` (le département de la fiche est **exclu**) ;
   `km = parseFloat(e.distance.replace(" km",""))` (valeur arrondie à 0,1) ; cumul par code `{distances[], count}`. Puis
   `{departement: code, departementName: hl(code.length === 2 ? code + "000" : code), count, avgDistance: moyenne(distances)}`, tri **croissant sur la distance moyenne**, **10 premiers**.
6. **Régions** : même principe avec la clé `pG(e.codePostal)` (ignorée si vide) — la région de la fiche **n'est pas exclue** — tri croissant sur la distance moyenne, **10 premières**.

Les compteurs portent donc sur **tous** les points de vente du département / de la région (hors la fiche elle-même), pas sur un rayon.
Référence 557 (données originales, 1 807 points) :
- à proximité : Pharmacie Nice Etoile (1.6 km), Pharmacie Grande Corniche (2.6 km), Pharmacie de l'Ariane (4.3 km), Pharmacie la Trinité (5.5 km), Pharmacie Saint-Isidore (5.8 km), PHARMACIE DE FAMAJOR (8.5 km) ;
- départements : Var 47, Alpes-de-Haute-Provence 10, Hautes-Alpes 6, Bouches-du-Rhône 39, Vaucluse 27, Haute-Corse 8, Drôme 26, Gard 33, Isère 31, Savoie 5 ;
- régions : Provence-Alpes-Côte d'Azur 143, Corse 11, Auvergne-Rhône-Alpes 195, Bourgogne-Franche-Comté 102, Occitanie 198, Grand Est 169, Nouvelle-Aquitaine 183, Centre-Val de Loire 66, Île-de-France 211, Pays de la Loire 97.
Avec les 53 points du clone ces listes seront différentes (et plus courtes).

## 2. Bloc « Les dispositifs de téléconsultation Tessan à proximité »

```html
<div class="p-6">
  <div class="bg-white rounded-lg shadow-lg p-8">
    <h2 class="text-2xl text-gray-800 mb-6" style="font-family: Recoleta, recoleta, &quot;recoleta Fallback&quot;, sans-serif;">Les dispositifs de téléconsultation Tessan à proximité</h2>
    <p class="text-gray-600 mb-6">Découvrez les 6 dispositifs les plus proches</p>   <!-- "Découvrez les " + n + " dispositifs les plus proches", sans accord au singulier -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"> 6 × carte partagée (§3) </div>
  </div>
</div>
```

Styles des titres de section (identiques pour les 3 blocs de ce fichier) : h2 Recoleta **400**, **24 px / 32 px**, gray-800 `#1e2939`, `margin-bottom:24px` ;
p 16 px / 24 px 400, gray-600 `#4a5565`, `margin-bottom:24px`. Carte blanche : padding **32** à toutes les largeurs, rayon 10, `shadow-lg`.

| (état FAQ fermée) | 375 | 768 | 1440 |
|---|---|---|---|
| bloc `div.p-6` | `[0,6663.7,375×2124]` | `[0,5129.8,768×1106]` | `[56,3890.2,1328×748]` |
| carte blanche | `[24,6687.7,327×2076]` | `[24,5153.8,720×1058]` | `[80,3914.2,1280×700]` |
| h2 | 263×**96** (3 lignes) | 656×32 | 1216×32 |
| p | 263×**48** (2 lignes) | 656×24 | 1216×24 |
| grille (`gap:16px`) | **1 colonne** 263 ; h 1820 | **2 colonnes** 320 + 320 ; h 890 | **3 colonnes** 394.656 / 394.672 / 394.656 ; h 532 |
| cartes | 263×286 (la 5e, adresse sur 2 lignes : 310) | 320×286 | 394.7×258 |

Hauteur d'une carte = 2 (bordures) + 40 (padding) + h3 (28 ou 56 si le nom + distance passe sur 2 lignes) + 24 + 24 + 12 + 24 + 12 + 92 (boutons).
Les cartes d'une même rangée ont la même hauteur (étirement de grille).

## 3. Carte de pharmacie partagée (module 91, composant `H`)

Spécification complète du composant : `pharmacy-card.md` (mesurée sur la page résultats). Ci-dessous : le même composant tel que mesuré sur la fiche, avec `onFocus` = navigation vers la fiche.

```html
<div class="bg-white p-5 border border-gray-200 rounded-lg hover:shadow-xl transition cursor-pointer">          <!-- onClick = aller à la fiche -->
  <div class="flex gap-4">
    <div class="flex-1">
      <div class="flex justify-between items-start">
        <h3 class="text-gray-800 text-xl flex-1">
          <span class="cursor-pointer font-bold">Pharmacie Nice Etoile</span>
          <a href="#" class="cursor-pointer"><span class="text-base font-normal underline cursor-pointer ml-2">(1.6 km)</span></a>   <!-- si distance -->
        </h3>
      </div>
      <p class="text-gray-500 font-medium text-base">24 Av. Jean Médecin</p>
      <p class="text-gray-500 font-medium text-base mb-3">06000 Nice </p>                    <!-- {codePostal} {ville} + espace final -->
      <p class="font-medium mb-3 flex items-center gap-1.5 text-gray-700">
        <svg class="lucide lucide-clock h-5 w-5 text-[#238700]"/>                              <!-- text-red-600 si fermé -->
        <span class="font-extrabold text-base text-[#238700]">Ouvert</span> <span class="text-xs">•</span> Ferme à 20:00
      </p>
      <div class="flex flex-col gap-2 w-full">
        <button data-cta="reserver_creneau" class="w-full flex items-center justify-center gap-2 bg-tessan-green hover:bg-tessan-green-hover text-white font-semibold rounded-lg h-11 px-3 transition-colors text-base cursor-pointer">
          <svg class="lucide lucide-calendar-days" width="18" height="18"/><span>Réserver un créneau</span>
        </button>                                                                              <!-- si canBook -->
        <button data-slot="button" data-cta="voir_plus_pharmacie" class="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md font-medium transition-all disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive shadow-xs hover:text-accent-foreground dark:bg-input/30 dark:border-input dark:hover:bg-input/50 py-2 has-[>svg]:px-3 border-tessan-green hover:opacity-[.7] border border-none bg-[#FFF198] text-tessan-green w-full h-10 px-3 cursor-pointer text-base">
          <svg class="lucide lucide-info w-4 h-4"/><span class="truncate">Voir plus</span>
        </button>
      </div>
    </div>
  </div>
</div>
```

Valeurs calculées [C1440 `M>div:4>div:0>div:2>div:0…`] (identiques aux autres largeurs sauf dimensions) :

| Élément | Valeurs |
|---|---|
| carte | fond blanc, padding 20, bordure 1 px gray-200 `#e5e7eb`, rayon 10, `transition` (couleurs + `box-shadow` + transform… .15s) ; **survol : `shadow-xl`** [HOV card] ; curseur main |
| h3 | police titre globale Recoleta **400**, 20 px / 28 px, gray-800 ; nom en span **700** |
| distance | span Recoleta 16 px 400, **souligné**, `margin-left:8px`, gray-800 ; texte `(` + distance + `)` = `(1.6 km)` |
| adresse, CP ville | 16 / 24, **500**, gray-500 `#6a7282` ; la ligne CP a `margin-bottom:12px` |
| statut | flex, `gap:6px`, 16 / 24, 500, gray-700, `margin-bottom:12px` ; horloge 20×20 ; mot d'état 800 `#238700` / red-600 ; « • » 12 / 16 ; texte = `VK()` (voir `pharmacy-page-main-card.md` §4). À 1440 : « Ouvert » x 159 = 133 + 20 + 6 |
| boutons | colonne, `gap:8px`, pleine largeur |
| Réserver un créneau | h **44**, padding 0 12, fond `#0f352d`, blanc, 16 / 24 **600**, rayon 10, `gap:8px`, icône 18 ; survol `#1d5c4d` [HOV reserver] |
| Voir plus | h **40**, padding 8 px 12 px, fond `#FFF198`, texte `#0f352d` 16 / 24 **500**, **rayon 8** (`rounded-md`), **aucune bordure** (`border-none` final), `shadow-xs`, `gap:8px`, `white-space:nowrap`, `transition: all .15s`, icône info 16×16 ; **survol : `opacity:.7` + couleur `oklch(0.21 0.006 285.885)` ≈ `#18181b`** [HOV voir-plus] ; focus clavier : anneau 3 px `ring/50` |
| 1440 | carte 1 `[112,4050.2,394.7×258]` (y état fermé), contenu x 133 largeur 352.7 ; bouton Réserver 352.7×44 ; Voir plus 352.7×40 |
| 768 | 320×286 : le h3 passe sur 2 lignes, la coupure tombant **dans** la distance (« Pharmacie Nice Etoile (1.6 » / « km) ») ; contenu 278. Dans une rangée, le contenu reste calé en haut et la carte la plus courte est simplement étirée (boutons non alignés d'une carte à l'autre, ex. « Pharmacie la Trinité ») |
| 375 | 263×286 : contenu 221, le nom lui-même passe sur 2 lignes (« Pharmacie Nice » / « Etoile (1.6 km) ») |

Comportements :
- **Clic sur la carte** (ou sur le nom) → `router.push(URL canonique)` de cette pharmacie : `vR([région, département si ≠ ville, ville]) + "/" + id + "/" + slug(nom)`,
  ex. `/provence-alpes-cote-d-azur/alpes-maritimes/nice/<id>/pharmacie-nice-etoile`. La fiche se recharge (état « Chargement... » puis nouvelle fiche) ; le clone doit ramener en haut de page.
- **Distance** : `stopPropagation` puis `window.open("https://www.google.com/maps/dir/?api=1&destination=<lat>,<lng>", "_blank")`. Le `href="#"` n'est pas empêché dans l'original
  (l'URL courante reçoit `#` et la page remonte) — quirk sans intérêt, le clone peut faire `preventDefault`.
- **Réserver un créneau** (si `canBook` de cette pharmacie, cf. `pharmacy-page-main-card.md` §3) : `stopPropagation`, ouvre la modale de réservation pour cette pharmacie.
- **Voir plus** : `stopPropagation` ; même URL que le clic carte ; `router.push` — sauf si la page est dans une iframe (`window.self !== window.top`) : ouverture dans un nouvel onglet de l'URL absolue.

## 4. Blocs « départements » et « régions » à proximité

```html
<div class="p-6">
  <div class="bg-white rounded-lg shadow-lg p-8">
    <h2 class="text-2xl text-gray-800 mb-6" style="font-family: Recoleta, …">Les dispositifs de téléconsultation Tessan dans les départements à proximité</h2>
    <p class="text-gray-600 mb-6">Explorez les dispositifs disponibles dans les 10 départements les plus proches</p>
    <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
      <button class="bg-slate-50 hover:bg-tessan-green hover:text-white transition-colors rounded-lg p-4 text-center group cursor-pointer">
        <p class="font-semibold text-gray-800 group-hover:text-white mb-1">Var</p>
        <p class="text-sm text-gray-500 group-hover:text-white">47 dispositifs</p>
      </button>
      …
    </div>
  </div>
</div>
```

Textes exacts :
- départements : h2 `Les dispositifs de téléconsultation Tessan dans les départements à proximité` ; p `Explorez les dispositifs disponibles dans les ` + n + ` départements les plus proches` ;
- régions : h2 `Les dispositifs de téléconsultation Tessan dans les régions à proximité` ; p `Explorez les dispositifs disponibles dans les ` + n + ` régions les plus proches` ;
- tuile : nom (département : `departementName` ; région : nom de région) puis `count + " " + (count > 1 ? "dispositifs" : "dispositif")`.

| Élément | Valeurs |
|---|---|
| tuile (`button`) | fond slate-50 `#f8fafc`, rayon 10, padding 16, texte centré, `transition-colors .15s`, curseur main ; contenu **centré verticalement** (comportement natif de `<button>`) dans une rangée étirée à la tuile la plus haute ; **survol : fond `#0f352d` + les deux textes en blanc** [HOV dept-card] (la couleur des `p` change sans transition) |
| nom | 16 / 24, **600**, gray-800, `margin-bottom:4px` |
| compteur | **14 / 20**, 400, gray-500 |
| hauteur tuile | 16 + 24×lignes(nom) + 4 + 20×lignes(compteur) + 16 → 80 (1 ligne), 104 (nom sur 2 lignes)… |

| (état FAQ fermée) | 375 | 768 | 1440 |
|---|---|---|---|
| grille | **2 colonnes** de 123.5, `gap:16px` | **3 colonnes** de 208 | **5 colonnes** de 230.4 |
| départements : bloc / carte | `[0,8787.7,375×920]` / 327×872 | `[0,6235.8,768×640]` / 720×592 | `[56,4638.2,1328×416]` / 1280×368 |
| départements : h2 / p | 128 (4 lignes) / 72 (3 lignes) | 64 (2 lignes) / 24 | 32 / 24 |
| départements : rangées | 128, 104, 104, 80, 80 | 104, 80, 80, 80 | 104, 80 |
| régions : bloc / carte | `[0,9707.7,375×1068]` / 327×1020 | `[0,6875.8,768×664]` / 720×616 | `[56,5054.2,1328×416]` / 1280×368 |
| régions : h2 / p | 128 / 48 (2 lignes) | 64 / 24 | 32 / 24 |
| régions : rangées | 172 (« Provence-Alpes-Côte d'Azur » sur 4 lignes + « 143 dispositifs » sur 2), 148, 100, 124, 124 | 104, 104, 80, 80 | 104, 80 |

Comportements (pas d'appel de scroll explicite) :
- **Département** : prend le premier point de vente de `autres` ayant ce code département, calcule sa région `pG(cp)`, puis
  `router.push(vR([{région}, {département: departementName}]))` → ex. `/provence-alpes-cote-d-azur/var` (toujours région + département, même si le département porte le nom d'une ville).
- **Région** : `router.push("/" + slug(région))` → ex. `/provence-alpes-cote-d-azur`, `/ile-de-france`, `/corse`.
Ces URL mènent au gabarit « résultats » (hors de cette spec).
