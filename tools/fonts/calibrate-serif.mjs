#!/usr/bin/env node
// Calibre les descripteurs @font-face de « TC Serif » contre Recoleta (copie locale de la police
// servie par l'original, utilisée UNIQUEMENT comme étalon de mesure, jamais redistribuée).
// Mesure 1 : rapport de largeur par graisse sur les titres réels du site, AUX TAILLES RÉELLEMENT UTILISÉES
//   (Recoleta est hintée : ses avances sont arrondies aux petites tailles, la largeur n'est pas proportionnelle
//   à la taille ; Fraunces ne l'est pas) → size-adjust = moyenne des rapports à ces tailles.
// Mesure 2 : hauteur d'une ligne en line-height:normal → ascent/descent-override.
// Usage : RECOLETA_DIR=/tmp/claude-0/fonts node tools/fonts/calibrate-serif.mjs
import { chromium } from '@playwright/test';
import { writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
const REC_DIR = process.env.RECOLETA_DIR || '/tmp/claude-0/fonts';
const REC = { 400: '8fd0ea0421adf98a-s.p.woff2', 500: '65c5b5fc5f0a56ba-s.p.woff2', 600: 'e36f8fd0616e37d2-s.p.woff2', 700: 'ec5c5f347a7e1514-s.p.woff2' };
const TC = (w) => `file://${resolve('public/fonts')}/tc-serif-${w}-latin.woff2`;
const SAMPLES = [
  'Les dispositifs de téléconsultation Tessan autour de vous', 'Les dispositifs de téléconsultation Tessan dans les départements à proximité',
  'Pharmacie Saint Barthélémy', '5 dispositifs de téléconsultation Tessan autour de vous', 'Foire Aux Questions',
  "Votre dispositif de téléconsultation Tessan à Nice", "Horaires d'ouverture", 'Pharmacie Grande Corniche', 'PHARMACIE DE FAMAJOR',
];
// Tailles d'usage par graisse (relevées dans les specs : cartes 20 px gras, titres h2 24 px, h1 30/35,2 px, FAQ 40 px).
const SIZES = { 400: [24, 30, 35.2], 500: [40], 600: [20], 700: [20] };
const [ASC, DESC] = [process.env.ASC || '100%', process.env.DESC || '36%'];
const b = await chromium.launch(); const p = await b.newPage();
const out = {};
for (const w of [400, 500, 600, 700]) {
  // Une famille distincte par fichier : aucune ambiguïté d'appariement de graisse ni de synthèse.
  const faces = `@font-face{font-family:Rec${w};src:url(file://${REC_DIR}/${REC[w]})}@font-face{font-family:TC${w};src:url(${TC(w)})}@font-face{font-family:TCo${w};src:url(${TC(w)});ascent-override:${ASC};descent-override:${DESC};line-gap-override:0%}`;
  const items = SIZES[w].flatMap((px) => SAMPLES.map((s) => ({ s, px })));
  const html = `<html><head><style>${faces} body{margin:0} span{white-space:nowrap;line-height:normal;display:inline-block;font-weight:normal;font-synthesis:none}</style></head><body>` +
    items.map(({ s, px }, i) => `<div><span id=r${i} style="font-family:Rec${w};font-size:${px}px">${s}</span></div><div><span id=t${i} style="font-family:TC${w};font-size:${px}px">${s}</span></div><div><span id=o${i} style="font-family:TCo${w};font-size:40px">${s}</span></div>`).join('') + '</body></html>';
  writeFileSync('/tmp/claude-0/calib.html', html);
  await p.goto('file:///tmp/claude-0/calib.html');
  await p.evaluate(() => document.fonts.ready);
  const status = await p.evaluate(() => [...document.fonts].map((f) => `${f.family}:${f.status}`));
  if (status.some((s) => !s.endsWith('loaded'))) throw new Error('police non chargée : ' + status.join(' '));
  const m = await p.evaluate((n) => { const r = []; for (let i = 0; i < n; i++) { const a = document.getElementById('r' + i).getBoundingClientRect(); const t = document.getElementById('t' + i).getBoundingClientRect(); const o = document.getElementById('o' + i).getBoundingClientRect(); r.push({ ratio: a.width / t.width, hRec: a.height, hTc: t.height, hOverride: o.height }); } return r; }, items.length);
  const ratio = m.reduce((s, x) => s + x.ratio, 0) / m.length;
  out[w] = { sizes: SIZES[w], sizeAdjust: +(ratio * 100).toFixed(1) + '%', minRatio: Math.min(...m.map((x) => x.ratio)).toFixed(4), maxRatio: Math.max(...m.map((x) => x.ratio)).toFixed(4), lineHeightNormal40px: { recoleta: m[0].hRec, tcSerif: m[0].hTc, tcSerifWithOverrides: m[0].hOverride }, fonts: status };
}
await b.close();
console.log(JSON.stringify(out, null, 1));
writeFileSync('docs/research/serif-calibration.json', JSON.stringify({ method: 'tools/fonts/calibrate-serif.mjs', overrides: { ascent: ASC, descent: DESC }, result: out }, null, 1));
