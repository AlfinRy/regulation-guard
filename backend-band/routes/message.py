"""
Message routes — agent message passing.

POST /band/message/send — Send a typed message from an agent to the Band room
GET  /band/message/{session_id} — Get all messages from a Band room
"""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from services.band_service import send_message, get_room, get_messages

router = APIRouter()


class SendMessageRequest(BaseModel):
    sessionId: str
    type: str
    agent: str
    content: str
    timestamp: str = ""


class MessageResponse(BaseModel):
    status: str
    agent: str
    type: str


@router.post("/send", response_model=MessageResponse)
async def send_message_to_room(req: SendMessageRequest):
    """Send a typed message from an agent to the Band room."""
    from services.band_service import BandMessage

    room = get_room(req.sessionId)
    if not room:
        raise HTTPException(status_code=404, detail="Session not found")

    msg = BandMessage(
        type=req.type,
        agent=req.agent,
        content=req.content,
        timestamp=req.timestamp,
    )

    await send_message(req.sessionId, msg)

    return MessageResponse(
        status="sent",
        agent=req.agent,
        type=req.type,
    )


@router.get("/{session_id}")
async def get_room_messages(session_id: str):
    """Get all messages from a Band room."""
    room = get_room(session_id)
    if not room:
        raise HTTPException(status_code=404, detail="Session not found")

    messages = get_messages(session_id)
    return {
        "sessionId": session_id,
        "roomId": room.chat_id,
        "messageCount": len(messages),
        "messages": [
            {
                "type": m.type,
                "agent": m.agent,
                "content": m.content,
                "timestamp": m.timestamp,
            }
            for m in messages
        ],
    }
