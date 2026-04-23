# Graph Report - /Users/deep_037/Desktop/Fibonacci/hackthon-hackers  (2026-04-20)

## Corpus Check
- 21 files · ~28,506 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 70 nodes · 91 edges · 20 communities detected
- Extraction: 86% EXTRACTED · 14% INFERRED · 0% AMBIGUOUS · INFERRED: 13 edges (avg confidence: 0.8)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- [[_COMMUNITY_Community 0|Community 0]]
- [[_COMMUNITY_Community 1|Community 1]]
- [[_COMMUNITY_Community 2|Community 2]]
- [[_COMMUNITY_Community 3|Community 3]]
- [[_COMMUNITY_Community 4|Community 4]]
- [[_COMMUNITY_Community 5|Community 5]]
- [[_COMMUNITY_Community 6|Community 6]]
- [[_COMMUNITY_Community 7|Community 7]]
- [[_COMMUNITY_Community 8|Community 8]]
- [[_COMMUNITY_Community 9|Community 9]]
- [[_COMMUNITY_Community 10|Community 10]]
- [[_COMMUNITY_Community 11|Community 11]]
- [[_COMMUNITY_Community 12|Community 12]]
- [[_COMMUNITY_Community 13|Community 13]]
- [[_COMMUNITY_Community 14|Community 14]]
- [[_COMMUNITY_Community 15|Community 15]]
- [[_COMMUNITY_Community 16|Community 16]]
- [[_COMMUNITY_Community 17|Community 17]]
- [[_COMMUNITY_Community 18|Community 18]]
- [[_COMMUNITY_Community 19|Community 19]]

## God Nodes (most connected - your core abstractions)
1. `sanitizeSegment()` - 6 edges
2. `main()` - 6 edges
3. `createWebsiteFolder()` - 4 edges
4. `discoverSites()` - 4 edges
5. `resolveRunFolder()` - 4 edges
6. `formatHeader()` - 4 edges
7. `addDetailsSheet()` - 4 edges
8. `resolveBaseURL()` - 4 edges
9. `PriorityResultReporter` - 4 edges
10. `validateEnvironment()` - 3 edges

## Surprising Connections (you probably didn't know these)
- `stripTrailingSlash()` --calls--> `resolveBaseURL()`  [INFERRED]
  /Users/deep_037/Desktop/Fibonacci/hackthon-hackers/utils/siteDiscovery.ts → /Users/deep_037/Desktop/Fibonacci/hackthon-hackers/reporters/priorityResultReporter.ts
- `validateEnvironment()` --calls--> `discoverSites()`  [INFERRED]
  /Users/deep_037/Desktop/Fibonacci/hackthon-hackers/global.setup.ts → /Users/deep_037/Desktop/Fibonacci/hackthon-hackers/scripts/run-priority-tests.mjs

## Communities

### Community 0 - "Community 0"
Cohesion: 0.22
Nodes (11): buildRetryCurl(), copyScreenshotToWebsite(), createApiFolder(), createPriorityFolder(), createRunFolder(), createScreenshotFolder(), createWebsiteFolder(), sanitizeSegment() (+3 more)

### Community 1 - "Community 1"
Cohesion: 0.33
Nodes (10): addDetailsSheet(), addFailedSheet(), addSummarySheet(), collectJsonFiles(), colorizeStatusCell(), exists(), formatHeader(), listDirectories() (+2 more)

### Community 2 - "Community 2"
Cohesion: 0.39
Nodes (7): deriveOutcome(), extractRoute(), parseMeta(), PriorityResultReporter, resolveBaseURL(), resolveWebsiteName(), createOutcomeFolder()

### Community 3 - "Community 3"
Cohesion: 0.32
Nodes (4): globalSetup(), normalizeAuthorizationHeader(), validateEnvironment(), discoverSites()

### Community 4 - "Community 4"
Cohesion: 0.7
Nodes (4): discoverSiteNames(), discoverSites(), getSiteConfig(), stripTrailingSlash()

### Community 5 - "Community 5"
Cohesion: 0.5
Nodes (0): 

### Community 6 - "Community 6"
Cohesion: 1.0
Nodes (2): main(), run()

### Community 7 - "Community 7"
Cohesion: 1.0
Nodes (0): 

### Community 8 - "Community 8"
Cohesion: 1.0
Nodes (0): 

### Community 9 - "Community 9"
Cohesion: 1.0
Nodes (0): 

### Community 10 - "Community 10"
Cohesion: 1.0
Nodes (0): 

### Community 11 - "Community 11"
Cohesion: 1.0
Nodes (0): 

### Community 12 - "Community 12"
Cohesion: 1.0
Nodes (0): 

### Community 13 - "Community 13"
Cohesion: 1.0
Nodes (0): 

### Community 14 - "Community 14"
Cohesion: 1.0
Nodes (0): 

### Community 15 - "Community 15"
Cohesion: 1.0
Nodes (0): 

### Community 16 - "Community 16"
Cohesion: 1.0
Nodes (0): 

### Community 17 - "Community 17"
Cohesion: 1.0
Nodes (0): 

### Community 18 - "Community 18"
Cohesion: 1.0
Nodes (0): 

### Community 19 - "Community 19"
Cohesion: 1.0
Nodes (0): 

## Knowledge Gaps
- **Thin community `Community 7`** (2 nodes): `clickToggle()`, `auth-critical.spec.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 8`** (2 nodes): `cleanDirectory()`, `clean-test-results.mjs`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 9`** (1 nodes): `playwright-cli.js`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 10`** (1 nodes): `auth.setup.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 11`** (1 nodes): `crickbox.spec.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 12`** (1 nodes): `app-authenticated.spec.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 13`** (1 nodes): `smoke.spec.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 14`** (1 nodes): `auth.setup.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 15`** (1 nodes): `auth.setup.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 16`** (1 nodes): `business-modules.spec.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 17`** (1 nodes): `auth-journeys.spec.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 18`** (1 nodes): `dashboard-critical.spec.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 19`** (1 nodes): `legal-and-edge.spec.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `resolveBaseURL()` connect `Community 2` to `Community 4`?**
  _High betweenness centrality (0.048) - this node is a cross-community bridge._
- **Why does `stripTrailingSlash()` connect `Community 4` to `Community 2`?**
  _High betweenness centrality (0.039) - this node is a cross-community bridge._
- **Why does `PriorityResultReporter` connect `Community 2` to `Community 0`?**
  _High betweenness centrality (0.015) - this node is a cross-community bridge._
- **Are the 2 inferred relationships involving `createWebsiteFolder()` (e.g. with `.onTestEnd()` and `.onEnd()`) actually correct?**
  _`createWebsiteFolder()` has 2 INFERRED edges - model-reasoned connections that need verification._