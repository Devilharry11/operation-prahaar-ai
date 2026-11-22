"""
Operation Prahaar AI - Phase C Analytics API Endpoints
Serves aggregate spatial crowd telemetry and bottleneck indicators.
Strictly non-identifying; zero facial recognition; zero person tracking.
"""

from typing import Optional
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from backend.app.db.session import get_db
from backend.app.services.analytics import AnalyticsService
from backend.app.schemas.analytics import (
    AnalyticsTrendsResponse,
    AnalyticsHotspotsResponse,
    AnalyticsSummaryResponse,
)

router = APIRouter(prefix="/analytics", tags=["Aggregate Spatial Analytics"])


@router.get("/trends", response_model=AnalyticsTrendsResponse)
def get_analytics_trends(
    window_minutes: int = Query(60, ge=10, le=1440, description="Rolling window lookback in minutes"),
    point_interval_minutes: int = Query(5, ge=1, le=60, description="Slice bucket interval in minutes"),
    zone_id: Optional[str] = Query(None, description="Optional fictional zone filter (ZONE-A, ZONE-B, ZONE-C, ZONE-D)"),
    db: Session = Depends(get_db),
):
    """Retrieve 5-minute rolling window aggregate occupancy and flow velocity trends."""
    return AnalyticsService.get_trends(
        db=db,
        window_minutes=window_minutes,
        zone_id=zone_id,
        point_interval_minutes=point_interval_minutes,
    )


@router.get("/hotspots", response_model=AnalyticsHotspotsResponse)
def get_analytics_hotspots(
    limit: int = Query(4, ge=1, le=10, description="Maximum number of hotspots to return"),
    db: Session = Depends(get_db),
):
    """Retrieve ranked transit zones ordered by spatial congestion ratio."""
    return AnalyticsService.get_hotspots(db=db, limit=limit)


@router.get("/summary", response_model=AnalyticsSummaryResponse)
def get_analytics_summary(db: Session = Depends(get_db)):
    """Retrieve executive summary of overall transit facility spatial occupancy."""
    return AnalyticsService.get_summary(db=db)
