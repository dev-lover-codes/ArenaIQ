# ArenaIQ 🏟️ — FIFA World Cup 2026™ Mission Control & Volunteer Co-Pilot

ArenaIQ is an enterprise-grade, Generative AI-enabled platform designed for FIFA World Cup 2026™ stadium operations. Developed for the Hack2Skill PromptWars Challenge 4, ArenaIQ addresses critical matchday challenges: crowd bottlenecks, multilingual communication gaps, real-time staff/volunteer coordination, and step-free accessibility.

By combining **deterministic pathfinding algorithms** with **advanced LLM reasoning** (Gemini 1.5 Flash) and **real-time synchronization** (Supabase Realtime), ArenaIQ acts as a mission control for operators and a real-time co-pilot for stadium volunteers.

---

## 📐 Evaluation Criteria Mapping

> This section maps each challenge brief requirement directly to the concrete implementation in this repository so evaluators can verify alignment without running the app.

### 1. Crowd Management & Real-Time Decision Making

**Brief requirement:** The system must monitor crowd density in real time and surface actionable decisions.

| What | Where | How |
|------|-------|-----|
| Real-time zone occupancy | `src/hooks/useZones.ts` | Supabase Realtime `postgres_changes` subscription on the `zones` table — every `UPDATE` event triggers an immediate React state update with no polling |
| Live heatmap dashboard | `src/app/dashboard/page.tsx` | Color-coded zone cards (low/medium/high/critical) update in <1 s via WebSocket. An `aria-live="polite"` region announces density changes to screen readers |
| Crowd simulation | `src/app/api/simulate-crowd/route.ts` | Randomises `current_occupancy` across all zones; evaluators can click **Simulate** on the dashboard to see real-time propagation |

---

### 2. Smart Navigation with Explainable AI

**Brief requirement:** Navigate fans safely via the least-congested route, with accessibility support and transparent AI reasoning.

| What | Where | How |
|------|-------|-----|
| Deterministic Dijkstra routing | `src/lib/routing.ts` | Custom weighted-graph solver. Crowded zones incur a **3× time penalty**; closed zones are removed from the graph entirely. Gemini **never invents a path** — it only translates pre-computed nodes into walking steps |
| Wheelchair / step-free mode | `src/components/navigate/RouteForm.tsx` L115 + `src/lib/routing.ts` | Toggle filters out any edge flagged `stepFree: false`, routing through elevators and ramps. Returns an explicit accessibility error if no safe path exists |
| Explainable AI (`ai_reasoning`) | `src/lib/gemini/prompts.ts` → `buildNavigatePrompt()` | The Gemini prompt instructs the model to return a JSON field `"ai_reasoning"` explaining *why* that specific path was chosen. The field is rendered in the UI under the route steps (collapsible) — it is surfaced to the user, not consumed silently |
| Navigation page | `src/app/navigate/page.tsx` | Full end-to-end UI: zone selector → Dijkstra → Gemini → structured step cards |

---

### 3. Real-Time AI Decisions with Structured Output

**Brief requirement:** AI must classify situations in real time and produce machine-readable, actionable outputs (not just prose).

| What | Where | How |
|------|-------|-----|
| Gemini JSON-forced output | `src/lib/gemini/handlers.ts` `handleChat()` + `src/lib/gemini/prompts.ts` `buildVolunteerSystemInstruction()` | The Gemini SDK is called with `responseMimeType: "application/json"` for all structured actions. The volunteer prompt enforces a strict schema: `{ response, announcement, urgency, escalate, reason }` |
| Urgency field (`LOW`/`MEDIUM`/`HIGH`/`CRITICAL`) | `src/hooks/useChatSession.ts` `tryParseCopilot()` | The urgency value drives UI rendering (colour-coded bubble borders) — it is not decorative |
| Escalation flag (`escalate: true/false`) | `src/components/assistant/MessageBubble.tsx` | Rendered as a prominent **"ESCALATE TO SECURITY"** badge on the chat bubble when `true` |
| Volunteer Co-pilot toggle | `src/app/assistant/page.tsx` L80–92 | A clearly labelled **VOLUNTEER** button in the chat header switches the system instruction and output schema. **The feature is fully reachable from the UI** — evaluators can toggle it without any code change |

---

### 4. Multi-Language Support

**Brief requirement:** The system must support fans speaking multiple languages in real time.

