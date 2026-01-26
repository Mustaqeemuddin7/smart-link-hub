"""
Smart Link Hub - Hub Model
"""
import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, Text, Boolean, DateTime, ForeignKey, JSON
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from app.database import Base


def utc_now():
    """Return current UTC time (timezone-aware)"""
    return datetime.now(timezone.utc)


class Hub(Base):
    """Hub model - represents a link-in-bio page"""
    __tablename__ = "hubs"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    title = Column(String(100), nullable=False)
    description = Column(Text, nullable=True)
    slug = Column(String(50), unique=True, nullable=False, index=True)
    theme = Column(JSON, default=lambda: {"background": "#000000", "accent": "#22C55E"})
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), default=utc_now)
    updated_at = Column(DateTime(timezone=True), default=utc_now, onupdate=utc_now)
    
    # Relationships
    owner = relationship("User", back_populates="hubs")
    links = relationship("Link", back_populates="hub", cascade="all, delete-orphan", order_by="Link.position")
    rules = relationship("Rule", back_populates="hub", cascade="all, delete-orphan")
    visits = relationship("HubVisit", back_populates="hub", cascade="all, delete-orphan")
    short_url = relationship("ShortURL", back_populates="hub", cascade="all, delete-orphan", uselist=False)
    
    def __repr__(self):
        return f"<Hub {self.slug}>"
