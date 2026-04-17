import { test, expect } from '@playwright/test';
import { skipIfCorporateOnboardingLocksApp } from '../../helpers/skip-if-onboarding-locked';

test.describe('Dashboard @api:dashboard @priority:high', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    await skipIfCorporateOnboardingLocksApp(page);
  });

  test('authenticated user is NOT redirected to signin', async ({ page }) => {
    await expect(page).not.toHaveURL(/\/auth\/signin/);
  });

  test('page title is "Blockpeer Finance"', async ({ page }) => {
    await expect(page).toHaveTitle('Blockpeer Finance');
  });

  test('greeting heading shows the logged-in user', async ({ page }) => {
    await expect(page.getByRole('heading', { name: /Hi,.*👋/i })).toBeVisible();
  });

  test('"Connect Wallet" button is visible', async ({ page }) => {
    await expect(page.getByRole('button', { name: /Connect.*Wallet/i })).toBeVisible();
  });
});

test.describe('Sidebar navigation @api:navigation @priority:high', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    await skipIfCorporateOnboardingLocksApp(page);
  });

  test('sidebar contains all expected nav links', async ({ page }) => {
    const expectedLinks = [
      { name: 'Overview', href: '/' },
      { name: 'Wallets', href: '/wallet' },
      { name: 'Bank ePresentations', href: '/bank-e-presentations' },
      { name: 'Bills of Exchange', href: '/bills-of-exchange' },
      { name: 'Contact book', href: '/contacts' },
      { name: 'Manage Teams', href: '/teams' },
      { name: 'Verify and Endorse', href: '/verify-and-endorse-document' },
      { name: 'Settings', href: '/settings' },
    ];

    for (const link of expectedLinks) {
      const el = page.getByRole('link', { name: link.name });
      await expect(el).toBeVisible();
      await expect(el).toHaveAttribute('href', link.href);
    }
  });

  test('"Toggle Sidebar" button works', async ({ page }) => {
    const toggle = page.locator('button[data-sidebar="trigger"]');
    await expect(toggle).toBeVisible();
    await toggle.click();
    await expect(toggle).toBeVisible();
  });

  test('sidebar has footer links: Terms of Service and Privacy Policy', async ({ page }) => {
    await expect(page.getByRole('link', { name: 'Terms of Service' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Privacy Policy' })).toBeVisible();
  });

  test('"Transferable Documents" expandable section is in sidebar', async ({ page }) => {
    await expect(page.getByRole('button', { name: 'Transferable Documents' })).toBeVisible();
  });

  test('"Email" expandable section is in sidebar', async ({ page }) => {
    await expect(page.getByRole('button', { name: 'Email' })).toBeVisible();
  });
});
