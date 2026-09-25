# Fiche — section « Foire Aux Questions »

Suite de `pharmacy-page.md` (abréviations au §0). Source : [JS541:872-1048], [OUT:236-279], [FAQ] (HTML fermé/ouvert et contenu de chaque réponse),
captures `docs/reference/fiche-*.png` (fermé) et `docs/reference/states/faq-open-1440.png` (1er item ouvert).
**Tous les styles sont inline dans l'original** (aucune classe Tailwind) : les reproduire à l'identique.

## 1. Condition d'affichage et position

Rendue seulement si la pharmacie n'est **pas** US **et** `pharmacy.nomEtablissement === "Cabine Téléconsultation Médecin Tessan"` (égalité stricte, accents et casse compris).
Placée entre la carte horaires/carte et le bloc « à proximité ». Aucune carte blanche autour : les items reposent directement sur le fond slate-50.

## 2. Structure et styles inline exacts

```html
<section>
  <div style="padding: 0 24px 24px;">
    <h2 style="font-family: Recoleta, recoleta, &quot;recoleta Fallback&quot;, sans-serif; font-size: 2.5rem; color: #0f352d;
               text-align: center; margin-bottom: 32px; margin-top: 8px; font-weight: 500;">Foire Aux Questions</h2>
    <div style="display: flex; flex-direction: column; gap: 12px;">
      <!-- × 8 -->
      <div style="background-color: white; border-radius: 12px; overflow: hidden; box-shadow: 0 1px 4px rgba(0,0,0,0.06);">
        <button style="width: 100%; display: flex; justify-content: space-between; align-items: center; padding: 1.25rem 1.5rem;
                       background: none; border: none; cursor: pointer; text-align: left; gap: 12px;">
          <span style="font-family: Plus Jakarta Sans, sans-serif; font-size: 18px; line-height: 24px; color: #0f352d; font-weight: 600; flex: 1;">
            Quels sont les horaires de téléconsultation ?
          </span>
          <span style="flex-shrink: 0; transform: rotate(0deg); transition: transform 0.25s ease; display: flex; align-items: center;">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
              <path d="M6 9L12 15L18 9" stroke="#0f352d" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </span>
        </button>
        <!-- seulement si cet item est ouvert : -->
        <div style="padding: 0 1.5rem 1.25rem; border-top: 1px solid #f0ece4;">
          <p style="font-family: Plus Jakarta Sans, sans-serif; font-size: 16px; line-height: 28px; color: #0f352d; padding-top: 0.75rem;">
            …réponse en HTML (innerHTML)…
          </p>
        </div>
      </div>
    </div>
  </div>
</section>
```

Valeurs résolues [C1440 `M>section:3…`] :

| Élément | Valeurs |
|---|---|
| wrapper | padding `0 24px 24px` → items alignés sur les cartes (x 80 à 1440, 24 à 768/375) |
| h2 | Recoleta **500**, **40 px**, line-height **60 px** (hérité : 1.5 × 40 — aucune règle de line-height sur h2), `rgb(15, 53, 45)`, centré, marges 8 px haut / 32 px bas. La marge haute de 8 px **fusionne** à travers `section`/`div` (ni padding haut ni bordure) : 8 px entre le bloc horaires et le haut du h2 |
| liste | flex colonne, `gap:12px` |
| item | fond blanc, rayon **12 px**, `overflow:hidden`, ombre `rgba(0, 0, 0, 0.06) 0px 1px 4px 0px`, pas de bordure |
| bouton question | pleine largeur, padding **20 px 24 px**, `gap:12px`, fond et bordure nuls, `cursor:pointer`, `text-align:left` ; aucun style de survol ; focus = contour natif |
| libellé question | « Plus Jakarta Sans », sans-serif, **18 px / 24 px, 600**, `#0f352d`, `flex:1 1 0%` |
| chevron | span 24×24 (`flex-shrink:0`), svg 24×24, trait `#0f352d` 2 px ; `rotate(0deg)` fermé / **`rotate(180deg)`** ouvert, `transition: transform .25s ease` |
| réponse (conteneur) | padding `0 24px 20px`, bordure haute `1px solid #f0ece4` (= `rgb(240, 236, 228)`) |
| réponse (p) | « Plus Jakarta Sans », sans-serif, **16 px / 28 px, 400**, `#0f352d`, `padding-top:12px`, marge 0 ; `<strong>` = 700 |

Géométrie (état par défaut, tout fermé) :

