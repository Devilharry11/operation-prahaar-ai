"""
Operation Prahaar AI - Synthetic Demo Controller Endpoints
Provides safe, non-identifying public-safety scenario generation for hackathon evaluations.
"""

from typing import List, Optional
import json
import uuid
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import text
from backend.app.db.session import get_db
from backend.app.core.datetime_util import utc_now
from backend.app.models.entities import (
    CameraEvent,
    Incident,
    Alert,
    Camera,
    EdgeDevice,
    Location,
    AuditLog,
    Evidence,
    HumanReview,
    Approval,
    User,
)
from backend.app.core.auth import get_current_operator, require_demo_reset_permission
from backend.app.services.audit_chain import AuditChainService
from backend.app.models.enums import (
    SeverityLevel,
    ReviewStatus,
    IncidentStatus,
    UncertaintyLevel,
    AuditAction,
    EvidenceType,
)
from backend.app.schemas.demo import (
    DemoScenarioType,
    DemoEventRequest,
    DemoBatchRequest,
    DemoEventResponse,
    DemoResetRequest,
    DemoResetResponse,
)

router = APIRouter(tags=["Synthetic Demo Controller"])


def _generate_single_demo_scenario(
    scenario: DemoScenarioType,
    db: Session,
    camera_id: Optional[str] = None,
    severity: Optional[str] = "HIGH",
    custom_note: Optional[str] = None,
    operator_badge: str = "DEMO_CONTROLLER",
) -> DemoEventResponse:
    # 1. Resolve camera and location
    camera = None
    if camera_id:
        camera = db.query(Camera).filter(Camera.id == camera_id).first()
    if not camera:
        camera = db.query(Camera).first()

    if not camera:
        raise HTTPException(
            status_code=400,
            detail="Cannot generate demo event: No registered cameras found in database. Run seed script first."
        )

    now = utc_now()
    timestamp_suffix = now.strftime("%H%M%S")
    unique_suffix = str(uuid.uuid4())[:4].upper()
    demo_inc_code = f"DEMO-INC-{timestamp_suffix}-{unique_suffix}"
    demo_alt_code = f"DEMO-ALT-{timestamp_suffix}-{unique_suffix}"

    # 2. Configure scenario-specific parameters
    if scenario == DemoScenarioType.AGGREGATE_OCCUPANCY_EXCEEDED:
        event_type = "HIGH_CROWD_CONGESTION"
        density = 0.88
        motion = 64.0
        inc_title = "[SYNTHETIC DEMO] Aggregate Occupancy Threshold Exceeded (88%)"
        inc_desc = (
            "Synthetic Demonstration Event: Simulated aggregate spatial crowd density ratio reached 0.88, "
            "exceeding the configured 0.75 threshold at transit terminal concourse."
        )
        explanation = (
            "Spatial occupancy density sustained >85% across designated pedestrian zones for 20+ seconds. "
            "Matched simulated public safety transit surge heuristic."
        )
        rule = "DEMO_OCCUPANCY_THRESHOLD_RULE"
        confidence = 0.92
        uncertainty = UncertaintyLevel.LOW.value
        alert_title = "[DEMO] High Crowd Density Warning"
        alert_summary = (
            "Synthetic Event: Estimated occupancy reached 88% at Platform Concourse. "
            "Awaiting mandatory human operator verification before escalation."
        )

    elif scenario == DemoScenarioType.SIMULATED_CONGESTION_ADVISORY:
        event_type = "HIGH_CROWD_CONGESTION"
        density = 0.79
        motion = 48.0
        inc_title = "[SYNTHETIC DEMO] Simulated Congestion Advisory - Footfall Bottleneck"
        inc_desc = (
            "Synthetic Demonstration Event: Elevated density ratio 0.79 detected near pedestrian stairwell ingress."
        )
        explanation = (
            "Cluster optical flow velocity decreased by 40% while density ratio climbed past 0.75 threshold. "
            "Simulated bottleneck formation."
        )
        rule = "DEMO_CONGESTION_FLOW_RULE"
        confidence = 0.85
        uncertainty = UncertaintyLevel.MODERATE.value
        alert_title = "[DEMO] Pedestrian Bottleneck Warning"
        alert_summary = (
            "Synthetic Event: Density 79% detected near stairwell entrance. "
            "Review required to distinguish normal transit influx from hazardous crowd stall."
        )

    elif scenario == DemoScenarioType.SYSTEM_HEALTH_WARNING:
        event_type = "ANOMALOUS_MOTION_SURGE"
        density = 0.42
        motion = 78.5
        inc_title = "[SYNTHETIC DEMO] Edge Node Frame Sampling Latency Spike"
        inc_desc = (
            "Synthetic Demonstration Event: Edge computer vision frame processing latency exceeded 200ms budget."
        )
        explanation = (
            "Virtual edge processing loop encountered a synthetic telemetry latency warning. "
            "Downscaled frame processing to maintain standard CPU thermal budget."
        )
        rule = "DEMO_EDGE_HEALTH_RULE"
        confidence = 0.98
        uncertainty = UncertaintyLevel.LOW.value
        alert_title = "[DEMO] Edge Processing Latency Warning"
        alert_summary = (
            "Synthetic Event: Edge Node EDGE-IND-DELHI-001 reported synthetic sampling latency spike. "
            "Self-healing downscale activated."
        )

    elif scenario == DemoScenarioType.EDGE_CONNECTIVITY_INTERRUPTION:
        event_type = "ANOMALOUS_MOTION_SURGE"
        density = 0.15
        motion = 12.0
        inc_title = "[SYNTHETIC DEMO] Edge Appliance Intermittent Heartbeat Alert"
        inc_desc = (
            "Synthetic Demonstration Event: Simulated edge device missed two consecutive telemetry heartbeats."
        )
        explanation = (
            "Local edge node missed scheduled heartbeat packet. Local edge vision pipeline continued "
            "recording to local buffer without cloud data loss."
        )
        rule = "DEMO_HEARTBEAT_DISCONNECT_RULE"
        confidence = 0.95
        uncertainty = UncertaintyLevel.LOW.value
        alert_title = "[DEMO] Edge Appliance Telemetry Drop"
        alert_summary = (
            "Synthetic Event: Missed heartbeats on virtual edge appliance. "
            "Local offline fallback verified operational."
        )

    else:  # INFORMATION_ADVISORY
        event_type = "HIGH_CROWD_CONGESTION"
        density = 0.58
        motion = 32.0
        inc_title = "[SYNTHETIC DEMO] Pre-Event Security Advisory General Notice"
        inc_desc = (
            "Synthetic Demonstration Event: Background advisory bulletin issued for festival transit vigilance."
        )
        explanation = (
            "Informational public safety notice linked to active location. No immediate physical density surge detected."
        )
        rule = "DEMO_INFO_BULLETIN_RULE"
        confidence = 0.88
        uncertainty = UncertaintyLevel.LOW.value
        alert_title = "[DEMO] Informational Safety Advisory Notice"
        alert_summary = (
            "Synthetic Event: General public safety notice active for Northern Railways. "
            "Operator review requested for heightened awareness."
        )

    # 3. Create CameraEvent
    event = CameraEvent(
        camera_id=camera.id,
        edge_device_id=camera.edge_device_id,
        event_type=event_type,
        severity=severity or SeverityLevel.HIGH.value,
        crowd_density_score=density,
        motion_energy=motion,
        bounding_boxes_json=json.dumps([{"x": 120, "y": 140, "w": 45, "h": 75}, {"x": 180, "y": 145, "w": 42, "h": 72}]),
        metadata_json=json.dumps({
            "is_synthetic_demo": True,
            "scenario": scenario.value,
            "custom_note": custom_note or "Hackathon Stage Demonstration Event",
            "generated_at": now.isoformat(),
        }),
        timestamp=now,
    )

    # 4. Create Incident (Status: NEW)
    incident = Incident(
        incident_code=demo_inc_code,
        title=inc_title,
        description=inc_desc,
        status=IncidentStatus.NEW.value,
        priority=severity or SeverityLevel.HIGH.value,
        confidence_score=confidence,
        uncertainty_level=uncertainty,
        explanation=explanation,
        triggered_rule=rule,
        location_id=camera.location_id,
        created_at=now,
        updated_at=now,
    )

    try:
        db.add(event)
        db.flush()

        incident.location_id = camera.location_id
        db.add(incident)
        db.flush()

        # 5. Create Alert (Status: strictly UNVERIFIED per Responsible AI rules)
        alert = Alert(
            alert_code=demo_alt_code,
            incident_id=incident.id,
            camera_id=camera.id,
            alert_type="SYNTHETIC_DEMO_ALERT",
            severity=severity or SeverityLevel.HIGH.value,
            title=alert_title,
            summary=alert_summary,
            review_status=ReviewStatus.UNVERIFIED.value,
            is_actionable=True,
            created_at=now,
        )
        db.add(alert)

        # 6. Create Evidence Record
        evidence = Evidence(
            incident_id=incident.id,
            camera_event_id=event.id,
            evidence_type=EvidenceType.TELEMETRY_LOG.value,
            data_payload_json=json.dumps({
                "synthetic_demo": True,
                "scenario": scenario.value,
                "density": density,
                "motion": motion,
            }),
            hash_signature=str(uuid.uuid4()).replace("-", "")[:64],
            created_at=now,
        )
        db.add(evidence)

        # 7. Append to Cryptographic Audit Ledger (SHA-256 block chain linkage)
        AuditChainService.append_audit_log(
            db=db,
            event_type="DEMO_EVENT_GENERATED",
            actor_id=operator_badge,
            action_summary=f"Synthetic Demo Scenario Generated by {operator_badge}: {scenario.value} -> Incident {demo_inc_code} (UNVERIFIED)",
            record_reference=demo_alt_code,
            after_state_json=json.dumps({
                "scenario": scenario.value,
                "incident_code": demo_inc_code,
                "alert_code": demo_alt_code,
                "review_status": "UNVERIFIED"
            }),
            created_at=now,
        )
        db.commit()

    except Exception as exc:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Database transaction failure persisting demo scenario: {str(exc)}"
        )

    return DemoEventResponse(
        success=True,
        message=f"Successfully generated synthetic demonstration event: {scenario.value}",
        scenario=scenario.value,
        event_id=event.id,
        incident_id=incident.id,
        incident_code=incident.incident_code,
        alert_id=alert.id,
        alert_code=alert.alert_code,
        review_status=ReviewStatus.UNVERIFIED.value,
        timestamp=now,
    )


