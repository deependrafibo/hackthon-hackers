#!/usr/bin/env node
/**
 * Creates tests/<slug>/ with Blockpeer-style layout + auth.setup.ts for a custom Playwright suite.
 *
 *   node scripts/scaffold-test-suite.mjs my-product
 *
 * Slug: lowercase letters, digits, hyphens (e.g. my-app, acme2).
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, '..');

const slugRe = /^[a-z0-9][a-z0-9-]{0,62}$/;

function toEnvPrefix(slug) {
  return slug.replace(/-/g, '_').toUpperCase();
}

function writeAuthSetup(slug, destDir) {
  const P = toEnvPrefix(slug);
  const content = `import { test as setup, expect } from '@playwright/test';
import path from 'path';

/** Must match playwright.config.ts discovery: tests/${slug}/auth.setup.ts */
export const AUTH_FILE = path.join(__dirname, '../../.auth/${slug}-session.json');

function trim(v: string | undefined): string {
  return (v ?? '').trim();
}

function resolveBaseUrl(): string {
  const customKey = trim(process.env.AUTH_BASE_URL_ENV_KEY);
  if (customKey && trim(process.env[customKey]))
    return trim(process.env[customKey])!.replace(/\\/+$/, '');
  const fromSlug = trim(process.env['${P}_BASE_URL']);
  if (fromSlug)
    return fromSlug.replace(/\\/+$/, '');
  const raw = process.env.BASE_URL || '';
  return raw.replace(/\\/+$/, '');
}

function resolveEmail(): string {
  const k = trim(process.env.AUTH_EMAIL_ENV_KEY);
  if (k && trim(process.env[k]))
    return trim(process.env[k])!;
  return trim(process.env['${P}_EMAIL']) || trim(process.env.TEST_EMAIL) || '';
}

function resolvePassword(): string {
  const k = trim(process.env.AUTH_PASSWORD_ENV_KEY);
  if (k && trim(process.env[k]))
    return trim(process.env[k])!;
  return trim(process.env['${P}_PASSWORD']) || trim(process.env.TEST_PASSWORD) || '';
}

const EMAIL = resolveEmail();
const PASSWORD = resolvePassword();

setup('${slug} authenticate @api:auth @priority:high', async ({ page }) => {
  if (!EMAIL || !PASSWORD) {
    throw new Error(
      'Set ${P}_EMAIL / ${P}_PASSWORD in .env, or AUTH_EMAIL_ENV_KEY / AUTH_PASSWORD_ENV_KEY (see .env.example).',
    );
  }

  const BASE_URL = resolveBaseUrl();
  await page.goto(BASE_URL ? \`\${BASE_URL}/\` : '/');

  // TODO: replace with your app’s sign-in flow (see tests/blockpeer/auth.setup.ts for an example).
  const emailField = page.locator('input[type="email"], input[name="email"], input[placeholder*="mail" i]').first();
  const passwordField = page.locator('input[type="password"]').first();
  await expect(emailField).toBeVisible({ timeout: 20000 });
  await expect(passwordField).toBeVisible({ timeout: 20000 });
  await emailField.fill(EMAIL);
  await passwordField.fill(PASSWORD);
  const submit = page.getByRole('button', { name: /sign in|log in|login|submit/i }).first();
  if (await submit.count())
    await submit.click();
  else
    await passwordField.press('Enter');

  await expect(page).not.toHaveURL(/signin|login|auth/i, { timeout: 30000 });
  await page.context().storageState({ path: AUTH_FILE });
});
`;
  fs.writeFileSync(path.join(destDir, 'auth.setup.ts'), content, 'utf8');
}

function writeSmokeSpec(slug, destDir) {
  const content = `import { test, expect } from '@playwright/test';

test('smoke @api:navigation @priority:high', async ({ page }) => {
  await page.goto('/');
  await expect(page).toHaveURL(/.+/);
});
`;
  fs.writeFileSync(path.join(destDir, 'smoke.spec.ts'), content, 'utf8');
}

function ensurePriorityFolders(baseDir) {
  for (const priority of ['high', 'medium', 'low']) {
    fs.mkdirSync(path.join(baseDir, `priority-${priority}`, 'public'), { recursive: true });
    fs.mkdirSync(path.join(baseDir, `priority-${priority}`, 'authenticated'), { recursive: true });
  }
}

function main() {
  const slug = (process.argv[2] || '').trim().toLowerCase();
  if (!slug || !slugRe.test(slug)) {
    console.error('Usage: node scripts/scaffold-test-suite.mjs <slug>');
    console.error('Slug: lowercase letters, digits, hyphens (e.g. my-app)');
    process.exit(1);
  }
  if (slug === 'blockpeer' || slug === 'crickbox') {
    console.error('Use existing tests/blockpeer or tests/crickbox; pick another slug for a new product.');
    process.exit(1);
  }

  const base = path.join(repoRoot, 'tests', slug);
  if (fs.existsSync(base)) {
    console.error('Already exists:', path.relative(repoRoot, base));
    process.exit(1);
  }

  ensurePriorityFolders(base);
  const highPub = path.join(base, 'priority-high', 'public');
  writeAuthSetup(slug, base);
  writeSmokeSpec(slug, highPub);

  const P = toEnvPrefix(slug);
  console.log('Created:', path.relative(repoRoot, base));
  console.log('');
  console.log('Add to .env (values are examples):');
  console.log(`  ${P}_BASE_URL=https://your-staging.example.com/`);
  console.log(`  ${P}_EMAIL=you@example.com`);
  console.log(`  ${P}_PASSWORD=secret`);
  console.log(`  TEST_SITE=${slug}`);
  console.log('');
  console.log('Run this suite:');
  console.log(`  TEST_SITE=${slug} npx playwright test --project=${slug}-setup --project=${slug}-public --project=${slug}-authenticated`);
  console.log('');
  console.log('In scripts/prompts/AGENT_PROMPT.md set SUITE=' + slug + ' and matching *_ENV_KEY names.');
}

main();
