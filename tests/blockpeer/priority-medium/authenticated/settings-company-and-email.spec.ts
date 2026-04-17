import { test, expect } from '@playwright/test';
import { skipIfCorporateOnboardingLocksApp } from '../../helpers/skip-if-onboarding-locked';

test.describe('Settings — Company Settings @api:settings @priority:medium', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/settings');
    await page.waitForLoadState('networkidle');
    await skipIfCorporateOnboardingLocksApp(page);
  });

  test('redirects to /settings/company-settings', async ({ page }) => {
    await expect(page).toHaveURL(/\/settings\/company-settings/);
  });

  test('heading "Setting Menu" is visible', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Setting Menu' })).toBeVisible();
  });

  test('heading "Company Settings" is visible', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Company Settings' })).toBeVisible();
  });

  test('company settings form has expected fields', async ({ page }) => {
    const names = [
      'companyName',
      'address',
      'country',
      'state',
      'city',
      'zipCode',
      'telephone',
      'registrationNumber',
      'systemEmail',
    ];
    for (const name of names) {
      await expect(page.locator(`input[name="${name}"]`)).toBeVisible();
    }
  });

  test('"Save Changes" button is visible', async ({ page }) => {
    await expect(page.getByRole('button', { name: 'Save Changes' })).toBeVisible();
  });

  test('"Choose file" button is visible for logo upload', async ({ page }) => {
    await expect(page.getByRole('button', { name: 'Choose file' })).toBeVisible();
  });

  test('settings menu has Company, Email Notifications, and Email Configuration tabs', async ({ page }) => {
    await expect(page.getByRole('button', { name: 'Company Settings' }).first()).toBeVisible();
    await expect(page.getByRole('button', { name: 'Email Notifications' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Email Configuration' })).toBeVisible();
  });
});

test.describe('Settings — Email Notifications @api:settings @priority:medium', () => {
  test('navigating to Email Notifications tab works', async ({ page }) => {
    await page.goto('/settings');
    await page.waitForLoadState('networkidle');
    await skipIfCorporateOnboardingLocksApp(page);
    await page.getByRole('button', { name: 'Email Notifications' }).click();
    await expect(page).toHaveURL(/\/settings\/email-settings/);
    await expect(page.getByRole('heading', { name: /Email Notification Settings/i })).toBeVisible();
  });
});

test.describe('Settings — Email Configuration @api:settings @priority:medium', () => {
  test('navigating to Email Configuration tab works', async ({ page }) => {
    await page.goto('/settings');
    await page.waitForLoadState('networkidle');
    await skipIfCorporateOnboardingLocksApp(page);
    await page.getByRole('button', { name: 'Email Configuration' }).click();
    await expect(page).toHaveURL(/\/settings\/email-configuration/);
    await expect(page.getByRole('heading', { name: 'Setting Menu' })).toBeVisible();
  });
});
