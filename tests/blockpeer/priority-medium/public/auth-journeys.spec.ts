import { test, expect } from '@playwright/test';

const BASE_URL = (process.env.BLOCKPEER_BASE_URL || process.env.BASE_URL || 'https://staging-react.blockpeer.finance').replace(/\/+$/, '');

test.describe('Blockpeer Signup Journey @api:auth @priority:medium', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(`${BASE_URL}/auth/signup`);
  });

  test('signup heading is visible', async ({ page }) => {
    await expect(page.getByRole('heading', { name: /Start Your Financial Journey Today/i })).toBeVisible();
  });

  test('full name and email inputs are visible', async ({ page }) => {
    await expect(page.getByPlaceholder('John Doe')).toBeVisible();
    await expect(page.getByPlaceholder('example@gmail.com')).toBeVisible();
  });

  test('create account and google buttons are visible', async ({ page }) => {
    await expect(page.getByRole('button', { name: 'Create Account' })).toBeVisible();
    await expect(page.getByRole('button', { name: /Sign Up with Google/i })).toBeVisible();
  });

  test('empty form submit keeps user on signup', async ({ page }) => {
    await page.getByRole('button', { name: 'Create Account' }).click();
    await expect(page).toHaveURL(`${BASE_URL}/auth/signup`);
  });

  test('sign in link returns to signin', async ({ page }) => {
    await page.getByRole('link', { name: 'Sign in' }).click();
    await expect(page).toHaveURL(`${BASE_URL}/auth/signin`);
  });
});

test.describe('Blockpeer Forgot Password Journey @api:auth @priority:medium', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(`${BASE_URL}/auth/forgot-password`);
  });

  test('forgot password heading is visible', async ({ page }) => {
    await expect(page.getByRole('heading', { name: /Recover Your Account Access/i })).toBeVisible();
  });

  test('reset form controls are visible', async ({ page }) => {
    await expect(page.getByPlaceholder('m@example.com')).toBeVisible();
    await expect(page.getByRole('button', { name: /Send Reset Instructions/i })).toBeVisible();
  });

  test('reset submit with sample email does not crash', async ({ page }) => {
    await page.getByPlaceholder('m@example.com').fill('user@example.com');
    await page.getByRole('button', { name: /Send Reset Instructions/i }).click();
    await expect(page).toHaveURL(/blockpeer\.finance/);
  });

  test('sign in link navigates back to signin', async ({ page }) => {
    await page.getByRole('link', { name: 'Sign in' }).click();
    await expect(page).toHaveURL(`${BASE_URL}/auth/signin`);
  });
});

test.describe('Blockpeer Cross Auth Navigation @api:navigation @priority:medium', () => {
  test('logo from signin returns to signin', async ({ page }) => {
    await page.goto(`${BASE_URL}/auth/signin`);
    await page.getByRole('link', { name: /BlockPeer Logo/i }).click();
    await expect(page).toHaveURL(`${BASE_URL}/auth/signin`);
  });

  test('logo from signup redirects to signin via root', async ({ page }) => {
    await page.goto(`${BASE_URL}/auth/signup`);
    await page.getByRole('link', { name: /BlockPeer Logo/i }).click();
    await expect(page).toHaveURL(`${BASE_URL}/auth/signin`);
  });
});
