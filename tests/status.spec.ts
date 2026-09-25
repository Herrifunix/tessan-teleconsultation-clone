import { test, expect, URLS, dismissCookies } from './fixtures';

// Horaires de la Pharmacie Saint Barthélémy : lun-ven 09:00-12:30, 14:30-19:30 ; sam 09:00-12:30, 14:30-19:00 ; dim fermé.
const statusOf = (page: import('@playwright/test').Page) =>
  page.getByRole('article').filter({ hasText: 'Pharmacie Saint Barthélémy' }).getByTestId('opening-status');

for (const tz of ['Europe/Paris', 'America/New_York', 'Asia/Tokyo']) {
  test.describe(`fuseau du visiteur : ${tz}`, () => {
    test.use({ timezoneId: tz });
    test.beforeEach(async ({ page }) => dismissCookies(page));

    test('juste avant la fermeture (vendredi 19:29 à Paris) : Ouvert · Ferme à 19:30', async ({ page }) => {
      await page.clock.setFixedTime(new Date('2026-09-25T19:29:00+02:00'));
      await page.goto(URLS.nice);
      await expect(statusOf(page)).toHaveText(/^Ouvert\s*•\s*Ferme à 19:30$/);
    });

    test('juste après la fermeture (vendredi 19:31) : Fermé · Ouvre demain à 09:00', async ({ page }) => {
      await page.clock.setFixedTime(new Date('2026-09-25T19:31:00+02:00'));
      await page.goto(URLS.nice);
      await expect(statusOf(page)).toHaveText(/^Fermé\s*•\s*Ouvre demain à 09:00$/);
    });

    test('pause de midi (vendredi 12:45) : Fermé · Réouvre 14:30 (sans « à », comme l’original)', async ({ page }) => {
      await page.clock.setFixedTime(new Date('2026-09-25T12:45:00+02:00'));
      await page.goto(URLS.nice);
      await expect(statusOf(page)).toHaveText(/^Fermé\s*•\s*Réouvre 14:30$/);
    });

    test('dimanche (27/09 11:00) : Fermé · Ouvre demain à 09:00', async ({ page }) => {
      await page.clock.setFixedTime(new Date('2026-09-27T11:00:00+02:00'));
      await page.goto(URLS.nice);
      await expect(statusOf(page)).toHaveText(/^Fermé\s*•\s*Ouvre demain à 09:00$/);
    });
  });
}

test('matin avant ouverture (lundi 08:00) : Fermé · Ouvre 09:00', async ({ page }) => {
  await dismissCookies(page);
  await page.clock.setFixedTime(new Date('2026-09-28T08:00:00+02:00'));
  await page.goto(URLS.nice);
  await expect(statusOf(page)).toHaveText(/^Fermé\s*•\s*Ouvre 09:00$/);
});

test('horaires absents : traités comme « Fermé » sans plantage', async ({ page }) => {
  await dismissCookies(page);
  await page.route('**/*locations*.json', async (route) => {
    const res = await route.fetch();
    const rows = await res.json();
    for (const r of rows) if (r.code_magasin === '557') for (const d of ['lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi', 'dimanche']) r[`horaires_tc_${d}`] = null;
    await route.fulfill({ response: res, json: rows });
  });
  await page.goto(URLS.nice);
  await expect(statusOf(page)).toHaveText(/^Fermé$/);
  await page.goto(URLS.fiche);
  await expect(page.getByRole('row', { name: /Vendredi/ })).toContainText('Fermé');
});
