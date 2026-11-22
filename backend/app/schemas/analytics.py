"""
Operation Prahaar AI - Phase C Analytics Schemas
Pure synthetic and aggregate spatial crowd telemetry schemas.
Strictly non-identifying; zero facial recognition; zero person tracking.
"""

from typing import List, Dict, Optional
from pydantic import BaseModel, Field
from datetime import datetime


class ZoneMetrics(BaseModel):
    """Aggregate spatial metric snapshot for a specific facility zone."""
    zone_id: str = Field(..., example="ZONE-A")
    zone_name: str = Field(..., example="Main Concourse")
    capacity: int = Field(..., example=500)
    capacity_limit: int = Field(500, example=500)
    current_occupancy: int = Field(..., example=410)
    occupancy_ratio: float = Field(0.82, example=0.82)
    occupancy_pct: float = Field(..., example=82.0)
    flow_velocity_mps: float = Field(1.15, example=1.15)
    flow_rate_per_min: float = Field(..., example=24.5)
    velocity_index: float = Field(..., example=0.68)
    congestion_level: str = Field(..., example="ELEVATED")  # NOMINAL, MODERATE, CRITICAL / ELEVATED, SEVERE
    density_trend: str = Field("STABLE", example="RISING")  # STABLE, RISING, FALLING
    trend: str = Field(..., example="RISING")  # RISING, STABLE, FALLING, CRITICAL_SURGE
    uncertainty_score: float = Field(0.12, example=0.12)
    is_synthetic: bool = Field(True, description="Strict synthetic data marker")


class TrendPoint(BaseModel):
    """5-minute rolling window aggregate observation point."""
    timestamp: str = Field(..., example="2026-11-22T17:30:00Z")
    aggregate_occupancy_pct: float = Field(..., example=76.4)
    total_flow_inflow: float = Field(..., example=85.0)
    total_flow_outflow: float = Field(..., example=62.0)
    net_flow: float = Field(..., example=23.0)
    average_velocity_index: float = Field(..., example=0.72)
    zone_occupancy_pct: Dict[str, float] = Field(default_factory=dict)
    data_quality_score: float = Field(..., example=0.98)
    uncertainty_level: str = Field(..., example="LOW")  # LOW, MODERATE, HIGH
    is_synthetic: bool = Field(True, description="Strict synthetic data marker")


class AnalyticsTrendsResponse(BaseModel):
    """Time-series trend response over configured sliding window."""
    window_minutes: int
    point_interval_minutes: int
    total_points: int
    data_points: List[TrendPoint]
    is_synthetic: bool = Field(True, description="Strict synthetic data marker")
    generated_at: str
    disclaimer: str = (
        "[SYNTHETIC DEMO] All telemetry points represent simulated non-identifying aggregate "
        "spatial estimations for control room decision-support evaluation."
    )


class HotspotItem(BaseModel):
    """Ranked bottleneck / congestion hotspot item."""
    rank: int
    zone_id: str
    zone_name: str
    current_occupancy_pct: float
    peak_occupancy_pct: float
    incident_count: int
    bottleneck_severity: str  # NORMAL, MODERATE, ELEVATED, SEVERE
    recommended_action: str
    is_synthetic: bool = Field(True, description="Strict synthetic data marker")


class AnalyticsHotspotsResponse(BaseModel):
    """Ranked list of monitored zone hotspots."""
    hotspots: List[HotspotItem]
    total_monitored_zones: int
    is_synthetic: bool = Field(True, description="Strict synthetic data marker")
    generated_at: str


class AnalyticsSummaryResponse(BaseModel):
    """Executive KPI summary for control center dashboard."""
    overall_network_occupancy_pct: float
    system_density_ratio: float = Field(0.54, example=0.54)
    critical_zones_count: int = Field(0, example=1)
    total_monitored_zones: int = Field(4, example=4)
    active_zones_monitored: int
    avg_flow_velocity_mps: float = Field(1.15, example=1.15)
    active_surge_alerts: int = Field(0, example=2)
    highest_density_zone: str
    flow_status: str  # OPTIMAL, MODERATE_CONGESTION, SURGE_WARNING
    data_quality_score: float
    uncertainty_rating: str
    total_synthetic_events_processed: int
    zones: List[ZoneMetrics] = Field(default_factory=list)
    is_synthetic: bool = Field(True, description="Strict synthetic data marker")
    generated_at: str
    disclaimer: str = (
        "[SYNTHETIC DEMO] Strictly aggregate spatial indicators. No individual tracking or profiling."
    )


class SyntheticIncidentRequest(BaseModel):
    """Request to evaluate or manually trigger a synthetic demonstration incident."""
    zone_id: Optional[str] = Field(None, example="ZONE-A")
    severity: Optional[str] = Field("HIGH", example="HIGH")
    custom_note: Optional[str] = Field(None, example="Manual Educational Demonstration")
    force: Optional[bool] = Field(True, example=True)


class SyntheticIncidentResponse(BaseModel):
    """Response returned upon synthetic incident & alert generation."""
    success: bool = True
    message: str
    zone_id: str
    zone_name: str
    occupancy_pct: float
    event_id: str
    incident_id: str
    incident_code: str
    alert_id: str
    alert_code: str
    review_status: str
    severity: str = "HIGH"
    deduplicated: bool = False
    is_synthetic: bool = True
    timestamp: str
