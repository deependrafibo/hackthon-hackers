#!/usr/bin/env node
/**
 * graph.js — Knowledge graph generator for Blockpeer Finance test suite
 *
 * Inspired by graphify's three-pass pipeline (detect → extract → build →
 * cluster → analyze → export), implemented natively in Node.js.
 * No Python, no external packages — uses only Node built-ins.
 *
 * Outputs:
 *   graphify-out/graph.html      Interactive vis.js visualization
 *   graphify-out/graph.json      Node-link graph + analysis data
 *   graphify-out/GRAPH_REPORT.md Coverage analysis, god nodes, gaps
 *
 * Usage:
 *   node scripts/graph.js              full build
 *   node scripts/graph.js --no-viz     report + JSON only (no HTML)
 *   node scripts/graph.js --update     alias for full build (incremental placeholder)
 */

'use strict';

const fs   = require('fs');
const path = require('path');

const ROOT      = process.cwd();
const TESTS_DIR = path.join(ROOT, 'tests');
const OUT_DIR   = path.join(ROOT, 'graphify-out');
const NO_VIZ    = process.argv.includes('--no-viz');

// ─── 1. DETECT ────────────────────────────────────────────────────────────────
// Discover which files to process (mirrors graphify's detect.py)

const SPEC_FILES = [
  'auth.setup.ts',
  'etrade.spec.ts',
  'etrade-authenticated.spec.ts',
  'coverageMap.ts',
];

function detect() {
  const found = SPEC_FILES.filter(f => fs.existsSync(path.join(TESTS_DIR, f)));
  const words = found.reduce((sum, f) => {
    const src = fs.readFileSync(path.join(TESTS_DIR, f), 'utf8');
    return sum + src.split(/\s+/).length;
  }, 0);
  return { files: found, totalWords: words };
}

// ─── 2. EXTRACT ───────────────────────────────────────────────────────────────
// Parse TypeScript source files to pull out structured relationships.
// Mirrors graphify's extract.py (AST pass), but uses regex on known structure.

/** Parse coverageMap.ts → array of CoverageArea objects */
function extractCoverageMap() {
  const src = fs.readFileSync(path.join(TESTS_DIR, 'coverageMap.ts'), 'utf8');

  // Only scan from where the actual array data starts (skip the interface block)
  const dataStart = src.indexOf('export const coverageMap');
  const data = dataStart >= 0 ? src.slice(dataStart) : src;

  // Extract all field values in document order (they always appear id → area →
  // route → tests → covered → specFile within each object literal)
  const ids       = [...data.matchAll(/\bid:\s*'([^']+)'/g)].map(m => m[1]);
  const areas     = [...data.matchAll(/\barea:\s*'([^']+)'/g)].map(m => m[1]);
  const routes    = [...data.matchAll(/\broute:\s*'([^']+)'/g)].map(m => m[1]);
  const covereds  = [...data.matchAll(/\bcovered:\s*(true|false)/g)].map(m => m[1] === 'true');
  const specFiles = [...data.matchAll(/\bspecFile:\s*'([^']+)'/g)].map(m => m[1]);
  const testsArr  = [...data.matchAll(/\btests:\s*\[([^\]]*)\]/g)].map(m =>
    (m[1].match(/'([^']+)'/g) ?? []).map(t => t.replace(/'/g, ''))
  );

  return ids.map((id, i) => ({
    id,
    area:     areas[i]     ?? '',
    route:    routes[i]    ?? '',
    covered:  covereds[i]  ?? false,
    specFile: specFiles[i] ?? '',
    tests:    testsArr[i]  ?? [],
  }));
}

