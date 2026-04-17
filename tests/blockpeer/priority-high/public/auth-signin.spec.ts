import { test, expect } from '@playwright/test';

test.describe('Login Page @api:auth @priority:high', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/auth/signin');
  });

  test('page title is "Blockpeer Finance"', async ({ page }) => {
    await expect(page).toHaveTitle('Blockpeer Finance');
  });

  test('root URL redirects to a public auth route', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveURL(/\/auth\/(signin|signup)/);
  });

  test('login heading is visible', async ({ page }) => {
    await expect(
      page.getByRole('heading', { name: /Login to Your Unified Finance/i }),
    ).toBeVisible();
  });

  test('logo is visible and links to home', async ({ page }) => {
    const logo = page.getByRole('link', { name: /BlockPeer Logo/i });
    await expect(logo).toBeVisible();
    await expect(logo).toHaveAttribute('href', '/');
  });

  test('email input is present and accepts input', async ({ page }) => {
    const email = page.getByPlaceholder('m@example.com');
    await expect(email).toBeVisible();
    await email.fill('test@example.com');
    await expect(email).toHaveValue('test@example.com');
  });

  test('password input is present and masked by default', async ({ page }) => {
    const password = page.getByPlaceholder('**********');
    await expect(password).toBeVisible();
    await expect(password).toHaveAttribute('type', 'password');
  });

  test('password visibility toggle works', async ({ page }) => {
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

  test('"Keep me signed in" checkbox is present and toggleable', async ({ page }) => {
    const checkbox = page.getByRole('checkbox', { name: /Keep me signed in/i });
    await expect(checkbox).toBeVisible();
    await expect(checkbox).not.toBeChecked();
    await checkbox.click();
    await expect(checkbox).toBeChecked();
  });

  test('Sign In button is visible', async ({ page }) => {
    await expect(page.getByRole('button', { name: 'Sign In' })).toBeVisible();
  });

  test('Sign In with empty form shows validation — stays on sign-in', async ({ page }) => {
    await page.getByRole('button', { name: 'Sign In' }).click();
    await expect(page).toHaveURL(/\/auth\/signin/);
  });

  test('Sign In with invalid email stays on page', async ({ page }) => {
    await page.getByPlaceholder('m@example.com').fill('not-an-email');
    await page.getByPlaceholder('**********').fill('password123');
    await page.getByRole('button', { name: 'Sign In' }).click();
    await expect(page).toHaveURL(/\/auth\/signin/);
  });

  test('"Forgot your password?" link navigates to forgot-password page', async ({ page }) => {
    await page.getByRole('link', { name: /Forgot your password/i }).click();
    await expect(page).toHaveURL(/\/auth\/forgot-password/);
  });

  test('"Create Account" link navigates to signup page', async ({ page }) => {
    await page.getByRole('link', { name: 'Create Account' }).click();
    await expect(page).toHaveURL(/\/auth\/signup/);
  });
});
