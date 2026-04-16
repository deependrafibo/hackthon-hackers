---
name: graphify
description: Build the Blockpeer Finance test knowledge graph — coverage map, god nodes, gaps, interactive HTML viz
trigger: /graphify
---

# /graphify

Build the Blockpeer Finance test knowledge graph from the test suite source files.

No Python, no external packages — runs entirely with Node.js built-ins via `scripts/graph.js`.

## Usage

```
/graphify          full build → graph.html + graph.json + GRAPH_REPORT.md
/graphify --no-viz report + JSON only (skip HTML, faster)
/graphify --update incremental alias (same as full build — re-reads all files)
```

## What it does

Mirrors graphify's pipeline in four passes:

**1. Detect** — finds all test source files:
- `tests/auth.setup.ts`
- `tests/etrade.spec.ts`
- `tests/etrade-authenticated.spec.ts`
- `tests/coverageMap.ts`

**2. Extract** — parses each file:
- `coverageMap.ts` → all `CoverageArea` entries (id, area, route, covered, specFile, tests)
- Spec files → `test.describe` groups + `test()` names via line-by-line AST scan

**3. Build** — assembles a node-link graph:
- Node types: `spec_file`, `test_group`, `coverage_area`, `route`
- Edge types: `contains`, `exercises`, `tests`

**4. Analyze + Export** — produces three outputs in `graphify-out/`:
- `graph.html` — interactive vis.js visualization with sidebar (god nodes, gaps, legend)
- `graph.json` — full node-link data + analysis object
- `GRAPH_REPORT.md` — coverage %, per-spec breakdown, god nodes, gaps, cross-spec routes

## What You Must Do When Invoked

Run these steps in order. Do not skip.

### Step 1 — Run the graph builder

```bash
node scripts/graph.js
```

Print the output directly — it shows detect → extract → build → analyze → export progress and a final coverage summary.

### Step 2 — Read the report

```bash
cat graphify-out/GRAPH_REPORT.md
```

Summarise for the user:
- Overall coverage % and gap count
- Top 3 god nodes (the central hubs)
- List all `covered: false` gaps with their route

### Step 3 — Tell the user where the visualization is

```
graphify-out/graph.html  →  open in Chrome/Edge to explore the interactive graph
```

## After running

- Before answering any architecture or coverage question, read `graphify-out/GRAPH_REPORT.md` first
- When suggesting new tests to write, cross-reference against the gap list in GRAPH_REPORT.md
- After adding new tests or updating `coverageMap.ts`, run `npm run graph:update` to refresh

## Output reference

| File | Purpose |
|---|---|
| `graphify-out/graph.html` | Interactive vis.js graph — open in browser |
| `graphify-out/graph.json` | Node-link JSON — queryable by scripts |
| `graphify-out/GRAPH_REPORT.md` | Plain-text coverage audit |
