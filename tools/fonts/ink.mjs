#!/usr/bin/env node
// Compare la densité d'encre (somme de 255 - luminance) d'une même zone de texte, référence vs clone.
// Usage : node tools/fonts/ink.mjs <gabarit-largeur> x,y,w,h [dyClone]
import sharp from 'sharp';
const [key, spec, dy = '0'] = process.argv.slice(2);
const [x, y, w, h] = spec.split(',').map(Number);
async function ink(file, yy) {
  const { data } = await sharp(file).extract({ left: x, top: yy, width: w, height: h }).greyscale().raw().toBuffer({ resolveWithObject: true });
  let s = 0, n = 0; for (const v of data) { s += 255 - v; if (v < 128) n++; } return { ink: s, dark: n };
}
const a = await ink(`docs/reference/${key}.png`, y);
const b = await ink(`docs/qa/clone/${key}.png`, y + Number(dy));
console.log(`réf ink=${a.ink} dark=${a.dark} | clone ink=${b.ink} dark=${b.dark} | ratio ink=${(b.ink / a.ink).toFixed(3)} dark=${(b.dark / a.dark).toFixed(3)}`);
