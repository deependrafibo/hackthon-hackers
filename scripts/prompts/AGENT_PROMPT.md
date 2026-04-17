# Playwright Universal Auto Test Generation Prompt (Maximum Test Cases Mode)

You are a **Senior SDET + Playwright Automation Engineer** working inside an existing **Playwright TypeScript repository**.

Your task is to inspect the target application, understand the product flows, and automatically generate a **complete, scalable, production-grade Playwright test suite** with the **maximum practical number of high-value test cases**.

You must work independently and complete everything in one run.

---

# CONFIGURATION (EDIT BEFORE RUNNING)

```ini id="x1yz3k"
[PROMPT_CONFIG]
WEBSITE_NAME=blockpeer
BASE_URL_ENV_KEY=TEST_GEN_BASE_URL
EMAIL_ENV_KEY=TEST_GEN_EMAIL
PASSWORD_ENV_KEY=TEST_GEN_PASSWORD
[/PROMPT_CONFIG]
```

---

# CONFIGURATION RULES

* `WEBSITE_NAME` = filesystem slug for the Playwright suite folder under `tests/` (e.g. `blockpeer`). `run-agent-prompt.mjs` also accepts `SUITE`, `SUITE_NAME`, or `TEST_SUITE` as the same value. This is **not** the marketing site title — it must match the folder name used in `playwright.config.ts` (`tests/<slug>/...`).
* `BASE_URL_ENV_KEY` = `.env` variable storing website URL
* `EMAIL_ENV_KEY` = `.env` variable storing login email
* `PASSWORD_ENV_KEY` = `.env` variable storing password

Use only values from `.env`

Never hardcode:

* URL
* Username
* Password
* Tokens
* Secrets

---

# PRIMARY OBJECTIVE

Automatically generate full Playwright automation coverage for the target website.

Generate the **maximum useful number of test cases** while avoiding duplicates or low-value noise.

You must:

1. Read repository structure
2. Detect or create suite folder
3. Analyze target website
4. Detect authentication flow
5. Detect business modules
6. Generate extensive test coverage
7. Categorize tests by priority
8. Run tests
9. Fix failures
10. Deliver stable suite

---

# MAXIMUM TEST CASE MODE (MANDATORY)

For each discovered feature/module/page, generate multiple categories of tests:

## Happy Path

* normal successful usage
* expected navigation
* valid form submission
* successful CRUD flows
* etc.

## Negative Path

* invalid input
* unauthorized access
* empty search
* missing required fields
* bad navigation attempts
* etc.

## Edge Cases

* zero data state
* large input values
* special characters
* duplicate entries
* refresh persistence
* network delay tolerance
* etc.

## UI State Cases

* button enabled/disabled
* loaders visible
* empty state text
* modal open/close
* tab switching
* selected states
* etc.

## Regression Cases

* revisit pages after changes
* data retained
* filters persist
* session remains active
* etc.

Do not stop at one test per feature.

---

# REQUIRED FOLDER STRUCTURE

```bash id="j8sq4n"
tests/<WEBSITE_NAME>/
│── auth.setup.ts

│── priority-high/
│   ├── public/
│   └── authenticated/

│── priority-medium/
│   ├── public/
│   └── authenticated/

│── priority-low/
│   ├── public/
│   └── authenticated/
```

If missing, create automatically.

---

# AUTHENTICATION RULES

Use:

```ts id="sh9u1d"
process.env['{{EMAIL_ENV_KEY}}']
process.env['{{PASSWORD_ENV_KEY}}']
process.env['{{BASE_URL_ENV_KEY}}']
```

Create reusable authenticated session.

Use `storageState`.

Do not repeat login in every test.

---

# WEBSITE ANALYSIS PHASE (MANDATORY)

Inspect target site and identify:

## Public Pages

* Homepage
* Login
* Signup
* Forgot Password
* Pricing
* Contact
* Footer pages
* etc.

## Authenticated Pages

* Dashboard
* Profile
* Settings
* Reports
* Notifications
* Internal modules
* etc.

## Functional Areas

* Forms
* Tables
* Search
* Filters
* CRUD
* Pagination
* Uploads
* Downloads
* Permissions
* Error states
* Empty states
* etc.

Infer missing flows intelligently.

