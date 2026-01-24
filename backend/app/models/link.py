"""
Smart Link Hub - Link Model
"""
import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, Integer, Boolean, DateTime, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from app.database import Base


def utc_now():
    """Return current UTC time (timezone-aware)"""
    return datetime.now(timezone.utc)


class Link(Base):
    """Link model - individual links within a hub"""
    __tablename__ = "links"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    hub_id = Column(UUID(as_uuid=True), ForeignKey("hubs.id"), nullable=False)
    title = Column(String(100), nullable=False)
    url = Column(String(2048), nullable=False)
    icon = Column(String(50), nullable=True)  # Icon name or emoji
    position = Column(Integer, default=0)
    is_enabled = Column(Boolean, default=True)
    click_count = Column(Integer, default=0)
    created_at = Column(DateTime(timezone=True), default=utc_now)
    updated_at = Column(DateTime(timezone=True), default=utc_now, onupdate=utc_now)
    
    # Relationships
    hub = relationship("Hub", back_populates="links")
    clicks = relationship("LinkClick", back_populates="link", cascade="all, delete-orphan")
    
    def __repr__(self):
        return f"<Link {self.title}>"
