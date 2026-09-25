# Composant — Pied de page global (`<footer>`)

> Rendu par le layout racine sur toutes les pages, sauf chemins `/embed…` (voir `header.md`).
> Toutes les valeurs numériques citent leur source.

## Sources abrégées

| Alias | Fichier |
|---|---|
| `H375` / `H768` / `H1440` | `docs/research/pages/home/computed-{375,768,1440}.json` — racine du footer = path `footer:21` |
| `CSS` | `docs/research/css/323d88a92ac6be07.css` |
| `DOM` | `docs/research/pages/home/dom.html` |
| `LAYOUT` | `docs/research/js/pretty/app_layout-ae5373d3d10bafec.js` (module 1501, composant `h`, l. 70-575) |
| `OUT` | `docs/research/pages/home/outline.txt` l. 768-876 |
| `TOK` | `docs/research/tokens.json` |

Chemins courts utilisés ci-dessous (préfixe `footer:21>div:0>` omis) : `L` = `div:0>div:0` (colonne gauche), `G` = `div:0>div:1` (grille de liens), `B` = `div:1` (barre du bas).

---

## 1. Structure DOM (classes exactes)

Source : `LAYOUT` l. 70-575 et `OUT`.

```html
<footer class="bg-[#0f352d] text-white">
  <div class="max-w-[1300px] mx-auto px-8 py-12">
    <div class="flex flex-col lg:flex-row gap-10 lg:gap-28">

      <!-- Colonne gauche -->
      <div class="lg:w-[150px] flex-shrink-0">
        <div class="mb-10">
          <img alt="Logo Tessan" width="120" height="50" src="/logo.svg" class="brightness-0 invert">
        </div>
        <div class="mb-6">
          <h3 class="mb-2 text-sm text-white font-semibold"
              style="font-family: Plus Jakarta Sans, sans-serif;">Adresse</h3>
          <p class="text-base leading-relaxed font-semibold">TESSAN<br>10 Rue Pergolèse<br>75016 Paris</p>
        </div>
        <div class="mb-8">
          <a class="inline-flex items-center gap-3 bg-[#feee80] text-[#1a4d4d] px-5 py-3 rounded font-semibold hover:bg-[#f0e060] transition-colors cursor-pointer"
             href="http://tessan.io/nous-contacter">Nous contacter<span class="text-xl">→</span></a>
        </div>
        <div class="flex gap-4 mb-0 lg:mb-8">
          <a href="https://www.facebook.com/Tessan.io/" target="_blank" rel="noopener noreferrer"
             class="hover:opacity-80 transition-opacity cursor-pointer"><svg width="24" height="24" viewBox="0 0 24 24" fill="none">…</svg></a>
          <a href="https://www.instagram.com/tessan.io/" …same classes…><svg …/></a>
          <a href="https://www.linkedin.com/company/tessan/" …><svg …/></a>
          <a href="https://www.youtube.com/@tessan2706" …><svg …/></a>
        </div>
      </div>

      <!-- Grille de liens -->
      <div class="flex-1 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-x-8 gap-y-12">
        <div>
          <h3 class="mb-3.5 text-sm" style="color: rgb(173, 186, 184); font-family: Plus Jakarta Sans, sans-serif;">PARTENAIRES</h3>
          <ul class="space-y-3 text-base font-semibold">
            <li><a class="hover:underline cursor-pointer" href="…">Pharmaciens</a></li>
            …
          </ul>
        </div>
        <div> … SOLUTIONS … (le 9e li porte class="pt-2") </div>
        <div class="min-w-[180px]"> … MEDECINS … </div>
        <div> … PATIENTS … </div>
        <div> … RESSOURCES … </div>
      </div>
    </div>

    <!-- Barre du bas -->
    <div class="border-t border-white/20 mt-6 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-sm">
      <p>© 2025 Tessan. Tous droits réservés.</p>
      <div class="flex flex-wrap gap-4 justify-center">
        <a class="underline hover:opacity-80 cursor-pointer" href="https://www.tessan.io/politique-de-confidentialite">Politique de confidentialité</a>
        <a class="underline hover:opacity-80 cursor-pointer" href="https://www.tessan.io/cgu">CGU</a>
        <a class="underline hover:opacity-80 cursor-pointer" href="https://www.tessan.io/mentions-legales">Mentions légales</a>
        <a class="underline hover:opacity-80 cursor-pointer" href="https://www.tessan.io/cookies">Cookies</a>
        <a class="underline hover:opacity-80 cursor-pointer" href="https://www.tessan.io/cgv-teleexpertise-dermatologie">CGV Téléexpertise dermatologique</a>
      </div>
    </div>
  </div>
</footer>
```

