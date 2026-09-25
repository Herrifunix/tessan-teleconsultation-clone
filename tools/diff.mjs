#!/usr/bin/env node
// Diff pixel référence ↔ clone (pixelmatch) avec masques, composites « référence | clone | diff »
// et recadrages par région. Écrit docs/qa/diff-report.json et docs/qa/<gabarit>-<largeur>-*.png.
// Usage : node tools/diff.mjs [iterationLabel]
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'node:fs';
import sharp from 'sharp';
import pixelmatch from 'pixelmatch';
import { PNG } from 'pngjs';

const REF = 'docs/reference';
const CLONE = 'docs/qa/clone';
const OUT = 'docs/qa';
const label = process.argv[2] || 'latest';
mkdirSync(OUT, { recursive: true });
const refMeta = JSON.parse(readFileSync(`${REF}/capture-meta.json`, 'utf8'));
const cloneMeta = existsSync(`${CLONE}/capture-meta.json`) ? JSON.parse(readFileSync(`${CLONE}/capture-meta.json`, 'utf8')) : {};

async function load(file, W, H) {
  const { data, info } = await sharp(file).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  const png = new PNG({ width: W, height: H });
  png.data.fill(255);
  for (let y = 0; y < info.height; y++) data.copy(png.data, y * W * 4, y * info.width * 4, (y + 1) * info.width * 4);
  return png;
}
function paint(png, rects, rgba = [200, 200, 200, 255]) {
  for (const r of rects) for (let y = Math.max(0, r.y); y < Math.min(png.height, r.y + r.h); y++) for (let x = Math.max(0, r.x); x < Math.min(png.width, r.x + r.w); x++) {
    const i = (y * png.width + x) * 4; png.data[i] = rgba[0]; png.data[i + 1] = rgba[1]; png.data[i + 2] = rgba[2]; png.data[i + 3] = rgba[3];
  }
}
const report = existsSync(`${OUT}/diff-report.json`) ? JSON.parse(readFileSync(`${OUT}/diff-report.json`, 'utf8')) : { iterations: [] };
const rows = [];
for (const key of Object.keys(refMeta).filter((k) => !k.startsWith('_'))) {
  const refFile = `${REF}/${key}.png`;
  const cloneFile = `${CLONE}/${key}.png`;
  if (!existsSync(cloneFile)) continue;
  const [a, b] = await Promise.all([sharp(refFile).metadata(), sharp(cloneFile).metadata()]);
  const W = Math.max(a.width, b.width);
  const H = a.height;
  const ref = await load(refFile, W, H);
  const rawClone = await load(cloneFile, W, Math.max(H, b.height));
  const rm = [...(refMeta[key].masks || [])].sort((p, q) => p.y - q.y);
  const cm = [...((cloneMeta[key] || {}).masks || [])].sort((p, q) => p.y - q.y);
  // Réalignement : les zones masquées appariées (même type, même rang) servent d'ancres ; chaque segment du clone
  // situé entre deux ancres est recopié à la position du segment correspondant de la référence.
  const anchors = [];
  if (rm.length === cm.length && rm.every((m, i) => m.kind === cm[i].kind)) for (let i = 0; i < rm.length; i++) anchors.push([rm[i], cm[i]]);
  const clone = new PNG({ width: W, height: H });
  clone.data.fill(255);
  const copyRows = (fromY, toY, n) => { for (let k = 0; k < n; k++) { const sy = fromY + k, dy2 = toY + k; if (sy < 0 || dy2 < 0 || sy >= rawClone.height || dy2 >= H) continue; rawClone.data.copy(clone.data, dy2 * W * 4, sy * W * 4, (sy + 1) * W * 4); } };
  let rPrev = 0, cPrev = 0;
  for (const [ra, ca] of anchors) {
    copyRows(cPrev, rPrev, Math.min(ra.y - rPrev, ca.y - cPrev));
    rPrev = ra.y + ra.h; cPrev = ca.y + ca.h;
  }
  copyRows(cPrev, rPrev, Math.min(H - rPrev, rawClone.height - cPrev));
  const masks = anchors.length ? rm : [...rm, ...cm];
  paint(ref, masks);
  paint(clone, masks);
  const diff = new PNG({ width: W, height: H });
  const n = pixelmatch(ref.data, clone.data, diff.data, W, H, { threshold: 0.1, includeAA: false, alpha: 0.15 });
  let masked = 0;
  const seen = new Uint8Array(W * H);
  for (const r of masks) for (let y = Math.max(0, r.y); y < Math.min(H, r.y + r.h); y++) for (let x = Math.max(0, r.x); x < Math.min(W, r.x + r.w); x++) if (!seen[y * W + x]) { seen[y * W + x] = 1; masked++; }
  const ratio = n / (W * H - masked);
  // Composite référence | clone | diff (largeur réduite pour le survol ; les recadrages sont à 100 %).
  const panel = async (png) => sharp(PNG.sync.write(png)).png().toBuffer();
  const [pa, pb, pd] = await Promise.all([panel(ref), panel(clone), panel(diff)]);
  const gap = 12;
  const comp = sharp({ create: { width: W * 3 + gap * 2, height: H, channels: 4, background: '#ffffff' } }).composite([{ input: pa, left: 0, top: 0 }, { input: pb, left: W + gap, top: 0 }, { input: pd, left: 2 * (W + gap), top: 0 }]);
  const compFile = `${OUT}/${key}-composite.png`;
  const scale = W > 800 ? 0.5 : 1;
  await sharp(await comp.png().toBuffer()).resize({ width: Math.round((W * 3 + gap * 2) * scale) }).png({ compressionLevel: 9 }).toFile(compFile);
  rows.push({ key, aligned: anchors.length, width: W, height: H, refHeight: a.height, cloneHeight: b.height, diffPixels: n, maskedPixels: masked, ratio: +ratio.toFixed(5), composite: compFile, masks: masks.length });
  console.log(`${key.padEnd(12)} ${String(W).padStart(4)}×${String(H).padEnd(5)} réf ${a.height}px / clone ${b.height}px  diff ${(ratio * 100).toFixed(2)} % hors masques (${masks.length} masques, ${anchors.length ? 'réaligné' : 'non réaligné'})`);
}
report.iterations = report.iterations.filter((it) => it.label !== label);
report.iterations.push({ label, date: new Date().toISOString(), rows });
writeFileSync(`${OUT}/diff-report.json`, JSON.stringify(report, null, 1));
