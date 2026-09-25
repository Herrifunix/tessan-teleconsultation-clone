# Fiche — carte d'information principale, description et carrousel

Suite de `pharmacy-page.md` (abréviations `[OUT]`, `[C375]`, `[JS541]`… définies au §0 de ce fichier). Composant `N` de l'original [JS541:200-376],
description + carrousel = composant `g` [JS541:30-132]. DOM capturé [OUT:47-146].

## 1. Structure

```html
<div class="p-6">
  <div class="bg-white rounded-lg shadow-lg p-4 md:p-6">
    <div class="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4 md:gap-6 mb-6">
      <div>                                                        <!-- colonne infos -->
        <h1 class="text-xl md:text-3xl text-gray-800 mb-2 font-bold"
            style="font-family: Recoleta, recoleta, &quot;recoleta Fallback&quot;, sans-serif;">
          <span class="cursor-pointer">Pharmacie Saint Barthélémy</span>
          <!-- " " puis, seulement si pharmacy.distance (jamais le cas via l'API de la fiche, distance = null) :
               <a href="#" class="hover:underline cursor-pointer"><span class="text-lg font-normal cursor-pointer">(1.6 km)</span></a>
               clic = ouverture de l'itinéraire, comme le bouton « Itinéraire » -->
        </h1>
        <div>
          <address class="text-sm md:text-base flex flex-col not-italic lg:text-lg font-medium text-gray-600 mb-2">
            <span>51 Av. Alfred Borriglione</span>
            <span>06100 Nice</span>                              <!-- {codePostal} + " " + {ville} -->
          </address>
          <p class="flex items-center gap-2 text-sm md:text-base font-medium text-gray-700">
            <svg class="lucide lucide-clock text-[#238700]" width="20" height="20"/>   <!-- text-red-600 si fermé -->
            <span class="font-extrabold text-base md:text-lg text-[#238700]">Ouvert</span>
            <span class="text-xs">•</span>
            Ferme à 19:30
          </p>
        </div>
      </div>
      <div class="flex flex-col lg:flex-row lg:items-center lg:flex-wrap gap-3">   <!-- colonne boutons -->
        <button data-cta="reserver_creneau" class="flex items-center justify-center gap-2.5 bg-[#FFF198] hover:bg-[#f5e76b] text-tessan-green font-bold rounded-lg py-3.5 px-6 transition-colors text-base md:text-lg cursor-pointer shadow-sm">
          <svg class="lucide lucide-calendar-days md:w-6 md:h-6" width="22" height="22"/><span>Réserver un créneau</span>
        </button>                                                 <!-- seulement si canBook -->
        <a href="tel:0492091000" data-cta="call_pharmacy" class="flex items-center justify-center gap-2 bg-tessan-green hover:bg-tessan-green-hover text-white font-medium rounded-lg py-2 px-4 transition-colors text-xs md:text-base cursor-pointer">
          <svg class="lucide lucide-phone md:w-5 md:h-5" width="18" height="18"/><span class="truncate">0492091000</span>
        </a>
        <button data-cta="itineraire_pharmacie" class="flex items-center justify-center gap-2 bg-white border-2 border-tessan-green text-tessan-green hover:bg-[#fcf5cc] font-medium rounded-lg py-2 px-4 transition-colors text-xs md:text-base cursor-pointer">
          <svg class="lucide lucide-navigation md:w-5 md:h-5" width="18" height="18"/><span>Itinéraire</span>
        </button>
      </div>
    </div>
    <div class="pt-6 border-t border-gray-200">                   <!-- seulement si description non vide -->
      <div class="overflow-hidden"> … description + carrousel (§5-6) … </div>
    </div>
  </div>
  <!-- modale de réservation (module 7686) montée ici quand ouverte -->
</div>
```

Dans la ligne de statut, les espaces `" "` du JSX autour de `•` sont des nœuds texte blancs **ignorés** par le conteneur flex : l'espacement
vient uniquement du `gap:8px` entre les 4 éléments flex (icône, « Ouvert », « • », texte anonyme « Ferme à 19:30 »). À 1440 : icône x 104→124,
« Ouvert » x 132 (w 64), « • » x 204 (w 6), texte à x 218 [C1440 `M>div:1>div:0>div:0>div:0>div:1>p:1`].

Icônes lucide (même tracé que `lucide-react`) : `clock`, `calendar-days`, `phone` (path exact [JS541:16-24]), `navigation` (polygon `3 11 22 2 13 21 11 13 3 11`, [JS541:25-27]).

## 2. Valeurs calculées

