# Fiche — carte « Horaires d'ouverture » + carte géographique

Suite de `pharmacy-page.md` (abréviations au §0). Source : [OUT:147-235], [JS541:749-871], carte partagée `MapView` (module 9382) [JS990:2563-2960].

## 1. Structure

```html
<div class="p-6">
  <div class="bg-white rounded-lg shadow-lg p-8">
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-10 items-start">
      <div>
        <div class="mb-8">
          <h3 class="text-xl font-bold text-gray-800 mb-4"
              style="font-family: Recoleta, recoleta, &quot;recoleta Fallback&quot;, sans-serif;">Horaires d'ouverture</h3>
          <div class="space-y-2">
            <!-- ligne du jour (1re ligne) -->
            <div class="flex justify-between items-center py-2 border-b border-gray-200">
              <span class="font-bold text-gray-700 capitalize">Vendredi</span>
              <span class="font-bold text-gray-600"><span class="font-extrabold text-[#238700]">Ouvert</span> <span class="text-xs text-gray-600 font-normal">•</span> 09:00-12:30, 14:30-19:30</span>
            </div>
            <!-- 6 autres jours, dans l'ordre de la semaine en bouclant -->
            <div class="flex justify-between items-center py-2 border-b border-gray-200">
              <span class="font-medium text-gray-700 capitalize">Samedi</span>
              <span class=" text-gray-600">09:00-12:30, 14:30-19:00</span>     <!-- classe avec espace initial dans l'original -->
            </div>
            …
          </div>
        </div>
      </div>
      <div class="rounded-lg overflow-hidden shadow-md h-[500px] lg:sticky lg:top-24">
        <!-- MapView(pharmacies=[pharmacy], focusedPharmacy=pharmacy, onPharmacyClick=()=>{}, showInfoWindow=false) -->
      </div>
    </div>
  </div>
</div>
```

Apostrophe droite ASCII dans `Horaires d'ouverture` (US : `Opening hours`).

## 2. Règles des lignes d'horaires [JS541:772-853]

- Ordre : `["lundi","mardi","mercredi","jeudi","vendredi","samedi","dimanche"]` **pivoté pour commencer au jour courant** (`getDay()` : 0 = dimanche).
  Capture (vendredi) : Vendredi, Samedi, Dimanche, Lundi, Mardi, Mercredi, Jeudi. Toujours 7 lignes.
- Libellé du jour : `Lundi … Dimanche` (déjà capitalisés ; classe `capitalize` en plus). US : `Monday … Sunday`.
- Valeur : `horaires[jour] || "Fermé"`, affichée **telle quelle** (tiret ASCII, virgule + espace : `09:00-12:30, 14:30-19:30`). Jour fermé : `Fermé` (US : `Closed`).
- Ligne du jour : libellé et valeur en **gras 700** ; la valeur est précédée de `<span font-extrabold>Ouvert|Fermé</span>` + `" "` + `<span text-xs>•</span>` + `" "`
  (espaces rendus, contexte inline). `Ouvert`/`Fermé` = `isOpen` de `VK()` (voir `pharmacy-page-main-card.md` §4) : vert `#238700` si ouvert, red-600 `#e7000b` sinon.
  Un jour courant fermé affiche donc `Fermé • Fermé`.
- Autres lignes : libellé 500, valeur 400.

## 3. Valeurs calculées

Source : [C*] `M>div:2>…` (1440/768) — même chemin à 375.

