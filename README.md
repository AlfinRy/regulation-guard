# RegulationGuard

Multi-Agent Compliance & Regulatory Review System.

> *"From contract to compliance report in minutes, not weeks."*

Band of Agents Hackathon · lablab.ai · Track 3 — Regulated & High-Stakes Workflows

## Monorepo Structure

```
regulation-guard/
├── frontend/           # React 18 + TypeScript + Vite + Tailwind CSS
├── backend-node/       # Node.js + Hono + AI SDK (BYOK, LLM calls, PDF parsing)
├── backend-band/       # Python + FastAPI + Band SDK (agent orchestration)
├── documentation/      # PRD, status docs
├── docker-compose.yml  # Run all services locally
└── README.md
```

## Quick Start

### 1. Frontend

```bash
cd frontend
npm install
npm run dev
# → http://localhost:5173
```

### 2. Node.js Backend

```bash
cd backend-node
npm install
npm run dev
# → http://localhost:3001
```

### 3. Python Band Service

```bash
cd backend-band
pip install -r requirements.txt
python main.py
# → http://localhost:8001
```

### 4. All services (Docker)

```bash
docker-compose up
```

## Architecture

```
┌──────────────────────────────────────────────┐
│           FRONTEND (React + Vite)             │
│   Upload UI, BYOK Settings, Live Dashboard    │
└────────────────────┬─────────────────────────┘
                     │ HTTP / SSE
┌────────────────────▼─────────────────────────┐
│        NODE.JS BACKEND (Hono + AI SDK)        │
│   REST API, BYOK, PDF parsing, Agent LLM      │
└────────────────────┬─────────────────────────┘
                     │ Internal HTTP
┌────────────────────▼─────────────────────────┐
│       PYTHON BAND SERVICE (FastAPI + Band)    │
│   Band SDK rooms, agent message passing        │
└──────────────────────────────────────────────┘
```

## BYOK — Bring Your Own Key

Users provide their own API key. Supports 13 providers:

Anthropic, DeepSeek, OpenAI, OpenRouter, Ollama, Groq, Mistral, Together AI, Fireworks AI, Google Gemini, xAI Grok, Z.AI, Z.AI Coding

Keys are stored in browser localStorage and sent via HTTP headers. Never written to any database.

## License

MIT