| What | Where | How |
|------|-------|-----|
| 6-language chat | `src/app/assistant/page.tsx` + `src/hooks/useChatSession.ts` | Language code sent with every request; Gemini system instruction ends with `"Always respond in: ${language}"`. Tested languages: English, Spanish, French, Arabic, Portuguese, Hindi |
| 6-language navigation | `src/components/navigate/RouteForm.tsx` + `src/lib/gemini/prompts.ts` `buildNavigatePrompt()` | The `language` parameter is injected into the navigation prompt; Gemini returns walking step text in the selected language |
| Language persists across sessions | `src/app/onboarding/page.tsx` | Language preference stored in `localStorage` during onboarding; surfaced as default in all language selectors |

---

### 5. Volunteer Co-Pilot Mode (End-to-End Feature Walkthrough)

This feature closes the gap between AI output and physical action in the stadium.

1. **Toggle on**: Press **VOLUNTEER** button in the assistant header (`/assistant`) — the subtitle changes to "🟡 Volunteer Co-pilot mode"
2. **Send a fan situation**: e.g., *"A fan collapsed near Gate C, not responding"*
3. **Structured AI response** (JSON parsed client-side):
   - `response` → what the volunteer should say to the fan
   - `announcement` → a megaphone-ready PA script, rendered in the **PA Announcement Panel** below the chat
   - `urgency: "CRITICAL"` → red badge on the message bubble
   - `escalate: true` → **ESCALATE TO SECURITY** badge
   - `reason` → one-line AI reasoning for the urgency classification
4. **PA Announcement Panel**: copy-to-clipboard button for the announcement script (`src/components/assistant/PAAnnouncementPanel.tsx`)

**All five output fields are visible in the UI** — none are consumed silently or discarded.

---

## 🎯 Primary Persona: The Stadium Volunteer
A stadium volunteer managing a zone of **4,000+ international fans** speaking dozens of languages needs immediate, actionable answers. A fan approaches in distress. Is it a minor convenience or a medical emergency? 

ArenaIQ implements the **Input → Reasoning → Action** design pattern to empower this volunteer in real time:

```mermaid
graph TD
    A[Input: Fan Query + Live Zone Density] --> B[Reasoning: Gemini 1.5 Flash Urgency Classifier]
    B --> C[Action: Response Guideline + PA Announcement Script + Security Escalation Flag]
```

### The Operational Feedback Loop

| Stage | Input / Telemetry | AI Reasoning Process | Output & Action |
| :--- | :--- | :--- | :--- |
| **INPUT** | Volunteer captures fan query + real-time stadium zone occupancy telemetry. | Language, context, and physical crowd density context are aggregated. | Real-time state updates in volunteer UI. |
| **REASONING** | Security context check. | Gemini detects urgency level (`LOW`, `MEDIUM`, `HIGH`, `CRITICAL`), translation needs, and safety escalations. | Secure API gateway processing (`/api/gemini`). |
| **ACTION** | Machine-readable JSON output. | Generates: (1) friendly verbal response, (2) megaphone-ready PA announcement, (3) instant dispatch toggle (`escalate: true/false`). | Rendered in high-contrast cards. |

---

## 🗺️ Smart Navigation: Decoupling Routing from GenAI
To guarantee safety, **Gemini is never allowed to invent paths**. A routing hallucination during a stadium evacuation could be catastrophic. ArenaIQ separates routing calculation from natural language explanations:

1. **Deterministic Pathfinding**: A custom Dijkstra solver (`src/lib/routing.ts`) calculates the shortest path over actual stadium graph data. It applies a 3× weight penalty to crowded zones and skips closed/blocked zones entirely.
2. **Wheelchair / Step-Free Mode**: If wheelchair routing is toggled, the Dijkstra engine filters out any graph edge marked as non-step-free (e.g. stairs), forcing a route through elevators and ramps, or returning an accessibility alert if no safe path exists.
3. **Explainable AI (XAI)**: The computed nodes are packaged into a structured payload and sent to the secure server-side `/api/gemini` endpoint. Gemini translates the list of nodes into friendly walking steps and returns:
   - Walk time estimations.
   - Congestion warnings.
   - Accessibility notes.
   - Step-by-step navigation instructions.
   - Collapsible `ai_reasoning` explaining the route choice.

---

## ⚙️ Core Pillars & Capabilities

### 1. Live Heatmap Dashboard (`/dashboard`)
* Real-time websocket subscription (`public:zones`) displaying occupancy and capacity levels.
* Color-coded zone indicators (low, medium, high, critical) complying with WCAG 2.1 AA contrast ratios.
* Live `aria-live` screen-reader notifications announcing zone status adjustments.
* Live scoreboard showing active match stats (teams, timer, goals) with visual gold glow accents.

### 2. Smart Navigation Wayfinding (`/navigate`)
* Dual-zone selector with automatic visual route previews.
* A dedicated toggle switch for **Wheelchair & Step-Free** routing.
* Natural-language step instructions formatted in any of the 6 supported languages.

