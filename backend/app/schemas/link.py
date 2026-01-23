"""
Smart Link Hub - Link Schemas
"""
from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel, Field, HttpUrl
from uuid import UUID


class LinkBase(BaseModel):
    """Base link schema"""
    title: str = Field(..., min_length=1, max_length=100)
    url: str = Field(..., max_length=2048)
    icon: Optional[str] = Field(None, max_length=50)


class LinkCreate(LinkBase):
    """Schema for creating a link"""
    position: Optional[int] = None
    is_enabled: bool = True


class LinkUpdate(BaseModel):
    """Schema for updating a link"""
    title: Optional[str] = Field(None, min_length=1, max_length=100)
    url: Optional[str] = Field(None, max_length=2048)
    icon: Optional[str] = Field(None, max_length=50)
    position: Optional[int] = None
    is_enabled: Optional[bool] = None


class LinkResponse(LinkBase):
    """Schema for link response"""
    id: UUID
    hub_id: UUID
    position: int
    is_enabled: bool
    click_count: int
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True


class LinkListResponse(BaseModel):
    """Schema for link list response"""
    links: List[LinkResponse]
    total: int


class LinkReorderRequest(BaseModel):
    """Schema for reordering links"""
    link_ids: List[UUID] = Field(..., description="Ordered list of link IDs")
