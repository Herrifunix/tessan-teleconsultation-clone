# Spécification — Carte (`MapView`)

> Module **9382** (export `A`, [JS990] l.2563-2942), chargement paresseux de l'API Google via le fournisseur **6264** ([JS990] l.903-957). Utilisé par : la page de résultats (liste + carte), l'accueil / repli « ville inconnue » (carte seule), la fiche point de vente (1 pharmacie). Le clone peut utiliser une autre bibliothèque (cf. `docs/checklist.json` P2-08 « Leaflet sans clé ») : ce document décrit le comportement et l'apparence **à reproduire**, avec les paramètres Google d'origine.

## 0. Sources

| Alias | Fichier |
|---|---|
| [JS990] | `docs/research/js/pretty/990-ede1d18ec8eaf918.js` (9382 carte, 6264 chargeur, 91 carte de pharmacie) |
| [JS128] | `docs/research/js/pretty/128-230074a16c9361a5.js` (9306 section résultats, 2128 page/accueil) |
| [JS541] | `docs/research/js/pretty/541-add46bd6cf5ba31f.js` (fiche) |
| [C375] [C768] [C1440] | `docs/research/pages/results/computed-{375,768,1440}.json` |
| [H375] [H768] [H1440] | `docs/research/pages/home/computed-{375,768,1440}.json` |
| [F1440] etc. | `docs/research/pages/fiche/computed-{375,768,1440}.json` |
| [POP] | `docs/research/pages/specialty-city/popup.json` (popup mesurée) |
| [OUT] | `docs/research/pages/specialty-city/outline.txt` l.187-247 |
| [NET] | `docs/research/pages/home/network.json` |
| [HOV] | `docs/research/hover-states.json` (`map-reset`) |
| [CSS] | `docs/research/css/323d88a92ac6be07.css` |
| [PNG] | `docs/reference/results-{375,1440}.png`, `states/marker-popup-1440.png`, `states/hover-map-reset-{before,after}-1440.png`, `states/unknown-city-1440.png` |

---

## 1. Interface

