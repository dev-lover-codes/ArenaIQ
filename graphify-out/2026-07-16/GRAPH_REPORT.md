# Graph Report - .  (2026-07-16)

## Corpus Check
- cluster-only mode — file stats not available

## Summary
- 273 nodes · 354 edges · 24 communities (20 shown, 4 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `283fdd91`
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

## God Nodes (most connected - your core abstractions)
1. `compilerOptions` - 16 edges
2. `createClient()` - 13 edges
3. `POST()` - 11 edges
4. `scripts` - 8 edges
5. `include` - 7 edges
6. `POST()` - 6 edges
7. `ErrorBoundary` - 6 edges
8. `sanitizeInput()` - 6 edges
9. `exclude` - 6 edges
10. `npx` - 5 edges

## Surprising Connections (you probably didn't know these)
- `POST()` --references--> `@google/generative-ai`  [EXTRACTED]
  src/app/api/gemini/route.ts → package.json
- `POST()` --calls--> `calculateRoute()`  [EXTRACTED]
  src/app/api/navigate/route.ts → src/lib/routing.ts
- `GET()` --calls--> `createClient()`  [EXTRACTED]
  src/app/auth/callback/route.ts → src/lib/supabase/server.ts
- `LoginPage()` --calls--> `createClient()`  [EXTRACTED]
  src/app/login/page.tsx → src/lib/supabase/client.ts
- `StaffPage()` --calls--> `createClient()`  [EXTRACTED]
  src/app/staff/page.tsx → src/lib/supabase/client.ts

## Import Cycles
- None detected.

## Communities (24 total, 4 thin omitted)

### Community 0 - "AppShell.tsx"
Cohesion: 0.09
Nodes (28): AssistantPage(), getTimestamp(), LANGUAGES, Message, tryParseCopilot(), URGENCY_STYLES, VolunteerCopilotPayload, DashboardPage() (+20 more)

### Community 1 - "devDependencies"
Cohesion: 0.06
Nodes (35): autoprefixer, eslint, eslint-config-next, jsdom, devDependencies, autoprefixer, eslint, eslint-config-next (+27 more)

### Community 2 - "route.ts"
Cohesion: 0.12
Nodes (14): POST(), getAllowedOrigin(), OPTIONS(), POST(), createAdminClient(), POST(), createAdminClient(), GET() (+6 more)

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
Cohesion: 0.29
Nodes (4): calculateRoute(), Edge, RouteResult, Zone

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

## Knowledge Gaps
- **114 isolated node(s):** `STITCH_API_KEY`, `@supabase/mcp-server-supabase`, `SUPABASE_ACCESS_TOKEN`, `VERCEL_TOKEN`, `@21st-dev/magic` (+109 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **4 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `dependencies` connect `dependencies` to `scripts`?**
  _High betweenness centrality (0.110) - this node is a cross-community bridge._
- **Why does `devDependencies` connect `devDependencies` to `scripts`?**
  _High betweenness centrality (0.087) - this node is a cross-community bridge._
- **Why does `POST()` connect `route.ts` to `dependencies`?**
  _High betweenness centrality (0.085) - this node is a cross-community bridge._
- **What connects `STITCH_API_KEY`, `@supabase/mcp-server-supabase`, `SUPABASE_ACCESS_TOKEN` to the rest of the system?**
  _114 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `AppShell.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.08558558558558559 - nodes in this community are weakly interconnected._
- **Should `devDependencies` be split into smaller, more focused modules?**
  _Cohesion score 0.05714285714285714 - nodes in this community are weakly interconnected._
- **Should `route.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.12477718360071301 - nodes in this community are weakly interconnected._