### 3. Multilingual AI Assistant (`/assistant`)
* Dedicated WhatsApp-style chat interface providing operational assistance.
* Restricts response scope strictly to World Cup operations topics using a strict system instruction guardrail.
* Supported languages: English, Spanish, French, Arabic, Portuguese, and Hindi.

### 4. Staff Command Operations (`/staff`)
* Role-based access control (RBAC) protecting incident logging and status changes.
* Task management panel with priorities (High, Medium, Low).
* Broadcast module sending push notifications and banner overrides to all dashboard screens.

---

## 🛠️ Technical Stack

* **Frontend & Shell**: Next.js 16 (App Router, Turbopack developer mode, SSR/CSR hybrid architectures)
* **Styling & Theme**: Tailwind CSS v4 featuring a custom "Estadio Azteca Mission Control" dark theme
* **Database & RLS**: Supabase (Postgres, Realtime subscriptions, explicit non-test-mode RLS policies)
* **AI Integration**: Gemini 1.5 Flash (accessed via secure server-side proxy `/api/gemini`, enforcing structured JSON schemas and few-shot priming)
* **Testing Engine**: Vitest + React Testing Library + JSDOM

---

## 🧠 Prompt Engineering & Safety Guardrails
* **No Client Keys**: The frontend never communicates directly with the Gemini API. All interactions go through `/api/gemini`.
* **JSON-Forced Output**: Using the Gemini SDK's `responseMimeType: "application/json"`, responses are strictly formatted against schema structures to prevent UI-breaking text output.
* **Domain Restrictions**: The model prompt enforces strict system instructions to reject irrelevant queries (e.g., code requests, general chats) with the fallback: *"I can only assist with World Cup stadium operations, facilities, concessions, schedules, and navigation."*
* **Few-shot Context**: Includes typical emergency scenarios (lost children, chest pain, exits) in the prompt cache, ensuring immediate classification of `CRITICAL` state.

---

## 🔒 Security
See [SECURITY.md](file:///home/user/project-4/SECURITY.md) for our dependency vulnerability posture and upgrade plan.

---

## 🚀 Local Setup & Deployment

### 1. Configure Environment Variables
Duplicate `.env.example` to `.env.local` and populate your Supabase and Gemini credentials:
```bash
cp .env.example .env.local
```

Fill in the following variables:
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
GEMINI_API_KEY=your_gemini_api_key
```

### 2. Install Project Dependencies
```bash
npm install
```

### 3. Run the Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) to view the application.

### 4. Run Tests & Lint Checks
```bash
# Run unit and integration tests
npm run test

# Run ESLint validation
npm run lint
```

### 5. Build for Production
```bash
npm run build
```

---

## 🧪 Testing with Custom Stadium Graphs
Judges can verify the routing and crowd penalty mechanics by issuing a POST request to the crowd simulation endpoint `/api/simulate-crowd` with a custom stadium graph structure:

```json
{
  "zones": [
    {
      "id": "gate-a-uuid",
      "name": "Gate A Concourse",
      "current_occupancy": 8900,
      "capacity": 10000,
      "status": "crowded"
    }
  ]
}
```

The Dijkstra engine will automatically recalculate paths, applying the 3× crowd penalty factors and rendering walking instructions via Gemini under `/navigate`.

---

## 📋 Comprehensive Routes Directory

| Route | Accessibility & Purpose | Supported Actions |
| :--- | :--- | :--- |
| `/` | Landing page outlining ArenaIQ capabilities. | Hero CTA |
| `/login` | Secure auth page using email-password or Google OAuth. | Google OAuth button, Supabase Auth |
| `/dashboard` | Command center live heatmap and tactical scoreboard. | Real-time websocket subscriptions |
| `/navigate` | Dijkstra pathfinder with step-by-step walking steps. | Wheelchair mode toggle, language selector |
| `/assistant` | Volunteer multilingual copilot bubble chat. | Urgency detection, PA message generation |
| `/staff` | Operation management panel. | Update zone status (Open/Closed/Crowded) |
| `/matches` | WC 2026 fixtures feed with AI-generated tactical overviews. | Gemini match insights |
| `/onboarding` | 3-step profile customizer (Role, gate, language selection). | Set user defaults |
| `/api/gemini` | Core server-side Gemini prompt dispatcher. | JSON format routing |
| `/api/navigate` | Intermediate routing Dijkstra coordinator. | Combines routing data & Gemini response |
| `/api/chat` | Chat session storage coordinator. | Supabase read/writes |
| `/api/simulate-crowd` | Background randomizer simulating crowd movement. | Modifies occupancy database rows |

