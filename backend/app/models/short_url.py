"""
Smart Link Hub - Short URL Model
"""
import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, Integer, DateTime, ForeignKey, Boolean
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from app.database import Base


def utc_now():
    """Return current UTC time (timezone-aware)"""
    return datetime.now(timezone.utc)


class ShortURL(Base):
    """Short URL model for URL shortening feature"""
    __tablename__ = "short_urls"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    hub_id = Column(UUID(as_uuid=True), ForeignKey("hubs.id", ondelete="CASCADE"), nullable=False, unique=True)
    short_code = Column(String(10), unique=True, nullable=False, index=True)
    click_count = Column(Integer, default=0)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), default=utc_now)
    updated_at = Column(DateTime(timezone=True), default=utc_now, onupdate=utc_now)
    
    # Relationship
    hub = relationship("Hub", back_populates="short_url")
    
    def __repr__(self):
        return f"<ShortURL {self.short_code}>"
