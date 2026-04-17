#!/usr/bin/env node
/**
 * Loads scripts/prompts/AGENT_PROMPT.md (or --file), resolves site URL from (in order):
 *   1) CLI --url
 *    2) [PROMPT_CONFIG] TARGET_SITE_URL=...
 *   3) .env[BASE_URL_ENV_KEY] when BASE_URL_ENV_KEY is set in [PROMPT_CONFIG] (no cross-site fallback if the key is missing)
 *   4) Suite-specific / legacy: Crickbox → CRICKBOX_BASE_URL; else TEST_GEN_* → BLOCKPEER_* / BASE_URL
 * Sets AUTH_EMAIL_ENV_KEY / AUTH_PASSWORD_ENV_KEY / AUTH_BASE_URL_ENV_KEY for global.setup + auth.setup indirection.
 * Injects a header (URL + key names + masked login hint) and runs `agent -p`.
 *
 *   node scripts/run-agent-prompt.mjs
 *   node scripts/run-agent-prompt.mjs --dry-run
 *   node scripts/run-agent-prompt.mjs --file ./other.md
 *
 * Prerequisites: https://cursor.com/docs/cli/headless
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { spawnSync } from 'child_process';
import minimist from 'minimist';
import dotenv from 'dotenv';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, '..');
const defaultPromptFile = path.join(__dirname, 'prompts', 'AGENT_PROMPT.md');

const argv = minimist(process.argv.slice(2), {
  string: ['file', 'url'],
  boolean: ['dry-run', 'no-force', 'help'],
  alias: { h: 'help', f: 'file' },
});

function trim(v) {
  return (v ?? '').trim();
}

/** my-app → MY_APP_BASE_URL */
function suiteSlugToBaseUrlEnvKey(slug) {
  return `${slug.replace(/-/g, '_').toUpperCase()}_BASE_URL`;
}

function suiteSlugToEmailEnvKey(slug) {
  return `${slug.replace(/-/g, '_').toUpperCase()}_EMAIL`;
}

function suiteSlugToPasswordEnvKey(slug) {
  return `${slug.replace(/-/g, '_').toUpperCase()}_PASSWORD`;
}

function applyTestGenEnvAliases() {
  const genUrl = trim(process.env.TEST_GEN_BASE_URL);
  const genEmail = trim(process.env.TEST_GEN_EMAIL);
  const genPassword = trim(process.env.TEST_GEN_PASSWORD);

  if (genUrl && !trim(process.env.BLOCKPEER_BASE_URL))
    process.env.BLOCKPEER_BASE_URL = genUrl.endsWith('/') ? genUrl : `${genUrl}/`;
  if (genUrl && !trim(process.env.BASE_URL))
    process.env.BASE_URL = genUrl.replace(/\/+$/, '') || genUrl;

  if (genEmail && !trim(process.env.BLOCKPEER_EMAIL))
    process.env.BLOCKPEER_EMAIL = genEmail;
  if (genEmail && !trim(process.env.TEST_EMAIL))
    process.env.TEST_EMAIL = genEmail;

  if (genPassword && !trim(process.env.BLOCKPEER_PASSWORD))
    process.env.BLOCKPEER_PASSWORD = genPassword;
  if (genPassword && !trim(process.env.TEST_PASSWORD))
    process.env.TEST_PASSWORD = genPassword;
}

function parsePromptConfigBlock(raw) {
  // Prefer fenced ```ini … ``` so Markdown preview does not treat `#` lines as headings.
  const fenced =
    /```(?:\w+)?\s*\r?\n\[PROMPT_CONFIG\]([\s\S]*?)\[\/PROMPT_CONFIG\]\s*\r?\n```/;
  const plain = /\[PROMPT_CONFIG\]([\s\S]*?)\[\/PROMPT_CONFIG\]\s*/;

  let fullMatch;
  let inner;

  const fm = raw.match(fenced);
  if (fm) {
    fullMatch = fm[0];
    inner = fm[1];
  } else {
    const pm = raw.match(plain);
    if (!pm)
      return { vars: {}, body: raw };
    fullMatch = pm[0];
    inner = pm[1];
  }

  const vars = {};
  for (const line of inner.split(/\r?\n/)) {
    const t = line.trim();
    if (!t || t.startsWith('#') || t.startsWith(';'))
      continue;
    const eq = t.indexOf('=');
    if (eq === -1)
      continue;
    vars[t.slice(0, eq).trim()] = t.slice(eq + 1).trim();
  }
  return { vars, body: raw.replace(fullMatch, '') };
}

