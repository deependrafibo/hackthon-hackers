import { test as setup, expect } from '@playwright/test';
import path from 'path';

export const AUTH_FILE = path.join(__dirname, '../.auth/session.json');

const TEST_GEN_BASE_URL = process.env.TEST_GEN_BASE_URL || 'https://etrade-staging.blockpeer.finance';
const EMAIL    = process.env.TEST_GEN_EMAIL    || '';
const PASSWORD = process.env.TEST_GEN_PASSWORD || '';

setup('authenticate', async ({ page }) => {
  if (!EMAIL || !PASSWORD) {
    throw new Error(
      'TEST_GEN_EMAIL and TEST_GEN_PASSWORD must be set in your .env file before running authenticated tests.',
    );
  }

  await page.goto(`${TEST_GEN_BASE_URL}/auth/signin`);

  await page.getByPlaceholder('m@example.com').fill(EMAIL);
  await page.getByPlaceholder('**********').fill(PASSWORD);
  await page.getByRole('button', { name: 'Sign In' }).click();

  // Wait until we land somewhere other than the signin page
  await expect(page).not.toHaveURL(/\/auth\/signin/, { timeout: 30000 });

  // Save the authenticated session (cookies + localStorage) to disk
  await page.context().storageState({ path: AUTH_FILE });
});
