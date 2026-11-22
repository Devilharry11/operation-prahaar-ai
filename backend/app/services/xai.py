"""
Operation Prahaar AI - Phase C Explainable AI (XAI) Service
Provides transparent, rule-based explainability for public safety decision support.
Strictly non-identifying; zero profiling; zero predictive policing; 100% reproducible.
"""

from typing import Dict, Any, List
from datetime import datetime, timezone
import json
from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from backend.app.models.entities import Incident, Evidence, CameraEvent, Alert
from backend.app.schemas.xai import IncidentExplainabilityResponse, ExplainabilityFactor


class XAIService:
    """Service generating transparent, reproducible heuristic explanations."""

    @staticmethod
    def explain_incident(db: Session, incident_id: str) -> IncidentExplainabilityResponse:
        """
        Generate a comprehensive, transparent explanation of an incident.
        Reproducible: evaluates the recorded parameters stored in the database.
        """
        incident = db.query(Incident).filter(Incident.id == incident_id).first()
        if not incident:
            # Fallback search by incident_code if user passed code
            incident = db.query(Incident).filter(Incident.incident_code == incident_id).first()

        if not incident:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Incident with identifier '{incident_id}' not found in the intelligence registry."
            )

        # Retrieve linked evidence telemetry if available
        evidence = db.query(Evidence).filter(Evidence.incident_id == incident.id).first()
        evidence_payload: Dict[str, Any] = {}
        if evidence and evidence.data_payload_json:
            try:
                evidence_payload = json.loads(evidence.data_payload_json)
            except Exception:
                evidence_payload = {}

        rule_name = incident.triggered_rule or "DEMO_OCCUPANCY_THRESHOLD_RULE"
        now_str = datetime.now(timezone.utc).isoformat()

        # Build rule-specific transparent explanations and factor weights
        if "OCCUPANCY" in rule_name or "AGGREGATE" in rule_name:
            indicator_name = "Aggregate Concourse Occupancy Surge"
            rule_desc = "Triggers when spatial pedestrian density ratio exceeds 0.75 for >= 20 seconds."
            density = evidence_payload.get("density", 0.88)
            motion = evidence_payload.get("motion", 64.0)

            factors = [
                ExplainabilityFactor(
                    factor_name="Spatial Area Saturation",
                    measured_value=f"{int(density * 100)}%",
                    threshold_value="75%",
                    contribution_weight=0.60,
                    evaluation_status="THRESHOLD_EXCEEDED" if density >= 0.75 else "NOMINAL",
                ),
                ExplainabilityFactor(
                    factor_name="Temporal Persistence Duration",
                    measured_value="35 seconds",
                    threshold_value="20 seconds",
                    contribution_weight=0.25,
                    evaluation_status="THRESHOLD_EXCEEDED",
                ),
                ExplainabilityFactor(
                    factor_name="Cluster Optical Flow Velocity",
                    measured_value=f"{motion:.1f} px/frame",
                    threshold_value="50.0 px/frame",
                    contribution_weight=0.15,
                    evaluation_status="ELEVATED",
                ),
            ]
            explanation_text = (
                f"The simulated aggregate spatial crowd occupancy reached {int(density * 100)}% "
                f"across the transit terminal concourse, exceeding the configured safety threshold of 75%. "
                f"Sustained motion energy of {motion:.1f} px/frame confirmed pedestrian surge following train arrival. "
                f"No individual identification was performed."
            )
            input_values = {
                "estimated_occupancy_ratio": density,
                "concourse_capacity": 500,
                "motion_energy_px": motion,
                "duration_seconds": 35,
                "sensor_frame_rate": 5,
            }
            data_quality = {
                "sample_rate_fps": 5,
                "frame_drop_ratio": 0.01,
                "telemetry_freshness_seconds": 1.2,
                "data_integrity_hash": evidence.hash_signature if evidence else "sha256_synthetic_verified",
            }

        elif "CONGESTION" in rule_name or "FLOW" in rule_name:
            indicator_name = "Pedestrian Ingress Bottleneck Stall"
            rule_desc = "Triggers when optical flow velocity drops by >= 40% while local density >= 0.70."
            density = evidence_payload.get("density", 0.79)
            motion = evidence_payload.get("motion", 48.0)

            factors = [
                ExplainabilityFactor(
                    factor_name="Flow Velocity Deceleration",
                    measured_value="-42% relative to baseline",
                    threshold_value="-40%",
                    contribution_weight=0.55,
                    evaluation_status="THRESHOLD_EXCEEDED",
                ),
                ExplainabilityFactor(
                    factor_name="Ingress Spatial Density",
                    measured_value=f"{int(density * 100)}%",
                    threshold_value="70%",
                    contribution_weight=0.35,
                    evaluation_status="THRESHOLD_EXCEEDED",
                ),
                ExplainabilityFactor(
                    factor_name="Exit Clearing Rate",
                    measured_value="Nominal",
                    threshold_value="Nominal",
                    contribution_weight=0.10,
                    evaluation_status="NOMINAL",
                ),
            ]
            explanation_text = (
                f"Pedestrian cluster velocity decreased by 42% while local density rose to {int(density * 100)}% "
                f"near the stairwell entrance. This indicates a simulated bottleneck stall where inflow "
                f"exceeds stairwell throughput capacity. Mandatory human verification required."
            )
            input_values = {
                "density_ratio": density,
                "optical_flow_velocity_drop_pct": 42.0,
                "stairwell_width_meters": 3.5,
                "motion_energy": motion,
            }
            data_quality = {
                "sample_rate_fps": 5,
                "frame_drop_ratio": 0.02,
                "telemetry_freshness_seconds": 0.8,
                "data_integrity_hash": evidence.hash_signature if evidence else "sha256_synthetic_verified",
            }

        elif "EDGE" in rule_name or "HEALTH" in rule_name or "LATENCY" in rule_name:
            indicator_name = "Edge Compute Frame Sampling Latency Spike"
            rule_desc = "Triggers when edge vision inference loop latency exceeds 200ms thermal budget."
            factors = [
                ExplainabilityFactor(
                    factor_name="Edge Processing Latency",
                    measured_value="245 ms",
                    threshold_value="200 ms",
                    contribution_weight=0.70,
                    evaluation_status="THRESHOLD_EXCEEDED",
                ),
                ExplainabilityFactor(
                    factor_name="Hardware Thermal Load",
                    measured_value="Normal (62°C)",
                    threshold_value="80°C",
                    contribution_weight=0.20,
                    evaluation_status="NOMINAL",
                ),
                ExplainabilityFactor(
                    factor_name="Frame Buffer Queue",
                    measured_value="2 frames pending",
                    threshold_value="4 frames",
                    contribution_weight=0.10,
                    evaluation_status="NOMINAL",
                ),
            ]
            explanation_text = (
                "Edge computer vision pipeline reported frame processing latency of 245ms, "
                "exceeding the standard 200ms real-time threshold. Automated self-healing downscale "
                "was initiated to prevent dropped frames."
            )
            input_values = {
                "measured_latency_ms": 245,
                "latency_budget_ms": 200,
                "edge_device_id": "EDGE-IND-DELHI-001",
                "cpu_utilization_pct": 24.5,
            }
            data_quality = {
                "sample_rate_fps": 5,
                "frame_drop_ratio": 0.03,
                "telemetry_freshness_seconds": 0.5,
                "data_integrity_hash": evidence.hash_signature if evidence else "sha256_synthetic_verified",
            }

        elif "CONNECTIVITY" in rule_name:
            indicator_name = "Edge Device Telemetry Interruption"
            rule_desc = "Triggers when edge appliance misses 3 consecutive telemetry heartbeats."
            factors = [
                ExplainabilityFactor(
                    factor_name="Missed Heartbeat Count",
                    measured_value="3 intervals",
                    threshold_value="3 intervals",
                    contribution_weight=0.85,
                    evaluation_status="THRESHOLD_EXCEEDED",
                ),
                ExplainabilityFactor(
                    factor_name="Local Cache Status",
                    measured_value="Buffering locally",
                    threshold_value="Offline safe",
                    contribution_weight=0.15,
                    evaluation_status="NOMINAL",
                ),
            ]
            explanation_text = (
                "Edge appliance EDGE-IND-DELHI-001 missed 3 consecutive heartbeat cycles. "
                "Local edge node buffering activated to preserve telemetry continuity."
            )
            input_values = {
                "missed_heartbeats": 3,
                "heartbeat_interval_sec": 5,
                "edge_appliance": "EDGE-IND-DELHI-001",
            }
            data_quality = {
                "sample_rate_fps": 0,
                "frame_drop_ratio": 0.0,
                "telemetry_freshness_seconds": 15.0,
                "data_integrity_hash": evidence.hash_signature if evidence else "sha256_synthetic_verified",
            }

        else:
            indicator_name = "Informational Public Safety Advisory Notice"
            rule_desc = "Synthesizes contextual public safety bulletin for heightened transit vigilance."
            factors = [
                ExplainabilityFactor(
                    factor_name="Advisory Readiness Level",
                    measured_value="Heightened Vigilance",
                    threshold_value="Standard",
                    contribution_weight=0.75,
                    evaluation_status="THRESHOLD_EXCEEDED",
                ),
                ExplainabilityFactor(
                    factor_name="Zone Scope",
                    measured_value="Northern Railways Terminal",
                    threshold_value="Designated Zone",
                    contribution_weight=0.25,
                    evaluation_status="NOMINAL",
                ),
            ]
            explanation_text = (
                incident.explanation or (
                    "Contextual public safety advisory notice active for heightened vigilance across "
                    "transit terminal concourses during scheduled peak hours."
                )
            )
            input_values = {
                "advisory_scope": "NORTHERN_RAILWAYS",
                "readiness_tier": "HEIGHTENED_VIGILANCE",
                "confidence_score": incident.confidence_score,
            }
            data_quality = {
                "sample_rate_fps": 5,
                "frame_drop_ratio": 0.0,
                "telemetry_freshness_seconds": 2.0,
                "data_integrity_hash": evidence.hash_signature if evidence else "sha256_synthetic_verified",
            }

        return IncidentExplainabilityResponse(
            incident_id=incident.id,
            incident_code=incident.incident_code,
            indicator_name=indicator_name,
            severity=incident.priority,
            confidence_score=incident.confidence_score,
            uncertainty_level=incident.uncertainty_level,
            input_values=input_values,
            applied_calculation_or_rule=rule_name,
            rule_description=rule_desc,
            explanation=explanation_text,
            contributing_factors=factors,
            data_quality=data_quality,
            synthetic_data_marker="[SYNTHETIC DEMO]",
            is_synthetic=True,
            generated_at=now_str,
        )
