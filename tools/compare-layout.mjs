#!/usr/bin/env node
// Compare la mise en page référence ↔ clone à partir des dumps de styles calculés produits par tools/capture.mjs.
// Appariement des éléments porteurs de texte par (balise, texte), dans l'ordre d'apparition.
// Mesures : décalage absolu, écart d'espacement LOCAL (variation du décalage vertical entre deux éléments appariés
// consécutifs) et différences de styles (taille, graisse, interligne, couleur, fond). Écrit docs/qa/layout-report.json.
import { readFileSync, writeFileSync, existsSync } from 'node:fs';

const keys = process.argv.slice(2).length ? process.argv.slice(2) : ['home', 'results', 'fiche'].flatMap((t) => [375, 768, 1440].map((w) => `${t}-${w}`));
const norm = (t) => t.replace(/\s+/g, ' ').trim();
const STYLE = ['fontSize', 'fontWeight', 'lineHeight', 'color', 'backgroundColor', 'letterSpacing', 'boxShadow'];
const report = {};
const refMeta = JSON.parse(readFileSync('docs/reference/capture-meta.json', 'utf8'));
const cloneMeta = JSON.parse(readFileSync('docs/qa/clone/capture-meta.json', 'utf8'));
// Un élément dont le centre est dans une zone masquée (carte, grilles de zones dépendant des données) n'est pas compté.
const inMask = (e, masks) => masks.some((m) => { const cx = e.rect.x + e.rect.w / 2, cy = e.rect.y + e.rect.h / 2; return cx >= m.x && cx <= m.x + m.w && cy >= m.y && cy <= m.y + m.h; });
for (const key of keys) {
  const fa = `docs/reference/${key}.layout.json`, fb = `docs/qa/clone/${key}.layout.json`;
  if (!existsSync(fa) || !existsSync(fb)) { console.log(`${key}: dumps absents`); continue; }
  const rMasks = refMeta[key]?.masks ?? [], cMasks = cloneMeta[key]?.masks ?? [];
  const A = JSON.parse(readFileSync(fa, 'utf8')).elements.filter((e) => norm(e.text) && !inMask(e, rMasks));
  const B = JSON.parse(readFileSync(fb, 'utf8')).elements.filter((e) => norm(e.text) && !inMask(e, cMasks));
  const pool = new Map();
  for (const e of B) { const k = `${e.tag}|${norm(e.text)}`; if (!pool.has(k)) pool.set(k, []); pool.get(k).push(e); }
  const pairs = [];
  for (const a of A) { const q = pool.get(`${a.tag}|${norm(a.text)}`); if (q && q.length) pairs.push([a, q.shift()]); }
  pairs.sort((p, q) => p[0].rect.y - q[0].rect.y);
  // Les grilles masquées dépendent des données (nombre de zones, retours à la ligne) : l'écart de hauteur d'une zone
  // masquée est retranché du décalage des éléments situés sous elle (appariement des masques par rang, même type).
  const maskShift = (y) => rMasks.reduce((acc, m, i) => (cMasks[i]?.kind === m.kind && m.y + m.h <= y ? acc + (cMasks[i].h - m.h) : acc), 0);
  let prevDy = 0;
  const spacing = [], styles = [];
  for (const [a, b] of pairs) {
    const dy = b.rect.y - a.rect.y - maskShift(a.rect.y), dx = b.rect.x - a.rect.x;
    const local = dy - prevDy;
    if (Math.abs(local) > 2 || Math.abs(dx) > 2) spacing.push({ text: norm(a.text).slice(0, 50), tag: a.tag, y: a.rect.y, dx: +dx.toFixed(1), dyLocal: +local.toFixed(1), dyAbs: +dy.toFixed(1), dw: +(b.rect.w - a.rect.w).toFixed(1), dh: +(b.rect.h - a.rect.h).toFixed(1) });
    prevDy = dy;
    const diff = {};
    for (const p of STYLE) if ((a.styles[p] ?? '') !== (b.styles[p] ?? '')) diff[p] = [a.styles[p] ?? '—', b.styles[p] ?? '—'];
    if (Object.keys(diff).length) styles.push({ text: norm(a.text).slice(0, 40), tag: a.tag, diff });
  }
  const within = pairs.length - spacing.length;
  // Écart purement horizontal de quelques px : dû à la largeur du texte serif qui précède sur la même ligne (police de substitution).
  const glyph = spacing.filter((i) => Math.abs(i.dyLocal) <= 2 && Math.abs(i.dx) <= 8).length;
  report[key] = { refTextElements: A.length, matched: pairs.length, within2px: within, withinRatio: +(within / Math.max(1, pairs.length)).toFixed(3), horizontalGlyphOnly: glyph, spacingIssues: spacing, styleIssues: styles };
  console.log(`${key.padEnd(12)} appariés ${pairs.length}/${A.length}  à ±2 px : ${within} (${((within / Math.max(1, pairs.length)) * 100).toFixed(1)} %)  hors tolérance : ${spacing.length}  (dont ${glyph} horizontaux dus aux glyphes)  écarts de style : ${styles.length}`);
}
writeFileSync('docs/qa/layout-report.json', JSON.stringify(report, null, 1));
