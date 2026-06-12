# AGENTS.md — RegulationGuard Context

> **For AI coding agents**: This document provides the full context needed to understand, navigate, and modify the RegulationGuard codebase.

---

## Project Overview

**RegulationGuard** is a multi-agent compliance & regulatory review system that automatically reviews contract and policy documents against legal/regulatory standards (GDPR, OJK, PDPA, ISO 27001). It uses 4 specialized AI agents that collaborate through Band SDK to produce traceable compliance audit reports.

**Tagline**: *"From contract to compliance report in minutes, not weeks."*

**Hackathon**: Band of Agents Hackathon · lablab.ai · Track 3 — Regulated & High-Stakes Workflows

---

## Monorepo Structure

```
regulation-guard/
├── frontend/               # React 18 + TypeScript + Vite + Tailwind CSS
│   ├── src/
│   │   ├── pages/          # 5 pages: Landing, Settings, Upload, Review, Results
│   │   ├── components/
│   │   │   ├── sections/   # Landing page sections (Hero, Pipeline, RiskTable, Coverage, Ledger, CTA, Footer, Navbar)
│   │   │   └── ui/         # Reusable UI components (AgentStatus, CornerGlow, GrainSection, Logo, ProviderIcon, RiskEntry, SectionDivider, TimelineEntry, PlusCrosshair)
│   │   ├── lib/
│   │   │   ├── api.ts      # HTTP + SSE client for Node.js backend (startReview, streamReviewEvents, getReviewResult, validateKey)
│   │   │   ├── byok.ts     # BYOK config: 13 providers, localStorage key management, auth headers
│   │   │   └── export.ts   # PDF (via HTML print) and Markdown export for compliance reports
│   │   ├── types.ts        # Shared TypeScript interfaces (AgentStatusProps, RiskEntryProps, TimelineEntryProps)
│   │   ├── App.tsx          # React Router setup with 5 routes
│   │   ├── main.tsx         # Entry point
│   │   └── index.css        # Tailwind layers + custom components (terminal-block, badge, status-dot, tokens)
│   ├── tailwind.config.js   # Custom design tokens (colors, fonts, fontSize with clamp)
│   ├── vite.config.ts       # Vite config with @assets alias
│   └── package.json
│
├── backend-node/            # Node.js + Hono + Vercel AI SDK
│   ├── src/
│   │   ├── index.ts         # Hono app: CORS, logging, health check, route mounting (port 3001)
│   │   ├── routes/
│   │   │   ├── review.ts    # POST /start, GET /:id/stream (SSE), GET /:id/result — full pipeline orchestration
│   │   │   └── validate.ts  # POST /validate-key — tests API key with minimal LLM call
│   │   ├── agents/
│   │   │   ├── policyReader.ts    # Agent 1: Extracts clauses from document text → JSON array
│   │   │   ├── riskAnalyzer.ts    # Agent 2: Scores each clause with severity + reasoning
│   │   │   ├── legalChecker.ts    # Agent 3: Cross-references against selected regulations
│   │   │   └── reporter.ts        # Agent 4: Synthesizes final compliance report with JSON repair
│   │   └── lib/
│   │       ├── aiClient.ts  # BYOK factory: createModel() — Anthropic special case, rest via createOpenAI
│   │       ├── bandClient.ts # HTTP client to Python Band service (createBandRoom, sendBandMessage, closeBandRoom)
│   │       └── pdfParser.ts  # pdf-parse for PDF, mammoth for DOCX
│   └── package.json
│
├── backend-band/            # Python + FastAPI + Band SDK (Thenvoi)
│   ├── main.py              # FastAPI app with CORS (port 8001)
│   ├── routes/
│   │   ├── session.py       # POST /create, GET /:id/events (SSE), DELETE /:id — Band room lifecycle
│   │   └── message.py       # POST /send, GET /:session_id — typed agent messages
│   ├── services/
│   │   └── band_service.py  # Band SDK wrapper: room CRUD, message passing, SSE streaming, in-memory fallback
│   └── requirements.txt     # fastapi, uvicorn, band-sdk, thenvoi-client-rest, sse-starlette
│
├── documentation/
│   ├── PRD.md               # Product Requirements Document v1
│   ├── PRDv2.md             # Updated PRD with BYOK architecture
│   └── STATUS.md            # Build status and feature checklist
│
├── docker-compose.yml       # All 3 services orchestrated
├── .env.example             # Environment variables template
└── README.md                # Quick start guide
```

