import { test, expect, URLS, dismissCookies, mockAdresseApi } from './fixtures';

test.beforeEach(async ({ page }) => {
  await dismissCookies(page);
  await mockAdresseApi(page);
});

const cards = (page: import('@playwright/test').Page) => page.getByRole('article');

test('résultats Nice : titre, fil d’Ariane, liste triée par distance', async ({ page }) => {
  await page.goto(URLS.nice);
  await expect(page).toHaveTitle('Téléconsultation à Nice (france-FR) - Tessan');
  await expect(page.getByRole('heading', { name: '5 dispositifs de téléconsultation Tessan autour de vous' })).toBeVisible();
  const crumbs = page.getByRole('navigation', { name: 'breadcrumb' });
  await expect(crumbs.getByRole('listitem')).toHaveText(['Trouver un dispositif de téléconsultation', 'Spécialités médicales', 'Provence-Alpes-Côte d\'Azur', 'Alpes-Maritimes', 'Nice']);
  await expect(cards(page).getByRole('heading', { level: 3 })).toHaveText([
    /^Pharmacie Saint Barthélémy\s*\(0\.0 km\)$/,
    /^Pharmacie Nice Etoile\s*\(1\.6 km\)$/,
    /^Pharmacie Grande Corniche\s*\(2\.6 km\)$/,
    /^Pharmacie de l'Ariane\s*\(4\.3 km\)$/,
    /^Pharmacie Saint-Isidore\s*\(5\.8 km\)$/,
  ]);
});

test('fil d’Ariane : retour à l’accueil et au niveau département', async ({ page }) => {
  await page.goto(URLS.nice);
  const crumbs = page.getByRole('navigation', { name: 'breadcrumb' });
  await crumbs.getByRole('button', { name: 'Alpes-Maritimes' }).click();
  await expect(page).toHaveURL(/\/provence-alpes-cote-d-azur\/alpes-maritimes$/);
  await expect(page.getByRole('heading', { name: /^\d+ dispositifs? de téléconsultation Tessan autour de vous$/ })).toBeVisible();
  await page.getByRole('navigation', { name: 'breadcrumb' }).getByRole('button', { name: 'Trouver un dispositif de téléconsultation' }).click();
  await expect(page).toHaveURL(/\/$/);
});

test('ville inconnue : vue d’accueil conservée, URL inchangée (comme l’original)', async ({ page }) => {
  await page.goto(URLS.unknownCity);
  await expect(page).toHaveURL(new RegExp(URLS.unknownCity + '$'));
  await expect(page).toHaveTitle('Téléconsultation à Choisy-Le-Roi (france-FR) - Tessan');
  await expect(page.getByRole('navigation', { name: 'breadcrumb' })).toHaveCount(0);
  await expect(page.getByRole('heading', { name: /^\d+ dispositifs? de téléconsultation Tessan autour de vous$/ })).toHaveCount(0);
  await expect(page.getByRole('heading', { name: 'Les dispositifs de téléconsultation Tessan dans les départements à proximité' })).toBeVisible();
});

test('règle du minimum : Franconville (1 dispositif) est complétée par les 5 plus proches', async ({ page }) => {
  await page.goto('/fr/france-FR/franconville/results');
  await expect(page.getByRole('heading', { name: '6 dispositifs de téléconsultation Tessan autour de vous' })).toBeVisible();
  await expect(cards(page).first().getByRole('heading', { level: 3 })).toContainText('Pharmacie des Peupliers');
});

test('carte de pharmacie : itinéraire, Voir plus, Réserver', async ({ page }) => {
  await page.goto(URLS.nice);
  const first = cards(page).first();
  const dist = first.getByRole('link', { name: '(0.0 km)' });
  await expect(dist).toHaveAttribute('href', 'https://www.google.com/maps/dir/?api=1&destination=43.7148516,7.26141699');
  await expect(dist).toHaveAttribute('target', '_blank');
  await first.getByRole('button', { name: 'Réserver un créneau' }).click();
  await expect(page.getByRole('dialog', { name: /Réserver un créneau/ })).toBeVisible();
  await page.getByRole('dialog').getByRole('button', { name: 'Fermer' }).click();
  await expect(page.getByRole('dialog')).toBeHidden();
  await first.getByRole('button', { name: 'Voir plus' }).click();
  await expect(page).toHaveURL(new RegExp(URLS.fiche + '$'));
});

test('bouton Réserver absent quand la pharmacie ne prend pas de réservation', async ({ page }) => {
  await page.goto('/ile-de-france/val-de-marne/orly');
  const saffar = cards(page).filter({ hasText: 'Pharmacie Saffar' });
  await expect(saffar.getByRole('button', { name: 'Voir plus' })).toBeVisible();
  await expect(saffar.getByRole('button', { name: 'Réserver un créneau' })).toHaveCount(0);
});

test('synchro liste → carte : un clic sur la carte de liste ouvre la popup du marqueur', async ({ page }) => {
  await page.goto(URLS.nice);
  await cards(page).nth(2).getByText('2 Bd Saint-Roch').click();
  const popup = page.getByRole('dialog', { name: 'Pharmacie Grande Corniche' });
  await expect(popup).toBeVisible();
  await expect(popup.getByRole('button', { name: 'Réserver un créneau' })).toBeVisible();
  await popup.getByRole('button', { name: 'Fermer la fiche' }).click();
  await expect(popup).toBeHidden();
});

test('synchro carte → popup : un clic sur un marqueur ouvre sa popup', async ({ page }) => {
  await page.goto(URLS.nice);
  await page.getByRole('button', { name: 'Pharmacie Nice Etoile', exact: true }).click();
  await expect(page.getByRole('dialog', { name: 'Pharmacie Nice Etoile' })).toBeVisible();
});

test('clic sur un département à proximité (accueil) → résultats du département', async ({ page }) => {
  await page.goto(URLS.home);
  await page.getByRole('button', { name: /^Val-de-Marne/ }).click();
  await expect(page).toHaveURL(/\/ile-de-france\/val-de-marne$/);
  await expect(page.getByRole('heading', { name: /^\d+ dispositifs? de téléconsultation Tessan autour de vous$/ })).toBeVisible();
});

test('clic sur une région à proximité → résultats de la région', async ({ page }) => {
  await page.goto(URLS.home);
  await page.getByRole('button', { name: /^Île-de-France/ }).click();
  await expect(page).toHaveURL(/\/ile-de-france$/);
});

test('nom de pharmacie très long : pas de débordement à 320 px @mobile', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 800 });
  await page.goto('/fr/france-FR/saint-etienne/results');
  const card = cards(page).filter({ hasText: 'Robespierre' });
  await expect(card).toBeVisible();
  const box = await card.boundingBox();
  expect(box!.x + box!.width).toBeLessThanOrEqual(320);
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(320);
});
