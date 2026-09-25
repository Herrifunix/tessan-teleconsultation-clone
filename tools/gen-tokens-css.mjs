#!/usr/bin/env node
// Génère src/styles/tokens.css (bloc @theme Tailwind v4) à partir de docs/research/tokens.json.
// Le thème par défaut de Tailwind n'est PAS importé : seuls ces tokens mesurés existent.
import { readFileSync, writeFileSync } from 'node:fs';

const t = JSON.parse(readFileSync('docs/research/tokens.json', 'utf8'));
const cal = JSON.parse(readFileSync('docs/research/serif-calibration.json', 'utf8'));
const lines = [];
const add = (name, value, comment) => lines.push(`  ${name}: ${value};${comment ? ` /* ${comment} */` : ''}`);

// Couleurs (palette Tailwind émise par l'original + marque + valeurs arbitraires nommées).
for (const [k, v] of Object.entries(t.color)) add(`--color-${k}`, v.value);
// Typographie.
add('--font-sans', '"Plus Jakarta Sans", "Plus Jakarta Sans Fallback", sans-serif', 'body de l’original');
add('--font-serif', '"TC Serif", "TC Serif Fallback", sans-serif', 'substitut calibré de Recoleta');
add('--font-map', t.font.map.value, 'popup de carte (.gm-style)');
add('--font-cluster', t.font.cluster.value, 'texte SVG des clusters');
for (const [k, v] of Object.entries(t.text)) add(`--text-${k}`, v.value);
for (const [k, v] of Object.entries(t.fontWeight)) add(`--font-weight-${k}`, v.value);
for (const [k, v] of Object.entries(t.leading)) add(`--leading-${k}`, v.value);
// Espacements, conteneurs, rayons, ombres.
add('--spacing', t.spacing.base.value);
for (const [k, v] of Object.entries(t.container)) add(`--container-${k}`, v.value);
add('--radius', t.radius.base.value, 'shadcn --radius');
add('--radius-lg', 'var(--radius)');
add('--radius-md', 'calc(var(--radius) - 2px)');
add('--radius-DEFAULT', t.radius.DEFAULT.value);
add('--radius-popup', t.radius.popup.value);
add('--radius-full', 'calc(infinity * 1px)');
for (const [k, v] of Object.entries(t.shadow)) add(`--shadow-${k}`, v.value);
// Points de rupture réels.
for (const [k, v] of Object.entries(t.breakpoint)) if (!k.includes('-')) add(`--breakpoint-${k}`, v.value);
// Transitions et animations.
for (const [k, v] of Object.entries(t.transition)) add(`--${k}`, v.value);
for (const [k, v] of Object.entries(t.animation)) add(`--animate-${k}`, v.value);

const faces = [];
for (const [w, r] of Object.entries(cal.result)) {
  const sa = parseFloat(r.sizeAdjust) / 100;
  for (const [subset, range] of [['latin', 'U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+0304, U+0308, U+0329, U+2000-206F, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD'], ['latin-ext', 'U+0100-02BA, U+02BD-02C5, U+02C7-02CC, U+02CE-02D7, U+02DD-02FF, U+1D00-1DBF, U+1E00-1E9F, U+1EF2-1EFF, U+2020, U+20A0-20AB, U+20AD-20C0, U+2113, U+2C60-2C7F, U+A720-A7FF']]) {
    faces.push(`@font-face {\n  font-family: "TC Serif";\n  src: url("/fonts/tc-serif-${w}-${subset}.woff2") format("woff2");\n  font-weight: ${w};\n  font-style: normal;\n  font-display: swap;\n  size-adjust: ${r.sizeAdjust};\n  ascent-override: ${(100 / sa).toFixed(2)}%;\n  descent-override: ${(36 / sa).toFixed(2)}%;\n  line-gap-override: 0%;\n  unicode-range: ${range};\n}`);
  }
}

const out = `/* FICHIER GÉNÉRÉ par tools/gen-tokens-css.mjs depuis docs/research/tokens.json — ne pas éditer. */
@theme {
  --*: initial;
${lines.join('\n')}

  @keyframes spin { to { transform: rotate(360deg); } }
  @keyframes bounce {
    0%, 100% { transform: translateY(-25%); animation-timing-function: cubic-bezier(0.8, 0, 1, 1); }
    50% { transform: none; animation-timing-function: cubic-bezier(0, 0, 0.2, 1); }
  }
}

/* Plus Jakarta Sans (SIL OFL 1.1) — fichiers identiques à ceux servis par l'original. */
@font-face {
  font-family: "Plus Jakarta Sans";
  src: url("/fonts/plus-jakarta-sans-latin.woff2") format("woff2");
  font-weight: 300 700;
  font-style: normal;
  font-display: swap;
  unicode-range: U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+0304, U+0308, U+0329, U+2000-206F, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD;
}
@font-face {
  font-family: "Plus Jakarta Sans";
  src: url("/fonts/plus-jakarta-sans-latin-ext.woff2") format("woff2");
  font-weight: 300 700;
  font-style: normal;
  font-display: swap;
  unicode-range: U+0100-02BA, U+02BD-02C5, U+02C7-02CC, U+02CE-02D7, U+02DD-02FF, U+0304, U+0308, U+0329, U+1D00-1DBF, U+1E00-1E9F, U+1EF2-1EFF, U+2020, U+20A0-20AB, U+20AD-20C0, U+2113, U+2C60-2C7F, U+A720-A7FF;
}
@font-face {
  font-family: "Plus Jakarta Sans Fallback";
  src: local("Arial");
  ascent-override: 98.88%;
  descent-override: 21.15%;
  line-gap-override: 0%;
  size-adjust: 104.98%;
}

/* TC Serif : instances de Fraunces (SIL OFL 1.1) calibrées sur Recoleta (docs/research/serif-calibration.json). */
${faces.join('\n')}
@font-face {
  font-family: "TC Serif Fallback";
  src: local("Arial");
  ascent-override: 100.82%;
  descent-override: 36.29%;
  line-gap-override: 0%;
  size-adjust: 99.19%;
}
`;
writeFileSync('src/styles/tokens.css', out);
console.log(`src/styles/tokens.css : ${lines.length} variables, ${faces.length} @font-face TC Serif`);
