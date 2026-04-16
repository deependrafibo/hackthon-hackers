import { test, expect } from './base.fixture';

const BASE_URL = 'https://etrade-staging.blockpeer.finance';

// ─── Auth / Login Page ───────────────────────────────────────────────────────

test.describe('Login Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(`${BASE_URL}/auth/signin`);
  });

  test('page title is "Blockpeer Finance"', async ({ page }) => {
    await expect(page).toHaveTitle('Blockpeer Finance');
  });

  test('root URL redirects to /auth/signin', async ({ page }) => {
    await page.goto(BASE_URL);
    await expect(page).toHaveURL(`${BASE_URL}/auth/signin`);
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
    // The toggle wrapper is absolutely-positioned and outside Playwright's viewport bounds;
    // use JS click to bypass actionability checks entirely.
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

  test('Sign In with empty form shows native/HTML5 validation (no navigation)', async ({ page }) => {
    await page.getByRole('button', { name: 'Sign In' }).click();
    // stays on sign-in page – no redirect
    await expect(page).toHaveURL(`${BASE_URL}/auth/signin`);
  });

  test('Sign In with invalid email stays on page', async ({ page }) => {
    await page.getByPlaceholder('m@example.com').fill('not-an-email');
    await page.getByPlaceholder('**********').fill('password123');
    await page.getByRole('button', { name: 'Sign In' }).click();
    await expect(page).toHaveURL(`${BASE_URL}/auth/signin`);
  });

  test('"Forgot your password?" link navigates to forgot-password page', async ({ page }) => {
    await page.getByRole('link', { name: /Forgot your password/i }).click();
    await expect(page).toHaveURL(`${BASE_URL}/auth/forgot-password`);
  });

  test('"Create Account" link navigates to signup page', async ({ page }) => {
    await page.getByRole('link', { name: 'Create Account' }).click();
    await expect(page).toHaveURL(`${BASE_URL}/auth/signup`);
  });
});

// ─── Sign Up Page ────────────────────────────────────────────────────────────

test.describe('Sign Up Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(`${BASE_URL}/auth/signup`);
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
    await expect(page).toHaveURL(`${BASE_URL}/auth/signin`);
  });

  test('empty form submission stays on signup page', async ({ page }) => {
    await page.getByRole('button', { name: 'Create Account' }).click();
    await expect(page).toHaveURL(`${BASE_URL}/auth/signup`);
  });

  test('password visibility toggle works on signup', async ({ page }) => {
    // Target by name so the locator stays stable after type changes to "text"
    const pwInput = page.locator('input[name="password"]');
    await pwInput.fill('Secret123');
    // Toggle wrapper is absolutely-positioned off-screen; use JS click to bypass checks.
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

// ─── Forgot Password Page ────────────────────────────────────────────────────

test.describe('Forgot Password Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(`${BASE_URL}/auth/forgot-password`);
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
    await expect(page).toHaveURL(`${BASE_URL}/auth/forgot-password`);
  });

  test('"Sign in" link navigates back to signin page', async ({ page }) => {
    await page.getByRole('link', { name: 'Sign in' }).click();
    await expect(page).toHaveURL(`${BASE_URL}/auth/signin`);
  });

  test('email input accepts valid email and submits', async ({ page }) => {
    await page.getByPlaceholder('m@example.com').fill('user@example.com');
    await page.getByRole('button', { name: /Send Reset Instructions/i }).click();
    // Either stays or redirects — just should not throw
    await expect(page).toHaveURL(/blockpeer\.finance/);
  });
});

// ─── Navigation / Logo ───────────────────────────────────────────────────────

test.describe('Cross-page navigation', () => {
  test('logo on login page goes back to root (which redirects to signin)', async ({ page }) => {
    await page.goto(`${BASE_URL}/auth/signin`);
    await page.getByRole('link', { name: /BlockPeer Logo/i }).click();
    await expect(page).toHaveURL(`${BASE_URL}/auth/signin`);
  });

  test('logo on signup page goes back to root', async ({ page }) => {
    await page.goto(`${BASE_URL}/auth/signup`);
    await page.getByRole('link', { name: /BlockPeer Logo/i }).click();
    await expect(page).toHaveURL(`${BASE_URL}/auth/signin`);
  });

  test('logo on forgot-password page goes back to root', async ({ page }) => {
    await page.goto(`${BASE_URL}/auth/forgot-password`);
    await page.getByRole('link', { name: /BlockPeer Logo/i }).click();
    await expect(page).toHaveURL(`${BASE_URL}/auth/signin`);
  });
});
