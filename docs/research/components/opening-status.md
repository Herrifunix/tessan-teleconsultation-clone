# Spécification — Statut d'ouverture (« Ouvert · Ferme à … »)

> Fonction pure `computeOpeningStatus(horaires, maintenant = new Date(), langue = "fr")` = module **6504**, export `VK` ([JS990] l.958-1100 ; copie minifiée : `docs/research/js-logic-raw.md` § module 6504). Le rendu est fait par la carte de pharmacie (module 91, [JS990] l.335-370). Les helpers `parseHours` (`Im`) et `toMinutes` (`yN`) sont réutilisés par la modale de réservation (`booking-modal.md`).

## 0. Sources

| Alias | Fichier |
|---|---|
| [JS990] | `docs/research/js/pretty/990-ede1d18ec8eaf918.js` (6504 statut ; 91 rendu ; 4173 mapping des horaires) |
| [C1440] etc. | `docs/research/pages/results/computed-{375,768,1440}.json` |
| [POP] | `docs/research/pages/specialty-city/popup.json` |
| [CSS] | `docs/research/css/323d88a92ac6be07.css` |
| [DATA] | `src/data/locations.json` |
| [CAP] | `tools/capture.mjs` (`FIXED_TIME = 2026-09-25T15:00:00+02:00`, vendredi) |

---

## 1. Format des horaires en entrée

Objet `horaires` construit à partir des colonnes Supabase ([JS990] 4173 l.531-539) :

```js
{ lundi:    row.horaires_tc_lundi    || "Fermé",
  mardi:    row.horaires_tc_mardi    || "Fermé",
  mercredi: row.horaires_tc_mercredi || "Fermé",
  jeudi:    row.horaires_tc_jeudi    || "Fermé",
  vendredi: row.horaires_tc_vendredi || "Fermé",
  samedi:   row.horaires_tc_samedi   || "Fermé",
  dimanche: row.horaires_tc_dimanche || "Fermé" }
```

Chaîne d'une journée : plages `HH:MM-HH:MM` séparées par `,` (espaces libres) — ex. `"09:00-12:30, 14:30-19:30"`, `"09:00-20:00"` — ou `"Fermé"` ([DATA], ex. ligne 557).

### `parseHours(chaîne)` (export `Im`, l.959-974)
```
si chaîne vide/absente ou chaîne.toLowerCase() === "fermé" → []
pour chaque morceau de chaîne.split(",").map(trim) :
    [début, fin] = morceau.split("-").map(trim)
    si début ET fin : [h1,m1] = début.split(":").map(Number) ; [h2,m2] = fin.split(":").map(Number)
                      pousser {start:{hours:h1,minutes:m1}, end:{hours:h2,minutes:m2}}
retourner la liste (dans l'ordre de la chaîne, sans tri)
```
- `toMinutes(h, m) = 60*h + m` (export `yN`) ; `format(h, m) = HH:MM` avec zéros (`padStart(2,"0")`).
- Jour courant : `["dimanche","lundi","mardi","mercredi","jeudi","vendredi","samedi"][(date.getDay() + décalage) % 7]`.
- Plages de nuit (`20:00-02:00`) non gérées (jamais « ouvert »).

---

## 2. Algorithme exact (`computeOpeningStatus`, l.1015-1100)

