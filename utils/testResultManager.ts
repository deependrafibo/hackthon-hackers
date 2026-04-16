import crypto from 'crypto';
import { promises as fs } from 'fs';
import path from 'path';

export type PriorityLevel = 'high' | 'medium' | 'low';

export interface TestResultPayload {
  title: string;
  fullTitle: string;
  apiName: string;
  priority: PriorityLevel;
  status: string;
  durationMs: number;
  startedAt: string;
  finishedAt: string;
  projectName: string;
  retry: number;
  workerIndex: number;
  error?: string;
  website?: string;
  attachments?: string[];
}

function sanitizeSegment(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9._-]+/g, '-')
    .replace(/^-+|-+$/g, '');
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

export async function createApiFolder(runFolder: string, apiName: string): Promise<string> {
  const safeApiName = sanitizeSegment(apiName || 'unknown-api') || 'unknown-api';
  const apiFolder = path.join(runFolder, safeApiName);
  await fs.mkdir(apiFolder, { recursive: true });
  return apiFolder;
}

export async function createWebsiteFolder(runFolder: string, websiteName: string): Promise<string> {
  const safeWebsiteName = sanitizeSegment(websiteName || 'unknown-website') || 'unknown-website';
  const websiteFolder = path.join(runFolder, safeWebsiteName);
  await fs.mkdir(websiteFolder, { recursive: true });
  return websiteFolder;
}

export async function createPriorityFolder(apiFolder: string, priority: PriorityLevel): Promise<string> {
  const safePriority = sanitizeSegment(priority || 'medium') || 'medium';
  const priorityFolder = path.join(apiFolder, `priority-${safePriority}`);
  await fs.mkdir(priorityFolder, { recursive: true });
  return priorityFolder;
}

export async function saveTestResult(priorityFolder: string, payload: TestResultPayload): Promise<string> {
  const fileName = [
    Date.now(),
    payload.workerIndex ?? 0,
    payload.retry ?? 0,
    crypto.randomUUID().slice(0, 8),
  ].join('_') + '.json';

  const filePath = path.join(priorityFolder, fileName);
  await fs.writeFile(filePath, JSON.stringify(payload, null, 2), 'utf8');
  return filePath;
}
