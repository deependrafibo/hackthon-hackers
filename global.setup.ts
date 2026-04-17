import path from 'path';
import dotenv from 'dotenv';

const SITE_BASE_URL_KEYS: Record<string, string> = {
  blockpeer: 'BLOCKPEER_BASE_URL',
  crickbox: 'CRICKBOX_BASE_URL',
};

function trim(v: string | undefined): string {
  return (v ?? '').trim();
}

/** Optional .env indirection for Blockpeer: point validation at custom key names (values still live in .env). */
function blockpeerAuthKeyNames(): { email: string; password: string } {
  const ek = trim(process.env.AUTH_EMAIL_ENV_KEY);
  const pk = trim(process.env.AUTH_PASSWORD_ENV_KEY);
  if (ek && pk)
    return { email: ek, password: pk };
  return { email: 'BLOCKPEER_EMAIL', password: 'BLOCKPEER_PASSWORD' };
}

function hasBlockpeerBaseUrl(baseUrlKey: string | undefined): boolean {
  const custom = trim(process.env.AUTH_BASE_URL_ENV_KEY);
  if (custom && trim(process.env[custom]))
    return true;
  return Boolean((baseUrlKey && trim(process.env[baseUrlKey])) || trim(process.env.BASE_URL));
}

function hasCrickboxBaseUrl(baseUrlKey: string | undefined): boolean {
  const custom = trim(process.env.AUTH_BASE_URL_ENV_KEY);
  if (custom && trim(process.env[custom]))
    return true;
  return Boolean((baseUrlKey && trim(process.env[baseUrlKey])) || trim(process.env.BASE_URL));
}

/** tests/<slug>/ — e.g. my-app → MY_APP_BASE_URL */
function suiteSlugToBaseUrlEnvKey(slug: string): string {
  return `${slug.replace(/-/g, '_').toUpperCase()}_BASE_URL`;
}

function hasCustomSuiteBaseUrl(site: string): boolean {
  const custom = trim(process.env.AUTH_BASE_URL_ENV_KEY);
  if (custom && trim(process.env[custom]))
    return true;
  if (trim(process.env[suiteSlugToBaseUrlEnvKey(site)]))
    return true;
  return Boolean(trim(process.env.BASE_URL));
}

/** Custom suite: AUTH_* or <SLUG>_EMAIL / <SLUG>_PASSWORD */
function customAuthKeyNames(site: string): { email: string; password: string } {
  const ek = trim(process.env.AUTH_EMAIL_ENV_KEY);
  const pk = trim(process.env.AUTH_PASSWORD_ENV_KEY);
  if (ek && pk)
    return { email: ek, password: pk };
  const p = site.replace(/-/g, '_').toUpperCase();
  return { email: `${p}_EMAIL`, password: `${p}_PASSWORD` };
}

/** Optional .env indirection for Crickbox: same pattern as Blockpeer (values still in .env). */
function crickboxAuthKeyNames(): { email: string; password: string } {
  const ek = trim(process.env.AUTH_EMAIL_ENV_KEY);
  const pk = trim(process.env.AUTH_PASSWORD_ENV_KEY);
  if (ek && pk)
    return { email: ek, password: pk };
  return { email: 'CRICKBOX_EMAIL', password: 'CRICKBOX_PASSWORD' };
}

function normalizeAuthorizationHeader(rawToken: string): string {
  const token = rawToken.trim();
  if (!token)
    return '';
  return /^Bearer\s+/i.test(token) ? token : `Bearer ${token}`;
}

function validateEnvironment(): void {
  const site = (process.env.TEST_SITE || 'blockpeer').trim();
  const baseUrlKey = SITE_BASE_URL_KEYS[site];
  const missing: string[] = [];

  if (site === 'blockpeer') {
    if (!hasBlockpeerBaseUrl(baseUrlKey))
      missing.push(trim(process.env.AUTH_BASE_URL_ENV_KEY) || baseUrlKey || 'BASE_URL');
  } else if (site === 'crickbox') {
    if (!hasCrickboxBaseUrl(baseUrlKey))
      missing.push(trim(process.env.AUTH_BASE_URL_ENV_KEY) || baseUrlKey || 'BASE_URL');
  } else {
    // Custom suite slug (tests/<site>/): <SLUG>_BASE_URL or AUTH_BASE_URL_ENV_KEY or BASE_URL
    if (!hasCustomSuiteBaseUrl(site))
      missing.push(trim(process.env.AUTH_BASE_URL_ENV_KEY) || suiteSlugToBaseUrlEnvKey(site) || 'BASE_URL');
  }

  const shouldValidateAuth = process.env.SKIP_AUTH_SETUP !== 'true';

  if (shouldValidateAuth) {
    if (site === 'blockpeer') {
      const { email, password } = blockpeerAuthKeyNames();
      if (!trim(process.env[email]))
        missing.push(email);
      if (!trim(process.env[password]))
        missing.push(password);
    } else if (site === 'crickbox') {
      const { email, password } = crickboxAuthKeyNames();
      if (!trim(process.env[email]))
        missing.push(email);
      if (!trim(process.env[password]))
        missing.push(password);
    } else {
      const { email, password } = customAuthKeyNames(site);
      if (!trim(process.env[email]))
        missing.push(email);
      if (!trim(process.env[password]))
        missing.push(password);
    }
  }

  if (!missing.length)
    return;

  console.error('\n[env] Missing required environment variables:');
  for (const name of missing)
    console.error(` - ${name}`);
  console.error('\n[env] Please update your .env file before running tests.\n');
  throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
}

function applyTestGenEnvAliases(): void {
  const t = (v: string | undefined) => (v ?? '').trim();
  const genUrl = t(process.env.TEST_GEN_BASE_URL);
  const genEmail = t(process.env.TEST_GEN_EMAIL);
  const genPassword = t(process.env.TEST_GEN_PASSWORD);

  if (genUrl && !t(process.env.BLOCKPEER_BASE_URL))
    process.env.BLOCKPEER_BASE_URL = genUrl.endsWith('/') ? genUrl : `${genUrl}/`;
  if (genUrl && !t(process.env.BASE_URL))
    process.env.BASE_URL = genUrl.replace(/\/+$/, '') || genUrl;

  if (genEmail && !t(process.env.BLOCKPEER_EMAIL))
    process.env.BLOCKPEER_EMAIL = genEmail;
  if (genEmail && !t(process.env.TEST_EMAIL))
    process.env.TEST_EMAIL = genEmail;

  if (genPassword && !t(process.env.BLOCKPEER_PASSWORD))
    process.env.BLOCKPEER_PASSWORD = genPassword;
  if (genPassword && !t(process.env.TEST_PASSWORD))
    process.env.TEST_PASSWORD = genPassword;
}

export default async function globalSetup(): Promise<void> {
  dotenv.config({ path: path.resolve(__dirname, '.env') });
  applyTestGenEnvAliases();
  validateEnvironment();

  const tokenCandidate = process.env.AUTHORIZATION_HEADER || process.env.API_TOKEN || '';
  if (tokenCandidate.trim()) {
    process.env.AUTHORIZATION_HEADER = normalizeAuthorizationHeader(tokenCandidate);
  }
}
