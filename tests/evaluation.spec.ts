import { test, expect, URLS, dismissCookies, mockAdresseApi, GEOCODERS, FIXED_TIME } from './fixtures';

// Non-régression des points relevés par l'évaluation indépendante n° 1 (docs/progress.md).

test.describe('avec consentement', () => {
  test.beforeEach(async ({ page }) => {
    await dismissCookies(page);
    await mockAdresseApi(page);
  });

  test('réservation : le focus reste dans le champ e-mail quand l’horloge avance d’une minute', async ({ page }) => {
    await page.clock.install({ time: FIXED_TIME });
    await page.goto(URLS.fiche);
    await page.getByRole('button', { name: 'Réserver un créneau' }).first().click();
    const dialog = page.getByRole('dialog', { name: /Réserver un créneau/ });
    await dialog.getByRole('button', { name: 'Médecine générale' }).click();
    await dialog.getByRole('button', { name: '16h00 - 18h00' }).first().click();
    const email = dialog.getByRole('textbox');
    await email.fill('jean');
    await page.clock.runFor(61_000);
    await page.keyboard.type('@x.fr');
    await expect(email).toHaveValue('jean@x.fr');
    await expect(email).toBeFocused();
  });

  test('réservation : focus piégé dans la modale et rendu au bouton à la fermeture', async ({ page }) => {
    await page.goto(URLS.nice);
    const trigger = page.getByRole('article').first().getByRole('button', { name: 'Réserver un créneau' });
    await trigger.click();
    const dialog = page.getByRole('dialog', { name: /Réserver un créneau/ });
    for (let i = 0; i < 12; i++) {
      await page.keyboard.press('Tab');
      expect(await dialog.evaluate((d) => d.contains(document.activeElement))).toBe(true);
    }
    await page.keyboard.press('Shift+Tab');
    expect(await dialog.evaluate((d) => d.contains(document.activeElement))).toBe(true);
    await page.keyboard.press('Escape');
    await expect(dialog).toBeHidden();
    await expect(trigger).toBeFocused();
  });

  test('carte : Entrée sur un marqueur ouvre sa fiche, Entrée sur un cluster zoome', async ({ page }) => {
    await page.goto(URLS.nice);
    const map = page.getByRole('region', { name: 'Carte' });
    await map.getByRole('button', { name: 'Pharmacie Saint-Isidore', exact: true }).focus();
    await page.keyboard.press('Enter');
    await expect(page.getByRole('dialog', { name: 'Pharmacie Saint-Isidore' })).toBeVisible();
    await page.goto(URLS.home);
    const home = page.getByRole('region', { name: 'Carte' });
    await home.getByRole('button', { name: /^Groupe de \d+ dispositifs$/ }).first().focus();
    await page.keyboard.press('Enter');
    await expect(home).toHaveAttribute('data-zoom', '9');
  });

  test('carte : le focus clavier d’un marqueur survit au déplacement de la carte', async ({ page }) => {
    await page.goto(URLS.nice);
    const marker = page.getByRole('region', { name: 'Carte' }).getByRole('button', { name: 'Pharmacie Saint-Isidore', exact: true });
    await marker.focus();
    await page.evaluate(() => (window as unknown as { __tcMap: { panBy: (p: [number, number], o: object) => void } }).__tcMap.panBy([30, 0], { animate: false }));
    await expect(marker).toBeFocused();
  });

  test('spécialité changée après une recherche : relance automatique', async ({ page }) => {
    await page.goto(URLS.home);
    const input = page.getByRole('combobox', { name: 'Ville / Code postal' });
    await input.fill('Nice');
    await page.getByRole('option', { name: /^Nice/ }).click();
    await expect(page).toHaveURL(/\/nice$/);
    await page.getByRole('search').getByRole('button', { name: 'Spécialités médicales' }).click();
    await page.getByRole('option', { name: 'Dermatologue' }).click();
    await expect(page).toHaveURL(/^[^?]*\/dermatologues?\/.*nice/);
  });

  test('saisie réduite à des espaces : retour à l’accueil', async ({ page }) => {
    await page.goto(URLS.nice);
    const input = page.getByRole('combobox', { name: 'Ville / Code postal' });
    await input.fill('   ');
    await input.press('Enter');
    await expect(page).toHaveURL(/\/$/);
  });

  test('Entrée sans sélection : première suggestion (faute de frappe corrigée dans l’URL)', async ({ page }) => {
    await page.goto(URLS.home);
    const input = page.getByRole('combobox', { name: 'Ville / Code postal' });
    await input.fill('Nicce');
    await expect(page.getByRole('option', { name: /^Nice/ })).toBeVisible();
    await input.press('Enter');
    await expect(page).toHaveURL(/\/provence-alpes-cote-d-azur\/alpes-maritimes\/nice$/);
  });

  test('inversion de lettres : « Parsi » propose « Paris »', async ({ page }) => {
    await page.goto(URLS.home);
    await page.getByRole('combobox', { name: 'Ville / Code postal' }).fill('Parsi');
    await expect(page.getByRole('option', { name: /^Paris/ })).toBeVisible();
  });

  test('code postal sans géocodeur : repli local sur l’échantillon', async ({ page }) => {
    for (const host of GEOCODERS) await page.route(host, (r) => r.abort());
    const dialogs: string[] = [];
    page.on('dialog', (d) => { dialogs.push(d.message()); void d.dismiss(); });
    await page.goto(URLS.home);
    const input = page.getByRole('combobox', { name: 'Ville / Code postal' });
    await input.fill('06000');
    await input.press('Escape');
    await page.getByRole('search').getByRole('button', { name: 'Recherche', exact: true }).click();
    await expect(page.getByRole('heading', { name: /^\d+ dispositifs? de téléconsultation Tessan autour de vous$/ })).toBeVisible();
    await expect(page.getByRole('article').first()).toContainText('06000');
    expect(dialogs).toEqual([]);
  });

  test('rechargement après une recherche : résultats recalculés depuis l’URL', async ({ page }) => {
    await page.goto(URLS.home);
    const input = page.getByRole('combobox', { name: 'Ville / Code postal' });
    await input.fill('Nice');
    await page.getByRole('option', { name: /^Nice/ }).click();
    await expect(page.getByRole('heading', { name: '20 dispositifs de téléconsultation Tessan autour de vous' })).toBeVisible();
    await page.reload();
    await expect(page.getByRole('heading', { name: '5 dispositifs de téléconsultation Tessan autour de vous' })).toBeVisible();
  });

  test('fiche : clic sur un département à proximité → page de résultats affichée en haut', async ({ page }) => {
    await page.goto(URLS.fiche);
    await page.getByRole('button', { name: /^Var \d+ dispositifs?$/ }).click();
    await expect(page).toHaveURL(/\/provence-alpes-cote-d-azur\/var$/);
    await expect.poll(() => page.evaluate(() => window.scrollY)).toBe(0);
  });

  test('après une navigation, le focus passe au titre de la page', async ({ page }) => {
    await page.goto(URLS.nice);
    await page.getByRole('article').first().getByRole('button', { name: 'Voir plus' }).click();
    await expect(page.getByRole('heading', { level: 1 })).toBeFocused();
  });

  test('URL mal encodée : la page s’affiche quand même (en-tête et pied de page)', async ({ page }) => {
    // Vercel sert l'application pour toute URL ; `vite preview` refuse celle-ci (404) : on y arrive donc côté client.
    await page.goto(URLS.home);
    await page.evaluate(() => { history.pushState({}, '', '/%E9%E9'); dispatchEvent(new PopStateEvent('popstate')); });
    await expect(page.getByRole('banner')).toBeVisible();
    await expect(page.getByRole('contentinfo')).toBeVisible();
  });
});

