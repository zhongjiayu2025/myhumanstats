import { test, expect } from '@playwright/test';

test('search landing pages remain usable at 390px mobile viewport', async ({ page }) => {
  for (const id of [
    'number-memory-test', 'perfect-pitch-test', 'contrast-test',
    'color-hue-test', 'peripheral-vision-test', 'rhythm-test'
  ]) {
    const response = await page.goto('/test/' + id + '/', { waitUntil: 'domcontentloaded' });
    expect(response?.status(), id).toBe(200);
    await expect(page.locator('h1').first(), id).toBeVisible();
    await expect(page.locator('link[rel="canonical"]'), id)
      .toHaveAttribute('href', new RegExp('/test/' + id + '/?$'));
    await expect(page.getByText('About This Test')).toBeVisible();
  }
});

test('mobile CPS counts one touch and finishes a one-second test', async ({ page }) => {
  await page.goto('/test/cps-test/');
  await page.getByRole('button', { name: '1s', exact: true }).click();
  await expect(page.getByText('Initialize Profile?')).toHaveCount(0);
  const surface = page.getByRole('button', { name: /Click, tap, Space or Enter to measure click speed/i });
  await expect(surface).toBeVisible();
  await surface.tap();
  await expect(page.getByText(/Final Score \(1s\)/)).toBeVisible({ timeout: 8500 });
  await expect(page.getByText('Total Clicks')).toBeVisible();
});

test('color hue game works with touch input', async ({ page }) => {
  await page.goto('/test/color-hue-test/');
  await page.getByRole('button', { name: /Start Discrimination/i }).click();
  const tiles = page.locator('button[aria-label^="Color tile"]');
  await expect(tiles.first()).toBeVisible();
  await tiles.first().tap();
  await expect(tiles.first()).toBeVisible();
});

test('microphone permission denial is explained and no capture is required for page load', async ({ page, context }) => {
  await context.grantPermissions([]);
  await page.goto('/tools/mic-test/');
  await expect(page.getByRole('heading', { name: /Microphone Test/i })).toBeVisible();
  await page.getByRole('button', { name: /Start Monitoring/i }).click();
  await expect(page.locator('p[role="alert"]').filter({ hasText: /permission|microphone|supported browser/i }).first()).toBeVisible();
});

test('homepage offers visible, direct links to the six GSC-focused tests', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { name: 'Free Online Human Ability Tests', level: 1 })).toBeVisible();
  const featured = page.getByRole('heading', { name: 'Start with a test' }).locator('..').locator('..');
  for (const id of ['rhythm-test','contrast-test','color-hue-test','perfect-pitch-test','peripheral-vision-test','number-memory-test']) {
    await expect(featured.locator('a[href="/test/' + id + '/"]')).toHaveCount(1);
  }
});

test('related test pathways stay relevant to rhythm and contrast searches', async ({ page }) => {
  await page.goto('/test/rhythm-test/');
  const nextRhythm = page.getByRole('navigation', { name: 'Continue exploring related tests' });
  await expect(nextRhythm.getByRole('link', { name: /Perfect Pitch Test/i })).toHaveAttribute('href', /\/test\/perfect-pitch-test\/?$/);
  await page.goto('/test/contrast-test/');
  const nextContrast = page.getByRole('navigation', { name: 'Continue exploring related tests' });
  await expect(nextContrast.getByRole('link', { name: /Color Hue Test/i })).toHaveAttribute('href', /\/test\/color-hue-test\/?$/);
});
