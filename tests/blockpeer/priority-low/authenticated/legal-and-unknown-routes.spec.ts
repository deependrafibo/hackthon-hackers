import { test, expect } from '@playwright/test';

test.describe('Terms of Service page @api:legal @priority:low', () => {
  test('page loads without errors', async ({ page }) => {
    const response = await page.goto('/terms');
    expect([200, 304]).toContain(response?.status() ?? 0);
  });

  test('page title is "Blockpeer Finance"', async ({ page }) => {
    await page.goto('/terms');
    await expect(page).toHaveTitle('Blockpeer Finance');
  });
});

test.describe('Privacy Policy page @api:legal @priority:low', () => {
  test('page loads without errors', async ({ page }) => {
    const response = await page.goto('/privacy');
    expect([200, 304]).toContain(response?.status() ?? 0);
  });

  test('page title is "Blockpeer Finance"', async ({ page }) => {
    await page.goto('/privacy');
    await expect(page).toHaveTitle('Blockpeer Finance');
  });
});

test.describe('Unknown routes @api:routing @priority:low', () => {
  test('visiting a non-existent path does not crash', async ({ page }) => {
    const response = await page.goto('/this-page-does-not-exist-404-test');
    expect([200, 404]).toContain(response?.status() ?? 0);
  });
});