/** SUITE, SUITE_NAME, and TEST_SUITE are aliases — all set the product / folder name at the top of the prompt. */
function normalizePromptConfigSuite(vars) {
  const merged = trim(vars.SUITE) || trim(vars.SUITE_NAME) || trim(vars.TEST_SUITE);
  if (merged)
    vars.SUITE = merged;
}

function detectSuite(vars, promptPath) {
  const s = trim(vars.SUITE).toLowerCase();
  if (!s) {
    if (/crickbox/i.test(promptPath))
      return 'crickbox';
    return 'blockpeer';
  }
  if (s === 'crickbox' || s === 'blockpeer')
    return s;
  if (/^[a-z0-9][a-z0-9-]{0,62}$/.test(s))
    return s;
  console.warn('[run-agent-prompt] Invalid SUITE (use lowercase letters, digits, hyphens). Falling back to blockpeer.');
  return 'blockpeer';
}

function pickUrlFromEnv(baseUrlEnvKeyFromPrompt, suite) {
  applyTestGenEnvAliases();
  const fromPromptKey = trim(baseUrlEnvKeyFromPrompt);
  if (fromPromptKey) {
    const v = trim(process.env[fromPromptKey]);
    if (v)
      return v.replace(/\/+$/, '');
    // Key named in [PROMPT_CONFIG] but unset: do not fall back to another site's URL.
    return '';
  }
  if (suite === 'crickbox') {
    const cb = trim(process.env.CRICKBOX_BASE_URL)?.replace(/\/+$/, '');
    if (cb)
      return cb;
    // Do not fall back to Blockpeer / TEST_GEN URLs when targeting Crickbox.
    return '';
  }
  if (suite !== 'blockpeer' && suite !== 'crickbox') {
    const k = suiteSlugToBaseUrlEnvKey(suite);
    const fromSlug = trim(process.env[k]);
    if (fromSlug)
      return fromSlug.replace(/\/+$/, '');
    return trim(process.env.BASE_URL)?.replace(/\/+$/, '') || '';
  }
  return (
    trim(process.env.TEST_GEN_BASE_URL)?.replace(/\/+$/, '') ||
    trim(process.env.BLOCKPEER_BASE_URL)?.replace(/\/+$/, '') ||
    trim(process.env.BASE_URL)?.replace(/\/+$/, '') ||
    ''
  );
}

/**
 * Mirror [PROMPT_CONFIG] key names into AUTH_* so global.setup.ts and auth.setup.ts
 * validate and read the same keys without duplicating names in .env.
 */
function mergeAuthIndirectionEnv(emailKey, passwordKey, baseUrlEnvKey) {
  const out = {
    AUTH_EMAIL_ENV_KEY: emailKey,
    AUTH_PASSWORD_ENV_KEY: passwordKey,
  };
  const bk = trim(baseUrlEnvKey);
  if (bk)
    out.AUTH_BASE_URL_ENV_KEY = bk;
  return out;
}

/** Merge URL into env for the spawned agent (Blockpeer vs Crickbox vs custom tests/<slug>/). */
function mergePlaywrightChildEnv(resolvedUrl, suite) {
  const u = trim(resolvedUrl).replace(/\/+$/, '');
  if (!u)
    return {};
  if (suite === 'crickbox') {
    return {
      BASE_URL: u,
      CRICKBOX_BASE_URL: `${u}/`,
      TEST_SITE: 'crickbox',
    };
  }
  if (suite === 'blockpeer') {
    return {
      BASE_URL: u,
      BLOCKPEER_BASE_URL: `${u}/`,
      TEST_SITE: 'blockpeer',
    };
  }
  const envKey = suiteSlugToBaseUrlEnvKey(suite);
  return {
    BASE_URL: u,
    TEST_SITE: suite,
    TEST_SUITE_BASE_URL: `${u}/`,
    [envKey]: `${u}/`,
  };
}