| | 375 | 768 | 1440 |
|---|---|---|---|
| h2 | `[24,5555.7,327×120]` (**2 lignes** : « Foire Aux » / « Questions ») | `[24,4345.8,720×60]` | `[80,3178.2,1280×60]` |
| liste (y) | 5707.7 | 4437.8 | 3270.2 |
| largeur item / libellé | 327 / 243 | 720 / 636 | 1280 / 1196 |
| hauteurs des 8 items fermés | 88, 88, 88, 112, 88, 136, 136, 112 | 64, 64, 64, 64, 64, 88, 88, 88 | 64 × 8 |
| hauteur section fermée (h2 → fin padding bas) | 1108 | 784 | 712 |

Hauteur d'un item fermé = 20 + (lignes × 24) + 20. Chevron centré verticalement (ex. 375 item 1 : `[303,5739.7,24×24]`).
Hauteur ajoutée par une réponse ouverte = 1 (bordure) + 12 + lignes × 28 + 20 : 1er item → **89** (1440, 2 lignes), **117** (768, 3 lignes), **229** (375, 7 lignes).

## 3. Comportement (accordéon à ouverture unique)

- État : `openIndex: number | null`, **`null` par défaut** (tout fermé).
- Clic sur la question `i` : si `i` est ouvert → `null` (fermeture) ; sinon → `i` (l'item précédemment ouvert se ferme). Un seul item ouvert à la fois [FAQ `answers`].
- La réponse est **montée/démontée** instantanément (pas d'animation de hauteur) ; seul le chevron tourne (0,25 s).
- Pas d'`aria-expanded` dans l'original ; l'ajouter (et `aria-controls`) est sans effet visuel. `prefers-reduced-motion` : supprimer la transition du chevron (P3-05).

## 4. Questions et réponses exactes

`{nom}` = `pharmacy.nom` (ex. `Pharmacie Saint Barthélémy`). Réponses injectées en HTML ; `<strong>` et `<br>` conservés. Apostrophes droites ASCII, espaces normales (pas d'insécables) avant `?`, `€`, `%`.

| # | Question | Réponse (HTML) |
|---|---|---|
| 1 | `Quels sont les horaires de téléconsultation ?` | `La téléconsultation est disponible pendant les horaires d'ouverture de la <strong>{nom}</strong>. Un médecin généraliste peut vous recevoir sans rendez-vous, généralement en moins de 15 minutes.` |
| 2 | `La consultation est-elle remboursée ?` | `Oui. Les médecins sont <strong>conventionnés secteur 1</strong>. La consultation (25 €) est remboursée par l'Assurance Maladie et peut être prise en charge jusqu'à 100 % avec votre mutuelle selon votre situation.` |
| 3 | `Dois-je prendre rendez-vous ?` | `Ce n'est pas obligatoire. Vous pouvez consulter un médecin <strong>sans rendez-vous directement à la {nom}</strong>.<br><br>Vous pouvez aussi <strong>réserver un créneau en ligne avant de venir</strong> pour bénéficier d'un passage prioritaire.` |
| 4 | `Puis-je obtenir une ordonnance ou un arrêt de travail ?` | `Oui, si le médecin estime que cela est nécessaire. L'ordonnance est transmise à la fin de la consultation. L'arrêt de travail délivré en téléconsultation ne peut pas dépasser <strong>3 jours</strong>.` |
| 5 | `Que dois-je apporter pour la consultation ?` | `Pensez à apporter votre <strong>carte Vitale</strong> afin de faciliter la prise en charge et le remboursement.` |
| 6 | `Une téléconsultation est-elle possible pour mon enfant de moins de deux ans ?` | `La téléconsultation n'est <strong>pas adaptée aux enfants de moins de deux ans</strong>. Un examen en présentiel est généralement nécessaire pour une prise en charge adaptée.` |
| 7 | `Puis-je faire une téléconsultation pour une déclaration d'accident de travail ?` | `La déclaration d'accident de travail nécessite souvent une <strong>évaluation approfondie</strong>, incluant des examens physiques non réalisables à distance. Une consultation en présentiel est recommandée.` |
| 8 | `Puis-je obtenir un certificat médical pour faire du sport en téléconsultation ?` | `La délivrance d'un certificat médical peut nécessiter des <strong>examens physiques spécifiques</strong> pour évaluer l'aptitude au sport. Une consultation en présentiel est donc recommandée.` |

Rendu ouvert (capture `faq-open-1440.png`, item 1) : chevron pointant vers le haut, filet crème sous la question, texte sur 2 lignes à 1440 avec
« Pharmacie Saint Barthélémy » en gras (`strong` `[639,3350.2,232×21]`). Le `{nom}` étant inséré dans du HTML, l'échapper dans le clone (`&`, `<`) avant injection.