Source : [C375], [C768], [C1440] chemins `M>div:1>div:0>…`.

| Élément | 375 | 768 | 1440 |
|---|---|---|---|
| bloc `div.p-6` | `[0,627.7,375×3809]` | `[0,653.8,768×2621]` | `[56,455.2,1328×2103]` |
| carte (fond blanc, rayon 10, `shadow-lg`) | `[24,651.7,327×3761]`, padding **16** | `[24,677.8,720×2573]`, padding **24** | `[80,479.2,1280×2055]`, padding 24 |
| ligne haute (`mb-6` 24) | colonne, `gap:16px`, `[40,667.7,295×272]` | colonne, `gap:24px`, `[48,701.8,672×316]` | **ligne**, `justify-content:space-between`, `align-items:flex-start`, `gap:24px`, `[104,503.2,1232×136]` |
| colonne infos | 295×108 | 672×128 | 412×136 (largeur = contenu, ici le nom) |
| h1 nom | Recoleta **700**, **20 px / 28 px**, gray-800, `mb 8` ; `[40,667.7,295×28]` | **30 px / 36 px** ; `[48,701.8,672×36]` | 30 / 36 ; `[104,503.2,412×36]` |
| address (2 lignes, `flex-col`, `font-style:normal`) | **14 / 20**, 500, gray-600 `#4a5565`, `mb 8` ; h 40 | **16 / 24** ; h 48 | **18 / 28** (`lg:text-lg`) ; h 56 |
| p statut | 14 / 20, 500, gray-700 `#364153`, `gap 8`, `align-items:center` ; h **24** | 16 / 24 ; h **28** | 16 / 24 ; h 28 |
| · icône horloge | 20×20, `#238700` (ouvert) / red-600 `#e7000b` (fermé) | idem | idem |
| · mot d'état « Ouvert »/« Fermé » | **800**, **16 / 24**, `#238700`/red-600 ; 58 px de large | **800, 18 / 28** ; 64 px | 18 / 28 ; 64 px |
| · « • » | 12 px / 16 px, 500, gray-700 | idem | idem |
| · suite (« Ferme à 19:30 ») | 14 / 20, 500, gray-700 | 16 / 24 | 16 / 24 |
| colonne boutons | colonne, `gap:12px`, étirée : 295 de large, h 148 | colonne, 672 de large, h 164 | **ligne**, `align-items:center`, `flex-wrap:wrap`, `gap:12px`, `[748,503.2,588×56]` |
| Réserver un créneau | `[40,791.7,295×52]` ; texte **16 / 24** ; icône **22** | `[48,853.8,672×56]` ; **18 / 28** ; icône **24** | `[748,503.2,264×56]` ; 18 / 28 ; icône 24 |
| Téléphone | `[40,855.7,295×34]` ; **12 / 16** ; icône **18** | `[48,921.8,672×40]` ; **16 / 24** ; icône **20** | `[1024,511.2,167×40]` |
| Itinéraire | `[40,901.7,295×38]` ; 12 / 16 ; icône 18 | `[48,973.8,672×44]` ; 16 / 24 ; icône 20 | `[1203,509.2,133×44]` |
| séparateur `pt-6 border-t` | `[40,963.7,295×3433]` | `[48,1041.8,672×2185]` | `[104,663.2,1232×1847]` |
| zone description (`overflow-hidden`) | `[40,988.7,295×3408]` | `[48,1066.8,672×2160]` | `[104,688.2,1232×1822]` |

Styles communs des boutons (identiques à toutes les largeurs sauf mentions ci-dessus) :

| Bouton | Fond | Texte | Graisse | Padding | Gap | Bordure / rayon / ombre | Survol |
|---|---|---|---|---|---|---|---|
| Réserver un créneau (`button`) | `#FFF198` = `rgb(255, 241, 152)` | `#0f352d` | **700** | 14 px 24 px | 10 px | rayon 10 ; `shadow-sm` | fond `#f5e76b` |
| Téléphone (`a`) | `#0f352d` | blanc | 500 | 8 px 16 px | 8 px | rayon 10 | fond `#1d5c4d` |
| Itinéraire (`button`) | blanc | `#0f352d` | 500 | 8 px 16 px (dans la bordure) | 8 px | **bordure 2 px `#0f352d`**, rayon 10 | fond `#fcf5cc` |

