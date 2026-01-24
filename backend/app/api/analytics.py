"""
Smart Link Hub - Analytics API Routes
Analytics data retrieval for dashboard
"""
from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.user import User
from app.models.hub import Hub
from app.schemas.analytics import (
    AnalyticsSummary, LinkPerformanceList, DailyStatsResponse, TopLinksResponse
)
from app.services.analytics_service import AnalyticsService
from app.api.deps import get_current_user, rate_limit_check

router = APIRouter(prefix="/analytics", tags=["Analytics"], dependencies=[Depends(rate_limit_check)])


def verify_hub_ownership(hub_id: UUID, user_id: UUID, db: Session) -> Hub:
    """Verify user owns the hub"""
    hub = db.query(Hub).filter(Hub.id == hub_id, Hub.user_id == user_id).first()
    if not hub:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Hub not found"
        )
    return hub


@router.get("/hubs/{hub_id}", response_model=AnalyticsSummary)
async def get_hub_analytics(
    hub_id: UUID,
    days: int = Query(30, ge=1, le=365),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get analytics summary for a hub
    
    Returns:
    - Total visits and clicks
    - Click-through rate (CTR)
    - Device breakdown (mobile/tablet/desktop)
    - Top countries by visits
    """
    verify_hub_ownership(hub_id, current_user.id, db)
    
    analytics = AnalyticsService(db)
    data = analytics.get_hub_analytics(str(hub_id), days)
    
    return AnalyticsSummary(**data)


@router.get("/hubs/{hub_id}/links", response_model=LinkPerformanceList)
async def get_link_performance(
    hub_id: UUID,
    days: int = Query(30, ge=1, le=365),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get performance metrics for all links in a hub
    
    Returns click counts and CTR for each link, sorted by performance.
    """
    hub = verify_hub_ownership(hub_id, current_user.id, db)
    
    analytics = AnalyticsService(db)
    links = analytics.get_link_performance(str(hub_id), days)
    total_visits = analytics.get_total_visits(str(hub_id))
    
    return LinkPerformanceList(
        links=links,
        hub_total_visits=total_visits
    )


@router.get("/hubs/{hub_id}/daily", response_model=DailyStatsResponse)
async def get_daily_stats(
    hub_id: UUID,
    days: int = Query(30, ge=1, le=365),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get daily visit and click statistics
    
    Returns time series data for charting.
    """
    verify_hub_ownership(hub_id, current_user.id, db)
    
    analytics = AnalyticsService(db)
    stats = analytics.get_daily_stats(str(hub_id), days)
    
    return DailyStatsResponse(
        stats=stats,
        period_days=days
    )


@router.get("/hubs/{hub_id}/top-links", response_model=TopLinksResponse)
async def get_top_and_bottom_links(
    hub_id: UUID,
    days: int = Query(30, ge=1, le=365),
    limit: int = Query(5, ge=1, le=20),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get top performing and least performing links
    
    Useful for identifying high and low performers.
    """
    verify_hub_ownership(hub_id, current_user.id, db)
    
    analytics = AnalyticsService(db)
    all_links = analytics.get_link_performance(str(hub_id), days)
    
    # Split into top and bottom performers
    top_links = all_links[:limit]
    bottom_links = list(reversed(all_links[-limit:])) if len(all_links) > limit else []
    
    return TopLinksResponse(
        top_links=top_links,
        bottom_links=bottom_links
    )


@router.get("/hubs/{hub_id}/export/csv")
async def export_analytics_csv(
    hub_id: UUID,
    days: int = Query(30, ge=1, le=365),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Export analytics data as CSV file.
    
    Includes summary statistics, device breakdown, link performance, and daily stats.
    """
    from fastapi.responses import Response
    from datetime import datetime, timedelta
    from app.services.export_service import generate_csv_report
    
    hub = verify_hub_ownership(hub_id, current_user.id, db)
    
    analytics = AnalyticsService(db)
    
    # Gather all data
    analytics_data = analytics.get_hub_analytics(str(hub_id), days)
    link_performance = analytics.get_link_performance(str(hub_id), days)
    daily_stats = analytics.get_daily_stats(str(hub_id), days)
    
    end_date = datetime.utcnow()
    start_date = end_date - timedelta(days=days)
    
    csv_bytes = generate_csv_report(
        hub_title=hub.title,
        hub_slug=hub.slug,
        analytics_data=analytics_data,
        link_performance=link_performance,
        daily_stats=daily_stats,
        start_date=start_date,
        end_date=end_date
    )
    
    filename = f"{hub.slug}-analytics-{end_date.strftime('%Y%m%d')}.csv"
    
    return Response(
        content=csv_bytes,
        media_type="text/csv",
        headers={
            "Content-Disposition": f'attachment; filename="{filename}"'
        }
    )


@router.get("/hubs/{hub_id}/export/pdf")
async def export_analytics_pdf(
    hub_id: UUID,
    days: int = Query(30, ge=1, le=365),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Export analytics data as PDF report.
    
    Professional styled report with summary, charts data, and link performance tables.
    """
    from fastapi.responses import Response
    from datetime import datetime, timedelta
    from app.services.export_service import generate_pdf_report
    
    hub = verify_hub_ownership(hub_id, current_user.id, db)
    
    analytics = AnalyticsService(db)
    
    # Gather all data
    analytics_data = analytics.get_hub_analytics(str(hub_id), days)
    link_performance = analytics.get_link_performance(str(hub_id), days)
    daily_stats = analytics.get_daily_stats(str(hub_id), days)
    
    end_date = datetime.utcnow()
    start_date = end_date - timedelta(days=days)
    
    pdf_bytes = generate_pdf_report(
        hub_title=hub.title,
        hub_slug=hub.slug,
        analytics_data=analytics_data,
        link_performance=link_performance,
        daily_stats=daily_stats,
        start_date=start_date,
        end_date=end_date
    )
    
    filename = f"{hub.slug}-analytics-{end_date.strftime('%Y%m%d')}.pdf"
    
    return Response(
        content=pdf_bytes,
        media_type="application/pdf",
        headers={
            "Content-Disposition": f'attachment; filename="{filename}"'
        }
    )
