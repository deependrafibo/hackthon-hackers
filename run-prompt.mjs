#!/usr/bin/env node
/**
 * Entry point that forwards args to scripts/run-agent-prompt.mjs.
 *
 * Examples:
 *   node run-prompt.mjs
 *   node run-prompt.mjs --dry-run
 *   node run-prompt.mjs --file scripts/prompts/AGENT_PROMPT.md
 *   node run-prompt.mjs --url https://example.com
 */
import { spawnSync } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const root = path.dirname(fileURLToPath(import.meta.url));
const runner = path.join(root, 'scripts', 'run-agent-prompt.mjs');

const result = spawnSync(process.execPath, [runner, ...process.argv.slice(2)], {
  cwd: root,
  stdio: 'inherit',
});

if (result.error) {
  console.error('[run-prompt]', result.error.message);
  process.exit(1);
}

process.exit(result.status === null ? 1 : result.status);

