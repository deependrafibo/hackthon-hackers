import { test as setup, expect } from '@playwright/test';
import path from 'path';

export const AUTH_FILE = path.join(__dirname, '../../.auth/blockpeer-session.json');

const BASE_URL = (process.env.BLOCKPEER_BASE_URL || process.env.BASE_URL || 'https://staging-react.blockpeer.finance').replace(/\/+$/, '');
const EMAIL = process.env.BLOCKPEER_EMAIL || process.env.TEST_EMAIL || '';
const PASSWORD = process.env.BLOCKPEER_PASSWORD || process.env.TEST_PASSWORD || '';

setup('blockpeer authenticate @api:auth @priority:high', async ({ page }) => {
  if (!EMAIL || !PASSWORD) {
    throw new Error(
      'BLOCKPEER_EMAIL and BLOCKPEER_PASSWORD (or TEST_EMAIL / TEST_PASSWORD) must be set before authenticated runs.',
    );
  }

  await page.goto(`${BASE_URL}/auth/signin`);
  await page.getByPlaceholder('m@example.com').fill(EMAIL);
  await page.getByPlaceholder('**********').fill(PASSWORD);
  await page.getByRole('button', { name: 'Sign In' }).click();
  await expect(page).not.toHaveURL(/\/auth\/signin/, { timeout: 30000 });
  await page.context().storageState({ path: AUTH_FILE });
});
