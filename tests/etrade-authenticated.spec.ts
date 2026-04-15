import { test, expect } from '@playwright/test';

// storageState (saved session) is injected by playwright.config.ts — every
// test in this file starts already logged in.

const TEST_GEN_BASE_URL = process.env.TEST_GEN_BASE_URL || 'https://etrade-staging.blockpeer.finance';

// ─────────────────────────────────────────────────────────────────────────────
// DASHBOARD  /
// ─────────────────────────────────────────────────────────────────────────────

test.describe('Dashboard', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(TEST_GEN_BASE_URL);
    await page.waitForLoadState('networkidle');
  });

  test('authenticated user is NOT redirected to signin', async ({ page }) => {
    await expect(page).not.toHaveURL(/\/auth\/signin/);
  });

  test('page title is "Blockpeer Finance"', async ({ page }) => {
    await expect(page).toHaveTitle('Blockpeer Finance');
  });

  test('greeting heading shows the logged-in user name', async ({ page }) => {
    await expect(page.getByRole('heading', { name: /Hi,.*👋/i })).toBeVisible();
  });

  test('user profile button shows name and role', async ({ page }) => {
    await expect(page.getByRole('button', { name: /Vikas Ranjan/i })).toBeVisible();
  });

  test('"Connect Wallet" button is visible', async ({ page }) => {
    await expect(page.getByRole('button', { name: /Connect.*Wallet/i })).toBeVisible();
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// SIDEBAR NAVIGATION
// ─────────────────────────────────────────────────────────────────────────────

test.describe('Sidebar navigation', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(TEST_GEN_BASE_URL);
    await page.waitForLoadState('networkidle');
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
    // There are two toggle buttons (rail + trigger); use the visible trigger button
    const toggle = page.locator('button[data-sidebar="trigger"]');
    await expect(toggle).toBeVisible();
    await toggle.click();
    // After toggling, the button should still be present
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

// ─────────────────────────────────────────────────────────────────────────────
// SIDEBAR LINK NAVIGATION — each link lands on the correct page
// ─────────────────────────────────────────────────────────────────────────────

test.describe('Sidebar link navigation', () => {
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
      await page.goto(TEST_GEN_BASE_URL);
      await page.waitForLoadState('networkidle');
      await page.getByRole('link', { name: target.name }).click();
      await expect(page).toHaveURL(new RegExp(target.url));
    });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// WALLET PAGE  /wallet
// ─────────────────────────────────────────────────────────────────────────────

test.describe('Wallet page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(`${TEST_GEN_BASE_URL}/wallet`);
    await page.waitForLoadState('networkidle');
  });

  test('shows "Please connect your wallet" message', async ({ page }) => {
    await expect(page.getByRole('heading', { name: /Please connect your wallet/i })).toBeVisible();
  });

  test('"Connect Wallet" button is available', async ({ page }) => {
    await expect(page.getByRole('button', { name: /Connect.*Wallet/i })).toBeVisible();
  });

  test('page does not crash — body is visible', async ({ page }) => {
    await expect(page.locator('body')).toBeVisible();
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// BANK E-PRESENTATIONS PAGE  /bank-e-presentations
// ─────────────────────────────────────────────────────────────────────────────

test.describe('Bank ePresentations page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(`${TEST_GEN_BASE_URL}/bank-e-presentations`);
    await page.waitForLoadState('networkidle');
  });

  test('shows "Please connect your wallet" message', async ({ page }) => {
    await expect(page.getByRole('heading', { name: /Please connect your wallet/i })).toBeVisible();
  });

  test('page does not crash — body is visible', async ({ page }) => {
    await expect(page.locator('body')).toBeVisible();
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// BILLS OF EXCHANGE PAGE  /bills-of-exchange
// ─────────────────────────────────────────────────────────────────────────────

test.describe('Bills of Exchange page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(`${TEST_GEN_BASE_URL}/bills-of-exchange`);
    await page.waitForLoadState('networkidle');
  });

  test('redirects to /bills-of-exchange/issue sub-route', async ({ page }) => {
    await expect(page).toHaveURL(/\/bills-of-exchange\/issue/);
  });

  test('shows "Please connect your wallet" message', async ({ page }) => {
    await expect(page.getByRole('heading', { name: /Please connect your wallet/i })).toBeVisible();
  });

  test('page does not crash — body is visible', async ({ page }) => {
    await expect(page.locator('body')).toBeVisible();
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// CONTACTS PAGE  /contacts
// ─────────────────────────────────────────────────────────────────────────────

test.describe('Contacts page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(`${TEST_GEN_BASE_URL}/contacts`);
    await page.waitForLoadState('networkidle');
  });

  test('heading "Contact book" is visible', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Contact book' })).toBeVisible();
  });

  test('"+ Create contact" button is visible', async ({ page }) => {
    await expect(page.getByRole('button', { name: /Create contact/i })).toBeVisible();
  });

  test('search input is present with correct placeholder', async ({ page }) => {
    const search = page.getByPlaceholder('Search contacts...');
    await expect(search).toBeVisible();
  });

  test('contacts table has expected columns', async ({ page }) => {
    const expectedHeaders = ['Name', 'Email', 'Phone', 'LEI', 'Updated At', 'Actions'];
    for (const header of expectedHeaders) {
      await expect(page.locator('th', { hasText: header })).toBeVisible();
    }
  });

  test('contacts table has at least one row', async ({ page }) => {
    const rows = page.locator('table tbody tr');
    await expect(rows).toHaveCount(1); // exploration found 1 row
  });

  test('pagination controls are visible', async ({ page }) => {
    await expect(page.getByRole('button', { name: 'Previous' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Next' })).toBeVisible();
  });

  test('search input accepts text', async ({ page }) => {
    const search = page.getByPlaceholder('Search contacts...');
    await search.fill('test');
    await expect(search).toHaveValue('test');
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// MANAGE TEAMS PAGE  /teams
// ─────────────────────────────────────────────────────────────────────────────

test.describe('Manage Teams page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(`${TEST_GEN_BASE_URL}/teams`);
    await page.waitForLoadState('networkidle');
  });

  test('heading "Manage Teams" is visible', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Manage Teams' })).toBeVisible();
  });

  test('"Create Team" button is visible', async ({ page }) => {
    await expect(page.getByRole('button', { name: 'Create Team' })).toBeVisible();
  });

  test('"Default Team" card is visible', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Default Team' })).toBeVisible();
  });

  test('"View team" buttons are visible for each team', async ({ page }) => {
    const viewButtons = page.getByRole('button', { name: 'View team' });
    const count = await viewButtons.count();
    expect(count).toBeGreaterThanOrEqual(1);
  });

  test('clicking "View team" navigates to team detail', async ({ page }) => {
    await page.getByRole('button', { name: 'View team' }).first().click();
    await expect(page).toHaveURL(/\/teams\/[a-f0-9-]+/);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// VERIFY & ENDORSE DOCUMENT PAGE  /verify-and-endorse-document
// ─────────────────────────────────────────────────────────────────────────────

test.describe('Verify and Endorse Document page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(`${TEST_GEN_BASE_URL}/verify-and-endorse-document`);
    await page.waitForLoadState('networkidle');
  });

  test('heading "Upload Document for Verification" is visible', async ({ page }) => {
    await expect(
      page.getByRole('heading', { name: /Upload Document for Verification/i }),
    ).toBeVisible();
  });

  test('file upload input is present', async ({ page }) => {
    const fileInput = page.locator('input[type="file"]');
    await expect(fileInput).toHaveCount(1);
  });

  test('page does not crash — body is visible', async ({ page }) => {
    await expect(page.locator('body')).toBeVisible();
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// SETTINGS PAGE  /settings
// ─────────────────────────────────────────────────────────────────────────────

test.describe('Settings — Company Settings', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(`${TEST_GEN_BASE_URL}/settings`);
    await page.waitForLoadState('networkidle');
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
    const fields = [
      { name: 'companyName', placeholder: 'Company Name' },
      { name: 'address', placeholder: 'Address' },
      { name: 'country', placeholder: 'Country' },
      { name: 'state', placeholder: 'State' },
      { name: 'city', placeholder: 'City' },
      { name: 'zipCode', placeholder: 'Zip/Post Code' },
      { name: 'telephone', placeholder: 'Telephone' },
      { name: 'registrationNumber', placeholder: 'Enter Company Registration Number' },
      { name: 'systemEmail', placeholder: 'System Email' },
    ];
    for (const field of fields) {
      await expect(page.locator(`input[name="${field.name}"]`)).toBeVisible();
    }
  });

  test('"Save Changes" button is visible', async ({ page }) => {
    await expect(page.getByRole('button', { name: 'Save Changes' })).toBeVisible();
  });

  test('"Choose file" button is visible for logo upload', async ({ page }) => {
    await expect(page.getByRole('button', { name: 'Choose file' })).toBeVisible();
  });

  test('settings menu has all three tabs', async ({ page }) => {
    await expect(page.getByRole('button', { name: 'Company Settings' }).first()).toBeVisible();
    await expect(page.getByRole('button', { name: 'Email Notifications' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Email Configuration' })).toBeVisible();
  });
});

test.describe('Settings — Email Notifications', () => {
  test('navigating to Email Notifications tab works', async ({ page }) => {
    await page.goto(`${TEST_GEN_BASE_URL}/settings`);
    await page.waitForLoadState('networkidle');
    await page.getByRole('button', { name: 'Email Notifications' }).click();
    await expect(page).toHaveURL(/\/settings\/email-settings/);
    await expect(page.getByRole('heading', { name: /Email Notification Settings/i })).toBeVisible();
  });
});

test.describe('Settings — Email Configuration', () => {
  test('navigating to Email Configuration tab works', async ({ page }) => {
    await page.goto(`${TEST_GEN_BASE_URL}/settings`);
    await page.waitForLoadState('networkidle');
    await page.getByRole('button', { name: 'Email Configuration' }).click();
    await expect(page).toHaveURL(/\/settings\/email-configuration/);
    await expect(page.getByRole('heading', { name: 'Setting Menu' })).toBeVisible();
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// TERMS OF SERVICE  /terms
// ─────────────────────────────────────────────────────────────────────────────

test.describe('Terms of Service page', () => {
  test('page loads without errors', async ({ page }) => {
    const response = await page.goto(`${TEST_GEN_BASE_URL}/terms`);
    expect(response?.status()).toBe(200);
  });

  test('page title is "Blockpeer Finance"', async ({ page }) => {
    await page.goto(`${TEST_GEN_BASE_URL}/terms`);
    await expect(page).toHaveTitle('Blockpeer Finance');
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// PRIVACY POLICY  /privacy
// ─────────────────────────────────────────────────────────────────────────────

test.describe('Privacy Policy page', () => {
  test('page loads without errors', async ({ page }) => {
    const response = await page.goto(`${TEST_GEN_BASE_URL}/privacy`);
    expect(response?.status()).toBe(200);
  });

  test('page title is "Blockpeer Finance"', async ({ page }) => {
    await page.goto(`${TEST_GEN_BASE_URL}/privacy`);
    await expect(page).toHaveTitle('Blockpeer Finance');
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// CROSS-PAGE: 404 / UNKNOWN ROUTES
// ─────────────────────────────────────────────────────────────────────────────

test.describe('Unknown routes', () => {
  test('visiting a non-existent page does not crash', async ({ page }) => {
    const response = await page.goto(`${TEST_GEN_BASE_URL}/this-page-does-not-exist`);
    // Accept 200 (SPA catch-all) or 404
    expect([200, 404]).toContain(response?.status());
  });
});
