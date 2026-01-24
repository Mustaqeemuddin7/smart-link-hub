"""
Smart Link Hub - Redirect API Routes
Handles short URL redirects
"""
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.responses import RedirectResponse
from sqlalchemy.orm import Session

from app.database import get_db
from app.services.url_shortener import get_short_url_by_code, increment_click_count

router = APIRouter(tags=["Redirect"])


@router.get("/s/{short_code}")
async def redirect_short_url(
    short_code: str,
    db: Session = Depends(get_db)
):
    """
    Redirect short URL to the original hub URL.
    
    Fast redirect with click tracking.
    """
    short_url = get_short_url_by_code(db, short_code)
    
    if not short_url:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Short URL not found"
        )
    
    # Increment click count
    increment_click_count(db, short_url)
    
    # Get the hub slug
    hub = short_url.hub
    if not hub or not hub.is_active:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Hub not found or inactive"
        )
    
    # Redirect to the public hub page
    # In production, this would be the actual domain
    redirect_url = f"/{hub.slug}"
    
    return RedirectResponse(
        url=redirect_url,
        status_code=status.HTTP_307_TEMPORARY_REDIRECT
    )
