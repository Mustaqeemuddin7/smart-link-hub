"""
Smart Link Hub - Public Hub API Routes
Public page rendering with rule engine processing
"""
from fastapi import APIRouter, Depends, HTTPException, status, Request
from sqlalchemy.orm import Session
from sqlalchemy import func

from app.database import get_db
from app.models.hub import Hub
from app.models.rule import Rule
from app.models.analytics import HubVisit
from app.schemas.hub import HubPublicResponse, ProcessedLinkResponse
from app.services.rule_engine import process_hub_links
from app.services.geo_service import geo_service
from app.utils.device_detector import get_device_type
from app.api.deps import get_client_ip, public_rate_limit_check

router = APIRouter(prefix="/public", tags=["Public"], dependencies=[Depends(public_rate_limit_check)])


@router.get("/{slug}", response_model=HubPublicResponse)
async def get_public_hub(
    slug: str,
    request: Request,
    db: Session = Depends(get_db)
):
    """
    Get public hub page with smart link processing
    
    This endpoint applies all configured rules to:
    - Filter which links appear
    - Prioritize/reorder links
    - Highlight recommended links
    
    Rule processing considers:
    - Time of day (visitor's timezone)
    - Device type (mobile/tablet/desktop)
    - Geographic location (country)
    - Link performance (CTR ranking)
    """
    # Find hub by slug
    hub = db.query(Hub).filter(
        Hub.slug == slug.lower(),
        Hub.is_active.is_(True)
    ).first()
    
    if not hub:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Hub not found"
        )
    
    # Get visitor context
    client_ip = get_client_ip(request)
    user_agent = request.headers.get("User-Agent", "")
    device_type = get_device_type(user_agent)
    country = geo_service.get_country_safe(client_ip, default="US")
    
    # Get total visits for performance-based rules
    total_visits = db.query(func.count(HubVisit.id)).filter(
        HubVisit.hub_id == hub.id
    ).scalar() or 0
    
    # Get rules
    rules = db.query(Rule).filter(
        Rule.hub_id == hub.id,
        Rule.is_active.is_(True)
    ).all()
    
    # Process links through rule engine
    processed_links = process_hub_links(
        links=hub.links,
        rules=rules,
        device_type=device_type,
        country=country,
        total_visits=total_visits
    )
    
    # Convert to response format
    link_responses = [
        ProcessedLinkResponse(
            id=link.id,
            title=link.title,
            url=link.url,
            icon=link.icon,
            is_highlighted=link.is_highlighted
        )
        for link in processed_links
    ]
    
    return HubPublicResponse(
        title=hub.title,
        description=hub.description,
        theme=hub.theme or {"background": "#000000", "accent": "#22C55E"},
        links=link_responses
    )


@router.get("/{slug}/preview")
async def preview_hub(
    slug: str,
    device: str = "desktop",
    country: str = "US",
    db: Session = Depends(get_db)
):
    """
    Preview hub with custom device/country for testing rules
    
    This endpoint allows testing how links will appear for different visitors.
    Useful for verifying rule configuration.
    """
    hub = db.query(Hub).filter(
        Hub.slug == slug.lower(),
        Hub.is_active == True
    ).first()
    
    if not hub:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Hub not found"
        )
    
    # Get total visits
    total_visits = db.query(func.count(HubVisit.id)).filter(
        HubVisit.hub_id == hub.id
    ).scalar() or 0
    
    # Get rules
    rules = db.query(Rule).filter(
        Rule.hub_id == hub.id,
        Rule.is_active.is_(True)
    ).all()
    
    # Process with custom context
    processed_links = process_hub_links(
        links=hub.links,
        rules=rules,
        device_type=device.lower(),
        country=country.upper(),
        total_visits=total_visits
    )
    
    return {
        "hub": {
            "title": hub.title,
            "description": hub.description,
            "theme": hub.theme
        },
        "context": {
            "device": device.lower(),
            "country": country.upper()
        },
        "links": [
            {
                "id": link.id,
                "title": link.title,
                "url": link.url,
                "icon": link.icon,
                "is_highlighted": link.is_highlighted,
                "priority_score": link.priority_score
            }
            for link in processed_links
        ],
        "rules_applied": len(rules)
    }
