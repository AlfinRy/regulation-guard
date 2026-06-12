/**
 * PDF and DOCX parsing utilities.
 * Extracts plain text from uploaded documents.
 *
 * Uses unpdf (edge/Workers-compatible, no worker needed).
 * Works on both Node.js and Cloudflare Workers.
 */

import path from 'node:path';
import { extractText } from 'unpdf';
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
  const { totalPages, text } = await extractText(data);
  console.log(`[PDF Parser] Extracted text from ${totalPages} pages`);
  return text.join('\n\n');
}

async function parseDocx(buffer: Buffer): Promise<string> {
  const result = await mammoth.extractRawText({ buffer });
  return result.value;
}
