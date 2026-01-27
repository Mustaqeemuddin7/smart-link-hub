"""
Smart Link Hub - FastAPI Application Entry Point
"""

import logging
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from sqlalchemy import text

from app.config import settings
from app.database import engine, Base, SessionLocal

# --------------------------------------------------
# Logging Configuration
# --------------------------------------------------
logging.basicConfig(
    level=logging.DEBUG if settings.DEBUG else logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s"
)
logger = logging.getLogger(__name__)


# --------------------------------------------------
# Lifespan (Startup / Shutdown)
# --------------------------------------------------
@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan handler"""
    # Startup: Try to create database tables (but don't fail if DB not ready)
    try:
        Base.metadata.create_all(bind=engine)
        logger.info("Database tables created")
    except Exception as e:
        logger.warning(f"Could not create database tables at startup: {e}")
        logger.warning("Database will be initialized by alembic migrations")
    yield
    # Shutdown
    logger.info("Application shutting down")


# --------------------------------------------------
# FastAPI App Initialization
# --------------------------------------------------
app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    description="""
## Smart Link Hub API

A smart Link-in-Bio platform with dynamic rule-based link prioritization.

### Features
- Create and manage link hubs
- Analytics and click tracking
- Smart rule engine for dynamic link display
- Device-aware link prioritization
- Location-based link filtering
- Time-based display rules
- QR Code generation
- URL shortening
- CSV/PDF analytics export

### Authentication
Use JWT Bearer token authentication. Get tokens via `/api/auth/login`.
    """,
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan
)

# --------------------------------------------------
# ✅ CORS CONFIGURATION (FIXED)
# --------------------------------------------------
# IMPORTANT:
# This fixes the 400 preflight (OPTIONS) error from Vercel frontend
# For hackathon usage, allowing all origins is acceptable.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],       # <-- FIX APPLIED HERE
    allow_credentials=True,
    allow_methods=["*"],       # Allows GET, POST, OPTIONS, etc.
    allow_headers=["*"],       # Allows Content-Type, Authorization, etc.
)

# --------------------------------------------------
# Routers
# --------------------------------------------------
from app.api import api_router, redirect_router

# API routes (prefixed with /api)
app.include_router(api_router)

# Redirect / public routes (no prefix)
app.include_router(redirect_router)


# --------------------------------------------------
# Health Check
# --------------------------------------------------
@app.get("/health", tags=["Health"])
async def health_check():
    """Health check endpoint with database ping"""
    db_status = "healthy"
    try:
        db = SessionLocal()
        db.execute(text("SELECT 1"))
        db.close()
    except Exception as e:
        db_status = f"unhealthy: {str(e)}"
        logger.error(f"Database health check failed: {e}")

    return {
        "status": "healthy" if db_status == "healthy" else "degraded",
        "app": settings.APP_NAME,
        "version": settings.APP_VERSION,
        "database": db_status
    }


# --------------------------------------------------
# Root Endpoint
# --------------------------------------------------
@app.get("/", tags=["Root"])
async def root():
    """Root endpoint with API info"""
    return {
        "message": f"Welcome to {settings.APP_NAME}",
        "version": settings.APP_VERSION,
        "docs": "/docs",
        "health": "/health"
    }


# --------------------------------------------------
# Local Development Entry Point
# --------------------------------------------------
if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "app.main:app",
        host="0.0.0.0",
        port=8000,
        reload=settings.DEBUG
    )
