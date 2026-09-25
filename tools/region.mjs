#!/usr/bin/env node
// Empile la même région de la référence (haut) et du clone (bas) à 100 % (ou zoomée) pour inspection.
// Usage : node tools/region.mjs <gabarit-largeur> x,y,w,h <sortie.png> [zoom] [dyClone]
import sharp from 'sharp';
const [key, spec, out, zoom = '1', dy = '0'] = process.argv.slice(2);
const [x, y, w, h] = spec.split(',').map(Number);
async function crop(file, yy) {
  const m = await sharp(file).metadata();
  const top = Math.max(0, Math.min(yy, m.height - 1));
  const hh = Math.max(1, Math.min(h, m.height - top));
  return sharp(file).extract({ left: x, top, width: Math.min(w, m.width - x), height: hh }).toBuffer({ resolveWithObject: true });
}
const a = await crop(`docs/reference/${key}.png`, y);
const b = await crop(`docs/qa/clone/${key}.png`, y + Number(dy));
const W = Math.max(a.info.width, b.info.width);
const H = a.info.height + b.info.height + 6;
const img = await sharp({ create: { width: W, height: H, channels: 4, background: '#ff00ff' } })
  .composite([{ input: a.data, left: 0, top: 0 }, { input: b.data, left: 0, top: a.info.height + 6 }]).png().toBuffer();
await sharp(img).resize({ width: Math.round(W * Number(zoom)), kernel: 'nearest' }).toFile(out);
console.log(out);
