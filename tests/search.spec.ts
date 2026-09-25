import { test, expect, URLS, dismissCookies, mockAdresseApi, GEOCODERS } from './fixtures';

test.beforeEach(async ({ page }) => {
  await dismissCookies(page);
  await mockAdresseApi(page);
});

const cityInput = (page: import('@playwright/test').Page) => page.getByRole('combobox', { name: 'Ville / Code postal' });

test('autocomplétion : suggestion, sélection au clavier et recherche automatique', async ({ page }) => {
  await page.goto(URLS.home);
  await cityInput(page).fill('Nic');
  const list = page.getByRole('listbox');
  await expect(list).toBeVisible();
  await expect(list.getByRole('option').first()).toHaveText(/^Nice\s*France$/);
  await cityInput(page).press('ArrowDown');
  await expect(list.getByRole('option').first()).toHaveAttribute('aria-selected', 'true');
  await cityInput(page).press('Enter');
  await expect(page).toHaveURL(/\/provence-alpes-cote-d-azur\/alpes-maritimes\/nice$/);
  // Comme l'original : une recherche géocodée liste les 20 dispositifs les plus proches, triés par distance.
  await expect(page.getByRole('heading', { name: '20 dispositifs de téléconsultation Tessan autour de vous' })).toBeVisible();
  await expect(page.getByRole('article').first()).toContainText('Nice');
});

test('autocomplétion : Échap ferme la liste', async ({ page }) => {
  await page.goto(URLS.home);
  await cityInput(page).fill('Lyo');
  await expect(page.getByRole('listbox')).toBeVisible();
  await cityInput(page).press('Escape');
  await expect(page.getByRole('listbox')).toBeHidden();
});

test('casse et accents : « saint-etienne » trouve « Saint-Étienne »', async ({ page }) => {
  await page.goto(URLS.home);
  await cityInput(page).fill('saint-etienne');
  await expect(page.getByRole('option', { name: /Saint-Étienne/ }).first()).toBeVisible();
  await page.getByRole('option', { name: /Saint-Étienne/ }).first().click();
  await expect(page).toHaveURL(/\/auvergne-rhone-alpes\/loire\/saint-etienne$/);
  await expect(page.getByText('Pharmacie Robespierre-Herboristerie-Totum Pharmacien-Anton et willem')).toBeVisible();
});

test('faute de frappe : « Marseile » propose « Marseille »', async ({ page }) => {
  await page.goto(URLS.home);
  await cityInput(page).fill('Marseile');
  await expect(page.getByRole('option', { name: /^Marseille/ })).toBeVisible();
});

test('noms composés : « le plessis » propose « Le Plessis-Bouchard »', async ({ page }) => {
  await page.goto(URLS.home);
  await cityInput(page).fill('le plessis');
  await expect(page.getByRole('option', { name: /Le Plessis-Bouchard/ })).toBeVisible();
});

test('recherche sans résultat : « 0 dispositif » comme l’original', async ({ page }) => {
  await page.goto(URLS.home);
  await cityInput(page).fill('Zzqxw');
  await page.getByRole('button', { name: 'Recherche', exact: true }).click();
  await expect(page.getByRole('heading', { name: '0 dispositif de téléconsultation Tessan autour de vous' })).toBeVisible();
});

test('ville hors échantillon géocodée : tri par distance (Choisy-le-Roi)', async ({ page }) => {
  await page.goto(URLS.home);
  await cityInput(page).fill('Choisy-le-Roi');
  await page.getByRole('button', { name: 'Recherche', exact: true }).click();
  await expect(page).toHaveURL(/\/ile-de-france\/val-de-marne\/choisy-le-roi$/);
  const names = page.getByRole('article').getByRole('heading', { level: 3 });
  await expect(names.first()).toContainText('Pharmacie Saffar');
  await expect(names.first()).toContainText(/\(\d+\.\d km\)/);
  await expect(names.nth(1)).toContainText('Pharmacie Souir');
});

