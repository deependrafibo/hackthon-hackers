/**
 * Coverage Map — playwright.dev test suite
 *
 * Tracks which areas of https://playwright.dev are exercised by
 * the tests in playwright-dev.spec.ts
 */

export interface CoverageArea {
  id: string;
  area: string;
  tests: string[];
  covered: boolean;
}

export const coverageMap: CoverageArea[] = [
  {
    id: 'HOME-01',
    area: 'Home Page – Title',
    tests: ['has correct title'],
    covered: true,
  },
  {
    id: 'HOME-02',
    area: 'Home Page – Hero Heading',
    tests: ['hero heading is visible'],
    covered: true,
  },
  {
    id: 'HOME-03',
    area: 'Home Page – Get Started CTA',
    tests: ['Get started button is present and navigates'],
    covered: true,
  },
  {
    id: 'HOME-04',
    area: 'Home Page – Logo/Nav link',
    tests: ['navbar logo links back to home'],
    covered: true,
  },
  {
    id: 'NAV-01',
    area: 'Navigation – Docs link',
    tests: ['Docs link is in the navbar'],
    covered: true,
  },
  {
    id: 'NAV-02',
    area: 'Navigation – API link',
    tests: ['API link is in the navbar'],
    covered: true,
  },
  {
    id: 'NAV-03',
    area: 'Navigation – GitHub link',
    tests: ['GitHub link is present'],
    covered: true,
  },
  {
    id: 'DOCS-01',
    area: 'Docs Intro – Page loads',
    tests: ['loads /docs/intro'],
    covered: true,
  },
  {
    id: 'DOCS-02',
    area: 'Docs Intro – Installation heading',
    tests: ['page has "Installation" heading'],
    covered: true,
  },
  {
    id: 'DOCS-03',
    area: 'Docs Intro – Sidebar',
    tests: ['sidebar is visible'],
    covered: true,
  },
  {
    id: 'DOCS-04',
    area: 'Docs Intro – Writing Tests sidebar link',
    tests: ['"Writing tests" link exists in sidebar'],
    covered: true,
  },
  {
    id: 'API-01',
    area: 'API Reference – Page loads',
    tests: ['loads /docs/api/class-playwright'],
    covered: true,
  },
  {
    id: 'API-02',
    area: 'API Reference – Playwright class heading',
    tests: ['has Playwright class heading'],
    covered: true,
  },
  {
    id: 'SEARCH-01',
    area: 'Search – Trigger visible on home',
    tests: ['search button / input is present on home'],
    covered: true,
  },
  {
    id: 'SEARCH-02',
    area: 'Search – Opens dialog on docs',
    tests: ['search opens dialog on docs page'],
    covered: true,
  },
  {
    id: 'FOOTER-01',
    area: 'Footer – Rendered',
    tests: ['footer is rendered on home page'],
    covered: true,
  },
  {
    id: 'FOOTER-02',
    area: 'Footer – Copyright text',
    tests: ['footer contains copyright text'],
    covered: true,
  },
  {
    id: 'FOOTER-03',
    area: 'Footer – Discord link',
    tests: ['Discord community link exists'],
    covered: true,
  },
  {
    id: 'WRITING-01',
    area: 'Writing Tests doc – Page loads',
    tests: ['loads /docs/writing-tests'],
    covered: true,
  },
  {
    id: 'WRITING-02',
    area: 'Writing Tests doc – Heading',
    tests: ['has "Writing Tests" heading'],
    covered: true,
  },
  {
    id: 'WRITING-03',
    area: 'Writing Tests doc – Code block',
    tests: ['code block is present'],
    covered: true,
  },
  {
    id: 'BROWSER-01',
    area: 'Browser Support – Chromium',
    tests: ['Chromium mention exists on home page'],
    covered: true,
  },
  {
    id: 'BROWSER-02',
    area: 'Browser Support – Firefox',
    tests: ['Firefox mention exists on home page'],
    covered: true,
  },
  {
    id: 'BROWSER-03',
    area: 'Browser Support – WebKit',
    tests: ['WebKit mention exists on home page'],
    covered: true,
  },
  {
    id: 'MOBILE-01',
    area: 'Mobile – Home page renders',
    tests: ['home page renders on mobile'],
    covered: true,
  },
  {
    id: 'MOBILE-02',
    area: 'Mobile – Hamburger menu',
    tests: ['mobile hamburger menu exists'],
    covered: true,
  },
  {
    id: 'SEO-01',
    area: 'SEO – Meta description',
    tests: ['home page has meta description'],
    covered: true,
  },
  {
    id: 'SEO-02',
    area: 'SEO – Canonical link',
    tests: ['docs page has canonical link'],
    covered: true,
  },
  // ── Not yet covered ──────────────────────────────────────────────────────
  {
    id: 'BLOG-01',
    area: 'Blog / Changelog – Page loads',
    tests: [],
    covered: false,
  },
  {
    id: 'COMMUNITY-01',
    area: 'Community page – Stack Overflow link',
    tests: [],
    covered: false,
  },
  {
    id: 'LANG-01',
    area: 'Multi-language tabs (JS / TS / Python / Java / .NET)',
    tests: [],
    covered: false,
  },
  {
    id: 'DARKMODE-01',
    area: 'Dark / Light mode toggle',
    tests: [],
    covered: false,
  },
];
