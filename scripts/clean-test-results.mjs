#!/usr/bin/env node
import fs from 'fs/promises';
import path from 'path';

const target = path.resolve(process.cwd(), 'test-results');

async function cleanDirectory(dirPath) {
  await fs.mkdir(dirPath, { recursive: true });
  const entries = await fs.readdir(dirPath, { withFileTypes: true });
  await Promise.all(entries.map(async (entry) => {
    const fullPath = path.join(dirPath, entry.name);
    await fs.rm(fullPath, { recursive: true, force: true });
  }));
}

cleanDirectory(target)
  .then(() => {
    console.log(`[clean] Removed old test result artifacts from ${target}`);
  })
  .catch((error) => {
    console.error(`[clean] Failed to clean test-results: ${error.message}`);
    process.exit(1);
  });
