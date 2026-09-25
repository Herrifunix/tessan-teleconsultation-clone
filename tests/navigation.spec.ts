import { test, expect, URLS, dismissCookies } from './fixtures';

test.beforeEach(async ({ page }) => dismissCookies(page));

test('accueil : titre, intro et sections', async ({ page }) => {
  await page.goto(URLS.home);
  await expect(page).toHaveTitle('Trouvez le dispositif de téléconsultation Tessan');
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Les dispositifs de téléconsultation Tessan autour de vous');
  await expect(page.getByText('téléconsultation augmentée par des dispositifs médicaux connectés', { exact: false })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Les dispositifs de téléconsultation Tessan dans les départements à proximité' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Les dispositifs de téléconsultation Tessan dans les régions à proximité' })).toBeVisible();
});

test('en-tête desktop : liens de navigation vers tessan.io', async ({ page }) => {
  await page.goto(URLS.home);
  const banner = page.getByRole('banner');
  await expect(banner.getByRole('link', { name: 'Logo Tessan' })).toHaveAttribute('href', 'https://www.tessan.io/');
  await expect(banner.getByRole('link', { name: 'Téléconsultation', exact: true })).toHaveAttribute('href', 'https://www.tessan.io/la-teleconsultation-augmentee');
  await expect(banner.getByRole('link', { name: 'Vous êtes médecin ?' })).toHaveAttribute('href', 'https://www.tessan.io/medecins');
  await expect(banner.getByRole('link', { name: 'Vous êtes un professionnel ?' })).toHaveAttribute('href', 'https://www.tessan.io/');
  await expect(banner.getByRole('link', { name: 'Compte patient' })).toHaveAttribute('href', 'https://patient.prod.tessan.cloud/auth/login');
});

test('en-tête mobile : pas de menu burger, liens masqués comme sur l’original @mobile', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 });
  await page.goto(URLS.home);
  const banner = page.getByRole('banner');
  await expect(banner.getByRole('link', { name: 'Compte patient' })).toBeVisible();
  await expect(banner.getByRole('link', { name: 'Vous êtes médecin ?' })).toBeHidden();
  await expect(banner.getByRole('button')).toHaveCount(0);
});

test('pied de page : liens réels, adresse et mention de non-affiliation', async ({ page }) => {
  await page.goto(URLS.home);
  const footer = page.getByRole('contentinfo');
  await expect(footer.getByText('10 Rue Pergolèse')).toBeVisible();
  await expect(footer.getByRole('link', { name: 'Nous contacter' })).toHaveAttribute('href', 'http://tessan.io/nous-contacter');
  await expect(footer.getByRole('link', { name: 'Pharmaciens' })).toHaveAttribute('href', 'https://www.tessan.io/pharmaciens');
  await expect(footer.getByRole('link', { name: 'FAQ' })).toHaveAttribute('href', 'https://aide.tessan.io/fr/');
  await expect(footer.getByRole('link', { name: 'CGV Téléexpertise dermatologique' })).toHaveAttribute('href', 'https://www.tessan.io/cgv-teleexpertise-dermatologie');
  await expect(footer.getByText('© 2025 Tessan. Tous droits réservés.')).toBeVisible();
  await expect(footer.getByText("Reproduction réalisée dans le cadre d'un test technique — non affiliée à Tessan", { exact: false })).toBeVisible();
  const hrefs = await footer.getByRole('link').evaluateAll((as) => as.map((a) => (a as HTMLAnchorElement).href));
  expect(hrefs.length).toBeGreaterThanOrEqual(40);
  for (const h of hrefs) expect(h).toMatch(/^https?:\/\/[^/]+\.[a-z]+/);
});

test('chaque lien de chaque gabarit mène quelque part', async ({ page }) => {
  for (const url of [URLS.home, URLS.nice, URLS.fiche]) {
    await page.goto(url);
    await page.getByRole('contentinfo').waitFor();
    const bad = await page.locator('a').evaluateAll((as) =>
      as.map((a) => a.getAttribute('href') || '').filter((h) => !h || h === '#' || h.startsWith('javascript:')),
    );
    expect(bad, `liens morts sur ${url}`).toEqual([]);
  }
});

test('le clone ne doit pas être indexé', async ({ page, request }) => {
  await page.goto(URLS.home);
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', 'noindex, nofollow');
  const robots = await request.get('/robots.txt');
  expect(robots.status()).toBe(200);
  expect(await robots.text()).toContain('Disallow: /');
});

test('rechargement direct des routes profondes', async ({ page }) => {
  for (const url of [URLS.nice, URLS.fiche, '/ile-de-france/val-de-marne', '/dermatologues/provence-alpes-cote-d-azur/alpes-maritimes/nice']) {
    const res = await page.goto(url);
    expect(res?.status(), url).toBe(200);
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  }
});

test('console vide d’erreurs et d’avertissements sur les 3 gabarits', async ({ page, consoleErrors }) => {
  for (const url of [URLS.home, URLS.nice, URLS.fiche]) {
    await page.goto(url);
    await page.getByRole('contentinfo').waitFor();
    await page.waitForLoadState('networkidle');
  }
  expect(consoleErrors).toEqual([]);
});
