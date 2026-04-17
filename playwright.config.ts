/**
 * Copyright (c) Microsoft Corporation.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { defineConfig, devices } from '@playwright/test';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

// Load .env from project root so TEST_EMAIL / TEST_PASSWORD are available
dotenv.config({ path: path.resolve(__dirname, '.env') });

const BLOCKPEER_AUTH_FILE = path.join(__dirname, '.auth/blockpeer-session.json');
const CRICKBOX_AUTH_FILE = path.join(__dirname, '.auth/crickbox-session.json');
const BASE_URL = process.env.BASE_URL || process.env.BLOCKPEER_BASE_URL || 'https://staging-react.blockpeer.finance';

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

/** e.g. my-app → MY_APP_BASE_URL */
function suiteSlugToBaseUrlEnvKey(slug: string): string {
  return `${slug.replace(/-/g, '_').toUpperCase()}_BASE_URL`;
}

function getCustomSuiteBaseURL(slug: string): string {
  const key = suiteSlugToBaseUrlEnvKey(slug);
  const fromKey = process.env[key]?.trim();
  if (fromKey)
    return fromKey.replace(/\/?$/, '') + '/';
  const b = process.env.BASE_URL?.trim();
  if (b)
    return b.replace(/\/?$/, '') + '/';
  return BASE_URL.replace(/\/?$/, '') + '/';
}

/** Custom product suites: tests/<slug>/auth.setup.ts (not blockpeer / crickbox). */
function discoverCustomSuites(testsRoot: string): string[] {
  if (!fs.existsSync(testsRoot))
    return [];
  return fs.readdirSync(testsRoot, { withFileTypes: true })
    .filter((d) => d.isDirectory())
    .map((d) => d.name)
    .filter((name) => {
      if (name === 'blockpeer' || name === 'crickbox' || name.startsWith('.'))
        return false;
      if (!/^[a-z0-9][a-z0-9-]*$/.test(name))
        return false;
      return fs.existsSync(path.join(testsRoot, name, 'auth.setup.ts'));
    });
}

const testsRoot = path.join(__dirname, 'tests');
const customSuites = discoverCustomSuites(testsRoot);

const customProjects = customSuites.flatMap((slug) => {
  const bu = getCustomSuiteBaseURL(slug);
  const authFile = path.join(__dirname, `.auth/${slug}-session.json`);
  return [
    {
      name: `${slug}-setup`,
      testMatch: `**/${slug}/auth.setup.ts`,
      use: {
        ...devices['Desktop Chrome'],
        baseURL: bu,
      },
    },
    {
      name: `${slug}-public`,
      testMatch: `**/${slug}/priority-*/public/**/*.spec.ts`,
      use: {
        ...devices['Desktop Chrome'],
        baseURL: bu,
      },
    },
    {
      name: `${slug}-authenticated`,
      testMatch: `**/${slug}/priority-*/authenticated/**/*.spec.ts`,
      dependencies: [`${slug}-setup`],
      use: {
        ...devices['Desktop Chrome'],
        baseURL: bu,
        storageState: authFile,
      },
    },
  ];
});

export default defineConfig({
  testDir: './tests',
  fullyParallel: false,
  globalSetup: require.resolve('./global.setup'),
  forbidOnly: !!process.env.CI,
  workers: 1,
  timeout: 90000,
  reporter: [
    ['list'],
    ['json', { outputFile: jsonOutputFile }],
    [path.resolve(__dirname, './reporters/priorityResultReporter.ts')],
  ],
  maxFailures: process.env.CI ? 1 : 0,
  use: {
    baseURL: BASE_URL,
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
  projects: [
    // Blockpeer (existing suite)
    {
      name: 'blockpeer-setup',
      testMatch: '**/blockpeer/auth.setup.ts',
      use: {
        ...devices['Desktop Chrome'],
        baseURL: process.env.BLOCKPEER_BASE_URL || BASE_URL,
      },
    },
    {
      name: 'blockpeer-public',
      testMatch: '**/blockpeer/priority-*/public/**/*.spec.ts',
      use: {
        ...devices['Desktop Chrome'],
        baseURL: process.env.BLOCKPEER_BASE_URL || BASE_URL,
      },
    },
    {
      name: 'blockpeer-authenticated',
      testMatch: '**/blockpeer/priority-*/authenticated/**/*.spec.ts',
      dependencies: ['blockpeer-setup'],
      use: {
        ...devices['Desktop Chrome'],
        baseURL: process.env.BLOCKPEER_BASE_URL || BASE_URL,
        storageState: BLOCKPEER_AUTH_FILE,   // every test starts already logged in
      },
    },
    // Crickbox (new suite)
    {
      name: 'crickbox-setup',
      testMatch: '**/crickbox/auth.setup.ts',
      use: {
        ...devices['Desktop Chrome'],
        baseURL: process.env.CRICKBOX_BASE_URL || 'https://crick-box07.vercel.app/',
      },
    },
    {
      name: 'crickbox-public',
      testMatch: '**/crickbox/**/*.spec.ts',
      testIgnore: '**/crickbox/authenticated/**/*.spec.ts',
      use: {
        ...devices['Desktop Chrome'],
        baseURL: process.env.CRICKBOX_BASE_URL || 'https://crick-box07.vercel.app/',
      },
    },
    {
      name: 'crickbox-authenticated',
      testMatch: '**/crickbox/authenticated/**/*.spec.ts',
      dependencies: ['crickbox-setup'],
      use: {
        ...devices['Desktop Chrome'],
        baseURL: process.env.CRICKBOX_BASE_URL || 'https://crick-box07.vercel.app/',
        storageState: CRICKBOX_AUTH_FILE,
      },
    },
    ...customProjects,
  ],
});
