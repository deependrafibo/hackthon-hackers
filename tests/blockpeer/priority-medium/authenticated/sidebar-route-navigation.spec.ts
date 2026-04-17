import { test, expect } from '@playwright/test';
import { skipIfCorporateOnboardingLocksApp } from '../../helpers/skip-if-onboarding-locked';

test.describe('Sidebar link navigation @api:navigation @priority:medium', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    await skipIfCorporateOnboardingLocksApp(page);
  });

  const navTargets = [
    { name: 'Wallets', url: '/wallet' },
    { name: 'Bank ePresentations', url: '/bank-e-presentations' },
    { name: 'Contact book', url: '/contacts' },
    { name: 'Manage Teams', url: '/teams' },
    { name: 'Verify and Endorse', url: '/verify-and-endorse-document' },
    { name: 'Settings', url: '/settings' },
  ];

  for (const target of navTargets) {
    test(`clicking "${target.name}" navigates to ${target.url}`, async ({ page }) => {
      await page.getByRole('link', { name: target.name }).click();
      await expect(page).toHaveURL(new RegExp(target.url.replace(/\//g, '\\/')));
    });
  }
});
