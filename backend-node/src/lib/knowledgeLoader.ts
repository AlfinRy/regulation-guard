/**
 * Knowledge loader — lightweight RAG without vector DB.
 *
 * On Cloudflare Workers: reads from ASSETS binding (knowledge files).
 * On Node.js: reads from filesystem via fs.readFile.
 *
 * Agents inject the loaded text into their system prompts at runtime.
 */

import path from 'node:path';
import fs from 'node:fs/promises';

/** Map from regulation display name → knowledge file name (without .md) */
const REGULATION_FILE_MAP: Record<string, string> = {
  'OJK': 'ojk',
  'POJK': 'ojk',
  'OJK POJK': 'ojk',
  'GDPR': 'gdpr',
  'PDPA': 'pdpa',
  'ISO 27001': 'iso27001',
  'ISO27001': 'iso27001',
};

/**
 * Per-file section aliases: when a requested section doesn't exist,
 * try these fallbacks. E.g. ISO27001 uses "controls" instead of "articles".
 */
const SECTION_ALIASES: Record<string, Record<string, string>> = {
  iso27001: {
    articles: 'controls',
  },
};

/** Extract sections from markdown content using HTML comment tags. */
function extractSections(content: string, sections: string[], fileName: string): string {
  const extracted: string[] = [];

  for (const section of sections) {
    let resolvedSection = section;
    const aliases = SECTION_ALIASES[fileName];
    if (aliases && aliases[section]) {
      resolvedSection = aliases[section];
    }

    const startTag = `<!-- section: ${resolvedSection} -->`;
    const endTag = `<!-- /section -->`;
    const start = content.indexOf(startTag);
    if (start === -1) {
      console.warn(`[Knowledge] Section "${resolvedSection}" not found in ${fileName}.md`);
      continue;
    }
    const end = content.indexOf(endTag, start);
    if (end === -1) continue;
    extracted.push(content.slice(start + startTag.length, end).trim());
  }

  return extracted.join('\n\n');
}

/** Global cache for knowledge content. */
let knowledgeCache: Map<string, string> | null = null;

/**
 * Set the ASSETS binding from Hono env context.
 * Called once per request by the Worker.
 */
let assetsBinding: { fetch: (url: string) => Promise<Response> } | null = null;

export function setAssetsBinding(binding: { fetch: (url: string) => Promise<Response> } | null): void {
  assetsBinding = binding;
}

/**
 * Load knowledge file content.
 * Workers: uses ASSETS binding (set via setAssetsBinding).
 * Node.js: uses fs.readFile.
 */
async function loadFileContent(fileName: string): Promise<string | null> {
  // Workers: use ASSETS binding
  if (assetsBinding) {
    try {
      const response = await assetsBinding.fetch(`http://internal/${fileName}.md`);
      if (response.ok) {
        return await response.text();
      }
    } catch (err) {
      console.warn(`[Knowledge] ASSETS fetch failed for ${fileName}.md:`, err);
    }
  }

  // Node.js: read from filesystem
  try {
    const KNOWLEDGE_DIR = path.join(process.cwd(), 'knowledge');
    return await fs.readFile(path.join(KNOWLEDGE_DIR, `${fileName}.md`), 'utf-8');
  } catch {
    return null;
  }
}

/**
 * Load one or more sections from a knowledge file.
 * Returns empty string if file or section not found (graceful degradation).
 */
export async function loadKnowledgeSection(
  regulation: string,
  sections: string[],
): Promise<string> {
  const key = regulation.toUpperCase().trim();
  const fileName = REGULATION_FILE_MAP[key] ?? REGULATION_FILE_MAP[regulation.trim()];

  if (!fileName) {
    console.warn(`[Knowledge] No knowledge file mapped for regulation: "${regulation}"`);
    return '';
  }

  // Initialize cache if needed
  if (!knowledgeCache) {
    knowledgeCache = new Map();
  }

  // Check cache
  let content = knowledgeCache.get(fileName);

  if (!content) {
    const loaded = await loadFileContent(fileName);
    if (!loaded) {
      console.warn(`[Knowledge] File not found: ${fileName}.md`);
      return '';
    }
    content = loaded;
    knowledgeCache.set(fileName, content);
  }

  return extractSections(content, sections, fileName);
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
    regulations.map((reg) => loadKnowledgeSection(reg, sections)),
  );

  const combined = results.filter(Boolean).join('\n\n---\n\n');
  return combined ? `## Regulation Knowledge Base\n\n${combined}` : '';
}
