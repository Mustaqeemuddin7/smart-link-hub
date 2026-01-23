"""
Smart Link Hub - Analytics Schemas
"""
from datetime import datetime, date
from typing import Optional, List, Dict, Any
from pydantic import BaseModel, Field
from uuid import UUID


class TrackVisitRequest(BaseModel):
    """Request body for tracking a visit (optional - can use headers)"""
    referrer: Optional[str] = None


class TrackClickRequest(BaseModel):
    """Request body for tracking a click"""
    referrer: Optional[str] = None


class AnalyticsSummary(BaseModel):
    """Summary analytics for a hub"""
    total_visits: int
    total_clicks: int
    ctr: float = Field(..., description="Click-through rate as percentage")
    device_breakdown: Dict[str, int]
    country_breakdown: Dict[str, int]
    period_days: int


class LinkPerformance(BaseModel):
    """Performance metrics for a single link"""
    link_id: str
    title: str
    url: str
    total_clicks: int
    period_clicks: int
    ctr: float


class LinkPerformanceList(BaseModel):
    """List of link performance metrics"""
    links: List[LinkPerformance]
    hub_total_visits: int


class DailyStats(BaseModel):
    """Daily statistics"""
    date: str
    visits: int
    clicks: int


class DailyStatsResponse(BaseModel):
    """Response containing daily stats"""
    stats: List[DailyStats]
    period_days: int


class TopLinksResponse(BaseModel):
    """Top performing and least performing links"""
    top_links: List[LinkPerformance]
    bottom_links: List[LinkPerformance]
    
    
class AnalyticsExportRequest(BaseModel):
    """Request for exporting analytics"""
    start_date: Optional[date] = None
    end_date: Optional[date] = None
    format: str = Field(default="csv", pattern="^(csv|json)$")
