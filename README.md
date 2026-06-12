<div align="center">

<br />

<img src="frontend/public/android-chrome-192x192.png" alt="RegulationGuard" width="72" />

<br />

# RegulationGuard

**Multi-Agent Compliance & Regulatory Review System**

*From contract to compliance report in minutes, not weeks.*

<br />

[![Cloudflare Workers](https://img.shields.io/badge/Cloudflare-Workers-F38020?logo=cloudflare&logoColor=white)](https://developers.cloudflare.com/workers/)
[![Cloudflare Pages](https://img.shields.io/badge/Cloudflare-Pages-F38020?logo=cloudflare&logoColor=white)](https://developers.cloudflare.com/pages/)
[![Hono](https://img.shields.io/badge/Hono-Web_Framework-360?logo=hono)](https://hono.dev/)
[![React](https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=black)](https://react.dev/)
[![Vercel AI SDK](https://img.shields.io/badge/Vercel-AI_SDK-000?logo=vercel)](https://sdk.vercel.ai/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)

<br />

Band of Agents Hackathon · lablab.ai · Track 3 — Regulated & High-Stakes Workflows

<br /><br />

</div>

---

## The Problem

Legal and compliance teams spend **40 to 60 hours per week** reviewing contracts by hand. Each clause is checked against evolving regulations (GDPR, OJK, PDPA, ISO 27001). Errors slip through. Escalation to external counsel costs $300 to $500 per hour. Existing tools lock you into a single AI provider.

## The Solution

RegulationGuard runs **4 specialized AI agents** that collaboratively review your contract or policy document, cross-reference every clause against the regulations you select, and produce a structured compliance audit report with traceable findings.

You bring your own API key. Pick from 13 providers. The agents use your key, your model, your infrastructure.

---

## How It Works

```
┌─────────────────────────────────────────────────────────────────┐
│  USER                                                            │
│  Upload PDF/DOCX + Select Regulations (GDPR, OJK, PDPA, ISO)    │
└──────────────────────────┬──────────────────────────────────────┘
                           │
                    ┌──────▼──────┐
                    │  Agent 1    │     Parse document, extract
                    │  Policy     │ ──  and categorize every clause
                    │  Reader     │     into structured JSON
                    └──────┬──────┘
                           │ handoff
                    ┌──────▼──────┐
                    │  Agent 2    │     Score each clause
                    │  Risk       │ ──  HIGH / MEDIUM / LOW
                    │  Analyzer   │     with reasoning + risk factors
                    └──────┬──────┘
                           │ handoff
                    ┌──────▼──────┐
                    │  Agent 3    │     Cross-reference against
                    │  Legal      │ ──  regulation knowledge base
                    │  Checker    │     VIOLATION / WARNING / COMPLIANT
                    └──────┬──────┘
                           │ handoff
                    ┌──────▼──────┐
                    │  Agent 4    │     Synthesize final report
                    │  Reporter   │ ──  with executive summary,
                    │             │     risk matrix, recommendations
                    └──────┬──────┘
                           │
                    ┌──────▼──────┐
                    │  Report      │    Export as PDF or Markdown
                    └─────────────┘
```

Each agent injects **regulation-specific knowledge** at runtime from a structured knowledge base (`/knowledge/*.md`), covering articles, risk patterns, incident reporting timelines, data localization rules, and retention requirements.

---

## Architecture

```
┌────────────────────────────────────┐
│        Frontend · Pages            │
│        React 18 · Vite · Tailwind  │
│        5 pages · SSE streaming     │
└──────────────┬─────────────────────┘
               │ HTTP + SSE (BYOK headers)
┌──────────────▼─────────────────────┐
│        API · Workers               │
│        Hono · Vercel AI SDK        │
│        4 agents · Knowledge base   │
│        PDF/DOCX parsing            │
└──────────────┬─────────────────────┘
               │ dynamic per-request
┌──────────────▼─────────────────────┐
│        AI Provider (your key)      │
│        13 providers supported      │
└────────────────────────────────────┘
```

The entire system runs on **Cloudflare's free tier**. No database, no external state, no vendor lock-in on AI models.

---

## Supported Regulations

| Regulation | Scope | Knowledge Coverage |
|---|---|---|
| **OJK POJK** | Indonesia financial services | risk patterns, articles, incident reporting, data localization, retention |
| **GDPR** | EU data protection | risk patterns, articles, breach notification, cross-border transfer, retention |
| **PDPA** | ASEAN (TH/SG) data protection | risk patterns, articles, cross-border transfer |
| **ISO 27001** | Information security | risk patterns, controls, security assessment |

---

## BYOK — Bring Your Own Key

No hardcoded provider. No platform API key. Your key, your model, your choice.

| Provider | Default Model | OpenAI-Compatible |
|---|---|---|
| Anthropic | claude-3-5-sonnet | No (native SDK) |
| OpenAI | gpt-4o-mini | Yes |
| DeepSeek | deepseek-chat | Yes |
| Google Gemini | gemini-1.5-flash | Yes |
| Groq | llama-3.3-70b-versatile | Yes |
| OpenRouter | openai/gpt-4o | Yes |
| Mistral | mistral-large-latest | Yes |
| xAI Grok | grok-2 | Yes |
| Together AI | meta-llama/Llama-3-70b | Yes |
| Fireworks AI | llama-v3p1-70b-instruct | Yes |
| Ollama | llama3 | Yes |
| Z.AI | glm-4 | Yes |
| Z.AI Coding | glm-4.7 | Yes |

Keys are stored in `localStorage` and sent via HTTP headers per request. They never touch a database or log.

---

## Pages

| Route | Description |
|---|---|
| `/` | Landing page: hero, pipeline visualization, risk table, regulation coverage |
| `/settings` | BYOK configuration: provider, API key, model name, test connection |
| `/upload` | Drag-and-drop file upload, regulation selector, start review |
| `/review` | Real-time SSE feed: agent progress, clause extraction, handoff events |
| `/results` | Executive summary, risk matrix, detailed findings, PDF/Markdown export |

---

## Quick Start

### Local Development

```bash
# Terminal 1 — API backend
cd backend-node && npm install && npm run dev
# → http://localhost:3001

# Terminal 2 — Frontend
cd frontend && npm install && npm run dev
# → http://localhost:5173

# Terminal 3 — Band service (optional, falls back to in-memory)
cd backend-band && pip install -r requirements.txt && python main.py
# → http://localhost:8001
```

Open `http://localhost:5173`, go to Settings, enter your API key, upload a document.

### Deploy to Cloudflare

```bash
# 1. Deploy the API
cd backend-node
npx wrangler login
npx wrangler deploy
# → https://regulation-guard-api.<sub>.workers.dev

# 2. Build and deploy the frontend
cd ../frontend
echo "VITE_API_URL=https://regulation-guard-api.<sub>.workers.dev" > .env.production
npm run build
npx wrangler pages deploy ./dist --project-name=regulation-guard
# → https://regulation-guard.pages.dev
```

Full guide: [`documentation/DEPLOYMENT.md`](documentation/DEPLOYMENT.md)

---

## Tech Stack

| Layer | Technology | Purpose |
|---|---|---|
| Frontend | React 18, Vite, Tailwind CSS, Framer Motion | UI, animations, SSE streaming |
| API | Hono, Vercel AI SDK, Cloudflare Workers | REST API, BYOK, agent orchestration |
| Parsing | pdfjs-dist, mammoth | PDF and DOCX text extraction |
| Knowledge | Structured Markdown with section tags | Lightweight RAG without vector DB |
| Band | Python, FastAPI, Band SDK | Multi-agent coordination (optional) |
| Infra | Cloudflare Pages + Workers | Global edge deployment, free tier |

---

## Project Structure

```
regulation-guard/
├── frontend/                # React + Vite + Tailwind
│   ├── src/
│   │   ├── pages/           # 5 routes: Landing, Settings, Upload, Review, Results
│   │   ├── components/      # UI components + landing sections
│   │   └── lib/             # API client, BYOK config, export utilities
│   └── package.json
│
├── backend-node/            # Hono + AI SDK (deploys to Workers)
│   ├── src/
│   │   ├── worker.ts        # Cloudflare Workers entry point
│   │   ├── index.ts         # Node.js entry point (local dev)
│   │   ├── agents/          # 4 agents: policyReader, riskAnalyzer, legalChecker, reporter
│   │   ├── routes/          # review.ts, validate.ts
│   │   └── lib/             # AI client, PDF parser, knowledge loader, Band client
│   ├── knowledge/           # Regulation knowledge base (ojk, gdpr, pdpa, iso27001)
│   ├── wrangler.jsonc       # Workers configuration
│   └── package.json
│
├── backend-band/            # Python + FastAPI + Band SDK (optional)
│   ├── main.py
│   ├── routes/              # session.py, message.py
│   └── services/            # band_service.py
│
└── docker-compose.yml       # All 3 services for local development
```

---

## License

MIT
