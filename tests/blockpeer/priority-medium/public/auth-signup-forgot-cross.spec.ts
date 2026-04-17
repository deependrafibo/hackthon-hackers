import { test, expect } from '@playwright/test';

test.describe('Sign Up Page @api:auth @priority:medium', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/auth/signup');
  });

  test('page title is "Blockpeer Finance"', async ({ page }) => {
    await expect(page).toHaveTitle('Blockpeer Finance');
  });

  test('signup heading is visible', async ({ page }) => {
    await expect(
      page.getByRole('heading', { name: /Start Your Financial Journey Today/i }),
    ).toBeVisible();
  });

  test('logo is visible', async ({ page }) => {
    await expect(page.getByRole('link', { name: /BlockPeer Logo/i })).toBeVisible();
  });

  test('Full Name input is present', async ({ page }) => {
    const fullName = page.getByPlaceholder('John Doe');
    await expect(fullName).toBeVisible();
    await fullName.fill('Alice Smith');
    await expect(fullName).toHaveValue('Alice Smith');
  });

  test('Email input is present', async ({ page }) => {
    await expect(page.getByPlaceholder('example@gmail.com')).toBeVisible();
  });

  test('Password and Confirm Password inputs are present', async ({ page }) => {
    const inputs = page.locator('input[type="password"]');
    await expect(inputs).toHaveCount(2);
  });

  test('"Create Account" button is visible', async ({ page }) => {
    await expect(page.getByRole('button', { name: 'Create Account' })).toBeVisible();
  });

  test('"Sign Up with Google" button is visible', async ({ page }) => {
    await expect(page.getByRole('button', { name: /Sign Up with Google/i })).toBeVisible();
  });

  test('"Sign in" link navigates back to signin page', async ({ page }) => {
    await page.getByRole('link', { name: 'Sign in' }).click();
    await expect(page).toHaveURL(/\/auth\/signin/);
  });

  test('empty form submission stays on signup page', async ({ page }) => {
    await page.getByRole('button', { name: 'Create Account' }).click();
    await expect(page).toHaveURL(/\/auth\/signup/);
  });

  test('password visibility toggle works on signup', async ({ page }) => {
    const pwInput = page.locator('input[name="password"]');
    await pwInput.fill('Secret123');
    const clickToggle = () =>
      page.evaluate(() => {
        const input = document.querySelector('input[name="password"]') as HTMLInputElement;
        (input?.nextElementSibling as HTMLElement)?.click();
      });
    await clickToggle();
    await expect(pwInput).toHaveAttribute('type', 'text');
    await clickToggle();
    await expect(pwInput).toHaveAttribute('type', 'password');
  });
});

test.describe('Forgot Password Page @api:auth @priority:medium', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/auth/forgot-password');
  });

  test('page title is "Blockpeer Finance"', async ({ page }) => {
    await expect(page).toHaveTitle('Blockpeer Finance');
  });

  test('forgot-password heading is visible', async ({ page }) => {
    await expect(
      page.getByRole('heading', { name: /Recover Your Account Access/i }),
    ).toBeVisible();
  });

  test('"Forgot your password?" sub-heading text is visible', async ({ page }) => {
    await expect(page.getByText(/Forgot your password\?/)).toBeVisible();
  });

  test('email input is present', async ({ page }) => {
    await expect(page.getByPlaceholder('m@example.com')).toBeVisible();
  });

  test('"Send Reset Instructions" button is visible', async ({ page }) => {
    await expect(page.getByRole('button', { name: /Send Reset Instructions/i })).toBeVisible();
  });

  test('empty form submission stays on forgot-password page', async ({ page }) => {
    await page.getByRole('button', { name: /Send Reset Instructions/i }).click();
    await expect(page).toHaveURL(/\/auth\/forgot-password/);
  });

  test('"Sign in" link navigates back to signin page', async ({ page }) => {
    await page.getByRole('link', { name: 'Sign in' }).click();
    await expect(page).toHaveURL(/\/auth\/signin/);
  });

  test('email input accepts value and submit does not hard-crash', async ({ page }) => {
    await page.getByPlaceholder('m@example.com').fill('user@example.com');
    await page.getByRole('button', { name: /Send Reset Instructions/i }).click();
    await page.waitForLoadState('domcontentloaded');
    await expect(page.locator('body')).toBeVisible();
  });
});

test.describe('Cross-page navigation @api:navigation @priority:low', () => {
  test('logo on login page navigates to app root (auth landing)', async ({ page }) => {
    await page.goto('/auth/signin');
    await page.getByRole('link', { name: /BlockPeer Logo/i }).click();
    await expect(page).toHaveURL(/\/auth\/(signin|signup)/);
  });

  test('logo on signup page navigates to app root (auth landing)', async ({ page }) => {
    await page.goto('/auth/signup');
    await page.getByRole('link', { name: /BlockPeer Logo/i }).click();
    await expect(page).toHaveURL(/\/auth\/(signin|signup)/);
  });

  test('logo on forgot-password page navigates to app root (auth landing)', async ({ page }) => {
    await page.goto('/auth/forgot-password');
    await page.getByRole('link', { name: /BlockPeer Logo/i }).click();
    await expect(page).toHaveURL(/\/auth\/(signin|signup)/);
  });
});
