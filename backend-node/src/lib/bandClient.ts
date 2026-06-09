/**
 * HTTP client for the Python Band service.
 *
 * The Python service runs on localhost and handles Band SDK
 * room creation, message passing, and event streaming.
 *
 * This client lets the Node.js backend communicate with it
 * over internal HTTP.
 */

const BAND_SERVICE_URL = process.env.BAND_SERVICE_URL || 'http://localhost:8001';

export interface BandMessageInput {
  type: string;
  agent: string;
  content: string;
  timestamp: string;
}

export interface BandMessage {
  type: string;
  agent: string;
  content: string;
  timestamp: string;
}

/**
 * Create a new Band room for a review session.
 */
export async function createBandRoom(sessionId: string): Promise<{ roomId: string }> {
  const res = await fetch(`${BAND_SERVICE_URL}/band/session/create`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ sessionId }),
  });

  if (!res.ok) {
    throw new Error(`Band service error: ${res.status} ${await res.text()}`);
  }

  return res.json();
}

/**
 * Send a message from an agent to the Band room.
 */
export async function sendBandMessage(
  sessionId: string,
  message: BandMessageInput,
): Promise<void> {
  const res = await fetch(`${BAND_SERVICE_URL}/band/message/send`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ sessionId, message }),
  });

  if (!res.ok) {
    throw new Error(`Band service error: ${res.status} ${await res.text()}`);
  }
}

/**
 * Get the SSE stream URL for Band room events.
 * The frontend connects to this via the Node.js proxy.
 */
export function getBandEventsUrl(sessionId: string): string {
  return `${BAND_SERVICE_URL}/band/session/${sessionId}/events`;
}

/**
 * Close a Band room after review is complete.
 */
export async function closeBandRoom(sessionId: string): Promise<void> {
  await fetch(`${BAND_SERVICE_URL}/band/session/${sessionId}`, {
    method: 'DELETE',
  });
}
