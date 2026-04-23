import express from 'express';
import cors from 'cors';
import {
  listRuns,
  listSitesForRun,
  getRunSummary,
  getAllResultsForRun,
  getAllPassedForRun,
  getAllFailedForRun,
  getQualityMetrics,
} from './reportService';

const app = express();
const PORT = Number(process.env.API_PORT) || 4000;

app.use(cors());
app.use(express.json());

function asyncHandler(fn: (req: express.Request, res: express.Response) => Promise<void>) {
  return (req: express.Request, res: express.Response, next: express.NextFunction) => {
    fn(req, res).catch(next);
  };
}

// ─── Health ──────────────────────────────────────────────
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// ─── Runs ────────────────────────────────────────────────
app.get(
  '/api/runs',
  asyncHandler(async (_req, res) => {
    const runs = await listRuns();
    res.json({ runs });
  }),
);

// ─── Sites for a run ────────────────────────────────────
app.get(
  '/api/runs/:runId/sites',
  asyncHandler(async (req, res) => {
    const sites = await listSitesForRun(req.params.runId);
    res.json({ sites });
  }),
);

// ─── Run summary ─────────────────────────────────────────
app.get(
  '/api/runs/:runId/summary',
  asyncHandler(async (req, res) => {
    const summary = await getRunSummary(req.params.runId);
    if (!summary) {
      res.status(404).json({ error: 'No data for this run' });
      return;
    }
    res.json({ summary });
  }),
);

// ─── All results (full_result.json) ─────────────────────
app.get(
  '/api/runs/:runId/results',
  asyncHandler(async (req, res) => {
    const results = await getAllResultsForRun(req.params.runId);
    res.json({ results, count: results.length });
  }),
);

// ─── Passed tests (passed.json) ─────────────────────────
app.get(
  '/api/runs/:runId/passed',
  asyncHandler(async (req, res) => {
    const results = await getAllPassedForRun(req.params.runId);
    res.json({ results, count: results.length });
  }),
);

// ─── Failed tests (failed.json) ─────────────────────────
app.get(
  '/api/runs/:runId/failed',
  asyncHandler(async (req, res) => {
    const results = await getAllFailedForRun(req.params.runId);
    res.json({ results, count: results.length });
  }),
);

// ─── Quality metrics ────────────────────────────────────
app.get(
  '/api/runs/:runId/quality',
  asyncHandler(async (req, res) => {
    const metrics = await getQualityMetrics(req.params.runId);
    res.json({ metrics });
  }),
);

// ─── Raw JSON endpoints (return JSON files as-is) ───────
app.get(
  '/api/runs/:runId/json/passed',
  asyncHandler(async (req, res) => {
    const results = await getAllPassedForRun(req.params.runId);
    res.setHeader('Content-Disposition', `attachment; filename="passed-${req.params.runId}.json"`);
    res.json(results);
  }),
);

app.get(
  '/api/runs/:runId/json/failed',
  asyncHandler(async (req, res) => {
    const results = await getAllFailedForRun(req.params.runId);
    res.setHeader('Content-Disposition', `attachment; filename="failed-${req.params.runId}.json"`);
    res.json(results);
  }),
);

app.get(
  '/api/runs/:runId/json/results',
  asyncHandler(async (req, res) => {
    const results = await getAllResultsForRun(req.params.runId);
    res.setHeader('Content-Disposition', `attachment; filename="full_result-${req.params.runId}.json"`);
    res.json(results);
  }),
);

// ─── Legacy query-param style (compatible with report-viewer) ──
app.get(
  '/api/reports',
  asyncHandler(async (req, res) => {
    const action = (req.query.action as string) || 'runs';
    const runId = (req.query.run as string) || '';

    switch (action) {
      case 'runs': {
        const runs = await listRuns();
        res.json({ runs });
        return;
      }
      case 'summary': {
        if (!runId) { res.status(400).json({ error: 'run param required' }); return; }
        const summary = await getRunSummary(runId);
        res.json({ summary });
        return;
      }
      case 'results': {
        if (!runId) { res.status(400).json({ error: 'run param required' }); return; }
        const results = await getAllResultsForRun(runId);
        res.json({ results });
        return;
      }
      case 'passed': {
        if (!runId) { res.status(400).json({ error: 'run param required' }); return; }
        const passed = await getAllPassedForRun(runId);
        res.json({ results: passed });
        return;
      }
      case 'failed': {
        if (!runId) { res.status(400).json({ error: 'run param required' }); return; }
        const failed = await getAllFailedForRun(runId);
        res.json({ results: failed });
        return;
      }
      case 'quality': {
        if (!runId) { res.status(400).json({ error: 'run param required' }); return; }
        const metrics = await getQualityMetrics(runId);
        res.json({ metrics });
        return;
      }
      default:
        res.status(400).json({ error: `Unknown action: ${action}` });
    }
  }),
);

// ─── Error handler ──────────────────────────────────────
app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error('[server] Error:', err.message);
  res.status(500).json({ error: err.message });
});

app.listen(PORT, () => {
  console.log(`\n  Report API Server running on http://localhost:${PORT}`);
  console.log(`  ─────────────────────────────────────────────`);
  console.log(`  GET  /api/health`);
  console.log(`  GET  /api/runs`);
  console.log(`  GET  /api/runs/:runId/summary`);
  console.log(`  GET  /api/runs/:runId/results`);
  console.log(`  GET  /api/runs/:runId/passed`);
  console.log(`  GET  /api/runs/:runId/failed`);
  console.log(`  GET  /api/runs/:runId/quality`);
  console.log(`  GET  /api/runs/:runId/json/passed`);
  console.log(`  GET  /api/runs/:runId/json/failed`);
  console.log(`  GET  /api/runs/:runId/json/results`);
  console.log(`  GET  /api/reports?action=...&run=...  (legacy)\n`);
});

export default app;
