/**
 * PDF and DOCX parsing utilities.
 * Extracts plain text from uploaded documents.
 *
 * Uses pdfjs-dist (edge/Workers-compatible) instead of pdf-parse.
 * Works on both Node.js and Cloudflare Workers (with nodejs_compat).
 */

import path from 'node:path';
import { getDocument } from 'pdfjs-dist/legacy/build/pdf.mjs';
import type { TextItem } from 'pdfjs-dist/types/src/display/api';
import mammoth from 'mammoth';

/**
 * Parse a file buffer based on its extension.
 * Accepts Buffer (Node.js) or ArrayBuffer (Workers).
 * Returns extracted plain text.
 */
export async function parseDocument(
  buffer: Buffer | ArrayBuffer,
  filename: string,
): Promise<string> {
  const ext = path.extname(filename).toLowerCase();

  // Ensure we have a Uint8Array for pdfjs
  const uint8 = buffer instanceof ArrayBuffer
    ? new Uint8Array(buffer)
    : new Uint8Array(buffer.buffer, buffer.byteOffset, buffer.byteLength);

  if (ext === '.pdf') {
    return parsePdf(uint8);
  }

  if (ext === '.docx') {
    return parseDocx(Buffer.from(uint8));
  }

  throw new Error(`Unsupported file format: ${ext}. Only PDF and DOCX are accepted.`);
}

async function parsePdf(data: Uint8Array): Promise<string> {
  const doc = await getDocument({ data, useSystemFonts: true }).promise;
  const pages: string[] = [];

  for (let i = 1; i <= doc.numPages; i++) {
    const page = await doc.getPage(i);
    const content = await page.getTextContent();
    const text = content.items
      .filter((item): item is TextItem => 'str' in item)
      .map((item) => item.str)
      .join(' ');
    pages.push(text);
    page.cleanup();
  }

  doc.destroy();
  return pages.join('\n\n');
}

async function parseDocx(buffer: Buffer): Promise<string> {
  const result = await mammoth.extractRawText({ buffer });
  return result.value;
}
