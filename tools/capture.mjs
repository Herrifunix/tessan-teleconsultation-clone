#!/usr/bin/env node
// Captures pleine page dans des conditions identiques pour la référence et le clone.
// Usage : node tools/capture.mjs <ref|clone> <baseUrl> <outDir> [gabarit,...] [largeur,...]
//   ex. : node tools/capture.mjs ref https://teleconsultation.tessan.io docs/reference
//         node tools/capture.mjs clone http://localhost:4173 docs/qa/clone
// Conditions : contexte neuf par viewport, fr-FR, Europe/Paris, horloge figée (FIXED_TIME),
// cookies refusés via la bannière, défilement complet (chargements différés), animations et
// transitions coupées, curseur masqué, document.fonts.ready, images chargées, réseau stable.
import { mkdirSync, writeFileSync, existsSync, readFileSync } from 'node:fs';
import { launch, newContext, sleep } from './recon/browser.mjs';

export const FIXED_TIME = new Date('2026-09-25T15:00:00+02:00'); // vendredi, 15 h à Paris
export const TEMPLATES = {
  home: '/',
  results: '/fr/france-FR/nice/results',
  fiche: '/provence-alpes-cote-d-azur/alpes-maritimes/nice/557/pharmacie-saint-barthelemy',
};
export const VIEWPORTS = { 375: { width: 375, height: 812 }, 768: { width: 768, height: 1024 }, 1440: { width: 1440, height: 900 } };

const FREEZE_CSS = `*,*::before,*::after{animation-duration:0s!important;animation-delay:0s!important;transition-duration:0s!important;transition-delay:0s!important;caret-color:transparent!important;scroll-behavior:auto!important}`;

async function waitReady(page) {
  for (let i = 0; i < 60; i++) {
    await sleep(1000);
    try {
      const t = await page.title();
      // Aucun indicateur de chargement visible (page, sections, carte).
      const loading = await page.getByText(/^Chargement/).filter({ visible: true }).count();
      if (!/Checkpoint/.test(t) && !loading && i > 1) break;
    } catch {}
  }
  await page.waitForLoadState('networkidle', { timeout: 30000 }).catch(() => {});
}

async function settle(page) {
  // Déclenche les chargements différés (carte en IntersectionObserver, images) puis revient en haut.
  const h = await page.evaluate(() => document.documentElement.scrollHeight);
  for (let y = 0; y < h; y += 600) {
    await page.evaluate((y) => window.scrollTo(0, y), y);
    await sleep(250);
  }
  await sleep(1500);
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.waitForLoadState('networkidle', { timeout: 20000 }).catch(() => {});
  await page.evaluate(async () => {
    await document.fonts.ready;
    await Promise.all([...document.images].filter((i) => !i.complete).map((i) => new Promise((r) => { i.onload = i.onerror = r; setTimeout(r, 8000); })));
  });
  await sleep(2500); // tuiles de carte
  for (let i = 0; i < 30; i++) {
    const loading = await page.getByText(/^Chargement/).filter({ visible: true }).count();
    if (!loading) break;
    await sleep(1000);
  }
}

export async function capture({ side, baseUrl, outDir, templates = Object.keys(TEMPLATES), widths = Object.keys(VIEWPORTS) }) {
  mkdirSync(outDir, { recursive: true });
  const isRef = side === 'ref';
  const browser = await launch();
  const meta = {};
  for (const tpl of templates) {
    for (const w of widths) {
      const ctx = await newContext(browser, VIEWPORTS[w]);
      if (isRef) {
        const { installSticky } = await import('./recon/sticky.mjs');
        await installSticky(ctx);
      }
      const page = await ctx.newPage();
      const consoleMsgs = [];
      page.on('console', (m) => { if (['error', 'warning'].includes(m.type())) consoleMsgs.push(`${m.type()}: ${m.text()}`.slice(0, 300)); });
      const url = baseUrl.replace(/\/$/, '') + TEMPLATES[tpl];
      if (isRef) {
        // 1er chargement : passe le challenge Vercel avec l'horloge réelle.
        await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 90000 });
        await waitReady(page);
      }
      await page.clock.setFixedTime(FIXED_TIME);
      await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 90000 });
      await waitReady(page);
      await page.addStyleTag({ content: FREEZE_CSS });
      // Bannière cookies : refus (même geste des deux côtés).
      const refuse = page.getByRole('button', { name: 'Refuser', exact: true }).first();
      if (await refuse.isVisible().catch(() => false)) { await refuse.click(); await sleep(800); }
      await page.mouse.move(0, 0); // aucun survol résiduel
      await settle(page);
      const file = `${outDir}/${tpl}-${w}.png`;
      await page.screenshot({ path: file, fullPage: true, animations: 'disabled', caret: 'hide' });
      // Zones intrinsèquement différentes à masquer dans le diff : cartes (tuiles), grilles dépendantes des données.
      const masks = await page.evaluate(() => {
        const out = [];
        const add = (el, kind) => { const r = el.getBoundingClientRect(); if (r.width && r.height) out.push({ kind, x: Math.round(r.x), y: Math.round(r.y + window.scrollY), w: Math.round(r.width), h: Math.round(r.height) }); };
        document.querySelectorAll('div.overflow-hidden.shadow-md').forEach((el) => { if (el.querySelector('.gm-style, .leaflet-container, [aria-label="Carte"]') || /Faites défiler|Chargement de la carte/.test(el.textContent || '')) add(el, 'carte'); });
        document.querySelectorAll('div.grid.grid-cols-2').forEach((el) => { if (el.querySelector('button p')) add(el, 'grille-zones'); });
        return out;
      });
      meta[`${tpl}-${w}`] = {
        masks,
        url, file, title: await page.title(),
        description: await page.locator('meta[name="description"]').getAttribute('content').catch(() => null),
        scrollHeight: await page.evaluate(() => document.documentElement.scrollHeight),
        scrollWidth: await page.evaluate(() => document.documentElement.scrollWidth),
        console: consoleMsgs,
      };
      console.log(`${side} ${tpl}-${w} → ${file} (${meta[`${tpl}-${w}`].scrollHeight}px)`);
      await ctx.close();
      if (isRef) await sleep(1500); // rythme humain
    }
  }
  await browser.close();
  const metaFile = `${outDir}/capture-meta.json`;
  const prev = existsSync(metaFile) ? JSON.parse(readFileSync(metaFile, 'utf8')) : {};
  writeFileSync(metaFile, JSON.stringify({ ...prev, ...meta, _fixedTime: FIXED_TIME.toISOString() }, null, 1));
  return meta;
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const [side, baseUrl, outDir, tpls, ws] = process.argv.slice(2);
  await capture({ side, baseUrl, outDir, templates: tpls ? tpls.split(',') : undefined, widths: ws ? ws.split(',') : undefined });
}
