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
import path from 'path';
import dotenv from 'dotenv';

// Load .env from project root so TEST_EMAIL / TEST_PASSWORD are available
dotenv.config({ path: path.resolve(__dirname, '.env') });

const AUTH_FILE = path.join(__dirname, '.auth/session.json');

export default defineConfig({
  testDir: './tests',
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  workers: 1,
  timeout: 90000,
  reporter: [
    ['list'],
    ['json', { outputFile: 'test-results/results.json' }],
  ],
  maxFailures: process.env.CI ? 1 : 0,
  use: {
    headless: true,
    screenshot: 'on',
    video: 'off',
    navigationTimeout: 60000,
    actionTimeout: 15000,
  },
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
