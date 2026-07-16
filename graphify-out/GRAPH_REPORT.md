# Graph Report - project-4  (2026-07-16)

## Corpus Check
- 72 files · ~40,638 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 398 nodes · 463 edges · 39 communities (29 shown, 10 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `a96caddc`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- AppShell.tsx
- devDependencies
- route.ts
- components.extended.test.tsx
- dependencies
- compilerOptions
- include
- mcp.json
- scripts
- routing.extended.test.ts
- page.tsx
- utils.ts
- middleware.ts
- layout.tsx
- page.tsx
- vitest.d.ts
- next.config.mjs
- postcss.config.mjs
- index.ts
- tailwind.config.js
- README.md
- Phase 3 & 4 Progress (Completed)
- **AI Development Guidelines for Next.js in Firebase Studio**
- graphify reference: extra exports and benchmark
- graphify reference: query, path, explain
- graphify reference: add a URL and watch a folder
- graphify reference: commit hook and native CLAUDE.md integration
- graphify reference: incremental update and cluster-only
- graphify reference: GitHub clone and cross-repo merge
- graphify reference: transcribe video and audio
- AGENTS.md
- graphify.md
- extraction-spec.md
- graphify.md

## God Nodes (most connected - your core abstractions)
1. `compilerOptions` - 16 edges
2. `Phase 3 & 4 Progress (Completed)` - 15 edges
3. `createClient()` - 13 edges
4. `What You Must Do When Invoked` - 12 edges
5. `POST()` - 11 edges
6. `/graphify` - 10 edges
7. `scripts` - 8 edges
8. `graphify reference: extra exports and benchmark` - 8 edges
9. `**AI Development Guidelines for Next.js in Firebase Studio**` - 8 edges
10. `include` - 7 edges

## Surprising Connections (you probably didn't know these)
- `POST()` --references--> `@google/generative-ai`  [EXTRACTED]
  src/app/api/gemini/route.ts → package.json
- `GET()` --calls--> `createClient()`  [EXTRACTED]
  src/app/auth/callback/route.ts → src/lib/supabase/server.ts
- `LoginPage()` --calls--> `createClient()`  [EXTRACTED]
  src/app/login/page.tsx → src/lib/supabase/client.ts
- `StaffPage()` --calls--> `createClient()`  [EXTRACTED]
  src/app/staff/page.tsx → src/lib/supabase/client.ts
- `POST()` --calls--> `sanitizeInput()`  [EXTRACTED]
  src/app/api/chat/route.ts → src/lib/sanitize.ts

## Import Cycles
- None detected.

## Communities (39 total, 10 thin omitted)

### Community 0 - "AppShell.tsx"
Cohesion: 0.09
Nodes (28): AssistantPage(), getTimestamp(), LANGUAGES, Message, tryParseCopilot(), URGENCY_STYLES, VolunteerCopilotPayload, DashboardPage() (+20 more)

### Community 1 - "devDependencies"
Cohesion: 0.06
Nodes (35): autoprefixer, eslint, eslint-config-next, jsdom, devDependencies, autoprefixer, eslint, eslint-config-next (+27 more)

### Community 2 - "route.ts"
Cohesion: 0.09
Nodes (18): POST(), getAllowedOrigin(), OPTIONS(), POST(), createAdminClient(), POST(), createAdminClient(), GET() (+10 more)

### Community 3 - "components.extended.test.tsx"
Cohesion: 0.13
Nodes (15): ChatInterface(), ChatInterfaceProps, LANGUAGES, Message, ErrorBoundary, Props, State, LANGUAGES (+7 more)

### Community 4 - "dependencies"
Cohesion: 0.10
Nodes (21): clsx, @google/generative-ai, lucide-react, next, dependencies, clsx, @google/generative-ai, lucide-react (+13 more)

### Community 5 - "compilerOptions"
Cohesion: 0.11
Nodes (19): dom, dom.iterable, esnext, compilerOptions, allowJs, esModuleInterop, incremental, isolatedModules (+11 more)

### Community 6 - "include"
Cohesion: 0.14
Nodes (13): **/*.mts, .next/dev/types/**/*.ts, next-env.d.ts, .next/types/**/*.ts, node_modules, supabase, **/*.ts, **/*.tsx (+5 more)

### Community 7 - "mcp.json"
Cohesion: 0.21
Nodes (12): API_KEY, STITCH_API_KEY, SUPABASE_ACCESS_TOKEN, VERCEL_TOKEN, 21st-dev, firebase, stitch, supabase (+4 more)

### Community 8 - "scripts"
Cohesion: 0.17
Nodes (11): name, private, scripts, build, dev, lint, start, test (+3 more)

### Community 9 - "routing.extended.test.ts"
Cohesion: 0.08
Nodes (24): For /graphify add and --watch, For /graphify query, For the commit hook and native CLAUDE.md integration, For --update and --cluster-only, /graphify, Honesty Rules, Interpreter guard for subcommands, Part A - Structural extraction for code files (+16 more)

### Community 10 - "page.tsx"
Cohesion: 0.32
Nodes (4): FILTER_TABS, FilterTab, Match, MATCHES

### Community 11 - "utils.ts"
Cohesion: 0.52
Nodes (3): cn(), formatOccupancy(), getDensityLevel()

### Community 12 - "middleware.ts"
Cohesion: 0.47
Nodes (4): IMPORTANT: Do NOT place any logic between createServerClient and supabase.auth.g, updateSession(), config, middleware()

### Community 13 - "layout.tsx"
Cohesion: 0.40
Nodes (3): inter, jetbrainsMono, metadata

### Community 14 - "page.tsx"
Cohesion: 0.40
Nodes (3): GATES, LANGUAGES, ROLES

### Community 15 - "vitest.d.ts"
Cohesion: 0.60
Nodes (4): Assertion, AsymmetricMatchersContaining, CustomMatchers, vitest

### Community 24 - "README.md"
Cohesion: 0.08
Nodes (24): 1. Configure Environment Variables, 2. Install Dependencies, 3. Run Development Server, 4. Run the Test Suite, 5. Build for Production, ArenaIQ — FIFA World Cup 2026 Volunteer Co-pilot, Chat Prompt Design, ⚙️ Crowd Simulation Mechanics (+16 more)

### Community 25 - "Phase 3 & 4 Progress (Completed)"
Cohesion: 0.10
Nodes (20): 10. Wheelchair Routing & Expanded Test Suite, 11. FIFA World Cup 2026 Mission Control UI Redesign (Phase 7), 12. Persistent App Shell Redesign (Phase 8), 13. Page Content Redesign (Phase 8 — Interior), 14. Graphify Installation & Codebase Mapping, 1. Live Heatmap Dashboard (`/dashboard`), 2. Smart Navigation (`/navigate` & `/api/navigate`), 3. Multilingual Assistant Chat (`/assistant` & `/api/chat`) (+12 more)

### Community 26 - "**AI Development Guidelines for Next.js in Firebase Studio**"
Cohesion: 0.17
Nodes (11): **AI Development Guidelines for Next.js in Firebase Studio**, **Automated Error Detection & Remediation**, **Code Modification & Dependency Management**, **Environment & Context Awareness**, **File-based Routing**, Firebase MCP, **Iterative Development & User Interaction**, **Next.js Core Concepts (App Router)** (+3 more)

### Community 27 - "graphify reference: extra exports and benchmark"
Cohesion: 0.22
Nodes (8): graphify reference: extra exports and benchmark, Step 6b - Wiki (only if --wiki flag), Step 7 - Neo4j export (only if --neo4j or --neo4j-push flag), Step 7a - FalkorDB export (only if --falkordb or --falkordb-push flag), Step 7b - SVG export (only if --svg flag), Step 7c - GraphML export (only if --graphml flag), Step 7d - MCP server (only if --mcp flag), Step 8 - Token reduction benchmark (only if total_words > 5000)

### Community 28 - "graphify reference: query, path, explain"
Cohesion: 0.33
Nodes (5): For /graphify explain, For /graphify path, graphify reference: query, path, explain, Step 0 — Constrained query expansion (REQUIRED before traversal), Step 1 — Traversal

### Community 29 - "graphify reference: add a URL and watch a folder"
Cohesion: 0.50
Nodes (3): For /graphify add, For --watch, graphify reference: add a URL and watch a folder

### Community 30 - "graphify reference: commit hook and native CLAUDE.md integration"
Cohesion: 0.50
Nodes (3): For git commit hook, For native CLAUDE.md integration, graphify reference: commit hook and native CLAUDE.md integration

### Community 31 - "graphify reference: incremental update and cluster-only"
Cohesion: 0.50
Nodes (3): For --cluster-only, For --update (incremental re-extraction), graphify reference: incremental update and cluster-only

## Knowledge Gaps
- **203 isolated node(s):** `STITCH_API_KEY`, `@supabase/mcp-server-supabase`, `SUPABASE_ACCESS_TOKEN`, `VERCEL_TOKEN`, `@21st-dev/magic` (+198 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **10 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `dependencies` connect `dependencies` to `scripts`?**
  _High betweenness centrality (0.051) - this node is a cross-community bridge._
- **Why does `devDependencies` connect `devDependencies` to `scripts`?**
  _High betweenness centrality (0.041) - this node is a cross-community bridge._
- **Why does `POST()` connect `route.ts` to `dependencies`?**
  _High betweenness centrality (0.040) - this node is a cross-community bridge._
- **What connects `STITCH_API_KEY`, `@supabase/mcp-server-supabase`, `SUPABASE_ACCESS_TOKEN` to the rest of the system?**
  _203 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `AppShell.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.08558558558558559 - nodes in this community are weakly interconnected._
- **Should `devDependencies` be split into smaller, more focused modules?**
  _Cohesion score 0.05714285714285714 - nodes in this community are weakly interconnected._
- **Should `route.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.09191919191919191 - nodes in this community are weakly interconnected._