import { test, expect, URLS, dismissCookies } from './fixtures';

test.beforeEach(async ({ page }) => dismissCookies(page));

test('réservation : spécialité → créneaux → e-mail → confirmation', async ({ page }) => {
  await page.goto(URLS.nice);
  await page.getByRole('article').first().getByRole('button', { name: 'Réserver un créneau' }).click();
  const dialog = page.getByRole('dialog', { name: /Réserver un créneau/ });
  await expect(dialog.getByRole('heading', { name: 'Pharmacie Saint Barthélémy' })).toBeVisible();
  await expect(dialog.getByText('Comment ça marche ?')).toBeVisible();
  await dialog.getByRole('button', { name: 'Médecine générale' }).click();
  // Vendredi 25/09 15:00 : prochains créneaux du généraliste = mardi 29 (2), mercredi 30 (1), jeudi 1er oct. (2)
  await expect(dialog.getByRole('button', { name: /Mardi 29 sept\./ })).toHaveAttribute('aria-expanded', 'true');
  await expect(dialog.getByRole('button', { name: /Mercredi 30 sept\./ })).toContainText('1 créneaux');
  await expect(dialog.getByRole('button', { name: /Jeudi 1 oct\./ })).toContainText('2 créneaux');
  await dialog.getByRole('button', { name: '9h30 - 11h30' }).click();
  await expect(dialog.getByText('Votre créneau de passage :')).toBeVisible();
  await expect(dialog.getByText('29/09 de 9h30 à 11h30')).toBeVisible();
  const confirm = dialog.getByRole('button', { name: 'Confirmer mon créneau prioritaire' });
  await expect(confirm).toBeDisabled();
  // Comme l'original : actif dès que le champ est non vide (pas de contrôle de format côté client) ;
  // une adresse refusée produit le message d'erreur rouge de l'original.
  await dialog.getByRole('textbox', { name: 'Votre e-mail' }).fill('pas-un-email');
  await expect(confirm).toBeEnabled();
  await confirm.click();
  await expect(dialog.getByText('Une erreur est survenue.')).toBeVisible();
  await dialog.getByRole('textbox', { name: 'Votre e-mail' }).fill('patient@example.fr');
  await expect(confirm).toBeEnabled();
  await confirm.click();
  await expect(dialog.getByText('Aucune réservation n’a été transmise', { exact: false })).toBeVisible();
});

test('réservation : bouton Retour et fermeture par Échap', async ({ page }) => {
  await page.goto(URLS.nice);
  await page.getByRole('article').first().getByRole('button', { name: 'Réserver un créneau' }).click();
  const dialog = page.getByRole('dialog', { name: /Réserver un créneau/ });
  await dialog.getByRole('button', { name: 'Médecine générale' }).click();
  await dialog.getByRole('button', { name: 'Retour' }).click();
  await expect(dialog.getByText('Choisissez votre spécialité')).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(dialog).toBeHidden();
});
