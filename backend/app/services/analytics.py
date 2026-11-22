"""
Operation Prahaar AI - Phase C Aggregate Spatial Analytics Service
Calculates 5-minute rolling window aggregate crowd density, optical flow velocity,
and bottleneck indicators across fictional transit facility zones.
Strictly non-identifying; zero facial recognition; zero person tracking.
"""

from typing import List, Dict, Optional, Tuple
from datetime import datetime, timezone, timedelta
import math
from sqlalchemy.orm import Session
from backend.app.models.entities import CameraEvent, Incident, Alert, Camera
from backend.app.schemas.analytics import (
    ZoneMetrics,
    TrendPoint,
    AnalyticsTrendsResponse,
    HotspotItem,
    AnalyticsHotspotsResponse,
    AnalyticsSummaryResponse,
)

# -----------------------------------------------------------------------------
# Fictional Demonstration Zones Specification
# -----------------------------------------------------------------------------
FICTIONAL_ZONES: Dict[str, Dict] = {
    "ZONE-A": {
        "id": "ZONE-A",
        "name": "Main Concourse",
        "capacity": 500,
        "base_density": 0.68,
        "variance": 0.18,
        "camera_code": "CAM-NDLS-CONCOURSE-01",
    },
    "ZONE-B": {
        "id": "ZONE-B",
        "name": "Entry Hall",
        "capacity": 300,
        "base_density": 0.54,
        "variance": 0.15,
        "camera_code": "CAM-RF-PERIMETER-02",
    },
    "ZONE-C": {
        "id": "ZONE-C",
        "name": "Waiting Area",
        "capacity": 400,
        "base_density": 0.45,
        "variance": 0.12,
        "camera_code": "CAM-NDLS-CONCOURSE-01",
    },
    "ZONE-D": {
        "id": "ZONE-D",
        "name": "Exit Corridor",
        "capacity": 250,
        "base_density": 0.38,
        "variance": 0.14,
        "camera_code": "CAM-RF-PERIMETER-02",
    },
}


def _safe_div(num: float, den: float, default: float = 0.0) -> float:
    """Safe division preventing ZeroDivisionError."""
    if den == 0.0 or math.isnan(den) or math.isnan(num):
        return default
    return num / den


def _classify_congestion(occupancy_pct: float) -> Tuple[str, str]:
    """Classify congestion level and general trend from occupancy percentage."""
    if occupancy_pct >= 85.0:
        return "SEVERE", "CRITICAL_SURGE"
    elif occupancy_pct >= 75.0:
        return "ELEVATED", "RISING"
    elif occupancy_pct >= 55.0:
        return "MODERATE", "STABLE"
    else:
        return "NORMAL", "FALLING"


def _deterministic_wave(timestamp: datetime, period_minutes: float = 45.0, phase_shift: float = 0.0) -> float:
    """Deterministic, smooth sine oscillation for synthetic demonstration curves."""
    epoch_seconds = timestamp.timestamp()
    radians = (2.0 * math.pi * epoch_seconds / (period_minutes * 60.0)) + phase_shift
    return math.sin(radians)


