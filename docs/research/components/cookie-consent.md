# Composant — Consentement cookies (bannière CookieYes, centre de préférences, bouton « revisit »)

> L'original charge le widget tiers **CookieYes** (`https://cdn-cookieyes.com/client_data/026ec920fc49a8dacb6495fc/banner.js`, type de bannière `box`, loi `gdpr`, langue `fr`). Le clone doit reproduire le rendu et le comportement **sans** charger ce script.
> Les règles CSS citées ci-dessous sont celles de la feuille `<style id="cky-style">` injectée par CookieYes (copie intégrale dans `DOM`), les couleurs sont des **styles inline** posés par CookieYes à partir de la configuration du compte.

## Sources abrégées

| Alias | Fichier |
|---|---|
| `DOM` | `docs/research/pages/home/dom.html` (HTML sérialisé : `<style id="cky-style">…</style>` + balisage des 4 blocs) |
| `CB` | `docs/research/pages/home/cookie-banner.json` (mesures bannière : clés `d1440`, `d375`) |
| `CP` | `docs/research/pages/home/cookie-preferences.json` (mesures centre de préférences à 1440×900 ; tableau `els` = classe · texte · x · y · w · h · font-size · weight · color · bg · border · radius · padding (séparateur `\|` dans le fichier)) |
| `CFG` | `docs/research/pages/home/bodies/5f9a061d4d.txt` (config CookieYes : `togglerSwitch`, `readMore`, `bannerType`, `scriptExpiry`…) |
| `I18N` | `docs/research/pages/home/bodies/fb70588cea.txt` (textes FR de la bannière) |
| `CKL` | `docs/research/pages/home/bodies/ce911e1c67.txt` (liste des cookies + titres/descriptions de catégories) |
| `OUT` | `docs/research/pages/home/outline.txt` l. 1-621 |
| `TOK` | `docs/research/tokens.json` (`cookie-bg`, `cookie-text`, `cookie-customize-bg`, `cookie-shadow`) |
| Captures | `docs/reference/states/cookie-banner-visible-1440.png`, `cookie-banner-375.png`, `cookie-banner-1440.png` (bannière seule 440×306), `cookie-preferences-1440.png` |

Palette effective (inline, `DOM` + `CFG`) :

| Rôle | Couleur |
|---|---|
| Fond bannière / modale, bordure bannière | `#F7F7ED` (`rgb(247,247,237)`) |
| Texte (titre, description, boutons clairs) | `#0F352D` (`rgb(15,53,45)`) |
| Bouton « Personnaliser » (fond + bordure) | `#FEFFED` (`rgb(254,255,237)`) |
| Bouton « Refuser » (fond + bordure) | `#F7F7ED` (se confond avec le fond) |
| Bouton « Accepter » | fond + bordure `#0F352D`, texte `#F7F7ED` |
| Bouton « Enregistrer mes préférences » | fond + bordure `#EAFBAF` (`rgb(234,251,175)`), texte `#0F352D` |
| Bouton revisit | fond `#0F352D` |
| Interrupteurs | actif `#0F352D`, inactif `#F7F7ED` (`CFG togglerSwitch.styles`) |
| Lien « Afficher plus » | `#1863dc` (couleur CookieYes par défaut, non surchargée) |
| « Toujours actif » | `green` = `rgb(0,128,0)` |
| Bandeau « Powered by » | texte `#293C5B`, fond `#EDEDED` |

---

## A. Bannière (`.cky-consent-container`)

### A.1 DOM (classes et attributs exacts, `DOM`)

```html
<div class="cky-consent-container cky-box-bottom-left" role="region"
     aria-label="Nous respectons votre vie privée." tabindex="-1">
  <div class="cky-consent-bar" data-cky-tag="notice" style="border-color: #F7F7ED; background-color: #F7F7ED;">
    <div class="cky-notice">
      <p class="cky-title" data-cky-tag="title" aria-level="2" role="heading" style="color: #0F352D;">Nous respectons votre vie privée.</p>
      <div class="cky-notice-group">
        <div class="cky-notice-des" data-cky-tag="description" style="color: #0F352D;">
          <p>Nous utilisons les cookies pour la mesure de notre audience et pour la bonne utilisation du service.&nbsp;</p>
          <p>&nbsp;En cliquant sur « Accepter », vous consentez à notre utilisation des cookie.</p>
          <p>Pour en savoir plus sur les traceurs utilisés et les traitements réalisés, vous pouvez consulter notre&nbsp;&nbsp;<a href="https://tessan.io/cookies/" class="cky-policy" aria-label="Politique relative aux cookies" target="_blank" rel="noopener" style="color: #0F352D; border-color: #F7F7ED; background-color: #F7F7ED;" data-cky-tag="readmore-button">Politique relative aux cookies</a></p>
        </div>
        <div class="cky-notice-btn-wrapper" data-cky-tag="notice-buttons" role="group">
          <button class="cky-btn cky-btn-customize" aria-label="Personnaliser" aria-haspopup="dialog" aria-controls="ckyPreferenceCenter" data-cky-tag="settings-button" style="color: #0F352D; border-color: #FEFFED; background-color: #FEFFED;">Personnaliser</button>
          <button class="cky-btn cky-btn-reject" aria-label="Refuser" data-cky-tag="reject-button" style="color: #0F352D; border-color: #F7F7ED; background-color: #F7F7ED;">Refuser</button>
          <button class="cky-btn cky-btn-accept" aria-label="Accepter" data-cky-tag="accept-button" style="color: #F7F7ED; border-color: #0F352D; background-color: #0F352D;">Accepter</button>
        </div>
      </div>
    </div>
  </div>
</div>
```

