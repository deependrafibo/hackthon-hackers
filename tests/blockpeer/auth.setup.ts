import { test as setup, expect } from '@playwright/test';
import path from 'path';

/** Must match playwright.config.ts: `.auth/blockpeer-session.json` under repo root */
export const AUTH_FILE = path.join(process.cwd(), '.auth/blockpeer-session.json');

function trim(v: string | undefined): string {
  return (v ?? '').trim();
}

function resolveEmail(): string {
  const k = trim(process.env.AUTH_EMAIL_ENV_KEY);
  if (k && trim(process.env[k]))
    return trim(process.env[k])!;
  return trim(process.env.BLOCKPEER_EMAIL) || trim(process.env.TEST_EMAIL) || trim(process.env.TEST_GEN_EMAIL) || '';
}

function resolvePassword(): string {
  const k = trim(process.env.AUTH_PASSWORD_ENV_KEY);
  if (k && trim(process.env[k]))
    return trim(process.env[k])!;
  return trim(process.env.BLOCKPEER_PASSWORD) || trim(process.env.TEST_PASSWORD) || trim(process.env.TEST_GEN_PASSWORD) || '';
}

const EMAIL = resolveEmail();
const PASSWORD = resolvePassword();

setup('blockpeer authenticate @api:auth @priority:high', async ({ page }) => {
  if (!EMAIL || !PASSWORD) {
    throw new Error(
      'Set BLOCKPEER_EMAIL / BLOCKPEER_PASSWORD in .env, or AUTH_EMAIL_ENV_KEY / AUTH_PASSWORD_ENV_KEY (see .env.example).',
    );
  }

  await page.goto('/auth/signin');
  await page.getByPlaceholder('m@example.com').fill(EMAIL);
  await page.getByPlaceholder('**********').fill(PASSWORD);
  await page.getByRole('button', { name: 'Sign In' }).click();

  await expect(page).not.toHaveURL(/\/auth\/signin/, { timeout: 60000 });
  await page.context().storageState({ path: AUTH_FILE });
});
