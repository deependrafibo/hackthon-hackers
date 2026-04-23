#!/usr/bin/env node
import { spawnSync } from 'child_process';
import path from 'path';
import fs from 'fs';
import dotenv from 'dotenv';
import minimist from 'minimist';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

function toList(raw, fallback) {
  if (!raw || !raw.trim())
    return fallback;
  return raw
    .split(',')
    .map((v) => v.trim())
    .filter(Boolean);
}

/**
 * Mirrors utils/siteDiscovery.ts for the .mjs runner.
 * Scans env vars matching *_BASE_URL to build site configs dynamically.
 */
function discoverSites(env = process.env) {
  const reserved = ['BASE_URL'];
  const sites = [];
  const seen = new Set();

  for (const key of Object.keys(env)) {
    if (!key.endsWith('_BASE_URL'))
      continue;
    const prefix = key.slice(0, -'_BASE_URL'.length);
    if (!prefix || reserved.includes(key))
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

    const projects = [`${name}-public`];
    if (hasCustomTests && fs.existsSync(path.join(testsDir, 'authenticated')))
      projects.push(`${name}-authenticated`);

    sites.push({
      name,
      baseURL: rawUrl.replace(/\/+$/, ''),
      email: env[`${prefix}_EMAIL`]?.trim() || env.TEST_EMAIL?.trim() || '',
      password: env[`${prefix}_PASSWORD`]?.trim() || env.TEST_PASSWORD?.trim() || '',
      projects,
    });
  }

  return sites.sort((a, b) => a.name.localeCompare(b.name));
}

const argv = minimist(process.argv.slice(2), {
  string: ['sites', 'priorities', 'run-id'],
  boolean: ['continue-on-failure', 'skip-auth', 'generate-excel'],
  default: { 'generate-excel': true },
});

const allSites = discoverSites();

if (!allSites.length) {
  console.error('[runner] No sites discovered. Add *_BASE_URL entries to .env.');
  process.exit(1);
}

const siteNames = allSites.map((s) => s.name);
const selectedSiteNames = toList(argv.sites || process.env.SITES, siteNames);
const priorityOrder = toList(process.env.PRIORITY_ORDER, ['high', 'medium', 'low']);
const selectedPriorities = toList(argv.priorities, priorityOrder);
const skipAuthSetup = argv['skip-auth'] || process.env.SKIP_AUTH_SETUP === 'true';
const continueOnFailure = argv['continue-on-failure'] || process.env.CONTINUE_ON_FAILURE === 'true';
const generateExcel = argv['generate-excel'] !== false;
const runRootId = argv['run-id'] || `run-${new Date().toISOString().replace(/[:.]/g, '-')}`;

console.log(`[runner] Discovered sites: ${siteNames.join(', ')}`);
console.log(`[runner] Selected: ${selectedSiteNames.join(', ')} | Priorities: ${selectedPriorities.join(', ')}`);

const baseEnv = {
  ...process.env,
  FORCE_COLOR: '1',
};

function runStep({ siteName, baseURL, priority, projects, email, password }) {
  const grepPattern = `@priority:${priority}`;
  const args = ['playwright', 'test', '--grep', grepPattern];
  const projectList = skipAuthSetup ? projects.filter((p) => p.includes('public')) : projects;
  for (const project of projectList)
    args.push('--project', project);

  const sitePrefix = siteName.toUpperCase();
  const env = {
    ...baseEnv,
    BASE_URL: baseURL,
    [`${sitePrefix}_BASE_URL`]: baseURL,
    [`${sitePrefix}_EMAIL`]: email,
    [`${sitePrefix}_PASSWORD`]: password,
    TEST_SITE: siteName,
    TEST_RUN_ID: runRootId,
    SKIP_AUTH_SETUP: skipAuthSetup ? 'true' : 'false',
    TEST_EMAIL: email,
    TEST_PASSWORD: password,
  };

  console.log(`\n[runner] site=${siteName} url=${baseURL} priority=${priority} runId=${runRootId}`);
  const result = spawnSync('npx', args, { stdio: 'inherit', env });
  return result.status === 0;
}

let hasFailure = false;

for (const siteName of selectedSiteNames) {
  const config = allSites.find((s) => s.name === siteName);
  if (!config) {
    console.error(`[runner] Unknown site "${siteName}". Available: ${siteNames.join(', ')}`);
    hasFailure = true;
    if (!continueOnFailure)
      break;
    continue;
  }

  for (const priority of selectedPriorities) {
    const ok = runStep({
      siteName,
      baseURL: config.baseURL,
      priority,
      projects: config.projects,
      email: config.email,
      password: config.password,
    });
    if (!ok) {
      hasFailure = true;
      if (!continueOnFailure)
        break;
    }
  }
  if (hasFailure && !continueOnFailure)
    break;
}

if (generateExcel) {
  const exportResult = spawnSync(
    'node',
    ['scripts/export-test-report.mjs', '--run-id', runRootId],
    { stdio: 'inherit', env: baseEnv },
  );
  if (exportResult.status !== 0)
    hasFailure = true;
}

process.exit(hasFailure ? 1 : 0);
