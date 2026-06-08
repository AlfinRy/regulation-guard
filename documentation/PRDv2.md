# Product Requirements Document (PRD) — v2.0
## RegulationGuard — Multi-Agent Compliance & Regulatory Review System
**Hackathon:** Band of Agents Hackathon · lablab.ai
**Track:** Track 3 — Regulated & High-Stakes Workflows
**Version:** 2.0 (BYOK + Split Architecture)
**Date:** June 2026
**Repo:** https://github.com/AlfinRy/regulation-guard

---

## Changelog v1 → v2

| # | Perubahan | Alasan |
|---|---|---|
| 1 | LLM provider tidak lagi hardcoded (Claude/OpenAI) | Diganti dengan BYOK — user input API key sendiri |
| 2 | Support 13 provider via base URL + API key | Anthropic, DeepSeek, OpenAI, OpenRouter, Ollama, Groq, Mistral, Together AI, Fireworks AI, Google Gemini, xAI Grok, Z.AI, Z.AI Coding |
| 3 | Backend dipecah menjadi dua service | Node.js (AI SDK + BYOK) + Python (Band SDK orchestration) |
| 4 | AI SDK (Vercel) digunakan sebagai unified LLM interface | Menggantikan direct Claude/OpenAI SDK calls |
| 5 | API key disimpan di localStorage, dikirim via header per-request | Tidak pernah disimpan di database |

---

## 1. Executive Summary

RegulationGuard adalah sistem multi-agen berbasis **Band** yang secara otomatis mereview dokumen kontrak dan kebijakan perusahaan terhadap standar regulasi (GDPR, OJK, PDPA, ISO 27001). Sistem menggunakan model AI pilihan user sendiri via BYOK — user cukup pilih provider dan masukkan API key mereka, lalu 4 agen spesialis berkolaborasi melalui Band untuk menghasilkan laporan compliance audit yang traceable.

**Tagline:** *"From contract to compliance report in minutes, not weeks."*

---

## 2. Problem Statement

### Pain Points
- Tim legal/compliance menghabiskan 40–60 jam/minggu untuk review kontrak secara manual
- Risiko human error saat mencocokkan klausul dengan regulasi yang terus berubah
- Tidak ada audit trail yang jelas dan defensible
- Eskalasi ke counsel eksternal mahal ($300–$500/jam)
- Tool compliance enterprise mahal dan lock-in ke satu model AI

### Target Users
- Tim Legal & Compliance perusahaan menengah-besar
- BUMN, perusahaan Tbk, fintech, healthtech di Indonesia dan ASEAN
- General Counsel yang mengelola banyak kontrak vendor

---

## 3. BYOK — Bring Your Own Key

### 3.1 Konsep

User tidak bergantung pada API key yang disediakan platform. Mereka memilih provider dan memasukkan key mereka sendiri di settings panel sebelum memulai review. Key disimpan di `localStorage` browser dan dikirim ke backend via HTTP header `X-API-Key` setiap request. Backend tidak pernah menyimpan key ke database.

### 3.2 Provider yang Didukung

| Provider | Base URL | Catatan |
|---|---|---|
| Anthropic | `https://api.anthropic.com` | Claude 3.5 Sonnet, Haiku |
| DeepSeek | `https://api.deepseek.com/v1` | DeepSeek-V3, DeepSeek-R1 (default) |
| OpenAI | `https://api.openai.com/v1` | GPT-4o, GPT-4o-mini |
| OpenRouter | `https://openrouter.ai/api/v1` | Aggregator semua model |
| Ollama Cloud | `https://ollama.com/api` | Local/cloud open-source models |
| Groq | `https://api.groq.com/openai/v1` | Llama 3, Mixtral (cepat) |
| Mistral | `https://api.mistral.ai/v1` | Mistral Large, Codestral |
| Together AI | `https://api.together.xyz/v1` | Open-source models |
| Fireworks AI | `https://api.fireworks.ai/inference/v1` | Fast inference |
| Google Gemini | `https://generativelanguage.googleapis.com/v1beta/openai` | Gemini 1.5 Pro/Flash |
| xAI Grok | `https://api.x.ai/v1` | Grok-2 |
| Z.AI (Zhipu) | `https://api.z.ai/api/paas/v4` | GLM-4 |
| Z.AI Coding | `https://api.z.ai/api/coding/paas/v4` | GLM-4 Coding |

### 3.3 UI Settings Panel

