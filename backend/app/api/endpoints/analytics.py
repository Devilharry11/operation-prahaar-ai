"""
Operation Prahaar AI - Phase C Analytics API Endpoints
Serves aggregate spatial crowd telemetry and bottleneck indicators.
Strictly non-identifying; zero facial recognition; zero person tracking.
"""

from typing import List, Optional
from fastapi import APIRouter, Depends, Query, status, HTTPException
from sqlalchemy.orm import Session
from backend.app.db.session import get_db
from backend.app.core.auth import get_current_operator
from backend.app.models.entities import User
from backend.app.services.analytics import AnalyticsService, FICTIONAL_ZONES
from backend.app.schemas.analytics import (
    ZoneMetrics,
    AnalyticsTrendsResponse,
    AnalyticsHotspotsResponse,
    AnalyticsSummaryResponse,
    SyntheticIncidentRequest,
    SyntheticIncidentResponse,
)

router = APIRouter(prefix="/analytics", tags=["Aggregate Spatial Analytics"])


@router.get("/zones", response_model=List[ZoneMetrics])
def get_monitored_zones(db: Session = Depends(get_db)):
    """Retrieve real-time synthetic metrics across all monitored transit zones."""
    zones = []
    for z_key in FICTIONAL_ZONES:
        zm = AnalyticsService.get_zone_metrics(db, z_key)
        if zm:
            zones.append(zm)
    return zones


@router.post("/generate-incident", response_model=SyntheticIncidentResponse, status_code=status.HTTP_201_CREATED)
def generate_synthetic_incident(
    payload: Optional[SyntheticIncidentRequest] = None,
    current_user: User = Depends(get_current_operator),
    db: Session = Depends(get_db),
):
    """
    Manually triggers a synthetic threshold-exceeded incident for educational demonstration.
    Saves event, incident (status: NEW), and alert (status: UNVERIFIED) to SQLite,
    and commits a new block to the cryptographic audit ledger.
    """
    zone_id = payload.zone_id if payload else None
    severity = payload.severity if (payload and payload.severity) else "HIGH"
    custom_note = payload.custom_note if payload else None
    badge = current_user.badge_number if current_user else "DEMO_OPERATOR"

    force = payload.force if (payload and payload.force is not None) else True

    res = AnalyticsService.trigger_synthetic_incident(
        db=db,
        zone_id=zone_id,
        severity=severity,
        custom_note=custom_note,
        operator_badge=badge,
        force=force,
    )
    if not res:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Unable to generate synthetic incident. Verify cameras and locations are seeded."
        )
    return res


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