@router.post("/generate", response_model=DemoEventResponse, status_code=status.HTTP_201_CREATED)
def generate_synthetic_demo_event(
    payload: DemoEventRequest,
    current_user: User = Depends(get_current_operator),
    db: Session = Depends(get_db),
):
    """
    Generates a single synthetic demonstration event and routes it through
    the intelligence engine, resulting in an UNVERIFIED alert awaiting human review.
    Requires verified operator credentials (X-Operator-Badge or Bearer token).
    """
    return _generate_single_demo_scenario(
        scenario=payload.scenario,
        db=db,
        camera_id=payload.camera_id,
        severity=payload.severity,
        custom_note=payload.custom_note,
        operator_badge=current_user.badge_number,
    )


@router.post("/generate-batch", response_model=List[DemoEventResponse], status_code=status.HTTP_201_CREATED)
def generate_synthetic_demo_batch(
    payload: DemoBatchRequest,
    current_user: User = Depends(get_current_operator),
    db: Session = Depends(get_db),
):
    """
    Generates a batch of distinct synthetic demonstration events (1 to 5)
    for interactive multi-incident hackathon demonstrations.
    Requires verified operator credentials.
    """
    all_scenarios = [
        DemoScenarioType.AGGREGATE_OCCUPANCY_EXCEEDED,
        DemoScenarioType.SIMULATED_CONGESTION_ADVISORY,
        DemoScenarioType.SYSTEM_HEALTH_WARNING,
        DemoScenarioType.EDGE_CONNECTIVITY_INTERRUPTION,
        DemoScenarioType.INFORMATION_ADVISORY,
    ]

    results = []
    for i in range(payload.count):
        scenario = all_scenarios[i % len(all_scenarios)]
        res = _generate_single_demo_scenario(
            scenario=scenario,
            db=db,
            camera_id=payload.camera_id,
            custom_note=f"Batch Generation #{i + 1}",
            operator_badge=current_user.badge_number,
        )
        results.append(res)
    return results


