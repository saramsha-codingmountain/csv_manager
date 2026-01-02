"""Main FastAPI application."""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.core.database import engine, Base
from app.api.v1 import auth, csv_files, users, websocket
from app.utils.logger import logger

# Create database tables (in production, use migrations)
if settings.debug:
    Base.metadata.create_all(bind=engine)

# Initialize FastAPI app
app = FastAPI(
    title=settings.app_name,
    version=settings.app_version,
    docs_url="/docs" if settings.debug else None,
    redoc_url="/redoc" if settings.debug else None,
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API routers
app.include_router(auth.router, prefix="/api/v1/auth", tags=["Authentication"])
app.include_router(csv_files.router, prefix="/api/v1/csv", tags=["CSV Files"])
app.include_router(users.router, prefix="/api/v1/users", tags=["Users"])
app.include_router(websocket.router, prefix="/ws", tags=["WebSocket"])


@app.get("/", tags=["Health"])
async def root():
    """Root endpoint."""
    return {
        "message": f"Welcome to {settings.app_name}",
        "version": settings.app_version,
        "docs": "/docs" if settings.debug else "disabled"
    }


@app.get("/health", tags=["Health"])
async def health_check():
    """Health check endpoint."""
    return {"status": "healthy", "service": settings.app_name}


@app.on_event("startup")
async def startup_event():
    """Application startup event."""
    logger.info(f"{settings.app_name} v{settings.app_version} starting up...")
    logger.info(f"Debug mode: {settings.debug}")


@app.on_event("shutdown")
async def shutdown_event():
    """Application shutdown event."""
    logger.info(f"{settings.app_name} shutting down...")