Sebelum upload dokumen, user mengisi:
- **Provider** — dropdown dengan 13 pilihan + logo masing-masing
- **API Key** — input type password, disimpan localStorage per-provider
- **Model** — input text bebas (user tahu model name mereka)
- **Test Connection** — tombol untuk verifikasi key valid sebelum mulai

### 3.4 Key Lifecycle

```
User input key → localStorage["rg_api_key"] + localStorage["rg_provider"]
      ↓
Per request: header X-API-Key + X-Provider-URL + X-Model-Name
      ↓
Node.js backend terima header → instantiate AI SDK client → LLM call
      ↓
Response streaming ke frontend via SSE
      ↓
Key tidak pernah menyentuh database atau logs
```

---

## 4. Arsitektur Sistem

### 4.1 Overview — Split Architecture

```
┌─────────────────────────────────────────────────────┐
│                   FRONTEND (React + Vite)            │
│  - Upload UI, BYOK Settings, Live Dashboard          │
│  - Connects via HTTP + SSE                           │
└──────────────────────┬──────────────────────────────┘
                       │ HTTP / SSE
┌──────────────────────▼──────────────────────────────┐
│              NODE.JS BACKEND (Express/Hono)          │
│  - REST API endpoints                                │
│  - BYOK: terima key via header, instansiasi client   │
│  - AI SDK (Vercel): unified generateText/streamText  │
│  - Orchestrate agent logic & LLM calls               │
│  - Kirim instruksi ke Python Band Service            │
└──────────────────────┬──────────────────────────────┘
                       │ Internal HTTP (localhost)
┌──────────────────────▼──────────────────────────────┐
│              PYTHON BAND SERVICE (FastAPI)           │
│  - Band SDK: room creation, agent registration       │
│  - Mengirim & menerima pesan antar-agen di Band      │
│  - Streaming Band events ke Node.js via SSE          │
│  - TIDAK melakukan LLM calls langsung                │
└─────────────────────────────────────────────────────┘
```

### 4.2 Kenapa Split?

- **Band SDK hanya tersedia di Python** — tidak ada versi Node.js resmi
- **AI SDK (Vercel) hanya tersedia di Node.js/TypeScript** — unified interface untuk 13+ provider
- **Keduanya wajib** — Band wajib oleh hackathon rules, AI SDK memungkinkan BYOK multi-provider
- **Solusi:** Python service handle koordinasi Band saja, Node.js handle semua LLM inference

---

## 5. Agent Architecture

### 5.1 Pipeline Overview

```
[User Upload PDF/DOCX]
      ↓
[Node.js: parse dokumen, kirim ke Agent 1]
      ↓
[Band Room dibuat oleh Python service]
      ↓
[Agent 1: Policy Reader]      ← LLM call via AI SDK (Node.js)
      ↓ handoff via Band room (Python)
[Agent 2: Risk Analyzer]      ← LLM call via AI SDK (Node.js)
      ↓ handoff via Band room (Python)
[Agent 3: Legal Cross-Checker] ← LLM call via AI SDK (Node.js)
      ↓ handoff via Band room (Python)
[Agent 4: Compliance Reporter] ← LLM call via AI SDK (Node.js)
      ↓
[Output: Compliance Report]
```

### 5.2 Detail Per Agent

#### Agent 1 — Policy Reader
- **Role:** Document ingestion & clause extraction
- **Input:** Raw text dari PDF/DOCX yang sudah di-parse
- **LLM Task:** Extract dan kategorikan semua klausul (payment, liability, IP, termination, data)
- **Output ke Band:** `{ type: "clause_extraction_result", clauses: [...] }`
- **Band message type:** `clause_extraction_result`

#### Agent 2 — Risk Analyzer
- **Role:** Risk scoring per clause
- **Input dari Band:** Clause list dari Agent 1
- **LLM Task:** Beri severity (HIGH/MEDIUM/LOW) + reasoning per klausul
- **Output ke Band:** `{ type: "risk_analysis_result", scored_clauses: [...] }`
- **Band message type:** `risk_analysis_result`

#### Agent 3 — Legal Cross-Checker
- **Role:** Cross-reference dengan regulasi aktual
- **Input dari Band:** Klausul HIGH & MEDIUM dari Agent 2
- **LLM Task:** Cocokkan klausul dengan regulasi yang dipilih user (GDPR, OJK, PDPA, ISO 27001)
- **Output ke Band:** `{ type: "legal_crosscheck_result", findings: [...] }`
- **Band message type:** `legal_crosscheck_result`

