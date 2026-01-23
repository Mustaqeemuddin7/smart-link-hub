"""
Smart Link Hub - Rules API Routes
"""
from typing import List
from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.user import User
from app.models.hub import Hub
from app.models.rule import Rule
from app.schemas.rule import RuleCreate, RuleUpdate, RuleResponse, RuleListResponse, RulePresets
from app.api.deps import get_current_user, rate_limit_check

router = APIRouter(tags=["Rules"], dependencies=[Depends(rate_limit_check)])


def verify_hub_ownership(hub_id: UUID, user_id: UUID, db: Session) -> Hub:
    """Verify user owns the hub"""
    hub = db.query(Hub).filter(Hub.id == hub_id, Hub.user_id == user_id).first()
    if not hub:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Hub not found"
        )
    return hub


def verify_rule_ownership(rule_id: UUID, user_id: UUID, db: Session) -> Rule:
    """Verify user owns the rule's hub"""
    rule = db.query(Rule).join(Hub).filter(
        Rule.id == rule_id,
        Hub.user_id == user_id
    ).first()
    if not rule:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Rule not found"
        )
    return rule


@router.get("/hubs/{hub_id}/rules", response_model=RuleListResponse)
async def list_rules(
    hub_id: UUID,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    List all rules for a hub, ordered by priority
    """
    verify_hub_ownership(hub_id, current_user.id, db)
    
    rules = db.query(Rule).filter(Rule.hub_id == hub_id).order_by(Rule.priority.desc()).all()
    
    return RuleListResponse(
        rules=[RuleResponse.model_validate(rule) for rule in rules],
        total=len(rules)
    )


@router.post("/hubs/{hub_id}/rules", response_model=RuleResponse, status_code=status.HTTP_201_CREATED)
async def create_rule(
    hub_id: UUID,
    rule_data: RuleCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Add a new rule to a hub
    
    Rule types: time, device, location, performance
    
    Conditions depend on rule type:
    - **time**: {start_hour, end_hour, timezone}
    - **device**: {devices: ["mobile", "tablet", "desktop"]}
    - **location**: {countries: ["IN", "US", ...]}
    - **performance**: {min_ctr, min_clicks}
    
    Actions:
    - **show**: Make link visible with optional priority_boost and highlight
    - **hide**: Hide the link
    - **set_priority**: Set absolute priority value
    """
    verify_hub_ownership(hub_id, current_user.id, db)
    
    # Validate rule type
    valid_types = ["time", "device", "location", "performance"]
    if rule_data.rule_type not in valid_types:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid rule type. Must be one of: {valid_types}"
        )
    
    rule = Rule(
        hub_id=hub_id,
        name=rule_data.name,
        rule_type=rule_data.rule_type,
        condition=rule_data.condition,
        action=rule_data.action,
        priority=rule_data.priority,
        is_active=rule_data.is_active,
        target_link_ids=rule_data.target_link_ids
    )
    db.add(rule)
    db.commit()
    db.refresh(rule)
    
    return RuleResponse.model_validate(rule)


@router.put("/rules/{rule_id}", response_model=RuleResponse)
async def update_rule(
    rule_id: UUID,
    rule_data: RuleUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Update a rule
    """
    rule = verify_rule_ownership(rule_id, current_user.id, db)
    
    # Update fields
    if rule_data.name is not None:
        rule.name = rule_data.name
    if rule_data.rule_type is not None:
        rule.rule_type = rule_data.rule_type
    if rule_data.condition is not None:
        rule.condition = rule_data.condition
    if rule_data.action is not None:
        rule.action = rule_data.action
    if rule_data.priority is not None:
        rule.priority = rule_data.priority
    if rule_data.is_active is not None:
        rule.is_active = rule_data.is_active
    if rule_data.target_link_ids is not None:
        rule.target_link_ids = rule_data.target_link_ids
    
    db.commit()
    db.refresh(rule)
    
    return RuleResponse.model_validate(rule)


@router.delete("/rules/{rule_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_rule(
    rule_id: UUID,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Delete a rule
    """
    rule = verify_rule_ownership(rule_id, current_user.id, db)
    db.delete(rule)
    db.commit()


@router.get("/rules/presets")
async def get_rule_presets():
    """
    Get available rule presets/templates for quick setup
    """
    return {
        "presets": [
            {
                "name": "Business Hours Only",
                "description": "Show links only during business hours (9 AM - 6 PM)",
                **RulePresets.business_hours()
            },
            {
                "name": "Mobile Priority",
                "description": "Boost and highlight links on mobile devices",
                **RulePresets.mobile_priority()
            },
            {
                "name": "India UPI",
                "description": "Show UPI payment links for Indian visitors",
                **RulePresets.india_upi()
            },
            {
                "name": "High Performer Boost",
                "description": "Auto-boost links with high click-through rates",
                **RulePresets.high_performer_boost()
            }
        ]
    }
