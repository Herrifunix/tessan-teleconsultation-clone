import { test, expect, URLS, dismissCookies, mockAdresseApi } from './fixtures';
import type { Page } from '@playwright/test';

// Matrice gabarit × viewport × interaction : chaque interaction inventoriée est exercée aux trois largeurs de référence.
const VIEWPORTS = [
  { width: 375, height: 812 },
  { width: 768, height: 1024 },
  { width: 1440, height: 900 },
];

// La carte est chargée paresseusement (comme la Google Map de l'original) : on la fait défiler dans la vue avant d'interagir.
async function showMap(page: Page) {
  const map = page.getByRole('region', { name: 'Carte' });
  // Le placeholder peut être remplacé pendant le défilement : on réessaie jusqu'à ce que la carte soit montée.
  await expect(async () => {
    await map.or(page.getByText('Faites défiler pour afficher la carte')).first().scrollIntoViewIfNeeded({ timeout: 2000 });
    await expect(map).toBeAttached({ timeout: 2000 });
  }).toPass({ timeout: 20000 });
  await map.scrollIntoViewIfNeeded();
  return map;
}

for (const vp of VIEWPORTS) {
  test.describe(`matrice ${vp.width}px`, () => {
    test.use({ viewport: vp });

    test(`accueil ${vp.width} · bannière cookies (Personnaliser puis Accepter)`, async ({ page }) => {
      await page.goto(URLS.home);
      const banner = page.getByRole('region', { name: 'Nous respectons votre vie privée.' });
      await banner.getByRole('button', { name: 'Personnaliser' }).click();
      const dialog = page.getByRole('dialog', { name: 'Personnaliser les préférences en matière de consentement' });
      await dialog.getByRole('button', { name: 'Fonctionnelle' }).click();
      await expect(dialog.getByText('Cookie', { exact: true }).first()).toBeVisible();
      await dialog.getByRole('button', { name: 'Accepter' }).click();
      await expect(dialog).toBeHidden();
      await expect(page.getByRole('button', { name: 'Choix de consentement' })).toBeVisible();
    });

    test.describe('avec consentement', () => {
      test.beforeEach(async ({ page }) => {
        await dismissCookies(page);
        await mockAdresseApi(page);
      });

      test(`accueil ${vp.width} · menu des spécialités au clavier et à la souris`, async ({ page }) => {
        await page.goto(URLS.home);
        const trigger = page.getByRole('search').getByRole('button', { name: 'Spécialités médicales' });
        await trigger.click();
        await page.getByRole('option', { name: 'Pédiatre' }).click();
        await expect(page.getByRole('search').getByRole('button', { name: 'Pédiatre' })).toBeVisible();
        await page.mouse.move(0, 0); // le survol d'une option la rend active, comme dans l'original
        await page.getByRole('search').getByRole('button', { name: 'Pédiatre' }).focus();
        await page.keyboard.press('Enter');
        await page.keyboard.press('ArrowUp');
        await page.keyboard.press('Enter');
        await expect(page.getByRole('search').getByRole('button', { name: 'Spécialités médicales' })).toBeVisible();
      });

      test(`accueil ${vp.width} · autocomplétion et recherche`, async ({ page }) => {
        await page.goto(URLS.home);
        const input = page.getByRole('combobox', { name: 'Ville / Code postal' });
        await input.fill('Ly');
        await expect(page.getByRole('option', { name: /^Lyon/ })).toBeVisible();
        await page.getByRole('option', { name: /^Lyon/ }).click();
        await expect(page).toHaveURL(/\/auvergne-rhone-alpes\/rhone\/lyon$/);
        await expect(page.getByRole('heading', { name: /^\d+ dispositifs? de téléconsultation Tessan autour de vous$/ })).toBeVisible();
      });

      test(`accueil ${vp.width} · géolocalisation refusée (message)`, async ({ page }) => {
        const dialogs: string[] = [];
        page.on('dialog', (d) => { dialogs.push(d.message()); void d.dismiss(); });
        await page.goto(URLS.home);
        await page.getByRole('search').getByRole('button', { name: 'Me géolocaliser' }).click();
        await expect.poll(() => dialogs).toContain("Vous avez refusé l'accès à votre position");
      });

      test(`accueil ${vp.width} · carte : clic sur un cluster (zoom +3) et Réinitialiser`, async ({ page }) => {
        await page.goto(URLS.home);
        const map = await showMap(page);
        // Les clusters sont aussi rendus dans une marge hors cadre (bounds.pad(0.5)) : on clique le premier réellement
        // visible dans la carte, comme le ferait un utilisateur (hors bouton « Réinitialiser » superposé).
        const clusters = map.getByRole('button', { name: /^Groupe de \d+ dispositifs$/ });
        const idx = await map.evaluate((m) => {
          const r = m.getBoundingClientRect();
          return [...m.querySelectorAll('[aria-label^="Groupe de"]')].findIndex((c) => {
            const b = c.getBoundingClientRect();
            return b.left >= r.left + 10 && b.right <= r.right - 10 && b.top >= r.top + 110 && b.bottom <= r.bottom - 60;
          });
        });
        expect(idx).toBeGreaterThanOrEqual(0);
        await clusters.nth(idx).click();
        await expect(map).toHaveAttribute('data-zoom', '9');
        await map.getByRole('button', { name: 'Réinitialiser la vue' }).click();
        await expect(map).toHaveAttribute('data-zoom', '6');
      });

      test(`accueil ${vp.width} · clic sur une région à proximité`, async ({ page }) => {
        await page.goto(URLS.home);
        // Accueil : les 10 régions les plus proches de Paris (PACA n'en fait pas partie, comme sur l'original).
        await page.getByRole('button', { name: /^Auvergne-Rhône-Alpes \d+ dispositifs?$/ }).click();
        await expect(page).toHaveURL(/\/auvergne-rhone-alpes$/);
      });

      test(`résultats ${vp.width} · carte de liste → popup, fermeture`, async ({ page }) => {
        await page.goto(URLS.nice);
        await page.getByRole('article').nth(1).getByText('24 Av. Jean Médecin').click();
        await showMap(page); // sous 1024 px la carte est sous la liste ; l'original ne fait pas défiler
        const popup = page.getByRole('dialog', { name: 'Pharmacie Nice Etoile' });
        await expect(popup).toBeVisible();
        await popup.getByRole('button', { name: 'Fermer la fiche' }).click();
        await expect(popup).toBeHidden();
      });

      test(`résultats ${vp.width} · marqueur → popup`, async ({ page }) => {
        await page.goto(URLS.nice);
        const marker = (await showMap(page)).getByRole('button', { name: 'Pharmacie Saint-Isidore', exact: true });
        await marker.click();
        await expect(page.getByRole('dialog', { name: 'Pharmacie Saint-Isidore' })).toBeVisible();
      });

      test(`résultats ${vp.width} · Réserver un créneau (étapes) et Voir plus`, async ({ page }) => {
        await page.goto(URLS.nice);
        const first = page.getByRole('article').first();
        await first.getByRole('button', { name: 'Réserver un créneau' }).click();
        const dialog = page.getByRole('dialog', { name: /Réserver un créneau/ });
        await dialog.getByRole('button', { name: 'Médecine générale' }).click();
        await dialog.getByRole('button', { name: '16h00 - 18h00' }).click();
        await expect(dialog.getByText('29/09 de 16h00 à 18h00')).toBeVisible();
        await dialog.getByRole('button', { name: 'Fermer' }).click();
        await first.getByRole('button', { name: 'Voir plus' }).click();
        await expect(page).toHaveURL(new RegExp(URLS.fiche + '$'));
      });

      test(`résultats ${vp.width} · fil d'Ariane (visible dès 768 px)`, async ({ page }) => {
        await page.goto(URLS.nice);
        const crumbs = page.getByRole('navigation', { name: 'breadcrumb' });
        if (vp.width < 768) {
          await expect(crumbs).toBeHidden();
        } else {
          await crumbs.getByRole('button', { name: "Provence-Alpes-Côte d'Azur" }).click();
          await expect(page).toHaveURL(/\/provence-alpes-cote-d-azur$/);
        }
      });

      test(`fiche ${vp.width} · carrousel, FAQ, liens téléphone et itinéraire`, async ({ page }) => {
        await page.goto(URLS.fiche);
        await page.getByRole('button', { name: 'Image suivante' }).click();
        await expect(page.getByText(/^2 \/ 5$/)).toBeVisible();
        const q = page.getByRole('button', { name: 'Que dois-je apporter pour la consultation ?' });
        await q.click();
        await expect(q).toHaveAttribute('aria-expanded', 'true');
        await expect(page.getByText(/afin de faciliter la prise en charge et le remboursement/)).toBeVisible();
        await expect(page.getByRole('link', { name: '0492091000' })).toHaveAttribute('href', 'tel:0492091000');
        await expect(page.getByRole('link', { name: 'Itinéraire' })).toHaveAttribute('target', '_blank');
      });

      test(`fiche ${vp.width} · dispositif à proximité → autre fiche`, async ({ page }) => {
        await page.goto(URLS.fiche);
        await page.getByRole('article').filter({ hasText: 'Pharmacie la Trinité' }).getByRole('button', { name: 'Voir plus' }).click();
        await expect(page).toHaveURL(/\/1311|\/la-trinite\/\d+\/pharmacie-la-trinite$/);
        await expect(page.getByRole('heading', { name: 'Pharmacie la Trinité' })).toBeVisible();
      });

      test(`${vp.width} · aucun défilement horizontal sur les 3 gabarits`, async ({ page }) => {
        for (const url of [URLS.home, URLS.nice, URLS.fiche]) {
          await page.goto(url);
          await page.getByRole('contentinfo').waitFor();
          expect(await page.evaluate(() => document.documentElement.scrollWidth), url).toBeLessThanOrEqual(vp.width);
        }
      });
    });
  });
}