#### Agent 4 — Compliance Reporter
- **Role:** Synthesize laporan final
- **Input dari Band:** Semua output Agent 1–3
- **LLM Task:** Susun laporan audit terstruktur dengan executive summary, risk matrix, dan rekomendasi
- **Output:** `{ type: "final_report", report: {...} }`
- **Band message type:** `final_report`

---

## 6. Tech Stack

### Frontend
| Komponen | Teknologi | Status |
|---|---|---|
| Framework | React 18 + TypeScript + Vite | ✅ Sudah ada |
| Routing | React Router DOM | ✅ Sudah ada |
| Styling | Tailwind CSS 3.4 | ✅ Sudah ada |
| Animasi | Framer Motion | ✅ Sudah ada |
| Icons | Lucide React | ✅ Sudah ada |
| Real-time | SSE (EventSource) | 🔄 Ganti dari simulasi |
| File Upload | Native drag-and-drop | ✅ Sudah ada |
| BYOK UI | Settings panel (baru) | ❌ Perlu dibuat |

### Node.js Backend (Baru)
| Komponen | Teknologi | Alasan |
|---|---|---|
| Runtime | Node.js 20 + TypeScript | Kompatibel dengan AI SDK |
| Framework | Hono atau Express | Ringan, fast, TypeScript-friendly |
| AI SDK | `ai` (Vercel AI SDK) | Unified interface untuk 13 provider |
| PDF Parsing | `pdf-parse` atau `pdfjs-dist` | Parse PDF ke plain text di Node.js |
| DOCX Parsing | `mammoth` | Parse DOCX ke plain text |
| Streaming | SSE (built-in Hono/Express) | Real-time feed ke frontend |
| Key Handling | HTTP header `X-API-Key` | Tidak pernah disimpan |

### Python Band Service (Baru)
| Komponen | Teknologi | Alasan |
|---|---|---|
| Framework | FastAPI | Async, ringan |
| Band SDK | `band-sdk` (Python) | Wajib hackathon |
| Internal API | REST HTTP (localhost:8001) | Komunikasi dengan Node.js |
| Streaming | SSE via FastAPI | Forward Band events ke Node.js |

### Infrastructure
| Komponen | Teknologi |
|---|---|
| Frontend | Vercel |
| Node.js Backend | Railway atau Render |
| Python Band Service | Railway (service kedua) atau Fly.io |
| Storage | Supabase Storage (dokumen sementara) |
| Database | Supabase Postgres (audit logs, opsional) |

---

## 7. API Endpoints

### Node.js Backend

| Method | Endpoint | Deskripsi |
|---|---|---|
| `POST` | `/api/review/start` | Upload dokumen + config (provider, model, regulations). Header: X-API-Key, X-Provider-URL, X-Model-Name |
| `GET` | `/api/review/:sessionId/stream` | SSE stream — real-time agent feed + Band messages |
| `GET` | `/api/review/:sessionId/result` | Get final compliance report |
| `POST` | `/api/validate-key` | Test apakah API key valid untuk provider yang dipilih |
| `GET` | `/api/health` | Health check |

### Python Band Service (Internal)

| Method | Endpoint | Deskripsi |
|---|---|---|
| `POST` | `/band/session/create` | Buat Band room untuk session baru |
| `POST` | `/band/message/send` | Kirim pesan dari agent ke Band room |
| `GET` | `/band/session/:id/events` | SSE stream Band room events |
| `DELETE` | `/band/session/:id` | Tutup Band room setelah selesai |

---

## 8. BYOK Settings UI — Spesifikasi

### Lokasi
Halaman Settings (`/settings`) yang bisa diakses dari navbar dan dari Upload Page jika key belum diset.

### Fields

```
┌─────────────────────────────────────┐
│  AI Provider Settings               │
│                                     │
│  Provider    [Dropdown v]           │
│              [Logo] DeepSeek (def.) │
│                                     │
│  API Key     [●●●●●●●●●●●●●●]  👁  │
│                                     │
│  Model Name  [deepseek-chat      ]  │
│              Hint: cek docs provider│
│                                     │
│  [ Test Connection ]                │
│  ✓ Connection successful            │
│                                     │
│  [ Save Settings ]                  │
│                                     │
│  ⚠ Key disimpan di browser Anda.   │
│    Tidak dikirim ke server kami.    │
└─────────────────────────────────────┘
```

