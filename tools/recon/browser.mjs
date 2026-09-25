// Contexte navigateur partagé pour la reconnaissance : fr-FR, Europe/Paris, UA réel.
// Dans l'environnement cloud, le trafic HTTPS passe par un proxy qui re-signe les certificats :
// on épingle UNIQUEMENT la clé publique de son CA (pas de désactivation globale de TLS).
import { chromium } from '@playwright/test';
import { existsSync, readFileSync } from 'node:fs';
import { createHash, X509Certificate } from 'node:crypto';

export const UA =
  'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36';

export function proxyCaSpki() {
  const f = '/root/.ccr/agent-proxy-ca.crt';
  if (!existsSync(f)) return [];
  const pems = readFileSync(f, 'utf8').match(/-----BEGIN CERTIFICATE-----[\s\S]+?-----END CERTIFICATE-----/g) ?? [];
  return pems.map((pem) => {
    const der = new X509Certificate(pem).publicKey.export({ type: 'spki', format: 'der' });
    return createHash('sha256').update(der).digest('base64');
  });
}

export function launchArgs() {
  const spki = proxyCaSpki();
  return [
    '--disable-blink-features=AutomationControlled',
    ...(spki.length ? [`--ignore-certificate-errors-spki-list=${spki.join(',')}`] : []),
  ];
}

export async function launch({ headless = true } = {}) {
  return chromium.launch({ headless, args: launchArgs() });
}

export async function newContext(browser, viewport = { width: 1440, height: 900 }, extra = {}) {
  const ctx = await browser.newContext({
    locale: 'fr-FR',
    timezoneId: 'Europe/Paris',
    userAgent: UA,
    viewport,
    deviceScaleFactor: 1,
    extraHTTPHeaders: { 'Accept-Language': 'fr-FR,fr;q=0.9,en;q=0.8' },
    ...extra,
  });
  await ctx.addInitScript(() => {
    Object.defineProperty(navigator, 'webdriver', { get: () => undefined });
  });
  return ctx;
}

export const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
