# Multi-Site Playwright Test Automation Framework

A dynamic, multi-site end-to-end testing framework built on Playwright. Add any website to `.env` and the framework auto-discovers it, runs tests, and generates organized results with screenshots and retry cURLs.

---

## Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Configure your .env (copy from example)
cp .env.example .env
# Edit .env with your real credentials

# 3. Run all tests
npm test

# 4. Run with priority orchestration
npm run test:priority
```

---

## Adding a New Website

**Zero code changes required.** Just add 3 lines to `.env`:

```env
MYNEWSITE_BASE_URL=https://staging.mynewsite.com
MYNEWSITE_EMAIL=qa@mynewsite.com
MYNEWSITE_PASSWORD=secret123
```

Optional: customize the login route (defaults to `/auth/signin`):

```env
MYNEWSITE_AUTH_ROUTE=/login
```

The framework will automatically:
- Discover the site from `MYNEWSITE_BASE_URL`
- Create Playwright projects: `mynewsite-setup`, `mynewsite-public`
- Run generic smoke tests against it
- Use generic auth setup to log in
- Generate results in `test-results/<run>/mynewsite/`
- Create `passed.json`, `failed.json`, `full_result.json`
- Organize screenshots in `mynewsite/screenshots/`

### Naming Convention

| Env Variable | Purpose |
|---|---|
| `<NAME>_BASE_URL` | Site URL (required - triggers discovery) |
| `<NAME>_EMAIL` | Login email (optional, falls back to `TEST_EMAIL`) |
| `<NAME>_PASSWORD` | Login password (optional, falls back to `TEST_PASSWORD`) |
| `<NAME>_AUTH_ROUTE` | Login page path (optional, default: `/auth/signin`) |

---

## Adding Site-Specific Tests

Generic smoke tests run for every site. To add custom tests for a specific site:

```
tests/
  mynewsite/                          # folder name = lowercase site name
    auth.setup.ts                     # custom auth (optional, overrides generic)
    priority-high/
      public/
        landing-page.spec.ts          # public tests
      authenticated/
        dashboard.spec.ts             # tests that need login
    priority-medium/
      public/
        forms.spec.ts
```

Tag your test describes with `@api:<name>` and `@priority:<level>`:

```typescript
test.describe('Landing Page @api:landing @priority:high', () => {
  test('hero section is visible', async ({ page }) => {
    await page.goto(`${BASE_URL}/`);
    await expect(page.locator('h1')).toBeVisible();
  });
});
```

Once you create `tests/mynewsite/`, the config auto-detects it and:
- Uses your custom `auth.setup.ts` instead of the generic one
- Adds a `mynewsite-authenticated` project for tests in `authenticated/` folders

---

## Project Structure

```
.
├── .env                          # Site credentials (git-ignored)
├── .env.example                  # Template showing the convention
├── playwright.config.ts          # Dynamic config - generates projects from .env
├── global.setup.ts               # Validates env vars on startup
├── utils/
│   ├── siteDiscovery.ts          # Scans *_BASE_URL env vars
│   └── testResultManager.ts      # Folder creation + JSON writing
├── reporters/
│   └── priorityResultReporter.ts # Custom reporter: 3 JSONs + screenshots
├── scripts/
│   ├── run-priority-tests.mjs    # Orchestrator: runs by site + priority
│   ├── export-test-report.mjs    # Generates Excel report
│   └── clean-test-results.mjs    # Wipes test-results/
├── tests/
│   ├── _generic/                 # Runs against ALL discovered sites
│   │   ├── smoke.spec.ts         # Page load, title, JS errors, a11y
│   │   └── auth.setup.ts         # Generic login for any site
│   ├── blockpeer/                # Site-specific tests
│   │   ├── auth.setup.ts
│   │   ├── priority-high/
│   │   ├── priority-medium/
│   │   └── priority-low/
│   └── crickbox/                 # Another site
│       ├── auth.setup.ts
│       ├── crickbox.spec.ts
│       └── authenticated/
```

---

## Output Structure

After a test run, results are organized per website:

```
test-results/<run-id>/
  blockpeer/
    passed.json                    # All passed tests
    failed.json                    # All failed tests (with screenshots + cURL)
    full_result.json               # Every test result
    screenshots/                   # Screenshots copied per website
      signin-page-title-1713600000.png
    auth/
      priority-high/
        passed/                    # Individual test JSONs
          1713600000_0_0_abc123.json
        failed/
          1713600001_0_0_def456.json
    navigation/
      priority-medium/
        passed/
          ...
  speaksport/
    passed.json
    failed.json
    full_result.json
    screenshots/
    ...
  summary/
    final-test-report.xlsx         # Excel with Summary + Details + Failed sheets
