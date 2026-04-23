/**
 * Converts Playwright's raw results.json into the structured JSON format
 * expected by the Report Viewer frontend.
 *
 * Output layout:
 *   test-results/<runId>/<site>/full_result.json   – all tests
 *   test-results/<runId>/<site>/passed.json         – passed only
 *   test-results/<runId>/<site>/failed.json         – failed only
 *
 * Usage:
 *   node scripts/generate-json-report.mjs --site=blockpeer --run-id=run-2026-...
 *
 * If --site is omitted, it is derived from project names found in the results.
 */

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import minimist from 'minimist';
import { put } from '@vercel/blob';
import dotenv from 'dotenv';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, '..', '.env') });

const argv = minimist(process.argv.slice(2), {
  string: ['site', 'run-id'],
});

const argSite = argv['site'] || process.env.TEST_SITE || '';
const runId =
  argv['run-id'] ||
  process.env.TEST_RUN_ID ||
  `run-${new Date().toISOString().replace(/[:.]/g, '-')}`;

const PRIORITY_RE = /@priority:(high|medium|low)/i;

function extractPriority(text) {
  const m = PRIORITY_RE.exec(text || '');
  return m ? m[1].toLowerCase() : 'medium';
}

function buildFullTitle(suiteChain, specTitle) {
  return [...suiteChain, specTitle].filter(Boolean).join(' > ');
}

/**
 * The Playwright JSON reporter nests results as:
 *   suites (file) → suites (describe block) → specs (test) → tests (per project) → results (per retry)
 *
 * suiteChain accumulates titles from the root down; the first element is always
 * the filename, so we skip it when building apiName (the describe block title is index 1).
 */
function walkSuites(suites, suiteChain, out) {
  for (const suite of suites) {
    const chain = suite.title ? [...suiteChain, suite.title] : suiteChain;

    for (const spec of suite.specs || []) {
      for (const test of spec.tests || []) {
        for (const result of test.results || []) {
          const status = result.status; // passed | failed | timedOut | skipped | interrupted
          const outcome = status === 'passed' ? 'passed' : 'failed';

          const startedAt = result.startTime
            ? new Date(result.startTime).toISOString()
            : new Date().toISOString();
          const durationMs = result.duration || 0;
          const finishedAt = new Date(new Date(startedAt).getTime() + durationMs).toISOString();

          const fullTitle = buildFullTitle(chain, spec.title);

          // chain[0] = filename suite, chain[1] = describe block — use describe block as apiName
          const apiName = chain.length > 1 ? chain[chain.length - 1] : (spec.title || 'unknown');

          const priority =
            extractPriority(fullTitle) !== 'medium'
              ? extractPriority(fullTitle)
              : extractPriority(spec.title);

          const screenshotPaths = (result.attachments || [])
            .filter((a) => a.contentType?.startsWith('image/'))
            .map((a) => a.path || '')
            .filter(Boolean);

          const attachments = (result.attachments || [])
            .map((a) => a.path || '')
            .filter(Boolean);

          const errorMessage = result.error?.message || '';

          out.push({
            title: spec.title || '',
            fullTitle,
            apiName,
            priority,
            status,
            outcome,
            durationMs,
            startedAt,
            finishedAt,
            projectName: test.projectName || '',
            retry: result.retry || 0,
            workerIndex: result.workerIndex ?? 0,
            websiteName: '', // filled in by caller once site name is resolved
            website: '',
            error: errorMessage || undefined,
            screenshotPaths: screenshotPaths.length ? screenshotPaths : undefined,
            attachments: attachments.length ? attachments : undefined,
          });
        }
      }
    }

    if (suite.suites?.length) {
      walkSuites(suite.suites, chain, out);
    }
  }
}

/**
 * Derive a human-readable site name from the project names present in the results
 * when the caller did not supply --site. Uses the first non-"setup" project name,
 * falling back to "unknown-site".
 */
function deriveSiteName(results) {
  const project = results.find(
    (r) => r.projectName && r.projectName !== 'setup',
  )?.projectName;
  return project || 'unknown-site';
}

async function main() {
  const inputFile = path.resolve(process.cwd(), 'test-results', 'results.json');

  let raw;
  try {
    raw = await fs.readFile(inputFile, 'utf-8');
  } catch {
    console.error(`[json-report] results.json not found at ${inputFile} — skipping`);
    process.exit(0);
  }

  const playwrightReport = JSON.parse(raw);
  const results = [];
  walkSuites(playwrightReport.suites || [], [], results);

  if (!results.length) {
    console.warn('[json-report] No test results found in results.json');
  }

  const siteName = argSite || deriveSiteName(results);

  // Stamp every result with the resolved site name
  for (const r of results) {
    r.websiteName = siteName;
    r.website = siteName;
  }

  const outDir = path.resolve(process.cwd(), 'test-results', runId, siteName);
  await fs.mkdir(outDir, { recursive: true });

  const passed = results.filter((r) => r.outcome === 'passed');
  const failed = results.filter((r) => r.outcome === 'failed');

  await fs.writeFile(path.join(outDir, 'full_result.json'), JSON.stringify(results, null, 2));
  await fs.writeFile(path.join(outDir, 'passed.json'), JSON.stringify(passed, null, 2));
  await fs.writeFile(path.join(outDir, 'failed.json'), JSON.stringify(failed, null, 2));

  console.log(
    `[json-report] site=${siteName} runId=${runId}` +
    ` — ${results.length} results (${passed.length} passed, ${failed.length} failed)` +
    ` → ${outDir}`,
  );

  // Upload to Vercel Blob when token is available
  if (process.env.BLOB_READ_WRITE_TOKEN) {
    console.log('[json-report] Uploading to Vercel Blob…');
    const blobPrefix = `report-viewer/runs/${runId}/${siteName}`;
    const uploads = [
      ['full_result.json', results],
      ['passed.json', passed],
      ['failed.json', failed],
    ];
    for (const [file, data] of uploads) {
      await put(`${blobPrefix}/${file}`, JSON.stringify(data), {
        access: 'public',
        contentType: 'application/json',
        addRandomSuffix: false,
      });
    }
    console.log(`[json-report] Uploaded to Blob → ${blobPrefix}/`);
  }
}

main().catch((err) => {
  console.error(`[json-report] Error: ${err.message}`);
  process.exit(1);
});
