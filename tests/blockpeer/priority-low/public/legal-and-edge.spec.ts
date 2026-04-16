import { test, expect } from '@playwright/test';

const BASE_URL = process.env.BLOCKPEER_BASE_URL || process.env.BASE_URL || 'https://staging-react.blockpeer.finance/';

test.describe('Blockpeer Legal and Edge Pages @api:legal @priority:low', () => {
  test('terms page responds successfully', async ({ page }) => {
    const response = await page.goto(`${BASE_URL}terms`);
    expect(response?.status()).toBe(200);
  });

  test('privacy page responds successfully', async ({ page }) => {
    const response = await page.goto(`${BASE_URL}privacy`);
    expect(response?.status()).toBe(200);
  });

  test('unknown route is handled without app crash', async ({ page }) => {
    const response = await page.goto(`${BASE_URL}this-page-does-not-exist`);
    expect([200, 404]).toContain(response?.status());
    await expect(page.locator('body')).toBeVisible();
  });
});
