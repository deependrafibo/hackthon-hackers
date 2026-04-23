import { test, expect } from '@playwright/test';

const BASE_URL = (process.env.BLOCKPEER_BASE_URL || process.env.BASE_URL || 'https://staging-react.blockpeer.finance').replace(/\/+$/, '');

test.describe('Blockpeer Dashboard Critical @api:dashboard @priority:high', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(BASE_URL);
    await page.waitForLoadState('networkidle');
  });

  test('authenticated user is not redirected to signin', async ({ page }) => {
    await expect(page).not.toHaveURL(/\/auth\/signin/);
  });

  test('dashboard title is correct', async ({ page }) => {
    await expect(page).toHaveTitle('Blockpeer Finance');
  });

  test('greeting heading is visible', async ({ page }) => {
    await expect(page.getByRole('heading', { name: /Hi,.*👋/i })).toBeVisible();
  });

  test('user profile action is visible', async ({ page }) => {
    await expect(page.getByRole('button', { name: /Vikas Ranjan/i })).toBeVisible();
  });

  test('connect wallet CTA is visible', async ({ page }) => {
    await expect(page.getByRole('button', { name: /Connect.*Wallet/i })).toBeVisible();
  });
});

test.describe('Blockpeer Sidebar Critical @api:navigation @priority:high', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(BASE_URL);
    await page.waitForLoadState('networkidle');
  });

  test('sidebar renders primary nav links', async ({ page }) => {
    const expectedLinks = [
      'Overview',
      'Wallets',
      'Bank ePresentations',
      'Bills of Exchange',
      'Contact book',
      'Manage Teams',
      'Verify and Endorse',
      'Settings',
    ];
    for (const name of expectedLinks) {
      await expect(page.getByRole('link', { name })).toBeVisible();
    }
  });

  test('sidebar trigger button toggles', async ({ page }) => {
    const toggle = page.locator('button[data-sidebar="trigger"]');
    await expect(toggle).toBeVisible();
    await toggle.click();
    await expect(toggle).toBeVisible();
  });

  test('sidebar footer legal links are visible', async ({ page }) => {
    await expect(page.getByRole('link', { name: 'Terms of Service' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Privacy Policy' })).toBeVisible();
  });
});
