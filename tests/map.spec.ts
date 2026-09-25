import { test, expect, URLS, dismissCookies } from './fixtures';

test.beforeEach(async ({ page }) => dismissCookies(page));

const map = (page: import('@playwright/test').Page) => page.getByRole('region', { name: 'Carte' });

test('carte d’accueil : clusters numérotés, zoom au clic sur un cluster', async ({ page }) => {
  await page.goto(URLS.home);
  const clusters = map(page).getByRole('button', { name: /^Groupe de \d+ dispositifs$/ });
  await expect(clusters.first()).toBeVisible();
  const before = await clusters.count();
  await clusters.first().click();
  await expect.poll(async () => (await map(page).getAttribute('data-zoom')) ?? '').not.toBe('6');
  expect(Number(await map(page).getAttribute('data-zoom'))).toBe(9);
  expect(before).toBeGreaterThan(0);
});

test('carte : « Réinitialiser » revient à la vue France (zoom 6)', async ({ page }) => {
  await page.goto(URLS.nice);
  await expect(map(page)).toHaveAttribute('data-zoom', /1[0-5]/);
  await map(page).getByRole('button', { name: 'Réinitialiser la vue' }).click();
  await expect(map(page)).toHaveAttribute('data-zoom', '6');
});

test('carte : « Me géolocaliser » centre sur la position (zoom 15)', async ({ page, context }) => {
  await context.grantPermissions(['geolocation']);
  await context.setGeolocation({ latitude: 45.764, longitude: 4.8357 });
  await page.goto(URLS.nice);
  await map(page).getByRole('button', { name: 'Me géolocaliser' }).click();
  await expect(map(page)).toHaveAttribute('data-zoom', '15');
});

test('carte d’accueil : clic sur un marqueur → résultats dans un rayon de 10 km', async ({ page }) => {
  const pageErrors: string[] = [];
  page.on('pageerror', (e) => pageErrors.push(e.message));
  await page.goto(URLS.home);
  // La carte est chargée à la demande : on attend son instance avant de recentrer sur Nice (zoom 12, sans clusters).
  await page.waitForFunction(() => !!(window as unknown as { __tcMap?: unknown }).__tcMap);
  await page.evaluate(() => (window as unknown as { __tcMap: { setView: (c: [number, number], z: number) => void } }).__tcMap.setView([43.7148516, 7.26141699], 12));
  await map(page).getByRole('button', { name: 'Pharmacie Saint Barthélémy', exact: true }).click();
  await expect(page).toHaveURL(/\/provence-alpes-cote-d-azur\/alpes-maritimes\/nice$/);
  await expect(page.getByRole('article').first()).toContainText('Pharmacie Saint Barthélémy');
  // La carte d'accueil est démontée pendant son animation : aucune exception ne doit remonter (évaluation n° 1).
  await page.waitForTimeout(600);
  expect(pageErrors).toEqual([]);
});

test('chargement différé de la carte (fiche) : espace réservé avant défilement', async ({ page }) => {
  await page.goto(URLS.fiche);
  const hoursMap = page.getByTestId('pharmacy-map');
  await expect(hoursMap).toBeAttached();
  await hoursMap.scrollIntoViewIfNeeded();
  await expect(hoursMap.getByRole('region', { name: 'Carte' })).toBeVisible();
});
