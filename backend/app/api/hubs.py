"""
Smart Link Hub - Hub API Routes
"""
from typing import List
from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from sqlalchemy import func

from app.database import get_db
from app.models.user import User
from app.models.hub import Hub
from app.models.link import Link
from app.models.analytics import HubVisit
from app.schemas.hub import HubCreate, HubUpdate, HubResponse, HubListResponse
from app.api.deps import get_current_user, rate_limit_check

router = APIRouter(prefix="/hubs", tags=["Hubs"], dependencies=[Depends(rate_limit_check)])


@router.get("", response_model=HubListResponse)
async def list_hubs(
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    List all hubs for the current user
    """
    query = db.query(Hub).filter(Hub.user_id == current_user.id)
    total = query.count()
    hubs = query.order_by(Hub.created_at.desc()).offset(skip).limit(limit).all()
    
    # Add computed fields
    hub_responses = []
    for hub in hubs:
        link_count = db.query(func.count(Link.id)).filter(Link.hub_id == hub.id).scalar() or 0
        total_visits = db.query(func.count(HubVisit.id)).filter(HubVisit.hub_id == hub.id).scalar() or 0
        
        hub_response = HubResponse(
            id=hub.id,
            title=hub.title,
            description=hub.description,
            slug=hub.slug,
            theme=hub.theme or {"background": "#000000", "accent": "#22C55E"},
            is_active=hub.is_active,
            created_at=hub.created_at,
            updated_at=hub.updated_at,
            link_count=link_count,
            total_visits=total_visits
        )
        hub_responses.append(hub_response)
    
    return HubListResponse(hubs=hub_responses, total=total)


@router.post("", response_model=HubResponse, status_code=status.HTTP_201_CREATED)
async def create_hub(
    hub_data: HubCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Create a new hub
    
    - **title**: Hub display title
    - **description**: Optional description
    - **slug**: Unique URL slug (lowercase, alphanumeric, hyphens)
    - **theme**: Optional theme configuration
    """
    # Check if slug is already taken
    existing = db.query(Hub).filter(Hub.slug == hub_data.slug.lower()).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Slug already taken"
        )
    
    hub = Hub(
        user_id=current_user.id,
        title=hub_data.title,
        description=hub_data.description,
        slug=hub_data.slug.lower(),
        theme=hub_data.theme.model_dump() if hub_data.theme else {"background": "#000000", "accent": "#22C55E"}
    )
    db.add(hub)
    db.commit()
    db.refresh(hub)
    
    return HubResponse(
        id=hub.id,
        title=hub.title,
        description=hub.description,
        slug=hub.slug,
        theme=hub.theme,
        is_active=hub.is_active,
        created_at=hub.created_at,
        updated_at=hub.updated_at,
        link_count=0,
        total_visits=0
    )


@router.get("/check-slug/{slug}")
async def check_slug_availability(
    slug: str,
    db: Session = Depends(get_db)
):
    """
    Check if a slug is available
    """
    existing = db.query(Hub).filter(Hub.slug == slug.lower()).first()
    return {"available": existing is None, "slug": slug.lower()}


@router.get("/{hub_id}", response_model=HubResponse)
async def get_hub(
    hub_id: UUID,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get a specific hub by ID
    """
    hub = db.query(Hub).filter(
        Hub.id == hub_id,
        Hub.user_id == current_user.id
    ).first()
    
    if not hub:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Hub not found"
        )
    
    link_count = db.query(func.count(Link.id)).filter(Link.hub_id == hub.id).scalar() or 0
    total_visits = db.query(func.count(HubVisit.id)).filter(HubVisit.hub_id == hub.id).scalar() or 0
    
    return HubResponse(
        id=hub.id,
        title=hub.title,
        description=hub.description,
        slug=hub.slug,
        theme=hub.theme or {"background": "#000000", "accent": "#22C55E"},
        is_active=hub.is_active,
        created_at=hub.created_at,
        updated_at=hub.updated_at,
        link_count=link_count,
        total_visits=total_visits
    )


@router.put("/{hub_id}", response_model=HubResponse)
async def update_hub(
    hub_id: UUID,
    hub_data: HubUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Update a hub
    """
    hub = db.query(Hub).filter(
        Hub.id == hub_id,
        Hub.user_id == current_user.id
    ).first()
    
    if not hub:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Hub not found"
        )
    
    # Check slug uniqueness if being changed
    if hub_data.slug and hub_data.slug.lower() != hub.slug:
        existing = db.query(Hub).filter(Hub.slug == hub_data.slug.lower()).first()
        if existing:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Slug already taken"
            )
        hub.slug = hub_data.slug.lower()
    
    # Update fields
    if hub_data.title is not None:
        hub.title = hub_data.title
    if hub_data.description is not None:
        hub.description = hub_data.description
    if hub_data.theme is not None:
        hub.theme = hub_data.theme.model_dump()
    if hub_data.is_active is not None:
        hub.is_active = hub_data.is_active
    
    db.commit()
    db.refresh(hub)
    
    link_count = db.query(func.count(Link.id)).filter(Link.hub_id == hub.id).scalar() or 0
    total_visits = db.query(func.count(HubVisit.id)).filter(HubVisit.hub_id == hub.id).scalar() or 0
    
    return HubResponse(
        id=hub.id,
        title=hub.title,
        description=hub.description,
        slug=hub.slug,
        theme=hub.theme,
        is_active=hub.is_active,
        created_at=hub.created_at,
        updated_at=hub.updated_at,
        link_count=link_count,
        total_visits=total_visits
    )


@router.delete("/{hub_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_hub(
    hub_id: UUID,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Delete a hub and all its links/rules
    """
    hub = db.query(Hub).filter(
        Hub.id == hub_id,
        Hub.user_id == current_user.id
    ).first()
    
    if not hub:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Hub not found"
        )
    
    db.delete(hub)
    db.commit()
