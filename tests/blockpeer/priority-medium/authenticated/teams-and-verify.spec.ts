import { test, expect } from '@playwright/test';
import { skipIfCorporateOnboardingLocksApp } from '../../helpers/skip-if-onboarding-locked';

test.describe('Manage Teams page @api:teams @priority:medium', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/teams');
    await page.waitForLoadState('networkidle');
    await skipIfCorporateOnboardingLocksApp(page);
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

test.describe('Verify and Endorse Document page @api:verify-endorse @priority:medium', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/verify-and-endorse-document');
    await page.waitForLoadState('networkidle');
    await skipIfCorporateOnboardingLocksApp(page);
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

  test('page renders body', async ({ page }) => {
    await expect(page.locator('body')).toBeVisible();
  });
});
