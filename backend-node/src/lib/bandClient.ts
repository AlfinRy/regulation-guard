/**
 * Band client + in-memory Band service.
 *
 * On Cloudflare Workers, the Python Band service is not available.
 * Instead, we run an in-memory Band service directly within this Worker.
 *
 * The in-memory implementation handles room creation, message passing,
 * and event storage — all within the Worker process.
 *
 * If BAND_API_KEY is set and a Python Band service URL is available,
 * it falls back to HTTP calls to that service.
 */

// ─── Types ──────────────────────────────────────────────

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

interface BandRoom {
  sessionId: string;
  messages: BandMessage[];
  createdAt: string;
}

// ─── In-Memory Band Service ─────────────────────────────

const rooms = new Map<string, BandRoom>();

/**
 * Create a new Band room for a review session.
 */
export async function createBandRoom(sessionId: string): Promise<{ roomId: string }> {
  // Try external Band service first
  const externalUrl = process.env.BAND_SERVICE_URL;
  if (externalUrl) {
    try {
      const res = await fetch(`${externalUrl}/band/session/create`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId }),
      });
      if (res.ok) return res.json();
    } catch {
      // Fall through to in-memory
    }
  }

  // In-memory fallback
  rooms.set(sessionId, {
    sessionId,
    messages: [],
    createdAt: new Date().toISOString(),
  });

  return { roomId: sessionId };
}

/**
 * Send a message from an agent to the Band room.
 */
export async function sendBandMessage(
  sessionId: string,
  message: BandMessageInput,
): Promise<void> {
  // Try external Band service first
  const externalUrl = process.env.BAND_SERVICE_URL;
  if (externalUrl) {
    try {
      const res = await fetch(`${externalUrl}/band/message/send`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId, message }),
      });
      if (res.ok) return;
    } catch {
      // Fall through to in-memory
    }
  }

  // In-memory fallback
  const room = rooms.get(sessionId);
  if (room) {
    room.messages.push({ ...message });
  }
}

/**
 * Get all messages from a Band room.
 */
export function getBandMessages(sessionId: string): BandMessage[] {
  const room = rooms.get(sessionId);
  return room?.messages ?? [];
}

/**
 * Close a Band room after review is complete.
 */
export async function closeBandRoom(sessionId: string): Promise<void> {
  // Try external Band service first
  const externalUrl = process.env.BAND_SERVICE_URL;
  if (externalUrl) {
    try {
      await fetch(`${externalUrl}/band/session/${sessionId}`, { method: 'DELETE' });
    } catch {
      // Fall through
    }
  }

  // In-memory cleanup
  rooms.delete(sessionId);
}