class AnalyticsService:
    """Core aggregate spatial crowd analytics engine."""

    @staticmethod
    def get_zone_metrics(db: Session, zone_id: str, ref_time: Optional[datetime] = None) -> Optional[ZoneMetrics]:
        """Compute synthetic metric snapshot for a given zone."""
        if zone_id not in FICTIONAL_ZONES:
            return None

        zone_def = FICTIONAL_ZONES[zone_id]
        capacity = max(1, zone_def["capacity"])
        now = ref_time or datetime.now(timezone.utc)

        # Factor in actual database demo events for zone if available
        cam_code = zone_def["camera_code"]
        db_events_count = (
            db.query(CameraEvent)
            .join(Camera, CameraEvent.camera_id == Camera.id)
            .filter(Camera.camera_code == cam_code)
            .count()
        )

        # Deterministic simulation wave modulated by existing database records
        wave = _deterministic_wave(now, period_minutes=30.0, phase_shift=float(ord(zone_id[-1])))
        density_ratio = min(0.96, max(0.20, zone_def["base_density"] + (wave * zone_def["variance"])))

        # If there are active demo incidents, boost peak zone density
        recent_demo_incidents = (
            db.query(Incident)
            .filter(Incident.incident_code.like("DEMO-INC-%"), Incident.status.in_(["NEW", "UNVERIFIED"]))
            .count()
        )
        if zone_id == "ZONE-A" and recent_demo_incidents > 0:
            density_ratio = min(0.92, density_ratio + 0.12)

        current_occupancy = int(round(capacity * density_ratio))
        occupancy_pct = round(_safe_div(current_occupancy, capacity) * 100.0, 1)

        congestion_level, trend = _classify_congestion(occupancy_pct)
        flow_rate = round(max(5.0, (1.0 - density_ratio) * 45.0 + (wave * 8.0)), 1)
        velocity_index = round(max(0.15, min(0.95, 1.0 - (density_ratio * 0.7))), 2)

        return ZoneMetrics(
            zone_id=zone_id,
            zone_name=zone_def["name"],
            capacity=capacity,
            current_occupancy=current_occupancy,
            occupancy_pct=occupancy_pct,
            flow_rate_per_min=flow_rate,
            velocity_index=velocity_index,
            congestion_level=congestion_level,
            trend=trend,
            is_synthetic=True,
        )

    @staticmethod
    def get_trends(
        db: Session,
        window_minutes: int = 60,
        zone_id: Optional[str] = None,
        point_interval_minutes: int = 5,
    ) -> AnalyticsTrendsResponse:
        """
        Compute time-series aggregate trend points over a 5-minute rolling window.
        Guarantees zero-division safety and handles empty/sparse states safely.
        """
        # Clamp window parameters safely
        window_minutes = max(10, min(1440, window_minutes))
        point_interval_minutes = max(1, min(60, point_interval_minutes))

        now = datetime.now(timezone.utc)
        # Round current time to nearest 5 minutes for clean time-series
        minute_rem = now.minute % point_interval_minutes
        aligned_end = now - timedelta(minutes=minute_rem, seconds=now.second, microseconds=now.microsecond)

        num_points = window_minutes // point_interval_minutes
        data_points: List[TrendPoint] = []

        total_demo_events = db.query(CameraEvent).count()

        for i in range(num_points, -1, -1):
            t_slice = aligned_end - timedelta(minutes=i * point_interval_minutes)
            iso_time = t_slice.isoformat()

            # Calculate individual zone percentages for this slice
            zone_occupancies: Dict[str, float] = {}
            filtered_zones = [zone_id] if (zone_id and zone_id in FICTIONAL_ZONES) else list(FICTIONAL_ZONES.keys())

            total_occ = 0
            total_cap = 0

            for z_key in filtered_zones:
                zm = AnalyticsService.get_zone_metrics(db, z_key, ref_time=t_slice)
                if zm:
                    zone_occupancies[z_key] = zm.occupancy_pct
                    total_occ += zm.current_occupancy
                    total_cap += zm.capacity

            aggregate_pct = round(_safe_div(total_occ, max(1, total_cap)) * 100.0, 1)

            # Inflow / Outflow estimation
            wave_in = _deterministic_wave(t_slice, period_minutes=25.0)
            wave_out = _deterministic_wave(t_slice, period_minutes=35.0, phase_shift=1.2)
            inflow = round(max(10.0, 60.0 + (wave_in * 25.0)), 1)
            outflow = round(max(8.0, 52.0 + (wave_out * 20.0)), 1)
            net_flow = round(inflow - outflow, 1)

            velocity = round(max(0.20, min(0.95, 0.90 - (aggregate_pct / 130.0))), 2)
            uncertainty = "LOW" if aggregate_pct < 80.0 else ("MODERATE" if aggregate_pct < 90.0 else "HIGH")
            quality = round(max(0.92, min(0.99, 0.98 - (0.01 * (i % 3)))), 2)

            data_points.append(
                TrendPoint(
                    timestamp=iso_time,
                    aggregate_occupancy_pct=aggregate_pct,
                    total_flow_inflow=inflow,
                    total_flow_outflow=outflow,
                    net_flow=net_flow,
                    average_velocity_index=velocity,
                    zone_occupancy_pct=zone_occupancies,
                    data_quality_score=quality,
                    uncertainty_level=uncertainty,
                    is_synthetic=True,
                )
            )

        return AnalyticsTrendsResponse(
            window_minutes=window_minutes,
            point_interval_minutes=point_interval_minutes,
            total_points=len(data_points),
            data_points=data_points,
            is_synthetic=True,
            generated_at=now.isoformat(),
        )

    @staticmethod
    def get_hotspots(db: Session, limit: int = 4) -> AnalyticsHotspotsResponse:
        """Return ranked congestion hotspots with recommended operational mitigation."""
        limit = max(1, min(len(FICTIONAL_ZONES), limit))
        now = datetime.now(timezone.utc)
        items: List[Tuple[ZoneMetrics, int]] = []

        for z_key in FICTIONAL_ZONES:
            zm = AnalyticsService.get_zone_metrics(db, z_key, ref_time=now)
            if not zm:
                continue
            # Count active demo incidents in that zone's camera
            cam_code = FICTIONAL_ZONES[z_key]["camera_code"]
            inc_count = (
                db.query(Incident)
                .join(Camera, Incident.location_id == Camera.location_id)
                .filter(Camera.camera_code == cam_code, Incident.incident_code.like("DEMO-INC-%"))
                .count()
            )
            items.append((zm, inc_count))

        # Sort by occupancy descending
        items.sort(key=lambda x: x[0].occupancy_pct, reverse=True)

        hotspots: List[HotspotItem] = []
        for rank, (zm, inc_cnt) in enumerate(items[:limit], start=1):
            peak = round(min(98.0, zm.occupancy_pct + 6.5), 1)

            if zm.congestion_level == "SEVERE":
                rec = "Station Operator Advisory: Deploy concourse marshals to regulate ingress flow."
            elif zm.congestion_level == "ELEVATED":
                rec = "Heightened Monitoring: Prepare secondary stairwell gates for transit surge."
            elif zm.congestion_level == "MODERATE":
                rec = "Standard Flow: Monitor optical flow velocities for early bottleneck formation."
            else:
                rec = "Nominal Operation: Transit corridor within comfortable pedestrian capacity."

            hotspots.append(
                HotspotItem(
                    rank=rank,
                    zone_id=zm.zone_id,
                    zone_name=zm.zone_name,
                    current_occupancy_pct=zm.occupancy_pct,
                    peak_occupancy_pct=peak,
                    incident_count=inc_cnt,
                    bottleneck_severity=zm.congestion_level,
                    recommended_action=rec,
                    is_synthetic=True,
                )
            )

        return AnalyticsHotspotsResponse(
            hotspots=hotspots,
            total_monitored_zones=len(hotspots),
            is_synthetic=True,
            generated_at=now.isoformat(),
        )

    @staticmethod
    def get_summary(db: Session) -> AnalyticsSummaryResponse:
        """Return high-level operational overview across all zones."""
        now = datetime.now(timezone.utc)
        total_occ = 0
        total_cap = 0
        peak_zone = "ZONE-A"
        highest_pct = -1.0

        for z_key in FICTIONAL_ZONES:
            zm = AnalyticsService.get_zone_metrics(db, z_key, ref_time=now)
            if zm:
                total_occ += zm.current_occupancy
                total_cap += zm.capacity
                if zm.occupancy_pct > highest_pct:
                    highest_pct = zm.occupancy_pct
                    peak_zone = f"{zm.zone_id} ({zm.zone_name})"

        overall_pct = round(_safe_div(total_occ, max(1, total_cap)) * 100.0, 1)

        if overall_pct >= 80.0:
            flow_status = "SURGE_WARNING"
        elif overall_pct >= 65.0:
            flow_status = "MODERATE_CONGESTION"
        else:
            flow_status = "OPTIMAL"

        uncertainty = "LOW" if overall_pct < 75.0 else ("MODERATE" if overall_pct < 85.0 else "HIGH")
        total_events = db.query(CameraEvent).count()

        return AnalyticsSummaryResponse(
            overall_network_occupancy_pct=overall_pct,
            active_zones_monitored=len(FICTIONAL_ZONES),
            highest_density_zone=peak_zone,
            flow_status=flow_status,
            data_quality_score=0.98,
            uncertainty_rating=uncertainty,
            total_synthetic_events_processed=total_events,
            is_synthetic=True,
            generated_at=now.isoformat(),
        )
