"""
Session routes — Band room lifecycle.

POST   /band/session/create       — Create a new Band room
GET    /band/session/{id}/events   — SSE stream of room events
DELETE /band/session/{id}          — Close and remove a room
"""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from sse_starlette.sse import EventSourceResponse
from services.band_service import create_room, get_room, close_room, stream_events

router = APIRouter()


class CreateSessionRequest(BaseModel):
    sessionId: str


class SessionResponse(BaseModel):
    roomId: str
    sessionId: str


@router.post("/create", response_model=SessionResponse)
async def create_session(req: CreateSessionRequest):
    """Create a new Band room for a review session."""
    room = await create_room(req.sessionId)
    return SessionResponse(roomId=room.chat_id, sessionId=room.session_id)


@router.get("/{session_id}/events")
async def session_events(session_id: str):
    """SSE stream: real-time Band room events for the Node.js backend."""

    async def event_generator():
        async for event in stream_events(session_id):
            yield event

    return EventSourceResponse(event_generator())


@router.delete("/{session_id}")
async def delete_session(session_id: str):
    """Close and remove a Band room."""
    success = await close_room(session_id)
    if not success:
        raise HTTPException(status_code=404, detail="Session not found")
    return {"status": "closed", "sessionId": session_id}
