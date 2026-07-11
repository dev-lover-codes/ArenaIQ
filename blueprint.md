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


