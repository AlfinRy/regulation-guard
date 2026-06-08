"""
Band SDK wrapper service.

Manages Band rooms via the Thenvoi platform. Each review session
creates a chat room where 4 agents communicate via typed messages.

Band SDK (Thenvoi) API:
  - AsyncRestClient for REST operations (create chat, send messages)
  - ThenvoiLink + AgentRuntime for WebSocket live connections

Environment variables:
  BAND_API_KEY  — API key from the Thenvoi/Band platform
  BAND_BASE_URL — Platform base URL (default: https://platform.dev.thenvoi.com)
"""

from __future__ import annotations

import asyncio
import json
import os
import uuid
from dataclasses import dataclass, field
from datetime import datetime
from typing import AsyncIterator

from thenvoi.client.rest import AsyncRestClient

# ---------------------------------------------------------------------------
# Config
# ---------------------------------------------------------------------------

BAND_API_KEY = os.environ.get("BAND_API_KEY", "")
BAND_BASE_URL = os.environ.get("BAND_BASE_URL", "https://platform.dev.thenvoi.com")

# Agent IDs registered on the Band platform
AGENT_IDS = {
    "AGENT_01": os.environ.get("BAND_AGENT_01_ID", "policy-reader"),
    "AGENT_02": os.environ.get("BAND_AGENT_02_ID", "risk-analyzer"),
    "AGENT_03": os.environ.get("BAND_AGENT_03_ID", "legal-checker"),
    "AGENT_04": os.environ.get("BAND_AGENT_04_ID", "compliance-reporter"),
}

# ---------------------------------------------------------------------------
# Types
# ---------------------------------------------------------------------------


@dataclass
class BandMessage:
    type: str
    agent: str
    content: str
    timestamp: str


@dataclass
class BandRoom:
    session_id: str
    chat_id: str
    messages: list[BandMessage] = field(default_factory=list)
    is_active: bool = True


# ---------------------------------------------------------------------------
# In-memory store (fallback when Band platform is not configured)
# ---------------------------------------------------------------------------

_rooms: dict[str, BandRoom] = {}


def _get_client() -> AsyncRestClient:
    """Create an AsyncRestClient using the configured API key."""
    if not BAND_API_KEY:
        raise ValueError("BAND_API_KEY is not set. Cannot connect to Band platform.")
    return AsyncRestClient(api_key=BAND_API_KEY, base_url=BAND_BASE_URL)


def _is_band_configured() -> bool:
    """Check if Band platform credentials are configured."""
    return bool(BAND_API_KEY)


# ---------------------------------------------------------------------------
# Room operations
# ---------------------------------------------------------------------------


async def create_room(session_id: str) -> BandRoom:
    """
    Create a new Band chat room for a review session.
    Falls back to in-memory if Band platform is not configured.
    """
    if _is_band_configured():
        client = _get_client()
        chat = await client.agent_api_chats.create_agent_chat(
            request={
                "content": f"RegulationGuard review session: {session_id}",
                "mentions": [],
            },
        )
        chat_id = chat.id
    else:
        chat_id = f"local_{uuid.uuid4().hex[:12]}"

    room = BandRoom(
        session_id=session_id,
        chat_id=chat_id,
    )
    _rooms[session_id] = room
    return room


def get_room(session_id: str) -> BandRoom | None:
    """Get an existing room by session ID."""
    return _rooms.get(session_id)


async def close_room(session_id: str) -> bool:
    """Close and remove a Band room."""
    room = _rooms.get(session_id)
    if not room:
        return False
    room.is_active = False
    del _rooms[session_id]
    return True


# ---------------------------------------------------------------------------
# Message operations
# ---------------------------------------------------------------------------


async def send_message(session_id: str, message: BandMessage) -> BandMessage:
    """
    Send a typed message to a Band room.
    Also stores in-memory for SSE streaming.
    """
    room = _rooms.get(session_id)
    if not room:
        raise ValueError(f"No room found for session: {session_id}")
    if not room.is_active:
        raise ValueError(f"Room is closed for session: {session_id}")

    message.timestamp = message.timestamp or datetime.utcnow().isoformat()
    room.messages.append(message)

    # If Band platform is configured, also send to the platform
    if _is_band_configured():
        try:
            client = _get_client()
            # Determine which agent is sending
            agent_id = AGENT_IDS.get(message.agent, AGENT_IDS["AGENT_01"])
            await client.agent_api_events.create_agent_chat_event(
                agent_id=agent_id,
                chat_id=room.chat_id,
                request={
                    "type": "message",
                    "content": json.dumps({
                        "type": message.type,
                        "agent": message.agent,
                        "content": message.content,
                    }),
                },
            )
        except Exception as e:
            # Band platform errors are non-fatal — message is still stored locally
            print(f"[Band] Failed to send message to platform: {e}")

    return message


def get_messages(session_id: str) -> list[BandMessage]:
    """Get all messages from a Band room."""
    room = _rooms.get(session_id)
    if not room:
        raise ValueError(f"No room found for session: {session_id}")
    return list(room.messages)


# ---------------------------------------------------------------------------
# SSE streaming
# ---------------------------------------------------------------------------


async def stream_events(session_id: str) -> AsyncIterator[str]:
    """
    SSE stream: yields new messages as they arrive in the room.
    Polls every 500ms and yields any new messages since last check.
    """
    room = _rooms.get(session_id)
    if not room:
        yield f"data: {json.dumps({'error': 'Session not found'})}\n\n"
        return

    last_index = 0

    while room.is_active:
        if len(room.messages) > last_index:
            for msg in room.messages[last_index:]:
                payload = {
                    "id": f"msg_{last_index}",
                    "type": msg.type,
                    "agent": msg.agent,
                    "content": msg.content,
                    "timestamp": msg.timestamp,
                }
                yield f"data: {json.dumps(payload)}\n\n"
            last_index = len(room.messages)

        await asyncio.sleep(0.5)

    # Yield final message
    yield f"data: {json.dumps({'type': 'closed', 'agent': 'SYSTEM', 'content': 'Room closed.'})}\n\n"
