# RegulationGuard — Project Status & Documentation

> Multi-Agent Compliance & Regulatory Review System
> Band of Agents Hackathon · lablab.ai · Track 3 — Regulated & High-Stakes Workflows

---

## Daftar Isi

1. [Tentang Project](#tentang-project)
2. [Tech Stack](#tech-stack)
3. [Struktur Repository](#struktur-repository)
4. [Status Build vs PRD](#status-build-vs-prd)
5. [Screen yang Sudah Dibuat](#screen-yang-sudah-dibuat)
6. [Fitur yang Sudah Diimplementasi](#fitur-yang-sudah-diimplementasi)
7. [Yang Belum Dibuat (TODO)](#yang-belum-dibuat-todo)
8. [Setup & Run](#setup--run)

---

## Tentang Project

**RegulationGuard** adalah sistem multi-agen yang secara otomatis mereview dokumen kontrak, kebijakan internal, atau regulasi perusahaan terhadap standar hukum/kepatuhan yang berlaku (GDPR, OJK, PDPA, ISO 27001).

Sistem menggabungkan 4 agen spesialis yang berkolaborasi melalui Band SDK:

```
[User Upload Doc]
      ↓
[Agent 1: Policy Reader]       ← Membaca & ekstrak klausul dokumen
      ↓ handoff via Band
[Agent 2: Risk Analyzer]       ← Identifikasi klausul berisiko tinggi
      ↓ handoff via Band
[Agent 3: Legal Cross-Checker] ← Cocokkan dengan regulasi terkini
      ↓ handoff via Band
[Agent 4: Compliance Reporter] ← Susun laporan audit terstruktur
      ↓
[Output: Compliance Report PDF/JSON]
```

**Tagline:** *"From contract to compliance report in minutes, not weeks."*

---

## Tech Stack

### Frontend (Sudah Dibuat)

| Komponen | Teknologi | Status |
|---|---|---|
| Framework | React 18 + TypeScript + Vite | ✅ Aktif |
| Routing | React Router DOM | ✅ Aktif |
| Styling | Tailwind CSS 3.4 | ✅ Aktif |
| Animasi | Framer Motion | ✅ Aktif |
| Icons | Lucide React | ✅ Aktif |
| UI Theme | Dark grid-border (refine.dev inspired) | ✅ Aktif |

### Backend (Belum Dibuat)

| Komponen | Teknologi | Status |
|---|---|---|
| Agent Orchestration | Band SDK (Python) | ❌ Belum |
| LLM Provider | AI/ML API (Claude Sonnet) | ❌ Belum |
| Open-source Models | Featherless AI | ❌ Belum |
| Web Search | AI/ML API web search tool | ❌ Belum |
| PDF Parsing | PyMuPDF (fitz) | ❌ Belum |
| API Framework | FastAPI (Python) | ❌ Belum |

### Infrastructure (Belum Dibuat)

| Komponen | Teknologi | Status |
|---|---|---|
| Frontend Hosting | Vercel | ❌ Belum |
| Backend Hosting | Railway / Render | ❌ Belum |
| Storage | Supabase Storage | ❌ Belum |
| Database | Supabase Postgres | ❌ Belum |

---

## Struktur Repository

```
regulation-guard/
├── documentation/
│   └── PRD.md                          # Product Requirements Document
├── src/
│   ├── App.tsx                         # Root component + React Router setup
│   ├── main.tsx                        # Entry point
│   ├── index.css                       # Global styles, Tailwind layers, design tokens
│   ├── types.ts                        # TypeScript interfaces
│   ├── vite-env.d.ts                   # Vite type declarations
│   │
│   ├── pages/
│   │   ├── LandingPage.tsx             # Screen 1: Landing page (hero, pipeline, risk, coverage, audit, CTA)
│   │   ├── UploadPage.tsx              # Screen 2: Upload & Configure
│   │   ├── ReviewPage.tsx              # Screen 3: Live Review Dashboard
│   │   └── ResultsPage.tsx             # Screen 4: Results Dashboard
│   │
│   └── components/
│       ├── sections/
│       │   ├── index.ts                # Barrel export
│       │   ├── Navbar.tsx              # Fixed top nav (react-router aware)
│       │   ├── HeroSection.tsx         # Hero with terminal visualization
│       │   ├── PipelineSection.tsx     # 4-agent pipeline explanation
│       │   ├── RiskTableSection.tsx    # Sample risk matrix table
│       │   ├── CoverageSection.tsx     # Regulation coverage grid
│       │   ├── LedgerSection.tsx       # Audit trail timeline
│       │   ├── CTASection.tsx          # Call to action with terminal
│       │   └── Footer.tsx              # Site footer
│       │
│       └── ui/
│           ├── index.ts                # Barrel export
│           ├── AgentStatus.tsx         # Agent card with status badge
│           ├── RiskEntry.tsx           # Risk table row component
│           ├── TimelineEntry.tsx       # Audit timeline entry
│           ├── SectionDivider.tsx      # Section separator with crosshairs
│           └── PlusCrosshair.tsx       # SVG plus icon for dividers
│
├── PRODUCT.md                          # Design system & brand documentation
├── package.json                        # Dependencies & scripts
├── tailwind.config.js                  # Tailwind theme (colors, fonts, sizes)
├── postcss.config.js                   # PostCSS config
├── vite.config.ts                      # Vite build config
├── tsconfig.json                       # TypeScript root config
├── tsconfig.app.json                   # TypeScript app config
├── tsconfig.node.json                  # TypeScript node config
├── eslint.config.js                    # ESLint config
├── index.html                          # HTML entry point
└── .gitignore                          # Git ignore rules
```

---

## Status Build vs PRD

### PRD Section 5 — Key Features

| # | Feature | Status | Keterangan |
|---|---|---|---|
| 1 | Upload dokumen (PDF/DOCX) melalui web interface | ✅ Frontend | Drag-and-drop + file browser. Belum ada backend parsing. |
| 2 | Visualisasi real-time agent collaboration via Band | ✅ Frontend (simulated) | Band Agent Feed dengan 16 pesan simulasi. Belum terhubung ke backend Band SDK. |
| 3 | Risk matrix dashboard (heat map per klausul) | ✅ Frontend | Tabel klausul × severity di Results Dashboard. |
| 4 | Laporan compliance final yang bisa didownload (PDF/Markdown) | ✅ UI saja | Tombol Export PDF & Markdown ada. Fungsi download belum diimplementasi. |
| 5 | Full audit trail | ✅ Frontend (landing) | LedgerSection di landing page + audit trail di Results Page footer. |
| 6 | Band Transparency Panel | ✅ Frontend (simulated) | Live feed panel di Review Dashboard. Belum WebSocket sungguhan. |
| 7 | Regulation Selector | ✅ Frontend | Checkbox selector dengan 4 regulasi aktif + 4 "coming soon". |
| 8 | Confidence Score | ✅ Frontend | Setiap finding di Results Page memiliki confidence %. |
| 9 | Human Escalation Flag | ✅ Frontend | Ikon alert + label "FLAGGED FOR HUMAN REVIEW" per clause. |

### PRD Section 4 — Agent Architecture

| Agent | Role | Backend | Frontend |
|---|---|---|---|
| Agent 1 — Policy Reader | Document ingestion & clause extraction | ❌ Belum | ✅ Simulated di Review Page |
| Agent 2 — Risk Analyzer | Risk scoring per clause | ❌ Belum | ✅ Simulated di Review Page |
| Agent 3 — Legal Cross-Checker | Cross-reference regulasi | ❌ Belum | ✅ Simulated di Review Page |
| Agent 4 — Compliance Reporter | Susun laporan audit | ❌ Belum | ✅ Simulated di Review Page |

### PRD Section 6 — Tech Stack

| Komponen | Direncanakan | Aktual | Status |
|---|---|---|---|
| Frontend Framework | Next.js 14 | React 18 + Vite | ⚠️ Berbeda (Vite lebih ringan, sudah berjalan) |
| Styling | Tailwind CSS | Tailwind CSS 3.4 | ✅ Sama |
| UI Theme | Dark grid-border | Dark grid-border | ✅ Sama |
| Real-time | WebSocket / SSE | Simulated (framer-motion) | ⚠️ Simulasi, belum koneksi backend |
| File Upload | React Dropzone | Native drag-and-drop | ✅ Fungsi sama |
| Routing | - | React Router DOM | ✅ Tambahan |
| Animasi | - | Framer Motion | ✅ Tambahan |

### PRD Section 8 — UI/UX Screens

| Screen | Status | Detail |
|---|---|---|
| Screen 1 — Landing Page | ✅ Selesai | Hero, Pipeline, Risk Table, Coverage, Ledger, CTA, Footer |
| Screen 2 — Upload & Configure | ✅ Selesai | Drag-drop upload, regulation selector, document label, start button |
| Screen 3 — Live Review Dashboard | ✅ Selesai | Band Agent Feed, agent progress bars, clause list real-time |
| Screen 4 — Results Dashboard | ✅ Selesai | Executive Summary, Risk Matrix, Clause Analysis, References |

---

## Screen yang Sudah Dibuat

### Screen 1 — Landing Page (`/`)

Landing page statis yang menjelaskan produk. Terdiri dari:

- **Navbar** — Fixed top navigation dengan link ke pipeline, risk data, coverage, dan tombol "Start Review" ke `/upload`
- **HeroSection** — Tagline utama + terminal visualization yang menunjukkan contoh output
- **PipelineSection** — Penjelasan 4-agent pipeline dengan agent cards dan handoff chain
- **RiskTableSection** — Sample risk matrix table (4 requirements, exposure meter, stats)
- **CoverageSection** — Grid 8 regulasi yang didukung (GDPR, EU AI Act, OJK, BI PBI, PDPA, ISO 27001, SOC2, APPI)
- **LedgerSection** — Audit trail timeline (4 entries) dengan terminal verify block
- **CTASection** — Call to action dengan terminal tabs (guard / demo) dan tombol "Start Free Review"
- **Footer** — Link navigasi + branding

### Screen 2 — Upload & Configure (`/upload`)

Halaman upload dokumen dan konfigurasi regulasi:

- **Step indicator** — Visualisasi progress langkah (01 → 02 → 03)
- **Drop zone** — Drag-and-drop area untuk file PDF/DOCX, dengan state visual (empty, dragging, uploaded)
- **Document label** — Input field untuk nama dokumen
- **Regulation selector** — Checkbox list 8 regulasi:
  - Aktif: GDPR, OJK POJK, PDPA, ISO 27001
  - Coming Soon: EU AI Act, SOC 2, APPI, BI PBI
- **Selected count** — Counter + badge summary regulasi yang dipilih
- **Action bar** — Status ringkasan + tombol "Start Review" (aktif hanya jika file + regulation terpilih)
- **Navigasi** — Setelah klik "Start Review", pindah ke `/review`

### Screen 3 — Live Review Dashboard (`/review`)

Dashboard simulasi real-time proses review oleh 4 agen:

- **Header** — Step indicator (langkah 2 aktif), nama file, jumlah regulasi, progress keseluruhan %
- **Agent progress bars** — 4 bar horizontal, satu per agent, dengan status (queued/running/complete) dan animasi progress
- **Band Agent Feed** — Panel utama (3/5 lebar grid) menampilkan 16 pesan simulasi secara bertahap:
  - Setiap pesan memiliki: agent ID, timestamp, message type, konten
  - Handoff messages ditandai dengan border amber di kiri
  - Final report messages ditandai dengan border emerald di kiri
  - Warna agent: AGENT_01 (blue), AGENT_02 (cyan), AGENT_03 (orange), AGENT_04 (emerald)
  - Auto-scroll ke bawah setiap ada pesan baru
  - Pesan muncul satu per satu setiap 800ms
- **Clause List** — Panel kanan (2/5 lebar grid) menampilkan 8 klausul yang muncul bertahap:
  - Setiap klausul memiliki: ID (CL_001, dst), severity badge (HIGH/MEDIUM/LOW), category, teks
- **Completion state** — Setelah semua agent selesai:
  - Pesan hijau "Pipeline complete" muncul di feed
  - Tombol "View Results" muncul di header, mengarah ke `/results`

### Screen 4 — Results Dashboard (`/results`)

Laporan compliance final yang terstruktur:

- **Header** — Step indicator (langkah 3 selesai), nama file, regulasi yang dicek, tanggal generate
- **Export buttons** — Tombol "Export PDF" dan "Markdown"
- **Executive Summary** — Grid 4 kartu:
  - Overall Risk: HIGH
  - Critical: 3 violations
  - Medium: 1 warning
  - Passing: 4 clauses
- **Recommendation block** — Alert merah: "Do not sign without amendments to CL_002, CL_003, CL_006"
- **Human Escalation Flag** — Alert amber: 3 clauses memerlukan review oleh legal counsel
- **Risk Heat Map** — Tabel lengkap 8 clauses × 7 kolom:
  - CLAUSE, CATEGORY, SEVERITY, REGULATION, STATUS, CONFIDENCE, ESCALATE
  - Warna severity: CRITICAL (merah), MEDIUM (amber), LOW (emerald)
  - Ikon escalation: warning triangle atau checkmark
- **Detailed Clause Analysis** — Expandable accordion:
  - Filter tabs: ALL / CRITICAL / MEDIUM / LOW
  - Setiap entry bisa di-expand untuk melihat: clause text, citation, confidence score, reasoning
  - Flag "FLAGGED FOR HUMAN REVIEW" pada clause yang memerlukan eskalasi
- **Regulatory References** — Grid kartu per regulasi dengan daftar article citations
- **Footer** — Audit trail TXID, agent completion status, versi

---

## Fitur yang Sudah Diimplementasi

### Frontend (React + TypeScript + Vite)

- [x] **Routing** — 4 route: `/`, `/upload`, `/review`, `/results` via React Router DOM
- [x] **Landing Page** — 7 sections lengkap dengan dark terminal-native theme
- [x] **File Upload** — Drag-and-drop + click-to-browse untuk PDF/DOCX
- [x] **Regulation Selector** — 8 regulasi, 4 aktif dengan toggle checkbox
- [x] **Agent Pipeline Simulation** — Simulasi 4 agen yang bekerja berurutan
- [x] **Band Transparency Panel** — Live feed 16 pesan antar-agen dengan typed messages
- [x] **Agent Progress Tracking** — Progress bar per agen dengan status visual
- [x] **Clause Extraction Visualization** — 8 klausul muncul real-time saat agent bekerja
- [x] **Executive Summary** — Overall risk, violation counts, recommendation
- [x] **Risk Heat Map** — Tabel klausul × severity dengan confidence scores
- [x] **Detailed Clause Analysis** — Expandable accordion dengan filter
- [x] **Confidence Score** — Persentase per finding (82% - 99%)
- [x] **Human Escalation Flag** — Visual flag pada clauses yang butuh review manusia
- [x] **Regulatory Citations** — Referensi GDPR Art. 5(1)(e), Art. 28(2), Art. 33, OJK POJK
- [x] **Export UI** — Tombol PDF dan Markdown (belum fungsional)
- [x] **Design System** — Tailwind theme dengan tokens: colors, fonts, sizes
- [x] **Motion** — Framer Motion untuk feed entries, clause reveals, progress bars
- [x] **Responsive** — Mobile-friendly grid layouts
- [x] **Accessibility** — WCAG AA contrast, semantic HTML, reduced-motion support

---

## Yang Belum Dibuat (TODO)

### Backend (Prioritas Tinggi)

- [ ] **Band SDK Integration** — Setup Band SDK Python, buat room, definisikan 4 agent
- [ ] **Agent 1 — Policy Reader** — PDF parsing dengan PyMuPDF, clause extraction via Claude API
- [ ] **Agent 2 — Risk Analyzer** — Risk scoring per clause, severity classification
- [ ] **Agent 3 — Legal Cross-Checker** — Web search via AI/ML API, cross-reference regulasi
- [ ] **Agent 4 — Compliance Reporter** — Synthesize laporan dari output Agent 1-3
- [ ] **FastAPI Backend** — REST API endpoints untuk upload, start review, get results
- [ ] **WebSocket/SSE** — Real-time feed dari Band room ke frontend
- [ ] **PDF Parsing** — Integrasi PyMuPDF untuk dokumen upload
- [ ] **LLM Provider Setup** — Koneksi AI/ML API (Claude Sonnet) dan Featherless AI

### Frontend (Perlu Koneksi ke Backend)

- [ ] **Real WebSocket connection** — Ganti simulated feed dengan koneksi ke Band room via backend
- [ ] **File upload ke backend** — Kirim file ke FastAPI / Supabase Storage
- [ ] **PDF Export** — Generate dan download compliance report sebagai PDF
- [ ] **Markdown Export** — Generate dan download compliance report sebagai Markdown
- [ ] **Error handling** — State untuk agent error, upload gagal, timeout

### Infrastructure

- [ ] **Supabase Storage** — Setup bucket untuk document upload
- [ ] **Supabase Postgres** — Schema untuk audit logs
- [ ] **Vercel Deployment** — Deploy frontend
- [ ] **Railway/Render Deployment** — Deploy backend
- [ ] **Environment variables** — API keys, database URL

### PRD Section 13 — Submission Checklist

- [ ] Public GitHub repository (MIT license)
- [ ] README dengan setup instructions
- [ ] Demo video (3-5 menit) menampilkan live agent collaboration
- [ ] Slide deck (8-10 slides)
- [ ] Deployed demo URL (Vercel + Railway)
- [ ] lablab.ai project submission form

---

## Setup & Run

### Prerequisites

- Node.js 18+
- npm

### Install Dependencies

```bash
npm install
```

### Development

```bash
npm run dev
```

Buka browser ke `http://localhost:5173` (atau port yang ditampilkan).

### Build Production

```bash
npm run build
```

### Preview Production Build

```bash
npm run preview
```

### Type Check

```bash
npm run typecheck
```

### Lint

```bash
npm run lint
```

---

## Dependency List

| Package | Versi | Kegunaan |
|---|---|---|
| react | ^18.3.1 | UI framework |
| react-dom | ^18.3.1 | React DOM renderer |
| react-router-dom | latest | Client-side routing |
| framer-motion | latest | Animasi & motion |
| lucide-react | ^0.344.0 | Icon library |
| @supabase/supabase-js | ^2.57.4 | Supabase client (belum digunakan) |
| tailwindcss | ^3.4.1 | Utility-first CSS |
| typescript | ^5.5.3 | Type safety |
| vite | ^5.4.2 | Build tool |

---

*Dokumen ini terakhir diperbarui pada June 2026. Sesuaikan seiring perkembangan build.*