| Prop | Défaut | Rôle |
|---|---|---|
| `pharmacies` | — | pharmacies à afficher (marqueurs + calcul d'emprise) |
| `focusedPharmacy` | — | pharmacie focalisée (clic carte de liste / marqueur) → zoom 16 + popup |
| `onPharmacyClick(p)` | — | appelé au clic d'un marqueur |
| `showInfoWindow` | `true` | `false` sur la fiche : jamais de popup |
| `isInitialView` | `false` | `true` sur l'accueil : pas d'ajustement d'emprise |
| `disableClustering` | `false` | jamais passé à `true` dans les bundles |

Instances :

| Gabarit | Conteneur (classes exactes) | Hauteur | Props | Source |
|---|---|---|---|---|
| Résultats | `rounded-r-md overflow-hidden shadow-md h-[calc(3*280px+2*24px)] lg:sticky lg:top-24` | **888 px** à tous viewports ; largeur 279 (375), 656 (768), 801.6 (1440) | `pharmacies=résultats`, `focusedPharmacy`, `onPharmacyClick=d` | [JS128] l.967-975 ; [C375]/[C768]/[C1440] ; [CSS] `.h-\[calc\(3\*280px\+2\*24px\)\]{height:888px}` |
| Accueil / ville inconnue | `rounded-md overflow-hidden shadow-md h-[calc(100vh-400px)] min-h-[600px]` | `max(100vh − 400px, 600px)` : 600 (375 × 812), 624 (768 × 1024), 600 (1440 × 900) | `isInitialView=true`, toutes les pharmacies, `onMarkerClick` (§9) | [JS128] l.978-987 ; [H375]/[H768]/[H1440] |
| Fiche | `rounded-lg overflow-hidden shadow-md h-[500px] lg:sticky lg:top-24` | 500 px (263/656/588 de large) | `pharmacies=[p]`, `focusedPharmacy=p`, `onPharmacyClick=()=>{}`, `showInfoWindow=false` | [JS541] l.858-866 ; [F1440] etc. |

Rayons : `rounded-r-md` = coins **droits seulement** 8 px (`border-radius: 0 8px 8px 0`, [C1440]) — y compris en mobile où la carte est sous la liste ; `rounded-md` = 8 px ; `rounded-lg` = 10 px. Ombre `shadow-md` = `0 4px 6px -1px #0000001a, 0 2px 4px -2px #0000001a` ([CSS] `.shadow-md`).

---

## 2. Chargement paresseux

### 2.1 Fournisseur (6264, [JS990] l.903-957)
- Contexte `{isLoaded, loadError, requestLoad, shouldLoad}`. Tant que `shouldLoad` est faux, **aucun script Google n'est chargé**.
- `requestLoad()` → `shouldLoad = true` → monte `useJsApiLoader({googleMapsApiKey: <clé>, libraries: ["places"]})`. Requête observée : `https://maps.googleapis.com/maps/api/js?key=…&v=weekly&libraries=places&loading=async&callback=initMap` ([NET]). La bibliothèque `marker` n'étant pas demandée, `google.maps.marker.AdvancedMarkerElement` est indisponible → les marqueurs sont des **`google.maps.Marker` classiques** (confirmé par le DOM : `div[title][role=button]` 32 × 48 + `img transparent.png`, [POP] `outer`).
- Erreur de chargement : `console.error("[LazyGoogleMaps] Error loading Google Maps API:", e)` ; la carte reste sur l'état « Chargement de la carte... » (pas d'UI d'erreur).

### 2.2 Déclenchement (9382, [JS990] l.2612-2637)
- `IntersectionObserver` sur le conteneur racine, options `{threshold: 0.1, rootMargin: "100px"}`.
- Première intersection : `console.log("[MapView] Map container is visible, requesting Google Maps load")`, `visible = true`, `requestLoad()`, `observer.disconnect()`.

### 2.3 Placeholder (tant que `isLoaded` est faux)

```html
<div style="position:relative;width:100%;height:100%" class="bg-slate-100 flex flex-col items-center justify-center">
 <div class="text-center p-8">
  <div class="relative">
   <svg class="lucide lucide-map-pin text-tessan-green mx-auto mb-4 animate-bounce" width="48" height="48"/>
  </div>
  <!-- visible && shouldLoad : -->
  <div class="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-tessan-green border-r-transparent mb-4"></div>
  <p class="text-gray-600 font-medium">Chargement de la carte...</p>
  <!-- sinon : -->
  <p class="text-gray-500">Faites défiler pour afficher la carte</p>
 </div>
</div>
```
Valeurs : fond slate-100 `oklch(96.8% .007 247.896)` ; icône 48 px `#0f352d` ; `animate-bounce` = `bounce 1s infinite` (`0%,to{transform:translateY(-25%);animation-timing-function:cubic-bezier(.8,0,1,1)} 50%{transform:none;animation-timing-function:cubic-bezier(0,0,.2,1)}`) ; spinner 32 × 32, bordure 4 px `#0f352d` dont la droite transparente, `spin 1s linear infinite` ; textes 16/24, gray-600 `oklch(44.6% .03 256.802)` 500 ou gray-500 `oklch(55.1% .027 264.364)` 400 ([CSS] `@keyframes bounce`, `--animate-spin`, `--animate-bounce`).

---

## 3. Carte chargée : DOM et options

```html
<div style="position:relative;width:100%;height:100%">      <!-- même nœud que le placeholder (réconcilié) -->
 <GoogleMap mapContainerStyle={{width:"100%",height:"100%"}} center={{lat:46.603354,lng:1.888334}} zoom={6} options={…}>
   {selection && showInfoWindow && <OverlayView …popup… />}   <!-- §7 -->
 </GoogleMap>
 <div class="absolute top-4 left-4 flex flex-col gap-2 z-10"> …2 boutons (§8)… </div>
</div>
```

| Option | Valeur | Source |
|---|---|---|
| centre initial | `{lat: 46.603354, lng: 1.888334}` (centre de la France) | [JS990] l.2590 |
| zoom initial | `6` | l.2799 |
| `mapTypeControl` | `false` | l.2803 |
| `streetViewControl` | `false` | l.2804 |
| `fullscreenControl` | `true` (bouton plein écran en haut à droite) | l.2805 |
| `gestureHandling` | `"greedy"` (molette = zoom sans Ctrl ; un doigt = déplacement de carte sur mobile) | l.2806 |
| `styles` | `[{featureType:"poi", elementType:"labels", stylers:[{visibility:"off"}]}]` → libellés/icônes de POI masqués | l.2807-2813 |
| type | roadmap par défaut ; commandes par défaut de l'API « weekly » (commande caméra ronde en bas à droite, logo Google en bas à gauche, barre d'attribution « Raccourcis clavier · Données cartographiques ©2026 Google · Conditions d'utilisation · Signaler une erreur cartographique ») | [PNG] 1440 |

Apparence des tuiles relevée ([PNG] `results-1440.png`) : terre `#f6f5f5`, eau `#90daee`, parcs verts pâles, routes blanches/grises, autoroutes bleu-gris ; bouton plein écran blanc 40 × 40 à 10 px des bords haut/droite ; commande caméra ronde blanche 40 px en bas à droite.

Fin de vie : `onUnmount` → `clusterer.clearMarkers()` et oubli de l'instance.

---

## 4. Marqueurs

Pour chaque pharmacie ([JS990] l.2688-2729) :

```js
new google.maps.Marker({
  map, position: {lat, lng}, title: pharmacie.nom,         // infobulle native = nom
  icon: { url: "/marker.svg", scaledSize: new google.maps.Size(32, 48), anchor: new google.maps.Point(16, 48) }
})
marker.addListener("click", () => { setSelection(p); onPharmacyClick?.(p); })
```
- Icône `/marker.svg` (non archivée localement) : épingle « goutte » vert Tessan `#0f352d` (pixel mesuré [PNG] 1440 (1031, 975)), avec un disque blanc en haut contenant une croix « + » verte ; boîte 32 × 48, **ancre au milieu du bord inférieur** (16, 48) → la pointe désigne la coordonnée. À reproduire en SVG maison.
- Variante (non active, si `AdvancedMarkerElement` existait) : `div` 32 × 48, `background-image:url(/marker.svg)`, `background-size:contain`, `background-repeat:no-repeat`, `background-position:center`, `cursor:pointer`.
- Tous les marqueurs sont supprimés puis recréés quand `pharmacies`, `onPharmacyClick` ou `map` changent (l.2777). Sur la page de résultats, `onPharmacyClick` est une nouvelle fonction à chaque rendu → recréation à chaque focalisation (sans effet visible notable).

## 5. Regroupement (clusters)

`new MarkerClusterer({map, markers, renderer, algorithm: new SuperClusterAlgorithm({maxZoom: 11, radius: 65}), onClusterClick})` (`@googlemaps/markerclusterer`, [JS990] l.2733-2772) :

| Paramètre | Valeur |
|---|---|
| algorithme | SuperCluster, `radius: 65` (px), `maxZoom: 11` → regroupement pour les zooms ≤ 11 ; marqueurs individuels à partir de 12 ; `minPoints` par défaut (2) |
| rendu | `google.maps.Marker({position, icon:{url: svgDataUri(count), scaledSize: Size(50,50), anchor: Point(25,25)}, label: undefined, zIndex: google.maps.Marker.MAX_ZINDEX + count})` |
| clic | `map.setCenter(cluster.position)` puis `map.setZoom((map.getZoom() \|\| 6) + 3)` (remplace le comportement par défaut « fitBounds du cluster ») |

SVG exact (l.2574-2589), encodé `"data:image/svg+xml;charset=UTF-8," + encodeURIComponent(svg)` :
```xml
<svg xmlns="http://www.w3.org/2000/svg" width="50" height="50" viewBox="0 0 50 50">
  <circle cx="25" cy="25" r="22" fill="#0F352D" stroke="white" stroke-width="3" opacity="0.9"/>
  <text x="25" y="25" text-anchor="middle" dy="0.35em" fill="white" font-family="Montserrat, sans-serif" font-size="16" font-weight="600">{count}</text>
</svg>
```
- Disque Ø 44 + contour blanc 3 px (Ø visuel ≈ 47 px), opacité 0.9 sur le disque seulement ; nombre blanc 16 px graisse 600 centré (`dy=0.35em`). Montserrat n'étant pas disponible dans une image SVG, le navigateur retombe sur une sans-serif système ([PNG] 375 : cluster « 2 » sur Nice).
- Accueil ([PNG] `unknown-city-1440.png`) : nombreux clusters (ex. 193 sur Paris) au zoom 6.

---

## 6. Focalisation, emprise, réinitialisation

| Déclencheur | Effet | Source |
|---|---|---|
| `focusedPharmacy` change (non nul) et carte prête | `map.panTo({lat,lng})` ; `map.setZoom(16)` ; `setSelection(p)` → popup (§7) | l.2644-2650 |
| Clic marqueur (résultats) | `setSelection(p)` + `onPharmacyClick(p)` → la page met `focusedPharmacy = p` → pan + zoom 16 + popup (vérifié en direct) | l.2724-2726 ; [JS128] l.930-932 |
| Clic carte de liste | `focusedPharmacy = p` → idem (vérifié en direct) | [JS128] l.962 |
| Carte prête / `pharmacies` changent, **sans** focalisation, **hors** accueil, liste non vide | emprise ajustée (ci-dessous) | l.2651-2683 |
| Résultats changent | la page remet `focusedPharmacy = null` → nouvel ajustement d'emprise | [JS128] l.927-929 |

Ajustement d'emprise :
```
dansFrance = pharmacies.filter(lat ∈ [41, 51] ET lng ∈ [-5, 10])        // bornes incluses
si dansFrance non vide :
    bounds = LatLngBounds étendue à chaque point de dansFrance ; map.fitBounds(bounds)   // marge par défaut de l'API
    une seule fois sur "bounds_changed" : si map.getZoom() > 15 → map.setZoom(15)        // zoom max 15 (ex. 1 seul résultat)
sinon : map.fitBounds(emprise de toutes les pharmacies)                                 // pas de plafond de zoom
```
- Résultats vides : aucun ajustement → centre France, zoom 6.
- Résultat Nice (5 pharmacies) : à 1440 × 888 px la carte cadre Nice avec marqueurs individuels ; à 375 (279 px de large) le zoom obtenu est ≤ 11 et deux pharmacies proches forment un cluster « 2 » ([PNG]).

Bouton « Réinitialiser » : `map.panTo({lat:46.603354, lng:1.888334})`, puis **après 300 ms** `map.setZoom(6)`, et fermeture de la popup (`setSelection(null)`) ; ne remet pas `focusedPharmacy` à `null` côté page (l.2684-2686). Conséquence : juste après une réinitialisation, recliquer la **même** pharmacie (carte de liste ou marqueur) ne refait ni pan ni zoom 16 (l'état React est inchangé) ; le marqueur rouvre seulement sa popup, la carte de liste ne fait rien. Une autre pharmacie fonctionne normalement.

Bouton « Me géolocaliser » : si `navigator.geolocation` et carte prête → `getCurrentPosition(pos => { map.panTo({lat: pos.coords.latitude, lng: pos.coords.longitude}); map.setZoom(15); })` ; aucun rappel d'erreur, aucun marqueur de position, aucun indicateur de chargement, pas de nouvelle recherche (l.2877-2888).

Molette : écouteur `wheel` natif sur le conteneur racine avec `{passive:false}` → `preventDefault()` + `stopPropagation()` (l.2778-2790). Effet : la molette au-dessus de la carte (et du placeholder, même nœud) **ne fait jamais défiler la page** ; sur la carte chargée elle zoome (gestion `greedy`). Tactile : un doigt déplace la carte (pas de message « utilisez deux doigts ») ; en mobile la carte de 888 px est plus haute que l'écran de 812 px → le défilement de page se fait hors carte.

---

## 7. Popup de marqueur (OverlayView)

Rendue si `selection && showInfoWindow` ([JS990] l.2815-2859), via `OverlayViewF` à la position de la pharmacie, `mapPaneName = OVERLAY_MOUSE_TARGET` (reçoit les clics).

```html
<div class="relative" style="transform: translate(-50%, calc(-100% - 40px)); width: 380px;">
 <button class="absolute -top-2 -right-2 z-10 bg-white rounded-full p-1 shadow-lg hover:bg-gray-100 transition">   <!-- onClick: setSelection(null) -->
  <svg class="lucide lucide-x text-gray-600" width="16" height="16"/>
 </button>
 <div class="shadow-2xl rounded-[15px] overflow-hidden bg-white">
  <PharmacyCard pharmacy={selection}/>     <!-- sans onFocus ; voir pharmacy-card.md §6 -->
 </div>
 <div class="absolute left-1/2 -translate-x-1/2 bg-white"
      style="bottom:-10px;width:20px;height:10px;clip-path:polygon(50% 100%, 0% 0%, 100% 0%);filter:drop-shadow(0 4px 6px rgba(0, 0, 0, 0.1))"></div>
</div>
```

Mesures [POP] (1440, pharmacie « Nice Etoile », zoom 16) :

| Élément | Boîte (x, y, l × h) | Valeurs |
|---|---|---|
| point d'ancrage (coordonnée) | 951, 333 | = bas-centre du marqueur 32 × 48 posé en (935, 285) |
| boîte popup | 761, 34 — **380 × 258** | `transform: matrix(1,0,0,1,-190,-298)` = −50 % × 380 et −(258 + 40) ; le bas de la popup est à 41 px au-dessus de l'ancre |
| bouton fermer | 1125, 26 — 24 × 24 | débord −8 px en haut et à droite ; fond blanc ; padding 4 ; `border-radius: 3.35544e+07px` (cercle) ; ombre `shadow-lg` ; icône X 16 × 16 gray-600 `oklch(0.446 0.03 256.802)` ; survol fond gray-100 `oklch(96.7% .003 264.542)` ; transition 0.15 s |
| enveloppe | 380 × 258 | fond blanc ; radius **15 px** ; ombre `shadow-2xl` = `0 25px 50px -12px #00000040` ; `overflow:hidden` |
| carte interne | 380 × 258 | padding 20 ; bordure 1 px gray-200 ; radius 10 (visible à l'intérieur de l'arrondi 15) |
| flèche | 941, 292 — 20 × 10 | triangle blanc pointe en bas, centré ; ombre portée `0 4px 6px rgba(0,0,0,.1)` |
| typographie | — | hérite de `.gm-style` : **Roboto, Arial, sans-serif 11 px** ; titres en Recoleta (règle h3) ; voir `pharmacy-card.md` §6 |

Comportements :
- Fermée par : bouton X, « Réinitialiser », sélection d'une autre pharmacie. **Pas** de fermeture au clic sur le fond de carte ni à la touche Échap.
- Contenu interactif : « Réserver un créneau » (modale, si `canBook`), « Voir plus » (navigation), lien distance (itinéraire Google). Le clic sur le corps de carte ne fait rien.
- Une seule popup à la fois. Hauteur variable (nom sur 2 lignes → plus haute) ; la translation `-100%` garde le bas à 40 px au-dessus de l'ancre.
- À 375 px la popup (380 px) dépasse la carte (279 px) et est rognée par `overflow-hidden` du conteneur (non capturé).
- Superposition : popup au-dessus des marqueurs (conteneur de calque `z-index: 106`, [POP] `outer`).

---

## 8. Boutons superposés « Réinitialiser » / « Me géolocaliser »

```html
<div class="absolute top-4 left-4 flex flex-col gap-2 z-10">
 <button class="bg-white hover:bg-[#fcf5cc] text-tessan-green rounded-lg shadow-lg p-3 transition-colors duration-200 flex items-center gap-2 font-medium cursor-pointer" title="Réinitialiser la vue">
  <svg class="lucide lucide-maximize2 lucide-maximize-2" width="20" height="20"/>
  <span class="hidden sm:inline">Réinitialiser</span>
 </button>
 <button class="bg-white hover:bg-[#fcf5cc] text-tessan-green rounded-lg shadow-lg p-3 transition-colors duration-200 flex items-center gap-2 font-medium cursor-pointer" title="Me géolocaliser">
  <svg class="lucide lucide-locate-fixed" width="20" height="20"/>
  <span class="hidden sm:inline font-bold">Me géolocaliser</span>
 </button>
</div>
```

| Mesure | 375 [C375] | 768 [C768] | 1440 [C1440] |
|---|---|---|---|
| conteneur (décalage 16 px du coin haut-gauche de la carte) | 44 × 96 | 180 × 104 | 180 × 104 |
| bouton « Réinitialiser » | 44 × 44 (icône seule) | 180 × 48 | 180 × 48 |
| bouton « Me géolocaliser » | 44 × 44 | 180 × 48 | 180 × 48 |
| libellé « Réinitialiser » | masqué (`hidden`, < 640 px) | 89 × 24, graisse 500 | 89 × 24, 500 |
| libellé « Me géolocaliser » | masqué | 128 × 24, graisse **700** | 128 × 24, 700 |

- Largeur ≥ 640 px : `flex-col` étire les deux boutons à la largeur du plus large : 12 + 20 + 8 + 128 + 12 = 180.
- Styles : fond `#fff` ; texte/icône `#0f352d` ; police Plus Jakarta Sans 16/24 ; padding 12 ; `gap` 8 ; radius 10 ; ombre `shadow-lg` (`0 10px 15px -3px rgba(0,0,0,.1), 0 4px 6px -4px rgba(0,0,0,.1)`) ; transition des couleurs **0.2 s** (`duration-200`) ([C1440] ; [CSS] `.duration-200{--tw-duration:.2s;transition-duration:.2s}`).
- Survol : fond `rgb(252, 245, 204)` (`#fcf5cc`), texte inchangé ([HOV] `map-reset`, [PNG] `hover-map-reset-after-1440.png`).
- Focus : contour natif (couleur de contour globale ring 50 %). Pas d'état désactivé.
- Superposition : le conteneur de boutons (`z-10`) est frère du conteneur Google ; la popup vit dans un calque interne à la carte (z 106 *à l'intérieur* de ce conteneur) → en cas de chevauchement, les boutons passent au-dessus de la popup (déduit, non observé).

---

## 9. Carte de l'accueil (et repli « ville inconnue »)

- `isInitialView = true` : pas d'ajustement d'emprise → France entière (centre `46.603354, 1.888334`, zoom 6), toutes les pharmacies en clusters ([PNG] `unknown-city-1440.png`).
- Clic sur un marqueur (quand zoom ≥ 12 ou marqueur isolé) : popup + pan/zoom 16 (via `onPharmacyClick → focusedPharmacy`) **puis** `onMarkerClick(p)` de la page ([JS128] l.610-650) :
  ```
  proches = toutes.filter(q => haversine(p, q) <= 10)              // rayon 10 km, p inclus (0 km)
  proches = sortByDistance(proches, p)                             // "x.x km", tri sur la valeur arrondie
  R(proches, p.ville || "Autour du point sélectionné", undefined, {lat: p.lat, lng: p.lng})
  ```
  → navigation vers la page de résultats `/<région>/<département>/<ville>` (fil d'Ariane construit depuis `proches[0]` = `p`), résultats transmis par `sessionStorage` (voir `results-page.md` §6.3). Pas de règle du minimum.
- Clic sur un cluster : centrage + zoom + 3.

---

## 10. Équivalences pour un clone sans clé Google (indicatif)

| Google | Équivalent attendu |
|---|---|
| zoom 6 / 11 / 12 / 15 / 16 | mêmes niveaux (Web Mercator, tuiles 256 px) |
| `fitBounds` + plafond 15 | `fitBounds(bounds)` puis `if (zoom > 15) setZoom(15)` (ou `maxZoom: 15`) |
| SuperCluster radius 65 / maxZoom 11 | bibliothèque de clustering avec rayon 65 px et désactivation au-delà du zoom 11 ; icône = SVG ci-dessus ; clic = centre + zoom + 3 |
| `Marker` 32 × 48 ancre (16, 48) | icône 32 × 48, `iconAnchor [16, 48]`, `title` = nom |
| OverlayView `translate(-50%, calc(-100% - 40px))` | calque HTML positionné à la coordonnée avec la même transformation (ne pas utiliser la popup native de la bibliothèque) |
| `gestureHandling: "greedy"` + écouteur `wheel` | molette = zoom sans modificateur, jamais de défilement de page au-dessus de la carte ; glisser à un doigt = déplacement |
| POI masqués | fond de carte clair sans POI (terre ≈ `#f6f5f5`, eau ≈ `#90daee`) |
| plein écran (haut droite), commande caméra (bas droite), attribution (bas) | commandes visuellement équivalentes aux mêmes emplacements |

---

## 11. Textes exacts

| Emplacement | Texte |
|---|---|
| placeholder (avant visibilité) | `Faites défiler pour afficher la carte` |
| placeholder (chargement) | `Chargement de la carte...` |
| bouton 1 (libellé / `title`) | `Réinitialiser` / `Réinitialiser la vue` |
| bouton 2 (libellé / `title`) | `Me géolocaliser` / `Me géolocaliser` |
| infobulle marqueur | nom de la pharmacie (`title`) |
| libellé de repli (accueil) | `Autour du point sélectionné` (requête quand la ville du marqueur est vide) |

---

## 12. Ambiguïtés

1. `/marker.svg` n'est pas archivé : forme décrite d'après capture (épingle `#0f352d`, disque blanc, croix verte).
2. Marge exacte de `fitBounds` (valeur par défaut de l'API Google) non mesurée ; le rendu final dépend aussi de la taille de la carte.
3. Popup plus large que la carte en mobile : comportement non capturé.
4. Superposition boutons/popup (z-index) déduite, non observée.
