# hackthon-hackers — Blockpeer Finance Test Suite

This repo is a **Playwright test automation suite** for [Blockpeer Finance](https://etrade-staging.blockpeer.finance), a blockchain-based eTrade/financial platform. It is **not** the application itself — it contains E2E tests only.

## Project structure

```
tests/
  auth.setup.ts              — saves authenticated session to .auth/session.json
  etrade.spec.ts             — public page tests (login, signup, forgot-password)
  etrade-authenticated.spec.ts — all authenticated-user flows
  coverageMap.ts             — structured map of which features are tested vs. not

playwright.config.ts         — 3 projects: setup → public + authenticated
.env                         — TEST_EMAIL, TEST_PASSWORD, BASE_URL (not committed)
.auth/session.json           — saved login session (not committed)
```

## Running tests

```bash
# Install dependencies
npm install
npx playwright install chromium

# Set up environment
cp .env.example .env
# Fill in TEST_EMAIL and TEST_PASSWORD in .env

# Run all tests
npm test

# Public tests only (no login needed)
npx playwright test --project=public

# Authenticated tests only
npx playwright test --project=authenticated
```

## Knowledge graph

This project has a built-in knowledge graph generator at `scripts/graph.js`.
No Python or external packages required — runs with Node.js built-ins only.

Rules:
- Before answering architecture or coverage questions, read `graphify-out/GRAPH_REPORT.md` for god nodes and gap list
- After modifying test files or `coverageMap.ts`, run `npm run graph:update` to keep the graph current

To build or update the graph:
```bash
npm run graph        # full build → graph.html + graph.json + GRAPH_REPORT.md
npm run graph:update # same as above (re-reads all files)
npm run graph:report # JSON + Markdown only, no HTML
```

Or trigger with `/graphify` in a Claude Code session.

## Platform coverage

See `tests/coverageMap.ts` for a structured list of every feature area and which tests cover it. Features marked `covered: false` are known gaps.

Key platform features (all at `etrade-staging.blockpeer.finance`):

| Route | Feature | Tested |
|---|---|---|
| `/auth/signin` | Login | Yes |
| `/auth/signup` | Sign Up | Yes |
| `/auth/forgot-password` | Password Recovery | Yes |
| `/` | Dashboard | Yes |
| `/wallet` | Blockchain Wallet | Yes |
| `/bank-e-presentations` | Bank ePresentations | Yes |
| `/bills-of-exchange` | Bills of Exchange | Yes |
| `/contacts` | Contact Book | Yes |
| `/teams` | Team Management | Yes |
| `/verify-and-endorse-document` | Document Verification | Yes |
| `/settings/company-settings` | Company Settings | Yes |
| `/settings/email-settings` | Email Notifications | Yes |
| `/settings/email-configuration` | Email Configuration | Yes |
| `/terms` | Terms of Service | Yes |
| `/privacy` | Privacy Policy | Yes |
| `/bills-of-exchange/transfer` | Bill Transfer | **No** |
| Contact creation form | Create Contact flow | **No** |
| Team creation form | Create Team flow | **No** |
| Wallet connection flow | Connect Wallet | **No** |
