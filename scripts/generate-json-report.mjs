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
    (r) => r.projectName && !r.projectName.endsWith('-setup'),
  )?.projectName;
  if (!project) return 'unknown-site';
  // strip suffixes like -public, -authenticated, -setup
  return project.replace(/-(public|authenticated|setup)$/, '');
}

const NON_SITE_FOLDERS = new Set(['artifacts', 'html-report', 'screenshots', 'auth']);

/**
 * Returns true if a directory looks like a real site folder
 * (contains full_result.json, passed.json, or failed.json).
 */
async function isSiteDir(dirPath) {
  for (const file of ['full_result.json', 'passed.json', 'failed.json']) {
    try {
      await fs.access(path.join(dirPath, file));
      return true;
    } catch { /* not found */ }
  }
  return false;
}

/**
 * Finds the most recent run-* folder that contains at least one site folder with report data.
 * Returns { runId, runDir } or null if none found.
 */
async function findLatestRun(testResultsDir) {
  let entries;
  try {
    entries = await fs.readdir(testResultsDir, { withFileTypes: true });
  } catch {
    return null;
  }

  const runDirs = entries
    .filter((e) => e.isDirectory() && e.name.startsWith('run-'))
    .map((e) => e.name)
    .sort()
    .reverse(); // newest first

  for (const name of runDirs) {
    const runDir = path.join(testResultsDir, name);
    const children = await fs.readdir(runDir, { withFileTypes: true });
    for (const child of children) {
      if (!child.isDirectory()) continue;
      if (NON_SITE_FOLDERS.has(child.name)) continue;
      if (await isSiteDir(path.join(runDir, child.name))) {
        return { runId: name, runDir };
      }
    }
  }

  return null;
}

async function main() {
  const testResultsDir = path.resolve(process.cwd(), 'test-results');

  // Resolve which run folder to use
  let resolvedRunId = argv['run-id'] || process.env.TEST_RUN_ID || '';
  let runDir;

  if (resolvedRunId) {
    runDir = path.join(testResultsDir, resolvedRunId);
  } else {
    const latest = await findLatestRun(testResultsDir);
    if (!latest) {
      console.error('[json-report] No run-* folders found in test-results/ — run npm test first');
      process.exit(1);
    }
    resolvedRunId = latest.runId;
    runDir = latest.runDir;
    console.log(`[json-report] Auto-detected latest run: ${resolvedRunId}`);
  }

  // The priorityResultReporter already writes structured JSONs per site.
  // Find all site sub-folders and upload them.
  let siteEntries;
  try {
    siteEntries = await fs.readdir(runDir, { withFileTypes: true });
  } catch {
    console.error(`[json-report] Run folder not found: ${runDir}`);
    process.exit(1);
  }

  const siteDirs = siteEntries.filter(
    (e) => e.isDirectory() && !NON_SITE_FOLDERS.has(e.name),
  );

  if (!siteDirs.length) {
    console.warn('[json-report] No site folders found inside run folder — tests may not have completed');
    process.exit(0);
  }

  for (const siteEntry of siteDirs) {
    const siteName = siteEntry.name;
    const siteDir = path.join(runDir, siteName);

    // Read the already-generated structured JSONs
    let fullResults = [];
    try {
      const raw = await fs.readFile(path.join(siteDir, 'full_result.json'), 'utf-8');
      fullResults = JSON.parse(raw);
    } catch {
      // full_result.json not present — parse from results.json if available
      const resultsJsonPath = path.join(runDir, 'results.json');
      try {
        const raw = await fs.readFile(resultsJsonPath, 'utf-8');
        const playwrightReport = JSON.parse(raw);
        walkSuites(playwrightReport.suites || [], [], fullResults);
        const resolvedSite = argSite || deriveSiteName(fullResults);
        for (const r of fullResults) { r.websiteName = resolvedSite; r.website = resolvedSite; }
      } catch {
        console.warn(`[json-report] Skipping site "${siteName}" — no full_result.json or results.json`);
        continue;
      }
    }

    const passed = fullResults.filter((r) => r.outcome === 'passed');
    const failed = fullResults.filter((r) => r.outcome === 'failed');

    // Ensure structured JSONs exist on disk
    await fs.writeFile(path.join(siteDir, 'full_result.json'), JSON.stringify(fullResults, null, 2));
    await fs.writeFile(path.join(siteDir, 'passed.json'), JSON.stringify(passed, null, 2));
    await fs.writeFile(path.join(siteDir, 'failed.json'), JSON.stringify(failed, null, 2));

    console.log(
      `[json-report] site=${siteName} runId=${resolvedRunId}` +
      ` — ${fullResults.length} results (${passed.length} passed, ${failed.length} failed)` +
      ` → ${siteDir}`,
    );

    // Upload to Vercel Blob when token is available
    if (process.env.BLOB_READ_WRITE_TOKEN) {
      console.log(`[json-report] Uploading ${siteName} to Vercel Blob…`);
      const blobPrefix = `report-viewer/runs/${resolvedRunId}/${siteName}`;
      const uploads = [
        ['full_result.json', fullResults],
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
}

main().catch((err) => {
  console.error(`[json-report] Error: ${err.message}`);
  process.exit(1);
});
