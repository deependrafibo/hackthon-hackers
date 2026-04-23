import fs from 'fs';
import path from 'path';

export interface SiteConfig {
  name: string;
  baseURL: string;
  email: string;
  password: string;
  authRoute: string;
  hasCustomTests: boolean;
  hasCustomAuth: boolean;
}

const RESERVED_PREFIXES = ['BASE_URL', 'TEST_EMAIL', 'TEST_PASSWORD', 'TEST_SITE', 'TEST_RUN'];

function stripTrailingSlash(url: string): string {
  return url.replace(/\/+$/, '');
}

/**
 * Scans process.env for entries matching `<NAME>_BASE_URL` and builds a
 * SiteConfig for each discovered site. This lets users add any number of
 * websites to `.env` without touching code.
 *
 * Convention:
 *   <SITENAME>_BASE_URL   = https://...       (required)
 *   <SITENAME>_EMAIL      = user@example.com  (optional)
 *   <SITENAME>_PASSWORD   = secret            (optional)
 *   <SITENAME>_AUTH_ROUTE = /auth/signin      (optional, default /auth/signin)
 */
export function discoverSites(env: Record<string, string | undefined> = process.env): SiteConfig[] {
  const sites: SiteConfig[] = [];
  const seen = new Set<string>();

  for (const key of Object.keys(env)) {
    if (!key.endsWith('_BASE_URL'))
      continue;

    const prefix = key.slice(0, -'_BASE_URL'.length);
    if (!prefix || RESERVED_PREFIXES.includes(key))
      continue;

    const rawUrl = env[key]?.trim();
    if (!rawUrl)
      continue;

    const name = prefix.toLowerCase();
    if (seen.has(name))
      continue;
    seen.add(name);

    const testsDir = path.resolve(process.cwd(), 'tests', name);
    const hasCustomTests = fs.existsSync(testsDir);
    const hasCustomAuth = hasCustomTests && fs.existsSync(path.join(testsDir, 'auth.setup.ts'));

    sites.push({
      name,
      baseURL: stripTrailingSlash(rawUrl),
      email: env[`${prefix}_EMAIL`]?.trim() || env.TEST_EMAIL?.trim() || '',
      password: env[`${prefix}_PASSWORD`]?.trim() || env.TEST_PASSWORD?.trim() || '',
      authRoute: env[`${prefix}_AUTH_ROUTE`]?.trim() || '/auth/signin',
      hasCustomTests,
      hasCustomAuth,
    });
  }

  return sites.sort((a, b) => a.name.localeCompare(b.name));
}

export function discoverSiteNames(env: Record<string, string | undefined> = process.env): string[] {
  return discoverSites(env).map((s) => s.name);
}

export function getSiteConfig(siteName: string, env: Record<string, string | undefined> = process.env): SiteConfig | undefined {
  return discoverSites(env).find((s) => s.name === siteName.toLowerCase());
}