```

### JSON Output Example (failed test)

```json
{
  "title": "signin heading is visible",
  "fullTitle": "Blockpeer Login Critical @api:auth @priority:high signin heading is visible",
  "apiName": "auth",
  "priority": "high",
  "status": "failed",
  "outcome": "failed",
  "durationMs": 5230,
  "websiteName": "blockpeer",
  "error": "Expected element to be visible",
  "screenshotPaths": ["test-results/.../blockpeer/screenshots/signin-heading-1713600000.png"],
  "retryCurl": "curl -s -o /dev/null -w \"%{http_code}\" -X GET \"https://staging.blockpeer.finance/auth/signin\" -H \"Accept: text/html,application/json\""
}
```

---

## Running Tests

### Basic Commands

```bash
# Run all tests for all sites
npm test

# Run only public tests (skip auth)
npm run test:priority:public

# Clean old results
npm run clean:results
```

### Priority Runner

```bash
# All sites, all priorities
npm run test:priority

# Specific site
npm run test:priority -- --sites=blockpeer

# Specific priority
npm run test:priority -- --priorities=high

# Multiple sites
npm run test:priority -- --sites=blockpeer,crickbox

# Continue even if a priority level fails
npm run test:priority -- --continue-on-failure

# Skip auth setup (public tests only)
npm run test:priority -- --skip-auth
```

### Direct Playwright Commands

```bash
# Run specific project
npx playwright test --project blockpeer-public

# Run with grep filter
npx playwright test --grep "@priority:high"

# Run headed (see the browser)
npx playwright test --project blockpeer-public --headed

# Run specific test file
npx playwright test tests/blockpeer/priority-high/public/auth-critical.spec.ts
```

### Generate Excel Report

```bash
# Auto-generated after priority runner, or manually:
npm run test:report
```

---

## Environment Variables Reference

| Variable | Description | Default |
|---|---|---|
| `<NAME>_BASE_URL` | Site URL (triggers auto-discovery) | - |
| `<NAME>_EMAIL` | Site login email | `TEST_EMAIL` |
| `<NAME>_PASSWORD` | Site login password | `TEST_PASSWORD` |
| `<NAME>_AUTH_ROUTE` | Login page route | `/auth/signin` |
| `TEST_EMAIL` | Fallback email for all sites | - |
| `TEST_PASSWORD` | Fallback password for all sites | - |
| `TEST_RUN_ID` | Custom run ID for results folder | auto-generated |
| `SKIP_AUTH_SETUP` | Skip auth when `true` | `false` |
| `SITES` | Comma-separated site filter | all discovered |
| `PRIORITY_ORDER` | Comma-separated priority order | `high,medium,low` |
| `CONTINUE_ON_FAILURE` | Don't stop on first failure | `false` |
| `CI` | CI mode (fail fast, forbid .only) | - |

---

## How Site Discovery Works

1. On startup, `utils/siteDiscovery.ts` scans all env vars
2. Any variable ending in `_BASE_URL` is treated as a site definition
3. The prefix becomes the site name (e.g., `BLOCKPEER_BASE_URL` -> `blockpeer`)
4. It checks if `tests/<sitename>/` exists for custom tests
5. It checks if `tests/<sitename>/auth.setup.ts` exists for custom auth
6. `playwright.config.ts` generates 2-3 Playwright projects per site dynamically
7. The reporter organizes all output by website name
