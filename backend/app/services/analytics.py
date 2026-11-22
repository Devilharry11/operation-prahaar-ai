"""
Operation Prahaar AI - Phase C Aggregate Spatial Analytics Service
Calculates 5-minute rolling window aggregate crowd density, optical flow velocity,
and bottleneck indicators across fictional transit facility zones.
Strictly non-identifying; zero facial recognition; zero person tracking.
"""

from typing import List, Dict, Optional, Tuple
from datetime import datetime, timezone, timedelta
import math
import uuid
import json
from sqlalchemy.orm import Session
from backend.app.models.entities import CameraEvent, Incident, Alert, Camera, Evidence, AuditLog
from backend.app.models.enums import SeverityLevel, ReviewStatus, IncidentStatus, UncertaintyLevel, EvidenceType
from backend.app.services.audit_chain import AuditChainService
from backend.app.core.datetime_util import utc_now
from backend.app.schemas.analytics import (
    ZoneMetrics,
    TrendPoint,
    AnalyticsTrendsResponse,
    HotspotItem,
    AnalyticsHotspotsResponse,
    AnalyticsSummaryResponse,
    SyntheticIncidentResponse,
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
        flow_velocity = round(velocity_index * 1.5, 2)

        return ZoneMetrics(
            zone_id=zone_id,
            zone_name=zone_def["name"],
            capacity=capacity,
            capacity_limit=capacity,
            current_occupancy=current_occupancy,
            occupancy_ratio=round(density_ratio, 2),
            occupancy_pct=occupancy_pct,
            flow_velocity_mps=flow_velocity,
            flow_rate_per_min=flow_rate,
            velocity_index=velocity_index,
            congestion_level=congestion_level,
            density_trend=trend,
            trend=trend,
            uncertainty_score=0.12,
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
    def trigger_synthetic_incident(
        db: Session,
        zone_id: Optional[str] = None,
        severity: str = "HIGH",
        custom_note: Optional[str] = None,
        operator_badge: str = "DEMO_CONTROLLER",
        force: bool = True,
    ) -> Optional[SyntheticIncidentResponse]:
        """
        Generates or evaluates a synthetic threshold-exceeded incident and alert.
        Connects spatial aggregate analytics directly to the incident, alert,
        event, and cryptographic audit ledger pipeline.
        Strictly non-identifying; zero facial recognition; mandatory UNVERIFIED initial status.
        """
        target_zone = zone_id if (zone_id and zone_id in FICTIONAL_ZONES) else "ZONE-A"
        zone_def = FICTIONAL_ZONES[target_zone]

        zm = AnalyticsService.get_zone_metrics(db, target_zone)
        if not zm:
            return None

        cam_code = zone_def["camera_code"]
        camera = db.query(Camera).filter(Camera.camera_code == cam_code).first()
        if not camera:
            camera = db.query(Camera).first()
        if not camera:
            return None

        now = utc_now()

        # Deduplication check: prevent duplicate alerts for the same unchanged condition
        if not force:
            fifteen_mins_ago = now - timedelta(minutes=15)
            existing_active = (
                db.query(Alert)
                .join(Incident, Alert.incident_id == Incident.id)
                .filter(
                    Alert.camera_id == camera.id,
                    Alert.review_status.in_(["UNVERIFIED", "NEW"]),
                    Alert.created_at >= fifteen_mins_ago,
                )
                .first()
            )
            if existing_active:
                inc = existing_active.incident
                return SyntheticIncidentResponse(
                    success=True,
                    message=f"Deduplicated: An active {existing_active.review_status} alert already exists for {target_zone} within the 15-minute window.",
                    zone_id=target_zone,
                    zone_name=zm.zone_name,
                    occupancy_pct=zm.occupancy_pct,
                    event_id=existing_active.id,
                    incident_id=inc.id if inc else "N/A",
                    incident_code=inc.incident_code if inc else "N/A",
                    alert_id=existing_active.id,
                    alert_code=existing_active.alert_code,
                    review_status=existing_active.review_status,
                    severity=existing_active.severity,
                    deduplicated=True,
                    is_synthetic=True,
                    timestamp=existing_active.created_at.isoformat(),
                )

        timestamp_suffix = now.strftime("%H%M%S")
        unique_suffix = str(uuid.uuid4())[:4].upper()
        inc_code = f"DEMO-INC-{timestamp_suffix}-{unique_suffix}"
        alt_code = f"DEMO-ALT-{timestamp_suffix}-{unique_suffix}"

        # 1. Create CameraEvent
        event = CameraEvent(
            camera_id=camera.id,
            edge_device_id=camera.edge_device_id,
            event_type="HIGH_CROWD_CONGESTION",
            severity=severity or SeverityLevel.HIGH.value,
            crowd_density_score=zm.occupancy_ratio,
            motion_energy=zm.flow_rate_per_min,
            bounding_boxes_json=json.dumps([
                {"x": 100, "y": 120, "w": 50, "h": 80},
                {"x": 220, "y": 130, "w": 45, "h": 75}
            ]),
            metadata_json=json.dumps({
                "is_synthetic_demo": True,
                "zone_id": target_zone,
                "zone_name": zm.zone_name,
                "occupancy_pct": zm.occupancy_pct,
                "threshold": 75.0,
                "custom_note": custom_note or "Synthetic Demonstration Alert",
                "generated_at": now.isoformat(),
            }),
            timestamp=now,
        )
        db.add(event)
        db.flush()

        # 2. Create Incident (Status: NEW -> Appears in Tier 1 Governance Queue!)
        incident = Incident(
            incident_code=inc_code,
            title=f"[SYNTHETIC DEMO] Zone {target_zone} Density Surge ({int(zm.occupancy_pct)}%)",
            description=(
                f"Synthetic Demonstration Event: Aggregate spatial crowd density reached {int(zm.occupancy_pct)}%, "
                f"exceeding the configured 75% public safety threshold in {zm.zone_name}."
            ),
            status=IncidentStatus.NEW.value,
            priority=severity or SeverityLevel.HIGH.value,
            confidence_score=0.92,
            uncertainty_level=UncertaintyLevel.LOW.value,
            explanation=(
                f"Spatial occupancy ratio {zm.occupancy_ratio:.2f} exceeded safety baseline 0.75 across {zm.zone_name}. "
                f"Optical flow velocity decelerated to {zm.flow_velocity_mps:.2f} m/s indicating corridor bottleneck."
            ),
            triggered_rule="DEMO_OCCUPANCY_THRESHOLD_RULE",
            location_id=camera.location_id,
            created_at=now,
            updated_at=now,
        )
        db.add(incident)
        db.flush()

        # 3. Create Alert (Status: strictly UNVERIFIED per Responsible AI rules)
        alert = Alert(
            alert_code=alt_code,
            incident_id=incident.id,
            camera_id=camera.id,
            alert_type="SYNTHETIC_DEMO_ALERT",
            severity=severity or SeverityLevel.HIGH.value,
            title=f"[DEMO] High Crowd Density Warning - {zm.zone_name}",
            summary=(
                f"Synthetic Event: Estimated occupancy reached {int(zm.occupancy_pct)}% at {zm.zone_name}. "
                f"Awaiting mandatory human operator verification before escalation."
            ),
            review_status=ReviewStatus.UNVERIFIED.value,
            is_actionable=True,
            created_at=now,
        )
        db.add(alert)
        db.flush()

        # 4. Create Evidence
        evidence = Evidence(
            incident_id=incident.id,
            camera_event_id=event.id,
            evidence_type=EvidenceType.TELEMETRY_LOG.value,
            data_payload_json=json.dumps({
                "synthetic_demo": True,
                "zone_id": target_zone,
                "density": zm.occupancy_ratio,
                "flow_velocity_mps": zm.flow_velocity_mps,
                "threshold": 75.0,
            }),
            hash_signature=str(uuid.uuid4()).replace("-", "")[:64],
            created_at=now,
        )
        db.add(evidence)

        # 5. Append to Cryptographic Audit Ledger (SHA-256 block chain linkage)
        AuditChainService.append_audit_log(
            db=db,
            event_type="DEMO_ALERT_GENERATED",
            actor_id=operator_badge,
            action_summary=(
                f"Synthetic Threshold Alert Generated by {operator_badge}: Zone {target_zone} ({int(zm.occupancy_pct)}% >= 75%) "
                f"-> Incident {inc_code} / Alert {alt_code} (UNVERIFIED)"
            ),
            record_reference=alt_code,
            after_state_json=json.dumps({
                "zone_id": target_zone,
                "incident_code": inc_code,
                "alert_code": alt_code,
                "review_status": "UNVERIFIED",
                "density": zm.occupancy_ratio,
            }),
            created_at=now,
        )

        db.commit()

        return SyntheticIncidentResponse(
            success=True,
            message=f"Successfully generated synthetic incident for {zm.zone_name} ({int(zm.occupancy_pct)}% occupancy).",
            zone_id=target_zone,
            zone_name=zm.zone_name,
            occupancy_pct=zm.occupancy_pct,
            event_id=event.id,
            incident_id=incident.id,
            incident_code=inc_code,
            alert_id=alert.id,
            alert_code=alt_code,
            review_status=ReviewStatus.UNVERIFIED.value,
            severity=severity or SeverityLevel.HIGH.value,
            deduplicated=False,
            is_synthetic=True,
            timestamp=now.isoformat(),
        )

    @staticmethod
    def get_summary(db: Session) -> AnalyticsSummaryResponse:
        """Return high-level operational overview across all zones and evaluate thresholds."""
        now = datetime.now(timezone.utc)
        total_occ = 0
        total_cap = 0
        peak_zone = "ZONE-A"
        highest_pct = -1.0
        zones: List[ZoneMetrics] = []
        critical_count = 0

        for z_key in FICTIONAL_ZONES:
            zm = AnalyticsService.get_zone_metrics(db, z_key, ref_time=now)
            if zm:
                zones.append(zm)
                total_occ += zm.current_occupancy
                total_cap += zm.capacity
                if zm.occupancy_pct >= 75.0:
                    critical_count += 1
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
        active_alerts = db.query(Alert).filter(Alert.review_status == "UNVERIFIED").count()
        avg_flow = round(sum(z.flow_velocity_mps for z in zones) / max(1, len(zones)), 2)
        system_density_ratio = round(_safe_div(total_occ, max(1, total_cap)), 2)

        # Connect synthetic threshold evaluation to backend alert pipeline (Deduplicated, force=False)
        try:
            for z in zones:
                if z.occupancy_pct >= 75.0:
                    AnalyticsService.trigger_synthetic_incident(
                        db=db,
                        zone_id=z.zone_id,
                        operator_badge="SYSTEM_ANALYTICS",
                        force=False,
                    )
        except Exception:
            pass

        return AnalyticsSummaryResponse(
            overall_network_occupancy_pct=overall_pct,
            system_density_ratio=system_density_ratio,
            critical_zones_count=critical_count,
            total_monitored_zones=len(FICTIONAL_ZONES),
            active_zones_monitored=len(FICTIONAL_ZONES),
            avg_flow_velocity_mps=avg_flow,
            active_surge_alerts=active_alerts,
            highest_density_zone=peak_zone,
            flow_status=flow_status,
            data_quality_score=0.98,
            uncertainty_rating=uncertainty,
            total_synthetic_events_processed=total_events,
            zones=zones,
            is_synthetic=True,
            generated_at=now.isoformat(),
        )
