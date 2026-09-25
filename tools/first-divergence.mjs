#!/usr/bin/env node
// Trouve les premières bandes horizontales où référence et clone divergent (hors masques de carte).
// Usage : node tools/first-divergence.mjs <gabarit-largeur> [seuil % de pixels différents par ligne]
import sharp from 'sharp';
import { readFileSync } from 'node:fs';
const [key, thr = '3'] = process.argv.slice(2);
const meta = JSON.parse(readFileSync('docs/reference/capture-meta.json', 'utf8'))[key];
const cmeta = JSON.parse(readFileSync('docs/qa/clone/capture-meta.json', 'utf8'))[key];
const masks = [...(meta.masks || []), ...(cmeta.masks || [])];
const a = await sharp(`docs/reference/${key}.png`).removeAlpha().raw().toBuffer({ resolveWithObject: true });
const b = await sharp(`docs/qa/clone/${key}.png`).removeAlpha().raw().toBuffer({ resolveWithObject: true });
const W = Math.min(a.info.width, b.info.width), H = Math.min(a.info.height, b.info.height);
const inMask = (x, y) => masks.some((m) => x >= m.x && x < m.x + m.w && y >= m.y && y < m.y + m.h);
let shown = 0, run = null;
for (let y = 0; y < H && shown < 12; y++) {
  let d = 0, n = 0;
  for (let x = 0; x < W; x++) {
    if (inMask(x, y)) continue; n++;
    const i = (y * a.info.width + x) * 3, j = (y * b.info.width + x) * 3;
    if (Math.abs(a.data[i] - b.data[j]) + Math.abs(a.data[i + 1] - b.data[j + 1]) + Math.abs(a.data[i + 2] - b.data[j + 2]) > 60) d++;
  }
  const bad = n && (d / n) * 100 > +thr;
  if (bad && !run) run = y;
  if (!bad && run !== null) { if (y - run >= 2) { console.log(`lignes ${run}–${y - 1} divergentes`); shown++; } run = null; }
}
console.log(`réf ${a.info.height}px, clone ${b.info.height}px`);