test('API Adresse lente : délai dépassé et message clair', async ({ page }) => {
  for (const h of GEOCODERS) { await page.unroute(h); await page.route(h, () => new Promise(() => {})); } // ne répondent jamais
  const dialogs: string[] = [];
  page.on('dialog', (d) => { dialogs.push(d.message()); void d.dismiss(); });
  await page.goto(URLS.home);
  await cityInput(page).fill('12 rue inconnue 99999');
  await page.getByRole('button', { name: 'Recherche', exact: true }).click();
  await expect.poll(() => dialogs, { timeout: 15_000 }).toContain('Le service de recherche d’adresses ne répond pas. Veuillez réessayer.');
  await expect(page.getByRole('button', { name: 'Recherche', exact: true })).toBeEnabled();
});

test('API Adresse en erreur : repli sur les villes connues', async ({ page }) => {
  for (const h of GEOCODERS) { await page.unroute(h); await page.route(h, (r) => r.fulfill({ status: 503, body: 'down' })); }
  await page.goto(URLS.home);
  await cityInput(page).fill('Lyon');
  await page.getByRole('button', { name: 'Recherche', exact: true }).click();
  await expect(page).toHaveURL(/\/auvergne-rhone-alpes\/rhone\/lyon$/);
  await expect(page.getByRole('heading', { name: '5 dispositifs de téléconsultation Tessan autour de vous' })).toBeVisible();
});

test('effacer la recherche ramène à l’accueil', async ({ page }) => {
  await page.goto(URLS.nice);
  await expect(cityInput(page)).toHaveValue('Nice');
  await page.getByRole('button', { name: 'Effacer la recherche' }).click();
  await expect(page).toHaveURL(/\/$/);
  await expect(cityInput(page)).toHaveValue('');
});

test('spécialités : menu, sélection, URL de spécialité et « Effacer le filtre »', async ({ page }) => {
  await page.goto(URLS.home);
  const trigger = page.getByRole('button', { name: 'Spécialités médicales' });
  await trigger.click();
  const menu = page.getByRole('listbox', { name: 'Spécialités médicales' });
  await expect(menu.getByRole('option')).toHaveText(['Généraliste', 'Dermatologue', 'Pédiatre', 'Ophtalmologue', 'Gériatre', 'Pneumologue']);
  await menu.getByRole('option', { name: 'Dermatologue' }).click();
  await expect(page.getByRole('button', { name: 'Dermatologue' })).toBeVisible();
  await cityInput(page).fill('Nice');
  await page.getByRole('button', { name: 'Recherche', exact: true }).click();
  await expect(page).toHaveURL(/\/dermatologues\/provence-alpes-cote-d-azur\/alpes-maritimes\/nice$/);
  await expect(page).toHaveTitle('Dermatologue - Téléconsultation Dermatologue à Nice (Alpes-Maritimes) - Tessan');
  await page.getByRole('button', { name: 'Dermatologue' }).click();
  await expect(page.getByRole('option', { name: 'Effacer le filtre' })).toBeVisible();
});

test('géolocalisation refusée : message de l’original', async ({ page }) => {
  const dialogs: string[] = [];
  page.on('dialog', (d) => { dialogs.push(d.message()); void d.dismiss(); });
  await page.goto(URLS.home);
  await page.getByRole('button', { name: 'Me géolocaliser' }).first().click();
  await expect.poll(() => dialogs).toContain("Vous avez refusé l'accès à votre position");
});

test('géolocalisation accordée : la ville est renseignée', async ({ page, context }) => {
  await context.grantPermissions(['geolocation']);
  await context.setGeolocation({ latitude: 43.7102, longitude: 7.262 });
  await page.goto(URLS.home);
  await page.getByRole('button', { name: 'Me géolocaliser' }).first().click();
  await expect(cityInput(page)).toHaveValue('Nice');
});

test('géolocalisation indisponible : message de l’original', async ({ page }) => {
  await page.addInitScript(() => { Object.defineProperty(navigator, 'geolocation', { value: undefined, configurable: true }); });
  const dialogs: string[] = [];
  page.on('dialog', (d) => { dialogs.push(d.message()); void d.dismiss(); });
  await page.goto(URLS.home);
  await page.getByRole('button', { name: 'Me géolocaliser' }).first().click();
  await expect.poll(() => dialogs).toContain('La géolocalisation n\'est pas supportée par votre navigateur');
});
