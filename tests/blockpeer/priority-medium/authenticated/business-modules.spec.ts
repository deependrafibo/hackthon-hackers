import { test, expect } from '@playwright/test';

const BASE_URL = process.env.BLOCKPEER_BASE_URL || process.env.BASE_URL || 'https://staging-react.blockpeer.finance/';

test.describe('Blockpeer Module Navigation @api:navigation @priority:medium', () => {
  const navTargets = [
    { name: 'Wallets', url: '/wallet' },
    { name: 'Bank ePresentations', url: '/bank-e-presentations' },
    { name: 'Contact book', url: '/contacts' },
    { name: 'Manage Teams', url: '/teams' },
    { name: 'Verify and Endorse', url: '/verify-and-endorse-document' },
    { name: 'Settings', url: '/settings' },
  ];

  for (const target of navTargets) {
    test(`sidebar link "${target.name}" navigates to ${target.url}`, async ({ page }) => {
      await page.goto(BASE_URL);
      await page.waitForLoadState('networkidle');
      await page.getByRole('link', { name: target.name }).click();
      await expect(page).toHaveURL(new RegExp(target.url));
    });
  }
});

test.describe('Blockpeer Wallet and Banking Modules @api:wallet @priority:medium', () => {
  test('wallet page loads with wallet CTA', async ({ page }) => {
    await page.goto(`${BASE_URL}wallet`);
    await page.waitForLoadState('networkidle');
    await expect(page.getByRole('button', { name: /Connect.*Wallet/i })).toBeVisible();
  });

  test('bank epresentations page renders base state', async ({ page }) => {
    await page.goto(`${BASE_URL}bank-e-presentations`);
    await page.waitForLoadState('networkidle');
    await expect(page.locator('body')).toBeVisible();
  });

  test('bills of exchange route resolves to issue sub-route', async ({ page }) => {
    await page.goto(`${BASE_URL}bills-of-exchange`);
    await page.waitForLoadState('networkidle');
    await expect(page).toHaveURL(/\/bills-of-exchange\/issue/);
  });
});

test.describe('Blockpeer Collaboration Modules @api:teams @priority:medium', () => {
  test('contacts page has create contact action', async ({ page }) => {
    await page.goto(`${BASE_URL}contacts`);
    await page.waitForLoadState('networkidle');
    await expect(page.getByRole('button', { name: /Create contact/i })).toBeVisible();
  });

  test('teams page has create team action', async ({ page }) => {
    await page.goto(`${BASE_URL}teams`);
    await page.waitForLoadState('networkidle');
    await expect(page.getByRole('button', { name: 'Create Team' })).toBeVisible();
  });

  test('verify and endorse page has upload heading', async ({ page }) => {
    await page.goto(`${BASE_URL}verify-and-endorse-document`);
    await page.waitForLoadState('networkidle');
    await expect(page.getByRole('heading', { name: /Upload Document for Verification/i })).toBeVisible();
  });
});

test.describe('Blockpeer Settings @api:settings @priority:medium', () => {
  test('settings menu renders company settings defaults', async ({ page }) => {
    await page.goto(`${BASE_URL}settings`);
    await page.waitForLoadState('networkidle');
    await expect(page).toHaveURL(/\/settings\/company-settings/);
    await expect(page.getByRole('heading', { name: 'Setting Menu' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Company Settings' })).toBeVisible();
  });

  test('email notifications tab route is reachable', async ({ page }) => {
    await page.goto(`${BASE_URL}settings`);
    await page.waitForLoadState('networkidle');
    await page.getByRole('button', { name: 'Email Notifications' }).click();
    await expect(page).toHaveURL(/\/settings\/email-settings/);
  });

  test('email configuration tab route is reachable', async ({ page }) => {
    await page.goto(`${BASE_URL}settings`);
    await page.waitForLoadState('networkidle');
    await page.getByRole('button', { name: 'Email Configuration' }).click();
    await expect(page).toHaveURL(/\/settings\/email-configuration/);
  });
});
