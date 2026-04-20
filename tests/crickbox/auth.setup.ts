import { test as setup, expect } from '@playwright/test';
import path from 'path';

export const AUTH_FILE = path.join(__dirname, '../../.auth/crickbox-session.json');

const BASE_URL = (process.env.CRICKBOX_BASE_URL || process.env.BASE_URL || 'https://crick-box07.vercel.app').replace(/\/+$/, '');
const EMAIL = process.env.CRICKBOX_EMAIL || process.env.TEST_EMAIL || '';
const PASSWORD = process.env.CRICKBOX_PASSWORD || process.env.TEST_PASSWORD || '';

setup.skip(!EMAIL || !PASSWORD, 'CRICKBOX_EMAIL and CRICKBOX_PASSWORD are not configured');

setup('authenticate @api:auth @priority:high', async ({ page }) => {
  await page.goto(BASE_URL);
  await page.waitForLoadState('domcontentloaded');

  // Login form is not visible on homepage by default.
  // Open auth UI first (header Sign In).
  const headerSignIn = page.getByRole('button', { name: /^sign in$/i });
  if (await headerSignIn.count()) {
    await headerSignIn.first().click();
  } else {
    // fallback: common auth route patterns
    await page.goto(`${BASE_URL}/auth/signin`);
  }

  const emailField = page
    .locator('input[type="email"], input[name="email"], input[placeholder*="mail" i]')
    .first();
  const passwordField = page
    .locator('input[type="password"], input[name="password"]')
    .first();

  await expect(emailField).toBeVisible({ timeout: 20000 });
  await expect(passwordField).toBeVisible({ timeout: 20000 });

  await emailField.fill(EMAIL);
  await passwordField.fill(PASSWORD);

  // Prefer submit by button, fallback to Enter key.
  const submitButton = page.getByRole('button', { name: /sign in|login|log in/i }).first();
  if (await submitButton.count()) {
    await submitButton.click();
  } else {
    await passwordField.press('Enter');
  }

  // Ensure we are no longer on login UI and save session.
  await page.waitForLoadState('networkidle');
  await expect(page).not.toHaveURL(/signin|login/i, { timeout: 30000 });
  await page.context().storageState({ path: AUTH_FILE });
});
