import { test, type Page } from '@playwright/test';

/**
 * eTrade / Blockpeer staging may keep the app behind corporate onboarding until
 * company settings are completed. Skip tests that assume the full shell is reachable.
 *
 * `networkidle` can resolve before the SPA paints the gate; wait briefly then poll.
 */
export async function skipIfCorporateOnboardingLocksApp(page: Page): Promise<void> {
  const gate = page.getByRole('heading', { name: /Finish your workspace setup/i });
  const probablyInApp = page
    .getByRole('link', { name: 'Overview' })
    .or(page.getByRole('heading', { name: /Hi,.*👋/i }))
    .or(page.getByRole('heading', { name: /Please connect your wallet/i }))
    .or(page.getByRole('heading', { name: 'Contact book' }))
    .or(page.getByRole('heading', { name: 'Manage Teams' }))
    .or(page.getByRole('heading', { name: /Upload Document for Verification/i }))
    .or(page.getByRole('heading', { name: 'Setting Menu' }));

  for (let i = 0; i < 24; i++) {
    if (await gate.isVisible().catch(() => false)) {
      test.skip(
        true,
        'Corporate onboarding is incomplete — routes are gated until workspace setup finishes.',
      );
      return;
    }
    if (await probablyInApp.first().isVisible().catch(() => false))
      return;
    await page.waitForTimeout(250);
  }
}
