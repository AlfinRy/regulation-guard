# Product Requirements Document (PRD)
## RegulationGuard — Multi-Agent Compliance & Regulatory Review System
**Hackathon:** Band of Agents Hackathon · lablab.ai  
**Track:** Track 3 — Regulated & High-Stakes Workflows  
**Version:** 1.0  
**Date:** June 2026

---

## 1. Executive Summary

RegulationGuard adalah sistem multi-agen berbasis **Band** yang secara otomatis mereview dokumen kontrak, kebijakan internal, atau regulasi perusahaan terhadap standar hukum/kepatuhan yang berlaku. Sistem ini menggabungkan 4 agen spesialis yang berkolaborasi melalui Band untuk menghasilkan laporan compliance audit yang akurat, traceable, dan siap digunakan oleh tim legal/compliance enterprise.

**Tagline:** *"From contract to compliance report in minutes, not weeks."*

---

## 2. Problem Statement

### Pain Points
- Tim legal/compliance perusahaan menghabiskan 40–60 jam/minggu hanya untuk mereview kontrak dan dokumen regulasi secara manual
- Risiko human error tinggi saat mencocokkan ratusan klausul kontrak dengan regulasi yang terus berubah (GDPR, OJK, PDPA, ISO 27001, dll)
- Tidak ada audit trail yang jelas — siapa yang mereview apa, kapan, dan berdasarkan regulasi mana
- Eskalasi ke counsel eksternal mahal ($300–$500/jam)

### Target Users
- Tim Legal & Compliance di perusahaan menengah-besar
- BUMN, perusahaan Tbk, fintech, healthtech di Indonesia dan ASEAN
- General Counsel yang mengelola banyak kontrak vendor sekaligus

---

## 3. Solution Overview

RegulationGuard menggunakan **4 agen yang berkolaborasi melalui Band**:

```
[User Upload Doc] 
      ↓
[Agent 1: Policy Reader]     ← Membaca & ekstrak klausul dokumen
      ↓ [handoff via Band]
[Agent 2: Risk Analyzer]     ← Identifikasi klausul berisiko tinggi
      ↓ [handoff via Band]
[Agent 3: Legal Cross-Checker] ← Cocokkan dengan regulasi terkini (web search)
      ↓ [handoff via Band]
[Agent 4: Compliance Reporter] ← Susun laporan audit terstruktur
      ↓
[Output: Compliance Report PDF/JSON]
```

**Peran Band:** Setiap agen berkomunikasi, bernegosiasi konteks, dan melakukan handoff terstruktur melalui Band's shared room. Semua komunikasi antar-agen tercatat — ini menjadi fitur utama: **full traceability** dari dokumen input hingga laporan akhir.

---

## 4. Agent Architecture

### Agent 1 — Policy Reader Agent
**Role:** Document ingestion & clause extraction  
**Input:** PDF/DOCX kontrak atau dokumen kebijakan  
**Output (via Band):** Structured JSON list of clauses dengan kategori (payment, liability, IP, termination, data, etc.)  
**Tools:** PDF parser, text chunker, Claude API (extraction)  
**Band message type:** `clause_extraction_result`

### Agent 2 — Risk Analyzer Agent
**Role:** Risk scoring per clause  
**Input (dari Band):** Clause list dari Agent 1  
**Output (via Band):** Risk-scored clauses dengan severity (HIGH/MEDIUM/LOW) dan reasoning  
**Tools:** Claude API (reasoning), risk taxonomy database  
**Band message type:** `risk_analysis_result`

### Agent 3 — Legal Cross-Checker Agent
**Role:** Cross-reference dengan regulasi aktual  
**Input (dari Band):** High & medium risk clauses dari Agent 2  
**Output (via Band):** Per-clause compliance status + applicable regulation citations  
**Tools:** Web search (Featherless/AI-ML API), regulatory database (GDPR, OJK, PDPA, ISO 27001)  
**Band message type:** `legal_crosscheck_result`

### Agent 4 — Compliance Reporter Agent
**Role:** Synthesize semua hasil menjadi laporan final  
**Input (dari Band):** Semua output Agent 1–3  
**Output:** Compliance report dalam format Markdown/PDF  
**Sections laporan:** Executive Summary, Risk Matrix, Clause-by-Clause Analysis, Recommendations, Regulatory References  
**Band message type:** `final_report`

---

## 5. Key Features

### 5.1 Core Features (MVP — Wajib untuk Hackathon)
- Upload dokumen (PDF/DOCX) melalui web interface
- Visualisasi real-time agent collaboration via Band (live feed komunikasi antar agen)
- Risk matrix dashboard (heat map per klausul)
- Laporan compliance final yang bisa didownload (Markdown/PDF)
- Full audit trail: timeline lengkap setiap keputusan agen

### 5.2 Differentiator Features
- **Band Transparency Panel:** UI yang menampilkan *live* pesan antar agen di Band room — juri bisa melihat kolaborasi terjadi secara nyata
- **Regulation Selector:** Pilih regulasi target (GDPR, OJK, PDPA, ISO 27001, custom)
- **Confidence Score:** Setiap temuan diberi confidence level dengan reasoning
- **Human Escalation Flag:** Agent secara otomatis menandai klausul yang butuh review manusia

---

## 6. Tech Stack

### Backend
| Komponen | Teknologi | Alasan |
|---|---|---|
| Agent Orchestration | **Band SDK (Python)** | Required by hackathon |
| LLM Provider | **AI/ML API** (Claude Sonnet) | Partner hackathon, ada $10 credits |
| Open-source Models | **Featherless AI** | Partner hackathon, ada $25 credits |
| Web Search | AI/ML API web search tool | Untuk legal cross-checking terkini |
| PDF Parsing | PyMuPDF (fitz) | Ringan, cepat |
| API Framework | FastAPI (Python) | Simple, async-friendly |

