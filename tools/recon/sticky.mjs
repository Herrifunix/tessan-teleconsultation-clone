// Le proxy sortant de l'environnement change d'IP à chaque connexion, alors que le cookie
// du « Vercel Security Checkpoint » est lié à l'IP. On rejoue donc toutes les requêtes *.tessan.io
// sur UNE seule connexion keep-alive (même tunnel CONNECT → même IP), avec un cookie jar.
import { ProxyAgent, request } from 'undici';

const proxy = process.env.HTTPS_PROXY || process.env.https_proxy;
const agent = proxy
  ? new ProxyAgent({ uri: proxy, connections: 1, pipelining: 1, keepAliveTimeout: 120000, keepAliveMaxTimeout: 600000 })
  : undefined;
const jar = new Map();
export const stats = { total: 0, byStatus: {} };

const SKIP = new Set(['host', 'connection', 'content-length', 'accept-encoding', 'cookie', 'transfer-encoding']);

async function forward(req) {
  const headers = {};
  const all = await req.allHeaders();
  for (const [k, v] of Object.entries(all)) if (!SKIP.has(k.toLowerCase()) && !k.startsWith(':')) headers[k] = v;
  const cookies = new Map(jar);
  for (const part of (all.cookie || '').split(/;\s*/).filter(Boolean)) {
    const i = part.indexOf('=');
    if (!cookies.has(part.slice(0, i))) cookies.set(part.slice(0, i), part.slice(i + 1));
  }
  if (cookies.size) headers.cookie = [...cookies].map(([k, v]) => `${k}=${v}`).join('; ');
  const body = req.postDataBuffer() ?? undefined;
  const res = await request(req.url(), { method: req.method(), headers, body, dispatcher: agent, maxRedirections: 0 });
  const buf = Buffer.from(await res.body.arrayBuffer());
  const outHeaders = {};
  for (const [k, v] of Object.entries(res.headers)) {
    if (['content-encoding', 'content-length', 'transfer-encoding', 'connection'].includes(k)) continue;
    if (k === 'set-cookie') {
      for (const c of [].concat(v)) {
        const [nv] = c.split(';');
        const i = nv.indexOf('=');
        jar.set(nv.slice(0, i).trim(), nv.slice(i + 1).trim());
      }
    }
    outHeaders[k] = Array.isArray(v) ? v.join(k === 'set-cookie' ? '\n' : ', ') : v;
  }
  stats.total++;
  stats.byStatus[res.statusCode] = (stats.byStatus[res.statusCode] || 0) + 1;
  return { status: res.statusCode, headers: outHeaders, body: buf };
}

// Téléchargement direct sur le même tunnel (mêmes cookies) : renvoie { status, headers, body }.
export async function stickyGet(url, headers = {}) {
  return forward({ url: () => url, method: () => 'GET', allHeaders: async () => headers, postDataBuffer: () => null });
}

// File d'attente : une requête à la fois sur le tunnel.
let chain = Promise.resolve();
export async function installSticky(ctx, hostRe = /(^|\.)tessan\.io$/) {
  await ctx.route(
    (url) => hostRe.test(url.hostname),
    (route) => {
      chain = chain.then(async () => {
        try {
          const r = await forward(route.request());
          await route.fulfill(r);
        } catch (e) {
          stats.errors = (stats.errors || []).concat(`${route.request().url().slice(0, 120)} :: ${String(e).slice(0, 200)}`).slice(-20);
          await route.abort().catch(() => {});
        }
      });
      return chain;
    },
  );
}
