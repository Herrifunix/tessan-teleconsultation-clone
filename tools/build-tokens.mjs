#!/usr/bin/env node
// Construit docs/research/tokens.json à partir des sources mesurées sur l'original :
//  - docs/research/css-analysis.json (extrait de docs/research/css/323d88a92ac6be07.css par tools/recon/css-analyze.py)
//  - docs/research/css/323d88a92ac6be07.css (déclarations d'utilitaires Tailwind)
//  - docs/research/pages/*/computed-*.json (getComputedStyle, tools/recon/dump-styles.js)
//  - docs/research/hover-states.json, docs/research/pages/home/cookie-banner.json
// Chaque valeur porte sa provenance ("source") et, quand elle existe, une mesure de contrôle ("measured").
import { readFileSync, writeFileSync, existsSync } from 'node:fs';

const CSS_FILE = 'docs/research/css/323d88a92ac6be07.css';
const css = readFileSync(CSS_FILE, 'utf8');
const analysis = JSON.parse(readFileSync('docs/research/css-analysis.json', 'utf8'));
const load = (f) => JSON.parse(readFileSync(f, 'utf8'));

function utility(sel) {
  // Renvoie la 1re déclaration CSS de l'utilitaire (échappements Tailwind compris).
  const esc = sel.replace(/[[\]#/.()%]/g, (c) => '\\' + c);
  const re = new RegExp('\\.' + esc.replace(/\\\\/g, '\\\\') + '\\{([^}]*)\\}');
  const m = css.match(re);
  return m ? m[1] : null;
}
function measured(page, width, pred, prop) {
  const f = `docs/research/pages/${page}/computed-${width}.json`;
  if (!existsSync(f)) return null;
  const d = load(f);
  const el = d.elements.find(pred);
  if (!el) return null;
  return { file: f, path: el.path, cls: el.cls.slice(0, 80), value: prop === 'rect' ? el.rect : el.styles[prop] };
}
const src = (what) => `${CSS_FILE} — ${what}`;
const T = analysis.theme_vars;
const R = analysis.root_vars;

const tokens = {
  _meta: {
    description: "Tokens de design mesurés sur https://teleconsultation.tessan.io/ (Tailwind CSS v" + analysis.tailwind_version + "). Chaque valeur indique sa provenance. src/styles/tokens.css est généré à partir de ce fichier (tools/gen-tokens-css.mjs) et c'est la seule source des valeurs utilisées par le CSS du clone.",
    generatedBy: 'tools/build-tokens.mjs',
    capturedAt: '2026-09-25',
  },
  color: {},
  font: {},
  text: {},
  fontWeight: {},
  leading: {},
  spacing: {},
  radius: {},
  shadow: {},
  container: {},
  breakpoint: {},
  transition: {},
  animation: {},
  component: {},
};

// 1) Couleurs de la palette Tailwind réellement émises par l'original (@layer theme).
for (const [k, v] of Object.entries(T)) {
  if (k.startsWith('--color-')) tokens.color[k.slice(8)] = { value: v.trim(), source: src(`@layer theme :root ${k}`) };
}
// 2) Couleurs de marque et variables shadcn (:root hors thème).
for (const k of ['--tessan-green', '--tessan-green-hover']) {
  tokens.color[k.slice(2)] = { value: R[k], source: src(`:root ${k}`) };
}
for (const k of ['--background', '--foreground', '--muted-foreground', '--border', '--input', '--ring', '--primary', '--primary-foreground', '--accent', '--accent-foreground', '--destructive']) {
  if (R[k]) tokens.color[k.slice(2)] = { value: R[k], source: src(`:root ${k} (shadcn/ui)`) };
}
// 3) Couleurs arbitraires présentes dans les classes de l'original.
const arbitrary = {
  'dark-green-hover': ['#153f3f', 'hover:bg-[#153f3f] (bouton « Compte patient »)'],
  'yellow-cta': ['#fff198', 'bg-[#FFF198] (bouton « Voir plus », « Réserver un créneau » de la fiche)'],
  'yellow-cta-hover': ['#f5e76b', 'hover:bg-[#f5e76b] (« Réserver un créneau » de la fiche)'],
  'cream-hover': ['#fcf5cc', 'hover:bg-[#fcf5cc] (boutons de carte, badge spécialité)'],
  'footer-contact': ['#feee80', 'bg-[#feee80] (« Nous contacter »)'],
  'footer-contact-hover': ['#f0e060', 'hover:bg-[#f0e060] (« Nous contacter »)'],
  'footer-contact-text': ['#1a4d4d', 'text-[#1a4d4d] (« Nous contacter »)'],
  'open-green': ['#238700', 'text-[#238700] (statut « Ouvert »)'],
  'footer-bg': ['#0f352d', 'bg-[#0f352d] (footer, bouton « Compte patient »)'],
  'faq-border': ['#f0ece4', 'style inline borderTop 1px solid #f0ece4 (réponse FAQ, bundle 541)'],
  'footer-heading': ['#adbab8', 'style inline color: rgb(173, 186, 184) des h3 du footer — docs/research/pages/home/dom.html'],
};
for (const [k, [v, why]] of Object.entries(arbitrary)) tokens.color[k] = { value: v, source: why.includes('bundle') || why.includes('dom.html') ? why : src(why) };
// Couleurs de la liste d'autocomplétion (.pac-container personnalisé par l'original).
const PAC = 'docs/research/css/b2e1955b359df2cc.css';
for (const [k, v, why] of [
  ['pac-border', '#e5e7eb', '.pac-container{border:1px solid #e5e7eb}'],
  ['pac-item-border', '#f3f4f6', '.pac-item{border-top:1px solid #f3f4f6}'],
  ['pac-item-hover', '#f9fafb', '.pac-item-selected,.pac-item:hover{background-color:#f9fafb}'],
  ['pac-query', '#111827', '.pac-item-query{color:#111827}'],
  ['pac-secondary', '#6b7280', '.pac-item-query+span{color:#6b7280}'],
  ['pac-matched', '#0f352d', '.pac-matched{color:#0F352D}'],
]) tokens.color[k] = { value: v, source: `${PAC} — ${why}` };
// Couleurs CookieYes relevées dans la feuille <style id="cky-style"> et la config (docs/research/components/cookie-consent.md).
const CKY = 'docs/research/pages/home/dom.html — <style id="cky-style"> CookieYes';
for (const [k, v, why] of [
  ['cookie-save-bg', '#eafbaf', 'bouton « Enregistrer mes préférences »'],
  ['cookie-link', '#1863dc', 'lien « Afficher plus » et contour :focus-visible'],
  ['cookie-always', '#008000', '« Toujours actif » (green)'],
  ['cookie-powered-text', '#293c5b', 'bandeau « Powered by »'],
  ['cookie-powered-bg', '#ededed', 'bandeau « Powered by »'],
  ['cookie-tooltip', '#4e4b66', 'infobulle du bouton de rappel'],
  ['cookie-table-bg', '#f4f4f4', '.cky-audit-table'],
]) tokens.color[k] = { value: v, source: `${CKY} — ${why}` };
// Couleurs CookieYes (mesurées par getComputedStyle sur la bannière, fichier dédié).
if (existsSync('docs/research/pages/home/cookie-banner.json')) {
  const cb = load('docs/research/pages/home/cookie-banner.json');
  for (const [k, v] of Object.entries(cb.tokens)) tokens.color[k] = { value: v.value, source: `docs/research/pages/home/cookie-banner.json — ${v.from}` };
}

// 4) Polices.
const ff = analysis.font_faces;
tokens.font = {
  sans: { value: '"Plus Jakarta Sans", "Plus Jakarta Sans Fallback", sans-serif', source: src('body{font-family:"Plus Jakarta Sans",var(--font-plus-jakarta),sans-serif} + .__variable_2392b8'), weights: [...new Set(ff.filter((f) => f['font-family'] === 'Plus Jakarta Sans').map((f) => f['font-weight']))] },
  sansFallback: { value: 'local("Arial") ascent-override:98.88% descent-override:21.15% line-gap-override:0% size-adjust:104.98%', source: src('@font-face Plus Jakarta Sans Fallback') },
  serif: { value: 'recoleta, "recoleta Fallback", sans-serif', source: src('h1,h2,h3,h4,h5,h6{font-family:"Recoleta",var(--font-recoleta),sans-serif;font-weight:400}'), weights: ff.filter((f) => f['font-family'] === 'recoleta').map((f) => f['font-weight']), note: 'Recoleta (© Latinotype, fichier « wf-rip ») n’est pas redistribuable : le clone utilise une police libre calibrée (voir DECISIONS.md).' },
  serifFallback: { value: 'local("Arial") ascent-override:100.82% descent-override:36.29% line-gap-override:0% size-adjust:99.19%', source: src('@font-face recoleta Fallback') },
  map: { value: 'Roboto, Arial, sans-serif', source: 'Google Maps .gm-style (popup de marqueur) — mesuré docs/research/pages/specialty-city/popup.json' },
  cluster: { value: 'Montserrat, sans-serif', source: 'bundle 990 module 9382 : texte SVG des clusters font-family="Montserrat, sans-serif" font-size="16" font-weight="600"' },
};
for (const [k, v] of Object.entries(T)) {
  if (k.startsWith('--text-')) tokens.text[k.slice(7)] = { value: v.trim(), source: src(`@layer theme ${k}`) };
  if (k.startsWith('--font-weight-')) tokens.fontWeight[k.slice(14)] = { value: v.trim(), source: src(`@layer theme ${k}`) };
  if (k.startsWith('--leading-')) tokens.leading[k.slice(10)] = { value: v.trim(), source: src(`@layer theme ${k}`) };
  if (k.startsWith('--container-')) tokens.container[k.slice(12)] = { value: v.trim(), source: src(`@layer theme ${k}`) };
  if (k === '--spacing') tokens.spacing.base = { value: v.trim(), source: src('@layer theme --spacing') };
  if (k.startsWith('--default-transition')) tokens.transition[k.slice(2)] = { value: v.trim(), source: src(`@layer theme ${k}`) };
  if (k.startsWith('--animate-')) tokens.animation[k.slice(10)] = { value: v.trim(), source: src(`@layer theme ${k}`) };
}
// Tailles issues de styles inline de l'original (bundle 541, fiche).
tokens.text['fiche-h1'] = { value: '2.2rem', lineHeight: 'calc(2.25 / 1.875)', source: 'bundle 541 : h1 fiche style fontSize 2.2rem (interligne hérité de text-3xl)' };
tokens.text['faq-title'] = { value: '2.5rem', lineHeight: 'normal', source: 'bundle 541 : h2 « Foire Aux Questions » style fontSize 2.5rem, fontWeight 500' };
tokens.container['page'] = { value: '1328px', source: src('.max-w-\\[1328px\\]{max-width:1328px}'), measured: measured('home', 1440, (e) => e.cls.includes('max-w-[1328px]'), 'rect') };
tokens.container['footer'] = { value: '1300px', source: src('.max-w-\\[1300px\\]{max-width:1300px}'), measured: measured('home', 1440, (e) => e.cls.includes('max-w-[1300px]'), 'rect') };

// 5) Rayons (shadcn : --radius) et ombres (déclarations d'utilitaires).
tokens.radius = {
  base: { value: R['--radius'], source: src(':root --radius') },
  lg: { value: 'var(--radius)', resolved: '10px', source: src('.rounded-lg{border-radius:var(--radius)}') },
  md: { value: 'calc(var(--radius) - 2px)', resolved: '8px', source: src('.rounded-md{border-radius:calc(var(--radius) - 2px)}') },
  DEFAULT: { value: '.25rem', source: src('.rounded{border-radius:.25rem}') },
  popup: { value: '15px', source: src('.rounded-\\[15px\\]{border-radius:15px}') },
  full: { value: '3.40282e38px', source: src('.rounded-full{border-radius:3.40282e+38px}') },
  faq: { value: '12px', source: 'bundle 541 : item FAQ style borderRadius 12px' },
  cookie: { value: '6px', source: 'docs/research/pages/home/cookie-banner.json — .cky-consent-bar border-radius 6px' },
  'cookie-btn': { value: '2px', source: 'docs/research/pages/home/cookie-banner.json — .cky-btn border-radius 2px' },
};
for (const n of ['xs', 'sm', 'md', 'lg', 'xl', '2xl']) {
  const d = utility(`shadow-${n}`);
  const m = d && d.match(/--tw-shadow:([^;]+)/);
  tokens.shadow[n] = { value: m ? m[1].replace(/var\(--tw-shadow-color,([^)]+)\)/g, '$1') : null, source: src(`.shadow-${n}{--tw-shadow:…}`) };
}

tokens.shadow.faq = { value: '0 1px 4px rgba(0,0,0,0.06)', source: 'bundle 541 : item FAQ style boxShadow 0 1px 4px rgba(0,0,0,0.06)' };

// 6) Points de rupture réels (@media).
const bp = { sm: '40rem', md: '48rem', lg: '64rem', xl: '80rem', '2xl': '96rem' };
for (const [k, v] of Object.entries(bp)) {
  if (!analysis.media.includes(`(min-width:${v})`)) throw new Error(`breakpoint ${v} absent de l'original`);
  tokens.breakpoint[k] = { value: v, px: parseFloat(v) * 16, source: src(`@media (min-width:${v})`) };
}
tokens.breakpoint['pac-mobile'] = { value: '(max-width:640px)', source: 'docs/research/css/b2e1955b359df2cc.css — .pac-container mobile' };

// 7) Mesures de composants (getComputedStyle) utilisées comme points de contrôle.
const H = (w) => ({
  headerHeight: measured('home', w, (e) => e.tag === 'nav' && e.cls.includes('h-[80px]'), 'rect'),
  h1: measured('home', w, (e) => e.tag === 'h1', 'fontSize'),
  searchCard: measured('home', w, (e) => e.cls.includes('mx-auto bg-white p-6 md:p-8 rounded-lg shadow-lg'), 'rect'),
  footer: measured('home', w, (e) => e.tag === 'footer', 'rect'),
});
tokens.component = {
  header: { height: { value: '80px', source: src('.h-\\[80px\\]') }, measured: { 1440: H(1440).headerHeight, 768: H(768).headerHeight, 375: H(375).headerHeight } },
  h1: { measured: { 1440: H(1440).h1, 768: H(768).h1, 375: H(375).h1 } },
  searchCard: { measured: { 1440: H(1440).searchCard, 375: H(375).searchCard } },
  mapHome: { value: 'calc(100vh - 400px), min 600px', source: src('.h-\\[calc\\(100vh-400px\\)\\] .min-h-\\[600px\\]') },
  mapResults: { value: 'calc(3*280px + 2*24px) = 888px', source: src('.h-\\[calc\\(3\\*280px\\+2\\*24px\\)\\]') },
  popup: { width: { value: '380px', source: 'bundle 990 module 9382 (OverlayView style width:380px, translate(-50%, calc(-100% - 40px)))' } },
  marker: { size: { value: '32x48', anchor: '16,48', source: 'bundle 990 module 9382 (/marker.svg)' } },
  cluster: { size: { value: '50x50', fill: '#0F352D', stroke: 'white 3', opacity: 0.9, source: 'bundle 990 module 9382 (SVG r=22)' } },
  hover: existsSync('docs/research/hover-states.json') ? { source: 'docs/research/hover-states.json (getComputedStyle avant/après survol)', values: load('docs/research/hover-states.json') } : null,
};

writeFileSync('docs/research/tokens.json', JSON.stringify(tokens, null, 1));
const count = Object.entries(tokens).filter(([k]) => k !== '_meta').reduce((n, [, v]) => n + Object.keys(v).length, 0);
console.log(`docs/research/tokens.json écrit (${count} entrées)`);