function maskLoginHint(emailKey, passwordKey, suite) {
  const e =
    trim(process.env[emailKey]) ||
    (suite === 'crickbox' ? trim(process.env.CRICKBOX_EMAIL) : '') ||
    trim(process.env.BLOCKPEER_EMAIL) ||
    trim(process.env.TEST_EMAIL) ||
    trim(process.env.TEST_GEN_EMAIL);
  const p =
    trim(process.env[passwordKey]) ||
    (suite === 'crickbox' ? trim(process.env.CRICKBOX_PASSWORD) : '') ||
    trim(process.env.BLOCKPEER_PASSWORD) ||
    trim(process.env.TEST_PASSWORD) ||
    trim(process.env.TEST_GEN_PASSWORD);
  const bits = [];
  if (e) {
    const at = e.indexOf('@');
    bits.push(at > 0 ? `${emailKey}: ${e[0]}***@${e.slice(at + 1)}` : `${emailKey}: (set)`);
  } else {
    bits.push(`${emailKey}: not set`);
  }
  bits.push(p ? `${passwordKey}: set` : `${passwordKey}: not set`);
  return bits.join('; ');
}

function printHelp() {
  console.log(`Usage:
  node scripts/run-agent-prompt.mjs [--file path/to/prompt.md] [--url https://...] [--dry-run] [--no-force]

URL resolution order:
  1) --url
  2) TARGET_SITE_URL= in [PROMPT_CONFIG]
  3) BASE_URL_ENV_KEY= in [PROMPT_CONFIG] → read that variable from .env
  4) TEST_GEN_BASE_URL → BLOCKPEER_BASE_URL → BASE_URL (after TEST_GEN_* aliases)

[PROMPT_CONFIG] can set SUITE (or SUITE_NAME / TEST_SUITE), EMAIL_ENV_KEY, PASSWORD_ENV_KEY, BASE_URL_ENV_KEY.
  If BASE_URL_ENV_KEY is set, only that .env variable (or --url / TARGET_SITE_URL) supplies the URL — no cross-site fallback.
  Optional: a thin prompt file can use {{DEFAULT_AGENT_PROMPT_BODY}} to include the body of scripts/prompts/AGENT_PROMPT.md.

Default prompt: ${defaultPromptFile}
`);
}

function resolveAgentBinary() {
  const which = spawnSync('which', ['agent'], { encoding: 'utf8' });
  if (which.status === 0 && which.stdout.trim())
    return 'agent';
  const home = process.env.HOME || process.env.USERPROFILE || '';
  const local = path.join(home, '.local', 'bin', 'agent');
  if (fs.existsSync(local))
    return local;
  return null;
}

