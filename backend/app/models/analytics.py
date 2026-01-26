"""
Smart Link Hub - Analytics Models
Tracks hub visits and link clicks for analytics
"""
import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, DateTime, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from app.database import Base


def utc_now():
    """Return current UTC time (timezone-aware)"""
    return datetime.now(timezone.utc)


class HubVisit(Base):
    """Tracks individual visits to a hub's public page"""
    __tablename__ = "hub_visits"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    hub_id = Column(UUID(as_uuid=True), ForeignKey("hubs.id", ondelete="CASCADE"), nullable=False)
    visitor_ip = Column(String(45), nullable=True)  # Supports IPv6, anonymized
    user_agent = Column(String(500), nullable=True)
    device_type = Column(String(20), nullable=True)  # mobile, tablet, desktop
    country = Column(String(2), nullable=True)  # ISO 2-letter country code
    visited_at = Column(DateTime(timezone=True), default=utc_now, index=True)
    
    # Relationships
    hub = relationship("Hub", back_populates="visits")
    
    def __repr__(self):
        return f"<HubVisit {self.hub_id} at {self.visited_at}>"


class LinkClick(Base):
    """Tracks individual clicks on links"""
    __tablename__ = "link_clicks"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    link_id = Column(UUID(as_uuid=True), ForeignKey("links.id", ondelete="CASCADE"), nullable=False)
    hub_id = Column(UUID(as_uuid=True), ForeignKey("hubs.id", ondelete="CASCADE"), nullable=False)
    visitor_ip = Column(String(45), nullable=True)
    user_agent = Column(String(500), nullable=True)
    device_type = Column(String(20), nullable=True)
    country = Column(String(2), nullable=True)
    clicked_at = Column(DateTime(timezone=True), default=utc_now, index=True)
    
    # Relationships
    link = relationship("Link", back_populates="clicks")
    
    def __repr__(self):
        return f"<LinkClick {self.link_id} at {self.clicked_at}>"