test('bannière cookies : atteinte en premier au clavier ; préférences avec focus piégé et rendu', async ({ page }) => {
  await page.goto(URLS.home);
  await page.keyboard.press('Tab');
  const banner = page.getByRole('region', { name: 'Nous respectons votre vie privée.' });
  expect(await banner.evaluate((b) => b.contains(document.activeElement))).toBe(true);
  await banner.getByRole('button', { name: 'Tout refuser' }).or(banner.getByRole('button', { name: 'Refuser' })).first().click();
  const revisit = page.getByRole('button', { name: 'Choix de consentement' });
  await revisit.click();
  const dialog = page.getByRole('dialog', { name: 'Personnaliser les préférences en matière de consentement' });
  for (let i = 0; i < 25; i++) {
    await page.keyboard.press('Tab');
    expect(await dialog.evaluate((d) => d.contains(document.activeElement))).toBe(true);
  }
  await page.keyboard.press('Escape');
  await expect(dialog).toBeHidden();
  await expect(revisit).toBeFocused();
});

// Non-régression des points relevés par l'évaluation indépendante n° 2 (docs/progress.md).
test.describe('évaluation n° 2', () => {
  test.beforeEach(async ({ page }) => {
    await dismissCookies(page);
    await mockAdresseApi(page);
  });

  test('nom de département + Entrée : toute la zone, pas une commune homonyme suggérée', async ({ page }) => {
    for (const host of GEOCODERS) await page.route(host, (r) => r.fulfill({ json: { features: [{ geometry: { coordinates: [-0.51, 45.1] }, properties: { label: 'Vares', city: 'Vares', name: 'Vares', postcode: '33000', type: 'municipality', context: '' } }] } }));
    await page.goto(URLS.home);
    const input = page.getByRole('combobox', { name: 'Ville / Code postal' });
    await input.fill('Var');
    await expect(page.getByRole('option', { name: /^Vares/ })).toBeVisible();
    await input.press('Enter');
    await expect(page).toHaveURL(/\/provence-alpes-cote-d-azur\/var$/);
  });

  test('géolocalisation puis nouvelle ville : le code postal de la position est oublié', async ({ page, context }) => {
    await context.grantPermissions(['geolocation']);
    await context.setGeolocation({ latitude: 43.7102, longitude: 7.262 });
    await page.goto(URLS.home);
    await page.getByRole('search').getByRole('button', { name: 'Me géolocaliser' }).click();
    const input = page.getByRole('combobox', { name: 'Ville / Code postal' });
    await expect(input).toHaveValue('Nice');
    await input.fill('Lyon');
    await input.press('Escape');
    await page.getByRole('search').getByRole('button', { name: 'Recherche', exact: true }).click();
    await expect(page).toHaveURL(/\/auvergne-rhone-alpes\/rhone\/lyon$/);
  });

  test('réservation : le focus suit le changement d’étape', async ({ page }) => {
    await page.goto(URLS.nice);
    await page.getByRole('article').first().getByRole('button', { name: 'Réserver un créneau' }).click();
    const dialog = page.getByRole('dialog', { name: /Réserver un créneau/ });
    await dialog.getByRole('button', { name: 'Médecine générale' }).click();
    expect(await dialog.evaluate((d) => d.contains(document.activeElement))).toBe(true);
    await dialog.getByRole('button', { name: '16h00 - 18h00' }).first().click();
    await expect(dialog.getByRole('textbox')).toBeFocused();
  });

  test('statut : bascule à l’heure pile (19:30), pas jusqu’à une minute plus tard', async ({ page }) => {
    await page.clock.install({ time: new Date('2026-09-25T19:29:20+02:00') });
    await page.goto(URLS.fiche);
    const closing = page.getByTestId('opening-status').filter({ hasText: 'Ferme à 19:30' });
    await expect(closing.first()).toBeVisible();
    await page.clock.runFor(45_000); // 19:30:05
    await expect(closing).toHaveCount(0);
  });

  test('carte : fermer la fiche au clavier rend le focus au marqueur', async ({ page }) => {
    await page.goto(URLS.nice);
    const marker = page.getByRole('region', { name: 'Carte' }).getByRole('button', { name: 'Pharmacie Saint-Isidore', exact: true });
    await marker.focus();
    await page.keyboard.press('Enter');
    const popup = page.getByRole('dialog', { name: 'Pharmacie Saint-Isidore' });
    await popup.getByRole('button', { name: 'Fermer la fiche' }).focus();
    await page.keyboard.press('Enter');
    await expect(popup).toBeHidden();
    await expect(page.getByRole('region', { name: 'Carte' }).getByRole('button', { name: 'Pharmacie Saint-Isidore', exact: true })).toBeFocused();
  });
});

test.describe('cookies (évaluation n° 2)', () => {
  test('préférences fermées avant tout choix : focus rendu à « Personnaliser »', async ({ page }) => {
    await page.goto(URLS.home);
    const customize = page.getByRole('region', { name: 'Nous respectons votre vie privée.' }).getByRole('button', { name: 'Personnaliser' });
    await customize.click();
    await page.keyboard.press('Escape');
    await expect(page.getByRole('region', { name: 'Nous respectons votre vie privée.' }).getByRole('button', { name: 'Personnaliser' })).toBeFocused();
  });

  test('préférences : une bascule annulée n’est pas conservée', async ({ page }) => {
    await page.goto(URLS.home);
    await page.getByRole('button', { name: 'Personnaliser' }).click();
    const dialog = page.getByRole('dialog', { name: 'Personnaliser les préférences en matière de consentement' });
    await dialog.getByRole('switch', { name: 'Activer Fonctionnelle' }).check();
    await page.keyboard.press('Escape');
    await page.getByRole('button', { name: 'Personnaliser' }).click();
    await expect(dialog.getByRole('switch', { name: 'Activer Fonctionnelle' })).not.toBeChecked();
  });
});
