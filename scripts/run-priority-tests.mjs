#!/usr/bin/env node
import { spawnSync } from 'child_process';
import path from 'path';
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

function sanitizePart(value) {
  return value
    .toLowerCase()
    .replace(/^https?:\/\//, '')
    .replace(/[^a-z0-9._-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

const argv = minimist(process.argv.slice(2), {
  string: ['sites', 'priorities', 'run-id'],
  boolean: ['continue-on-failure', 'skip-auth', 'generate-excel'],
  default: { 'generate-excel': true },
});

const websiteConfig = {
  blockpeer: {
    baseURL: process.env.BLOCKPEER_BASE_URL || process.env.BASE_URL || 'https://staging-react.blockpeer.finance',
    email: process.env.BLOCKPEER_EMAIL || process.env.TEST_EMAIL || '',
    password: process.env.BLOCKPEER_PASSWORD || process.env.TEST_PASSWORD || '',
    projects: ['blockpeer-public', 'blockpeer-authenticated'],
  },
  crickbox: {
    baseURL: process.env.CRICKBOX_BASE_URL || 'https://crick-box07.vercel.app/',
    email: process.env.CRICKBOX_EMAIL || '',
    password: process.env.CRICKBOX_PASSWORD || '',
    projects: ['crickbox-public', 'crickbox-authenticated'],
  },
};

const selectedSites = toList(
  argv.sites || process.env.SITES,
  Object.keys(websiteConfig),
);
const priorityOrder = toList(process.env.PRIORITY_ORDER, ['high', 'medium', 'low']);
const selectedPriorities = toList(argv.priorities, priorityOrder);
const skipAuthSetup = argv['skip-auth'] || process.env.SKIP_AUTH_SETUP === 'true';
const continueOnFailure = argv['continue-on-failure'] || process.env.CONTINUE_ON_FAILURE === 'true';
const generateExcel = argv['generate-excel'] !== false;
const runRootId = argv['run-id'] || `run-${new Date().toISOString().replace(/[:.]/g, '-')}`;

const baseEnv = {
  ...process.env,
  FORCE_COLOR: '1',
};

function runStep({ siteName, baseURL, priority, projects, email, password }) {
  const grepPattern = `@priority:${priority}`;

  const args = ['playwright', 'test', '--grep', grepPattern];
  const projectList = skipAuthSetup ? projects.filter((name) => name.includes('public')) : projects;
  for (const project of projectList)
    args.push('--project', project);

  const env = {
    ...baseEnv,
    BASE_URL: baseURL,
    TEST_SITE: siteName,
    TEST_RUN_ID: runRootId,
    SKIP_AUTH_SETUP: skipAuthSetup ? 'true' : 'false',
    TEST_EMAIL: email,
    TEST_PASSWORD: password,
  };

  console.log(`\n[runner] site=${siteName} website=${baseURL} priority=${priority} runId=${runRootId}`);
  const result = spawnSync('npx', args, { stdio: 'inherit', env });
  return result.status === 0;
}

let hasFailure = false;

for (const siteName of selectedSites) {
  const config = websiteConfig[siteName];
  if (!config) {
    console.error(`[runner] Unknown site "${siteName}". Valid values: ${Object.keys(websiteConfig).join(', ')}`);
    hasFailure = true;
    break;
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
