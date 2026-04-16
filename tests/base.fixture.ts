import { test as base } from '@playwright/test';
import path from 'path';
import fs from 'fs';

/**
 * Extends the default Playwright `test` with an automatic afterEach hook that
 * saves artifacts into a clean folder structure:
 *
 *   test-results/<WEBSITE_NAME>/<project>/<Describe Group>/<test-name>.png
 *
 * e.g. test-results/Etrade/public/Login-Page/login-heading-is-visible.png
 *
 */
export const test = base.extend({});

function slugify(text: string): string {
  return text
    .replace(/[""]/g, '')
    .replace(/[^a-zA-Z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

test.afterEach(async ({ page }, testInfo) => {
  const outputDir = testInfo.project.outputDir;
  if (!outputDir) return;

  const titlePath = testInfo.titlePath; // e.g. ["", "Login Page", "test name"]
  const describeParts = titlePath.slice(1, -1);
  const describeFolder = describeParts.map(slugify).join(path.sep) || 'general';

  const testName = slugify(titlePath[titlePath.length - 1]);

  const dir = path.join(outputDir, describeFolder);
  fs.mkdirSync(dir, { recursive: true });

  await page.screenshot({ path: path.join(dir, `${testName}.png`), fullPage: true });
});

export { expect } from '@playwright/test';