### Model Name Hints per Provider
- Anthropic: `claude-3-5-sonnet-20241022`
- DeepSeek: `deepseek-chat`
- OpenAI: `gpt-4o-mini`
- Groq: `llama-3.3-70b-versatile`
- Google Gemini: `gemini-1.5-flash`
- OpenRouter: `openai/gpt-4o` (format: `provider/model`)
- Mistral: `mistral-large-latest`

---

## 9. AI SDK — Implementasi BYOK

```typescript
// Node.js backend — dynamic provider dari header user
import { createOpenAI } from '@ai-sdk/openai';
import { generateText } from 'ai';

async function callAgentLLM(
  prompt: string,
  apiKey: string,
  providerUrl: string,
  modelName: string
) {
  // Semua provider yang kompatibel OpenAI-format pakai createOpenAI
  const provider = createOpenAI({
    baseURL: providerUrl,
    apiKey: apiKey,
  });

  const { text } = await generateText({
    model: provider(modelName),
    prompt: prompt,
    maxTokens: 4000,
  });

  return text;
}

// Untuk Anthropic yang native (non-OpenAI format):
import { createAnthropic } from '@ai-sdk/anthropic';
// Handle Anthropic separately jika providerUrl === 'https://api.anthropic.com'
```

**Catatan:** Hampir semua provider di list (DeepSeek, OpenAI, Groq, Mistral, Together, Fireworks, Gemini, xAI, OpenRouter, Z.AI) menggunakan OpenAI-compatible API format, sehingga `createOpenAI` dengan `baseURL` custom sudah cukup. Hanya Anthropic yang perlu `createAnthropic` terpisah.

---

## 10. User Flow (Updated)

```
1. User buka RegulationGuard
2. Jika belum ada key → redirect ke /settings
3. User pilih provider + input API key + model name
4. Klik "Test Connection" → validasi key
5. Save settings (tersimpan di localStorage)
6. User ke /upload
7. Upload dokumen PDF/DOCX
8. Pilih regulasi (GDPR / OJK / PDPA / ISO 27001 / All)
9. Klik "Start Review"
10. → Node.js backend terima file + config + key dari header
11. → Node.js buat session, instruksikan Python Band service buat room
12. → Frontend buka SSE stream (/api/review/:id/stream)
13. → Agent 1 mulai (LLM call via AI SDK dengan key user)
14. → Hasil Agent 1 dikirim ke Band room via Python service
15. → Agent 2 terima dari Band, proses, kirim balik ke Band
16. → (Agent 3 dan 4 sama)
17. → Semua Band events di-forward ke frontend via SSE
18. → Frontend tampilkan live agent feed real-time
19. → Agent 4 selesai → final report tersedia
20. → User lihat Results Dashboard
21. → Download laporan PDF/Markdown
```

---

## 11. Screen Updates

### Screen 0 — Settings Page (BARU)
- Provider dropdown dengan logo
- API key input (show/hide toggle)
- Model name input + hint
- Test connection button + status
- Privacy notice: "Key tidak disimpan di server"
- Link ke docs masing-masing provider

### Screen 2 — Upload Page (UPDATE)
- Tambah indicator: "Using [Provider Logo] [Model Name]"
- Link ke settings jika ingin ganti key
- Warning jika key belum diset

### Screen 3 — Live Review (UPDATE)
- SSE connection real (ganti simulasi Framer Motion)
- Band room messages dari Python service
- Error state jika LLM call gagal (invalid key, quota, dll)

### Screen 4 — Results (Tetap sama)
- Tidak ada perubahan signifikan

---

## 12. Judging Criteria Mapping (Updated)

| Kriteria | Implementasi |
|---|---|
| **Band Integration** | Python service mengelola Band room sesungguhnya. 4 agen berkoordinasi melalui Band dengan typed messages. Live Band feed ditampilkan di UI secara real-time via SSE. |
| **Business Value** | BYOK membuat tool ini accessible untuk semua enterprise tanpa tergantung pada API key vendor tertentu. Compliance review yang sebelumnya butuh tim legal bisa dijalankan dengan model apapun. |
| **Originality** | Satu-satunya compliance tool di hackathon yang mendukung 13 provider sekaligus. User dengan Groq credits, DeepSeek access, atau OpenRouter bisa langsung pakai tanpa setup tambahan. |
| **Presentation** | Demo: ganti provider live → upload kontrak → agent berkolaborasi via Band → laporan muncul. Story: "works with YOUR AI key, not ours." |