```
jour   = nomDuJour(maintenant)                 // heure LOCALE du navigateur (getDay/getHours/getMinutes)
c      = toMinutes(maintenant.getHours(), maintenant.getMinutes())
plages = parseHours(horaires[jour])

// 1) Ouvert ?
pour chaque plage p (ordre de la chaîne) :
    s = toMinutes(p.start), e = toMinutes(p.end)
    si c >= s ET c < e :                                    // fin EXCLUSIVE
        fermeture = format(p.end)
        suivante  = première plage de la journée dont start (en minutes) > e
        displayText = suivante ? "Ouvert · Ferme à " + fermeture + " (Réouvre à " + format(suivante.start) + ")"
                               : "Ouvert · Ferme à " + fermeture
        retourner { isOpen:true, closingTime:fermeture, reopeningTime: suivante ? format(suivante.start) : undefined, displayText }

// 2) Fermé : prochaine ouverture
avantPremière = plages[0] existe ET c < toMinutes(plages[0].start)
prochaine = (
    a) première plage d'aujourd'hui (ordre de la chaîne) dont start > c  → format(start)          // "14:30" SANS « à »
    b) sinon pour i = 1..7 : j = nomDuJour(maintenant, i) ; L = parseHours(horaires[j])
           si L non vide : t = format(L[0].start)
                           i === 1 → "demain à " + t
                           sinon   → j + " à " + t                  // nom du jour en minuscules, ex. "lundi à 09:00"
    c) sinon undefined )
si prochaine absente → { isOpen:false, reopeningTime:undefined, displayText:"Fermé" }
autreJour = prochaine contient "demain" ou un nom de jour français
verbe     = (avantPremière OU autreJour) ? "Ouvre" : "Réouvre"
retourner { isOpen:false, reopeningTime:prochaine, displayText: "Fermé · " + verbe + " " + prochaine }
```

Séparateur : `" · "` = espace + **U+00B7** (point médian) + espace (source `" \xb7 "`).

Variante anglaise (paramètre `langue = "en"`, non utilisée par la carte) : `Open`/`Closed`, `Closes at`, `Reopens at`, `Opens`, `tomorrow at`, noms de jours anglais.

---

## 3. Catalogue des textes produits (vérifiés par exécution d'un portage fidèle)

Horaires de test = Pharmacie Saint Barthélémy ([DATA] code 557) : lun–ven `09:00-12:30, 14:30-19:30`, sam `09:00-12:30, 14:30-19:00`, dim `Fermé`.

