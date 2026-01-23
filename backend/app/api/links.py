"""
Smart Link Hub - Links API Routes
"""
from typing import List
from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import func

from app.database import get_db
from app.models.user import User
from app.models.hub import Hub
from app.models.link import Link
from app.schemas.link import LinkCreate, LinkUpdate, LinkResponse, LinkListResponse, LinkReorderRequest
from app.api.deps import get_current_user, rate_limit_check

router = APIRouter(tags=["Links"], dependencies=[Depends(rate_limit_check)])


def verify_hub_ownership(hub_id: UUID, user_id: UUID, db: Session) -> Hub:
    """Verify user owns the hub"""
    hub = db.query(Hub).filter(Hub.id == hub_id, Hub.user_id == user_id).first()
    if not hub:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Hub not found"
        )
    return hub


def verify_link_ownership(link_id: UUID, user_id: UUID, db: Session) -> Link:
    """Verify user owns the link's hub"""
    link = db.query(Link).join(Hub).filter(
        Link.id == link_id,
        Hub.user_id == user_id
    ).first()
    if not link:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Link not found"
        )
    return link


@router.get("/hubs/{hub_id}/links", response_model=LinkListResponse)
async def list_links(
    hub_id: UUID,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    List all links for a hub, ordered by position
    """
    verify_hub_ownership(hub_id, current_user.id, db)
    
    links = db.query(Link).filter(Link.hub_id == hub_id).order_by(Link.position).all()
    
    return LinkListResponse(
        links=[LinkResponse.model_validate(link) for link in links],
        total=len(links)
    )


@router.post("/hubs/{hub_id}/links", response_model=LinkResponse, status_code=status.HTTP_201_CREATED)
async def create_link(
    hub_id: UUID,
    link_data: LinkCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Add a new link to a hub
    
    - **title**: Display title for the link
    - **url**: Target URL
    - **icon**: Optional emoji or icon identifier
    - **position**: Optional position (auto-assigned if not provided)
    """
    verify_hub_ownership(hub_id, current_user.id, db)
    
    # Get next position if not specified
    if link_data.position is None:
        max_position = db.query(func.max(Link.position)).filter(Link.hub_id == hub_id).scalar() or -1
        position = max_position + 1
    else:
        position = link_data.position
    
    link = Link(
        hub_id=hub_id,
        title=link_data.title,
        url=link_data.url,
        icon=link_data.icon,
        position=position,
        is_enabled=link_data.is_enabled
    )
    db.add(link)
    db.commit()
    db.refresh(link)
    
    return LinkResponse.model_validate(link)


@router.put("/links/{link_id}", response_model=LinkResponse)
async def update_link(
    link_id: UUID,
    link_data: LinkUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Update a link
    """
    link = verify_link_ownership(link_id, current_user.id, db)
    
    # Update fields
    if link_data.title is not None:
        link.title = link_data.title
    if link_data.url is not None:
        link.url = link_data.url
    if link_data.icon is not None:
        link.icon = link_data.icon
    if link_data.position is not None:
        link.position = link_data.position
    if link_data.is_enabled is not None:
        link.is_enabled = link_data.is_enabled
    
    db.commit()
    db.refresh(link)
    
    return LinkResponse.model_validate(link)


@router.delete("/links/{link_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_link(
    link_id: UUID,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Delete a link
    """
    link = verify_link_ownership(link_id, current_user.id, db)
    db.delete(link)
    db.commit()


@router.put("/hubs/{hub_id}/links/reorder")
async def reorder_links(
    hub_id: UUID,
    reorder_data: LinkReorderRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Reorder links by providing ordered list of link IDs
    """
    verify_hub_ownership(hub_id, current_user.id, db)
    
    # Update positions based on order in the list
    for position, link_id in enumerate(reorder_data.link_ids):
        link = db.query(Link).filter(Link.id == link_id, Link.hub_id == hub_id).first()
        if link:
            link.position = position
    
    db.commit()
    
    return {"message": "Links reordered successfully"}
