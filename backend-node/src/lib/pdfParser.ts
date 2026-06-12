/**
 * PDF and DOCX parsing utilities.
 * Extracts plain text from uploaded documents.
 *
 * Works on both Node.js and Cloudflare Workers (with nodejs_compat).
 */

import path from 'node:path';
import pdfParse from 'pdf-parse';
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

  // Ensure we have a Buffer for pdf-parse and mammoth
  const buf = buffer instanceof ArrayBuffer ? Buffer.from(buffer) : buffer;

  if (ext === '.pdf') {
    return parsePdf(buf);
  }

  if (ext === '.docx') {
    return parseDocx(buf);
  }

  throw new Error(`Unsupported file format: ${ext}. Only PDF and DOCX are accepted.`);
}

async function parsePdf(buffer: Buffer): Promise<string> {
  const data = await pdfParse(buffer);
  return data.text;
}

async function parseDocx(buffer: Buffer): Promise<string> {
  const result = await mammoth.extractRawText({ buffer });
  return result.value;
}