---

## Architecture

```
┌──────────────────────────────────────────────┐
│           FRONTEND (React + Vite)             │
│   Upload UI, BYOK Settings, Live Dashboard    │
│   Pages: Landing → Settings → Upload → Review │
│          → Results                            │
└────────────────────┬─────────────────────────┘
                     │ HTTP / SSE (with BYOK headers)
┌────────────────────▼─────────────────────────┐
│        NODE.JS BACKEND (Hono + AI SDK)        │
│   REST API, BYOK, PDF parsing, Agent LLM      │
│   4-agent pipeline: PolicyReader →            │
│     RiskAnalyzer → LegalChecker → Reporter    │
└────────────────────┬─────────────────────────┘
                     │ Internal HTTP (localhost)
┌────────────────────▼─────────────────────────┐
│       PYTHON BAND SERVICE (FastAPI + Band)    │
│   Band SDK rooms, agent message passing        │
│   Falls back to in-memory when no BAND_API_KEY│
└──────────────────────────────────────────────┘
```

---

## Data Flow

### 1. BYOK Key Lifecycle
```
User selects provider → enters API key + model name → stored in localStorage
Per request: headers X-API-Key, X-Provider-URL, X-Model-Name
Node.js backend reads headers → createModel() → LLM call
Key never touches database or logs
```

### 2. Review Pipeline
```
POST /api/review/start (file + regulations) → sessionId (status: "pending")
GET /api/review/:id/stream (SSE) → starts pipeline:
  1. Parse document (PDF via pdf-parse / DOCX via mammoth)
  2. Create Band room (Python service)
  3. Agent 1 (Policy Reader): extract clauses → JSON array
  4. Agent 2 (Risk Analyzer): score clauses → severity + reasoning
  5. Agent 3 (Legal Cross-Checker): cross-reference regulations → violations
  6. Agent 4 (Reporter): synthesize final report → ComplianceReport JSON
  7. Close Band room
GET /api/review/:id/result → final report JSON
```

### 3. SSE Event Types
- `clause_extraction_result` — Agent 1 output
- `risk_analysis_result` — Agent 2 output
- `legal_crosscheck_result` — Agent 3 output
- `final_report` — Agent 4 output
- `handoff` — Agent-to-agent transfer notification
- `band_room` — Band room lifecycle events
- `complete` / `error` — Terminal states

---

## Key Types & Interfaces

### Frontend (`frontend/src/types.ts`)
- `AgentStatusProps` — icon, name, label, status (active/processing/queued/complete), progress, output
- `RiskEntryProps` — id, regulation, status (COMPLIANT/CRITICAL_GAP/WARNING), riskScore, confidence
- `TimelineEntryProps` — txId, time, title, description, status (complete/active)

### Frontend API (`frontend/src/lib/api.ts`)
- `StartReviewResponse` — sessionId, status
- `SSEEvent` — id, agent, type, content, timestamp
- `ReportFinding` — id, clauseText, category, severity, status, regulation, article, reasoning, confidence, humanReview
- `ComplianceReport` — overallRisk, summary, recommendation, criticalCount, warningCount, passingCount, findings[]
- `ReviewResult` — sessionId, fileName, regulations, report

### Backend Agents
- `ExtractedClause` (policyReader) — id, category, text, severity
- `RiskScoredClause` (riskAnalyzer) — id, severity, reasoning, riskFactors[]
- `CrossCheckFinding` (legalChecker) — id, status, regulation, article, reasoning, confidence, humanReview
- `ComplianceReport` (reporter) — overallRisk, summary, recommendation, counts, findings[]

---

## Design System

