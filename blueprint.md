# ArenaIQ Blueprint & Roadmap

## Project Overview
ArenaIQ is a Generative AI-enabled platform for the FIFA World Cup 2026 stadium operations, built for the Hack2Skill PromptWars Challenge 4. The platform addresses key operational challenges and enhances the tournament experience for fans, organizers, volunteers, and venue staff.

### Selected Pillars
1. **Smart Navigation**: Algorithmic route suggestions computed over real zone-graph data (avoiding hallucinated paths), with Gemini providing natural-language explanations.
2. **Crowd Management**: Real-time crowd density tracking with Supabase subscriptions to visualize and manage arena flow.
3. **Multilingual Assistance**: Gemini-enabled translations and real-time localized operational support for staff and attendees.
4. **Cross-cutting Pillar: Accessibility (WCAG 2.1 AA)**: Ensured across every screen and component (screen-reader friendly, high contrast, legible fonts, dynamic text sizes).

---

## Technical Stack & Configuration
- **Framework**: Next.js 16 (App Router)
- **Styling**: Tailwind CSS v4 (using vanilla CSS theme overrides) + custom component design matching WCAG 2.1 AA standards
- **Database & Auth**: Supabase (Postgres, Row Level Security, Realtime subscriptions)
- **AI Integrations**: Gemini API (via server-side endpoints only, ensuring no API keys are exposed to the client)
- **Testing**: Vitest + React Testing Library + JSDOM

---

## Database Schema Design (RLS Enabled)
All tables have Row Level Security (RLS) enabled with explicit non-test-mode policies.
1. `profiles`: User information (fan, staff, volunteer, organizer) linked to Supabase auth.
2. `zones`: Stadium zones/locations (graph nodes).
3. `zone_edges`: Edges connecting stadium zones for navigation calculations.
4. `crowd_events`: Real-time density data of zones for crowd management.
5. `chat_sessions`: Real-time multilingual chat history log.
6. `staff_tasks`: Real-time incident logs.

---

## Phase 3 & 4 Progress (Completed)

### 1. Live Heatmap Dashboard (`/dashboard`)
* Created subscription to Supabase Realtime channel (`public:zones`) to watch occupancy and status changes.
* Rendered color-coded zones heatmap with WCAG 2.1 AA compliant contrast.
* Included an `aria-live="polite"` region announcing density level alterations.
* Integrated Current Match Info Card and Quick Navigation widget.

### 2. Smart Navigation (`/navigate` & `/api/navigate`)
* Built shortest-path Dijkstra routing in `src/lib/routing.ts` that avoids closed zones and penalizes crowded ones.
* Created a secure consolidated `/api/gemini` route for all server-side GenAI requests.
* `/api/navigate` calls Dijkstra, then pings `/api/gemini` passing calculated paths and full zone occupancy context to produce clean, natural language walking instructions.

### 3. Multilingual Assistant Chat (`/assistant` & `/api/chat`)
* Built `/api/chat` route to manage and store history logs inside the `chat_sessions` database table.
* Developed WhatsApp-style bubble interface with automated preferred language detection and active language selector.
* Locked Gemini scope strictly to World Cup operations topics.

### 4. Staff Operations Panel (`/staff`)
* Role-based access control protecting operations from unauthorized roles.
* Task assignment display with color-coded priority levels.
* Status updater tool to update zone states (`open`/`crowded`/`closed`).
* Priority broadcast module to send alerts dynamically to all active dashboards.

### 5. Supabase Live Connection & Google OAuth (Phase 5)
* **Project Name**: `ArenaIQ` on Supabase
* Login page updated with Google Sign-In button (brand-accurate SVG logo, loading state)
* `supabase.auth.signInWithOAuth({ provider: 'google' })` wired with `redirectTo: /auth/callback`
* All Supabase client/server/middleware files already use `@supabase/ssr` correctly
* Auth callback (`/auth/callback/route.ts`) handles `exchangeCodeForSession` for both email and OAuth flows
* Setup guide created for: Supabase project creation, API key extraction, Google Cloud OAuth credentials, Supabase provider configuration, and site URL configuration

### 6. Tests & Quality Assurance
* Built and expanded Vitest tests to cover Dijkstra routing edge cases, overloaded formatting helper parameters, complex component states, and mocked Gemini/Supabase API routes.
* **Result**: **57 passed tests out of 57**.
* **ESLint check**: 100% clean check (0 warnings, 0 errors).
* **Build validation**: Successful production compile output.

