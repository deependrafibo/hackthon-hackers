import { test, expect } from '@playwright/test';

const BASE_URL = (process.env.CRICKBOX_BASE_URL || 'https://crick-box07.vercel.app').replace(/\/+$/, '');

test.describe('Crickbox authenticated smoke @api:dashboard @priority:high', () => {
  test('application remains reachable with stored session', async ({ page }) => {
    await page.goto(BASE_URL);
    await page.waitForLoadState('domcontentloaded');
    await expect(page.locator('body')).toBeVisible();
  });
});
