import { test, expect } from '@playwright/test';

const BASE_URL = 'https://playwright.dev';

// ─────────────────────────────────────────────
// 1. HOME PAGE
// ─────────────────────────────────────────────
test.describe('Home Page', () => {
  test('has correct title', async ({ page }) => {
    await page.goto(BASE_URL);
    await expect(page).toHaveTitle(/Playwright/);
  });

  test('hero heading is visible', async ({ page }) => {
    await page.goto(BASE_URL);
    const heading = page.getByRole('heading', { name: /Playwright enables reliable/i });
    await expect(heading).toBeVisible();
  });

  test('Get started button is present and navigates', async ({ page }) => {
    await page.goto(BASE_URL);
    const btn = page.getByRole('link', { name: /get started/i }).first();
    await expect(btn).toBeVisible();
    await btn.click();
    await expect(page).toHaveURL(/\/docs\//);
  });

  test('navbar logo links back to home', async ({ page }) => {
    await page.goto(`${BASE_URL}/docs/intro`);
    const logo = page.getByRole('link', { name: /playwright/i }).first();
    await logo.click();
    await expect(page).toHaveURL(new RegExp(`^${BASE_URL}/?$`));
  });
});

// ─────────────────────────────────────────────
// 2. NAVIGATION / HEADER
// ─────────────────────────────────────────────
test.describe('Navigation', () => {
  test('Docs link is in the navbar', async ({ page }) => {
    await page.goto(BASE_URL);
    const docsLink = page.getByRole('link', { name: /^docs$/i }).first();
    await expect(docsLink).toBeVisible();
  });

  test('API link is in the navbar', async ({ page }) => {
    await page.goto(BASE_URL);
    const apiLink = page.getByRole('link', { name: /^api$/i }).first();
    await expect(apiLink).toBeVisible();
  });

  test('GitHub link is present', async ({ page }) => {
    await page.goto(BASE_URL);
    const ghLink = page.getByRole('link', { name: /github/i }).first();
    await expect(ghLink).toBeVisible();
    await expect(ghLink).toHaveAttribute('href', /github\.com/);
  });
});

// ─────────────────────────────────────────────
// 3. DOCS INTRO PAGE
// ─────────────────────────────────────────────
test.describe('Docs – Intro', () => {
  test('loads /docs/intro', async ({ page }) => {
    await page.goto(`${BASE_URL}/docs/intro`);
    await expect(page).toHaveURL(/\/docs\/intro/);
  });

  test('page has "Installation" heading', async ({ page }) => {
    await page.goto(`${BASE_URL}/docs/intro`);
    await expect(page.getByRole('heading', { name: /installation/i })).toBeVisible();
  });

  test('sidebar is visible', async ({ page }) => {
    await page.goto(`${BASE_URL}/docs/intro`);
    // Use the desktop sidebar nav; exclude mobile backdrop overlay
    const sidebar = page.locator('nav.theme-doc-sidebar-menu, aside.theme-doc-sidebar-container').first();
    await expect(sidebar).toBeVisible();
  });

  test('"Writing tests" link exists in sidebar', async ({ page }) => {
    await page.goto(`${BASE_URL}/docs/intro`);
    const link = page.getByRole('link', { name: /writing tests/i }).first();
    await expect(link).toBeVisible();
  });
});

// ─────────────────────────────────────────────
// 4. API REFERENCE PAGE
// ─────────────────────────────────────────────
test.describe('API Reference', () => {
  test('loads /docs/api/class-playwright', async ({ page }) => {
    await page.goto(`${BASE_URL}/docs/api/class-playwright`);
    await expect(page).toHaveURL(/class-playwright/);
  });

  test('has Playwright class heading', async ({ page }) => {
    await page.goto(`${BASE_URL}/docs/api/class-playwright`);
    await expect(page.getByRole('heading', { name: /playwright/i }).first()).toBeVisible();
  });
});

// ─────────────────────────────────────────────
// 5. SEARCH
// ─────────────────────────────────────────────
test.describe('Search', () => {
  test('search button / input is present on home', async ({ page }) => {
    await page.goto(BASE_URL);
    // Docusaurus search – either a button or an input
    const searchTrigger = page.locator(
      'button[class*="search"], input[placeholder*="Search"], [aria-label*="search" i]'
    ).first();
    await expect(searchTrigger).toBeVisible();
  });

  test('search opens dialog on docs page', async ({ page }) => {
    await page.goto(`${BASE_URL}/docs/intro`);
    const searchTrigger = page.locator(
      'button[class*="search"], [aria-label*="search" i]'
    ).first();
    await searchTrigger.click();
    // Some kind of modal / input should appear
    const searchInput = page.locator('input[type="search"], input[placeholder*="search" i]').first();
    await expect(searchInput).toBeVisible({ timeout: 5000 });
  });
});

// ─────────────────────────────────────────────
// 6. COMMUNITY / FOOTER
// ─────────────────────────────────────────────
test.describe('Footer & Community', () => {
  test('footer is rendered on home page', async ({ page }) => {
    await page.goto(BASE_URL);
    const footer = page.locator('footer');
    await expect(footer).toBeVisible();
  });

  test('footer contains copyright text', async ({ page }) => {
    await page.goto(BASE_URL);
    const footer = page.locator('footer');
    await expect(footer).toContainText(/Microsoft/i);
  });

  test('Discord community link exists', async ({ page }) => {
    await page.goto(BASE_URL);
    const discordLink = page.getByRole('link', { name: /discord/i }).first();
    await expect(discordLink).toBeVisible();
  });
});

// ─────────────────────────────────────────────
// 7. WRITING TESTS DOC
// ─────────────────────────────────────────────
test.describe('Docs – Writing Tests', () => {
  test('loads /docs/writing-tests', async ({ page }) => {
    await page.goto(`${BASE_URL}/docs/writing-tests`);
    await expect(page).toHaveURL(/writing-tests/);
  });

  test('has "Writing Tests" heading', async ({ page }) => {
    await page.goto(`${BASE_URL}/docs/writing-tests`);
    await expect(page.getByRole('heading', { name: /writing tests/i }).first()).toBeVisible();
  });

  test('code block is present', async ({ page }) => {
    await page.goto(`${BASE_URL}/docs/writing-tests`);
    const codeBlock = page.locator('pre code').first();
    await expect(codeBlock).toBeVisible();
  });
});

// ─────────────────────────────────────────────
// 8. BROWSER SUPPORT
// ─────────────────────────────────────────────
test.describe('Browser Support info', () => {
  test('Chromium mention exists on home page', async ({ page }) => {
    await page.goto(BASE_URL);
    await expect(page.getByText(/chromium/i).first()).toBeVisible();
  });

  test('Firefox mention exists on home page', async ({ page }) => {
    await page.goto(BASE_URL);
    await expect(page.getByText(/firefox/i).first()).toBeVisible();
  });

  test('WebKit mention exists on home page', async ({ page }) => {
    await page.goto(BASE_URL);
    await expect(page.getByText(/webkit/i).first()).toBeVisible();
  });
});

// ─────────────────────────────────────────────
// 9. RESPONSIVENESS (mobile viewport)
// ─────────────────────────────────────────────
test.describe('Mobile Viewport', () => {
  test.use({ viewport: { width: 375, height: 812 } });

  test('home page renders on mobile', async ({ page }) => {
    await page.goto(BASE_URL);
    await expect(page).toHaveTitle(/Playwright/);
  });

  test('mobile hamburger menu exists', async ({ page }) => {
    await page.goto(BASE_URL);
    const hamburger = page.locator(
      'button[aria-label*="menu" i], button[class*="hamburger"], button[class*="toggle"]'
    ).first();
    await expect(hamburger).toBeVisible();
  });
});

// ─────────────────────────────────────────────
// 10. PAGE META / SEO
// ─────────────────────────────────────────────
test.describe('SEO & Meta', () => {
  test('home page has meta description', async ({ page }) => {
    await page.goto(BASE_URL);
    const meta = page.locator('meta[name="description"]');
    await expect(meta).toHaveAttribute('content', /.+/);
  });

  test('docs page has canonical link', async ({ page }) => {
    await page.goto(`${BASE_URL}/docs/intro`);
    const canonical = page.locator('link[rel="canonical"]');
    await expect(canonical).toHaveAttribute('href', /.+/);
  });
});
