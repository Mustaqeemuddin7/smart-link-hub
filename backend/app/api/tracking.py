"""
Smart Link Hub - Tracking API Routes
Visit and click tracking endpoints
"""
from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException, status, Request
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.hub import Hub
from app.models.link import Link
from app.services.analytics_service import AnalyticsService
from app.services.geo_service import geo_service
from app.utils.device_detector import get_device_type
from app.api.deps import get_client_ip, public_rate_limit_check

router = APIRouter(prefix="/track", tags=["Tracking"], dependencies=[Depends(public_rate_limit_check)])


@router.post("/visit/{slug}")
async def track_visit(
    slug: str,
    request: Request,
    db: Session = Depends(get_db)
):
    """
    Track a hub page visit
    
    Should be called when the public hub page loads.
    Includes bot protection and rate limiting.
    """
    hub = db.query(Hub).filter(Hub.slug == slug.lower()).first()
    if not hub:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Hub not found"
        )
    
    # Extract visitor info
    client_ip = get_client_ip(request)
    user_agent = request.headers.get("User-Agent", "")
    device_type = get_device_type(user_agent)
    country = geo_service.get_country(client_ip)
    
    # Track visit
    analytics = AnalyticsService(db)
    recorded, message = analytics.track_visit(
        hub_id=str(hub.id),
        visitor_ip=client_ip,
        user_agent=user_agent,
        device_type=device_type,
        country=country
    )
    
    return {
        "recorded": recorded,
        "message": message
    }


@router.post("/click/{link_id}")
async def track_click(
    link_id: UUID,
    request: Request,
    db: Session = Depends(get_db)
):
    """
    Track a link click
    
    Should be called when a user clicks on a link.
    Updates the link's click count and records detailed analytics.
    """
    link = db.query(Link).filter(Link.id == link_id).first()
    if not link:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Link not found"
        )
    
    # Extract visitor info
    client_ip = get_client_ip(request)
    user_agent = request.headers.get("User-Agent", "")
    device_type = get_device_type(user_agent)
    country = geo_service.get_country(client_ip)
    
    # Track click
    analytics = AnalyticsService(db)
    recorded, message = analytics.track_click(
        link_id=str(link.id),
        hub_id=str(link.hub_id),
        visitor_ip=client_ip,
        user_agent=user_agent,
        device_type=device_type,
        country=country
    )
    
    return {
        "recorded": recorded,
        "message": message
    }