### 7. Stadium Control Room Redesign (Phase 6)
* **Theme**: Visually distinctive dark control room vibe themed for FIFA World Cup 2026™ Operations.
* **Color System**: Primary deep navy (`#0a0f1e`), electric blue (`#00A8E8`) details, and high-impact FIFA Gold (`#FFD700`) accents.
* **Background**: CSS-only animated grid & moving scanline overlay representing live tactical feeds.
* **Scoreboard UI**: Scoreboard component styled with large bold team names, custom monospace LED timer scoreboard display, and gold score typography.
* **Card Borders**: Left-hand thick density indicator borders for zone cards (low: emerald, medium: amber, high: orange, critical: red).
* **Smooth Transitions**: Smooth CSS transitions added on data updates (`transition-all duration-700` on occupancy progress bars).
* **Glassmorphism**: Login card redesigned with `bg-white/5 backdrop-blur-xl` and gold tactical corner borders.
* **Favicon**: Added explicit favicon settings directly in metadata within root `layout.tsx`.

### 8. MCP Connection Status & Next.js Middleware Fix
* **Supabase MCP**: Successfully configured and connected in `.idx/mcp.json` using the provided token.
* **Vercel MCP**: Switched to `vercel-mcp-pro@latest` and configured with the provided token; successfully verified connection and listed projects.
* **Next.js Middleware Fix**:
  * Deleted `src/proxy.ts` and created `src/middleware.ts` running `updateSession` on incoming requests.
  * Confirmed that redirect logic in `src/lib/supabase/middleware.ts` correctly handles unauthenticated users trying to access `/dashboard` or `/staff` by sending them to `/login`.
  * Built the project successfully with zero errors under Next.js 16 (which notes deprecation of `middleware` in favor of `proxy` but maintains compatibility, compiling it as `ƒ Proxy (Middleware)`).

### 9. PromptWars Evaluation Upgrades
* **JSON-Formatted Output & Explainable AI (XAI)**:
  * Updated `/api/gemini` routing to request navigation data formatted strictly as JSON.
  * Configured Gemini SDK using `responseMimeType: "application/json"`.
  * Embedded JSON-RPC few-shot examples in the prompt body containing detailed path steps, estimated minutes, congestion warnings, accessibility notes, and explicit AI reasoning (`ai_reasoning`).
* **Frontend JSON Integration**:
  * Updated `src/app/navigate/page.tsx` to parse the JSON explanation.
  * Added conditional rendering for `congestion_warning` in a styled red alert banner.
  * Implemented a prominent teal callout card displaying the `accessibility_note` for wheelchair users.
  * Rendered the steps as a clean numbered list and placed `ai_reasoning` inside an interactive, collapsible `<details>` section ("Why this route?").
* **Few-shot Chat Context**:
  * Added behavior few-shot examples to the chat agent's system instruction, instructing it on directness, urgency detection (incorporating medical station locations), language switching, and tone.

### 10. Wheelchair Routing & Expanded Test Suite
* **Accessibility DB Migration** (`supabase/migrations/20260707_accessibility.sql`):
  * Added `has_elevator boolean DEFAULT false` to `zones`.
  * Added `is_step_free boolean DEFAULT true` to `zone_edges`.
  * Auto-populated elevators for all zones matching `%gate%` or `%concourse%`.
* **Routing Engine** (`src/lib/routing.ts`):
  * Extended `Zone` interface with `has_elevator?: boolean`.
  * Extended `Edge` interface with `is_step_free?: boolean`.
  * Added `wheelchairMode: boolean = false` parameter to `calculateRoute`.
  * When `wheelchairMode=true`, edges with `is_step_free === false` are skipped entirely from the adjacency list — forcing the algorithm to find a fully accessible path or return `null`.
* **Navigate API** (`src/app/api/navigate/route.ts`):
  * Destructures `wheelchairMode` from the request body.
  * Fetches `has_elevator` and `is_step_free` from Supabase.
  * Passes `wheelchairMode` through to `calculateRoute`.