/** Parse a spec file → array of { describe, tests[], specFile } */
function extractSpecGroups(filename) {
  const filePath = path.join(TESTS_DIR, filename);
  if (!fs.existsSync(filePath)) return [];

  const src   = fs.readFileSync(filePath, 'utf8');
  const lines = src.split('\n');
  const groups = [];

  let currentDescribe = null;
  let currentTests    = [];

  for (const line of lines) {
    // Detect test.describe('Name', ...) or test.describe("Name", ...)
    const descMatch = line.match(/test\.describe\(['"`]([^'"`]+)['"`]/);
    if (descMatch) {
      if (currentDescribe !== null) {
        groups.push({ describe: currentDescribe, tests: currentTests, specFile: filename });
      }
      currentDescribe = descMatch[1];
      currentTests    = [];
      continue;
    }

    // Detect test('Name', ...) — skip test.describe and setup('...') lines
    const testMatch = line.match(/^\s+(?:test|setup)\(['"`]([^'"`]+)['"`]/);
    if (testMatch && currentDescribe !== null) {
      currentTests.push(testMatch[1]);
    }
  }

  if (currentDescribe !== null) {
    groups.push({ describe: currentDescribe, tests: currentTests, specFile: filename });
  }

  return groups;
}

// ─── 3. BUILD ─────────────────────────────────────────────────────────────────
// Assemble extracted entities into a node-link graph.
// Mirrors graphify's build.py (merges AST + semantic extractions into nx.Graph).

/**
 * Node types:
 *   spec_file      — a .ts test file (box shape)
 *   test_group     — a test.describe block (ellipse)
 *   coverage_area  — one CoverageArea entry (ellipse, red if uncovered)
 *   route          — a URL route on the platform (diamond)
 *
 * Edge relations:
 *   contains   — spec_file → test_group / spec_file → coverage_area
 *   exercises  — test_group → coverage_area (when test names overlap)
 *   tests      — coverage_area → route
 */
function buildGraph(coverageAreas, specGroups) {
  const nodes  = [];
  const edges  = [];
  const nodeSet = new Set();

  function addNode(id, label, type, extra = {}) {
    if (!nodeSet.has(id)) {
      nodeSet.add(id);
      nodes.push({ id, label, type, ...extra });
    }
    return id;
  }

  // Spec file nodes
  for (const sf of SPEC_FILES) {
    addNode(`spec:${sf}`, sf.replace(/\.ts$/, ''), 'spec_file');
  }

  // Unique route nodes
  const seenRoutes = new Set();
  for (const area of coverageAreas) {
    if (!seenRoutes.has(area.route)) {
      seenRoutes.add(area.route);
      addNode(`route:${area.route}`, area.route, 'route');
    }
  }

  // Coverage area nodes + edges
  for (const area of coverageAreas) {
    const areaId    = `area:${area.id}`;
    const shortLabel = area.area.includes(' — ')
      ? area.id + '\n' + area.area.split(' — ')[1]
      : area.id + '\n' + area.area;

    addNode(areaId, shortLabel, 'coverage_area', {
      covered:  area.covered,
      fullArea: area.area,
      route:    area.route,
    });

    // spec_file → coverage_area
    edges.push({ from: `spec:${area.specFile}`, to: areaId, relation: 'contains' });
    // coverage_area → route
    edges.push({ from: areaId, to: `route:${area.route}`, relation: 'tests' });
  }

  // Test group nodes + exercises edges
  for (const group of specGroups) {
    const groupId = `group:${group.specFile}:${group.describe}`;
    addNode(groupId, group.describe, 'test_group', { testCount: group.tests.length });

    // spec_file → test_group
    edges.push({ from: `spec:${group.specFile}`, to: groupId, relation: 'contains' });

    // test_group → coverage_area when test names overlap
    for (const area of coverageAreas) {
      if (area.specFile !== group.specFile) continue;
      const overlap = area.tests.some(t => group.tests.includes(t));
      if (overlap) {
        edges.push({ from: groupId, to: `area:${area.id}`, relation: 'exercises' });
      }
    }
  }

  return { nodes, edges };
}

// ─── 4. CLUSTER / ANALYZE ─────────────────────────────────────────────────────
// Community detection + god node analysis.
// Mirrors graphify's cluster.py + analyze.py.

function analyze(coverageAreas, graph) {
  const covered   = coverageAreas.filter(a => a.covered);
  const uncovered = coverageAreas.filter(a => !a.covered);

  // Degree map — god nodes are highest-degree (mirrors graphify's god_nodes())
  const degree = {};
  for (const e of graph.edges) {
    degree[e.from] = (degree[e.from] || 0) + 1;
    degree[e.to]   = (degree[e.to]   || 0) + 1;
  }
  const godNodes = Object.entries(degree)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 7)
    .map(([id, deg]) => {
      const node = graph.nodes.find(n => n.id === id);
      return { id, label: (node?.label ?? id).replace(/\n/g, ' '), degree: deg, type: node?.type };
    });

  // Community grouping by spec file (simple Louvain-equivalent for this domain)
  const communities = {};
  for (const node of graph.nodes) {
    const key = node.type === 'spec_file'
      ? node.id
      : node.type === 'route'
        ? 'routes'
        : graph.edges.find(e => e.to === node.id && e.from.startsWith('spec:'))?.from ?? 'unknown';
    communities[key] = communities[key] ?? [];
    communities[key].push(node.id);
  }

  // Surprising connections — coverage areas that link to routes appearing in
  // multiple spec files (cross-community edges)
  const routeToSpecs = {};
  for (const area of coverageAreas) {
    routeToSpecs[area.route] = routeToSpecs[area.route] ?? new Set();
    routeToSpecs[area.route].add(area.specFile);
  }
  const crossCutRoutes = Object.entries(routeToSpecs)
    .filter(([, specs]) => specs.size > 1)
    .map(([route, specs]) => ({ route, specs: [...specs] }));

  return {
    totalAreas:      coverageAreas.length,
    coveredCount:    covered.length,
    uncoveredCount:  uncovered.length,
    coveragePercent: Math.round((covered.length / coverageAreas.length) * 100),
    godNodes,
    uncoveredAreas:  uncovered,
    communities,
    crossCutRoutes,
  };
}

// ─── 5. EXPORT: HTML ──────────────────────────────────────────────────────────
// Mirrors graphify's export.py → to_html() using vis.js Network.

const TYPE_COLORS = {
  spec_file:     { bg: '#4F46E5', border: '#3730A3', font: '#ffffff', shape: 'box',     size: 32 },
  test_group:    { bg: '#0EA5E9', border: '#0284C7', font: '#ffffff', shape: 'ellipse', size: 22 },
  coverage_area: { bg: '#10B981', border: '#059669', font: '#ffffff', shape: 'ellipse', size: 18 },
  route:         { bg: '#F59E0B', border: '#D97706', font: '#1E293B', shape: 'diamond', size: 24 },
  gap:           { bg: '#EF4444', border: '#B91C1C', font: '#ffffff', shape: 'ellipse', size: 18 },
};

function toHTML(graph, analysis) {
  const visNodes = graph.nodes.map(n => {
    const isGap = n.type === 'coverage_area' && n.covered === false;
    const c = TYPE_COLORS[isGap ? 'gap' : n.type] ?? TYPE_COLORS.coverage_area;
    return {
      id:    n.id,
      label: n.label,
      title: n.fullArea ?? n.label.replace(/\n/g, ' '),
      color: { background: c.bg, border: c.border, highlight: { background: c.bg, border: '#ffffff' } },
      font:  { color: c.font, size: 12, face: 'system-ui' },
      shape: c.shape,
      size:  c.size,
    };
  });

  const visEdges = graph.edges.map((e, i) => ({
    id:     i,
    from:   e.from,
    to:     e.to,
    label:  e.relation,
    arrows: 'to',
    color:  { color: '#475569', opacity: 0.7 },
    font:   { size: 9, color: '#94A3B8', align: 'middle' },
    smooth: { type: 'continuous' },
  }));

  const statsBar = [
    `<div class="stat"><span class="val green">${analysis.coveredCount}</span><span class="lbl">Covered</span></div>`,
    `<div class="stat"><span class="val red">${analysis.uncoveredCount}</span><span class="lbl">Gaps</span></div>`,
    `<div class="stat"><span class="val amber">${analysis.coveragePercent}%</span><span class="lbl">Coverage</span></div>`,
    `<div class="stat"><span class="val">${graph.nodes.length}</span><span class="lbl">Nodes</span></div>`,
    `<div class="stat"><span class="val">${graph.edges.length}</span><span class="lbl">Edges</span></div>`,
  ].join('');

  const gapList = analysis.uncoveredAreas.map(a =>
    `<li><code>${a.id}</code> ${a.area.split(' — ')[1] ?? a.area} <span class="route">${a.route}</span></li>`
  ).join('');

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<title>Blockpeer Finance — Test Knowledge Graph</title>
<script src="https://cdnjs.cloudflare.com/ajax/libs/vis/4.21.0/vis.min.js"></script>
<link  href="https://cdnjs.cloudflare.com/ajax/libs/vis/4.21.0/vis.min.css" rel="stylesheet">
<style>
  *{box-sizing:border-box;margin:0;padding:0}
  body{font-family:system-ui,sans-serif;background:#0F172A;color:#E2E8F0;display:flex;height:100vh;overflow:hidden}
  #sidebar{width:280px;flex-shrink:0;background:#1E293B;border-right:1px solid #334155;display:flex;flex-direction:column;overflow:hidden}
  #main{flex:1;display:flex;flex-direction:column}
  header{padding:14px 16px;background:#1E293B;border-bottom:1px solid #334155;flex-shrink:0}
  header h1{font-size:13px;font-weight:700;color:#94A3B8;text-transform:uppercase;letter-spacing:.05em}
  header h2{font-size:15px;font-weight:600;margin-top:2px}
  .stats{display:flex;gap:0;border-top:1px solid #334155;flex-shrink:0}
  .stat{flex:1;padding:10px 8px;text-align:center;border-right:1px solid #334155}
  .stat:last-child{border-right:none}
  .val{display:block;font-size:20px;font-weight:700}
  .val.green{color:#10B981}.val.red{color:#EF4444}.val.amber{color:#F59E0B}
  .lbl{display:block;font-size:10px;color:#94A3B8;margin-top:1px}
  #network{flex:1}
  .panel{padding:12px 14px;overflow-y:auto;flex:1}
  .panel h3{font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.06em;color:#94A3B8;margin-bottom:8px;margin-top:14px}
  .panel h3:first-child{margin-top:0}
  .god-node{display:flex;align-items:center;gap:8px;padding:4px 0;font-size:12px;border-bottom:1px solid #1E293B}
  .god-node .deg{font-weight:700;color:#F59E0B;width:24px;flex-shrink:0;text-align:right}
  .god-node .lname{flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
  .god-node .ttype{font-size:10px;color:#64748B;flex-shrink:0}
  .gaps li{font-size:11px;padding:3px 0;border-bottom:1px solid #1E293B;list-style:none}
  .gaps code{color:#F59E0B;font-size:10px}
  .route{color:#64748B;font-size:10px;display:block}
  .legend{display:flex;flex-direction:column;gap:4px;padding:10px 14px;border-top:1px solid #334155;flex-shrink:0}
  .legend-row{display:flex;align-items:center;gap:7px;font-size:11px;color:#CBD5E1}
  .dot{width:10px;height:10px;border-radius:50%;flex-shrink:0}
  .diamond{width:10px;height:10px;transform:rotate(45deg);flex-shrink:0}
</style>
</head>
<body>
<div id="sidebar">
  <header>
    <h1>Blockpeer Finance</h1>
    <h2>Test Knowledge Graph</h2>
  </header>
  <div class="stats">${statsBar}</div>
  <div class="panel">
    <h3>God Nodes</h3>
    ${analysis.godNodes.map(n =>
      `<div class="god-node"><span class="deg">${n.degree}</span><span class="lname">${n.label}</span><span class="ttype">${n.type ?? ''}</span></div>`
    ).join('')}
    <h3>Coverage Gaps (${analysis.uncoveredAreas.length})</h3>
    <ul class="gaps">${gapList}</ul>
  </div>
  <div class="legend">
    <div class="legend-row"><div class="dot" style="background:#4F46E5"></div> Spec file</div>
    <div class="legend-row"><div class="dot" style="background:#0EA5E9"></div> Test group</div>
    <div class="legend-row"><div class="dot" style="background:#10B981"></div> Covered area</div>
    <div class="legend-row"><div class="dot" style="background:#EF4444"></div> Gap — not tested</div>
    <div class="legend-row"><div class="diamond" style="background:#F59E0B"></div> Route</div>
  </div>
</div>
<div id="main">
  <div id="network"></div>
</div>
<script>
const nodes = new vis.DataSet(${JSON.stringify(visNodes)});
const edges = new vis.DataSet(${JSON.stringify(visEdges)});
const network = new vis.Network(
  document.getElementById('network'),
  { nodes, edges },
  {
    physics: {
      enabled: true,
      solver: 'forceAtlas2Based',
      forceAtlas2Based: { gravitationalConstant: -60, centralGravity: 0.005, springLength: 120, springConstant: 0.08 },
      stabilization: { iterations: 300, updateInterval: 25 },
    },
    edges: { smooth: { enabled: true, type: 'dynamic' } },
    interaction: { hover: true, tooltipDelay: 150, navigationButtons: true, keyboard: true },
    layout: { improvedLayout: false },
  }
);
network.on('stabilizationIterationsDone', () => network.setOptions({ physics: { enabled: false } }));
</script>
</body>
</html>`;
}

// ─── 6. EXPORT: GRAPH_REPORT.md ───────────────────────────────────────────────
// Mirrors graphify's report.py → generate()

function toReport(coverageAreas, specGroups, analysis) {
  const date = new Date().toISOString().split('T')[0];

  const godSection = analysis.godNodes.map((n, i) =>
    `${i + 1}. **${n.label}** \`${n.type}\` — ${n.degree} connections`
  ).join('\n');

  const groupSection = specGroups.map(g =>
    `- **${g.describe}** (\`${g.specFile}\`) — ${g.tests.length} test(s)`
  ).join('\n');

  const gapSection = analysis.uncoveredAreas.length === 0
    ? '_No gaps — full coverage!_'
    : analysis.uncoveredAreas.map(a =>
        `- \`${a.id}\` **${a.area}** → \`${a.route}\``
      ).join('\n');

  const crossCutSection = analysis.crossCutRoutes.length === 0
    ? '_None found_'
    : analysis.crossCutRoutes.map(r =>
        `- \`${r.route}\` — tested by: ${r.specs.join(', ')}`
      ).join('\n');

  // Per-spec coverage breakdown
  const bySpec = {};
  for (const a of coverageAreas) {
    bySpec[a.specFile] = bySpec[a.specFile] ?? { covered: 0, total: 0 };
    bySpec[a.specFile].total++;
    if (a.covered) bySpec[a.specFile].covered++;
  }
  const specTable = Object.entries(bySpec).map(([sf, s]) =>
    `| \`${sf}\` | ${s.covered} | ${s.total - s.covered} | ${Math.round(s.covered / s.total * 100)}% |`
  ).join('\n');

  return `# GRAPH_REPORT.md — Blockpeer Finance Test Suite
_Generated: ${date}_

## Coverage Summary

| Metric | Value |
|---|---|
| Total feature areas | ${analysis.totalAreas} |
| Covered | ${analysis.coveredCount} |
| Not yet covered | **${analysis.uncoveredCount}** |
| Overall coverage | **${analysis.coveragePercent}%** |

## Per-Spec Coverage

| Spec file | Covered | Gaps | % |
|---|---|---|---|
${specTable}

## God Nodes (highest-degree — architectural hubs)

${godSection}

## Test Groups Detected

${groupSection}

## Coverage Gaps

${gapSection}

## Surprising Connections (cross-spec routes)

Routes exercised by more than one spec file:

${crossCutSection}

---
_Regenerate with \`npm run graph\`_
`;
}

// ─── MAIN ─────────────────────────────────────────────────────────────────────

function main() {
  console.log('\nBlockpeer Finance — knowledge graph builder');
  console.log('─'.repeat(48));

  // Detect
  const { files, totalWords } = detect();
  console.log(`\nDetect   ${files.length} files · ~${totalWords.toLocaleString()} words`);
  files.forEach(f => console.log(`           ${f}`));

  // Extract
  const coverageAreas = extractCoverageMap();
  const specGroups    = ['auth.setup.ts', 'etrade.spec.ts', 'etrade-authenticated.spec.ts']
    .flatMap(extractSpecGroups);

  console.log(`\nExtract  ${coverageAreas.length} coverage areas · ${specGroups.length} test groups`);

  // Build
  const graph = buildGraph(coverageAreas, specGroups);
  console.log(`Build    ${graph.nodes.length} nodes · ${graph.edges.length} edges`);

  // Analyze
  const analysis = analyze(coverageAreas, graph);
  console.log(`Analyze  ${analysis.coveragePercent}% covered · ${analysis.uncoveredCount} gaps · ${analysis.godNodes.length} god nodes`);

  // Export
  fs.mkdirSync(OUT_DIR, { recursive: true });
  console.log('');

  if (!NO_VIZ) {
    const htmlPath = path.join(OUT_DIR, 'graph.html');
    fs.writeFileSync(htmlPath, toHTML(graph, analysis));
    console.log(`  graph.html        → open in browser`);
  }

  const jsonPath = path.join(OUT_DIR, 'graph.json');
  fs.writeFileSync(jsonPath, JSON.stringify({ nodes: graph.nodes, edges: graph.edges, analysis }, null, 2));
  console.log(`  graph.json        → queryable node-link data`);

  const reportPath = path.join(OUT_DIR, 'GRAPH_REPORT.md');
  fs.writeFileSync(reportPath, toReport(coverageAreas, specGroups, analysis));
  console.log(`  GRAPH_REPORT.md   → coverage analysis`);

  // Summary
  console.log(`\nCoverage: ${analysis.coveredCount}/${analysis.totalAreas} areas (${analysis.coveragePercent}%)\n`);

  if (analysis.uncoveredCount > 0) {
    console.log(`Gaps (${analysis.uncoveredCount}):`);
    for (const a of analysis.uncoveredAreas) {
      console.log(`  ✗  [${a.id}] ${a.area}`);
    }
    console.log('');
  }

  console.log('Done.\n');
}

main();
