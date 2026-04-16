import path from 'path';
import dotenv from 'dotenv';

const SITE_BASE_URL_KEYS: Record<string, string> = {
  blockpeer: 'BLOCKPEER_BASE_URL',
  crickbox: 'CRICKBOX_BASE_URL',
};

const SITE_AUTH_KEYS: Record<string, string[]> = {
  blockpeer: ['BLOCKPEER_EMAIL', 'BLOCKPEER_PASSWORD'],
  crickbox: ['CRICKBOX_EMAIL', 'CRICKBOX_PASSWORD'],
};

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

  const hasBaseUrl =
    (baseUrlKey && process.env[baseUrlKey]?.trim()) || process.env.BASE_URL?.trim();
  if (!hasBaseUrl)
    missing.push(baseUrlKey || 'BASE_URL');

  const shouldValidateAuth = process.env.SKIP_AUTH_SETUP !== 'true';

  if (shouldValidateAuth) {
    const siteAuthKeys = SITE_AUTH_KEYS[site] || [];
    missing.push(...siteAuthKeys.filter((name) => !process.env[name]?.trim()));
  }

  if (!missing.length)
    return;

  console.error('\n[env] Missing required environment variables:');
  for (const name of missing)
    console.error(` - ${name}`);
  console.error('\n[env] Please update your .env file before running tests.\n');
  throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
}

export default async function globalSetup(): Promise<void> {
  dotenv.config({ path: path.resolve(__dirname, '.env') });
  validateEnvironment();

  const tokenCandidate = process.env.AUTHORIZATION_HEADER || process.env.API_TOKEN || '';
  if (tokenCandidate.trim()) {
    process.env.AUTHORIZATION_HEADER = normalizeAuthorizationHeader(tokenCandidate);
  }
}