Notes :
- Les `h3` de colonnes ont un **style inline** (couleur `rgb(173, 186, 184)` = `#adbab8`, police Plus Jakarta Sans) qui l'emporte sur la règle de base `h1…h6{font-family:"Recoleta"…;font-weight:400}` (`CSS` base layer) → police sans-serif, **graisse 400**. Le h3 « Adresse » a seulement la police inline + `font-semibold` (600) + `text-white`.
- Icônes sociales : 4 SVG propriétaires en ligne (`viewBox 0 0 24 24`, `fill="none"`, un `<path fill="currentColor">` par icône ; Instagram et LinkedIn avec `fillRule/clipRule evenodd`). Tracés dans `LAYOUT` l. 134-212 (extraits aussi, avec leur `href`, dans `docs/research/pages/home/footer-social-svgs.json`) (Facebook : disque avec « f » ; Instagram : carré arrondi + cercle + point ; LinkedIn : carré plein avec « in » évidé ; YouTube : rectangle arrondi avec triangle « play » évidé). Aucun `aria-label` sur ces liens dans l'original.
- Les liens texte sont des `next/link` (même onglet). Seuls les 4 liens sociaux ont `target="_blank" rel="noopener noreferrer"`.
- Aucun JavaScript/état.

---

## 2. Valeurs CSS résolues

### 2.1 Conteneurs

| Élément | Propriété | 375 | 768 | 1440 | Source |
|---|---|---|---|---|---|
| `footer` | fond / texte | `rgb(15,53,45)` = `#0f352d` / `rgb(255,255,255)` | idem | idem | `H* footer:21` backgroundColor/color |
| `footer` | police héritée | Plus Jakarta Sans 16px/24px 400 | idem | idem | `H1440 footer:21` |
| `footer` | y / hauteur | 3545 / 2051.8 | 2791.4 / 1479.8 | 2021 / 611 | `H375/H768/H1440 footer:21` rect |
| `div:0` | max-width / largeur | 1300 / 375 | 1300 / 768 | 1300 / 1300 (x 70, marges 70) | `H* footer:21>div:0` |
| `div:0` | padding | 48px 32px | 48px 32px | 48px 32px | idem paddingTop/Right/Bottom/Left |
| `L`+`G` wrapper (`div:0>div:0`) | disposition | flex **column**, gap 40 | flex **column**, gap 40 | flex **row**, gap 112 | `H375/H768/H1440 footer:21>div:0>div:0` flexDirection/gap |

### 2.2 Colonne gauche (`L`)

| Élément | Propriété | 375 | 768 | 1440 | Source |
|---|---|---|---|---|---|
| colonne | largeur | 311 | 704 | 150 (`lg:w-[150px]`, flex-shrink 0) | `H* …>div:0>div:0>div:0` rect.w |
| logo `img` | boîte | 120 × 26.84 | 120 × 26.84 | 120 × 26.84 | `H* …>div:0>div:0>div:0>div:0>img:0` |
| logo | filtre | `brightness(0%) invert(100%)` → blanc pur | | | `CSS .brightness-0`, `.invert` |
| bloc logo | margin-bottom | 40 | 40 | 40 | `H* …>div:0>div:0>div:0>div:0` marginBottom |
| bloc adresse | margin-bottom | 24 | 24 | 24 | `…>div:1` marginBottom |
| h3 « Adresse » | police | 14px / 20px, 600, blanc | idem | idem | `H1440 …>div:1>h3:0` |
| h3 « Adresse » | margin-bottom | 8 | 8 | 8 | idem |
| p adresse | police | 16px / 26px (`leading-relaxed` 1.625), 600 | idem | idem | `H1440 …>div:1>p:1` ; `TOK leading.relaxed` |
| p adresse | hauteur | 78 (3 lignes) | 78 | 78 | idem rect.h |
| bloc contact | margin-bottom | 32 | 32 | 32 | `…>div:2` marginBottom |
| bouton « Nous contacter » | boîte | 197 × 52 (1 ligne) | 197 × 52 | **153 × 72** (texte replié sur 2 lignes « Nous / contacter » car colonne de 150 px ; déborde de 3 px) | `H375/H768/H1440 …>div:2>a:0` rect |
| bouton | display / gap | inline-flex, `align-items:center`, gap 12 | idem | idem | idem |
| bouton | padding | 12px 20px | idem | idem | idem |
| bouton | radius | 4 px | idem | idem | idem borderRadius |
| bouton | fond / texte | `rgb(254,238,128)` `#feee80` / `rgb(26,77,77)` `#1a4d4d` | idem | idem | `H1440 …>div:2>a:0` |
| bouton | police | 16px/24px 600 | idem | idem | idem |
| flèche `span.text-xl` | police | 20px / 28px, 600, `#1a4d4d`, 20 × 28 | idem | idem | `H1440 …>div:2>a:0>span:0` |
| rangée sociale | display / gap | flex, gap 16 | idem | idem | `…>div:3` |
| rangée sociale | margin-bottom | 0 | 0 | 32 (`lg:mb-8`) | `H375` (absent = 0), `H1440 …>div:3` marginBottom |
| icône sociale | boîte | 24 × 24, pas 40 px (x 32, 72, 112, 152 à 375 ; 102, 142, 182, 222 à 1440) | | | `H375/H1440 …>div:3>a:0…a:3` |
| icône | couleur | blanc (`currentColor`) | | | `H1440 …>div:3>a:0` color |

