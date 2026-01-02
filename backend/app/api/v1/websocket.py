"""WebSocket endpoints."""
from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from app.websocket.manager import manager
from app.utils.logger import logger

router = APIRouter()


@router.websocket("/csv-updates")
async def websocket_endpoint(websocket: WebSocket) -> None:
    """WebSocket endpoint for real-time CSV updates."""
    await manager.connect(websocket)
    try:
        while True:
            # Keep connection alive and handle incoming messages
            data = await websocket.receive_text()
            logger.debug(f"Received WebSocket message: {data}")
            # Echo back for connection health check
            await websocket.send_json({"type": "pong", "message": "connected"})
    except WebSocketDisconnect:
        manager.disconnect(websocket)
        logger.info("WebSocket client disconnected")
    except Exception as e:
        logger.error(f"WebSocket error: {e}")
        manager.disconnect(websocket)

