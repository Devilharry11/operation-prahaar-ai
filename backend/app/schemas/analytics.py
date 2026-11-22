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
    current_occupancy: int = Field(..., example=410)
    occupancy_pct: float = Field(..., example=82.0)
    flow_rate_per_min: float = Field(..., example=24.5)
    velocity_index: float = Field(..., example=0.68)
    congestion_level: str = Field(..., example="ELEVATED")  # NORMAL, MODERATE, ELEVATED, SEVERE
    trend: str = Field(..., example="RISING")  # RISING, STABLE, FALLING, CRITICAL_SURGE
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
    active_zones_monitored: int
    highest_density_zone: str
    flow_status: str  # OPTIMAL, MODERATE_CONGESTION, SURGE_WARNING
    data_quality_score: float
    uncertainty_rating: str
    total_synthetic_events_processed: int
    is_synthetic: bool = Field(True, description="Strict synthetic data marker")
    generated_at: str
    disclaimer: str = (
        "[SYNTHETIC DEMO] Strictly aggregate spatial indicators. No individual tracking or profiling."
    )