Tous : `display:flex; align-items:center; justify-content:center`, `transition: color, background-color, border-color… .15s cubic-bezier(.4,0,.2,1)`,
`cursor:pointer`, icône puis libellé. Hauteurs : Réserver = 14 + ligne (24 ou 28) + 14 ; Téléphone = 8 + max(icône 18/20, ligne 16/24) + 8 ;
Itinéraire = 2 + 8 + max(icône, ligne) + 8 + 2. Largeurs à 1440 = contenu (264 = 24+24+10+182+24 ; 167 = 16+20+8+107+16 ; 133 = 2+16+20+8+69+16+2).
En colonne (< 1024) les trois s'étirent sur toute la largeur, contenu centré.

## 3. Comportements

- **Réserver un créneau** : rendu **uniquement si `canBook`**. `canBook` = hook du module 3674 [JS990:474-512] : `GET /api/can-reserve/<encodeURIComponent(idTechnique || codeMagasin)>` →
  `{canBook}` ; résultat mis en cache par clé ; `false` tant que la réponse n'est pas arrivée, si la réponse n'est pas OK ou en cas d'erreur (le bouton
  apparaît donc après coup, décalant les deux autres). Dans le clone : champ `canBook` de `src/data/pharmacy-extras.json`. Clic → ouvre la **modale de
  réservation** partagée (module 7686, captures `docs/reference/states/booking-modal-*.png`, `docs/research/pages/specialty-city/booking-modal-step*.json`) pour
  cette pharmacie ; sa fermeture la démonte. Libellé US : `Book a slot`.
- **Téléphone** : lien natif `tel:` + numéro brut (`tel:0492091000`) ; libellé = numéro tel quel, sans formatage (`0492091000`), tronqué avec ellipse si trop long.
- **Itinéraire** : `window.open("https://www.google.com/maps/dir/?api=1&destination=" + lat + "," + lng, "_blank")` — pour 557 :
  `https://www.google.com/maps/dir/?api=1&destination=43.7148516,7.26141699`. Libellé US : `Directions`.
- Le `span.cursor-pointer` du nom n'a aucune action (curseur main seulement).
- Attributs `data-cta` à conserver (`reserver_creneau`, `call_pharmacy`, `itineraire_pharmacie`).

## 4. Texte de statut (module 6504, `VK(horaires, maintenant, "fr")`) [JS990:958-1101]

Spécification complète (catalogue des textes, fuseau) : `opening-status.md` ; résumé ci-dessous. Utilisé ici, dans la ligne du jour des horaires et dans la carte partagée « à proximité ». `horaires.<jour>` est une chaîne
`"HH:MM-HH:MM, HH:MM-HH:MM"` ou `"Fermé"` (vide → `"Fermé"`). Jour courant = `["dimanche","lundi",…,"samedi"][now.getDay()]`, minutes = `h*60+m`.

1. Pour chaque créneau du jour : si `début ≤ maintenant < fin` (fin **exclue**) → ouvert :
   - s'il existe un créneau commençant après cette fin : `Ouvert · Ferme à {fin} (Réouvre à {début suivant})`
   - sinon : `Ouvert · Ferme à {fin}`
2. Sinon, prochaine ouverture `p` :
   - un créneau d'aujourd'hui commence plus tard → `p = "HH:MM"` (**sans « à »**) ;
   - sinon premier créneau des jours J+1…J+7 : J+1 → `p = "demain à HH:MM"` ; au-delà → `p = "<jour en minuscules> à HH:MM"` (ex. `lundi à 09:00`) ;
   - aucun créneau sur 7 jours → texte `Fermé` seul.
3. Verbe : `Ouvre` si on est avant le 1er créneau du jour **ou** si `p` contient « demain » / un nom de jour ; sinon `Réouvre`. Texte : `Fermé · {verbe} {p}`.

Exemples exacts : `Ouvert · Ferme à 19:30` ; `Ouvert · Ferme à 12:30 (Réouvre à 14:30)` ; `Fermé · Ouvre 09:00` ; `Fermé · Réouvre 14:30` ;
`Fermé · Ouvre demain à 09:00` ; `Fermé · Ouvre lundi à 09:00` ; `Fermé`.

Affichage : `texte.split(" · ")` → partie 0 dans le span coloré (vert `#238700` si ouvert, red-600 sinon, icône de la même couleur) ; si partie 1 :
`<span class="text-xs">•</span>` puis la partie 1. `Fermé` seul → pas de puce. Heure de référence : voir Ambiguïté 3 de `pharmacy-page.md` (Europe/Paris dans le clone).

## 5. Description — règles de rendu [JS541:34-54]

Rendue seulement si `pharmacy.description` est non vide ; sinon ni séparateur, ni photos (même si des images existent).

