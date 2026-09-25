# Spécification — Modale « Réserver un créneau — Passage prioritaire »

> Module **7686** ([JS990] l.1102-2474) : export `A` = coquille modale `BookingModal({pharmacy, onClose})` (fonction `S`, l.2397-2473) qui contient le contenu à étapes `BookingFlow` (fonction `y`, l.1620-2396). Ouverte par le bouton « Réserver un créneau » de la carte de pharmacie (liste et popup, module 91) et de la fiche (bundle 541, l.373). Captures : `docs/reference/states/booking-modal-1440.png` (étape 1), `booking-modal-step2-1440.png` (étape 2), `booking-modal-step3-1440.png` (étape 3), faites sur `/dermatologues/provence-alpes-cote-d-azur/alpes-maritimes/nice` pour « Pharmacie Saint Barthélémy » (`CAB_PHA_542_06100_1`), un **vendredi 25/09/2026 après 15 h**.

## 0. Sources

| Alias | Fichier |
|---|---|
| [JS990] | `docs/research/js/pretty/990-ede1d18ec8eaf918.js` (7686 modale ; 6504 `parseHours`/`toMinutes` ; 91 déclencheur) |
| [RAW] | `docs/research/js-logic-raw.md` (copie minifiée du module 7686) |
| [BM1] | `docs/research/pages/specialty-city/booking-modal-step1.json` (DOM + mesures 1440 de l'étape « service ») |
| [BM2] | `docs/research/pages/specialty-city/booking-modal-step2.json` (étape « créneau ») |
| [CSS] | `docs/research/css/323d88a92ac6be07.css` |
| [TOK] | `docs/research/tokens.json` |
| [DATA] | `src/data/locations.json`, `src/data/pharmacy-extras.json` |
| [PNG1] [PNG2] [PNG3] | captures d'états ci-dessus |

Icônes lucide (résolues dans `docs/research/js/950-bc85ee46b8dc195f.js`) : `x` (5229), `chevron-left` (368), `clock` (6983), `calendar-days` (383), `chevron-up` (2108), `chevron-down` (4033), `mail` (3664), `circle-check` (1362).

---

## 1. Ouverture, fermeture, portail

| Aspect | Comportement | Source |
|---|---|---|
| Déclencheur | clic « Réserver un créneau » (visible si `canBook`) → `e.stopPropagation()` + état `open = true` dans la carte | [JS990] l.374-388, l.433 |
| Montage | 1er rendu `null`, puis après montage (`useEffect`) rendu via `createPortal(…, document.body)` | l.2399-2402, l.2417-2472 |
| Verrou de défilement | à l'ouverture : mémorise `document.body.style.overflow`, le passe à `"hidden"` ; restaure la valeur au démontage | l.2403-2416 |
| Échap | écouteur `keydown` sur `window` : `key === "Escape"` → `onClose()` | l.2404-2407 |
| Clic sur le voile | `onClose()` (le panneau fait `stopPropagation`) | l.2422, l.2428 |
| Bouton × | `onClose()`, `aria-label="Fermer"` | l.2454-2460 |
| Lien « Fermer » (confirmation) | `onClose()` | l.2361-2368 |
| Réinitialisation | fermer démonte le flux → réouverture = étape « service », champs vides | — |
| Accessibilité | `role="dialog"`, `aria-modal="true"` ; **pas** d'`aria-labelledby`, pas de piège ni de déplacement du focus, `label` non relié à l'`input` | l.2423-2424 |
| Propagation | la modale est rendue comme **frère** de la carte : ses clics n'atteignent jamais le `onClick` de la carte | l.433 |

---

## 2. Coquille : DOM exact et mesures

```html
<div class="fixed inset-0 z-[100] bg-black/50 flex items-start md:items-center justify-center p-4 overflow-y-auto" role="dialog" aria-modal="true">
 <div class="bg-white rounded-lg shadow-xl w-full max-w-lg my-auto p-5 md:p-6 relative">
  <div class="flex items-start justify-between mb-3 gap-3">
   <div class="flex-1 min-w-0">
    <h3 class="text-gray-800 font-bold text-base md:text-lg truncate">Pharmacie Saint Barthélémy</h3>
    <p class="text-gray-500 text-xs md:text-sm truncate">51 Av. Alfred Borriglione, 06100 Nice</p>   <!-- {adresse}, {codePostal} {ville} -->
   </div>
   <button class="p-1.5 rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors cursor-pointer flex-shrink-0" aria-label="Fermer">
    <svg class="lucide lucide-x" width="20" height="20"/>
   </button>
  </div>
  <div class="border-t border-gray-200 mb-4"></div>
  <div>  <!-- BookingFlow, onClick stopPropagation -->
   <h4 class="text-lg md:text-xl font-bold text-gray-800 mb-3" style="font-family: Recoleta, recoleta, &quot;recoleta Fallback&quot;, sans-serif;">Réserver un créneau <span class="text-tessan-green">— Passage prioritaire</span></h4>
   <!-- contenu de l'étape courante (§4 à §7) -->
  </div>
 </div>
</div>
```

| Élément | 375 (déduit des classes) | 768 (déduit) | 1440 (mesuré [BM1]) |
|---|---|---|---|
| voile | plein écran, `rgba(0,0,0,.5)` (`#00000080`), padding 16, alignement **haut** (`items-start`) mais `my-auto` du panneau le centre s'il y a la place ; défilement vertical du voile si le panneau dépasse | idem, `items-center` | 1440 × 900, `oklab(0 0 0 / 0.5)`, padding 16 |
| panneau | largeur 343 (375 − 2 × 16), padding **20** | largeur **512** (`max-w-lg` = 32rem), padding **24** | x 464, y 211, **512 × 477** (étape 1) / y 219, 512 × 461 (étape 2) ; padding 24 ; radius 10 ; ombre `shadow-xl` = `0 20px 25px -5px #0000001a, 0 8px 10px -6px #0000001a` |
| en-tête (`flex … gap-3`) | — | — | 464 × 48 ; `margin-bottom:12px` |
| `h3` nom | Recoleta **16/24** 700, tronqué (`…`) | Recoleta **18/28** 700 | 420 × 28, 18 px, 700, gray-800 `oklch(0.278 0.033 256.848)` |
| `p` adresse | 12/16 gray-500, tronqué | 14/20 | 420 × 20, 14 px, gray-500 `oklch(0.551 0.027 264.364)` |
| bouton × | 32 × 32 (padding 6 + icône 20) | idem | (920, 235) 32 × 32, icône gray-400 `oklch(0.707 0.022 261.325)`, cercle |
| séparateur | 1 px gray-200, `margin-bottom:16px` | idem | y 295, 464 × 1, `oklch(0.928 0.006 264.531)` |
| `h4` | Recoleta **18/28** 700 | Recoleta **20/28** 700 | y 312, 464 × 28 ; « — Passage prioritaire » 213 × 27, `#0f352d` |

États de la coquille : bouton × survol → fond gray-100 `oklch(96.7% .003 264.542)`, icône gray-600 `oklch(44.6% .03 256.802)`, transition couleurs 0.15 s ([CSS] `.hover\:bg-gray-100:hover`, `.hover\:text-gray-600:hover`). `z-index: 100` (au-dessus du header `z-50`). Les deux `h3`/`h4` utilisent la police Recoleta (règle de base et style en ligne) ; le reste Plus Jakarta Sans.

Hauteur étape 1 (1440) : 24 + 48 + 12 + 1 + 16 + 352 (contenu) + 24 = **477** ([BM1]).

---

## 3. Données et règles métier

### 3.1 Identifiant utilisé
`clientName = pharmacy.idTechnique || pharmacy.codeMagasin || pharmacy.id.toString()` (ex. `CAB_PHA_542_06100_1`) ([JS990] l.1651).

### 3.2 Services proposés (l.1612-1619, l.1652-1655)

| id | Libellé | Icône (emoji) | Condition d'affichage |
|---|---|---|---|
| `generaliste` | Médecine générale | 🩺 (U+1FA7A) | toujours |
| `dermato` | Avis dermatologique | 🔬 (U+1F52C) | seulement si `clientName` ∈ liste blanche « dermato » (Set de **407** identifiants, [JS990] l.1193-1601) |

Pharmacies de l'échantillon [DATA] présentes dans la liste blanche : 1340 `BOR_PHA_1816_75001_1`, 1535 `BOR_PHA_2075_75011_1`, 1609 `BOR_PHA_2169_95130_1`, 831 `BOR_PHA_779_95130_1`, 1066 `BOR_PHA_1005_92400_1`, 1615 `BOR_PHA_2171_20200_1`, 1013 `BOR_PHA_952_31470_1` (cette dernière a `canBook = false` : modale inaccessible). Toutes les autres n'affichent que « Médecine générale » (cas des captures : un seul bouton, [BM1]).

### 3.3 Planning hebdomadaire fixe par service (l.1109-1128)

| Jour | `generaliste` | `dermato` |
|---|---|---|
| lundi | — | — |
| mardi | `09:30-12:00, 16:00-18:00` | `09:30-12:00, 16:00-18:00` |
| mercredi | `09:30-12:00` | `09:30-12:00` |
| jeudi | `09:30-12:00, 16:00-18:00` | `09:30-12:00, 16:00-18:00` |
| vendredi | `09:30-12:00` | — |
| samedi / dimanche | — | — |

Indépendant des horaires de la pharmacie. Analyse des plages : `parseHours` du module 6504 (voir `opening-status.md` §1).

### 3.4 Jours fériés exclus (l.1129-1149)
`2026-01-01, 2026-04-06, 2026-05-01, 2026-05-08, 2026-05-14, 2026-05-25, 2026-07-14, 2026-08-15, 2026-11-01, 2026-11-11, 2026-12-25` — comparaison sur la date **locale** `AAAA-MM-JJ`. Aucune date après 2026.

### 3.5 Génération des créneaux (l.1685-1761)

```
jours = []
pour e = 0 .. 13 tant que jours.length < 3 :            // au plus 3 jours, cherchés sur 14 jours
    d = copie de maintenant ; d.setDate(maintenant.getDate() + e)       // garde l'heure courante
    si d est férié → continuer
    plages = planning[service][nomDuJour(d)] ; si vide → continuer
    seuil = (e === 0) ? minutesMaintenant + 60 : 0      // aujourd'hui : début ≥ maintenant + 1 h
    créneaux = []
    pour chaque plage [s, f] (minutes) :
        pour t = s ; t + 120 <= f ; t += 120 :           // créneaux de 2 h entièrement contenus
            si e === 0 et t < seuil → sauter
            créneaux.push({ startISO: iso(d, t), endISO: iso(d, t+120),
                            label: H(t) + "h" + MM(t) + " - " + H(t+120) + "h" + MM(t+120) })   // "9h30 - 11h30"
    si créneaux non vide : jours.push({date: d, dayLabel, slots: créneaux, slotCount: créneaux.length})
```
- Avec les plannings fixes, les seuls créneaux possibles sont **9h30 - 11h30** (plage 09:30-12:00 : 11:30 + 2 h > 12:00) et **16h00 - 18h00**.
- `dayLabel` : `e === 0` → `Aujourd'hui` ; `e === 1` → `Demain` ; sinon `{Jour} {jourDuMois} {mois}` avec Jour ∈ `Dimanche, Lundi, Mardi, Mercredi, Jeudi, Vendredi, Samedi` et mois ∈ `jan., fév., mars, avr., mai, juin, juil., août, sept., oct., nov., déc.` ; jour du mois **sans zéro** (ex. `Mardi 29 sept.`, `Jeudi 1 oct.`).
- `iso(d, minutes)` : copie de `d`, `setHours(h, m, 0, 0)`, puis formatage des composantes **locales** en `AAAA-MM-JJTHH:MM:SS.mmmZ` (suffixe `Z` artificiel : l'heure murale locale est présentée comme UTC ; ex. 09:30 à Paris → `2026-09-29T09:30:00.000Z`) (l.1175-1192).
- Filtrage par réservations existantes (si la liste API est non vide) : retirer tout créneau `[start, end)` qui chevauche une réservation `[slotStartTime, slotEndTime)` (`start < rEnd && end > rStart`, via `Date.parse`, réservations invalides ignorées) ; `slotCount` recalculé ; jours devenus vides supprimés (on peut alors afficher moins de 3 jours) (l.1762-1790).

Exemples (vérifiés par portage fidèle, heure de Paris) :

| Maintenant | Service | « Maintenant » | Jours affichés |
|---|---|---|---|
| ven. 25/09/2026 15:00 | généraliste | non | Mardi 29 sept. (9h30 - 11h30, 16h00 - 18h00) · Mercredi 30 sept. (9h30 - 11h30) · Jeudi 1 oct. (9h30 - 11h30, 16h00 - 18h00) — **= capture [BM2]** |
| mar. 29/09/2026 10:00 | généraliste ou dermato | **oui** | Aujourd'hui (16h00 - 18h00) · Demain (9h30 - 11h30) · Jeudi 1 oct. (2) |
| lun. 28/09/2026 08:00 | généraliste | non | Demain (2) · Mercredi 30 sept. (1) · Jeudi 1 oct. (2) |
| mer. 30/09/2026 08:00 | généraliste | non | Aujourd'hui (9h30 - 11h30) · Demain (2) · Vendredi 2 oct. (1) |
| mar. 10/11/2026 17:30 | généraliste | oui | Jeudi 12 nov. (2) · Vendredi 13 nov. (1) · Mardi 17 nov. (2) — le 11/11 férié est sauté |
| jeu. 24/12/2026 08:00 | dermato | non | Aujourd'hui (2) · Mardi 29 déc. (2) · Mercredi 30 déc. (1) |

### 3.6 Option immédiate « Maintenant » (l.1635-1650)
Affichée si un service est choisi, que **aujourd'hui** n'est pas férié, que le planning du service a une plage aujourd'hui et que `debut <= minutesMaintenant < fin` pour l'une d'elles. Indépendante des réservations et des créneaux générés. Choisie → créneau `[maintenant, maintenant + 7 200 000 ms]` (2 h) au même format `…Z` (l.1795-1801).

---

## 4. Étape 1 — « service »

```html
<div>
 <p class="text-sm text-gray-600 mb-3">Réservez un créneau pour être pris en charge en priorité, dès votre installation dans la cabine de téléconsultation Tessan.</p>
 <div class="rounded-lg bg-blue-50 border border-blue-100 p-4 mb-4">
  <p class="text-sm font-semibold text-gray-800 mb-2">Comment ça marche ?</p>
  <ol class="list-decimal list-inside space-y-1 text-sm text-gray-700">
   <li>Choisissez un créneau qui vous convient</li>
   <li>Présentez-vous à la pharmacie sur ce créneau</li>
   <li>Installez-vous dans la cabine de téléconsultation puis bénéficiez d'un passage prioritaire</li>
  </ol>
 </div>
 <p class="text-sm font-semibold text-gray-800 mb-2">Choisissez votre spécialité</p>
 <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
  <button class="flex items-center gap-3 p-4 rounded-lg border border-gray-200 hover:border-tessan-green hover:bg-emerald-50 transition-colors text-left cursor-pointer min-w-0">
   <span class="text-2xl flex-shrink-0">🩺</span>
   <span class="font-medium text-gray-800 text-sm break-words">Médecine générale</span>
  </button>
  <!-- + bouton 🔬 « Avis dermatologique » si autorisé -->
 </div>
</div>
```
Clic sur un service : `service = id`, étape → « slot » (déclenche le chargement des réservations, §8.1).

Mesures [BM1] (1440, largeur de contenu 464) :

| Élément | Boîte | Styles |
|---|---|---|
| `p` intro | 464 × 40 (2 lignes) | 14/20, 400, gray-600 `oklch(0.446 0.03 256.802)`, `mb` 12 |
| encadré | 464 × 150 | fond blue-50 `oklch(0.97 0.014 254.604)`, bordure 1 px blue-100 `oklch(0.932 0.032 255.585)`, radius 10, padding 16, `mb` 16 |
| « Comment ça marche ? » | 430 × 20 | 14/20, 600, gray-800, `mb` 8 |
| `ol` | 430 × 88 | 14/20, gray-700 `oklch(0.373 0.034 259.733)`, puces décimales **intérieures** (`1.`), écart 4 px entre items ; li 20, 20, 40 (3ᵉ sur 2 lignes) |
| « Choisissez votre spécialité » | 464 × 20 | 14/20, 600, gray-800, `mb` 8 |
| grille | 464 × 66 | 2 colonnes ≥ 640 px (1 colonne en dessous), `gap` 12 |
| bouton service | 226 × 66 | padding 16, radius 10, bordure 1 px gray-200 `oklch(0.928 0.006 264.531)`, fond transparent, `gap` 12, aligné à gauche |
| emoji | 30 × 32 | 24 px (`text-2xl`, interligne 32) |
| libellé | 122 × 20 | 14/20, 500, gray-800, `overflow-wrap:break-word` |

États bouton service : survol → bordure `#0f352d`, fond emerald-50 `oklch(97.9% .021 166.113)`, transition couleurs 0.15 s ([CSS] `.hover\:border-tessan-green:hover`, `.hover\:bg-emerald-50:hover`).

---

## 5. Étape 2 — « slot » (liste des créneaux en accordéon)

```html
<div>
 <button class="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 mb-3 cursor-pointer"><svg class="lucide lucide-chevron-left" width="16" height="16"/> Retour</button>
 <span class="inline-block text-xs font-medium px-2 py-0.5 rounded-full bg-[#fcf5cc] text-gray-700 mb-3">Médecine générale</span>
 <!-- si « Maintenant » disponible (§3.6) -->
 <button class="w-full flex items-center gap-3 p-4 mb-3 rounded-lg border-2 border-emerald-500 bg-emerald-50 hover:bg-emerald-100 transition-colors text-left cursor-pointer">
  <svg class="lucide lucide-clock text-emerald-600" width="20" height="20"/>
  <div>
   <span class="font-semibold text-emerald-700 text-sm">Maintenant</span>
   <span class="block text-xs text-emerald-600">Créneau disponible</span>
  </div>
 </button>
 <!-- si erreur ET étape slot -->
 <p class="text-xs text-orange-600 mb-3 bg-orange-50 border border-orange-200 rounded-md p-2">Ce créneau vient d'être réservé. Veuillez en choisir un autre.</p>
 <!-- A) chargement ET aucun jour : -->
 <p class="text-sm text-gray-500 text-center py-3">Chargement des créneaux…</p>
 <!-- B) au moins un jour : -->
 <div class="space-y-2">
  <p class="text-sm text-gray-500 mb-1">Ou choisissez un créneau</p>
  <div class="border border-gray-200 rounded-lg overflow-hidden">           <!-- × jour -->
   <button class="w-full flex items-center justify-between p-3 hover:bg-gray-50 transition-colors cursor-pointer">
    <div class="flex items-center gap-2">
     <svg class="lucide lucide-calendar-days text-gray-400" width="16" height="16"/>
     <span class="font-medium text-gray-800 text-sm">Mardi 29 sept.</span>
    </div>
    <div class="flex items-center gap-1.5">
     <span class="text-xs text-gray-400">2 créneaux</span>
     <svg class="lucide lucide-chevron-up text-gray-400" width="16" height="16"/>   <!-- chevron-down si replié -->
    </div>
   </button>
   <!-- seulement pour le jour ouvert -->
   <div class="grid grid-cols-2 sm:grid-cols-3 px-3 pb-3 gap-2">
    <button class="text-sm py-2 px-1 rounded-md border border-gray-200 hover:border-tessan-green hover:bg-emerald-50 text-gray-700 transition-colors cursor-pointer">9h30 - 11h30</button>
   </div>
  </div>
 </div>
 <!-- C) sinon : -->
 <p class="text-sm text-gray-500 text-center py-3">Aucun créneau disponible pour le moment.</p>
</div>
```

Comportements :
- « Retour » → étape « service », service effacé, erreur effacée.
- Accordéon : **un seul jour ouvert** ; index initial `0` (1er jour ouvert d'office) ; clic sur l'en-tête ouvert → tout replier (`-1`) ; clic sur un autre → l'ouvrir. L'index n'est pas réinitialisé en changeant de service.
- Clic sur un créneau → `immediate = false`, `slot = créneau`, étape « email ».
- Clic « Maintenant » → `immediate = true`, `slot = null`, étape « email ».
- Le texte « Ou choisissez un créneau » est affiché même sans bouton « Maintenant ».
- Les jours sont calculés immédiatement depuis le planning ; la liste est ensuite filtrée à l'arrivée des réservations (possible disparition de créneaux). « Chargement des créneaux… » n'apparaît que si aucun jour n'est généré pendant le chargement.
- Libellé de compte : `{n} créneaux` **toujours au pluriel** (`1 créneaux` mesuré, [BM2]).

Mesures [BM2] (1440) :

| Élément | Boîte | Styles |
|---|---|---|
| « Retour » | 66 × 20 (y 360) | 14/20, gray-500 → survol gray-700 ; icône 16 ; `gap` 4 ; `mb` 12 |
| badge service | 124 × 20 (y 396) | 12/16, 500, gray-700, fond `#fcf5cc`, padding 2 × 8, radius plein, `mb` 12 |
| « Ou choisissez un créneau » | 464 × 20 (y 428) | 14/20, gray-500 ; `margin-bottom` **4** (`mb-1` l'emporte sur `space-y-2`) |
| bloc jour ouvert | 464 × 96 (y 452) | bordure 1 px gray-200, radius 10, `overflow:hidden` ; blocs espacés de **8** (`space-y-2`) |
| en-tête de jour | 462 × 44 | padding 12 ; survol fond gray-50 `oklch(0.985 0.002 247.839)` (visible sur le 3ᵉ jour de [PNG2], souris au-dessus) |
| icône calendrier / chevrons | 16 × 16 | gray-400 `oklch(0.707 0.022 261.325)` |
| libellé du jour | 93 × 20 (« Mardi 29 sept. ») | 14/20, 500, gray-800 ; `gap` 8 avec l'icône |
| « 2 créneaux » | 64 × 16 | 12/16, gray-400 ; `gap` 6 avec le chevron |
| grille de créneaux | 462 × 50 | 3 colonnes ≥ 640 px (2 en dessous), padding 0 12 12, `gap` 8 |
| bouton créneau | 140 × 38 | 14/20, 400, gray-700, padding 8 × 4, radius 8, bordure 1 px gray-200, centré ; survol bordure `#0f352d` + fond emerald-50 |
| bloc jour replié | 464 × 46 | — |

Bouton « Maintenant » (non capturé, déduit des classes) : pleine largeur, padding 16, `mb` 12, bordure **2 px** emerald-500 `oklch(69.6% .17 162.48)`, fond emerald-50, survol emerald-100 `oklch(95% .052 163.051)`, radius 10 ; icône horloge 20 emerald-600 `oklch(59.6% .145 163.225)` ; « Maintenant » 14/20 600 emerald-700 `oklch(50.8% .118 165.612)` ; « Créneau disponible » 12/16 emerald-600 (bloc). Message d'erreur orange : 12/16, orange-600 `oklch(64.6% .222 41.116)`, fond orange-50 `oklch(98% .016 73.684)`, bordure 1 px orange-200 `oklch(90.1% .076 70.697)`, radius 8, padding 8, `mb` 12.

---

## 6. Étape 3 — « email »

```html
<div>
 <button class="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 mb-3 cursor-pointer"><svg class="lucide lucide-chevron-left" width="16" height="16"/> Retour</button>
 <div class="bg-gray-50 rounded-lg p-4 mb-6">
  <p class="text-sm font-semibold text-gray-800 mb-1">Votre créneau de passage :</p>
  <p class="text-sm text-gray-700">Médecine générale</p>
  <p class="text-sm text-gray-700"><strong class="font-bold">Mardi</strong> 29/09 de 9h30 à 11h30</p>   <!-- ou « Maintenant » -->
 </div>
 <div class="max-w-md space-y-3">
  <label class="block text-sm font-medium text-gray-700">Votre e-mail</label>
  <div class="relative">
   <svg class="lucide lucide-mail absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" width="16" height="16"/>
   <input type="email" placeholder="exemple@email.fr" class="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-tessan-green focus:border-transparent text-sm"/>
  </div>
  <!-- si erreur : -->
  <p class="text-xs text-red-600">Une erreur est survenue.</p>
  <button data-cta="finaliser_creneau" disabled class="w-full py-3 rounded-lg bg-tessan-green text-white font-medium hover:bg-tessan-green-hover disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer text-sm">Confirmer mon créneau prioritaire</button>
  <p class="text-xs text-gray-400 text-center">Vous recevrez un email récapitulatif dans quelques instants</p>
 </div>
</div>
```

- Récapitulatif du créneau : `{Jour} {JJ}/{MM} de {H}h{MM} à {H}h{MM}` calculé avec `getUTC*` sur les chaînes `…Z` (donc = heure murale locale) ; jour (`Dimanche`…`Samedi`) en `<strong class="font-bold">` ; JJ et MM **avec** zéro, heures **sans** zéro (ex. `Mardi 29/09 de 9h30 à 11h30`, [PNG3]). Option immédiate : `Maintenant`.
- « Retour » → étape « slot », créneau effacé, `immediate = false`, erreur effacée.
- Champ : `onClick` stoppe la propagation ; valeur libre.
- Bouton désactivé tant que **le champ est vide** ou qu'un envoi est en cours (`disabled: !email || submitting`). **Aucune** validation de format d'e-mail (le type `email` ne bloque rien : pas de `<form>`).
- Pendant l'envoi : libellé `Envoi en cours...`.

Valeurs (déduites des classes ; [PNG3] 1440) : récapitulatif fond gray-50, radius 10, padding 16, `mb` 24 ; bloc formulaire largeur max **448 px** (`max-w-md` = 28rem), éléments espacés de 12 ; label 14/20 500 gray-700 ; champ pleine largeur, hauteur 46 (12 + 20 + 12 + 2), padding gauche 40 / droite 16, bordure 1 px gray-200, radius 10, texte 14 px, placeholder = couleur courante à 50 % (préflight Tailwind `::placeholder{color:color-mix(in oklab,currentcolor 50%,transparent)}`) ; icône enveloppe 16 gray-400 à 12 px du bord gauche, centrée verticalement ; bouton hauteur 44 (12 + 20 + 12), fond `#0f352d`, texte blanc 14/20 500, radius 10 ; note 12/16 gray-400 centrée.

États :

| État | Élément | Valeur | Source |
|---|---|---|---|
| focus | champ | contour supprimé ; anneau 2 px `#0f352d` (`box-shadow 0 0 0 2px`) ; bordure transparente | [CSS] `.focus\:ring-2:focus`, `.focus\:ring-tessan-green:focus{--tw-ring-color:var(--tessan-green)}`, `.focus\:border-transparent:focus{border-color:#0000}` |
| désactivé | bouton | opacité 0.5, curseur `not-allowed` (visible sur [PNG3] : vert grisé) | [CSS] `.disabled\:opacity-50:disabled{opacity:.5}` |
| survol (actif) | bouton | fond `#1d5c4d` | [CSS] `.hover\:bg-tessan-green-hover:hover` |
| survol | « Retour » | gray-500 → gray-700 `oklch(37.3% .034 259.733)` | [CSS] |

---

## 7. Étape 4 — « confirmation » (non capturée ; d'après le code l.2296-2370)

```html
<div class="text-center py-4">
 <svg class="lucide lucide-circle-check mx-auto text-emerald-500 mb-${compact ? '2' : '3'}" width="48" height="48"/>   <!-- classe « mb-… » littérale cassée : AUCUNE marge -->
 <h4 class="text-xl font-bold text-gray-800 mb-2" style="font-family: Recoleta, recoleta, &quot;recoleta Fallback&quot;, sans-serif;">E-mail envoyé !</h4>
 <p class="text-sm text-gray-600 mb-4">Lien de confirmation envoyé à <strong>{email}</strong>.</p>
 <div class="bg-gray-50 rounded-lg p-4 text-left space-y-2 text-sm text-gray-600 mb-4 max-w-md mx-auto">
  <p class="font-semibold">Prochaines étapes :</p>
  <ol class="list-decimal list-inside space-y-1">
   <li>Consultez votre boîte mail</li>
   <li>Cliquez sur le lien de confirmation</li>
   <li>Rendez-vous à la pharmacie</li>
  </ol>
  <p class="text-xs text-gray-400 mt-2">Vous pouvez annuler votre réservation à tout moment depuis l'email reçu.</p>
 </div>
 <button class="text-sm text-tessan-green hover:underline cursor-pointer">Fermer</button>
</div>
```
Icône 48 px emerald-500 ; titre Recoleta 20/28 700 ; encadré centré largeur max 448 ; « Fermer » 14/20 `#0f352d`, souligné au survol → ferme la modale.

---

## 8. Appels réseau et gestion d'erreurs

### 8.1 Réservations existantes
- Quand l'étape devient « slot » avec un service choisi (et à nouveau après `SLOT_ALREADY_TAKEN`) : `GET /api/anonymous-reservations/{encodeURIComponent(clientName)}?maxDays=7` avec `{cache: "no-store"}` (l.1656-1684).
- Réponse attendue : `{"reservations": [{"slotStartTime": "…", "slotEndTime": "…"}, …]}` ; tableau absent, statut non OK ou erreur réseau → `[]`. Indicateur de chargement actif pendant la requête.

### 8.2 Envoi
`POST /api/reservation`, en-tête `Content-Type: application/json`, corps :
```json
{ "patientEmail": "<email>", "slotStartTime": "<startISO>", "slotEndTime": "<endISO>", "clientName": "<clientName>", "speciality": "generaliste|dermato" }
```

| Résultat | Effet UI | Événement `window.dataLayer.push` |
|---|---|---|
| HTTP OK | étape « confirmation » | `{event:"reservation_confirmed", reservation_id: data.reservationId ?? data.id ?? data.reservation_id ?? data._id (en chaîne, sinon null), pharmacy_id: pharmacy.id, is_immediate}` |
| erreur `errorCode === "SLOT_ALREADY_TAKEN"` | créneau et `immediate` effacés, retour étape « slot », nouveau chargement des réservations, puis (setTimeout 0) message orange = `body.error` ou `Ce créneau vient d'être réservé. Veuillez en choisir un autre.` | `{event:"reservation_failed", error_code:"SLOT_ALREADY_TAKEN", pharmacy_id, is_immediate}` |
| autre erreur HTTP | reste sur « email », message rouge = `body.error` ou `Une erreur est survenue.` | `{event:"reservation_failed", error_code: errorCode ?? "UNKNOWN", …}` |
| exception réseau | message rouge `Erreur de connexion. Veuillez réessayer.` | `{event:"reservation_failed", error_code:"NETWORK", …}` |

Dans tous les cas `submitting` repasse à `false`. Envoi ignoré si e-mail ou service manquant.

Clone statique : ces routes n'existent pas ; il faut les simuler (ex. GET → `{"reservations": []}`, POST → succès), choix à consigner dans `docs/DECISIONS.md`.

---

## 9. Variante « compacte » (code mort)

`BookingFlow` accepte `compact` (défaut `false`) mais **aucun appelant ne le passe** : valeurs compactes (`text-xs`, `p-3`, `p-2.5`, grilles `grid-cols-2`, icônes 14/16/36 px, `pl-9 pr-3 py-2.5`…) à ne pas implémenter.

---

## 10. Textes exacts (dans l'ordre d'apparition)

| Clé | Texte |
|---|---|
| titre | `Réserver un créneau ` + `— Passage prioritaire` (tiret cadratin U+2014) |
| × | `aria-label="Fermer"` |
| intro | `Réservez un créneau pour être pris en charge en priorité, dès votre installation dans la cabine de téléconsultation Tessan.` |
| encadré | `Comment ça marche ?` / `Choisissez un créneau qui vous convient` / `Présentez-vous à la pharmacie sur ce créneau` / `Installez-vous dans la cabine de téléconsultation puis bénéficiez d'un passage prioritaire` |
| choix | `Choisissez votre spécialité` ; services `Médecine générale`, `Avis dermatologique` |
| retour | ` Retour` (espace initial après l'icône) |
| immédiat | `Maintenant` / `Créneau disponible` |
| liste | `Ou choisissez un créneau` ; `Aujourd'hui`, `Demain`, `{Jour} {j} {mois}` ; `{n} créneaux` ; `9h30 - 11h30`, `16h00 - 18h00` |
| chargement | `Chargement des créneaux…` (points de suspension U+2026) |
| vide | `Aucun créneau disponible pour le moment.` |
| récap | `Votre créneau de passage :` ; `{Jour} {JJ}/{MM} de {H}h{MM} à {H}h{MM}` ou `Maintenant` |
| e-mail | `Votre e-mail` ; placeholder `exemple@email.fr` |
| bouton | `Confirmer mon créneau prioritaire` / `Envoi en cours...` |
| note | `Vous recevrez un email récapitulatif dans quelques instants` |
| erreurs | `Ce créneau vient d'être réservé. Veuillez en choisir un autre.` · `Une erreur est survenue.` · `Erreur de connexion. Veuillez réessayer.` |
| confirmation | `E-mail envoyé !` · `Lien de confirmation envoyé à ` + e-mail + `.` · `Prochaines étapes :` · `Consultez votre boîte mail` · `Cliquez sur le lien de confirmation` · `Rendez-vous à la pharmacie` · `Vous pouvez annuler votre réservation à tout moment depuis l'email reçu.` · `Fermer` |

Attribut de suivi : `data-cta="finaliser_creneau"` sur le bouton de confirmation.

---

## 11. Ambiguïtés

1. Consigne « bouton désactivé jusqu'à un e-mail valide » : le code ne vérifie que la **non-vacuité** du champ (aucun contrôle de format).
2. Fuseau : toutes les dates (créneaux, jours fériés, « Maintenant », libellés) utilisent l'heure **locale du navigateur** ; le suffixe `Z` des ISO est trompeur. Pour la cohérence avec `opening-status.md` §5, le clone peut calculer en Europe/Paris (identique pour un visiteur en France).
3. Étapes 3 (mesures) et 4 (confirmation), bouton « Maintenant » et messages d'erreur : non mesurés (capture [PNG3] seulement pour l'étape 3) ; valeurs déduites des classes et du CSS.
4. Les réponses réelles des API ne sont pas archivées ; le format est déduit du code client.
