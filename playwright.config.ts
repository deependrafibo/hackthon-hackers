import { defineConfig, devices, type Project } from '@playwright/test';
import path from 'path';
import dotenv from 'dotenv';
import { discoverSites, type SiteConfig } from './utils/siteDiscovery';

dotenv.config({ path: path.resolve(__dirname, '.env') });

const sites = discoverSites();

function resolveRunId(): string {
  if (process.env.TEST_RUN_ID?.trim())
    return process.env.TEST_RUN_ID.trim();
  return `run-${new Date().toISOString().replace(/[:.]/g, '-')}-${process.pid}`;
}

function normalizeAuthorizationHeader(rawToken: string): string {
  const token = rawToken.trim();
  if (!token)
    return '';
  return /^Bearer\s+/i.test(token) ? token : `Bearer ${token}`;
}

const runId = resolveRunId();
const runFolder = path.join('test-results', runId);
const jsonOutputFile = path.join(runFolder, 'results.json');
const rawHeader = process.env.AUTHORIZATION_HEADER || process.env.API_TOKEN || '';
const authorizationHeader = rawHeader ? normalizeAuthorizationHeader(rawHeader) : '';

function buildProjectsForSite(site: SiteConfig): Project[] {
  const authFile = path.join(__dirname, `.auth/${site.name}-session.json`);
  const projects: Project[] = [];

  const setupName = `${site.name}-setup`;
  projects.push({
    name: setupName,
    testMatch: site.hasCustomAuth
      ? `**/${site.name}/auth.setup.ts`
      : '**/_generic/auth.setup.ts',
    use: {
      ...devices['Desktop Chrome'],
      baseURL: site.baseURL,
    },
  });

  const publicTestMatch: string[] = ['**/_generic/**/*.spec.ts'];
  const publicTestIgnore: string[] = ['**/_generic/auth.setup.ts'];

  if (site.hasCustomTests) {
    publicTestMatch.push(`**/${site.name}/**/*.spec.ts`);
    publicTestIgnore.push(`**/${site.name}/authenticated/**/*.spec.ts`);
    publicTestIgnore.push(`**/${site.name}/auth.setup.ts`);
  }

  projects.push({
    name: `${site.name}-public`,
    testMatch: publicTestMatch,
    testIgnore: publicTestIgnore,
    use: {
      ...devices['Desktop Chrome'],
      baseURL: site.baseURL,
    },
  });

  const authenticatedMatch: string[] = [];
  if (site.hasCustomTests)
    authenticatedMatch.push(`**/${site.name}/authenticated/**/*.spec.ts`);

  if (authenticatedMatch.length) {
    projects.push({
      name: `${site.name}-authenticated`,
      testMatch: authenticatedMatch,
      dependencies: [setupName],
      use: {
        ...devices['Desktop Chrome'],
        baseURL: site.baseURL,
        storageState: authFile,
      },
    });
  }

  return projects;
}

const dynamicProjects = sites.flatMap(buildProjectsForSite);

if (!dynamicProjects.length) {
  console.warn('[config] No sites discovered from env vars (*_BASE_URL). Check your .env file.');
}

export default defineConfig({
  testDir: './tests',
  fullyParallel: false,
  globalSetup: require.resolve('./global.setup'),
  forbidOnly: !!process.env.CI,
  workers: 1,
  timeout: 90000,
  reporter: [
    ['list'],
    ['html', { open: 'never', outputFolder: path.join(runFolder, 'html-report') }],
    ['json', { outputFile: jsonOutputFile }],
    [path.resolve(__dirname, './reporters/priorityResultReporter.ts')],
  ],
  maxFailures: process.env.CI ? 1 : 0,
  use: {
    channel: 'chrome',
    headless: true,
    screenshot: 'on',
    trace: 'retain-on-failure',
    video: 'off',
    navigationTimeout: 60000,
    actionTimeout: 15000,
    extraHTTPHeaders: authorizationHeader ? { Authorization: authorizationHeader } : undefined,
  },
  outputDir: path.join(runFolder, 'artifacts'),
  projects: dynamicProjects,
  projects: [
    // 1. Run login once and save the session
    {
      name: 'setup',
      testMatch: '**/auth.setup.ts',
      use: { channel: 'chrome'},
    },

    // 2. Public pages (login / signup) — no auth needed
    {
      name: 'public',
      testMatch: '**/etrade.spec.ts',
      use: { ...devices['Desktop Chrome'], channel: 'msedge' },
    },

    // 3. Authenticated pages — depends on setup finishing first
    {
      name: 'authenticated',
      testMatch: '**/etrade-authenticated.spec.ts',
      dependencies: ['setup'],
      use: {
        ...devices['Desktop Chrome'],
        channel: 'msedge',
        storageState: AUTH_FILE,   // every test starts already logged in
      },
    },
  ],
});