| Élément | 375 | 768 | 1440 |
|---|---|---|---|
| bloc `div.p-6` | `[0,4436.7,375×1111]` | `[0,3274.8,768×1063]` | `[56,2558.2,1328×612]` |
| carte (blanc, rayon 10, `shadow-lg`, padding **32** partout) | `[24,4460.7,327×1063]` | `[24,3298.8,720×1015]` | `[80,2582.2,1280×564]` |
| grille (`gap:40px`, `align-items:start`) | 1 colonne 263 ; `[56,4492.7,263×999]` | 1 colonne 656 ; `[56,3330.8,656×951]` | **2 colonnes 588 + 588** ; `[112,2614.2,1216×500]` |
| colonne horaires (inclut `mb-8` = 32, contenue car élément de grille) | 263×459 | 656×411 | 588×411 |
| h3 | Recoleta **700**, 20 px / 28 px, gray-800 `#1e2939`, `margin-bottom:16px` ; `[56,4492.7,263×28]` | `[56,3330.8,656×28]` | `[112,2614.2,588×28]` |
| liste `space-y-2` | h 383 | h 335 | `[112,2658.2,588×335]` |
| ligne | `display:flex; justify-content:space-between; align-items:center; padding:8px 0; border-bottom:1px solid gray-200 #e5e7eb; margin-bottom:8px` (sauf la dernière) ; hauteur **41** (8+24+8+1), ou **65** quand la valeur passe sur 2 lignes | 41 | 41 ; pas de 49 px |
| libellé jour | 16 / 24, gray-700 `#364153`, 700 (jour) / 500 | idem | idem |
| valeur | 16 / 24, gray-600 `#4a5565`, 700 (jour) / 400 ; alignée à droite par `space-between` | idem | ex. `[417,2666.2,283×24]` (jour), `[503,…,197×24]`, « Fermé » `[652,…,48×24]` |
| « Ouvert » (ligne du jour) | 16 px **800** `#238700` | idem | `[417,2667.2,58×21]` |
| « • » | 12 px / 16 px, **400**, gray-600 | idem | `[478,2672.2,6×15]` |
| conteneur carte | 263×500, `position:static` | 656×500, **sous** les horaires (y 3781.8), static | `[740,2614.2,588×500]`, **`position:sticky; top:96px`** |
| conteneur carte : style | rayon 10, `overflow:hidden`, `shadow-md` | idem | idem |

**Retour à la ligne à 375** : la valeur est un élément flex rétrécissable ; quand « libellé + valeur » dépasse 263 px elle passe sur 2 lignes,
**alignée à gauche** (`text-align:start`) et collée au libellé (aucun gap) : Vendredi `[129,4544.7,190×48]` (« Ouvert • 09:00-12:30, » / « 14:30-19:30 »),
Mercredi `[126,4813.7,193×48]` (« 09:00-12:30, 14:30- » / « 19:30 », césure après le tiret) ; le libellé reste centré verticalement (ligne de 65 px).
Samedi/Lundi/Mardi/Jeudi tiennent sur une ligne (valeur 195–197 px).

**Sticky à ≥ 1024** : la grille fait exactement la hauteur de la carte (500 > 411), donc le `sticky` n'a aucune course visible ; le reproduire quand même
(`lg:sticky lg:top-24`).

## 4. Carte géographique (`MapView` partagé)

Spécification complète du composant (marqueurs, clusters, équivalences Leaflet du clone P2-08) : `map.md`. Ci-dessous, uniquement l'usage sur la fiche.

Props sur la fiche : `pharmacies=[pharmacy]`, `focusedPharmacy=pharmacy`, `onPharmacyClick=()=>{}`, `showInfoWindow=false` (défauts :
`isInitialView=false`, `disableClustering=false`).

### 4.1 Chargement paresseux
Tant que l'API Google Maps n'est pas chargée, le conteneur affiche un **placeholder** :

```html
<div style="position:relative;width:100%;height:100%" class="bg-slate-100 flex flex-col items-center justify-center">
  <div class="text-center p-8">
    <div class="relative"><svg class="lucide lucide-map-pin text-tessan-green mx-auto mb-4 animate-bounce" width="48" height="48"/></div>
    <p class="text-gray-500">Faites défiler pour afficher la carte</p>
    <!-- une fois le chargement demandé, à la place du <p> :
    <div class="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-tessan-green border-r-transparent mb-4"></div>
    <p class="text-gray-600 font-medium">Chargement de la carte...</p> -->
  </div>
</div>
```

