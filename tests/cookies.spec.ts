import { test, expect, URLS } from './fixtures';

test('bannière cookies : refus, persistance et bouton de rappel', async ({ page }) => {
  await page.goto(URLS.home);
  const banner = page.getByRole('region', { name: 'Nous respectons votre vie privée.' });
  await expect(banner).toBeVisible();
  await expect(banner.getByText('Nous utilisons les cookies pour la mesure de notre audience', { exact: false })).toBeVisible();
  await expect(banner.getByRole('link', { name: 'Politique relative aux cookies' })).toHaveAttribute('href', 'https://tessan.io/cookies/');
  await banner.getByRole('button', { name: 'Refuser' }).click();
  await expect(banner).toBeHidden();
  const revisit = page.getByRole('button', { name: 'Choix de consentement' });
  await expect(revisit).toBeVisible();
  await page.reload();
  await expect(page.getByRole('region', { name: 'Nous respectons votre vie privée.' })).toBeHidden();
  await revisit.click();
  const dialog = page.getByRole('dialog', { name: 'Personnaliser les préférences en matière de consentement' });
  await expect(dialog).toBeVisible();
  await expect(dialog.getByRole('button', { name: 'Nécessaire' })).toBeVisible();
  await expect(dialog.getByText('Toujours actif')).toBeVisible();
  await dialog.getByRole('button', { name: 'Fermer' }).click();
  await expect(dialog).toBeHidden();
});

test('bannière cookies : accepter et personnaliser', async ({ page }) => {
  await page.goto(URLS.home);
  const banner = page.getByRole('region', { name: 'Nous respectons votre vie privée.' });
  await banner.getByRole('button', { name: 'Personnaliser' }).click();
  const dialog = page.getByRole('dialog', { name: 'Personnaliser les préférences en matière de consentement' });
  await expect(dialog).toBeVisible();
  await dialog.getByRole('switch', { name: 'Activer Analytique' }).check();
  await dialog.getByRole('button', { name: 'Enregistrer mes préférences' }).click();
  await expect(dialog).toBeHidden();
  await expect(banner).toBeHidden();
  const stored = await page.evaluate(() => localStorage.getItem('tc-cookie-consent'));
  expect(JSON.parse(stored || '{}').categories.analytics).toBe(true);
});

test('bannière cookies mobile : boutons empilés, Accepter en premier @mobile', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 });
  await page.goto(URLS.home);
  const banner = page.getByRole('region', { name: 'Nous respectons votre vie privée.' });
  const accept = await banner.getByRole('button', { name: 'Accepter' }).boundingBox();
  const refuse = await banner.getByRole('button', { name: 'Refuser' }).boundingBox();
  expect(accept!.y).toBeLessThan(refuse!.y);
  expect(accept!.width).toBeGreaterThan(300);
  await banner.getByRole('button', { name: 'Accepter' }).click();
  await expect(banner).toBeHidden();
});
