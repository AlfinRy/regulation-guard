/**
 * API client for the RegulationGuard Node.js backend.
 *
 * All requests include BYOK headers (X-API-Key, X-Provider-URL, X-Model-Name)
 * read from localStorage via the byok module.
 */

import { getAuthHeaders, hasSettings } from './byok';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface StartReviewResponse {
  sessionId: string;
  status: string;
}

export interface SSEEvent {
  id: string;
  agent: string;
  type: string;
  content: string;
  timestamp: string;
}

export interface ReportFinding {
  id: string;
  clauseText: string;
  category: string;
  severity: 'CRITICAL' | 'MEDIUM' | 'LOW';
  status: 'VIOLATION' | 'WARNING' | 'COMPLIANT';
  regulation: string;
  article: string;
  reasoning: string;
  confidence: number;
  humanReview: boolean;
}

export interface ComplianceReport {
  overallRisk: 'HIGH' | 'MEDIUM' | 'LOW';
  summary: string;
  recommendation: string;
  criticalCount: number;
  warningCount: number;
  passingCount: number;
  findings: ReportFinding[];
}

export interface ReviewResult {
  sessionId: string;
  fileName: string;
  regulations: string[];
  report: ComplianceReport;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function getHeaders(): Record<string, string> {
  return {
    ...getAuthHeaders(),
  };
}

// ---------------------------------------------------------------------------
// API calls
// ---------------------------------------------------------------------------

/**
 * Test whether the stored API key is valid for the chosen provider.
 */
export async function validateKey(): Promise<{ valid: boolean; error?: string }> {
  if (!hasSettings()) {
    return { valid: false, error: 'No API key configured.' };
  }

  try {
    const res = await fetch(`${API_BASE}/api/validate-key`, {
      method: 'POST',
      headers: getHeaders(),
    });

    const data = await res.json();
    return data;
  } catch {
    return { valid: false, error: 'Cannot reach backend. Is it running?' };
  }
}

/**
 * Upload a document and start the 4-agent review pipeline.
 */
export async function startReview(
  file: File,
  regulations: string[],
): Promise<StartReviewResponse> {
  if (!hasSettings()) {
    throw new Error('No API key configured. Go to Settings first.');
  }

  const formData = new FormData();
  formData.append('file', file);
  formData.append('regulations', regulations.join(','));

  const res = await fetch(`${API_BASE}/api/review/start`, {
    method: 'POST',
    headers: getHeaders(),
    body: formData,
  });

  if (!res.ok) {
    const data = await res.json().catch(() => ({ error: 'Upload failed.' }));
    throw new Error(data.error || `Request failed with status ${res.status}`);
  }

  return res.json();
}

/**
 * Subscribe to the SSE stream for a review session.
 * Returns an async generator that yields SSEEvent objects.
 */
export async function* streamReviewEvents(
  sessionId: string,
): AsyncGenerator<SSEEvent, void, unknown> {
  const res = await fetch(`${API_BASE}/api/review/${sessionId}/stream`, {
    headers: getHeaders(),
  });

  if (!res.ok) {
    throw new Error(`Stream failed: ${res.status}`);
  }

  const reader = res.body?.getReader();
  if (!reader) {
    throw new Error('No response body');
  }

  const decoder = new TextDecoder();
  let buffer = '';

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });

    // Parse SSE lines
    const lines = buffer.split('\n');
    buffer = lines.pop() || '';

    let currentData = '';
    for (const line of lines) {
      if (line.startsWith('data: ')) {
        currentData = line.slice(6);
      } else if (line === '' && currentData) {
        try {
          const event: SSEEvent = JSON.parse(currentData);
          yield event;
        } catch {
          // Skip malformed JSON
        }
        currentData = '';
      }
    }
  }
}

/**
 * Get the final compliance report for a completed session.
 */
export async function getReviewResult(
  sessionId: string,
): Promise<ReviewResult> {
  const res = await fetch(`${API_BASE}/api/review/${sessionId}/result`, {
    headers: getHeaders(),
  });

  if (!res.ok) {
    const data = await res.json().catch(() => ({ error: 'Failed to fetch result.' }));
    throw new Error(data.error || `Request failed with status ${res.status}`);
  }

  return res.json();
}