| Moment (heure locale) | `isOpen` | `displayText` | Affichage (partie 0 • partie 1) |
|---|---|---|---|
| ven. 15:00 (heure de capture [CAP]) | true | `Ouvert · Ferme à 19:30` | **Ouvert** • Ferme à 19:30 (mesuré [C1440]) |
| ven. 09:00 (bord inclusif) | true | `Ouvert · Ferme à 12:30 (Réouvre à 14:30)` | **Ouvert** • Ferme à 12:30 (Réouvre à 14:30) |
| ven. 11:00 | true | `Ouvert · Ferme à 12:30 (Réouvre à 14:30)` | idem |
| ven. 12:30 (bord exclusif) | false | `Fermé · Réouvre 14:30` | **Fermé** • Réouvre 14:30 |
| ven. 13:00 (pause déjeuner) | false | `Fermé · Réouvre 14:30` | **Fermé** • Réouvre 14:30 |
| ven. 08:00 (avant l'ouverture) | false | `Fermé · Ouvre 09:00` | **Fermé** • Ouvre 09:00 |
| ven. 19:29 | true | `Ouvert · Ferme à 19:30` | — |
| ven. 19:30 | false | `Fermé · Ouvre demain à 09:00` | **Fermé** • Ouvre demain à 09:00 |
| sam. 20:00 (dimanche fermé) | false | `Fermé · Ouvre lundi à 09:00` | **Fermé** • Ouvre lundi à 09:00 |
| dim. 10:00 | false | `Fermé · Ouvre demain à 09:00` | — |
| lun. 18:00, seule plage de la semaine « lundi 09:00-12:00 » | false | `Fermé · Ouvre lundi à 09:00` (i = 7 → même jour la semaine suivante) | — |
| toute la semaine `Fermé` | false | `Fermé` | **Fermé** (pas de puce) |
| 3 plages `08:00-10:00, 11:00-12:00, 14:00-18:00`, 09:00 | true | `Ouvert · Ferme à 10:00 (Réouvre à 11:00)` | — |

Formes génériques :
- `Ouvert · Ferme à HH:MM`
- `Ouvert · Ferme à HH:MM (Réouvre à HH:MM)`
- `Fermé · Réouvre HH:MM` — **sans « à »** (ex. `Fermé · Réouvre 14:30`)
- `Fermé · Ouvre HH:MM` — **sans « à »** (avant la première plage du jour)
- `Fermé · Ouvre demain à HH:MM`
- `Fermé · Ouvre <jour> à HH:MM` (jour en minuscules : `lundi` … `dimanche`)
- `Fermé`

---

## 4. Rendu dans la carte (module 91)

```html
<p class="font-medium mb-3 flex items-center gap-1.5 text-gray-700">
  <svg class="lucide lucide-clock h-5 w-5 {isOpen ? 'text-[#238700]' : 'text-red-600'}"/>
  <span class="font-extrabold text-base {isOpen ? 'text-[#238700]' : 'text-red-600'}">{parties[0]}</span>
  <!-- seulement si parties[1] existe -->
  {" "}<span class="text-xs">•</span>{" "}{parties[1]}
</p>
```
`parties = displayText.split(" · ")` ([JS990] l.344-368). Le séparateur visuel est **« • » (U+2022, puce)** dans un `span.text-xs`, pas le « · » du texte.

| Partie | Taille / interligne | Graisse | Couleur | Mesure 1440 [C1440] |
|---|---|---|---|---|
| `p` (conteneur) | 16 / 24 | 500 | gray-700 `oklch(0.373 0.034 259.733)` | 400.4 × 24 ; `gap:6px` ; `margin-bottom:12px` |
| icône horloge | 20 × 20 | — | ouvert `#238700` = `rgb(35, 135, 0)` ; fermé red-600 `oklch(57.7% .245 27.325)` | x 109 |
| `span` statut | 16 / 24 | 800 | idem icône | « Ouvert » 58 × 24, x 135 |
| `span` « • » | 12 / 16 | 500 | gray-700 | 6 × 16, x 199 (centré verticalement par `items-center`) |
| texte partie 1 | 16 / 24 | 500 | gray-700 | débute à x ≈ 211 |

Espacements : les nœuds texte `" "` sont blancs dans un conteneur flex → ignorés ; l'espacement réel est `gap` 6 px entre icône / statut / puce / texte. Identique à 375 et 768 ([C375] : icône 69 → statut 95 → puce 159 ; [C768] : 77 → 103 → 167).

Dans la popup de carte ([POP]) : le texte de la partie 1 hérite de `.gm-style` → **Roboto 11 px** ; « Ouvert » Roboto 16 px 800 (48 × 24) ; « • » Roboto 12 px (4 × 16).

Classes CSS : `.text-\[\#238700\]{color:#238700}`, `.text-red-600{color:var(--color-red-600)}`, `--color-red-600:oklch(57.7% .245 27.325)`, `.font-extrabold{font-weight:var(--font-weight-extrabold)}` (800), `.text-xs{font-size:var(--text-xs)}` (.75rem, interligne `calc(1/.75)`), `.gap-1\.5{gap:calc(var(--spacing)*1.5)}` — [CSS].

---

## 5. Fuseau horaire et rafraîchissement

- L'original calcule avec l'**heure locale du navigateur** (`Date#getDay/getHours/getMinutes`), pas Europe/Paris (constat `docs/progress.md`).
- Exigence du clone (`docs/checklist.json` CL-13) : calcul en **Europe/Paris** quel que soit le fuseau du visiteur. Implémentation conseillée : dériver jour/heure/minute de `Intl.DateTimeFormat("fr-FR", {timeZone:"Europe/Paris", weekday:"long", hour:"2-digit", minute:"2-digit", hourCycle:"h23"})`, puis appliquer l'algorithme tel quel. Pour un visiteur en France, le résultat est identique à l'original.
- Aucun `setInterval` : le texte est calculé au rendu ; il ne change qu'au prochain rendu du composant.
- Le champ `ouvert` du mapping 4173 (comparaison `<=` sur la fin, statut `Open`) n'est **pas** utilisé par l'affichage.

---

## 6. Ambiguïtés

1. La consigne mentionne « Fermé · Réouvre à HH:MM » : le code original produit **« Fermé · Réouvre HH:MM »** (et « Fermé · Ouvre HH:MM ») sans « à » ; seules les formes « demain à » / « <jour> à » contiennent « à ». Le clone doit suivre le code (fidélité).
2. `statut` de la ligne Supabase (`Open`/autre) n'influence pas le texte affiché.
