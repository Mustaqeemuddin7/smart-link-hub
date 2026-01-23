"""
Smart Link Hub - Rule Schemas
"""
from datetime import datetime
from typing import Optional, List, Dict, Any, Literal
from pydantic import BaseModel, Field, field_validator
from uuid import UUID


RuleType = Literal["time", "device", "location", "performance"]
ActionType = Literal["show", "hide", "set_priority"]


class TimeCondition(BaseModel):
    """Time-based rule condition"""
    start_hour: int = Field(..., ge=0, le=23)
    end_hour: int = Field(..., ge=0, le=23)
    timezone: str = "UTC"


class DeviceCondition(BaseModel):
    """Device-based rule condition"""
    devices: List[Literal["mobile", "tablet", "desktop"]]


class LocationCondition(BaseModel):
    """Location-based rule condition"""
    countries: List[str] = Field(..., description="ISO 2-letter country codes")


class PerformanceCondition(BaseModel):
    """Performance-based rule condition"""
    min_ctr: Optional[float] = Field(None, ge=0, le=1)
    min_clicks: Optional[int] = Field(None, ge=0)


class RuleAction(BaseModel):
    """Rule action configuration"""
    action: ActionType
    priority_boost: Optional[int] = Field(None, description="Priority points to add/subtract")
    priority: Optional[int] = Field(None, description="Absolute priority to set")
    highlight: Optional[bool] = Field(None, description="Whether to highlight the link")


class RuleBase(BaseModel):
    """Base rule schema"""
    name: str = Field(..., min_length=1, max_length=100)
    rule_type: RuleType
    condition: Dict[str, Any]
    action: Dict[str, Any]
    priority: int = Field(default=0, description="Rule evaluation priority (higher = first)")
    target_link_ids: Optional[List[str]] = Field(None, description="Specific links to apply to")


class RuleCreate(RuleBase):
    """Schema for creating a rule"""
    is_active: bool = True


class RuleUpdate(BaseModel):
    """Schema for updating a rule"""
    name: Optional[str] = Field(None, min_length=1, max_length=100)
    rule_type: Optional[RuleType] = None
    condition: Optional[Dict[str, Any]] = None
    action: Optional[Dict[str, Any]] = None
    priority: Optional[int] = None
    is_active: Optional[bool] = None
    target_link_ids: Optional[List[str]] = None


class RuleResponse(RuleBase):
    """Schema for rule response"""
    id: UUID
    hub_id: UUID
    is_active: bool
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True


class RuleListResponse(BaseModel):
    """Schema for rule list response"""
    rules: List[RuleResponse]
    total: int


# Rule template presets for easy creation
class RulePresets:
    """Pre-defined rule templates"""
    
    @staticmethod
    def business_hours(timezone: str = "Asia/Kolkata") -> dict:
        """Show links only during business hours (9 AM - 6 PM)"""
        return {
            "name": "Business Hours Only",
            "rule_type": "time",
            "condition": {"start_hour": 9, "end_hour": 18, "timezone": timezone},
            "action": {"action": "show", "priority_boost": 5}
        }
    
    @staticmethod
    def mobile_priority() -> dict:
        """Prioritize certain links on mobile devices"""
        return {
            "name": "Mobile Priority",
            "rule_type": "device",
            "condition": {"devices": ["mobile"]},
            "action": {"action": "show", "priority_boost": 20, "highlight": True}
        }
    
    @staticmethod
    def india_upi() -> dict:
        """Show UPI payment links for Indian visitors"""
        return {
            "name": "India UPI",
            "rule_type": "location",
            "condition": {"countries": ["IN"]},
            "action": {"action": "show", "priority_boost": 50, "highlight": True}
        }
    
    @staticmethod
    def high_performer_boost() -> dict:
        """Auto-boost high-performing links"""
        return {
            "name": "High Performer Boost",
            "rule_type": "performance",
            "condition": {"min_ctr": 0.1, "min_clicks": 5},
            "action": {"action": "set_priority", "priority": 100, "highlight": True}
        }
