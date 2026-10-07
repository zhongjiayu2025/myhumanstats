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
  await expect(page.getByRole('alert')).toContainText(/permission|microphone|supported browser/i);
});