---

## 13. Development Timeline (Revised)

| Hari | Task |
|---|---|
| **Hari 1** | Setup monorepo (frontend + node-backend + python-band). Band SDK setup di Python. AI SDK setup di Node.js. Test hello-world BYOK. |
| **Hari 2** | Python Band service: room creation, send/receive message, SSE events. Node.js: /api/review/start + SSE stream endpoint. |
| **Hari 3** | Agent 1 (Policy Reader) + Agent 2 (Risk Analyzer) — LLM calls via AI SDK, handoff via Band. |
| **Hari 4** | Agent 3 (Legal Cross-Checker) + Agent 4 (Reporter) — pipeline penuh end-to-end. |
| **Hari 5** | Frontend: Settings page (BYOK UI) + koneksi SSE real ke backend. Ganti simulasi dengan real feed. |
| **Hari 6** | Results polish + PDF/Markdown export + error handling (invalid key, timeout, quota). |
| **Hari 7** | E2E testing dengan berbagai provider (DeepSeek, Groq, OpenAI). Bug fix. Demo video. Submit. |

---

## 14. Struktur Repository (Updated)

```
regulation-guard/
├── frontend/                    # React + Vite (sudah ada, pindah ke subfolder)
│   ├── src/
│   │   ├── pages/
│   │   │   ├── SettingsPage.tsx     # BARU — BYOK settings
│   │   │   ├── LandingPage.tsx
│   │   │   ├── UploadPage.tsx
│   │   │   ├── ReviewPage.tsx       # UPDATE — SSE real
│   │   │   └── ResultsPage.tsx
│   │   └── lib/
│   │       └── byok.ts              # BARU — localStorage key management
│   └── ...
│
├── backend-node/                # Node.js + AI SDK (BARU)
│   ├── src/
│   │   ├── index.ts             # Hono/Express app
│   │   ├── routes/
│   │   │   ├── review.ts        # /api/review/* endpoints
│   │   │   └── validate.ts      # /api/validate-key
│   │   ├── agents/
│   │   │   ├── policyReader.ts
│   │   │   ├── riskAnalyzer.ts
│   │   │   ├── legalChecker.ts
│   │   │   └── reporter.ts
│   │   └── lib/
│   │       ├── aiClient.ts      # BYOK AI SDK client factory
│   │       ├── pdfParser.ts     # pdf-parse + mammoth
│   │       └── bandClient.ts    # HTTP client ke Python Band service
│   └── package.json
│
├── backend-band/                # Python + Band SDK (BARU)
│   ├── main.py                  # FastAPI app
│   ├── routes/
│   │   ├── session.py           # /band/session/*
│   │   └── message.py           # /band/message/*
│   ├── services/
│   │   └── band_service.py      # Band SDK wrapper
│   └── requirements.txt
│
├── documentation/
│   ├── PRD_v1.md
│   └── PRD_v2.md                # Dokumen ini
│
└── docker-compose.yml           # Local dev: jalankan semua service sekaligus
```

---

## 15. Risks & Mitigations (Updated)

| Risiko | Mitigasi |
|---|---|
| Provider API format berbeda-beda | Gunakan `createOpenAI` dengan baseURL custom untuk semua OpenAI-compatible. Handle Anthropic sebagai special case. |
| Band SDK Python ↔ Node.js latency | Internal HTTP localhost — latency <1ms, tidak jadi masalah |
| User tidak tahu model name | Sediakan hint + link docs di Settings page per provider |
| Key tersimpan di localStorage bisa dibaca | Ini adalah trade-off yang accepted untuk hackathon scope. Tambahkan privacy notice yang jelas. |
| Dua backend service kompleks untuk deploy | Gunakan docker-compose untuk local. Railway support multiple services dalam satu project. |
| Band SDK belum familiar | Alokasikan seluruh Hari 1 untuk eksplorasi Band SDK docs dan test. |

---

## 16. Submission Checklist

- [ ] Public GitHub repository (MIT license)
- [ ] README: setup instructions untuk 3 service (frontend + node + python)
- [ ] Demo video (3–5 menit): ganti provider → upload kontrak → live agent feed → laporan
- [ ] Slide deck (8–10 slides)
- [ ] Deployed demo URL
- [ ] lablab.ai submission form

---

*PRD v2.0 — dokumen hidup, update sesuai perkembangan build.*