"""
Smart Link Hub - Rule Engine Service
Core smart link processing engine that applies dynamic rules
"""
from datetime import datetime
from typing import List, Dict, Any, Optional
from dataclasses import dataclass, field
import pytz

from app.models.link import Link
from app.models.rule import Rule


@dataclass
class VisitorContext:
    """Context about the current visitor for rule evaluation"""
    device_type: str  # mobile, tablet, desktop
    country: str  # ISO 2-letter code
    current_time: datetime
    timezone: str = "UTC"


@dataclass
class ProcessedLink:
    """Link after rule processing with display metadata"""
    id: str
    title: str
    url: str
    icon: Optional[str] = None
    position: int = 0
    is_highlighted: bool = False
    priority_score: float = 0.0
    is_visible: bool = True


class RuleEngine:
    """
    Engine for processing and applying display rules to links
    
    Supports rule types:
    - time: Show/hide based on time of day
    - device: Show/hide based on device type
    - location: Show/hide based on visitor country
    - performance: Boost based on click performance
    """
    
    def __init__(self):
        self.rule_handlers = {
            "time": self._evaluate_time_rule,
            "device": self._evaluate_device_rule,
            "location": self._evaluate_location_rule,
            "performance": self._evaluate_performance_rule,
        }
    
    def process_links(
        self,
        links: List[Link],
        rules: List[Rule],
        context: VisitorContext,
        total_hub_visits: int = 0
    ) -> List[ProcessedLink]:
        """
        Process links through the rule engine
        
        Args:
            links: All links for the hub
            rules: Active rules for the hub
            context: Visitor context (device, location, time)
            total_hub_visits: Total hub visits for CTR calculation
        
        Returns:
            Filtered, ordered, and annotated list of links for display
        """
        # Initialize processed links with base priority from position
        processed: Dict[str, ProcessedLink] = {}
        for link in links:
            if not link.is_enabled:
                continue
            processed[str(link.id)] = ProcessedLink(
                id=str(link.id),
                title=link.title,
                url=link.url,
                icon=link.icon,
                position=link.position,
                priority_score=1000 - link.position,  # Base score from position
            )
        
        # Sort rules by priority (higher first)
        sorted_rules = sorted(
            [r for r in rules if r.is_active],
            key=lambda r: r.priority,
            reverse=True
        )
        
        # Apply each rule
        for rule in sorted_rules:
            # Get target links (all if not specified)
            if rule.target_link_ids:
                target_ids = [str(lid) for lid in rule.target_link_ids]
            else:
                target_ids = list(processed.keys())
            
            # Check if rule condition matches
            rule_matches = self._evaluate_rule(rule, context, links)
            
            if rule_matches:
                self._apply_action(processed, rule.action, target_ids)
        
        # Apply performance boost if we have visit data
        if total_hub_visits > 0:
            self._apply_performance_boost(processed, links, total_hub_visits)
        
        # Filter out hidden links and sort by priority
        visible_links = [
            link for link in processed.values()
            if link.is_visible and link.priority_score >= 0
        ]
        
        # Sort by priority score (descending), then by position
        visible_links.sort(
            key=lambda x: (-x.priority_score, x.position)
        )
        
        return visible_links
    
    def _evaluate_rule(
        self,
        rule: Rule,
        context: VisitorContext,
        links: List[Link]
    ) -> bool:
        """Evaluate if a rule's condition matches the current context"""
        handler = self.rule_handlers.get(rule.rule_type)
        if not handler:
            return False
        return handler(rule.condition, context, links)
    
    def _evaluate_time_rule(
        self,
        condition: Dict[str, Any],
        context: VisitorContext,
        links: List[Link]
    ) -> bool:
        """Check if current time falls within the specified range"""
        start_hour = condition.get("start_hour", 0)
        end_hour = condition.get("end_hour", 24)
        timezone_str = condition.get("timezone", context.timezone)
        
        try:
            tz = pytz.timezone(timezone_str)
            local_time = context.current_time.astimezone(tz)
            current_hour = local_time.hour
            
            # Handle overnight ranges (e.g., 22:00 - 06:00)
            if start_hour <= end_hour:
                return start_hour <= current_hour < end_hour
            else:
                return current_hour >= start_hour or current_hour < end_hour
        except Exception:
            return False
    
    def _evaluate_device_rule(
        self,
        condition: Dict[str, Any],
        context: VisitorContext,
        links: List[Link]
    ) -> bool:
        """Check if visitor's device matches the rule"""
        allowed_devices = condition.get("devices", [])
        if not allowed_devices:
            return True
        return context.device_type.lower() in [d.lower() for d in allowed_devices]
    
    def _evaluate_location_rule(
        self,
        condition: Dict[str, Any],
        context: VisitorContext,
        links: List[Link]
    ) -> bool:
        """Check if visitor's country matches the rule"""
        allowed_countries = condition.get("countries", [])
        if not allowed_countries:
            return True
        return context.country.upper() in [c.upper() for c in allowed_countries]
    
    def _evaluate_performance_rule(
        self,
        condition: Dict[str, Any],
        context: VisitorContext,
        links: List[Link]
    ) -> bool:
        """Performance-based rules are evaluated per-link, always return True"""
        return True
    
    def _apply_action(
        self,
        processed: Dict[str, ProcessedLink],
        action: Dict[str, Any],
        target_link_ids: List[str]
    ) -> None:
        """Apply rule action to target links"""
        action_type = action.get("action", "show")
        
        for link_id in target_link_ids:
            if link_id not in processed:
                continue
            link = processed[link_id]
            
            if action_type == "hide":
                link.is_visible = False
                link.priority_score = -1  # Mark as hidden
            
            elif action_type == "show":
                link.is_visible = True
                priority_boost = action.get("priority_boost", 0)
                link.priority_score += priority_boost
                if action.get("highlight"):
                    link.is_highlighted = True
            
            elif action_type == "set_priority":
                link.priority_score = action.get("priority", link.priority_score)
                if action.get("highlight"):
                    link.is_highlighted = True
    
    def _apply_performance_boost(
        self,
        processed: Dict[str, ProcessedLink],
        links: List[Link],
        total_hub_visits: int
    ) -> None:
        """
        Auto-boost links based on click performance (CTR)
        Links with higher CTR get ranking bonus
        """
        for link in links:
            link_id = str(link.id)
            if link_id not in processed:
                continue
            
            # Calculate CTR
            ctr = link.click_count / total_hub_visits if total_hub_visits > 0 else 0
            
            # Boost score based on CTR (max 50 points for 50%+ CTR)
            performance_boost = min(ctr * 100, 50)
            processed[link_id].priority_score += performance_boost


# Singleton instance
rule_engine = RuleEngine()


def process_hub_links(
    links: List[Link],
    rules: List[Rule],
    device_type: str,
    country: str,
    total_visits: int = 0
) -> List[ProcessedLink]:
    """
    Convenience function to process links with visitor context
    
    Args:
        links: Hub links
        rules: Hub rules
        device_type: Visitor device type
        country: Visitor country code
        total_visits: Total hub visits for CTR
        
    Returns:
        Processed and ordered links
    """
    context = VisitorContext(
        device_type=device_type,
        country=country,
        current_time=datetime.utcnow(),
        timezone="UTC"
    )
    return rule_engine.process_links(links, rules, context, total_visits)