function main() {
  if (argv.help) {
    printHelp();
    process.exit(0);
  }

  const promptPath = path.resolve(argv.file || defaultPromptFile);
  if (!fs.existsSync(promptPath)) {
    console.error('[run-agent-prompt] Prompt file not found:', promptPath);
    process.exit(1);
  }

  dotenv.config({ path: path.join(repoRoot, '.env') });

  const raw = fs.readFileSync(promptPath, 'utf8');
  const { vars, body: bodyNoConfig } = parsePromptConfigBlock(raw);
  normalizePromptConfigSuite(vars);
  const suite = detectSuite(vars, promptPath);

  const emailKey =
    trim(vars.EMAIL_ENV_KEY) ||
    (suite === 'crickbox' ? 'CRICKBOX_EMAIL' : suite === 'blockpeer' ? 'BLOCKPEER_EMAIL' : suiteSlugToEmailEnvKey(suite));
  const passwordKey =
    trim(vars.PASSWORD_ENV_KEY) ||
    (suite === 'crickbox' ? 'CRICKBOX_PASSWORD' : suite === 'blockpeer' ? 'BLOCKPEER_PASSWORD' : suiteSlugToPasswordEnvKey(suite));
  const baseUrlEnvKey = trim(vars.BASE_URL_ENV_KEY) || '';

  const resolved =
    trim(argv.url) ||
    trim(vars.TARGET_SITE_URL) ||
    pickUrlFromEnv(baseUrlEnvKey, suite);

  if (!resolved) {
    console.error('[run-agent-prompt] No site URL. Do one of:');
    console.error('  - Set TARGET_SITE_URL= in [PROMPT_CONFIG], or');
    if (baseUrlEnvKey)
      console.error(`  - Set ${baseUrlEnvKey}=https://... in .env (BASE_URL_ENV_KEY in [PROMPT_CONFIG] names this key), or`);
    else
      console.error('  - Set BASE_URL_ENV_KEY=MY_KEY and MY_KEY=https://... in .env, or');
    if (!baseUrlEnvKey && suite === 'crickbox')
      console.error('  - Set CRICKBOX_BASE_URL in .env (Crickbox fallback when BASE_URL_ENV_KEY is empty), or');
    if (!baseUrlEnvKey && suite !== 'blockpeer' && suite !== 'crickbox')
      console.error(`  - Set ${suiteSlugToBaseUrlEnvKey(suite)}=https://... in .env (custom suite), or`);
    if (!baseUrlEnvKey && suite === 'blockpeer')
      console.error('  - Set TEST_GEN_BASE_URL / BLOCKPEER_BASE_URL / BASE_URL in .env (when BASE_URL_ENV_KEY is empty), or');
    console.error('  - Pass --url https://...');
    process.exit(1);
  }

  let urlSource = 'fallback chain';
  if (trim(argv.url))
    urlSource = 'CLI --url';
  else if (trim(vars.TARGET_SITE_URL))
    urlSource = '[PROMPT_CONFIG] TARGET_SITE_URL';
  else if (baseUrlEnvKey && trim(process.env[baseUrlEnvKey]))
    urlSource = `[PROMPT_CONFIG] BASE_URL_ENV_KEY=${baseUrlEnvKey}`;
  else if (suite === 'crickbox' && trim(process.env.CRICKBOX_BASE_URL))
    urlSource = '.env CRICKBOX_BASE_URL';
  else if (suite !== 'blockpeer' && suite !== 'crickbox' && trim(process.env[suiteSlugToBaseUrlEnvKey(suite)]))
    urlSource = `.env ${suiteSlugToBaseUrlEnvKey(suite)}`;
  else
    urlSource = '.env (TEST_GEN_BASE_URL / BLOCKPEER_BASE_URL / BASE_URL)';

  let body = bodyNoConfig;
  if (body.includes('{{DEFAULT_AGENT_PROMPT_BODY}}')) {
    const rawDefault = fs.readFileSync(defaultPromptFile, 'utf8');
    const { body: defaultBody } = parsePromptConfigBlock(rawDefault);
    body = body.replaceAll('{{DEFAULT_AGENT_PROMPT_BODY}}', defaultBody);
  }
  body = body
    .replaceAll('{{TARGET_BASE_URL}}', resolved)
    .replaceAll('{{EMAIL_ENV_KEY}}', emailKey)
    .replaceAll('{{PASSWORD_ENV_KEY}}', passwordKey)
    .replaceAll('{{BASE_URL_ENV_KEY}}', baseUrlEnvKey || '(not set — URL from CLI / TARGET_SITE_URL / fallbacks)')
    .replaceAll('{{SUITE}}', suite);

  const testSiteLine =
    suite === 'crickbox'
      ? `- \`TEST_SITE=crickbox\` is set for this agent run.\n`
      : suite === 'blockpeer'
        ? `- \`TEST_SITE=blockpeer\` is set for this agent run.\n`
        : `- \`TEST_SITE=${suite}\` is set for this agent run (custom suite: tests/${suite}/).\n`;
  const authNote =
    `- This run sets \`AUTH_EMAIL_ENV_KEY\` / \`AUTH_PASSWORD_ENV_KEY\` (and \`AUTH_BASE_URL_ENV_KEY\` when \`BASE_URL_ENV_KEY\` is set in the prompt) so \`global.setup.ts\` and \`auth.setup.ts\` use the **same** key names as above. Values stay only in \`.env\`.\n` +
    testSiteLine;

  const baseUrlBullet = baseUrlEnvKey
    ? `  - Base URL key: \`${baseUrlEnvKey}\` → \`process.env['${baseUrlEnvKey}']\`\n`
    : `  - Base URL key: *(not set in [PROMPT_CONFIG])* — URL came from \`TARGET_SITE_URL\`, \`--url\`, or legacy .env fallbacks. Set \`BASE_URL_ENV_KEY\` to pin one .env variable for the site URL.\n`;

  const injected =
    `## Auto-injected by run-agent-prompt (never log secret values)\n\n` +
    `- **Playwright suite (\`SUITE\`):** ${suite}\n` +
    `- **Resolved site URL:** ${resolved}\n` +
    `- **URL source:** ${urlSource}\n` +
    `- **\`.env\` key names (values only in \`.env\`, never in this prompt):**\n` +
    baseUrlBullet +
    `  - Email: \`${emailKey}\` → \`process.env['${emailKey}']\`\n` +
    `  - Password: \`${passwordKey}\` → \`process.env['${passwordKey}']\`\n` +
    `- **Masked status:** ${maskLoginHint(emailKey, passwordKey, suite)}\n` +
    authNote +
    `- Repo loads \`.env\`; \`global.setup.ts\` applies TEST_GEN_* → BLOCKPEER_* aliases when present.\n\n` +
    `---\n\n`;

  const singleRunBanner =
    'You are running under a single non-interactive `agent -p` invocation. ' +
    'Complete the entire user prompt in this run: all files, all priorities/modules requested, ' +
    'run tests, fix what you broke. Do not ask the user to continue in another message.\n\n---\n\n';

  body = singleRunBanner + injected + body;

  const childEnv = {
    ...process.env,
    ...mergeAuthIndirectionEnv(emailKey, passwordKey, baseUrlEnvKey),
    ...mergePlaywrightChildEnv(resolved, suite),
  };

  if (argv['dry-run']) {
    console.log('[run-agent-prompt] dry-run OK');
    console.log('  SUITE:', suite);
    console.log('  URL:', resolved);
    console.log('  source:', urlSource);
    console.log('  EMAIL_ENV_KEY:', emailKey, '| PASSWORD_ENV_KEY:', passwordKey);
    if (baseUrlEnvKey)
      console.log('  AUTH_BASE_URL_ENV_KEY:', baseUrlEnvKey);
    console.log('  credentials:', maskLoginHint(emailKey, passwordKey, suite));
    console.log('  prompt file:', path.relative(repoRoot, promptPath));
    console.log('  payload chars:', body.length);
    process.exit(0);
  }

  const agentBin = resolveAgentBinary();
  if (!agentBin) {
    console.error('[run-agent-prompt] Missing `agent` (Cursor Agent CLI) on PATH.');
    console.error('[run-agent-prompt] Install (macOS/Linux):  curl https://cursor.com/install -fsS | bash');
    console.error('[run-agent-prompt] Then add to PATH (zsh):  echo \'export PATH="$HOME/.local/bin:$PATH"\' >> ~/.zshrc && source ~/.zshrc');
    console.error('[run-agent-prompt] Verify:  which agent && agent --version');
    console.error('[run-agent-prompt] Docs: https://cursor.com/docs/cli/installation');
    process.exit(1);
  }

  if (!process.env.CURSOR_API_KEY?.trim())
    console.warn('[run-agent-prompt] CURSOR_API_KEY unset; headless runs may fail (see Cursor auth docs).');

  const args = argv['no-force'] ? ['-p', body] : ['-p', '--force', body];
  console.log('[run-agent-prompt] Running', agentBin, argv['no-force'] ? '-p' : '-p --force', `(${body.length} chars)`);
  console.log('[run-agent-prompt] suite:', suite, '| URL:', resolved, '|', urlSource);

  const result = spawnSync(agentBin, args, {
    cwd: repoRoot,
    stdio: 'inherit',
    env: childEnv,
  });

  if (result.error) {
    console.error('[run-agent-prompt] Spawn error:', result.error.message);
    process.exit(1);
  }
  process.exit(result.status ?? 1);
}

main();
