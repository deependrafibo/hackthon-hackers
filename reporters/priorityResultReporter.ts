import type { FullConfig, Reporter, Suite, TestCase, TestResult } from '@playwright/test/reporter';
import {
  createApiFolder,
  createPriorityFolder,
  createRunFolder,
  createWebsiteFolder,
  type PriorityLevel,
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

class PriorityResultReporter implements Reporter {
  private runFolder = '';

  async onBegin(_config: FullConfig, _suite: Suite): Promise<void> {
    this.runFolder = await createRunFolder('test-results', process.env.TEST_RUN_ID);
    process.env.TEST_RUN_FOLDER = this.runFolder;
    // Keep this line to make run-folder discovery easy in CI logs.
    console.log(`[priority-reporter] run folder: ${this.runFolder}`);
  }

  async onTestEnd(test: TestCase, result: TestResult): Promise<void> {
    const { apiName, priority, fullTitle } = parseMeta(test);
    const websiteName = resolveWebsiteName(test);
    const websiteFolder = await createWebsiteFolder(this.runFolder, websiteName);
    const apiFolder = await createApiFolder(websiteFolder, apiName);
    const priorityFolder = await createPriorityFolder(apiFolder, priority);

    const attachmentUrls = (
      await Promise.all(
        result.attachments
          .map((a) => a.path)
          .filter(Boolean)
          .map((p) => uploadToCloudinary(p as string))
      )
    ).filter(Boolean);

    await saveTestResult(priorityFolder, {
      title: test.title,
      fullTitle,
      apiName,
      priority,
      status: result.status,
      durationMs: result.duration,
      startedAt: result.startTime.toISOString(),
      finishedAt: new Date(result.startTime.getTime() + result.duration).toISOString(),
      projectName: test.parent.project()?.name || 'unknown-project',
      retry: result.retry,
      workerIndex: result.workerIndex,
      website: process.env.BASE_URL,
      error: result.error?.message,
      attachments: attachmentUrls,
    });
  }
}

export default PriorityResultReporter;
