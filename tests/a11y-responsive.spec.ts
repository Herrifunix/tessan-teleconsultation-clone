import { test, expect, URLS, dismissCookies, mockAdresseApi } from './fixtures';

test.beforeEach(async ({ page }) => {
  await dismissCookies(page);
  await mockAdresseApi(page);
});

for (const width of [320, 375, 768, 1024, 1440]) {
  test(`aucun défilement horizontal à ${width} px (3 gabarits) @mobile`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    for (const url of [URLS.home, URLS.nice, URLS.fiche]) {
      await page.goto(url);
      await page.getByRole('contentinfo').waitFor();
      const sw = await page.evaluate(() => document.documentElement.scrollWidth);
      expect(sw, `${url} @${width}`).toBeLessThanOrEqual(width);
    }
  });
}

test('zoom texte 200 % : contenu lisible, sans défilement horizontal', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  for (const url of [URLS.home, URLS.nice, URLS.fiche]) {
    await page.goto(url);
    await page.addStyleTag({ content: 'html{font-size:200% !important}' });
    await page.getByRole('contentinfo').waitFor();
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
    const sw = await page.evaluate(() => document.documentElement.scrollWidth);
    expect(sw, url).toBeLessThanOrEqual(1280);
  }
});

test('navigation au clavier : en-tête, formulaire, autocomplétion, focus visible', async ({ page }) => {
  await page.goto(URLS.home);
  await page.keyboard.press('Tab');
  await expect(page.getByRole('link', { name: 'Logo Tessan' })).toBeFocused();
  for (let i = 0; i < 4; i++) await page.keyboard.press('Tab');
  await expect(page.getByRole('link', { name: 'Compte patient' })).toBeFocused();
  const outline = await page.evaluate(() => getComputedStyle(document.activeElement as Element).outlineStyle);
  expect(outline).not.toBe('none');
  await page.keyboard.press('Tab');
  await expect(page.getByRole('button', { name: 'Spécialités médicales' })).toBeFocused();
  await page.keyboard.press('Enter');
  await expect(page.getByRole('listbox', { name: 'Spécialités médicales' })).toBeVisible();
  await page.keyboard.press('ArrowDown');
  await page.keyboard.press('Enter');
  await expect(page.getByRole('button', { name: 'Généraliste' })).toBeVisible();
  await page.keyboard.press('Tab');
  const input = page.getByRole('combobox', { name: 'Ville / Code postal' });
  await expect(input).toBeFocused();
  await page.keyboard.type('Lyo');
  await page.keyboard.press('ArrowDown');
  await expect(input).toHaveAttribute('aria-activedescendant', /.+/);
  await page.keyboard.press('Enter');
  await expect(page).toHaveURL(/\/medecins-generalistes\/auvergne-rhone-alpes\/rhone\/lyon$/);
});

test('fil d’Ariane et cartes accessibles au clavier', async ({ page }) => {
  await page.goto(URLS.nice);
  const voirPlus = page.getByRole('article').first().getByRole('button', { name: 'Voir plus' });
  await voirPlus.focus();
  await page.keyboard.press('Enter');
  await expect(page).toHaveURL(new RegExp(URLS.fiche + '$'));
});

test.describe('prefers-reduced-motion', () => {
  test.use({ reducedMotion: 'reduce' });
  test('animations et transitions neutralisées', async ({ page }) => {
    await page.goto(URLS.home);
    const btn = page.getByRole('button', { name: 'Recherche', exact: true });
    const d = await btn.evaluate((e) => getComputedStyle(e).transitionDuration);
    expect(parseFloat(d)).toBeLessThanOrEqual(0.001);
    const mapZoomAnim = await page.getByRole('region', { name: 'Carte' }).getAttribute('data-animated');
    expect(mapZoomAnim).toBe('false');
  });
});
