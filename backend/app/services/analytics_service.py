"""
Smart Link Hub - Analytics Service
Handles tracking, aggregation, and reporting of hub visits and link clicks
"""
import hashlib
from datetime import datetime, timedelta
from typing import Dict, Any, List, Optional, Tuple
from sqlalchemy import func, and_
from sqlalchemy.orm import Session

from app.models.analytics import HubVisit, LinkClick
from app.models.hub import Hub
from app.models.link import Link


class AnalyticsService:
    """Service for tracking and analyzing user interactions"""
    
    # Simple in-memory rate limiter (use Redis in production)
    _visit_cache: Dict[str, datetime] = {}
    RATE_LIMIT_SECONDS = 60  # 1 visit per minute per IP per hub
    
    def __init__(self, db: Session):
        self.db = db
    
    def _is_bot(self, user_agent: str) -> bool:
        """Simple bot detection based on user agent"""
        if not user_agent:
            return True
        
        bot_indicators = [
            "bot", "crawler", "spider", "scraper",
            "curl", "wget", "python-requests", "python-urllib",
            "headless", "phantom", "selenium", "puppeteer",
            "googlebot", "bingbot", "slurp", "duckduckbot",
            "baiduspider", "yandexbot", "facebookexternalhit"
        ]
        ua_lower = user_agent.lower()
        return any(indicator in ua_lower for indicator in bot_indicators)
    
    def _get_rate_limit_key(self, hub_id: str, visitor_ip: str) -> str:
        """Generate unique key for rate limiting"""
        return hashlib.md5(f"{hub_id}:{visitor_ip}".encode()).hexdigest()
    
    def _is_rate_limited(self, key: str) -> bool:
        """Check if visitor is rate limited"""
        last_visit = self._visit_cache.get(key)
        if last_visit:
            if datetime.utcnow() - last_visit < timedelta(seconds=self.RATE_LIMIT_SECONDS):
                return True
        return False
    
    def _update_rate_limit(self, key: str) -> None:
        """Update rate limit timestamp"""
        self._visit_cache[key] = datetime.utcnow()
        
        # Cleanup old entries periodically
        if len(self._visit_cache) > 10000:
            cutoff = datetime.utcnow() - timedelta(minutes=10)
            self._visit_cache = {
                k: v for k, v in self._visit_cache.items()
                if v > cutoff
            }
    
    def _anonymize_ip(self, ip: str) -> Optional[str]:
        """Anonymize IP for privacy (remove last octet for IPv4)"""
        if not ip:
            return None
        parts = ip.split(".")
        if len(parts) == 4:
            parts[-1] = "0"
            return ".".join(parts)
        # For IPv6, just return first part
        if ":" in ip:
            return ip.split(":")[0] + "::"
        return ip
    
    def track_visit(
        self,
        hub_id: str,
        visitor_ip: Optional[str],
        user_agent: Optional[str],
        device_type: str,
        country: Optional[str]
    ) -> Tuple[bool, str]:
        """
        Track a hub visit with bot protection and rate limiting
        
        Returns:
            Tuple of (recorded: bool, message: str)
        """
        # Bot protection
        if self._is_bot(user_agent or ""):
            return False, "Bot detected"
        
        # Rate limiting
        rate_key = self._get_rate_limit_key(hub_id, visitor_ip or "unknown")
        if self._is_rate_limited(rate_key):
            return False, "Rate limited"
        
        # Record visit
        visit = HubVisit(
            hub_id=hub_id,
            visitor_ip=self._anonymize_ip(visitor_ip) if visitor_ip else None,
            user_agent=user_agent[:500] if user_agent else None,
            device_type=device_type,
            country=country,
            visited_at=datetime.utcnow()
        )
        self.db.add(visit)
        self.db.commit()
        
        self._update_rate_limit(rate_key)
        return True, "Visit recorded"
    
    def track_click(
        self,
        link_id: str,
        hub_id: str,
        visitor_ip: Optional[str],
        user_agent: Optional[str],
        device_type: str,
        country: Optional[str]
    ) -> Tuple[bool, str]:
        """Track a link click"""
        # Bot protection
        if self._is_bot(user_agent or ""):
            return False, "Bot detected"
        
        # Record click
        click = LinkClick(
            link_id=link_id,
            hub_id=hub_id,
            visitor_ip=self._anonymize_ip(visitor_ip) if visitor_ip else None,
            user_agent=user_agent[:500] if user_agent else None,
            device_type=device_type,
            country=country,
            clicked_at=datetime.utcnow()
        )
        self.db.add(click)
        
        # Update click count on link
        link = self.db.query(Link).filter(Link.id == link_id).first()
        if link:
            link.click_count = (link.click_count or 0) + 1
        
        self.db.commit()
        return True, "Click recorded"
    
    def get_hub_analytics(
        self,
        hub_id: str,
        days: int = 30
    ) -> Dict[str, Any]:
        """Get comprehensive analytics for a hub"""
        cutoff = datetime.utcnow() - timedelta(days=days)
        
        # Total visits
        total_visits = self.db.query(func.count(HubVisit.id)).filter(
            and_(HubVisit.hub_id == hub_id, HubVisit.visited_at >= cutoff)
        ).scalar() or 0
        
        # Total clicks
        total_clicks = self.db.query(func.count(LinkClick.id)).filter(
            and_(LinkClick.hub_id == hub_id, LinkClick.clicked_at >= cutoff)
        ).scalar() or 0
        
        # Visits by device
        device_results = self.db.query(
            HubVisit.device_type, 
            func.count(HubVisit.id)
        ).filter(
            and_(HubVisit.hub_id == hub_id, HubVisit.visited_at >= cutoff)
        ).group_by(HubVisit.device_type).all()
        device_breakdown = {d or "unknown": c for d, c in device_results}
        
        # Top countries
        country_results = self.db.query(
            HubVisit.country, 
            func.count(HubVisit.id)
        ).filter(
            and_(
                HubVisit.hub_id == hub_id,
                HubVisit.visited_at >= cutoff,
                HubVisit.country.isnot(None)
            )
        ).group_by(HubVisit.country).order_by(
            func.count(HubVisit.id).desc()
        ).limit(10).all()
        country_breakdown = {c: cnt for c, cnt in country_results}
        
        return {
            "total_visits": total_visits,
            "total_clicks": total_clicks,
            "ctr": round((total_clicks / total_visits * 100), 2) if total_visits > 0 else 0,
            "device_breakdown": device_breakdown,
            "country_breakdown": country_breakdown,
            "period_days": days
        }
    
    def get_link_performance(
        self,
        hub_id: str,
        days: int = 30
    ) -> List[Dict[str, Any]]:
        """Get performance metrics for all links in a hub"""
        cutoff = datetime.utcnow() - timedelta(days=days)
        
        # Get all links
        links = self.db.query(Link).filter(Link.hub_id == hub_id).all()
        
        # Get total hub visits for CTR calculation
        total_visits = self.db.query(func.count(HubVisit.id)).filter(
            and_(HubVisit.hub_id == hub_id, HubVisit.visited_at >= cutoff)
        ).scalar() or 0
        
        performance = []
        for link in links:
            period_clicks = self.db.query(func.count(LinkClick.id)).filter(
                and_(
                    LinkClick.link_id == link.id,
                    LinkClick.clicked_at >= cutoff
                )
            ).scalar() or 0
            
            performance.append({
                "link_id": str(link.id),
                "title": link.title,
                "url": link.url,
                "total_clicks": link.click_count or 0,
                "period_clicks": period_clicks,
                "ctr": round((period_clicks / total_visits * 100), 2) if total_visits > 0 else 0
            })
        
        # Sort by clicks descending
        performance.sort(key=lambda x: x["period_clicks"], reverse=True)
        return performance
    
    def get_daily_stats(
        self,
        hub_id: str,
        days: int = 30
    ) -> List[Dict[str, Any]]:
        """Get daily visit and click counts"""
        cutoff = datetime.utcnow() - timedelta(days=days)
        
        # Daily visits
        visit_results = self.db.query(
            func.date(HubVisit.visited_at).label("date"),
            func.count(HubVisit.id).label("count")
        ).filter(
            and_(HubVisit.hub_id == hub_id, HubVisit.visited_at >= cutoff)
        ).group_by(func.date(HubVisit.visited_at)).all()
        daily_visits = {str(r.date): r.count for r in visit_results}
        
        # Daily clicks
        click_results = self.db.query(
            func.date(LinkClick.clicked_at).label("date"),
            func.count(LinkClick.id).label("count")
        ).filter(
            and_(LinkClick.hub_id == hub_id, LinkClick.clicked_at >= cutoff)
        ).group_by(func.date(LinkClick.clicked_at)).all()
        daily_clicks = {str(r.date): r.count for r in click_results}
        
        # Combine into single timeline
        all_dates = set(daily_visits.keys()) | set(daily_clicks.keys())
        stats = [
            {
                "date": date,
                "visits": daily_visits.get(date, 0),
                "clicks": daily_clicks.get(date, 0)
            }
            for date in sorted(all_dates)
        ]
        
        return stats
    
    def get_total_visits(self, hub_id: str) -> int:
        """Get total visit count for a hub (all time)"""
        return self.db.query(func.count(HubVisit.id)).filter(
            HubVisit.hub_id == hub_id
        ).scalar() or 0
