# Knowledge Injection Pattern
> How agents load regulation knowledge from `/knowledge/*.md` files at runtime.
> This is the RAG strategy for RegulationGuard — no vector DB needed for hackathon scope.

---

## Why This Approach

Instead of a full vector database (Pinecone, pgvector, etc.), we use **structured Markdown
files** as a lightweight knowledge base. Each file covers one regulation and is divided into
clearly-labeled sections. Agents load only the sections they need before calling the LLM.

Benefits for hackathon scope:
- Zero infra overhead (no embedding pipeline, no vector store)
- Deterministic — same input always loads same knowledge
- Easy to update — edit the `.md` file, restart server
- Claude Code can read and extend these files easily

---

## File Structure

```
backend-node/
└── knowledge/
    ├── ojk.md          ← OJK POJK regulations (Indonesia)
    ├── gdpr.md         ← EU General Data Protection Regulation
    ├── pdpa.md         ← ASEAN Personal Data Protection Act
    └── iso27001.md     ← ISO/IEC 27001:2022
```

---

## Section Tags

Each knowledge file uses HTML-comment section tags so agents can load specific parts:

```markdown
<!-- section: risk_patterns -->
...content...
<!-- /section -->

<!-- section: articles -->
...content...
<!-- /section -->

<!-- section: incident_reporting -->
...content...
<!-- /section -->
```

Available sections per file:

| File | Sections |
|---|---|
| `ojk.md` | `risk_patterns`, `articles`, `incident_reporting`, `data_localization`, `retention` |
| `gdpr.md` | `risk_patterns`, `articles`, `breach_notification`, `cross_border`, `retention` |
| `pdpa.md` | `risk_patterns`, `articles`, `cross_border` |
| `iso27001.md` | `risk_patterns`, `controls`, `security_assessment` |

---

## TypeScript Loader — `src/lib/knowledgeLoader.ts`

```typescript
import fs from 'fs/promises';
import path from 'path';

const KNOWLEDGE_DIR = path.join(process.cwd(), 'knowledge');

// Map from regulation display name → file name
const REGULATION_FILE_MAP: Record<string, string> = {
  'OJK':       'ojk',
  'POJK':      'ojk',
  'OJK POJK':  'ojk',
  'GDPR':      'gdpr',
  'PDPA':      'pdpa',
  'ISO 27001': 'iso27001',
  'ISO27001':  'iso27001',
};

/**
 * Load one or more sections from a knowledge file.
 * Returns empty string if file or section not found (graceful degradation).
 */
export async function loadKnowledgeSection(
  regulation: string,
  sections: string[],
): Promise<string> {
  const fileName = REGULATION_FILE_MAP[regulation.toUpperCase().trim()]
    ?? REGULATION_FILE_MAP[regulation.trim()];

  if (!fileName) {
    console.warn(`[Knowledge] No knowledge file mapped for regulation: "${regulation}"`);
    return '';
  }

  const filePath = path.join(KNOWLEDGE_DIR, `${fileName}.md`);

  let content: string;
  try {
    content = await fs.readFile(filePath, 'utf-8');
  } catch {
    console.warn(`[Knowledge] File not found: ${filePath}`);
    return '';
  }

  const extracted: string[] = [];

  for (const section of sections) {
    const startTag = `<!-- section: ${section} -->`;
    const endTag   = `<!-- /section -->`;
    const start = content.indexOf(startTag);
    if (start === -1) {
      console.warn(`[Knowledge] Section "${section}" not found in ${fileName}.md`);
      continue;
    }
    const end = content.indexOf(endTag, start);
    if (end === -1) continue;
    extracted.push(content.slice(start + startTag.length, end).trim());
  }

  return extracted.join('\n\n');
}

/**
 * Load knowledge for multiple regulations, returns combined context string.
 * Used by Agent 2 and Agent 3 to inject into system prompts.
 */
export async function loadRegulationKnowledge(
  regulations: string[],
  sections: string[] = ['risk_patterns', 'articles'],
): Promise<string> {
  const results = await Promise.all(
    regulations.map(reg => loadKnowledgeSection(reg, sections))
  );

  const combined = results.filter(Boolean).join('\n\n---\n\n');
  return combined
    ? `## Regulation Knowledge Base\n\n${combined}`
    : '';
}
```

---

## Usage in Agents

### Agent 2 — riskAnalyzer.ts

```typescript
import { loadRegulationKnowledge } from '../lib/knowledgeLoader.js';

export async function runRiskAnalyzer(
  model: LanguageModelV1,
  clauses: ExtractedClause[],
  regulations: string[], // ← pass from route handler
): Promise<RiskScoredClause[]> {

  // Load risk_patterns section for all selected regulations
  const knowledgeContext = await loadRegulationKnowledge(regulations, ['risk_patterns']);

  const systemWithKnowledge = knowledgeContext
    ? `${SYSTEM_PROMPT}\n\n${knowledgeContext}`
    : SYSTEM_PROMPT;

  const { text } = await generateText({
    model,
    system: systemWithKnowledge,  // ← injected here
    prompt: `Analyze the risk level of these clauses:\n\n${JSON.stringify(clauses, null, 2)}`,
    maxTokens: 6000,
    abortSignal: AbortSignal.timeout(120_000),
  });
  // ...
}
```

### Agent 3 — legalChecker.ts

```typescript
import { loadRegulationKnowledge } from '../lib/knowledgeLoader.js';

export async function runLegalChecker(
  model: LanguageModelV1,
  clauses: ExtractedClause[],
  scoredClauses: RiskScoredClause[],
  regulations: string[],
): Promise<CrossCheckFinding[]> {

  // Load articles + incident_reporting + retention sections
  const knowledgeContext = await loadRegulationKnowledge(
    regulations,
    ['articles', 'incident_reporting', 'data_localization', 'retention', 'cross_border']
  );

  const systemWithKnowledge = knowledgeContext
    ? `${SYSTEM_PROMPT}\n\n${knowledgeContext}`
    : SYSTEM_PROMPT;

  // ... rest of function, use systemWithKnowledge instead of SYSTEM_PROMPT
}
```

---

## Updating Knowledge Files

To add a new regulation:
1. Create `knowledge/<name>.md` with appropriate sections
2. Add mapping to `REGULATION_FILE_MAP` in `knowledgeLoader.ts`
3. No server restart needed if using dynamic import (file is read at request time)

To update existing regulation (e.g. new OJK circular):
1. Edit the relevant section in `knowledge/ojk.md`
2. Changes take effect on next API request