### 2.3 Grille de liens (`G`)

| Propriété | 375 | 768 | 1440 | Source |
|---|---|---|---|---|
| position / largeur | x 32, 311 | x 32, 704 | x 364, 974 | `H* footer:21>div:0>div:0>div:1` |
| grid-template-columns | `311px` (1 col.) | `336px 336px` | `169.188px 169.203px 169.203px 169.203px 169.188px` | idem gridTemplateColumns |
| gap (ligne / colonne) | 48 / 32 | 48 / 32 | 48 / 32 | idem `gap: 48px 32px` |
| Colonne MEDECINS | min-width 180 (largeur 180 à 1440) | | | `H1440 …>div:1>div:2` rect.w ; `CSS .min-w-\[180px\]` |
| h3 colonnes | 14px / 20px, **400**, couleur `rgb(173,186,184)`, margin-bottom 14 | idem | idem | `H1440 …>div:1>div:0>h3:0` |
| ul | 16px / 24px, 600, blanc | idem | idem | `H1440 …>div:1>div:0>ul:1` |
| li | margin-bottom 12 (sauf dernier) | idem | idem | `H1440 …>ul:1>li:0` marginBottom ; `CSS :where(.space-y-3>…)` |
| li « - Téléconsultation » | padding-top 8 (`pt-2`) → hauteur 32 | | | `H1440 …>div:1>div:1>ul:1>li:8` |
| a | `display:inline` ; libellés longs replient (ex. « Médecins généralistes », « La table de téléophtalmologie » sur 2 lignes → li 48 px à 1440) | | | `H1440 …>div:2>ul:1>li:0` h 48 |

Ordre visuel à 768 : grille 2 colonnes → (PARTENAIRES | SOLUTIONS), (MEDECINS | PATIENTS), (RESSOURCES | vide) (`H768` x 32 / 400 des colonnes `div:0…div:4`).

### 2.4 Barre du bas (`B`)

| Propriété | 375 | 768 | 1440 | Source |
|---|---|---|---|---|
| boîte | x 32, y 5387.8, 311 × 161 | x 32, y 4134.2, 704 × 89 | x 102, y 2531, 1236 × 53 | `H* footer:21>div:0>div:1` |
| disposition | flex **column**, `align-items:center`, gap 16 | flex **row**, `justify-content:space-between`, `align-items:center`, gap 16 | row, idem | idem flexDirection |
| border-top | 1px, `oklab(0.999994 … / 0.2)` = blanc 20 % (`#fff3`) | idem | idem | `H375 …>div:1` borderTopColor ; `CSS .border-white\/20` |
| margin-top / padding-top | 24 / 32 | idem | idem | `H1440 …>div:1` marginTop/paddingTop |
| police | 14px / 20px, 400, blanc | idem | idem | `H1440 …>div:1` |
| p copyright | 242 × 20, centré (x 66.5) | 182.4 × 40 (**2 lignes**) | 242 × 20 | `H* …>div:1>p:0` |
| conteneur liens | flex-wrap, `justify-content:center`, gap 16 ; 3 rangées (x centrées) | 505.6 × 56, 2 rangées | 671 × 20, 1 rangée | `H* …>div:1>div:1` |
| liens | `text-decoration: underline`, 14px/20px | idem | idem | `H1440 …>div:1>div:1>a:*` textDecorationLine |

---

## 3. États

| Élément | État | Valeur | Source |
|---|---|---|---|
| « Nous contacter » | :hover | fond `#f0e060` (texte inchangé `#1a4d4d`), transition-colors 0.15s | `CSS .hover\:bg-\[\#f0e060\]:hover` ; `TOK footer-contact-hover` |
| Icônes sociales | :hover | `opacity: .8`, transition-opacity 0.15s | `CSS .hover\:opacity-80:hover`, `transition-opacity` (`css-analysis.json transitions`) |
| Liens de colonnes | :hover | `text-decoration-line: underline` (pas de transition) | `CSS .hover\:underline:hover` |
| Liens barre du bas | repos / :hover | soulignés / `opacity: .8` (pas de transition) | `CSS .hover\:opacity-80:hover` |
| Tous | :focus / :active | aucun style spécifique | classes `LAYOUT` |