* **Navigate Frontend** (`src/app/navigate/page.tsx`):
  * Added `wheelchairMode` state variable.
  * Rendered a ♿ Wheelchair / Step-free route checkbox toggle in the form.
  * Passes `wheelchairMode` flag in the API request body.
* **Test Suite Expansion** — **98 tests, 10 test files, all green**:
  * `routing.extended.test.ts` rewritten: 20 tests covering all edge cases (start/end non-existent, closed zones, same-node path, crowded avoidance/forced-use, congestedZones accuracy, rawTime≤totalTime invariant, disconnected graph, path integrity, and all wheelchair mode scenarios).
  * `utils.extended.test.ts` rewritten: 27 tests covering every branch of `cn()`, `formatOccupancy()`, and `getDensityLevel()`.
  * `api.test.ts` created (new): 13 targeted API validation tests covering missing/invalid inputs for all four API routes with full Supabase + Gemini mocks.

### 11. FIFA World Cup 2026 Mission Control UI Redesign (Phase 7)
**Scope**: Visual/CSS-only overhaul across 4 pages + globals.css. Zero logic, API, Supabase query, or TypeScript changes.

**Design Concept**: "Mission Control meets World Cup Stadium"
* **Color System**: Deep navy `#0a0f1e` base, Gold `#f5c518` as PRIMARY accent (used aggressively), Electric blue `#00a8e8` for live/realtime data, Emerald `#10b981` for safe/open, Red `#ef4444` for critical.

**globals.css additions**:
* Utility classes: `.text-gold`, `.bg-gold`, `.border-gold`, `.text-electric-blue`, `.glow-gold`, `.glow-blue`
* Full CSS `.toggle-switch` / `.toggle-slider` component for wheelchair accessibility toggle

**Landing Page (`/`)**:
* Added animated `LIVE` badge (red pulse) to ArenaIQ logo in header
* Added `MATCHDAY ACTIVE` strip with pulsing electric-blue dot above the hero
* Made "FIFA World Cup 2026" line at `text-5xl sm:text-8xl` in gold, almost full width
* Added 4-column stats grid: 80K Fans / 14 Zones / 6 Languages / Gemini AI
* Feature cards: gold `border-l-4` always visible, watermark `01/02/03` numbers in top-right corner (`text-6xl opacity-10`), `hover:shadow-[0_8px_32px_rgba(245,197,24,0.15)]`

**Dashboard (`/dashboard`)**:
* Command Center header: left = logo + "COMMAND CENTER" in electric blue; center = "MATCHDAY OPERATIONS — LIVE" with pulsing red dot; right = role badge + logout
* Scoreboard match card: `MEXICO 2 — 1 USA` in `text-5xl` gold font-black, "ESTADIO AZTECA • 80'" in electric blue, gold glow shadow
* Zone cards completely restyled: horizontal layout, 8px left colored indicator bar, `X,XXX / Y,XXX` occupancy text, `text-2xl font-black` percentage on right, progress bar, status badge
* Simulate button: full-width gold background, `⚡ Simulate Crowd Movement` with Zap icon, black text, font-black

**Navigate (`/navigate`)**:
* Large gold `FIND YOUR ROUTE` heading (`text-4xl sm:text-5xl font-black`)
* FROM / TO selectors with electric-blue/gold labels, zone name preview card below each select
* Flag emoji displayed inline next to language selector
* Wheelchair toggle replaced with proper CSS `.toggle-switch` component
* Calculate Route button: large, full-width gold with ArrowRight icon
* Route result: `~X MIN WALK` in `text-3xl font-black` gold, step numbers in gold circles, congestion as `⚠️` red alert banner, "Why this route?" in electric-blue text, accessibility note in teal card

**Assistant (`/assistant`)**:
* Header: `ArenaIQ ASSISTANT` with flag emoji + language selector inline in a bordered pill
* User messages: amber/gold background (`bg-amber-500/20`), right-aligned, `rounded-tr-sm`
* Assistant messages: navy-card background with electric-blue `border-l-4`, `rounded-tl-sm`
* Timestamps on each message in `text-xs text-slate-500`
* Send button: gold background, ArrowRight icon
* Footer under input: "Powered by Gemini AI • Responds in your language"

**Build**: ✅ Zero errors — 14 routes compiled (Next.js 16.2.4 Turbopack, 17.5s)
**Tests**: ✅ 98/98 passed across 10 test files (no logic changed)
**ESLint**: ✅ 0 warnings, 0 errors (`--max-warnings=0`)
**Commit**: `3b5751d` pushed to `origin/main`