### Frontend
| Komponen | Teknologi | Alasan |
|---|---|---|
| Framework | Next.js 14 (React) | Production-grade, SSR |
| Styling | Tailwind CSS | Cepat, customizable |
| UI Theme | Dark grid-border (refine.dev inspired) | Distinctive, enterprise feel |
| Real-time | WebSocket / SSE | Live agent feed dari Band |
| File Upload | React Dropzone | UX halus |

### Infrastructure
| Komponen | Teknologi |
|---|---|
| Hosting | Vercel (frontend) + Railway/Render (backend) |
| Storage | Supabase Storage (dokumen upload) |
| Database | Supabase Postgres (audit logs) |

---

## 7. User Flow

```
1. User buka landing page RegulationGuard
2. Upload dokumen kontrak (PDF/DOCX)
3. Pilih regulasi yang ingin dicek (GDPR / OJK / PDPA / ISO / All)
4. Klik "Start Review"
5. → Tampil live panel: Agent 1 mulai bekerja, Band room aktif
6. → Agent 1 selesai → handoff ke Agent 2 (terlihat di Band feed)
7. → Agent 2 selesai → handoff ke Agent 3
8. → Agent 3 selesai → handoff ke Agent 4
9. → Dashboard muncul: Risk matrix, clause highlights
10. User download laporan compliance (PDF/Markdown)
11. Audit trail tersimpan dan bisa dibagikan
```

---

## 8. UI/UX Screens

### Screen 1 — Landing Page
- Hero: tagline + CTA "Start Free Review"
- Section: How it works (4 agen + Band flow)
- Section: Sample output (compliance report preview)
- Section: Regulation coverage (GDPR, OJK, PDPA, ISO 27001)
- Style: Dark, grid border, corner brackets (refine.dev inspired)

### Screen 2 — Upload & Configure
- Drag-and-drop upload zone
- Regulation selector (checkbox/toggle)
- "Start Review" button

### Screen 3 — Live Review Dashboard
- Band Agent Feed (live WebSocket) — KUNCI DEMO
- Progress bar per agen (Running / Done / Error)
- Clause list yang muncul real-time

### Screen 4 — Results Dashboard
- Executive Summary card
- Risk Heat Map (tabel klausul × severity)
- Detailed clause analysis (expandable)
- Download button (PDF / Markdown)

---

## 9. Judging Criteria Mapping

| Kriteria Juri | Implementasi RegulationGuard |
|---|---|
| **Band Integration** | 4 agen berkomunikasi lewat Band rooms dengan typed messages. Band bukan hanya wrapper — setiap handoff bawa structured context. Live feed ditampilkan di UI. |
| **Business Value** | Pain point nyata: compliance review manual sangat lambat & mahal. Target market jelas (legal/compliance team). ROI terukur (hemat 40+ jam/minggu). |
| **Originality** | Track 3 jarang dieksekusi. Traceability sebagai fitur utama (bukan side effect). Angle regulasi Indonesia (OJK, PDPA) sebagai differentiator regional. |
| **Presentation** | Demo video: upload kontrak nyata → live agent collaboration → laporan muncul. Story: "lihat agen-agen ini bekerja sama seperti tim legal Anda." |

---

## 10. Development Timeline (7 Hari)

| Hari | Milestone |
|---|---|
| **Hari 1** (12 Jun) | Setup repo, Band SDK, koneksi AI/ML API & Featherless. Kickoff stream. |
| **Hari 2** | Agent 1 (Policy Reader) selesai + test dengan sample dokumen |
| **Hari 3** | Agent 2 (Risk Analyzer) + Agent 3 (Legal Cross-Checker) |
| **Hari 4** | Agent 4 (Reporter) + integrasi penuh Band room |
| **Hari 5** | Frontend: Upload UI + Live Band feed dashboard |
| **Hari 6** | Frontend: Results dashboard + PDF export + polish |
| **Hari 7** (18 Jun) | Testing end-to-end, bug fix, rekam demo video, submit |

---

## 11. Sample Output

### Compliance Report — Executive Summary (contoh)
```
Document: Vendor Service Agreement v2.1
Review Date: 2026-06-15
Regulations Checked: GDPR, OJK POJK 12/2018, ISO 27001

OVERALL RISK: HIGH (3 critical, 7 medium, 12 low)

CRITICAL FINDINGS:
1. Clause 8.3 — Data Retention: No deletion timeline specified. GDPR Art. 5(1)(e) violation risk.
2. Clause 12.1 — Liability Cap: Capped at 1x annual fee. Insufficient for data breach scenarios per OJK.
3. Clause 15.4 — Subprocessor: No prior written consent required. GDPR Art. 28(2) violation.

RECOMMENDATION: Do not sign without amendments to Clauses 8.3, 12.1, and 15.4.
```

---

## 12. Risks & Mitigations

| Risiko | Mitigasi |
|---|---|
| Band SDK learning curve | Baca docs Band hari pertama, test simple room dulu |
| Legal accuracy (hallucination) | Tambahkan disclaimer + confidence score per temuan |
| PDF parsing complex layouts | Gunakan PyMuPDF, fallback ke plain text extraction |
| Waktu terlalu singkat untuk semua fitur | Prioritaskan: agent pipeline berjalan > UI polish > extra features |

---

## 13. Submission Checklist

- [ ] Public GitHub repository (MIT license)
- [ ] README dengan setup instructions
- [ ] Demo video (3–5 menit) menampilkan live agent collaboration
- [ ] Slide deck (8–10 slides)
- [ ] Deployed demo URL (Vercel + Railway)
- [ ] lablab.ai project submission form

---

*PRD ini adalah dokumen hidup — update sesuai perkembangan build.*