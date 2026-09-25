// Découpe une image en bandes verticales (pour examiner une capture pleine page à 100 %).
// Usage : node tools/crop.mjs <image> <hauteurBande> [dossierSortie] | node tools/crop.mjs <image> x,y,w,h <sortie> [zoom]
import sharp from 'sharp';
import { basename } from 'node:path';
const [img, spec, outDir = '/tmp/claude-0', zoom = '1'] = process.argv.slice(2);
const meta = await sharp(img).metadata();
if (spec.includes(',')) {
  const [x, y, w, h] = spec.split(',').map(Number);
  await sharp(img).extract({ left: x, top: y, width: Math.min(w, meta.width - x), height: Math.min(h, meta.height - y) })
    .resize({ width: Math.round(Math.min(w, meta.width - x) * +zoom), kernel: 'nearest' }).toFile(outDir);
  console.log(outDir);
} else {
  const band = +spec; const files = [];
  for (let y = 0, i = 0; y < meta.height; y += band, i++) {
    const f = `${outDir}/${basename(img, '.png')}-part${i}.png`;
    await sharp(img).extract({ left: 0, top: y, width: meta.width, height: Math.min(band, meta.height - y) }).toFile(f);
    files.push(f);
  }
  console.log(meta.width + 'x' + meta.height, files.join(' '));
}
