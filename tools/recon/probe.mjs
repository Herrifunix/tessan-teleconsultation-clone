// Sonde d'accès : ouvre l'accueil et indique si le challenge Vercel est passé.
import { launch, newContext, sleep } from './browser.mjs';
const headless = process.argv[2] !== 'headed';
const browser = await launch({ headless });
const ctx = await newContext(browser);
const page = await ctx.newPage();
const resp = await page.goto('https://teleconsultation.tessan.io/', { waitUntil: 'domcontentloaded', timeout: 60000 });
console.log('status initial', resp?.status());
for (let i = 0; i < 20; i++) {
  await sleep(1500);
  const title = await page.title();
  console.log(i, page.url(), '|', title);
  if (!/Security Checkpoint/i.test(title) && title) break;
}
await page.waitForLoadState('networkidle', { timeout: 30000 }).catch(() => {});
console.log('final title:', await page.title());
await page.screenshot({ path: process.argv[3] || '/tmp/claude-0/probe.png' });

await browser.close();
