// Exploration d'une page : rendu complet, trafic réseau, DOM, CSS, capture.
// Usage : node tools/recon/explore.mjs <nom> <url> [largeur] [hauteur]
// Chaque visite est journalisée dans docs/research/visits.log (budget : 20 pages, ≥1 s entre requêtes).
import { launch, newContext, sleep } from './browser.mjs';
import { installSticky, stats } from './sticky.mjs';
import { mkdirSync, writeFileSync, appendFileSync, existsSync, readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';

const [name, url, w = '1440', h = '900'] = process.argv.slice(2);
const out = `docs/research/pages/${name}`;
mkdirSync(`${out}/bodies`, { recursive: true });
mkdirSync('docs/research/css', { recursive: true });

const browser = await launch();
const ctx = await newContext(browser, { width: +w, height: +h });
await installSticky(ctx);
const page = await ctx.newPage();
const net = [];
page.on('response', async (res) => {
  const req = res.request();
  const entry = { url: res.url(), method: req.method(), type: req.resourceType(), status: res.status(), ct: res.headers()['content-type'] || '' };
  if (['xhr', 'fetch'].includes(entry.type) || /json/.test(entry.ct)) {
    try {
      const body = await res.body();
      const f = `${out}/bodies/${createHash('md5').update(entry.url + entry.method).digest('hex').slice(0, 10)}.txt`;
      writeFileSync(f, body);
      entry.body = f;
      entry.postData = req.postData() || undefined;
    } catch {}
  }
  if (entry.type === 'stylesheet' || /text\/css/.test(entry.ct)) {
    try {
      const body = await res.body();
      const f = `docs/research/css/${entry.url.split('/').pop().split('?')[0] || 'style.css'}`;
      writeFileSync(f, body);
      entry.saved = f;
    } catch {}
  }
  net.push(entry);
});
const t0 = Date.now();
appendFileSync('docs/research/visits.log', `${new Date().toISOString()}\t${name}\t${url}\t${w}x${h}\n`);
await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 60000 });
for (let i = 0; i < 30; i++) {
  await sleep(1000);
  const t = await page.title();
  const loading = await page.getByText('Chargement...').count().catch(() => 0);
  if (!/Security Checkpoint/.test(t) && !loading) break;
}
await page.waitForLoadState('networkidle', { timeout: 30000 }).catch(() => {});
await sleep(2000);
writeFileSync(`${out}/dom.html`, await page.content());
writeFileSync(`${out}/network.json`, JSON.stringify(net, null, 1));
await page.screenshot({ path: `${out}/full-${w}.png`, fullPage: true });
const info = await page.evaluate(() => ({
  title: document.title,
  url: location.href,
  lang: document.documentElement.lang,
  metas: [...document.querySelectorAll('meta')].map((m) => m.outerHTML),
  links: [...document.querySelectorAll('a')].map((a) => ({ text: a.innerText.trim().slice(0, 80), href: a.href })),
  scrollH: document.documentElement.scrollHeight,
  stylesheets: [...document.styleSheets].map((s) => s.href),
  fonts: [...document.fonts].map((f) => `${f.family} ${f.weight} ${f.style} ${f.status}`),
}));
writeFileSync(`${out}/info.json`, JSON.stringify(info, null, 1));
console.log('sticky', JSON.stringify(stats));
console.log(JSON.stringify({ title: info.title, url: info.url, scrollH: info.scrollH, ms: Date.now() - t0, requests: net.length, xhr: net.filter((n) => n.body).map((n) => `${n.method} ${n.status} ${n.url.slice(0, 140)}`) }, null, 1));
await browser.close();
