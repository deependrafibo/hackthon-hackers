import { test, expect } from '@playwright/test';
import { skipIfCorporateOnboardingLocksApp } from '../../helpers/skip-if-onboarding-locked';

test.describe('Wallet page @api:wallet @priority:medium', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/wallet');
    await page.waitForLoadState('networkidle');
    await skipIfCorporateOnboardingLocksApp(page);
  });

  test('shows connect wallet guidance heading', async ({ page }) => {
    await expect(page.getByRole('heading', { name: /Please connect your wallet/i })).toBeVisible();
  });

  test('"Connect Wallet" button is available', async ({ page }) => {
    await expect(page.getByRole('button', { name: /Connect.*Wallet/i })).toBeVisible();
  });

  test('page renders body', async ({ page }) => {
    await expect(page.locator('body')).toBeVisible();
  });
});

test.describe('Bank ePresentations page @api:bank-epresentations @priority:medium', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/bank-e-presentations');
    await page.waitForLoadState('networkidle');
    await skipIfCorporateOnboardingLocksApp(page);
  });

  test('shows connect wallet guidance heading', async ({ page }) => {
    await expect(page.getByRole('heading', { name: /Please connect your wallet/i })).toBeVisible();
  });

  test('page renders body', async ({ page }) => {
    await expect(page.locator('body')).toBeVisible();
  });
});

test.describe('Bills of Exchange page @api:bills-of-exchange @priority:medium', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/bills-of-exchange');
    await page.waitForLoadState('networkidle');
    await skipIfCorporateOnboardingLocksApp(page);
  });

  test('redirects to /bills-of-exchange/issue sub-route', async ({ page }) => {
    await expect(page).toHaveURL(/\/bills-of-exchange\/issue/);
  });

  test('shows connect wallet guidance heading', async ({ page }) => {
    await expect(page.getByRole('heading', { name: /Please connect your wallet/i })).toBeVisible();
  });

  test('page renders body', async ({ page }) => {
    await expect(page.locator('body')).toBeVisible();
  });
});