### 12. Persistent App Shell Redesign (Phase 8)
**Scope**: Visual/structural redesign of the authenticated app shell — new persistent sidebar for desktop + bottom tab bar for mobile. Zero logic or API changes.

**New Component**: `src/components/layout/AppShell.tsx`
* Client component wrapping all authenticated page content
* **Desktop sidebar** (fixed 240px): ArenaIQ logo with gold "IQ" suffix, animated "LIVE" red pulsing badge, nav links with active gold left-border state, user email + colored role pill (fan/staff/organizer), sign-out button
* **Mobile bottom tab bar** (fixed, `< md`): 5 emoji+label tabs with active gold highlight, gold underline indicator dot
* **Top bar**: page title prop (desktop) / logo+hamburger (mobile), live clock updating every second, "FIFA WC 2026" gold badge
* **Nav items**: Dashboard (🏠), Navigate (🗺️), Assistant (💬), Staff Ops (📋), Matches (🏆)
* Auth loaded inside AppShell via Supabase client — no per-page auth boilerplate needed

**New Route**: `src/app/matches/page.tsx` — placeholder page for upcoming matches feature

**Pages updated** (header/footer/nav removed, wrapped in AppShell):
* `src/app/dashboard/page.tsx` — title: "Command Center"
* `src/app/navigate/page.tsx` — title: "Smart Route Planner"
* `src/app/assistant/page.tsx` — title: "AI Assistant"
* `src/app/staff/page.tsx` — title: "Staff Ops"

**Build**: ✅ TypeScript clean, Compiled successfully (Next.js 16.2.4 Turbopack)

### 13. Page Content Redesign (Phase 8 — Interior)
**Scope**: Redesign of page content areas (inside AppShell). Zero API/logic changes.

**globals.css additions**: `.arena-card`, `.arena-card-sm`, `.status-open/crowded/closed/critical`, `.stat-number`, `.section-heading`, `.typing-dot` animation keyframe

**Dashboard (`/dashboard`)**:
* 4-stat top row: Total Fans (gold), High Density Zones (red), Zones Clear (emerald), Last Updated (electric-blue)
* Full-width FIFA scoreboard with flag emojis, `text-6xl font-black` score, gold progress bar (80/90 match time)
* Zone heatmap grid: clickable cards → `router.push('/navigate?startZone=...')`, left accent bar, percentage, thin progress bar, status pills using `.status-*` classes

**Navigate (`/navigate`)**:
* "FIND YOUR ROUTE" heading in white font-black with gold accent
* Two large selector cards (FROM / TO) with `text-xl font-bold` selects, zone name + status badge preview
* Options row: wheelchair toggle + language selector side-by-side
* Gold full-width `⚡ CALCULATE OPTIMAL ROUTE` button
* Result: emerald "OPTIMAL ROUTE FOUND" header, stat-number walk time, congestion/accessibility cards, numbered steps with ArrowRight icons, collapsible AI reasoning

**Assistant (`/assistant`)**:
* Fixed-height chat layout (`100vh - 56px`) with flex column
* Top bar: ArenaIQ title, ✨ Gemini violet badge, flag+language selector, clear button
* Messages: `bg-gold/15 border-gold/30` user bubbles, `border-l-4 border-electric-blue` AI bubbles, ArenaIQ label above assistant messages
* Animated `.typing-dot` indicator (electric-blue bouncing dots)
* Round pill input + gold circle send button (ArrowUp icon)

### 14. Graphify Installation & Codebase Mapping
* Installed the `graphifyy` CLI tool inside a custom python virtual environment (`/home/user/.venv-graphify`) using python3 from the Nix packages environment.
* Configured the system's `stdenv.cc.cc.lib` dynamically by creating a shell wrapper script at `/home/user/.local/bin/graphify` to resolve `libstdc++.so.6` for C-extensions (such as NumPy).
* Registered Graphify skill for Google Antigravity globally and project-scoped to generate `.agents/skills/graphify/SKILL.md`, rules, and workflows.
* Successfully generated the codebase knowledge graph using `graphify . --code-only` mapping 273 nodes, 354 edges, and 24 communities inside `graphify-out/`.

