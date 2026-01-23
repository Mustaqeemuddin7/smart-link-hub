"""
Smart Link Hub - Hub Schemas
"""
from datetime import datetime
from typing import Optional, List, Dict, Any
from pydantic import BaseModel, Field, field_validator
from uuid import UUID
import re


class ThemeConfig(BaseModel):
    """Hub theme configuration"""
    background: str = "#000000"
    accent: str = "#22C55E"
    font: Optional[str] = "Inter"


class HubBase(BaseModel):
    """Base hub schema"""
    title: str = Field(..., min_length=1, max_length=100)
    description: Optional[str] = Field(None, max_length=500)


class HubCreate(HubBase):
    """Schema for creating a hub"""
    slug: str = Field(..., min_length=3, max_length=50, pattern=r"^[a-z0-9]+(?:-[a-z0-9]+)*$")
    theme: Optional[ThemeConfig] = None
    
    @field_validator("slug")
    @classmethod
    def validate_slug(cls, v: str) -> str:
        """Validate slug format"""
        if not re.match(r"^[a-z0-9]+(?:-[a-z0-9]+)*$", v):
            raise ValueError("Slug must contain only lowercase letters, numbers, and hyphens")
        return v.lower()


class HubUpdate(BaseModel):
    """Schema for updating a hub"""
    title: Optional[str] = Field(None, min_length=1, max_length=100)
    description: Optional[str] = Field(None, max_length=500)
    slug: Optional[str] = Field(None, min_length=3, max_length=50)
    theme: Optional[ThemeConfig] = None
    is_active: Optional[bool] = None


class HubResponse(HubBase):
    """Schema for hub response"""
    id: UUID
    slug: str
    theme: Dict[str, Any]
    is_active: bool
    created_at: datetime
    updated_at: datetime
    link_count: Optional[int] = 0
    total_visits: Optional[int] = 0
    
    class Config:
        from_attributes = True


class HubListResponse(BaseModel):
    """Schema for hub list response"""
    hubs: List[HubResponse]
    total: int


class HubPublicResponse(BaseModel):
    """Schema for public hub display"""
    title: str
    description: Optional[str]
    theme: Dict[str, Any]
    links: List["ProcessedLinkResponse"]


class ProcessedLinkResponse(BaseModel):
    """Schema for processed link in public view"""
    id: str
    title: str
    url: str
    icon: Optional[str]
    is_highlighted: bool = False


# Update forward references
HubPublicResponse.model_rebuild()