Quand la bannière est masquée, CookieYes ajoute la classe `cky-hide` (`display:none`) au conteneur (gabarit `CFG.html` : `class="cky-hide cky-consent-container cky-box-bottom-left"`).

### A.2 CSS (desktop, > 576 px)

| Élément | Propriété | Valeur | Source |
|---|---|---|---|
| `.cky-consent-container` | position | `fixed`, `bottom:40px`, `left:40px` | `CB d1440.container` pos/bottom/left ; `DOM .cky-box-bottom-left` |
| | largeur / hauteur mesurée | 440 px / 306 px (x 40, y 554 à 1440×900) | `CB d1440.container.box` |
| | z-index / radius | `9999999` / 6 px | `DOM .cky-consent-container` ; `CB d1440.container.radius` |
| `.cky-consent-bar` | fond / bordure | `#F7F7ED` / `1px solid #F7F7ED` | `CB d1440.bar.bg/border` |
| | padding | `20px 26px` | `CB d1440.bar.pad` |
| | box-shadow | `rgba(172,171,171,0.3) 0px -1px 10px 0px` | `CB d1440.bar.shadow` ; `TOK cookie-shadow` |
| | radius | 6 px | `CB d1440.bar.radius` |
| Police globale | | héritée du `body` : Plus Jakarta Sans | `CB d1440.*.font` |
| `.cky-title` | police | 18px / 24px, 700, `#0F352D` | `CB d1440.title` |
| | marge / boîte | `0 0 12px` ; x 67, y 575, 386 × 24 | `CB d1440.title.margin/box` |
| `.cky-notice-des` | police | 14px / 24px, 400, `#0F352D` | `CB d1440.des` |
| | paragraphes | marges 0 (préflight Tailwind `*{margin:0}` + `.cky-consent-bar .cky-notice-des p{margin-top:0}`) → 7 lignes de 24 px à 1440 (y 611 → 779) | `CB d1440.title.box` + `CB d1440.btnWrap.box` (795 − 16) ; capture `cookie-banner-visible-1440.png` |
| `a.cky-policy` | police | 14px, 400, `#0F352D`, `text-decoration: underline`, `white-space: nowrap`, bordure `1px solid #F7F7ED`, fond `#F7F7ED` | `CB d1440.link` ; `DOM` règle `.cky-notice-des a.cky-policy` |
| | boîte | x 108, y 757, 192 × 20 | `CB d1440.link.box` |
| `.cky-notice-btn-wrapper` | disposition | flex, `flex-wrap:wrap`, `justify-content:flex-start`, `align-items:center`, gap 8, `margin-top:16px` | `CB d1440.btnWrap` ; `DOM` |
| | boîte | x 67, y 795, 386 × 44 | `CB d1440.btnWrap.box` |
| `.cky-btn` (commun) | police | 14px / 24px, 500, `text-align:center` | `CB d1440.customize` |
| | padding / bordure / radius | 8 px / 2 px solide / 2 px | `CB d1440.customize.pad/border/radius` |
| | hauteur | 44 px (8+24+8+2+2) | `CB d1440.customize.box.h` |
| | flex | `flex:auto; max-width:100%` (largeurs = contenu + partage de l'espace libre) | `DOM .cky-btn` |
| Personnaliser | boîte | x 67, 144.33 × 44 | `CB d1440.customize.box` |
| Refuser | boîte | x 219.33, 108.33 × 44 | `CB d1440.reject.box` |
| Accepter | boîte | x 335.66, 117.33 × 44 | `CB d1440.accept.box` |

Ordre visuel desktop : **Personnaliser · Refuser · Accepter** (ordre DOM).

### A.3 CSS mobile (media queries CookieYes, `DOM`)

| Condition | Règles | Mesure à 375×812 (`CB d375`) |
|---|---|---|
| `max-width:576px` | `.cky-box-bottom-left{bottom:0;left:0}` | conteneur x 0, y 398 |
| `max-width:440px` | conteneur `width:100%;max-width:100%` ; `.cky-consent-bar{padding:20px 0}` ; `.cky-notice .cky-title, .cky-notice-des, .cky-notice-btn-wrapper{padding:0 24px}` ; `.cky-notice-des{max-height:40vh;overflow-y:scroll}` ; `.cky-notice-btn-wrapper{gap:10px;flex-direction:column}` ; `.cky-btn{width:100%}` ; ordre : `.cky-btn-accept{order:1}` `.cky-btn-customize{order:2}` `.cky-btn-reject{order:3}` | conteneur 375 × 414 ; titre x 1, y 419, 373 × 24 (padding 0 24px) ; description x 25, y 455 (7 lignes, 168 px) ; lien x 66, y 601 ; boutons 325 × 44 : Accepter y 639, Personnaliser y 693, Refuser y 747 ; wrapper 373 × 152 |
| `max-width:352px` | titre 16px ; description et boutons 12px | non mesuré |
| `max-height:480px` | conteneur `max-height:100vh;overflow-y:scroll` ; description sans limite | non mesuré |
| `min-width:576px and max-height:660px` | `.cky-notice-des{max-height:40vh;overflow-y:scroll}` | non mesuré |

À 768 px (entre 577 et 845 px) : même rendu que desktop (440 px, `bottom/left 40px`). Entre 441 et 576 px : collé en bas à gauche (`0/0`) mais largeur 440 px.

### A.4 États

| Élément | État | Valeur | Source |
|---|---|---|---|
| `.cky-btn` | :hover | `filter: brightness(.9)` (assombrit fond et texte) | `DOM .cky-btn:hover` |
| `.cky-btn`, `a.cky-policy` | :focus-visible | `outline: 2px solid #1863dc; outline-offset: 2px` | `DOM` règle `…:focus-visible` |
| `.cky-btn` | :focus (souris) | `outline:0` | `DOM .cky-btn:focus:not(:focus-visible)` |
| boutons | :hover/:focus | `text-decoration:none` | `DOM .cky-consent-bar button:hover` |

---

## B. Centre de préférences (modale « Personnaliser »)

### B.1 DOM (structure, `DOM` + `OUT` l. 21-621)

```html
<div class="cky-overlay cky-hide"></div>              <!-- voile, visible seulement modale ouverte -->
<div class="cky-modal [cky-modal-open]" tabindex="-1">
  <div class="cky-preference-center" data-cky-tag="detail" role="dialog" aria-modal="true" id="ckyPreferenceCenter"
       aria-labelledby="ckyPreferenceTitle" style="color: #0F352D; border-color: #F7F7ED; background-color: #F7F7ED;">
    <div class="cky-preference-header">
      <span class="cky-preference-title" aria-level="2" data-cky-tag="detail-title" role="heading" id="ckyPreferenceTitle" style="color: #0F352D;">Personnaliser les préférences en matière de consentement</span>
      <button aria-label="Fermer" class="cky-btn-close" data-cky-tag="detail-close"><img alt="" src="https://cdn-cookieyes.com/assets/images/close.svg"></button>
    </div>
    <div class="cky-preference-body-wrapper">
      <div class="cky-preference-content-wrapper" data-cky-tag="detail-description" style="color: #0F352D;">
        <p>Nous utilisons des cookies …ci-dessous.</p>
        <p>Les cookies qui sont catégorisés … de base du site....&nbsp;<button class="cky-show-desc-btn" data-cky-tag="show-desc-button" aria-expanded="false" aria-label="Afficher plus">Afficher plus</button></p>
      </div>
      <div class="cky-dma-content-wrapper" data-cky-tag="detail-dma-description" style="color: #0F352D;">
        <p>Pour plus d’informations … consultez la :&nbsp;<a href="https://www.tessan.io/politique-de-confidentialite" class="cky-policy" aria-label="Politique de confidentialité de Tessan" target="_blank" rel="nofollow noopener noreferrer" style="color: #0F352D; border-color: #F7F7ED; background-color: #F7F7ED;" data-cky-tag="detail-dma-button">Politique de confidentialité de Tessan</a></p>
      </div>
      <div class="cky-horizontal-separator"></div>
      <div class="cky-accordion-wrapper" data-cky-tag="detail-categories">
        <!-- ×6 : necessary, functional, analytics, performance, advertisement, other -->
        <div class="cky-accordion" id="ckyDetailCategorynecessary">
          <div class="cky-accordion-item">
            <div class="cky-accordion-chevron"><i class="cky-chevron-right"></i></div>
            <div class="cky-accordion-header-wrapper">
              <div class="cky-accordion-header">
                <button class="cky-accordion-btn" aria-expanded="false" aria-controls="ckyDetailCategorynecessaryBody" aria-label="Nécessaire" data-cky-tag="detail-category-title" style="color: #0F352D;">Nécessaire</button>
                <span class="cky-always-active" data-cky-tag="always-active">Toujours actif</span>
                <!-- autres catégories à la place du span : -->
                <!-- <div class="cky-switch" data-cky-tag="detail-category-toggle"><input type="checkbox" role="switch" id="ckySwitchfunctional" aria-label="Activer Fonctionnelle" autocomplete="off" style="background-color: rgb(247, 247, 237);"></div> -->
              </div>
              <div class="cky-accordion-header-des" data-cky-tag="detail-category-description" style="color: #0F352D;"><p>…</p></div>
            </div>
          </div>
          <div class="cky-accordion-body" id="ckyDetailCategorynecessaryBody">
            <div class="cky-audit-table">
              <ul class="cky-cookie-des-table">
                <li><div>Cookie</div><div>_cfuvid</div></li>
                <li><div>Durée</div><div>session</div></li>
                <li><div>Description</div><div>…</div></li>
              </ul> …
            </div>
          </div>
        </div>
        …
      </div>
    </div>
    <div class="cky-footer-wrapper">
      <span class="cky-footer-shadow" style="background: linear-gradient(180deg, rgba(255, 255, 255, 0) 0%, #F7F7ED 100%);"></span>
      <div class="cky-prefrence-btn-wrapper" data-cky-tag="detail-buttons" role="group">
        <button aria-label="Refuser" class="cky-btn cky-btn-reject" data-cky-tag="detail-reject-button" style="color: #0F352D; border-color: #F7F7ED; background-color: #F7F7ED;">Refuser</button>
        <button aria-label="Enregistrer mes préférences" class="cky-btn cky-btn-preferences" data-cky-tag="detail-save-button" style="color: #0F352D; border-color: #EAFBAF; background-color: #EAFBAF;">Enregistrer mes préférences</button>
        <button aria-label="Accepter" class="cky-btn cky-btn-accept" data-cky-tag="detail-accept-button" style="color: #F7F7ED; border-color: #0F352D; background-color: #0F352D;">Accepter</button>
      </div>
      <div data-cky-tag="detail-powered-by" style="padding: 8px 24px; font-size: 12px; font-weight: 400; line-height: 20px; text-align: right; border-radius: 0 0 6px 6px; direction: ltr; display: flex; justify-content: flex-end; align-items: center; color: #293C5B; background-color: #EDEDED;">Powered by <a aria-label="Visit CookieYes website" href="https://www.cookieyes.com/product/cookie-consent/?ref=cypbcyb&amp;utm_source=cookie-banner&amp;utm_medium=powered-by-cookieyes" rel="noopener" style="margin-left:5px;line-height:0" target="_blank"><img alt="" src="https://cdn-cookieyes.com/assets/images/poweredbtcky.svg" style="width:78px;height:13px;margin:0"></a></div>
    </div>
  </div>
</div>
```

(Orthographe CookieYes conservée : classe `cky-prefrence-btn-wrapper`.)

### B.2 CSS résolu (1440×900)

| Élément | Propriété | Valeur | Source |
|---|---|---|---|
| `.cky-overlay` | | `position:fixed; inset 0 (top/left 0, 100%×100%); background:#000; opacity:.4; z-index:99999999` → fond de page blanc rendu `#999999` | `DOM .cky-overlay` ; pixel (5,5) de `cookie-preferences-1440.png` = `#999999` |
| `.cky-modal` (fermée) | | `position:fixed; top:50%; transform:translate(-50%,100%); visibility:hidden; transition:all 0s ease; max-width:100%; background:#fff; border-radius:6px; box-shadow:0 32px 68px rgb(0 0 0/.3); z-index:999999999; color:#212121` | `DOM .cky-modal` |
| `.cky-modal.cky-modal-open` | | `display:flex; visibility:visible; top:50%; left:50%; transform:translate(-50%,-50%); transition:all 1s ease; max-height:100%` → **glisse du bas vers le centre en 1 s** à l'ouverture, disparition instantanée à la fermeture | `DOM` |
| `.cky-preference-center` | boîte mesurée | x 297.5, y 94.5, **845 × 711** (711 = 79vh de 900) | `CP.box` |
| | | `width:845px; max-height:79vh; display:flex; flex-direction:column; overflow:hidden; flex:1 1 0%; border-radius:6px` ; fond/bordure `#F7F7ED`, texte `#0F352D` | `DOM` ; `CP.bg`, `CP.radius` |
| `.cky-preference-header` | | flex, `align-items:center; justify-content:space-between; padding:22px 24px; border-bottom:1px solid` (couleur héritée `#F7F7ED` → invisible) | `DOM` |
| `.cky-preference-title` | | 18px / 24px, 700, `#0F352D` ; boîte x 321, y 116, 531 × 24 | `CP.els[0]` |
| `.cky-btn-close` | | 24 × 24, sans fond/bordure/padding ; `img` 10 × 10 (croix grise CDN `close.svg`) | `DOM .cky-preference-header .cky-btn-close` |
| `.cky-preference-body-wrapper` | | `padding:0 24px; flex:1; overflow:auto` (zone défilante) | `DOM` |
| `.cky-preference-content-wrapper` | | 14px / 24px, 400, `padding:12px 0` ; p1 x 321, y 175, 797 × 48 ; p2 y 223, 797 × 48 | `DOM` ; `CP.els[1..2]` |
| `.cky-show-desc-btn` | | 14px/24px, 400, `#1863dc` (`rgb(24,99,220)`), souligné, `nowrap`, fond transparent ; boîte x 629, y 247, 81 × 24 | `CP.els[3]` ; `DOM` |
| `.cky-dma-content-wrapper` | | 14px/24px, 400, `padding:4px 0 12px` ; lien `a.cky-policy` souligné `#0F352D`, bordure/fond `#F7F7ED` | `DOM` |
| `.cky-horizontal-separator` | | `border-bottom:1px solid` couleur héritée (invisible) | `DOM` |
| `.cky-accordion-wrapper` | | `margin-bottom:10px` | `DOM` |
| `.cky-accordion` | | `border-bottom:1px solid` (hérité, invisible), dernier sans bordure | `DOM` |
| `.cky-accordion-item` | | flex, `margin-top:10px` | `DOM` |
| `.cky-accordion-chevron` | | `margin-right:22px; position:relative` ; `i::before` : carré 6×6, `border-right/bottom:1.4px solid` couleur héritée (≈ `#F7F7ED`, quasi invisible — pixel `#e9e9e8` mesuré en (327,371)), `transform:rotate(-45deg)` (›), `top:8px`, `transition:all .2s ease-in-out` ; ouvert : `rotate(45deg)` (⌄) | `DOM` ; capture |
| `.cky-accordion-header` | | flex, `justify-content:space-between; align-items:center` | `DOM` |
| `.cky-accordion-btn` | | 16px/24px, 700, `#0F352D`, sans fond ; ex. « Nécessaire » x 343, y 358, 90 × 24 | `CP.els[4]` |
| `.cky-always-active` | | 14px/24px, 600, `rgb(0,128,0)` ; x 1018, y 358, 100 × 24 | `CP.els[5]` |
| `.cky-accordion-header-des` | | 14px/24px, `margin:10px 0 16px` ; ex. x 343, y 392, 775 × 48 | `DOM` ; `CP.els[6]` |
| Pas vertical des catégories | | 109 px (358 → 467 → 576 → 685 → 794 → 903) | `CP.els` y des `cky-accordion-btn` |
| `.cky-switch input` | | 44 × 24, `border-radius:50px`, fond inline `rgb(247,247,237)` (inactif) ; x 1074 ; `::before` pastille blanche 20×20 à `left:2px; bottom:2px`, `transition:.4s` ; `:checked::before{transform:translateX(20px)}` ; fond actif `#0F352D` (`CFG togglerSwitch.activeColor`) | `CP.els[8]` ; `DOM` ; `CFG` |
| `.cky-accordion-body` | | masqué ; catégorie active → `display:block; padding:0 22px; margin-bottom:16px` | `DOM` |
| `.cky-audit-table` | | fond `#f4f4f4`, radius 6 ; `ul` 12px/24px, `padding:15px 10px`, séparateur `border-bottom:1px solid` hérité ; `li` flex `padding:3px 0` (1er : `padding-top:0`) ; 1re `div` largeur 100 px, 600 ; 2e `div` `flex:1; margin-left:8px` | `DOM` |
| `.cky-footer-shadow` | | 40 px de dégradé `linear-gradient(180deg, rgba(255,255,255,0) 0%, #F7F7ED 100%)`, `position:absolute; bottom:calc(100% - 1px)` ; boîte x 297, y 641, 845 × 40 | `DOM` ; `CP.els` « cky-footer-shadow » |
| `.cky-prefrence-btn-wrapper` | | flex wrap, gap 8, centré, `padding:22px 24px`, `border-top:1px solid` (invisible) ; x 297, y 680, 845 × 89 | `DOM` ; `CP.els` |
| Boutons pied | | `.cky-btn` (14px/24px 500, padding 8, bordure 2, radius 2, h 44) ; Refuser x 321, 213 × 44 ; Enregistrer x 542, 346 × 44 ; Accepter x 896, 222 × 44 (y 703) | `CP.els` |
| « Powered by » | | 12px/20px 400, `#293C5B` sur `#EDEDED`, `padding:8px 24px`, aligné à droite, radius `0 0 6px 6px` ; x 297, y 769, 845 × 36 ; logo 78 × 13 | `CP.els` |

Ordre visuel desktop des boutons du pied : **Refuser · Enregistrer mes préférences · Accepter**.

### B.3 Responsive (media queries CookieYes, `DOM`)

| Condition | Règles |
|---|---|
| `max-width:845px` | `.cky-modal{max-width:calc(100% - 16px)}` |
| `max-width:576px` | `.cky-modal{max-width:100%}` ; `.cky-preference-center{max-height:100vh}` ; `.cky-prefrence-btn-wrapper{flex-direction:column;gap:10px}` ; `.cky-btn{width:100%}` ; ordre : Accepter (1, `margin-top:0`), Enregistrer (2), Refuser (3) ; `.cky-accordion-body` `padding-right:0` |
| `max-width:425px` | chevron `margin-right:15px` ; corps actif `padding:0 15px` ; interrupteur 38 × 21, pastille 17 × 17, `translateX(17px)` |
| `max-width:352px` | titre 16px ; header `padding:16px 24px` ; textes 12px ; bouton de catégorie 14px |
| `max-height:576px` | `.cky-preference-center{height:100vh;overflow:auto}` |

Non mesuré à 375/768 (aucune capture de la modale sur ces largeurs) : appliquer les règles ci-dessus.

### B.4 États

| Élément | État | Valeur | Source |
|---|---|---|---|
| Boutons `.cky-btn` | :hover | `filter:brightness(.9)` | `DOM` |
| `.cky-show-desc-btn`, `.cky-accordion-btn`, `.cky-btn-close`, liens, interrupteurs | :focus-visible | `outline:2px solid #1863dc; outline-offset:2px` | `DOM` |
| `button.cky-show-desc-btn` | hors hover/active | `color:#1863dc; background:transparent` | `DOM` |
| Catégorie | ouverte (`.cky-accordion-active`) | chevron `rotate(45deg)`, corps affiché (tableau des cookies) | `DOM` |
| Interrupteur | coché | pastille translatée 20 px, fond `#0F352D` | `DOM` + `CFG` |

---

## C. Bouton « revisit » (rouvrir les préférences)

### C.1 DOM (`DOM`)

```html
<div class="cky-btn-revisit-wrapper cky-revisit-hide cky-revisit-bottom-left" data-cky-tag="revisit-consent"
     data-tooltip="Choix de consentement" style="background-color: #0F352D;">
  <button aria-label="Choix de consentement" class="cky-btn-revisit" aria-controls="ckyPreferenceCenter" aria-haspopup="dialog">
    <img alt="Revisit consent button" src="https://cdn-cookieyes.com/assets/images/revisit.svg">
  </button>
</div>
```
`cky-revisit-hide` (`display:none`) est retiré une fois le consentement donné.

### C.2 CSS

| Propriété | > 480 px | ≤ 480 px | Source |
|---|---|---|---|
| position | `fixed; bottom:15px; left:15px` | `bottom:8px; left:8px` | `DOM .cky-revisit-bottom-left` + `@media (max-width:480px)` |
| taille | 45 × 45, `border-radius:50%` | 36 × 36 | `DOM .cky-btn-revisit-wrapper` ; mesure pixels `home-1440`/`autocomplete-open-1440.png` : disque x 15-59, y 840-884 |
| fond | `#0F352D` (inline ; défaut CSS `#0056a7` surchargé) | idem | `DOM` style inline |
| z-index / curseur | `999999` / pointer | | `DOM` |
| contenu | flex centré ; `img` 30 × 30 | `img` 22 × 22 | `DOM .cky-btn-revisit img` |
| icône | pictogramme blanc au trait : cookie croqué (miettes en haut à gauche) avec coche « ✓ » au centre | | capture recadrée `autocomplete-open-1440.png` (0,830,80,70) |
| infobulle au survol | `::before` : `content:attr(data-tooltip)` = « Choix de consentement », `position:absolute; left:calc(100% + 7px)`, fond `#4e4b66`, texte `#fff` 12px/16px, `padding:4px 8px`, `border-radius:4px`, `width:max-content` ; `::after` : flèche `border:5px solid transparent; border-left-width:0; border-right-color:#4e4b66; left:calc(100% + 2px)` ; verticalement centrée (position statique dans le conteneur flex centré) | | `DOM .cky-revisit-bottom-left:hover::before/::after` |

---

## D. Comportement

Machine à états (vérifié en direct pour les points marqués ✔ ; le reste = comportement CookieYes déduit du CSS/HTML, marqué ◇) :

| Situation | Bannière | Modale + voile | Revisit |
|---|---|---|---|
| Première visite, aucun choix enregistré ✔ | visible | fermée | masqué |
| Clic « Accepter » (bannière ou modale) ✔ | masquée | fermée | **visible** |
| Clic « Refuser » (bannière ou modale) ✔ | masquée | fermée | **visible** |
| Clic « Personnaliser » ◇ | masquée pendant l'ouverture (capture `cookie-preferences-1440.png` : aucune bannière derrière le voile) | **ouverte** (glisse depuis le bas, 1 s) | masqué pendant l'ouverture (même capture : aucun disque en bas à gauche) |
| Clic revisit ✔ | — | **ouverte** | masqué pendant l'ouverture ◇ |
| Clic « Enregistrer mes préférences » ◇ | masquée | fermée | visible |
| Clic « Fermer » (×) ◇ | réapparaît si aucun choix n'a encore été enregistré ; sinon reste masquée | fermée | visible si un choix existe |
| Clic « Afficher plus » ◇ | | la description complète s'affiche (4 paragraphes, voir §E) et le bouton devient « Afficher moins » | |
| Clic sur un titre de catégorie / chevron ◇ | | déplie/replie le tableau des cookies de la catégorie (`.cky-accordion-active`) | |
| Interrupteur ◇ | | bascule la catégorie ; « Nécessaire » n'a pas d'interrupteur (« Toujours actif ») | |

- « Accepter » = toutes catégories à `yes` ; « Refuser » = seules les nécessaires ; « Enregistrer » = selon interrupteurs (tous décochés par défaut, `CP.els` fonds `rgb(247,247,237)`).
- Persistance : cookie first-party `cookieyes-consent` (famille `cookieyes-*`, durée « 1 an » dans `CKL` ; `CFG.scriptExpiry = 365`). Le clone peut utiliser un cookie ou `localStorage` équivalent ; le contenu exact du cookie CookieYes n'a pas été capturé (◇).
- `reloadOnAccept:false` (`CFG`) : aucun rechargement de page après choix.
- Les captures de référence de pages (`docs/reference/home-*.png`, `results-*`, `fiche-*`, états `hover-*`, `autocomplete-open`, `specialites-open`, `unknown-city`) ont été prises **après consentement** : bannière absente, bouton revisit visible en bas à gauche. Le clone doit pouvoir être mis dans cet état pour les comparaisons pixel.
- Superposition : bannière `z 9999999`, revisit `z 999999`, voile `z 99999999`, modale `z 999999999` — tous au-dessus du header (`z 50`) et de la carte.

---

## E. Textes exacts

Guillemets « » avec **espaces simples** U+0020 (vérifié octet par octet dans `DOM`). `&nbsp;` = U+00A0.

**Bannière** (`I18N` + `DOM`)
- Titre : `Nous respectons votre vie privée.`
- p1 : `Nous utilisons les cookies pour la mesure de notre audience et pour la bonne utilisation du service.` + `&nbsp;` final
- p2 : `&nbsp;` initial + `En cliquant sur « Accepter », vous consentez à notre utilisation des cookie.` (« cookie » au singulier, tel quel)
- p3 : `Pour en savoir plus sur les traceurs utilisés et les traitements réalisés, vous pouvez consulter notre` + `&nbsp;&nbsp;` + lien `Politique relative aux cookies` → `https://tessan.io/cookies/` (`target="_blank" rel="noopener"`)
- Boutons : `Personnaliser` · `Refuser` · `Accepter`
- `aria-label` du conteneur : `Nous respectons votre vie privée.`

**Modale**
- Titre : `Personnaliser les préférences en matière de consentement`
- Bouton fermer : `aria-label="Fermer"`
- Description (état replié, tel qu'affiché) :
  - `Nous utilisons des cookies pour vous aider à naviguer efficacement et à exécuter certaines fonctionnalités. Vous trouverez des informations détaillées sur tous les cookies sous chaque catégorie de consentement ci-dessous.`
  - `Les cookies qui sont catégorisés comme « nécessaires » sont stockés sur votre navigateur car ils sont essentiels pour permettre les fonctionnalités de base du site....` + `&nbsp;` + bouton `Afficher plus`
- Description complète (état déplié, `I18N.cky_preference_description`) : les deux paragraphes ci-dessus (le second se terminant par `…de base du site.`) puis :
  - `Nous utilisons également des cookies tiers qui nous aident à analyser la façon dont vous utilisez ce site web, à enregistrer vos préférences et à vous fournir le contenu et les publicités qui vous sont pertinents. Ces cookies ne seront stockés dans votre navigateur qu'avec votre consentement préalable.`
  - `Vous pouvez choisir d'activer ou de désactiver tout ou partie de ces cookies, mais la désactivation de certains d'entre eux peut affecter votre expérience de navigation.`
  - bouton `Afficher moins` (`I18N.cky_showless_text`)
- DMA : `Pour plus d’informations sur la manière dont les cookies tiers de Tessan fonctionnent et traitent vos données, consultez la :` (apostrophe typographique U+2019, espace simple avant « : ») + `&nbsp;` + lien `Politique de confidentialité de Tessan` → `https://www.tessan.io/politique-de-confidentialite` (`target="_blank" rel="nofollow noopener noreferrer"`)
- Catégories (titre — description, `CKL`) :
  1. `Nécessaire` + `Toujours actif` — `Les cookies nécessaires sont cruciaux pour les fonctions de base du site Web et celui-ci ne fonctionnera pas comme prévu sans eux.Ces cookies ne stockent aucune donnée personnellement identifiable.` (pas d'espace après « eux. », tel quel)
  2. `Fonctionnelle` — `Les cookies fonctionnels permettent d'exécuter certaines fonctionnalités telles que le partage du contenu du site Web sur des plateformes de médias sociaux, la collecte de commentaires et d'autres fonctionnalités tierces.`
  3. `Analytique` — `Les cookies analytiques sont utilisés pour comprendre comment les visiteurs interagissent avec le site Web. Ces cookies aident à fournir des informations sur le nombre de visiteurs, le taux de rebond, la source de trafic, etc.`
  4. `Performance` — `Les cookies de performance sont utilisés pour comprendre et analyser les indices de performance clés du site Web, ce qui permet de fournir une meilleure expérience utilisateur aux visiteurs.`
  5. `Publicité` — `Les cookies de publicité sont utilisés pour fournir aux visiteurs des publicités personnalisées basées sur les pages visitées précédemment et analyser l'efficacité de la campagne publicitaire.`
  6. `Non classé` — `Les autres cookies non classés sont ceux qui sont en cours d'analyse et qui n'ont pas encore été classés dans une catégorie.`
- `aria-label` des interrupteurs : `Activer Fonctionnelle`, `Activer Analytique`, `Activer Performance`, `Activer Publicité`, `Activer Non classé` (libellé inverse CookieYes : `Désactiver …`, `I18N.cky_disable_category_label`).
- En-têtes du tableau : `Cookie` · `Durée` · `Description` ; texte si vide : `Aucun cookie à afficher`.
- Boutons pied : `Refuser` · `Enregistrer mes préférences` · `Accepter` ; `Powered by` + logo CookieYes (lien `https://www.cookieyes.com/product/cookie-consent/?ref=cypbcyb&utm_source=cookie-banner&utm_medium=powered-by-cookieyes`, `aria-label="Visit CookieYes website"`).

**Revisit** : infobulle et `aria-label` `Choix de consentement` ; `alt` de l'image `Revisit consent button`.

### E.1 Contenu des tableaux (ordre DOM, `OUT` ; descriptions intégrales dans `CKL` → `cookies[<id>].description`)

| Catégorie | Cookie — Durée |
|---|---|
| Nécessaire (6) | `_cfuvid` — session · `__cf_bm` — 1 heure · `cookietest` — session · `cookieyes-*` — 1 an · `__hs_do_not_track` — 6 mois · `__hs_opt_out` — 6 mois |
| Fonctionnelle (8) | `gtm_id` — 1 an · `recent_write` — Moins d'une minute · `intercom-id-*` — 8 mois 26 jour 1 heure · `intercom-session-*` — 7 jour · `intercom-device-id-*` — 8 mois 26 jour 1 heure · `ytidb::LAST_RESULT_ENTRY_KEY` — N'expire jamais · `AWSALBTGCORS` — 7 jour · `AWSALBTG` — 7 jour |
| Analytique (10) | `_ga` — 1 an 1 mois 4 jour · `_ga_*` — 1 an 1 mois 4 jour · `vuid` — 1 an 1 mois 4 jour · `landing_page` — session · `__hstc` — 6 mois · `hubspotutk` — 6 mois · `__hssrc` — session · `__hssc` — 1 heure · `FPID` — 1 an 1 mois 4 jour · `FPLC` — 20 heure |
| Performance (1) | `INGRESSCOOKIE` — session |
| Publicité (17) | `VISITOR_PRIVACY_METADATA` — 6 mois · `YSC` — session · `VISITOR_INFO1_LIVE` — 6 mois · `__Secure-YEC` — passé(e) · `_fbp` — 3 mois · `test_cookie` — 15 minute · `_ttp` — 3 mois · `bcookie` — 1 an · `MUID` — 1 an 24 jour · `_tt_enable_cookie` — 3 mois · `_gcl_au` — 3 mois · `lidc` — 1 jour · `li_gc` — 6 mois · `IDE` — 1 an 24 jour · `__Secure-YNID` — 6 mois · `__Secure-ROLLOUT_TOKEN` — 6 mois · `ttcsid_*` — 3 mois |
| Non classé (5) | `__hs_initial_opt_in` — 7 jour · `tessan_origin` — 3 mois · `FPGSID` — 1 heure · `ttcsid` — 3 mois · `_dd_s` — 15 minute |

(47 cookies au total = `CKL.cookies` 47 entrées. Certaines descriptions sont vides côté CookieYes et s'affichent `No description available.` ou `Description is currently not available.` ; la cellule de `_ttp` contient un fragment HTML vide.)

## F. Incertitudes

- Transitions/états marqués ◇ non observés en direct (script tiers non instrumenté) ; ils suivent le CSS CookieYes et son comportement usuel.
- Mise en page exacte de la modale à 375/768 non capturée.
- Les fichiers `revisit.svg`, `close.svg`, `poweredbtcky.svg` sont servis par `cdn-cookieyes.com` et absents du dépôt : décrits visuellement seulement.