```html
<div class="overflow-hidden">
  [<div class="float-right ml-6 mb-4 relative w-1/2"> photo + contrôles </div>]   <!-- si ≥ 1 image chargée -->
  <div class="text-gray-700 leading-relaxed space-y-3 prose prose-sm max-w-none"> HTML transformé </div>
</div>
```

Algorithme exact de transformation de la chaîne HTML :

```
parts = description.split(/(<br\s*\/?>)/i)          // conserve les <br> comme éléments
out = [] ; dansListe = false
pour chaque e de parts :
  si e est exactement un <br> (/^<br\s*\/?>$/i) : si !dansListe → out.push(e) ; continuer      // <br> supprimés dans une liste
  s = e.trim()
  si s commence par "- " :
     si !dansListe → out.push('<ul class="list-disc list-inside my-2 space-y-1">') ; dansListe = true
     out.push("<li>" + s.slice(2).trim() + "</li>")
  sinon :
     si dansListe → out.push("</ul>") ; dansListe = false
     out.push(e)                                    // segment NON trimé (les "\n" deviennent des espaces)
fin : si dansListe → out.push("</ul>")
html = out.join("")   → injecté tel quel (innerHTML) : <b>, <i>, <strong>… sont conservés
```

Conséquences : une ligne « `- xxx` » (après trim) devient un `<li>` ; les `<br>` séparant les puces disparaissent ; une ligne vide (`<br><br>`) ferme la liste,
et le `<br>` qui suit est émis **après** `</ul>` → une ligne blanche de 26 px sous la liste. Avant la liste, `texte :<br><br>` donne une ligne blanche.
Aucune sanitisation dans l'original ; le clone doit **assainir** le HTML (liste blanche `b, i, strong, em, br, ul, li` + la classe de `ul`) avant injection (sécurité, sans effet visuel).

Résultat pour 557 (textes longs abrégés `…`) :

```html
<b>Vous cherchez un médecin disponible rapidement à Nice ou près de chez vous ?</b><br><br>
À la Pharmacie Saint Barthélémy, le dispositif … médical.<br><br>
Agréé Société de Téléconsultation par … des Médecins.<br><br>
<b>Consultez pour les motifs du quotidien</b><br><br>
La téléconsultation prend en charge de nombreux motifs médicaux courants :<br><br><ul class="list-disc list-inside my-2 space-y-1"><li>Fièvre, mal de gorge, angine, symptômes grippaux</li><li>Vomissements, infection urinaire, cystite</li><li>Ordonnance et arrêt de travail (jusqu'à 3 jours) si nécessaire</li><li>Certificat médical</li><li>Besoin d'un avis médical rapide</li><li>...</li></ul><br>
<i>En cas d'urgence vitale, appelez le <b>15</b> ou le <b>112</b>.</i><br><br>
<b>Sans rendez-vous et sur rendez-vous : ce qui est disponible</b><br><br>
<i>Sans rendez-vous :</i><br><br><ul …><li>Médecin généraliste, en moins de 15 minutes</li><li>Avis dermatologique en moins de 48 h (consultation généraliste suivie d'un avis spécialisé à distance)</li><li>Pédiatrie sur créneaux dédiés aux familles</li></ul><br>
<i>Sur rendez-vous, sous 7 jours en moyenne :</i><br><br><ul …><li>Gériatrie</li><li>Pneumologie</li></ul><br>
<b>Une téléconsultation de qualité, avec des outils médicaux connectés</b><br><br> … <b>Accessibilité du dispositif</b><br><br> …
<b>Tarif et remboursement</b><br><br> … <b>Réservez votre créneau avant de venir</b><br><br> …
<b>Trouver un médecin disponible aujourd'hui à Nice</b><br><br>Si vous cherchez un médecin disponible à Nice, … avis dermatologique.
```

Styles (mesurés [C1440 `M>div:1>div:0>div:1>div:0>div:1…`], identiques aux 3 largeurs) :

| Élément | Valeurs |
|---|---|
| conteneur texte | Plus Jakarta Sans **400, 16 px, line-height 26 px** (`leading-relaxed` = 1.625), gray-700 `#364153`, `max-width:none`. `prose` / `prose-sm` n'ont **aucune règle** dans [CSS] (pas de plugin typography) → ne pas les implémenter |
| `space-y-3` | `:where(.space-y-3>:not(:last-child)){margin-block-end:12px}` : ne touche que les enfants éléments (`b`, `i`, `br` inline → sans effet ; `ul` → écrasé par `my-2`) → **aucun effet visible** |
| `b`, `strong` | 700 (`bolder`) |
| `i` | italique |
| `ul` | `list-style: disc inside`, padding 0 (preflight), `margin: 8px 0` ; puce au bord gauche du texte |
| `li` | `margin-bottom:4px` sauf le dernier (`space-y-1`) → pas vertical de 30 px entre deux puces (26 + 4) |
| hauteur totale | 1822 (1440) ; 2160 (768) ; 3408 (375) |

