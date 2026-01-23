"""
Smart Link Hub - API Package
"""
from fastapi import APIRouter
from app.api import auth, hubs, links, rules, public, tracking, analytics

# Create main API router
api_router = APIRouter(prefix="/api")

# Include all routes
api_router.include_router(auth.router)
api_router.include_router(hubs.router)
api_router.include_router(links.router)
api_router.include_router(rules.router)
api_router.include_router(public.router)
api_router.include_router(tracking.router)
api_router.include_router(analytics.router)