@router.get("/history", response_model=List[dict])
def get_synthetic_demo_history(
    limit: int = 20,
    current_user: User = Depends(get_current_operator),
    db: Session = Depends(get_db),
):
    """
    Retrieves history of synthetic demonstration incidents and their current human verification states.
    Requires verified operator credentials.
    """
    demo_incidents = (
        db.query(Incident)
        .filter(Incident.incident_code.like("DEMO-INC-%"))
        .order_by(Incident.created_at.desc())
        .limit(limit)
        .all()
    )

    history = []
    for inc in demo_incidents:
        alert = db.query(Alert).filter(Alert.incident_id == inc.id).first()
        history.append({
            "incident_id": inc.id,
            "incident_code": inc.incident_code,
            "title": inc.title,
            "status": inc.status,
            "alert_code": alert.alert_code if alert else "N/A",
            "review_status": alert.review_status if alert else "N/A",
            "confidence_score": inc.confidence_score,
            "created_at": inc.created_at.isoformat(),
        })
    return history


@router.post("/reset", response_model=DemoResetResponse)
def reset_synthetic_demo_data(
    payload: DemoResetRequest,
    current_user: User = Depends(require_demo_reset_permission),
    db: Session = Depends(get_db),
):
    """
    Safely resets records generated specifically by the Synthetic Demo Controller.
    Strictly preserves baseline seeded public safety data.
    Requires authorized operator role (CHIEF_CONTROLLER or COMMAND_OPERATOR).
    Guarantees atomic rollback and non-demo conflict preservation.
    """
    if not payload.confirm:
        raise HTTPException(
            status_code=400,
            detail="Reset aborted: Explicit confirmation flag (confirm=true) is required."
        )

    # 1. Identify Demo Incidents using code prefix AND synthetic trigger rule
    demo_incidents = (
        db.query(Incident)
        .filter(
            Incident.incident_code.like("DEMO-INC-%"),
            Incident.triggered_rule.like("DEMO_%"),
        )
        .all()
    )
    demo_incident_ids = [inc.id for inc in demo_incidents]

    # 2. Strict Conflict Check: Non-demo dependent records attached to demo incidents
    if demo_incident_ids:
        conflicting_alerts = (
            db.query(Alert)
            .filter(
                Alert.incident_id.in_(demo_incident_ids),
                (~Alert.alert_code.like("DEMO-ALT-%")) | (Alert.alert_type != "SYNTHETIC_DEMO_ALERT"),
            )
            .all()
        )
        if conflicting_alerts:
            conflict_codes = [a.alert_code for a in conflicting_alerts]
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail=(
                    f"Reset aborted: Non-demo alert(s) {conflict_codes} are attached to synthetic demo incidents. "
                    f"Operation cancelled to preserve baseline operational data integrity."
                ),
            )

        conflicting_approvals = db.query(Approval).filter(Approval.incident_id.in_(demo_incident_ids)).all()
        if conflicting_approvals:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="Reset aborted: Formal approval records are attached to demo incidents. Operation cancelled to preserve governance chain of custody.",
            )

    # 3. Identify Demo Alerts (strictly synthetic demo alerts)
    demo_alerts = (
        db.query(Alert)
        .filter(
            Alert.alert_code.like("DEMO-ALT-%"),
            Alert.alert_type == "SYNTHETIC_DEMO_ALERT",
        )
        .all()
    )
    demo_alert_ids = [alt.id for alt in demo_alerts]

    # 4. Identify Demo Events with explicit metadata flag
    demo_events = (
        db.query(CameraEvent)
        .filter(CameraEvent.metadata_json.like("%is_synthetic_demo%"))
        .all()
    )

    deleted_incidents_count = len(demo_incidents)
    deleted_alerts_count = len(demo_alerts)
    deleted_events_count = len(demo_events)
    deleted_incident_codes = [inc.incident_code for inc in demo_incidents]
    deleted_alert_codes = [alt.alert_code for alt in demo_alerts]

    # 5. Execute Deletions and Audit Record inside Atomic Transaction
    try:
        demo_event_ids = [evt.id for evt in demo_events]

        # Delete related human reviews and evidence for demo incidents and demo alerts/events
        if demo_incident_ids or demo_alert_ids:
            db.query(HumanReview).filter(
                (HumanReview.incident_id.in_(demo_incident_ids)) | (HumanReview.alert_id.in_(demo_alert_ids))
            ).delete(synchronize_session=False)

        if demo_incident_ids or demo_event_ids:
            db.query(Evidence).filter(
                (Evidence.incident_id.in_(demo_incident_ids)) | (Evidence.camera_event_id.in_(demo_event_ids))
            ).delete(synchronize_session=False)

        # Delete demo alerts, incidents, and events
        if demo_alert_ids:
            db.query(Alert).filter(Alert.id.in_(demo_alert_ids)).delete(synchronize_session=False)
        if demo_incident_ids:
            db.query(Incident).filter(Incident.id.in_(demo_incident_ids)).delete(synchronize_session=False)
        for evt in demo_events:
            db.delete(evt)

        # Record Reset Action into Immutable Audit Log (only commits with deletions)
        now = utc_now()
        audit = AuditLog(
            event_type=AuditAction.CONFIG_CHANGED.value,
            actor_id=current_user.badge_number,
            action_summary=(
                f"Synthetic Demo Data Reset executed by {current_user.badge_number} ({current_user.full_name}). "
                f"Purged {deleted_events_count} demo events, {deleted_incidents_count} incidents, and {deleted_alerts_count} alerts. "
                f"Baseline public safety seed data strictly preserved."
            ),
            before_state_json=json.dumps({
                "deleted_events_count": deleted_events_count,
                "deleted_incidents_count": deleted_incidents_count,
                "deleted_alerts_count": deleted_alerts_count,
                "deleted_incident_codes": deleted_incident_codes,
                "deleted_alert_codes": deleted_alert_codes,
            }),
            after_state_json=json.dumps({
                "status": "RESET_SUCCESSFUL",
                "timestamp": now.isoformat(),
                "seed_data_preserved": True,
                "operator_role": current_user.role.name if current_user.role else "UNKNOWN",
            }),
            created_at=now,
        )
        db.add(audit)
        db.commit()

    except Exception as exc:
        db.rollback()
        if isinstance(exc, HTTPException):
            raise exc
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Database transaction failure during demo reset: {str(exc)}"
        )

    return DemoResetResponse(
        success=True,
        message="Synthetic demo data successfully reset. Baseline records preserved.",
        deleted_events_count=deleted_events_count,
        deleted_incidents_count=deleted_incidents_count,
        deleted_alerts_count=deleted_alerts_count,
        audit_log_id=audit.id,
        timestamp=now,
    )