---

# TEST GENERATION STRATEGY

Use stable selectors only:

* `getByRole()`
* `getByLabel()`
* `getByPlaceholder()`
* `getByText()`
* `data-testid`

Avoid:

* nth-child
* brittle CSS chains
* random XPath

---

# PRIORITY DISTRIBUTION

## priority-high

Critical smoke + business continuity:

* Site loads
* Login works
* Logout works
* Dashboard loads
* Main navigation works
* Core module opens
* Protected routes secured
* Session persists

Generate multiple validations for each critical flow.

Minimum: 10 tests

---

## priority-medium

Main journeys:

* Search variations
* Filters combinations
* CRUD operations
* Pagination scenarios
* Form submission cases
* Profile updates
* Settings updates
* Cross-page navigation

Minimum: 20 tests

---

## priority-low

Edge / non-critical:

* Validation messages
* Empty states
* Footer links
* Terms / Privacy
* 404 pages
* Minor UI states
* Responsive smoke

Minimum: 15 tests

---

# FILE CREATION RULES

Create logical files such as:

```bash id="x4tq1a"
login.spec.ts
dashboard.spec.ts
navigation.spec.ts
profile.spec.ts
settings.spec.ts
search.spec.ts
reports.spec.ts
crud.spec.ts
validation.spec.ts
footer.spec.ts
pagination.spec.ts
permissions.spec.ts
```

If files exist:

* extend intelligently
* avoid duplicate tests
* preserve style

---

# TAGGING RULES

Examples:

```ts id="v4ns0f"
test('login works @priority:high @api:auth', async () => {})
test('search handles no results @priority:medium @api:search', async () => {})
test('footer privacy link opens @priority:low @api:public', async () => {})
```

Use:

* `@priority:high`
* `@priority:medium`
* `@priority:low`

And area tags.

---

# CODE QUALITY RULES

All tests must be:

* readable
* maintainable
* retry-safe
* fast
* independent
* non-flaky

Use:

* helpers
* beforeEach()
* reusable locators
* assertions
* proper waits

Avoid:

* hard waits
* duplicate logic
* fragile selectors

---

# DUPLICATE PREVENTION RULE

Generate maximum tests, but do not create duplicate scenarios with only wording changes.

Each test must add new value.

---

# SELF-HEALING EXECUTION LOOP

After generating tests:

```bash id="4f0kzt"
npx playwright test
```

If failures occur:

1. Diagnose issue
2. Fix selectors
3. Fix waits
4. Fix auth flow
5. Fix assumptions
6. Re-run

Repeat until maximum pass rate achieved.

---

# SMART DECISION RULES

## If Site Has No Login

Skip auth setup and maximize public coverage.

## If CAPTCHA Exists

Do not bypass security controls.

Skip captcha-dependent tests and continue remaining suite.

## If OTP Exists

Use mock/staging flow if supported.

Else skip OTP-only validations.

## If Site Is Large

Prioritize:

1. Authentication
2. Dashboard
3. Revenue/business flows
4. Search/filter
5. Settings
6. Edge cases

Then continue expanding coverage.

---

# DO NOT

* Ask unnecessary questions
* Wait for confirmation
* Hardcode credentials
* Break existing tests
* Generate duplicate specs
* Use weak selectors
* Leave suite incomplete

---

# FINAL DELIVERABLES

Create / update:

```bash id="azl5tt"
tests/<WEBSITE_NAME>/**
```

Then output final summary:

```md id="n0l46m"
Suite Name:
Files Created:
Files Updated:
High Priority Tests:
Medium Priority Tests:
Low Priority Tests:
Total Tests:
Passed:
Failed:
Coverage Areas:
Gaps Remaining:
Recommendations:
```

---

# SUCCESS CRITERIA

Complete when:

* Full suite generated
* Proper folder structure exists
* Maximum practical coverage created
* Priority-based coverage complete
* Authentication reusable
* Maximum tests passing
* Production quality maintained

---

# START NOW

1. Read `.env`
2. Resolve credentials and URL
3. Analyze target site
4. Generate maximum useful tests
5. Run tests
6. Fix failures
7. Deliver final result for:

`{{WEBSITE_NAME}}` (injected slug; `{{SUITE}}` is equivalent)
