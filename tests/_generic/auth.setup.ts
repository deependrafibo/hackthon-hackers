import { test as setup, expect } from '@playwright/test';
import path from 'path';

/**
 * Generic auth setup that works for any discovered site.
 * Reads the site name from the Playwright project name (e.g. "mysite-setup" → "mysite"),
 * then looks up <SITENAME>_EMAIL, <SITENAME>_PASSWORD, and <SITENAME>_AUTH_ROUTE from env.
 */

setup('generic authenticate @api:auth @priority:high', async ({ page }, testInfo) => {
  const projectName = testInfo.project.name;
  const siteName = projectName.replace(/-setup$/, '');
  const prefix = siteName.toUpperCase();

  const email = process.env[`${prefix}_EMAIL`] || process.env.TEST_EMAIL || '';
  const password = process.env[`${prefix}_PASSWORD`] || process.env.TEST_PASSWORD || '';
  const authRoute = process.env[`${prefix}_AUTH_ROUTE`] || '/auth/signin';
  const baseURL = (testInfo.project.use?.baseURL || '').replace(/\/+$/, '');
  const authFile = path.join(process.cwd(), `.auth/${siteName}-session.json`);

  if (!email || !password) {
    console.log(`[auth] Skipping auth for "${siteName}" — no credentials configured.`);
    setup.skip();
    return;
  }

  await page.goto(`${baseURL}${authRoute}`);
  await page.waitForLoadState('domcontentloaded');

  const emailField = page
    .locator('input[type="email"], input[name="email"], input[placeholder*="mail" i]')
    .first();
  const passwordField = page
    .locator('input[type="password"], input[name="password"]')
    .first();

  await expect(emailField).toBeVisible({ timeout: 20000 });
  await expect(passwordField).toBeVisible({ timeout: 20000 });

  await emailField.fill(email);
  await passwordField.fill(password);

  const submitButton = page
    .getByRole('button', { name: /sign in|login|log in|submit/i })
    .first();

  if (await submitButton.count()) {
    await submitButton.click();
  } else {
    await passwordField.press('Enter');
  }

  await page.waitForLoadState('networkidle');
  await expect(page).not.toHaveURL(/signin|login/i, { timeout: 30000 });
  await page.context().storageState({ path: authFile });
  console.log(`[auth] Session saved for "${siteName}" → ${authFile}`);
});
