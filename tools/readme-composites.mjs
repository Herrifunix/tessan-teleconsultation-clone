#!/usr/bin/env node
// Composites « référence | clone » lisibles pour le README : haut de page (hauteur d'un écran) de chaque gabarit
// à 1440 px (réduit de moitié) et 375 px. Écrit docs/qa/readme/<gabarit>-<largeur>.png (écrasés à chaque exécution).
import sharp from 'sharp';
import { mkdirSync } from 'node:fs';
const OUT = 'docs/qa/readme';
mkdirSync(OUT, { recursive: true });
const SPECS = [
  { w: 1440, h: 900, scale: 0.5 },
  { w: 375, h: 812, scale: 0.8 },
];
const label = (text, width) => Buffer.from(`<svg width="${width}" height="28" xmlns="http://www.w3.org/2000/svg"><rect width="100%" height="100%" fill="#0f352d"/><text x="10" y="19" font-family="sans-serif" font-size="14" fill="#fff">${text}</text></svg>`);
for (const tpl of ['home', 'results', 'fiche']) {
  for (const { w, h, scale } of SPECS) {
    const pw = Math.round(w * scale), ph = Math.round(h * scale), gap = 16;
    const panel = (f) => sharp(f).extract({ left: 0, top: 0, width: w, height: h }).resize({ width: pw }).png().toBuffer();
    const [a, b] = await Promise.all([panel(`docs/reference/${tpl}-${w}.png`), panel(`docs/qa/clone/${tpl}-${w}.png`)]);
    const file = `${OUT}/${tpl}-${w}.png`;
    await sharp({ create: { width: pw * 2 + gap, height: ph + 28, channels: 4, background: '#ffffff' } })
      .composite([
        { input: label(`Original — ${tpl} ${w}px`, pw), left: 0, top: 0 },
        { input: label(`Clone — ${tpl} ${w}px`, pw), left: pw + gap, top: 0 },
        { input: a, left: 0, top: 28 },
        { input: b, left: pw + gap, top: 28 },
      ])
      .png({ compressionLevel: 9 }).toFile(file);
    console.log(file);
  }
}
