import { test, expect } from '@playwright/test';
import { skipIfCorporateOnboardingLocksApp } from '../../helpers/skip-if-onboarding-locked';

test.describe('Contacts page @api:contacts @priority:high', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/contacts');
    await page.waitForLoadState('networkidle');
    await skipIfCorporateOnboardingLocksApp(page);
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

  test('contacts table has header row', async ({ page }) => {
    await expect(page.locator('table thead')).toBeVisible();
  });

  test('contacts table shows at least header or data rows', async ({ page }) => {
    const rows = page.locator('table tbody tr');
    const count = await rows.count();
    if (count > 0)
      await expect(rows.first()).toBeVisible();
    else
      await expect(page.getByRole('table')).toBeVisible();
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

  test('clearing search restores placeholder visibility', async ({ page }) => {
    const search = page.getByPlaceholder('Search contacts...');
    await search.fill('x');
    await search.clear();
    await expect(search).toHaveValue('');
  });
});
