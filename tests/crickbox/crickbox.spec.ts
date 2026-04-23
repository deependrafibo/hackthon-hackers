import { test, expect } from '@playwright/test';

const BASE_URL = (process.env.CRICKBOX_BASE_URL || 'https://crick-box07.vercel.app').replace(/\/+$/, '');

test.describe('Crickbox smoke @api:core @priority:high', () => {
  test('home page loads successfully', async ({ page }) => {
    const response = await page.goto(BASE_URL);
    expect(response?.ok()).toBeTruthy();
    await expect(page).toHaveURL(/crick-box07\.vercel\.app/);
  });

  test('page title mentions Cricket Scorer', async ({ page }) => {
    await page.goto(BASE_URL);
    await expect(page).toHaveTitle(/Cricket Scorer/i);
  });
});

test.describe('Crickbox login form @api:auth @priority:medium', () => {
  test('email and password fields are discoverable', async ({ page }) => {
    await page.goto(BASE_URL);
    const emailField = page.locator('input[type="email"], input[name="email"], input[placeholder*="mail" i]').first();
    const passwordField = page.locator('input[type="password"], input[name="password"]').first();

    await expect(emailField).toBeVisible({ timeout: 20000 });
    await expect(passwordField).toBeVisible();
  });

  test('login button is available', async ({ page }) => {
    await page.goto(BASE_URL);
    await expect(page.getByRole('button', { name: /sign in|login|log in/i }).first()).toBeVisible();
  });
});

test.describe('Crickbox non-critical checks @api:ui @priority:low', () => {
  test('page renders main landmarks', async ({ page }) => {
    await page.goto(BASE_URL);
    await expect(page.locator('body')).toBeVisible();
  });
});
