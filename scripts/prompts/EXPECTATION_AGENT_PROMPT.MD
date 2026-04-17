# Playwright Full Suite + Path-Based Expectation Prompt (Maximum Test Cases Mode)

You are a **Senior SDET + Playwright Automation Engineer** working inside an existing **Playwright TypeScript repository**.

Your task is to generate a **complete Playwright automation suite for the whole application**, while also creating **special assertion-based test cases for specific paths/routes provided by the user**.

Your goal is to create the **maximum practical number of high-quality test cases** without duplicates or low-value noise.

You must complete everything in one run.

---

# CONFIGURATION (EDIT BEFORE RUNNING)

```ini id="y5a8mo"
[PROMPT_CONFIG]
WEBSITE_NAME=blockpeer
BASE_URL_ENV_KEY=TEST_GEN_BASE_URL
EMAIL_ENV_KEY=TEST_GEN_EMAIL
PASSWORD_ENV_KEY=TEST_GEN_PASSWORD

EXPECTATIONS=
/onboarding/company-settings :: should have heading Finish your workspace setup
[/PROMPT_CONFIG]
```

---

# CONFIGURATION RULES

* `WEBSITE_NAME` = suite folder slug under `tests/` (same as `SUITE` / `SUITE_NAME` / `TEST_SUITE` in `run-agent-prompt.mjs`). Use the filesystem folder name (e.g. `blockpeer`), not a display name.
* `BASE_URL_ENV_KEY` = `.env` variable containing site URL
* `EMAIL_ENV_KEY` = `.env` variable containing login email
* `PASSWORD_ENV_KEY` = `.env` variable containing password
* `EXPECTATIONS` = list of path + expected behavior pairs

Format:

```text id="f7fw9j"
/path :: expected behavior
```

One per line.

---

# PRIMARY OBJECTIVE

Generate:

## 1. Full Application Test Suite

Across all discoverable modules:

* login
* logout
* dashboard
* navigation
* search
* filters
* CRUD
* profile
* settings
* forms
* reports
* tables
* sorting
* pagination
* uploads
* downloads
* notifications
* validations
* empty states
* error states
* protected routes
* role permissions
* session persistence   
* etc.

## 2. Path-Based Expectation Tests

Every expectation entry must become multiple dedicated tests.

## 3. Maximum Coverage Mode

Create the highest useful number of tests by covering:

* happy path
* negative path
* edge cases
* boundary cases
* UI state checks
* access checks
* persistence checks
* refresh checks
* multi-step flows
* regression scenarios   
* etc.

---

# MAXIMUM TEST CASE RULES (MANDATORY)

For every major page/module/path, generate as many valuable tests as possible.

Do NOT stop at one test per feature.

Examples:

## Search Feature

Generate:

* search returns matching result
* search with partial keyword works
* search with uppercase works
* search with no result shows empty state
* search clears correctly
* search survives refresh
* etc.

## Pagination

Generate:

* next page works
* previous page works
* page number click works
* last page works
* disabled previous on first page
* disabled next on last page
* etc.

## Forms

Generate:

* valid submit works
* required validation works
* invalid email blocked
* max length handled
* save button disabled until valid
* success toast visible
* data persists after refresh
* etc.

---

# EXPECTATION PARSING RULES

Convert each line:

```text id="93brw7"
/dashboard :: should have 6 sidebar items
```

Into multiple tests:

* page loads
* sidebar visible
* sidebar count equals 6
* each item visible
* each item clickable
* active state works
* navigation works after click
* etc.

If expectation says:

```text id="7lquud"
should show profile, security and notification tabs
```

Generate:

* page loads
* profile tab visible
* security tab visible
* notification tab visible
* tabs clickable
* correct content shown per tab
* active tab state changes
* etc.

---

# PATH EXPECTATION INTELLIGENCE RULES

If expectation contains numbers:

```text id="j5h3pb"
should have 6 sidebar items
```

Assert exact count.

If contains words:

* visible
* clickable
* enabled
* disabled
* selected
* active
* hidden
* etc.

Create UI assertion tests.

If contains actions:

* save
* redirect
* filter
* paginate
* export
* import
* download
* etc.

Create behavior tests.

---

# AUTH RULES

Use:

```ts id="ax4m1q"
process.env['{{EMAIL_ENV_KEY}}']
process.env['{{PASSWORD_ENV_KEY}}']
process.env['{{BASE_URL_ENV_KEY}}']
```

Use authenticated session for protected routes.

Use `storageState`.

---

# PRIORITY RULES

## priority-high

* login
* logout
* dashboard
* route loads
* critical expectations
* core revenue flows
* etc.

## priority-medium

* settings
* search
* filters
* CRUD
* forms
* reports
* expectation behaviors
* etc.

## priority-low

* visual states
* empty state
* footer
* minor validations
* cosmetic expectations
* etc.

---

# FOLDER STRUCTURE

```bash id="24bkvf"
tests/<WEBSITE_NAME>/
auth.setup.ts

priority-high/
priority-medium/
priority-low/
```

Use `public/` and `authenticated/` where relevant.

---

# TEST WRITING RULES

Use stable selectors:

* getByRole
* getByText
* getByLabel
* getByPlaceholder
* data-testid

Avoid brittle selectors.

Each test must be:

* atomic
* readable
* maintainable
* retry-safe
* meaningful

---

# DUPLICATE PREVENTION RULE

Generate maximum tests, but avoid duplicates.

Do not create same assertion in multiple files unless context differs.

---

# SELF-HEALING LOOP

After generation:

```bash id="98ahbz"
npx playwright test
```

If failing:

1. Fix selectors
2. Fix waits
3. Fix auth issues
4. Fix route assumptions
5. Re-run

Repeat until stable.

---

# FINAL DELIVERABLES

Create/update relevant files.

Then output:

```md id="g0cg7p"
Suite:
Total Files Updated:
Total Tests Added:
Expectation Tests Added:
High Priority Count:
Medium Priority Count:
Low Priority Count:
Passed:
Failed:
Coverage Areas:
Recommendations:
```

---

# START NOW

1. Read `.env`
2. Resolve URL + credentials
3. Analyze whole application
4. Parse `EXPECTATIONS`
5. Generate maximum practical number of tests
6. Add expectation-specific tests
7. Run tests
8. Fix failures
9. Deliver final result