Repères Y à 1440 : 1er `b` 690.2 ; « Consultez pour… » 1054.2 ; 1re liste 1164.2 (h 176) ; « En cas d'urgence… » 1376.2 ; 2e liste 1538.2 (h 86) ;
3e liste 1718.2 (h 56) ; « Une téléconsultation de qualité… » 1810.2 ; « Trouver un médecin… » 2382.2 ; fin 2510.2.
Le texte s'écoule à gauche du flottant ; les blocs `ul` gardent la pleine largeur (1232) mais leurs lignes évitent la photo.

## 6. Carrousel photo [JS541:55-124]

Conteneur : `float:right; margin-left:24px; margin-bottom:16px; position:relative; width:50%` de la zone description.

```html
<div class="float-right ml-6 mb-4 relative w-1/2">
  <img src="{images[index]}" alt="Photo du dispositif Tessan" class="rounded-lg shadow-md w-full h-auto max-h-[600px] object-contain">
  <!-- si ≥ 2 images chargées : -->
  <button class="absolute left-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white rounded-full p-2 shadow-md transition-all" aria-label="Image précédente">
    <svg class="lucide lucide-chevron-left text-gray-800" width="24" height="24"/>
  </button>
  <button class="absolute right-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white rounded-full p-2 shadow-md transition-all" aria-label="Image suivante">
    <svg class="lucide lucide-chevron-right text-gray-800" width="24" height="24"/>
  </button>
  <div class="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/50 text-white px-3 py-1 rounded-full text-sm">1 / 5</div>
</div>
```

| Élément | 375 | 768 | 1440 |
|---|---|---|---|
| conteneur / image (photo 1 de 557, ratio 4:3) | `[187.5,988.7,147.5×110.6]` | `[384,1066.8,336×252]` | `[720,688.2,616×462]` |
| bouton précédent | `[195.5,1024,40×40]` | `[392,1172.8,40×40]` | `[728,899.2,40×40]` |
| bouton suivant | `[287,1024,40×40]` | `[672,1172.8,40×40]` | `[1288,899.2,40×40]` |
| compteur | `[236.8,1055.3,49×28]` (chevauche les flèches) | `[527.5,1274.8,49×28]` | `[1003.5,1106.2,49×28]` |

- Image : `display:block`, `width:100%`, `height:auto`, `max-height:600px`, `object-fit:contain`, rayon 10, `shadow-md`. Une photo portrait plafonne à 600 px de haut (letterbox transparent dans la boîte arrondie).
- Flèches : 40×40 (padding 8 + icône 24), fond `rgba(255,255,255,.8)` (`#fffc`), survol fond blanc, rond, `shadow-md`, `transition: all .15s`, à 8 px du bord, centrées verticalement (`top:50%` + `translate:0 -50%`), icône gray-800 `#1e2939`. **Pas de `cursor-pointer`** → curseur flèche. Pas d'attribut `type`.
- Compteur : fond `rgba(0,0,0,.5)`, texte blanc 14 px / 20 px 400, padding 4 px 12 px, rond, à 16 px du bas, centré horizontalement (`left:50%` + `translate:-50% 0`). Texte `{index+1} / {nombre}` (espaces autour de « / »).

Comportement :
1. **Préchargement** : à chaque changement de la liste d'URL, chaque URL est chargée via `new Image()` ; `onload` → conservée, `onerror` → **retirée** ;
   `Promise.all` → la liste filtrée (ordre conservé) remplace l'état et l'index revient à 0. Tant que ce n'est pas fini, **aucune photo** n'est rendue
   (le texte occupe toute la largeur) puis la photo apparaît (décalage de mise en page).
2. 0 image chargée → pas de conteneur photo ; 1 image → photo seule, sans flèches ni compteur ; ≥ 2 → flèches + compteur.
3. Précédent : `index === 0 ? n-1 : index-1` ; suivant : `index === n-1 ? 0 : index+1` (boucle). Changement instantané de `src`, sans animation,
   sans défilement automatique, sans swipe, sans clavier. La hauteur peut changer d'une photo à l'autre (le texte se ré-écoule).
