import type { FullConfig, FullResult, Reporter, Suite, TestCase, TestResult } from '@playwright/test/reporter';
import {
  buildRetryCurl,
  copyScreenshotToWebsite,
  createApiFolder,
  createOutcomeFolder,
  createPriorityFolder,
  createRunFolder,
  createScreenshotFolder,
  createWebsiteFolder,
  stripTrailingSlash,
  writeAggregatedJsons,
  type PriorityLevel,
  type TestOutcome,
  type TestResultPayload,
  saveTestResult,
} from '../utils/testResultManager';
import { uploadToCloudinary } from '../utils/cloudinaryUploader';

const API_TAG_REGEX = /@api:([a-zA-Z0-9._-]+)/;
const PRIORITY_TAG_REGEX = /@priority:(high|medium|low)/;

function parseMeta(test: TestCase): { apiName: string; priority: PriorityLevel; fullTitle: string } {
  const fullTitle = test.titlePath().join(' ');
  const apiName = fullTitle.match(API_TAG_REGEX)?.[1] || 'unknown-api';
  const priority = (fullTitle.match(PRIORITY_TAG_REGEX)?.[1] as PriorityLevel | undefined) || 'medium';
  return { apiName, priority, fullTitle };
}

function resolveWebsiteName(test: TestCase): string {
  if (process.env.TEST_SITE?.trim())
    return process.env.TEST_SITE.trim();
  const projectName = test.parent.project()?.name || '';
  if (projectName.includes('-'))
    return projectName.split('-')[0];
  return 'unknown-website';
}

function resolveBaseURL(test: TestCase): string {
  const projectBaseURL = test.parent.project()?.use?.baseURL || '';
  const siteName = resolveWebsiteName(test).toUpperCase();
  const fromEnv = process.env[`${siteName}_BASE_URL`] || process.env.BASE_URL || '';
  return stripTrailingSlash(projectBaseURL || fromEnv || 'https://unknown.example.com');
}

function deriveOutcome(status: string): TestOutcome {
  return status === 'passed' || status === 'skipped' ? 'passed' : 'failed';
}

function extractRoute(test: TestCase): string {
  const title = test.title.toLowerCase();
  if (title.includes('/'))
    return title.match(/\/([\w/-]+)/)?.[0] || '/';
  return '/';
}

class PriorityResultReporter implements Reporter {
  private runFolder = '';
  private websiteResults = new Map<string, TestResultPayload[]>();

  async onBegin(_config: FullConfig, _suite: Suite): Promise<void> {
    this.runFolder = await createRunFolder('test-results', process.env.TEST_RUN_ID);
    process.env.TEST_RUN_FOLDER = this.runFolder;
    console.log(`[priority-reporter] run folder: ${this.runFolder}`);
  }

  async onTestEnd(test: TestCase, result: TestResult): Promise<void> {
    const { apiName, priority, fullTitle } = parseMeta(test);
    const websiteName = resolveWebsiteName(test);
    const outcome = deriveOutcome(result.status);
    const baseURL = resolveBaseURL(test);

    const websiteFolder = await createWebsiteFolder(this.runFolder, websiteName);
    const screenshotFolder = await createScreenshotFolder(websiteFolder);
    const apiFolder = await createApiFolder(websiteFolder, apiName);
    const priorityFolder = await createPriorityFolder(apiFolder, priority);
    const outcomeFolder = await createOutcomeFolder(priorityFolder, outcome);

    const rawScreenshots = result.attachments
      .filter((a) => a.contentType?.startsWith('image/') && a.path)
      .map((a) => a.path as string);

    const copiedScreenshots: string[] = [];
    for (const src of rawScreenshots) {
      const dest = await copyScreenshotToWebsite(screenshotFolder, src, test.title);
      copiedScreenshots.push(dest);
    }

    const cloudinaryUrls = (
      await Promise.all(rawScreenshots.map((p) => uploadToCloudinary(p)))
    ).filter(Boolean);

    let retryCurl: string | undefined;
    if (outcome === 'failed') {
      const route = extractRoute(test);
      retryCurl = buildRetryCurl(baseURL, route);
    }

    const payload: TestResultPayload = {
      title: test.title,
      fullTitle,
      apiName,
      priority,
      status: result.status,
      outcome,
      durationMs: result.duration,
      startedAt: result.startTime.toISOString(),
      finishedAt: new Date(result.startTime.getTime() + result.duration).toISOString(),
      projectName: test.parent.project()?.name || 'unknown-project',
      retry: result.retry,
      workerIndex: result.workerIndex,
      website: baseURL,
      websiteName,
      error: result.error?.message,
      screenshotPaths: copiedScreenshots.length ? copiedScreenshots : undefined,
      attachments: cloudinaryUrls.length ? cloudinaryUrls : (copiedScreenshots.length ? copiedScreenshots : undefined),
      retryCurl,
    };

    await saveTestResult(outcomeFolder, payload);

    if (!this.websiteResults.has(websiteName))
      this.websiteResults.set(websiteName, []);
    this.websiteResults.get(websiteName)!.push(payload);
  }

  async onEnd(_result: FullResult): Promise<void> {
    for (const [websiteName, results] of this.websiteResults) {
      const websiteFolder = await createWebsiteFolder(this.runFolder, websiteName);
      await writeAggregatedJsons(websiteFolder, results);

      const passed = results.filter((r) => r.outcome === 'passed').length;
      const failed = results.filter((r) => r.outcome === 'failed').length;
      console.log(`[priority-reporter] ${websiteName}: ${results.length} total | ${passed} passed | ${failed} failed`);
    }

    console.log(`[priority-reporter] Aggregated JSONs written (passed.json, failed.json, full_result.json) per website`);
  }
}

export default PriorityResultReporter;
