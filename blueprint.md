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
* Built Vitest tests for utility functions, custom UI primitives (Button, Input), components (NavigationForm, ChatInterface), and route handlers.
* **Result**: 13 passed tests out of 13.
* **ESLint check**: 100% clean check (0 warnings, 0 errors).
* **Build validation**: Successful production compile output.
