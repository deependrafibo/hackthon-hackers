#!/usr/bin/env node
import fs from 'fs/promises';
import path from 'path';
import minimist from 'minimist';
import ExcelJS from 'exceljs';

const argv = minimist(process.argv.slice(2), {
  string: ['run-id'],
});

async function exists(targetPath) {
  try {
    await fs.access(targetPath);
    return true;
  } catch {
    return false;
  }
}

async function listDirectories(dirPath) {
  const entries = await fs.readdir(dirPath, { withFileTypes: true });
  return entries.filter((entry) => entry.isDirectory()).map((entry) => entry.name);
}

async function collectJsonFiles(dirPath, output = []) {
  const entries = await fs.readdir(dirPath, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dirPath, entry.name);
    if (entry.isDirectory()) {
      await collectJsonFiles(fullPath, output);
      continue;
    }
    if (entry.isFile() && entry.name.endsWith('.json') && entry.name !== 'results.json')
      output.push(fullPath);
  }
  return output;
}

async function resolveRunFolder(rootDir, runId) {
  if (runId) {
    const folder = path.join(rootDir, runId.toLowerCase());
    if (!(await exists(folder)))
      throw new Error(`Run folder not found: ${folder}`);
    return folder;
  }

  const candidates = await listDirectories(rootDir);
  const runFolders = candidates.filter((name) => name.startsWith('run-')).sort();
  if (!runFolders.length)
    throw new Error(`No run folders found in ${rootDir}`);
  return path.join(rootDir, runFolders[runFolders.length - 1]);
}

function statusRank(status) {
  if (status === 'failed' || status === 'timedOut')
    return 0;
  if (status === 'passed')
    return 1;
  if (status === 'skipped')
    return 2;
  return 3;
}

function colorizeStatusCell(cell, status) {
  const colorMap = {
    passed: 'FFC6EFCE',
    failed: 'FFFFC7CE',
    timedOut: 'FFFFC7CE',
    skipped: 'FFFFEB9C',
  };
  const color = colorMap[status];
  if (!color)
    return;
  cell.fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: color },
  };
}

function formatHeader(sheet) {
  const headerRow = sheet.getRow(1);
  headerRow.font = { bold: true };
  sheet.views = [{ state: 'frozen', ySplit: 1 }];
  sheet.autoFilter = {
    from: { row: 1, column: 1 },
    to: { row: 1, column: sheet.columns.length },
  };
}

function addSummarySheet(workbook, records) {
  const summarySheet = workbook.addWorksheet('Summary');
  summarySheet.columns = [
    { header: 'Website', key: 'website', width: 22 },
    { header: 'Priority', key: 'priority', width: 14 },
    { header: 'Total', key: 'total', width: 12 },
    { header: 'Passed', key: 'passed', width: 12 },
    { header: 'Failed', key: 'failed', width: 12 },
    { header: 'Skipped', key: 'skipped', width: 12 },
    { header: 'Pass Rate %', key: 'passRate', width: 14 },
  ];

  const buckets = new Map();
  for (const record of records) {
    const key = `${record.websiteName}::${record.priority}`;
    if (!buckets.has(key)) {
      buckets.set(key, {
        website: record.websiteName,
        priority: record.priority,
        total: 0,
        passed: 0,
        failed: 0,
        skipped: 0,
      });
    }
    const bucket = buckets.get(key);
    bucket.total += 1;
    if (record.status === 'passed')
      bucket.passed += 1;
    else if (record.status === 'skipped')
      bucket.skipped += 1;
    else
      bucket.failed += 1;
  }

  for (const row of buckets.values()) {
    const passRate = row.total ? ((row.passed / row.total) * 100).toFixed(2) : '0.00';
    summarySheet.addRow({ ...row, passRate });
  }
  formatHeader(summarySheet);
}

function addDetailsSheet(workbook, records, runFolder) {
  const detailsSheet = workbook.addWorksheet('Details');
  detailsSheet.columns = [
    { header: 'Website', key: 'websiteName', width: 22 },
    { header: 'API', key: 'apiName', width: 24 },
    { header: 'Priority', key: 'priority', width: 12 },
    { header: 'Full Title', key: 'fullTitle', width: 70 },
    { header: 'Test Title', key: 'title', width: 48 },
    { header: 'Status', key: 'status', width: 12 },
    { header: 'Duration (ms)', key: 'durationMs', width: 16 },
    { header: 'Project', key: 'projectName', width: 26 },
    { header: 'Started At', key: 'startedAt', width: 28 },
    { header: 'Finished At', key: 'finishedAt', width: 28 },
    { header: 'Error', key: 'error', width: 60 },
    { header: 'Screenshot/Attachment', key: 'attachment', width: 70 },
  ];

  const sortedRecords = [...records].sort((a, b) => {
    const websiteDiff = (a.websiteName || '').localeCompare(b.websiteName || '');
    if (websiteDiff)
      return websiteDiff;
    const priorityDiff = (a.priority || '').localeCompare(b.priority || '');
    if (priorityDiff)
      return priorityDiff;
    const statusDiff = statusRank(a.status) - statusRank(b.status);
    if (statusDiff)
      return statusDiff;
    return (a.fullTitle || '').localeCompare(b.fullTitle || '');
  });

  for (const record of sortedRecords) {
    const attachment = record.attachments?.[0]
      ? path.relative(runFolder, record.attachments[0])
      : '';
    const row = detailsSheet.addRow({
      ...record,
      attachment,
    });
    const statusCell = row.getCell('status');
    colorizeStatusCell(statusCell, record.status);

    const attachmentCell = row.getCell('attachment');
    if (attachment) {
      attachmentCell.value = {
        text: attachment,
        hyperlink: path.resolve(runFolder, attachment),
      };
      attachmentCell.font = { color: { argb: 'FF0563C1' }, underline: true };
    }
  }
  formatHeader(detailsSheet);
}

async function main() {
  const rootDir = path.resolve(process.cwd(), 'test-results');
  const runFolder = await resolveRunFolder(rootDir, argv['run-id']);
  const jsonFiles = await collectJsonFiles(runFolder);

  const records = [];
  for (const filePath of jsonFiles) {
    const raw = await fs.readFile(filePath, 'utf8');
    const parsed = JSON.parse(raw);
    const relativeParts = path.relative(runFolder, filePath).split(path.sep);
    const websiteName = relativeParts[0] || 'unknown-website';
    records.push({ websiteName, ...parsed });
  }

  const workbook = new ExcelJS.Workbook();
  workbook.creator = 'Playwright Priority Runner';
  workbook.created = new Date();
  addSummarySheet(workbook, records);
  addDetailsSheet(workbook, records, runFolder);

  const summaryDir = path.join(runFolder, 'summary');
  await fs.mkdir(summaryDir, { recursive: true });
  const outputFile = path.join(summaryDir, 'final-test-report.xlsx');
  await workbook.xlsx.writeFile(outputFile);
  console.log(`[excel] Report generated at ${outputFile}`);
}

main().catch((error) => {
  console.error(`[excel] Failed to generate report: ${error.message}`);
  process.exit(1);
});
