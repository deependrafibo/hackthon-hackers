import { test, expect } from '@playwright/test';

const BASE_URL = process.env.BLOCKPEER_BASE_URL || process.env.BASE_URL || 'https://staging-react.blockpeer.finance/';

test.describe('Blockpeer Login Critical @api:auth @priority:high', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(`${BASE_URL}auth/signin`);
  });

  test('signin page title is correct', async ({ page }) => {
    await expect(page).toHaveTitle('Blockpeer Finance');
  });

  test('signin heading is visible', async ({ page }) => {
    await expect(page.getByRole('heading', { name: /Login to Your Unified Finance/i })).toBeVisible();
  });

  test('email input is visible and editable', async ({ page }) => {
    const email = page.getByPlaceholder('m@example.com');
    await expect(email).toBeVisible();
    await email.fill('qa-user@example.com');
    await expect(email).toHaveValue('qa-user@example.com');
  });

  test('password input is visible and masked', async ({ page }) => {
    const password = page.getByPlaceholder('**********');
    await expect(password).toBeVisible();
    await expect(password).toHaveAttribute('type', 'password');
  });

  test('password visibility toggle changes input type', async ({ page }) => {
    const password = page.getByPlaceholder('**********');
    await password.fill('MySecret123');
    const clickToggle = () =>
      page.evaluate(() => {
        const input = document.querySelector('input[placeholder="**********"]') as HTMLInputElement;
        (input?.nextElementSibling as HTMLElement)?.click();
      });
    await clickToggle();
    await expect(password).toHaveAttribute('type', 'text');
    await clickToggle();
    await expect(password).toHaveAttribute('type', 'password');
  });

  test('sign in button is visible', async ({ page }) => {
    await expect(page.getByRole('button', { name: 'Sign In' })).toBeVisible();
  });

  test('empty login submit keeps user on signin', async ({ page }) => {
    await page.getByRole('button', { name: 'Sign In' }).click();
    await expect(page).toHaveURL(`${BASE_URL}auth/signin`);
  });

  test('invalid email login attempt stays on signin', async ({ page }) => {
    await page.getByPlaceholder('m@example.com').fill('not-an-email');
    await page.getByPlaceholder('**********').fill('randompass123');
    await page.getByRole('button', { name: 'Sign In' }).click();
    await expect(page).toHaveURL(`${BASE_URL}auth/signin`);
  });

  test('keep me signed in checkbox toggles', async ({ page }) => {
    const checkbox = page.getByRole('checkbox', { name: /Keep me signed in/i });
    await expect(checkbox).toBeVisible();
    await expect(checkbox).not.toBeChecked();
    await checkbox.click();
    await expect(checkbox).toBeChecked();
  });
});
