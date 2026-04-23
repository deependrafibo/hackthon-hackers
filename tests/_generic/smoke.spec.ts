import { test, expect } from '@playwright/test';

/**
 * Generic smoke tests that run against every discovered site.
 * These use Playwright's built-in baseURL from the project config,
 * so they work automatically for any site added to .env.
 */

test.describe('Smoke tests @api:core @priority:high', () => {
  test('home page loads with HTTP 200', async ({ page, baseURL }) => {
    const response = await page.goto(baseURL || '/');
    expect(response?.ok()).toBeTruthy();
  });

  test('page has a non-empty title', async ({ page, baseURL }) => {
    await page.goto(baseURL || '/');
    const title = await page.title();
    expect(title.length).toBeGreaterThan(0);
  });

  test('page body renders without crash', async ({ page, baseURL }) => {
    await page.goto(baseURL || '/');
    await expect(page.locator('body')).toBeVisible();
  });

  test('no uncaught JS errors on load', async ({ page, baseURL }) => {
    const errors: string[] = [];
    page.on('pageerror', (err) => errors.push(err.message));
    await page.goto(baseURL || '/');
    await page.waitForLoadState('domcontentloaded');
    expect(errors).toEqual([]);
  });
});

test.describe('Navigation baseline @api:navigation @priority:medium', () => {
  test('page has at least one link', async ({ page, baseURL }) => {
    await page.goto(baseURL || '/');
    const linkCount = await page.locator('a[href]').count();
    expect(linkCount).toBeGreaterThan(0);
  });

  test('page has at least one interactive element', async ({ page, baseURL }) => {
    await page.goto(baseURL || '/');
    const buttonCount = await page.locator('button, a, input, select, textarea').count();
    expect(buttonCount).toBeGreaterThan(0);
  });
});

test.describe('Accessibility baseline @api:accessibility @priority:low', () => {
  test('page has a lang attribute on html tag', async ({ page, baseURL }) => {
    await page.goto(baseURL || '/');
    const lang = await page.locator('html').getAttribute('lang');
    expect(lang).toBeTruthy();
  });

  test('images have alt attributes', async ({ page, baseURL }) => {
    await page.goto(baseURL || '/');
    const images = page.locator('img');
    const count = await images.count();
    for (let i = 0; i < count; i++) {
      const alt = await images.nth(i).getAttribute('alt');
      expect(alt).not.toBeNull();
    }
  });
});
