// Pilote de reconnaissance : garde un navigateur ouvert (routage sticky inclus) et exécute
// des extraits JS envoyés en POST sur http://127.0.0.1:9333/eval (corps = corps d'une fonction async
// recevant { page, ctx, browser, sleep, pages }). Permet d'explorer les interactions sans recharger.
import http from 'node:http';
import { appendFileSync } from 'node:fs';
import { launch, newContext, sleep } from './browser.mjs';
import { installSticky, stats } from './sticky.mjs';

const browser = await launch();
const ctx = await newContext(browser, { width: 1440, height: 900 });
await installSticky(ctx);
const pages = { main: await ctx.newPage() };
const consoleLog = [];
pages.main.on('console', (m) => consoleLog.push(`${m.type()}: ${m.text()}`.slice(0, 300)));
const origGoto = pages.main.goto.bind(pages.main);
pages.main.goto = async (url, opts) => {
  appendFileSync('docs/research/visits.log', `${new Date().toISOString()}\tdriver\t${url}\n`);
  await sleep(1000);
  return origGoto(url, opts);
};
const AsyncFunction = Object.getPrototypeOf(async function () {}).constructor;

http
  .createServer(async (req, res) => {
    let body = '';
    for await (const c of req) body += c;
    try {
      const fn = new AsyncFunction('page', 'ctx', 'browser', 'sleep', 'pages', 'stats', 'consoleLog', body);
      const out = await fn(pages.main, ctx, browser, sleep, pages, stats, consoleLog);
      res.end(JSON.stringify(out ?? null, null, 1));
    } catch (e) {
      res.statusCode = 500;
      res.end(String(e?.stack || e));
    }
  })
  .listen(9333, () => console.log('driver ready on 9333'));