Déclenchement : `IntersectionObserver` sur le conteneur (`threshold: 0.1`, `rootMargin: "100px"`) → demande le chargement de l'API (clé + bibliothèque `places`).
Fond slate-100 `#f1f5f9`, épingle 48 px `#0f352d` qui rebondit (`animate-bounce`, `bounce 1s infinite`), textes 16 / 24 (gray-500 / gray-600 500).

### 4.2 Carte chargée
- Conteneur `style="position:relative;width:100%;height:100%"`, carte Google `width:100%;height:100%`, centre initial France `{lat:46.603354, lng:1.888334}`, zoom 6,
  puis dès que la carte est prête : `panTo(pharmacie)` + **`setZoom(16)`** (centre = coordonnées de la pharmacie, 557 : 43.7148516, 7.26141699).
- Options : `mapTypeControl:false`, `streetViewControl:false`, **`fullscreenControl:true`**, `gestureHandling:"greedy"`, style `poi` / `labels` → `visibility:off`
  (libellés des POI masqués ; les pictogrammes de transport restent). Fond de carte `rgb(229, 227, 223)` avant les tuiles.
- Contrôles Google visibles (capture 1440) : plein écran en haut à droite (carré blanc 40 px), contrôle caméra en bas à droite, logo Google en bas à gauche,
  attribution « Raccourcis clavier · Données cartographiques ©2026 Google · Conditions d'utilisation · Signaler une erreur cartographique » (dernier lien masqué à 375).
- **Un seul marqueur** : `div` 32×48, `background:url(/marker.svg) center/contain no-repeat`, curseur pointeur, ancré en bas au centre (16, 48), `title` = nom
  (clone : `public/marker.svg`, épingle vert foncé à croix blanche). Clustering MarkerClusterer (SuperCluster `radius 65`, `maxZoom 11`) sans effet visible avec 1 point.
  Clic marqueur → sélection interne, **aucune info-bulle** (`showInfoWindow=false`), callback vide.
- Molette : `wheel` intercepté sur le conteneur (`preventDefault` + `stopPropagation`, `passive:false`) → la page ne défile pas, la carte zoome (greedy).

### 4.3 Boutons superposés (haut gauche)

```html
<div class="absolute top-4 left-4 flex flex-col gap-2 z-10">
  <button title="Réinitialiser la vue" class="bg-white hover:bg-[#fcf5cc] text-tessan-green rounded-lg shadow-lg p-3 transition-colors duration-200 flex items-center gap-2 font-medium cursor-pointer">
    <svg class="lucide lucide-maximize-2" width="20" height="20"/><span class="hidden sm:inline">Réinitialiser</span>
  </button>
  <button title="Me géolocaliser" class="bg-white hover:bg-[#fcf5cc] text-tessan-green rounded-lg shadow-lg p-3 transition-colors duration-200 flex items-center gap-2 font-medium cursor-pointer">
    <svg class="lucide lucide-locate-fixed" width="20" height="20"/><span class="hidden sm:inline font-bold">Me géolocaliser</span>
  </button>
</div>
```

| | 375 | 768 | 1440 |
|---|---|---|---|
| groupe (à 16 px du haut et de la gauche, `gap:8px`, `z-index:10`) | `[72,5007.7,44×96]` | `[72,3797.8,180×104]` | `[756,2630.2,180×104]` |
| boutons | **44×44**, icône seule (libellés `hidden` sous 640 px) | 180×48 chacun (étirés à la largeur du plus large) | 180×48 |

Boutons : fond blanc, survol `#fcf5cc` [HOV map-reset], texte/icône `#0f352d`, rayon 10, `shadow-lg`, padding 12, `gap:8px`, 16 px / 24 px ;
« Réinitialiser » 500, « Me géolocaliser » **700** ; `transition-colors` **0.2 s** (`duration-200`).
Clic « Réinitialiser » : `panTo` centre France puis, 300 ms plus tard, `setZoom(6)`. Clic « Me géolocaliser » : `navigator.geolocation.getCurrentPosition` → `panTo` position + `setZoom(15)`.
