# RegulationGuard

> **From contract to compliance report in minutes, not weeks.**

Multi-Agent Compliance & Regulatory Review System yang menggunakan 4 AI agents untuk mereview dokumen kontrak terhadap regulasi (GDPR, OJK, PDPA, ISO 27001).

**Band of Agents Hackathon · lablab.ai · Track 3 — Regulated & High-Stakes Workflows**

## Quick Start (Local)

### 1. Frontend
```bash
cd frontend && npm install && npm run dev
# → http://localhost:5173
```

### 2. Backend
```bash
cd backend-node && npm install && npm run dev
# → http://localhost:3001
```

### 3. Band Service (opsional)
```bash
cd backend-band && pip install -r requirements.txt && python main.py
# → http://localhost:8001
```

## Deploy ke Cloudflare

Lihat [documentation/DEPLOYMENT.md](./documentation/DEPLOYMENT.md) untuk panduan lengkap.

### Quick Deploy

```bash
# 1. Deploy backend Worker
cd backend-node
npx wrangler login
npx wrangler deploy

# 2. Deploy frontend Pages
cd frontend
echo "VITE_API_URL=https://regulation-guard-api.YOUR-SUB.workers.dev" > .env.production
npm run build
npx wrangler pages deploy ./dist --project-name=regulation-guard
```

## Arsitektur

```
Frontend (Pages)  →  Worker API  →  AI Provider (BYOK)
    React/Vite       Hono/AI SDK     13 providers
                      + Knowledge
```

4 Agents berjalan secara sequential:
1. **Policy Reader** — Extract clauses
2. **Risk Analyzer** — Score risk severity
3. **Legal Cross-Checker** — Cross-reference regulations
4. **Compliance Reporter** — Generate audit report

## Features

- ✅ BYOK (Bring Your Own Key) — 13 AI providers
- ✅ PDF & DOCX parsing
- ✅ Real-time SSE streaming
- ✅ Knowledge injection (lightweight RAG)
- ✅ Export PDF & Markdown
- ✅ Cloudflare Workers & Pages deployment

## Documentation

- [PRD v2](./documentation/PRDv2.md) — Product requirements
- [STATUS](./documentation/STATUS.md) — Build status & features
- [DEPLOYMENT](./documentation/DEPLOYMENT.md) — Cloudflare deployment guide
- [AGENTS_IMPROVEMENT](./documentation/AGENTS_IMPROVEMENT.md) — Agent improvement tasks
- [KNOWLEDGE_INJECTION](./documentation/KNOWLEDGE_INJECTION.md) — RAG pattern docs

## License

MIT
