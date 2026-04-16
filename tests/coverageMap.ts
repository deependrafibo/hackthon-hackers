/**
 * Coverage Map — Blockpeer Finance E2E test suite
 *
 * Tracks which areas of https://etrade-staging.blockpeer.finance are exercised
 * by the tests in etrade.spec.ts and etrade-authenticated.spec.ts.
 *
 * covered: true  → at least one passing test exercises this area
 * covered: false → known gap; no test exists yet
 */

export interface CoverageArea {
  id: string;
  area: string;
  route: string;
  tests: string[];
  covered: boolean;
  specFile: 'etrade.spec.ts' | 'etrade-authenticated.spec.ts' | 'auth.setup.ts';
}

export const coverageMap: CoverageArea[] = [

  // ── AUTH SETUP ───────────────────────────────────────────────────────────────

  {
    id: 'SETUP-01',
    area: 'Auth Setup — Login and save session',
    route: '/auth/signin',
    tests: ['authenticate'],
    covered: true,
    specFile: 'auth.setup.ts',
  },

  // ── LOGIN PAGE (/auth/signin) ────────────────────────────────────────────────

  {
    id: 'AUTH-01',
    area: 'Login — Page title',
    route: '/auth/signin',
    tests: ['page title is "Blockpeer Finance"'],
    covered: true,
    specFile: 'etrade.spec.ts',
  },
  {
    id: 'AUTH-02',
    area: 'Login — Root redirects to /auth/signin',
    route: '/',
    tests: ['root URL redirects to /auth/signin'],
    covered: true,
    specFile: 'etrade.spec.ts',
  },
  {
    id: 'AUTH-03',
    area: 'Login — Heading visible',
    route: '/auth/signin',
    tests: ['login heading is visible'],
    covered: true,
    specFile: 'etrade.spec.ts',
  },
  {
    id: 'AUTH-04',
    area: 'Login — Logo visible and links to home',
    route: '/auth/signin',
    tests: ['logo is visible and links to home'],
    covered: true,
    specFile: 'etrade.spec.ts',
  },
  {
    id: 'AUTH-05',
    area: 'Login — Email input accepts input',
    route: '/auth/signin',
    tests: ['email input is present and accepts input'],
    covered: true,
    specFile: 'etrade.spec.ts',
  },
  {
    id: 'AUTH-06',
    area: 'Login — Password input masked by default',
    route: '/auth/signin',
    tests: ['password input is present and masked by default'],
    covered: true,
    specFile: 'etrade.spec.ts',
  },
  {
    id: 'AUTH-07',
    area: 'Login — Password visibility toggle',
    route: '/auth/signin',
    tests: ['password visibility toggle works'],
    covered: true,
    specFile: 'etrade.spec.ts',
  },
  {
    id: 'AUTH-08',
    area: 'Login — Keep me signed in checkbox',
    route: '/auth/signin',
    tests: ['"Keep me signed in" checkbox is present and toggleable'],
    covered: true,
    specFile: 'etrade.spec.ts',
  },
  {
    id: 'AUTH-09',
    area: 'Login — Sign In button visible',
    route: '/auth/signin',
    tests: ['Sign In button is visible'],
    covered: true,
    specFile: 'etrade.spec.ts',
  },
  {
    id: 'AUTH-10',
    area: 'Login — Empty form stays on page',
    route: '/auth/signin',
    tests: ['Sign In with empty form shows native/HTML5 validation (no navigation)'],
    covered: true,
    specFile: 'etrade.spec.ts',
  },
  {
    id: 'AUTH-11',
    area: 'Login — Invalid email stays on page',
    route: '/auth/signin',
    tests: ['Sign In with invalid email stays on page'],
    covered: true,
    specFile: 'etrade.spec.ts',
  },
  {
    id: 'AUTH-12',
    area: 'Login — Forgot password link navigates',
    route: '/auth/signin',
    tests: ['"Forgot your password?" link navigates to forgot-password page'],
    covered: true,
    specFile: 'etrade.spec.ts',
  },
  {
    id: 'AUTH-13',
    area: 'Login — Create Account link navigates',
    route: '/auth/signin',
    tests: ['"Create Account" link navigates to signup page'],
    covered: true,
    specFile: 'etrade.spec.ts',
  },

  // ── SIGN UP PAGE (/auth/signup) ──────────────────────────────────────────────

  {
    id: 'SIGNUP-01',
    area: 'Sign Up — Page title',
    route: '/auth/signup',
    tests: ['page title is "Blockpeer Finance"'],
    covered: true,
    specFile: 'etrade.spec.ts',
  },
  {
    id: 'SIGNUP-02',
    area: 'Sign Up — Heading visible',
    route: '/auth/signup',
    tests: ['signup heading is visible'],
    covered: true,
    specFile: 'etrade.spec.ts',
  },
  {
    id: 'SIGNUP-03',
    area: 'Sign Up — Logo visible',
    route: '/auth/signup',
    tests: ['logo is visible'],
    covered: true,
    specFile: 'etrade.spec.ts',
  },
  {
    id: 'SIGNUP-04',
    area: 'Sign Up — Full Name input',
    route: '/auth/signup',
    tests: ['Full Name input is present'],
    covered: true,
    specFile: 'etrade.spec.ts',
  },
  {
    id: 'SIGNUP-05',
    area: 'Sign Up — Email input',
    route: '/auth/signup',
    tests: ['Email input is present'],
    covered: true,
    specFile: 'etrade.spec.ts',
  },
  {
    id: 'SIGNUP-06',
    area: 'Sign Up — Password and Confirm Password inputs',
    route: '/auth/signup',
    tests: ['Password and Confirm Password inputs are present'],
    covered: true,
    specFile: 'etrade.spec.ts',
  },
  {
    id: 'SIGNUP-07',
    area: 'Sign Up — Create Account button',
    route: '/auth/signup',
    tests: ['"Create Account" button is visible'],
    covered: true,
    specFile: 'etrade.spec.ts',
  },
  {
    id: 'SIGNUP-08',
    area: 'Sign Up — Sign Up with Google button',
    route: '/auth/signup',
    tests: ['"Sign Up with Google" button is visible'],
    covered: true,
    specFile: 'etrade.spec.ts',
  },
  {
    id: 'SIGNUP-09',
    area: 'Sign Up — Sign in link navigates back',
    route: '/auth/signup',
    tests: ['"Sign in" link navigates back to signin page'],
    covered: true,
    specFile: 'etrade.spec.ts',
  },
  {
    id: 'SIGNUP-10',
    area: 'Sign Up — Empty form stays on page',
    route: '/auth/signup',
    tests: ['empty form submission stays on signup page'],
    covered: true,
    specFile: 'etrade.spec.ts',
  },
  {
    id: 'SIGNUP-11',
    area: 'Sign Up — Password visibility toggle',
    route: '/auth/signup',
    tests: ['password visibility toggle works on signup'],
    covered: true,
    specFile: 'etrade.spec.ts',
  },

  // ── FORGOT PASSWORD PAGE (/auth/forgot-password) ─────────────────────────────

  {
    id: 'FORGOT-01',
    area: 'Forgot Password — Page title',
    route: '/auth/forgot-password',
    tests: ['page title is "Blockpeer Finance"'],
    covered: true,
    specFile: 'etrade.spec.ts',
  },
  {
    id: 'FORGOT-02',
    area: 'Forgot Password — Heading visible',
    route: '/auth/forgot-password',
    tests: ['forgot-password heading is visible'],
    covered: true,
    specFile: 'etrade.spec.ts',
  },
  {
    id: 'FORGOT-03',
    area: 'Forgot Password — Sub-heading text',
    route: '/auth/forgot-password',
    tests: ['"Forgot your password?" sub-heading text is visible'],
    covered: true,
    specFile: 'etrade.spec.ts',
  },
  {
    id: 'FORGOT-04',
    area: 'Forgot Password — Email input',
    route: '/auth/forgot-password',
    tests: ['email input is present'],
    covered: true,
    specFile: 'etrade.spec.ts',
  },
  {
    id: 'FORGOT-05',
    area: 'Forgot Password — Send Reset Instructions button',
    route: '/auth/forgot-password',
    tests: ['"Send Reset Instructions" button is visible'],
    covered: true,
    specFile: 'etrade.spec.ts',
  },
  {
    id: 'FORGOT-06',
    area: 'Forgot Password — Empty form stays on page',
    route: '/auth/forgot-password',
    tests: ['empty form submission stays on forgot-password page'],
    covered: true,
    specFile: 'etrade.spec.ts',
  },
  {
    id: 'FORGOT-07',
    area: 'Forgot Password — Sign in link navigates back',
    route: '/auth/forgot-password',
    tests: ['"Sign in" link navigates back to signin page'],
    covered: true,
    specFile: 'etrade.spec.ts',
  },
  {
    id: 'FORGOT-08',
    area: 'Forgot Password — Valid email submits without crash',
    route: '/auth/forgot-password',
    tests: ['email input accepts valid email and submits'],
    covered: true,
    specFile: 'etrade.spec.ts',
  },

  // ── CROSS-PAGE NAVIGATION ────────────────────────────────────────────────────

  {
    id: 'XNAV-01',
    area: 'Cross-nav — Logo on login page goes to root',
    route: '/auth/signin',
    tests: ['logo on login page goes back to root (which redirects to signin)'],
    covered: true,
    specFile: 'etrade.spec.ts',
  },
  {
    id: 'XNAV-02',
    area: 'Cross-nav — Logo on signup page goes to root',
    route: '/auth/signup',
    tests: ['logo on signup page goes back to root'],
    covered: true,
    specFile: 'etrade.spec.ts',
  },
  {
    id: 'XNAV-03',
    area: 'Cross-nav — Logo on forgot-password page goes to root',
    route: '/auth/forgot-password',
    tests: ['logo on forgot-password page goes back to root'],
    covered: true,
    specFile: 'etrade.spec.ts',
  },

  // ── DASHBOARD (/) ────────────────────────────────────────────────────────────

  {
    id: 'DASH-01',
    area: 'Dashboard — Authenticated user not redirected to signin',
    route: '/',
    tests: ['authenticated user is NOT redirected to signin'],
    covered: true,
    specFile: 'etrade-authenticated.spec.ts',
  },
  {
    id: 'DASH-02',
    area: 'Dashboard — Page title',
    route: '/',
    tests: ['page title is "Blockpeer Finance"'],
    covered: true,
    specFile: 'etrade-authenticated.spec.ts',
  },
  {
    id: 'DASH-03',
    area: 'Dashboard — Greeting heading shows user name',
    route: '/',
    tests: ['greeting heading shows the logged-in user name'],
    covered: true,
    specFile: 'etrade-authenticated.spec.ts',
  },
  {
    id: 'DASH-04',
    area: 'Dashboard — User profile button',
    route: '/',
    tests: ['user profile button shows name and role'],
    covered: true,
    specFile: 'etrade-authenticated.spec.ts',
  },
  {
    id: 'DASH-05',
    area: 'Dashboard — Connect Wallet button',
    route: '/',
    tests: ['"Connect Wallet" button is visible'],
    covered: true,
    specFile: 'etrade-authenticated.spec.ts',
  },

  // ── SIDEBAR NAVIGATION ───────────────────────────────────────────────────────

  {
    id: 'SIDE-01',
    area: 'Sidebar — All expected nav links present',
    route: '/',
    tests: ['sidebar contains all expected nav links'],
    covered: true,
    specFile: 'etrade-authenticated.spec.ts',
  },
  {
    id: 'SIDE-02',
    area: 'Sidebar — Toggle button works',
    route: '/',
    tests: ['"Toggle Sidebar" button works'],
    covered: true,
    specFile: 'etrade-authenticated.spec.ts',
  },
  {
    id: 'SIDE-03',
    area: 'Sidebar — Footer links (Terms, Privacy)',
    route: '/',
    tests: ['sidebar has footer links: Terms of Service and Privacy Policy'],
    covered: true,
    specFile: 'etrade-authenticated.spec.ts',
  },
  {
    id: 'SIDE-04',
    area: 'Sidebar — Transferable Documents expandable section',
    route: '/',
    tests: ['"Transferable Documents" expandable section is in sidebar'],
    covered: true,
    specFile: 'etrade-authenticated.spec.ts',
  },
  {
    id: 'SIDE-05',
    area: 'Sidebar — Email expandable section',
    route: '/',
    tests: ['"Email" expandable section is in sidebar'],
    covered: true,
    specFile: 'etrade-authenticated.spec.ts',
  },
  {
    id: 'SIDENAV-01',
    area: 'Sidebar Link — Wallets navigates to /wallet',
    route: '/wallet',
    tests: ['clicking "Wallets" navigates to /wallet'],
    covered: true,
    specFile: 'etrade-authenticated.spec.ts',
  },
  {
    id: 'SIDENAV-02',
    area: 'Sidebar Link — Bank ePresentations navigates',
    route: '/bank-e-presentations',
    tests: ['clicking "Bank ePresentations" navigates to /bank-e-presentations'],
    covered: true,
    specFile: 'etrade-authenticated.spec.ts',
  },
  {
    id: 'SIDENAV-03',
    area: 'Sidebar Link — Contact book navigates',
    route: '/contacts',
    tests: ['clicking "Contact book" navigates to /contacts'],
    covered: true,
    specFile: 'etrade-authenticated.spec.ts',
  },
  {
    id: 'SIDENAV-04',
    area: 'Sidebar Link — Manage Teams navigates',
    route: '/teams',
    tests: ['clicking "Manage Teams" navigates to /teams'],
    covered: true,
    specFile: 'etrade-authenticated.spec.ts',
  },
  {
    id: 'SIDENAV-05',
    area: 'Sidebar Link — Verify and Endorse navigates',
    route: '/verify-and-endorse-document',
    tests: ['clicking "Verify and Endorse" navigates to /verify-and-endorse-document'],
    covered: true,
    specFile: 'etrade-authenticated.spec.ts',
  },
  {
    id: 'SIDENAV-06',
    area: 'Sidebar Link — Settings navigates',
    route: '/settings',
    tests: ['clicking "Settings" navigates to /settings'],
    covered: true,
    specFile: 'etrade-authenticated.spec.ts',
  },

  // ── WALLET PAGE (/wallet) ────────────────────────────────────────────────────

  {
    id: 'WALLET-01',
    area: 'Wallet — Shows connect wallet prompt',
    route: '/wallet',
    tests: ['shows "Please connect your wallet" message'],
    covered: true,
    specFile: 'etrade-authenticated.spec.ts',
  },
  {
    id: 'WALLET-02',
    area: 'Wallet — Connect Wallet button available',
    route: '/wallet',
    tests: ['"Connect Wallet" button is available'],
    covered: true,
    specFile: 'etrade-authenticated.spec.ts',
  },
  {
    id: 'WALLET-03',
    area: 'Wallet — Page does not crash',
    route: '/wallet',
    tests: ['page does not crash — body is visible'],
    covered: true,
    specFile: 'etrade-authenticated.spec.ts',
  },

  // ── BANK E-PRESENTATIONS PAGE (/bank-e-presentations) ────────────────────────

  {
    id: 'BANK-01',
    area: 'Bank ePresentations — Shows connect wallet prompt',
    route: '/bank-e-presentations',
    tests: ['shows "Please connect your wallet" message'],
    covered: true,
    specFile: 'etrade-authenticated.spec.ts',
  },
  {
    id: 'BANK-02',
    area: 'Bank ePresentations — Page does not crash',
    route: '/bank-e-presentations',
    tests: ['page does not crash — body is visible'],
    covered: true,
    specFile: 'etrade-authenticated.spec.ts',
  },

  // ── BILLS OF EXCHANGE PAGE (/bills-of-exchange) ───────────────────────────────

  {
    id: 'BILLS-01',
    area: 'Bills of Exchange — Redirects to /issue sub-route',
    route: '/bills-of-exchange',
    tests: ['redirects to /bills-of-exchange/issue sub-route'],
    covered: true,
    specFile: 'etrade-authenticated.spec.ts',
  },
  {
    id: 'BILLS-02',
    area: 'Bills of Exchange — Shows connect wallet prompt',
    route: '/bills-of-exchange/issue',
    tests: ['shows "Please connect your wallet" message'],
    covered: true,
    specFile: 'etrade-authenticated.spec.ts',
  },
  {
    id: 'BILLS-03',
    area: 'Bills of Exchange — Page does not crash',
    route: '/bills-of-exchange/issue',
    tests: ['page does not crash — body is visible'],
    covered: true,
    specFile: 'etrade-authenticated.spec.ts',
  },

  // ── CONTACTS PAGE (/contacts) ────────────────────────────────────────────────

  {
    id: 'CONTACTS-01',
    area: 'Contacts — "Contact book" heading',
    route: '/contacts',
    tests: ['heading "Contact book" is visible'],
    covered: true,
    specFile: 'etrade-authenticated.spec.ts',
  },
  {
    id: 'CONTACTS-02',
    area: 'Contacts — Create contact button',
    route: '/contacts',
    tests: ['"+ Create contact" button is visible'],
    covered: true,
    specFile: 'etrade-authenticated.spec.ts',
  },
  {
    id: 'CONTACTS-03',
    area: 'Contacts — Search input',
    route: '/contacts',
    tests: ['search input is present with correct placeholder'],
    covered: true,
    specFile: 'etrade-authenticated.spec.ts',
  },
  {
    id: 'CONTACTS-04',
    area: 'Contacts — Table columns (Name, Email, Phone, LEI, Updated At, Actions)',
    route: '/contacts',
    tests: ['contacts table has expected columns'],
    covered: true,
    specFile: 'etrade-authenticated.spec.ts',
  },
  {
    id: 'CONTACTS-05',
    area: 'Contacts — At least one row in table',
    route: '/contacts',
    tests: ['contacts table has at least one row'],
    covered: true,
    specFile: 'etrade-authenticated.spec.ts',
  },
  {
    id: 'CONTACTS-06',
    area: 'Contacts — Pagination controls',
    route: '/contacts',
    tests: ['pagination controls are visible'],
    covered: true,
    specFile: 'etrade-authenticated.spec.ts',
  },
  {
    id: 'CONTACTS-07',
    area: 'Contacts — Search accepts text',
    route: '/contacts',
    tests: ['search input accepts text'],
    covered: true,
    specFile: 'etrade-authenticated.spec.ts',
  },

  // ── MANAGE TEAMS PAGE (/teams) ────────────────────────────────────────────────

  {
    id: 'TEAMS-01',
    area: 'Teams — "Manage Teams" heading',
    route: '/teams',
    tests: ['heading "Manage Teams" is visible'],
    covered: true,
    specFile: 'etrade-authenticated.spec.ts',
  },
  {
    id: 'TEAMS-02',
    area: 'Teams — Create Team button',
    route: '/teams',
    tests: ['"Create Team" button is visible'],
    covered: true,
    specFile: 'etrade-authenticated.spec.ts',
  },
  {
    id: 'TEAMS-03',
    area: 'Teams — Default Team card visible',
    route: '/teams',
    tests: ['"Default Team" card is visible'],
    covered: true,
    specFile: 'etrade-authenticated.spec.ts',
  },
  {
    id: 'TEAMS-04',
    area: 'Teams — View team buttons present',
    route: '/teams',
    tests: ['"View team" buttons are visible for each team'],
    covered: true,
    specFile: 'etrade-authenticated.spec.ts',
  },
  {
    id: 'TEAMS-05',
    area: 'Teams — View team navigates to detail page',
    route: '/teams/:id',
    tests: ['clicking "View team" navigates to team detail'],
    covered: true,
    specFile: 'etrade-authenticated.spec.ts',
  },

  // ── VERIFY & ENDORSE DOCUMENT PAGE (/verify-and-endorse-document) ─────────────

  {
    id: 'VERIFY-01',
    area: 'Verify & Endorse — Upload heading visible',
    route: '/verify-and-endorse-document',
    tests: ['heading "Upload Document for Verification" is visible'],
    covered: true,
    specFile: 'etrade-authenticated.spec.ts',
  },
  {
    id: 'VERIFY-02',
    area: 'Verify & Endorse — File upload input present',
    route: '/verify-and-endorse-document',
    tests: ['file upload input is present'],
    covered: true,
    specFile: 'etrade-authenticated.spec.ts',
  },
  {
    id: 'VERIFY-03',
    area: 'Verify & Endorse — Page does not crash',
    route: '/verify-and-endorse-document',
    tests: ['page does not crash — body is visible'],
    covered: true,
    specFile: 'etrade-authenticated.spec.ts',
  },

  // ── SETTINGS — COMPANY SETTINGS (/settings/company-settings) ─────────────────

  {
    id: 'SETTINGS-01',
    area: 'Settings — Redirects to /settings/company-settings',
    route: '/settings',
    tests: ['redirects to /settings/company-settings'],
    covered: true,
    specFile: 'etrade-authenticated.spec.ts',
  },
  {
    id: 'SETTINGS-02',
    area: 'Settings — "Setting Menu" heading',
    route: '/settings/company-settings',
    tests: ['heading "Setting Menu" is visible'],
    covered: true,
    specFile: 'etrade-authenticated.spec.ts',
  },
  {
    id: 'SETTINGS-03',
    area: 'Settings — "Company Settings" heading',
    route: '/settings/company-settings',
    tests: ['heading "Company Settings" is visible'],
    covered: true,
    specFile: 'etrade-authenticated.spec.ts',
  },
  {
    id: 'SETTINGS-04',
    area: 'Settings — Company form fields (name, address, country, state, city, zip, phone, reg#, email)',
    route: '/settings/company-settings',
    tests: ['company settings form has expected fields'],
    covered: true,
    specFile: 'etrade-authenticated.spec.ts',
  },
  {
    id: 'SETTINGS-05',
    area: 'Settings — Save Changes button',
    route: '/settings/company-settings',
    tests: ['"Save Changes" button is visible'],
    covered: true,
    specFile: 'etrade-authenticated.spec.ts',
  },
  {
    id: 'SETTINGS-06',
    area: 'Settings — Logo upload button',
    route: '/settings/company-settings',
    tests: ['"Choose file" button is visible for logo upload'],
    covered: true,
    specFile: 'etrade-authenticated.spec.ts',
  },
  {
    id: 'SETTINGS-07',
    area: 'Settings — Three tabs visible (Company, Email Notifications, Email Config)',
    route: '/settings/company-settings',
    tests: ['settings menu has all three tabs'],
    covered: true,
    specFile: 'etrade-authenticated.spec.ts',
  },

  // ── SETTINGS — EMAIL NOTIFICATIONS (/settings/email-settings) ────────────────

  {
    id: 'EMAIL-01',
    area: 'Email Notifications — Tab navigation and heading',
    route: '/settings/email-settings',
    tests: ['navigating to Email Notifications tab works'],
    covered: true,
    specFile: 'etrade-authenticated.spec.ts',
  },

  // ── SETTINGS — EMAIL CONFIGURATION (/settings/email-configuration) ───────────

  {
    id: 'EMAIL-02',
    area: 'Email Configuration — Tab navigation and heading',
    route: '/settings/email-configuration',
    tests: ['navigating to Email Configuration tab works'],
    covered: true,
    specFile: 'etrade-authenticated.spec.ts',
  },

  // ── TERMS OF SERVICE (/terms) ────────────────────────────────────────────────

  {
    id: 'TERMS-01',
    area: 'Terms of Service — Page loads (200)',
    route: '/terms',
    tests: ['page loads without errors'],
    covered: true,
    specFile: 'etrade-authenticated.spec.ts',
  },
  {
    id: 'TERMS-02',
    area: 'Terms of Service — Page title',
    route: '/terms',
    tests: ['page title is "Blockpeer Finance"'],
    covered: true,
    specFile: 'etrade-authenticated.spec.ts',
  },

  // ── PRIVACY POLICY (/privacy) ────────────────────────────────────────────────

  {
    id: 'PRIVACY-01',
    area: 'Privacy Policy — Page loads (200)',
    route: '/privacy',
    tests: ['page loads without errors'],
    covered: true,
    specFile: 'etrade-authenticated.spec.ts',
  },
  {
    id: 'PRIVACY-02',
    area: 'Privacy Policy — Page title',
    route: '/privacy',
    tests: ['page title is "Blockpeer Finance"'],
    covered: true,
    specFile: 'etrade-authenticated.spec.ts',
  },

  // ── ERROR HANDLING ───────────────────────────────────────────────────────────

  {
    id: 'ERR-01',
    area: 'Unknown Routes — SPA catch-all does not crash (200 or 404)',
    route: '/this-page-does-not-exist',
    tests: ['visiting a non-existent page does not crash'],
    covered: true,
    specFile: 'etrade-authenticated.spec.ts',
  },

  // ── NOT YET COVERED ──────────────────────────────────────────────────────────

  {
    id: 'BILLS-TRANSFER-01',
    area: 'Bills of Exchange — Transfer flow (/bills-of-exchange/transfer)',
    route: '/bills-of-exchange/transfer',
    tests: [],
    covered: false,
    specFile: 'etrade-authenticated.spec.ts',
  },
  {
    id: 'CONTACTS-CREATE-01',
    area: 'Contacts — Create contact form (fill, submit, verify row appears)',
    route: '/contacts',
    tests: [],
    covered: false,
    specFile: 'etrade-authenticated.spec.ts',
  },
  {
    id: 'TEAMS-CREATE-01',
    area: 'Teams — Create team form (fill name, submit, verify card appears)',
    route: '/teams',
    tests: [],
    covered: false,
    specFile: 'etrade-authenticated.spec.ts',
  },
  {
    id: 'TEAMS-DETAIL-01',
    area: 'Teams — Team detail page content (/teams/:id)',
    route: '/teams/:id',
    tests: [],
    covered: false,
    specFile: 'etrade-authenticated.spec.ts',
  },
  {
    id: 'WALLET-CONNECT-01',
    area: 'Wallet — Connect wallet flow (modal, wallet selection)',
    route: '/wallet',
    tests: [],
    covered: false,
    specFile: 'etrade-authenticated.spec.ts',
  },
  {
    id: 'VERIFY-UPLOAD-01',
    area: 'Verify & Endorse — Upload a document and verify endorsement result',
    route: '/verify-and-endorse-document',
    tests: [],
    covered: false,
    specFile: 'etrade-authenticated.spec.ts',
  },
  {
    id: 'EMAIL-NOTIF-FIELDS-01',
    area: 'Email Notifications — Form fields and toggle switches',
    route: '/settings/email-settings',
    tests: [],
    covered: false,
    specFile: 'etrade-authenticated.spec.ts',
  },
  {
    id: 'EMAIL-CONFIG-FIELDS-01',
    area: 'Email Configuration — SMTP/provider form fields',
    route: '/settings/email-configuration',
    tests: [],
    covered: false,
    specFile: 'etrade-authenticated.spec.ts',
  },
];

// ── Convenience helpers ────────────────────────────────────────────────────────

export const coveredAreas   = coverageMap.filter(a => a.covered);
export const uncoveredAreas = coverageMap.filter(a => !a.covered);

export function coverageStats() {
  const total   = coverageMap.length;
  const covered = coveredAreas.length;
  return {
    total,
    covered,
    uncovered: total - covered,
    percent: Math.round((covered / total) * 100),
  };
}