Tous les `hover:` sont dans `@media (hover:hover)` (`CSS`).

---

## 4. Textes exacts et liens (ordre DOM)

Source : `LAYOUT` l. 94-570 (libellés + `href`).

**Colonne gauche**
- h3 : `Adresse`
- p : `TESSAN` ⏎ `10 Rue Pergolèse` ⏎ `75016 Paris` (deux `<br>`)
- Bouton : `Nous contacter` suivi du `span` `→` (U+2192) — href `http://tessan.io/nous-contacter` (**http**, sans `www`, tel quel)
- Sociaux : Facebook `https://www.facebook.com/Tessan.io/` · Instagram `https://www.instagram.com/tessan.io/` · LinkedIn `https://www.linkedin.com/company/tessan/` · YouTube `https://www.youtube.com/@tessan2706`

**PARTENAIRES**

| Libellé | href |
|---|---|
| Pharmaciens | `https://www.tessan.io/pharmaciens` |
| Opticiens | `https://www.tessan.io/opticiens-teleconsultation` |
| Infirmiers | `https://www.tessan.io/infirmiers` |
| Collectivités | `https://www.tessan.io/collectivites` |
| Dirigeants | `https://www.tessan.io/dirigeants` |
| EHPAD | `https://www.tessan.io/ehpad` |

**SOLUTIONS**

| Libellé | href |
|---|---|
| Nos solutions | `https://www.tessan.io/nos-solutions` |
| La cabine Premium | `https://www.tessan.io/nos-solutions/cabine-premium` |
| La cabine Slim | `https://www.tessan.io/nos-solutions/cabine-teleconsultation-slim` |
| La borne | `https://www.tessan.io/nos-solutions/borne-teleconsultation` |
| La console | `https://www.tessan.io/nos-solutions/console-teleconsultation` |
| La mallette | `https://www.tessan.io/nos-solutions/mallette-teleconsultation` |
| La table de téléophtalmologie | `https://www.tessan.io/nos-solutions/table-teleophtalmologie` |
| Tessan IA | `https://www.tessan.io/tessan-ia` |
| `- Téléconsultation` (tiret-moins ASCII + espace ; `li.pt-2`) | `https://www.tessan.io/tessan-ia/teleconsultation` |
| La téléexpertise dermatologique | `https://www.tessan.io/nos-solutions/teleexpertise-dermatologique` |

**MEDECINS** (sans accent dans le titre, tel quel)

| Libellé | href |
|---|---|
| Médecins généralistes | `https://www.tessan.io/medecins` |
| Dermatologues | `https://www.tessan.io/dermatologues` |
| Ophtalmologues | `https://www.tessan.io/ophtalmologues-teleconsultation` |
| Pédiatres | `https://www.tessan.io/pediatre` |

**PATIENTS**

| Libellé | href |
|---|---|
| La téléconsultation augmentée | `https://www.tessan.io/la-teleconsultation-augmentee` |
| Tarifs et remboursements | `https://www.tessan.io/tarifs-et-remboursements` |
| Médecine générale | `https://www.tessan.io/medecine-generale` |
| Dermatologie | `https://www.tessan.io/dermatologie` |
| Ophtalmologie | `https://www.tessan.io/ophtalmologue-teleconsultation` |
| Pneumologie | `https://www.tessan.io/pneumologie` |
| Gériatrie | `https://www.tessan.io/geriatrie` |

**RESSOURCES**

| Libellé | href |
|---|---|
| Blog | `https://www.tessan.io/blog` |
| FAQ | `https://aide.tessan.io/fr/` |
| Qui sommes-nous ? (espace simple avant « ? ») | `https://www.tessan.io/qui-sommes-nous` |
| Carrières | `https://www.welcometothejungle.com/fr/companies/tessan` |

**Barre du bas**
- `© 2025 Tessan. Tous droits réservés.` (`LAYOUT` l. 535 : `"\xa9 2025 Tessan. Tous droits r\xe9serv\xe9s."` — `\xa9` = « © », suivi d'une espace **simple**)
- Liens : voir structure §1 (Politique de confidentialité · CGU · Mentions légales · Cookies · CGV Téléexpertise dermatologique).

Titres de colonnes exactement en capitales dans le source : `PARTENAIRES`, `SOLUTIONS`, `MEDECINS`, `PATIENTS`, `RESSOURCES` (pas de `text-transform`).

## 5. Incertitudes

- `opacity` et `filter` ne figurent pas dans les dumps `getComputedStyle` (propriétés non exportées) : les valeurs de survol/filtre viennent du CSS compilé (`CSS`), non d'une mesure.
- Le débordement de 3 px du bouton « Nous contacter » à ≥ 1024 px est un comportement réel de l'original (153 px dans une colonne de 150 px) : le reproduire tel quel.
