"""
RegulationGuard — Python Band Service

FastAPI service that manages Band SDK rooms for agent orchestration.
Communicates with the Node.js backend via internal HTTP.
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routes.session import router as session_router
from routes.message import router as message_router

app = FastAPI(
    title="RegulationGuard Band Service",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(session_router, prefix="/band/session", tags=["session"])
app.include_router(message_router, prefix="/band/message", tags=["message"])


@app.get("/health")
async def health():
    return {"status": "ok", "service": "band"}


if __name__ == "__main__":
    import uvicorn

    port = int(__import__("os").environ.get("PORT", 8001))
    print(f"[regulation-guard] Python Band service starting on port {port}")
    uvicorn.run(app, host="0.0.0.0", port=port)
