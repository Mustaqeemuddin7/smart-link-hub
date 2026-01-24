"""
Smart Link Hub - Rule Model
Rules are configurable conditions that affect link display
"""
import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, Integer, Boolean, DateTime, ForeignKey, JSON
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from app.database import Base


def utc_now():
    """Return current UTC time (timezone-aware)"""
    return datetime.now(timezone.utc)


class Rule(Base):
    """
    Rule model - configurable display rules for links
    
    Rule Types:
    - time: Show/hide based on time of day
    - device: Show/hide based on device type (mobile/tablet/desktop)
    - location: Show/hide based on visitor's country
    - performance: Boost/demote based on click performance
    
    Condition JSON Examples:
    - Time: {"start_hour": 9, "end_hour": 18, "timezone": "Asia/Kolkata"}
    - Device: {"devices": ["mobile", "tablet"]}
    - Location: {"countries": ["IN", "US"]}
    - Performance: {"min_ctr": 0.1, "min_clicks": 10}
    
    Action JSON Examples:
    - {"action": "show", "priority_boost": 10, "highlight": true}
    - {"action": "hide"}
    - {"action": "set_priority", "priority": 1}
    """
    __tablename__ = "rules"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    hub_id = Column(UUID(as_uuid=True), ForeignKey("hubs.id"), nullable=False)
    name = Column(String(100), nullable=False)
    rule_type = Column(String(50), nullable=False)  # time, device, location, performance
    condition = Column(JSON, nullable=False)
    action = Column(JSON, nullable=False)
    priority = Column(Integer, default=0)  # Higher priority rules applied first
    is_active = Column(Boolean, default=True)
    target_link_ids = Column(JSON, nullable=True)  # Specific links to apply rule to (null = all)
    created_at = Column(DateTime(timezone=True), default=utc_now)
    updated_at = Column(DateTime(timezone=True), default=utc_now, onupdate=utc_now)
    
    # Relationships
    hub = relationship("Hub", back_populates="rules")
    
    def __repr__(self):
        return f"<Rule {self.name} ({self.rule_type})>"
