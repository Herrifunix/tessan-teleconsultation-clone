import { test, expect, URLS, dismissCookies } from './fixtures';

test.beforeEach(async ({ page }) => dismissCookies(page));

test('fiche : titre, en-tête, coordonnées et actions', async ({ page }) => {
  await page.goto(URLS.fiche);
  await expect(page).toHaveTitle('Pharmacie Saint Barthélémy - Téléconsultation à Nice');
  await expect(page.locator('meta[name="description"]')).toHaveAttribute('content', 'Consultez un médecin en téléconsultation à Pharmacie Saint Barthélémy, 51 Av. Alfred Borriglione, 06100 Nice.');
  await expect(page.getByRole('heading', { level: 1, name: 'Votre dispositif de téléconsultation Tessan à Nice' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Effectuer une nouvelle recherche' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Pharmacie Saint Barthélémy' })).toBeVisible();
  await expect(page.getByText('51 Av. Alfred Borriglione')).toBeVisible();
  await expect(page.getByRole('link', { name: '0492091000' })).toHaveAttribute('href', 'tel:0492091000');
  await expect(page.getByRole('link', { name: 'Itinéraire' })).toHaveAttribute('href', 'https://www.google.com/maps/dir/?api=1&destination=43.7148516,7.26141699');
  const crumbs = page.getByRole('navigation', { name: 'breadcrumb' });
  await expect(crumbs.getByRole('listitem')).toHaveText(['Trouver un dispositif de téléconsultation', 'Spécialités médicales', 'Provence-Alpes-Côte d\'Azur', 'Alpes-Maritimes', 'Nice', 'Pharmacie Saint Barthélémy']);
});

test('fiche : description structurée (listes) sans HTML brut', async ({ page }) => {
  await page.goto(URLS.fiche);
  await expect(page.getByText('Vous cherchez un médecin disponible rapidement à Nice ou près de chez vous ?')).toBeVisible();
  await expect(page.getByRole('listitem').filter({ hasText: 'Fièvre, mal de gorge, angine, symptômes grippaux' })).toBeVisible();
});

test('fiche : carrousel photo (suivante, précédente, boucle)', async ({ page }) => {
  await page.goto(URLS.fiche);
  const counter = page.getByText(/^\d \/ 5$/);
  await expect(counter).toHaveText('1 / 5');
  await page.getByRole('button', { name: 'Image suivante' }).click();
  await expect(counter).toHaveText('2 / 5');
  await page.getByRole('button', { name: 'Image précédente' }).click();
  await page.getByRole('button', { name: 'Image précédente' }).click();
  await expect(counter).toHaveText('5 / 5');
});

test('fiche : horaires commençant par le jour courant (vendredi, en gras, Ouvert)', async ({ page }) => {
  await page.goto(URLS.fiche);
  await expect(page.getByRole('heading', { name: 'Horaires d\'ouverture' })).toBeVisible();
  const rows = page.getByRole('row');
  await expect(rows).toHaveCount(7);
  await expect(rows.first()).toContainText('Vendredi');
  await expect(rows.first()).toContainText('Ouvert');
  await expect(rows.first()).toContainText('09:00-12:30, 14:30-19:30');
  await expect(rows.nth(2)).toContainText('Dimanche');
  await expect(rows.nth(2)).toContainText('Fermé');
});

test('fiche : FAQ en accordéon, une seule réponse ouverte', async ({ page }) => {
  await page.goto(URLS.fiche);
  await expect(page.getByRole('heading', { name: 'Foire Aux Questions' })).toBeVisible();
  const q1 = page.getByRole('button', { name: 'Quels sont les horaires de téléconsultation ?' });
  const q2 = page.getByRole('button', { name: 'La consultation est-elle remboursée ?' });
  await expect(q1).toHaveAttribute('aria-expanded', 'false');
  await q1.click();
  await expect(q1).toHaveAttribute('aria-expanded', 'true');
  await expect(page.getByText('La téléconsultation est disponible pendant les horaires d\'ouverture de la')).toBeVisible();
  await q2.click();
  await expect(q1).toHaveAttribute('aria-expanded', 'false');
  await expect(page.getByText('La consultation (25 €) est remboursée par l\'Assurance Maladie', { exact: false })).toBeVisible();
  await q2.click();
  await expect(q2).toHaveAttribute('aria-expanded', 'false');
});

test('fiche : 6 dispositifs à proximité, navigation vers une autre fiche', async ({ page }) => {
  await page.goto(URLS.fiche);
  await expect(page.getByRole('heading', { name: 'Les dispositifs de téléconsultation Tessan à proximité' })).toBeVisible();
  await expect(page.getByText('Découvrez les 6 dispositifs les plus proches')).toBeVisible();
  const nearby = page.getByRole('article');
  await expect(nearby).toHaveCount(6);
  await expect(nearby.first()).toContainText('Pharmacie Nice Etoile');
  await nearby.first().getByText('24 Av. Jean Médecin').click();
  await expect(page).toHaveURL(/\/provence-alpes-cote-d-azur\/alpes-maritimes\/nice\/1076\/pharmacie-nice-etoile$/);
  await expect(page.getByRole('heading', { name: 'Pharmacie Nice Etoile' })).toBeVisible();
});

test('fiche : formats d’URL alternatifs et pharmacie introuvable', async ({ page }) => {
  await page.goto('/557/pharmacie-saint-barthelemy');
  await expect(page.getByRole('heading', { name: 'Pharmacie Saint Barthélémy' })).toBeVisible();
  await page.goto('/provence-alpes-cote-d-azur/alpes-maritimes/nice/999999/inconnue');
  await expect(page.getByRole('heading', { name: 'Pharmacie non trouvée' })).toBeVisible();
});
