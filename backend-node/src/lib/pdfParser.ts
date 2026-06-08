/**
 * PDF and DOCX parsing utilities.
 * Extracts plain text from uploaded documents.
 */

import fs from 'node:fs';
import path from 'node:path';
import pdfParse from 'pdf-parse';
import mammoth from 'mammoth';

/**
 * Parse a file buffer based on its extension.
 * Returns extracted plain text.
 */
export async function parseDocument(
  buffer: Buffer,
  filename: string,
): Promise<string> {
  const ext = path.extname(filename).toLowerCase();

  if (ext === '.pdf') {
    return parsePdf(buffer);
  }

  if (ext === '.docx') {
    return parseDocx(buffer);
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

/**
 * Read a file from disk (used for testing).
 */
export function readFileBuffer(filePath: string): Buffer {
  return fs.readFileSync(filePath);
}
