# RegulationGuard — Agent Improvement Tasks
> Use this file in Claude Code to guide improvements across all 4 agents.
> Each section contains the current problem, expected fix, and acceptance criteria.

---

## Context

RegulationGuard uses 4 agents that run sequentially:
1. `policyReader.ts` — extracts clauses from document
2. `riskAnalyzer.ts` — scores each clause HIGH/MEDIUM/LOW
3. `legalChecker.ts` — cross-references against regulations
4. `reporter.ts` — synthesizes final compliance report

A test run against `Perjanjian_Layanan_Teknologi_PLT-2026-0047.pdf`
(OJK POJK regulation check) revealed the following bugs and improvement areas.

**Regulation knowledge files are in `/knowledge/` — agents MUST inject relevant
sections into their prompts at runtime. See `KNOWLEDGE_INJECTION.md` for the pattern.**

---

## Agent 1 — `policyReader.ts`

### Problem 1.1 — Parser crashes on non-JSON preamble
**Current behavior:** `JSON.parse(cleaned)` throws if the model adds any text before `[`.  
**Fix:** Extract the JSON array by finding the first `[` and last `]`, same pattern as
the improved `legalChecker.ts`.

```typescript
// Replace this:
const cleaned = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
const clauses: ExtractedClause[] = JSON.parse(cleaned);

// With this:
const cleaned = text.replace(/```json\s*/gi, '').replace(/```\s*/g, '').trim();
const start = cleaned.indexOf('[');
const end = cleaned.lastIndexOf(']');
if (start === -1 || end === -1) throw new Error('Agent 1: No JSON array found in response');
const clauses: ExtractedClause[] = JSON.parse(cleaned.slice(start, end + 1));
```

### Problem 1.2 — `severity` field in ExtractedClause is misleading
**Current behavior:** Agent 1 assigns a `severity` field but this is redundant — Agent 2
is supposed to do risk scoring. Agent 1's severity is sometimes inconsistent with Agent 2's.  
**Fix:** Remove `severity` from `ExtractedClause` interface and from the system prompt.
Agent 1 should only extract and categorize — not score.

```typescript
// Change interface to:
export interface ExtractedClause {
  id: string;
  category: string;
  text: string;
  // severity REMOVED — Agent 2 handles this
}
```

Update system prompt rule #2 to remove the severity field from the example output.

### Problem 1.3 — Category list is too broad ("Other" catchall)
**Current behavior:** Many clauses fall into "Other" which makes Agent 2's risk scoring
less accurate because it lacks category context.  
**Fix:** Expand the category list in the system prompt:

```
- id: "CL_XXX" (sequential)
- category: one of:
    Payment | Liability | IP | Termination | Data | Subprocessor |
    Audit | Confidentiality | Security | Dispute | ForceMarjeure |
    CrossBorderTransfer | DataRetention | Subprocessor | Other
- text: the exact or closely paraphrased clause text
```

### Problem 1.4 — No chunk handling for large documents
**Current behavior:** Entire document text is sent in one prompt. Documents >15,000 tokens
will cause the model to truncate output or miss clauses at the end.  
**Fix:** Add a simple chunking strategy. Split document into chunks of ~3,000 words,
run extraction per chunk, then deduplicate and re-sequence CL IDs.

```typescript
// Add before generateText call:
const MAX_WORDS = 3000;
const words = documentText.split(/\s+/);
if (words.length > MAX_WORDS) {
  // chunk and merge — see KNOWLEDGE_INJECTION.md for helper pattern
}
```

**Acceptance criteria:**
- [ ] Parser does not crash on text before `[`
- [ ] `ExtractedClause` has no `severity` field
- [ ] Category "Other" count drops significantly on test document
- [ ] Documents with >3000 words are chunked correctly

---

## Agent 2 — `riskAnalyzer.ts`

### Problem 2.1 — Parser crashes on non-JSON preamble (same as Agent 1)
**Fix:** Same pattern — extract between first `[` and last `]`.

### Problem 2.2 — System prompt does not mention OJK-specific risk patterns
**Current behavior:** Generic risk prompt. Misses OJK-specific HIGH risk patterns
like cross-border data transfer, incident reporting timelines, and log retention.  
**Fix:** Inject regulation knowledge at runtime from `/knowledge/ojk.md`.
See `KNOWLEDGE_INJECTION.md`. Add a section to the system prompt:

```
## Known HIGH-risk patterns for OJK:
{INJECTED FROM /knowledge/ojk.md — section: risk_patterns}
```

### Problem 2.3 — No validation that all input clause IDs appear in output
**Current behavior:** Agent 2 sometimes silently drops clauses (especially short ones
it deems "obvious"). Downstream agents then have gaps.  
**Fix:** After parsing, cross-check that every input clause ID has a scored result.
Missing IDs get a default LOW score with a warning flag:

```typescript
const scoredIds = new Set(scored.map(c => c.id));
const missing = clauses
  .filter(c => !scoredIds.has(c.id))
  .map(c => ({
    id: c.id,
    severity: 'LOW' as const,
    reasoning: 'Clause was not scored by Agent 2. Manual review recommended.',
    riskFactors: [],
  }));
return [...scored, ...missing];
```

### Problem 2.4 — `riskFactors` field is underused
**Current behavior:** `riskFactors` is populated but never used by Agent 3.  
**Fix:** In `legalChecker.ts`, include `riskFactors` from Agent 2 in the annotated
clause context sent to Agent 3. This gives Agent 3 a head-start on which specific
articles to check.

**Acceptance criteria:**
- [ ] Parser does not crash on non-JSON preamble
- [ ] OJK-specific HIGH risk patterns correctly elevated on test document
- [ ] Every input clause ID appears in Agent 2 output
- [ ] `riskFactors` from Agent 2 is passed to Agent 3

---

## Agent 3 — `legalChecker.ts`

> Note: `legalChecker_improved.ts` exists in this repo with major fixes already applied.
> The tasks below are the remaining gaps not yet addressed.

### Problem 3.1 — ✅ FIXED — LOW clauses auto-filled as COMPLIANT
Fixed in `legalChecker_improved.ts`: all scored clauses (HIGH+MEDIUM+LOW) now go
to the model. Only unscored clauses are auto-filled.

### Problem 3.2 — ✅ FIXED — Missed findings silently become COMPLIANT
Fixed: missed findings now get WARNING + `humanReview: true`.

### Problem 3.3 — ✅ FIXED — CL_018 reasoning bug (unauthorized vs insufficient retention)
Fixed via "Critical distinctions" section in improved system prompt.

### Problem 3.4 — Regulation knowledge not injected at runtime
**Current behavior:** System prompt has hardcoded regulation snippets that may be
incomplete or outdated.  
**Fix:** Load relevant sections from `/knowledge/*.md` files at runtime and inject
into the system prompt before the `generateText` call. See `KNOWLEDGE_INJECTION.md`.

```typescript
// In legalChecker.ts, before generateText:
const knowledgeContext = await loadRegulationKnowledge(regulations);
const systemWithKnowledge = SYSTEM_PROMPT + '\n\n## Regulation Reference\n' + knowledgeContext;
```

### Problem 3.5 — Single LLM call for large clause sets may truncate
**Current behavior:** All clauses sent in one call. If >15 clauses, model may truncate
output or skip the last few findings.  
**Fix:** Batch clauses into groups of 8 and run parallel `generateText` calls,
then merge results:

```typescript
const BATCH_SIZE = 8;
const batches = chunkArray(clausesToCheck, BATCH_SIZE);
const results = await Promise.all(
  batches.map(batch => callLegalCheckerBatch(model, batch, regulations, systemWithKnowledge))
);
return results.flat();
```

### Problem 3.6 — No retry on JSON parse failure
**Current behavior:** Parse failure throws immediately.  
**Fix:** Add one retry with a simplified prompt asking the model to fix its JSON output.

```typescript
} catch (e) {
  console.warn('[Agent 3] Parse failed, retrying with repair prompt...');
  const { text: retryText } = await generateText({
    model,
    system: 'You are a JSON repair assistant. Return ONLY valid JSON, no markdown.',
    prompt: `Fix this invalid JSON array and return ONLY the corrected array:\n\n${text.slice(0, 4000)}`,
    maxTokens: 4000,
  });
  return parseFindings(retryText); // throws if still invalid
}
```

**Acceptance criteria:**
- [ ] Regulation knowledge injected from `/knowledge/` files
- [ ] Batching works correctly for >8 clauses
- [ ] One retry attempt on parse failure
- [ ] All fixes from `legalChecker_improved.ts` are merged into `legalChecker.ts`

---

## Agent 4 — `reporter.ts`

### Problem 4.1 — System prompt asks for "concise" reasoning (conflicts with quality)
**Current behavior:** Prompt says "Be concise with reasoning text — keep each one to
1-2 sentences." This causes Agent 4 to shorten or re-summarize the detailed reasoning
from Agent 3, losing information.  
**Fix:** Change instruction to preserve Agent 3's reasoning verbatim:

```
// Remove: "Be concise with reasoning text — keep each one to 1-2 sentences."
// Replace with:
"For each finding, use the reasoning from the legal cross-check findings verbatim.
Do not summarize or shorten it. Only the executive summary should be your own words."
```

### Problem 4.2 — `severity` field in `ReportFinding` uses different values than Agent 2
**Current behavior:** `reporter.ts` defines `severity: 'CRITICAL' | 'MEDIUM' | 'LOW'`
but Agent 2 outputs `severity: 'HIGH' | 'MEDIUM' | 'LOW'`. Agent 4 maps HIGH → CRITICAL
internally but this is never documented and causes confusion.  
**Fix:** Standardize to use `HIGH` throughout the codebase. Update `ReportFinding`:

```typescript
export interface ReportFinding {
  // ...
  severity: 'HIGH' | 'MEDIUM' | 'LOW'; // was 'CRITICAL'
  // ...
}
```

Update the system prompt example to use `HIGH` instead of `CRITICAL`.

### Problem 4.3 — `tryRepairJSON` repair logic is fragile
**Current behavior:** The repair loop iterates from `json.length` down to `10` which
is O(n) and very slow for large outputs. The bracket counting logic is also incorrect —
it treats `]` and `}` equally when they close different structures.  
**Fix:** Replace with a cleaner strategy — truncate at last complete finding object:

```typescript
function tryRepairJSON(raw: string): ComplianceReport | null {
  const json = raw.replace(/```json\s*/gi, '').replace(/```\s*/g, '').trim();
  try { return JSON.parse(json); } catch { /* continue */ }

  // Find the last complete '}' that ends a findings entry
  // Strategy: find last occurrence of '},\n  {' or '}\n  ]' pattern
  const lastCompleteEntry = Math.max(
    json.lastIndexOf('},\n  {'),
    json.lastIndexOf('},\n{'),
    json.lastIndexOf('}\n  ]'),
  );

  if (lastCompleteEntry === -1) return null;

  const truncated = json.slice(0, lastCompleteEntry + 1) + '\n  ]\n}';
  try {
    const parsed = JSON.parse(truncated);
    if (parsed?.overallRisk && Array.isArray(parsed?.findings)) {
      parsed.criticalCount = parsed.findings.filter((f: ReportFinding) => f.status === 'VIOLATION').length;
      parsed.warningCount  = parsed.findings.filter((f: ReportFinding) => f.status === 'WARNING').length;
      parsed.passingCount  = parsed.findings.filter((f: ReportFinding) => f.status === 'COMPLIANT').length;
      console.log(`[Agent 4] Repaired: ${parsed.findings.length} findings recovered`);
      return parsed;
    }
  } catch { /* fall through */ }

  return null;
}
```

### Problem 4.4 — Report does not include Band session metadata
**Current behavior:** The final report object has no reference to the Band session ID,
timestamp, or which provider/model was used. This makes audit trail incomplete.  
**Fix:** Add metadata to `ComplianceReport`:

```typescript
export interface ComplianceReport {
  // existing fields...
  metadata: {
    sessionId: string;
    documentName: string;
    regulations: string[];
    provider: string;
    model: string;
    generatedAt: string; // ISO 8601
  };
}
```

Pass these values into `runReporter()` and include them in the prompt context so Agent 4
can include them in the JSON output.

### Problem 4.5 — No Markdown export function
**Current behavior:** Report is returned as JSON. The route handler converts it to
Markdown, but there is no shared utility for this.  
**Fix:** Add `reportToMarkdown(report: ComplianceReport): string` in `reporter.ts`
so both the API route and any future export function use the same renderer.

**Acceptance criteria:**
- [ ] Agent 4 preserves Agent 3 reasoning verbatim
- [ ] `severity` field uses `HIGH` (not `CRITICAL`) throughout
- [ ] `tryRepairJSON` no longer uses the O(n) loop
- [ ] `ComplianceReport` includes `metadata` field
- [ ] `reportToMarkdown()` utility function exported from `reporter.ts`

---

## Cross-Cutting Issues

### X-1 — No shared JSON parse utility
**Problem:** Each agent reimplements the same `cleaned.replace(...)` + `JSON.parse`
pattern with slightly different behavior.  
**Fix:** Create `src/lib/parseJSON.ts`:

```typescript
// src/lib/parseJSON.ts
export function parseJSONArray<T>(raw: string, agentName: string): T[] {
  const cleaned = raw.replace(/```json\s*/gi, '').replace(/```\s*/g, '').trim();
  const start = cleaned.indexOf('[');
  const end = cleaned.lastIndexOf(']');
  if (start === -1 || end === -1) {
    throw new Error(`${agentName}: No JSON array in response. Preview: ${cleaned.slice(0, 200)}`);
  }
  const parsed = JSON.parse(cleaned.slice(start, end + 1));
  if (!Array.isArray(parsed)) throw new Error(`${agentName}: Parsed value is not an array`);
  return parsed as T[];
}

export function parseJSONObject<T>(raw: string, agentName: string): T {
  const cleaned = raw.replace(/```json\s*/gi, '').replace(/```\s*/g, '').trim();
  const start = cleaned.indexOf('{');
  const end = cleaned.lastIndexOf('}');
  if (start === -1 || end === -1) {
    throw new Error(`${agentName}: No JSON object in response. Preview: ${cleaned.slice(0, 200)}`);
  }
  return JSON.parse(cleaned.slice(start, end + 1)) as T;
}
```

Then replace all agent parsers with calls to this utility.

### X-2 — No token estimation before LLM calls
**Problem:** Large documents may exceed model context limits silently (model truncates
instead of erroring).  
**Fix:** Add a simple token estimator (1 token ≈ 4 chars) and log a warning if the
prompt exceeds 80% of `maxTokens`:

```typescript
// src/lib/tokenEstimate.ts
export function estimateTokens(text: string): number {
  return Math.ceil(text.length / 4);
}
```

### X-3 — AbortSignal timeout is the same for all agents (300s)
**Problem:** Agent 1 (extraction) usually finishes in 15-30s. Giving it 300s timeout
masks slow model responses.  
**Suggested timeouts:**
- Agent 1: 120s (extraction is fast)
- Agent 2: 120s (scoring is fast)
- Agent 3: 300s (cross-checking is complex, keep long)
- Agent 4: 180s (report generation is moderate)

---

## Testing

After applying all fixes, re-run the test document:
```
File: Perjanjian_Layanan_Teknologi_PLT-2026-0047.pdf
Regulation: OJK POJK
```

Expected results:
- [ ] CL_011 (Pasal 7.2 — 7-day price notice) → WARNING, not COMPLIANT
- [ ] CL_018 (Pasal 11.3 — vendor post-term retention) → reasoning about
      "no legal basis to retain" (not "retention period too short")
- [ ] CL_004 (Pasal 4.1e — 1-year log retention) → reasoning about
      "controller must retain minimum 5 years" (different from CL_018)
- [ ] All 16 planted issues detected
- [ ] No silent missing findings (all clause IDs accounted for)
