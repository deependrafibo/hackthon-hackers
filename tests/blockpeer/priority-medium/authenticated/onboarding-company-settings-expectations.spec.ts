import { test, expect } from '@playwright/test';

const WORKSPACE_SETUP_HEADING = /Finish your workspace setup/i;

test.describe('Onboarding company settings (expectation) @api:onboarding @priority:medium', () => {
  test('loads /onboarding/company-settings while authenticated', async ({ page }) => {
    await page.goto('/onboarding/company-settings');
    await expect(page).toHaveURL(/\/onboarding\/company-settings/);
  });

  test('shows primary heading "Finish your workspace setup"', async ({ page }) => {
    await page.goto('/onboarding/company-settings');
    const heading = page.getByRole('heading', { name: WORKSPACE_SETUP_HEADING });
    await expect(heading).toBeVisible({ timeout: 30000 });
  });

  test('workspace setup heading is in the document after network settles', async ({ page }) => {
    await page.goto('/onboarding/company-settings');
    await page.waitForLoadState('domcontentloaded');
    await expect(page.getByRole('heading', { name: WORKSPACE_SETUP_HEADING })).toBeVisible();
  });

  test('workspace setup heading survives a hard refresh', async ({ page }) => {
    await page.goto('/onboarding/company-settings');
    await expect(page.getByRole('heading', { name: WORKSPACE_SETUP_HEADING })).toBeVisible();
    await page.reload({ waitUntil: 'domcontentloaded' });
    await expect(page.getByRole('heading', { name: WORKSPACE_SETUP_HEADING })).toBeVisible({ timeout: 30000 });
  });

  test('workspace setup heading scrolls into view and remains visible', async ({ page }) => {
    await page.goto('/onboarding/company-settings');
    const heading = page.getByRole('heading', { name: WORKSPACE_SETUP_HEADING });
    await heading.scrollIntoViewIfNeeded();
    await expect(heading).toBeVisible();
  });
});
