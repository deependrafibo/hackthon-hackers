import crypto from 'crypto';
import { promises as fs } from 'fs';
import path from 'path';

export type PriorityLevel = 'high' | 'medium' | 'low';
export type TestOutcome = 'passed' | 'failed';

export interface TestResultPayload {
  title: string;
  fullTitle: string;
  apiName: string;
  priority: PriorityLevel;
  status: string;
  outcome: TestOutcome;
  durationMs: number;
  startedAt: string;
  finishedAt: string;
  projectName: string;
  retry: number;
  workerIndex: number;
  website?: string;
  websiteName?: string;
  error?: string;
  screenshotPaths?: string[];
  attachments?: string[];
  retryCurl?: string;
}

function sanitizeSegment(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9._-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function stripTrailingSlash(url: string): string {
  return url.replace(/\/+$/, '');
}

export function buildRetryCurl(baseURL: string, route: string): string {
  const base = stripTrailingSlash(baseURL);
  const normalizedRoute = route.startsWith('/') ? route : `/${route}`;
  return `curl -s -o /dev/null -w "%{http_code}" -X GET "${base}${normalizedRoute}" -H "Accept: text/html,application/json"`;
}

export async function createRunFolder(baseDir = 'test-results', runId?: string): Promise<string> {
  const safeRunId =
    runId && runId.trim()
      ? sanitizeSegment(runId)
      : `run-${new Date().toISOString().replace(/[:.]/g, '-')}-${process.pid}-${crypto.randomUUID().slice(0, 8)}`;
  const runFolder = path.resolve(process.cwd(), baseDir, safeRunId);
  await fs.mkdir(runFolder, { recursive: true });
  return runFolder;
}

export async function createWebsiteFolder(runFolder: string, websiteName: string): Promise<string> {
  const safeWebsiteName = sanitizeSegment(websiteName || 'unknown-website') || 'unknown-website';
  const websiteFolder = path.join(runFolder, safeWebsiteName);
  await fs.mkdir(websiteFolder, { recursive: true });
  return websiteFolder;
}

export async function createScreenshotFolder(websiteFolder: string): Promise<string> {
  const screenshotFolder = path.join(websiteFolder, 'screenshots');
  await fs.mkdir(screenshotFolder, { recursive: true });
  return screenshotFolder;
}

export async function createApiFolder(parentFolder: string, apiName: string): Promise<string> {
  const safeApiName = sanitizeSegment(apiName || 'unknown-api') || 'unknown-api';
  const apiFolder = path.join(parentFolder, safeApiName);
  await fs.mkdir(apiFolder, { recursive: true });
  return apiFolder;
}

export async function createPriorityFolder(apiFolder: string, priority: PriorityLevel): Promise<string> {
  const safePriority = sanitizeSegment(priority || 'medium') || 'medium';
  const priorityFolder = path.join(apiFolder, `priority-${safePriority}`);
  await fs.mkdir(priorityFolder, { recursive: true });
  return priorityFolder;
}

export async function createOutcomeFolder(priorityFolder: string, outcome: TestOutcome): Promise<string> {
  const outcomeFolder = path.join(priorityFolder, outcome);
  await fs.mkdir(outcomeFolder, { recursive: true });
  return outcomeFolder;
}

export async function saveTestResult(outcomeFolder: string, payload: TestResultPayload): Promise<string> {
  const fileName = [
    Date.now(),
    payload.workerIndex ?? 0,
    payload.retry ?? 0,
    crypto.randomUUID().slice(0, 8),
  ].join('_') + '.json';

  const filePath = path.join(outcomeFolder, fileName);
  await fs.writeFile(filePath, JSON.stringify(payload, null, 2), 'utf8');
  return filePath;
}

export async function copyScreenshotToWebsite(
  screenshotFolder: string,
  originalPath: string,
  testTitle: string,
): Promise<string> {
  const ext = path.extname(originalPath) || '.png';
  const safeName = sanitizeSegment(testTitle).slice(0, 80) || 'screenshot';
  const fileName = `${safeName}-${Date.now()}${ext}`;
  const destPath = path.join(screenshotFolder, fileName);
  try {
    await fs.copyFile(originalPath, destPath);
  } catch {
    return originalPath;
  }
  return destPath;
}

/**
 * Writes the 3 aggregated JSON files at the website folder level:
 *   <websiteFolder>/passed.json
 *   <websiteFolder>/failed.json
 *   <websiteFolder>/full_result.json
 */
export async function writeAggregatedJsons(
  websiteFolder: string,
  results: TestResultPayload[],
): Promise<void> {
  const passed = results.filter((r) => r.outcome === 'passed');
  const failed = results.filter((r) => r.outcome === 'failed');

  await Promise.all([
    fs.writeFile(
      path.join(websiteFolder, 'passed.json'),
      JSON.stringify(passed, null, 2),
      'utf8',
    ),
    fs.writeFile(
      path.join(websiteFolder, 'failed.json'),
      JSON.stringify(failed, null, 2),
      'utf8',
    ),
    fs.writeFile(
      path.join(websiteFolder, 'full_result.json'),
      JSON.stringify(results, null, 2),
      'utf8',
    ),
  ]);
}