### Colors (Tailwind custom tokens)
- **Backgrounds**: `bg-base` (#0a0a0a), `bg-surface` (#111113), `bg-surface-2` (#18181b), `bg-surface-3` (#1f1f23), `bg-surface-4` (#27272a)
- **Borders**: `border-subtle` (#27272a), `border-default` (#3f3f46), `border-strong` (#52525b)
- **Text**: `text-primary` (#fafafa), `text-secondary` (#a1a1aa), `text-tertiary` (#71717a), `text-muted` (#52525b)
- **Accents**: `accent-blue` (#60a5fa), `accent-cyan` (#22d3ee), `accent-emerald` (#34d399), `accent-amber` (#fbbf24), `accent-orange` (#fb923c), `accent-red` (#f87171)
- **Primary button**: `btn-primary` (#e4e4e7), `btn-primary-hover` (#d4d4d8)

### Fonts
- **Sans**: Inter, system-ui, sans-serif
- **Mono**: JetBrains Mono, Fira Code, ui-monospace, monospace

### CSS Components (`index.css`)
- `.terminal-block` / `.terminal-header` / `.terminal-body` — code terminal styling
- `.badge` — inline status badge with border
- `.status-dot` / `.status-active` / `.status-processing` / `.status-queued` — agent status indicators
- `.token-*` — syntax-highlighted code tokens (prompt, command, argument, flag, string, comment, key, value, accent)
- `.section-divider` — section separator with crosshair decorations

### Layout
- Max content width: `max-w-content` (1280px)
- All pages use consistent border-x pattern: `max-w-content mx-auto border-x border-border-subtle`
- Dark theme only (no light mode)

---

## Routing

| Path | Page | Description |
|------|------|-------------|
| `/` | LandingPage | Hero, Pipeline, RiskTable, Coverage, Ledger, CTA, Footer |
| `/settings` | SettingsPage | BYOK provider selection, API key input, model name, test connection |
| `/upload` | UploadPage | Drag-drop file upload, regulation selector, start review |
| `/review` | ReviewPage | SSE live feed, agent progress, clause extraction (receives sessionId via `location.state`) |
| `/results` | ResultsPage | Executive summary, risk matrix, detailed findings, export PDF/Markdown |

---

## API Endpoints

### Node.js Backend (port 3001)

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/health` | Health check |
| `POST` | `/api/validate-key` | Test API key validity (headers: X-API-Key, X-Provider-URL, X-Model-Name) |
| `POST` | `/api/review/start` | Upload document + start session (multipart: file + regulations) |
| `GET` | `/api/review/:id/stream` | SSE stream — real-time pipeline events |
| `GET` | `/api/review/:id/result` | Get final compliance report JSON |

### Python Band Service (port 8001, internal)

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/health` | Health check |
| `POST` | `/band/session/create` | Create Band room |
| `GET` | `/band/session/:id/events` | SSE stream of Band room events |
| `DELETE` | `/band/session/:id` | Close Band room |
| `POST` | `/band/message/send` | Send typed agent message |
| `GET` | `/band/message/:session_id` | Get all messages |

---

## BYOK Provider Support (13 providers)

| Provider | Base URL | Default Model |
|----------|----------|---------------|
| Anthropic | `https://api.anthropic.com` | claude-3-5-sonnet-20241022 |
| DeepSeek | `https://api.deepseek.com/v1` | deepseek-chat |
| OpenAI | `https://api.openai.com/v1` | gpt-4o-mini |
| OpenRouter | `https://openrouter.ai/api/v1` | openai/gpt-4o |
| Ollama | `https://ollama.com/api` | llama3 |
| Groq | `https://api.groq.com/openai/v1` | llama-3.3-70b-versatile |
| Mistral | `https://api.mistral.ai/v1` | mistral-large-latest |
| Together AI | `https://api.together.xyz/v1` | meta-llama/Llama-3-70b-chat-hf |
| Fireworks AI | `https://api.fireworks.ai/inference/v1` | llama-v3p1-70b-instruct |
| Google Gemini | `https://generativelanguage.googleapis.com/v1beta/openai` | gemini-1.5-flash |
| xAI Grok | `https://api.x.ai/v1` | grok-2 |
| Z.AI (Zhipu) | `https://api.z.ai/api/paas/v4` | glm-4 |
| Z.AI Coding | `https://api.z.ai/api/coding/paas/v4` | glm-4.7 |

**Implementation note**: All providers use OpenAI-compatible API format via `@ai-sdk/openai` `createOpenAI({ baseURL })` except Anthropic which uses `@ai-sdk/anthropic` `createAnthropic()`.

---

## Agent Prompts Summary

### Agent 1 — Policy Reader
- **Input**: Raw document text
- **Output**: JSON array of clauses with id, category, text, severity
- **Categories**: Payment, Liability, IP, Termination, Data, Subprocessor, Audit, Confidentiality, Other

### Agent 2 — Risk Analyzer
- **Input**: Extracted clauses from Agent 1
- **Output**: Scored clauses with severity (HIGH/MEDIUM/LOW), reasoning, riskFactors[]
- **Focus areas**: data retention, liability caps, subprocessor consent, termination notice, breach notification

### Agent 3 — Legal Cross-Checker
- **Input**: HIGH/MEDIUM risk clauses + user-selected regulations
- **Output**: Cross-check findings with status (VIOLATION/WARNING/COMPLIANT), regulation citation, confidence (0-100), humanReview flag
- **Conservative approach**: VIOLATION only when confident; WARNING when uncertain; humanReview=true for VIOLATION or confidence < 90

### Agent 4 — Compliance Reporter
- **Input**: All previous agent outputs
- **Output**: Structured report with overallRisk, summary, recommendation, findings with merged data
- **Special**: Includes JSON repair logic for truncated model responses

---

## Environment Variables

```env
# Frontend
VITE_API_URL=http://localhost:3001

# Node.js Backend
PORT=3001
BAND_SERVICE_URL=http://localhost:8001

# Python Band Service
PORT=8001
BAND_API_KEY=                         # Optional — falls back to in-memory mode
BAND_BASE_URL=https://platform.dev.band.ai
BAND_AGENT_01_ID=policy-reader
BAND_AGENT_02_ID=risk-analyzer
BAND_AGENT_03_ID=legal-checker
BAND_AGENT_04_ID=compliance-reporter
```

---

## Development Commands

```bash
# Frontend
cd frontend && npm install && npm run dev        # → http://localhost:5173

# Node.js Backend
cd backend-node && npm install && npm run dev     # → http://localhost:3001

# Python Band Service
cd backend-band && pip install -r requirements.txt && python main.py  # → http://localhost:8001

# All services via Docker
docker-compose up --build
```

---

## Key Patterns & Conventions

1. **Dark theme only** — all colors are zinc-based dark, no light mode
2. **BYOK everywhere** — API keys stored in `localStorage`, sent via headers, never persisted server-side
3. **SSE for real-time** — Server-Sent Events for live pipeline streaming (not WebSocket)
4. **In-memory sessions** — Node.js stores sessions in a `Map` (no database)
5. **Band fallback** — Python service works without BAND_API_KEY using in-memory rooms
6. **JSON output from agents** — all 4 agents output structured JSON parsed from LLM responses
7. **Error handling** — pipeline catches errors and maps them to user-friendly messages (401, 429, 403, timeout, etc.)
8. **Timeout protection** — 5-minute AbortSignal timeout on all agent LLM calls
9. **Corner glow sections** — Landing page uses `CornerGlow` component with radial gradients
10. **Grain shader** — Hero section uses `@paper-design/shaders-react` `GrainGradient`

---

## Build Status

- [x] Frontend — all 5 pages complete with full functionality
- [x] Backend Node — all 4 agents, SSE streaming, BYOK, PDF/DOCX parsing
- [x] Backend Band — Band SDK integration with in-memory fallback
- [x] Docker Compose — all 3 services orchestrated
- [x] Export — PDF (HTML print) and Markdown download
- [ ] E2E testing with multiple providers
- [ ] Demo video and slide deck
- [ ] Deployment (Vercel + Railway)
