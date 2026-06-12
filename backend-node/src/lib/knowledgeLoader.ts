/**
 * Knowledge loader — lightweight RAG without vector DB.
 *
 * Reads structured Markdown files from /knowledge/ and extracts
 * named sections using HTML-comment tags:
 *   <!-- section: risk_patterns -->...<!-- /section -->
 *
 * Agents inject the loaded text into their system prompts at runtime.
 */

import fs from 'fs/promises';
import path from 'path';

const KNOWLEDGE_DIR = path.join(process.cwd(), 'knowledge');

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
    // Resolve alias if the section doesn't exist directly
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
