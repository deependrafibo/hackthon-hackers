import path from 'path';
import dotenv from 'dotenv';
import { discoverSites } from './utils/siteDiscovery';

function normalizeAuthorizationHeader(rawToken: string): string {
  const token = rawToken.trim();
  if (!token)
    return '';
  return /^Bearer\s+/i.test(token) ? token : `Bearer ${token}`;
}

function validateEnvironment(): void {
  const sites = discoverSites();

  if (!sites.length) {
    console.error('\n[env] No sites discovered. Add at least one *_BASE_URL entry to your .env file.');
    console.error('[env] Example: MYSITE_BASE_URL=https://mysite.example.com\n');
    throw new Error('No sites discovered from environment variables.');
  }

  const skipAuth = process.env.SKIP_AUTH_SETUP === 'true';
  const warnings: string[] = [];

  for (const site of sites) {
    if (!skipAuth && (!site.email || !site.password)) {
      warnings.push(`  ${site.name.toUpperCase()}: missing ${site.name.toUpperCase()}_EMAIL or ${site.name.toUpperCase()}_PASSWORD (auth tests will be skipped)`);
    }
  }

  console.log(`[env] Discovered ${sites.length} site(s): ${sites.map((s) => s.name).join(', ')}`);
  if (warnings.length) {
    console.warn('[env] Warnings:');
    for (const w of warnings)
      console.warn(w);
  }
}

export default async function globalSetup(): Promise<void> {
  dotenv.config({ path: path.resolve(__dirname, '.env') });
  validateEnvironment();

  const tokenCandidate = process.env.AUTHORIZATION_HEADER || process.env.API_TOKEN || '';
  if (tokenCandidate.trim()) {
    process.env.AUTHORIZATION_HEADER = normalizeAuthorizationHeader(tokenCandidate);
  }
}
