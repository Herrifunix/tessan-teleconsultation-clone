import { defineConfig, devices } from '@playwright/test';
// @ts-expect-error module JS sans types (outillage)
import { proxyCaSpki } from './tools/recon/browser.mjs';

// E2E : par défaut contre le build local (vite preview) ; PLAYWRIGHT_BASE_URL permet de viser l'URL publique.
const external = process.env.PLAYWRIGHT_BASE_URL;
const spki: string[] = proxyCaSpki();

export default defineConfig({
  testDir: './tests',
  timeout: 45_000,
  expect: { timeout: 10_000 },
  fullyParallel: true,
  workers: process.env.CI ? 2 : 4,
  retries: 0,
  reporter: [['list'], ['json', { outputFile: 'test-results/results.json' }]],
  use: {
    baseURL: external || 'http://localhost:4173',
    locale: 'fr-FR',
    timezoneId: 'Europe/Paris',
    trace: 'retain-on-failure',
    launchOptions: { args: spki.length ? [`--ignore-certificate-errors-spki-list=${spki.join(',')}`] : [] },
  },
  projects: [
    { name: 'desktop', use: { ...devices['Desktop Chrome'], viewport: { width: 1440, height: 900 } } },
    { name: 'mobile', use: { ...devices['Desktop Chrome'], viewport: { width: 375, height: 812 }, hasTouch: true }, grep: /@mobile/ },
  ],
  webServer: external
    ? undefined
    : { command: 'npm run preview', url: 'http://localhost:4173', reuseExistingServer: true, timeout: 60_000 },
});
