#!/usr/bin/env node
// Compare la mise en page référence ↔ clone à partir des dumps de styles calculés produits par tools/capture.mjs.
// Appariement des éléments porteurs de texte par (balise, texte), dans l'ordre d'apparition.
// Mesures : décalage absolu, écart d'espacement LOCAL (variation du décalage vertical entre deux éléments appariés
// consécutifs) et différences de styles (taille, graisse, interligne, couleur, fond). Écrit docs/qa/layout-report.json.
import { readFileSync, writeFileSync, existsSync } from 'node:fs';

const keys = process.argv.slice(2).length ? process.argv.slice(2) : ['home', 'results', 'fiche'].flatMap((t) => [375, 768, 1440].map((w) => `${t}-${w}`));
const norm = (t) => t.replace(/\s+/g, ' ').trim();
const STYLE = ['fontSize', 'fontWeight', 'lineHeight', 'color', 'backgroundColor', 'letterSpacing'];
const report = {};
for (const key of keys) {
  const fa = `docs/reference/${key}.layout.json`, fb = `docs/qa/clone/${key}.layout.json`;
  if (!existsSync(fa) || !existsSync(fb)) { console.log(`${key}: dumps absents`); continue; }
  const A = JSON.parse(readFileSync(fa, 'utf8')).elements.filter((e) => norm(e.text));
  const B = JSON.parse(readFileSync(fb, 'utf8')).elements.filter((e) => norm(e.text));
  const pool = new Map();
  for (const e of B) { const k = `${e.tag}|${norm(e.text)}`; if (!pool.has(k)) pool.set(k, []); pool.get(k).push(e); }
  const pairs = [];
  for (const a of A) { const q = pool.get(`${a.tag}|${norm(a.text)}`); if (q && q.length) pairs.push([a, q.shift()]); }
  pairs.sort((p, q) => p[0].rect.y - q[0].rect.y);
  let prevDy = 0;
  const spacing = [], styles = [];
  for (const [a, b] of pairs) {
    const dy = b.rect.y - a.rect.y, dx = b.rect.x - a.rect.x;
    const local = dy - prevDy;
    if (Math.abs(local) > 2 || Math.abs(dx) > 2) spacing.push({ text: norm(a.text).slice(0, 50), tag: a.tag, y: a.rect.y, dx: +dx.toFixed(1), dyLocal: +local.toFixed(1), dyAbs: +dy.toFixed(1), dw: +(b.rect.w - a.rect.w).toFixed(1), dh: +(b.rect.h - a.rect.h).toFixed(1) });
    prevDy = dy;
    const diff = {};
    for (const p of STYLE) if ((a.styles[p] ?? '') !== (b.styles[p] ?? '')) diff[p] = [a.styles[p] ?? '—', b.styles[p] ?? '—'];
    if (Object.keys(diff).length) styles.push({ text: norm(a.text).slice(0, 40), tag: a.tag, diff });
  }
  const within = pairs.length - spacing.length;
  report[key] = { refTextElements: A.length, matched: pairs.length, within2px: within, withinRatio: +(within / Math.max(1, pairs.length)).toFixed(3), spacingIssues: spacing, styleIssues: styles };
  console.log(`${key.padEnd(12)} appariés ${pairs.length}/${A.length}  à ±2 px : ${within} (${((within / Math.max(1, pairs.length)) * 100).toFixed(1)} %)  écarts de style : ${styles.length}`);
}
writeFileSync('docs/qa/layout-report.json', JSON.stringify(report, null, 1));
