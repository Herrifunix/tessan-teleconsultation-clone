import { test as base, expect, type Page } from '@playwright/test';

/** Vendredi 25 septembre 2026, 15:00 à Paris : même instant que les captures de référence. */
export const FIXED_TIME = new Date('2026-09-25T15:00:00+02:00');

export const URLS = {
  home: '/',
  nice: '/fr/france-FR/nice/results',
  fiche: '/provence-alpes-cote-d-azur/alpes-maritimes/nice/557/pharmacie-saint-barthelemy',
  unknownCity: '/fr/france-FR/choisy-le-roi/results',
};

/** Consentement cookies déjà donné (la bannière est testée à part). */
export async function dismissCookies(page: Page) {
  await page.addInitScript(() => {
    try {
      window.localStorage.setItem('tc-cookie-consent', JSON.stringify({ action: 'reject', categories: {} }));
    } catch {
      /* stockage indisponible */
    }
  });
}

/** Réponses simulées de l'API Adresse (géocodage déterministe). */
export async function mockAdresseApi(page: Page) {
  await page.route('https://api-adresse.data.gouv.fr/**', async (route) => {
    const url = new URL(route.request().url());
    if (url.pathname.startsWith('/reverse')) {
      return route.fulfill({ json: { features: [{ geometry: { coordinates: [7.262, 43.7102] }, properties: { city: 'Nice', postcode: '06000', label: 'Nice', type: 'municipality' } }] } });
    }
    const q = (url.searchParams.get('q') || '').toLowerCase();
    const known: Record<string, [number, number, string, string]> = {
      nice: [7.2661, 43.7031, 'Nice', '06000'],
      'choisy-le-roi': [2.4094, 48.7633, 'Choisy-le-Roi', '94600'],
      lyon: [4.8357, 45.764, 'Lyon', '69001'],
    };
    const hit = Object.entries(known).find(([k]) => q.startsWith(k));
    if (!hit) return route.fulfill({ json: { features: [] } });
    const [lng, lat, city, postcode] = hit[1];
    return route.fulfill({ json: { features: [{ geometry: { coordinates: [lng, lat] }, properties: { label: city, city, name: city, postcode, type: 'municipality', context: '' } }] } });
  });
}

type Fixtures = { consoleErrors: string[] };

export const test = base.extend<Fixtures>({
  consoleErrors: async ({ page }, use) => {
    const errors: string[] = [];
    page.on('console', (m) => {
      if (m.type() === 'error' || m.type() === 'warning') errors.push(`${m.type()}: ${m.text()}`);
    });
    page.on('pageerror', (e) => errors.push(`pageerror: ${e.message}`));
    await use(errors);
  },
  page: async ({ page }, use) => {
    await page.clock.setFixedTime(FIXED_TIME);
    await use(page);
  },
});

export { expect };
