#!/usr/bin/env python3
"""
OPERATION PRAHAAR AI - Database Seed Script
Populates the SQLite database with realistic Indian public safety scenarios,
sample locations, authorized cameras, virtual edge nodes, and security advisories.
"""

import sys
from pathlib import Path
from datetime import timedelta
from backend.app.core.datetime_util import utc_now

# Ensure project root is in sys.path
root_dir = Path(__file__).resolve().parent.parent
if str(root_dir) not in sys.path:
    sys.path.insert(0, str(root_dir))

from backend.app.db.session import SessionLocal, Base, engine
from backend.app.models.entities import (
    Organization,
    Role,
    Permission,
    User,
    Location,
    EdgeDevice,
    Camera,
    CameraEvent,
    Incident,
    Alert,
    SecurityAdvisory,
    Evidence,
    HumanReview,
    AuditLog,
)
from backend.app.models.enums import (
    SeverityLevel,
    ReviewStatus,
    IncidentStatus,
    UncertaintyLevel,
    DeviceType,
    EventType,
    AdvisoryThreatLevel,
    EvidenceType,
    AuditAction,
)


def seed():
    print("[*] Initializing Database Schema...")
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()

    try:
        # Check if already seeded
        if db.query(Organization).first():
            print("[+] Database already contains data. Skipping seed.")
            return

        print("[*] Seeding Organization & Roles...")
        org = Organization(
            name="National Public Safety Prototype Agency",
            code="NPSPA-HQ",
            description="Autonomous Indian Technology Testbed for Counter-Terrorism Decision Support",
            contact_email="control-room@prahaar-ai.prototype",
        )
        db.add(org)
        db.flush()

        role_admin = Role(name="CHIEF_CONTROLLER", description="Full administrative oversight")
        role_operator = Role(name="COMMAND_OPERATOR", description="CCTV monitor & human verification duty")
        role_analyst = Role(name="INTELLIGENCE_ANALYST", description="Advisory correlation and incident synthesis")
        db.add_all([role_admin, role_operator, role_analyst])
        db.flush()

        # Seed Users (No biometric data)
        user_operator = User(
            username="officer.verma",
            email="k.verma@prahaar-ai.prototype",
            hashed_password="hashed_dev_secret_verma_2026",
            badge_number="IND-OPR-4081",
            full_name="Inspector K. Verma",
            organization_id=org.id,
            role_id=role_operator.id,
        )
        user_analyst = User(
            username="analyst.sharma",
            email="p.sharma@prahaar-ai.prototype",
            hashed_password="hashed_dev_secret_sharma_2026",
            badge_number="IND-ANA-2094",
            full_name="Senior Analyst Priya Sharma",
            organization_id=org.id,
            role_id=role_analyst.id,
        )
        db.add_all([user_operator, user_analyst])
        db.flush()

        print("[*] Seeding Sensitive Public Locations...")
        loc_ndls = Location(
            name="New Delhi Railway Station - Platform 1 & Concourse",
            code="LOC-DEL-NDLS",
            city="New Delhi",
            state="Delhi",
            venue_type="Transportation Hub",
            sensitivity_level=SeverityLevel.HIGH.value,
            organization_id=org.id,
        )
        loc_redfort = Location(
            name="Red Fort Complex - Lahori Gate Outer Perimeter",
            code="LOC-DEL-RF01",
            city="New Delhi",
            state="Delhi",
            venue_type="Historical & High-Gathering Monument",
            sensitivity_level=SeverityLevel.CRITICAL.value,
            organization_id=org.id,
        )
        db.add_all([loc_ndls, loc_redfort])
        db.flush()

        print("[*] Seeding Edge Devices...")
        edge_1 = EdgeDevice(
            device_id="EDGE-IND-DELHI-001",
            name="Virtual Edge Node 01 (Laptop Simulation)",
            device_type=DeviceType.VIRTUAL_LAPTOP.value,
            ip_address="127.0.0.1",
            status="ONLINE",
            cpu_usage_pct=16.8,
            ram_usage_mb=215.4,
            uptime_seconds=7200,
            location_id=loc_ndls.id,
        )
        edge_2 = EdgeDevice(
            device_id="EDGE-IND-DELHI-002",
            name="Red Fort Mini-PC Appliance (Simulated)",
            device_type=DeviceType.MINI_PC.value,
            ip_address="127.0.0.1",
            status="ONLINE",
            cpu_usage_pct=22.1,
            ram_usage_mb=268.0,
            uptime_seconds=14400,
            location_id=loc_redfort.id,
        )
        db.add_all([edge_1, edge_2])
        db.flush()

        print("[*] Seeding CCTV Video Input Feeds...")
        cam_1 = Camera(
            camera_code="CAM-NDLS-CONCOURSE-01",
            name="Platform 1 Concourse South Foot-over Bridge",
            stream_url="data/samples/sample_test.mp4",
            status="ONLINE",
            resolution="640x360",
            fps=5,
            zone_polygon_json='[{"x": 80, "y": 140}, {"x": 560, "y": 140}, {"x": 560, "y": 340}, {"x": 80, "y": 340}]',
            location_id=loc_ndls.id,
            edge_device_id=edge_1.id,
        )
        cam_2 = Camera(
            camera_code="CAM-RF-PERIMETER-02",
            name="Lahori Gate West Security Perimeter",
            stream_url="data/samples/sample_test.mp4",
            status="ONLINE",
            resolution="640x360",
            fps=5,
            zone_polygon_json='[{"x": 100, "y": 200}, {"x": 400, "y": 200}, {"x": 400, "y": 320}, {"x": 100, "y": 320}]',
            location_id=loc_redfort.id,
            edge_device_id=edge_2.id,
        )
        db.add_all([cam_1, cam_2])
        db.flush()

        print("[*] Seeding Official Security Advisories...")
        advisory_transit = SecurityAdvisory(
            advisory_code="ADV-MHA-2026-08",
            issuing_agency="Bureau of Public Safety Intelligence",
            title="Heightened Vigilance Advisory: Public Transit Nodes",
            summary="Pre-national festival intelligence suggests increased crowd vulnerability at northern rail transit terminals.",
            threat_level=AdvisoryThreatLevel.ELEVATED.value,
            target_locations="New Delhi Railway Station, Old Delhi, Anand Vihar Terminus",
            recommended_actions="Enforce strict congestion monitoring at concourse bottlenecks; flag abrupt crowd counter-flows.",
            valid_from=utc_now() - timedelta(days=2),
            valid_to=utc_now() + timedelta(days=5),
            is_active=True,
        )
        db.add(advisory_transit)
        db.flush()

        print("[*] Seeding Simulated Initial Event & Alert...")
        event_1 = CameraEvent(
            camera_id=cam_1.id,
            edge_device_id=edge_1.id,
            event_type=EventType.HIGH_CROWD_CONGESTION.value,
            severity=SeverityLevel.HIGH.value,
            crowd_density_score=0.84,
            motion_energy=62.5,
            bounding_boxes_json='[{"x": 120, "y": 150, "w": 40, "h": 70}, {"x": 180, "y": 155, "w": 38, "h": 68}]',
            timestamp=utc_now() - timedelta(minutes=15),
        )
        db.add(event_1)
        db.flush()

        incident_1 = Incident(
            incident_code="INC-2026-0001",
            title="Rapid Pedestrian Congestion Build-up at Concourse South",
            description="Edge vision detected density ratio 0.84 exceeding the 0.75 threshold during active transit advisory.",
            status=IncidentStatus.NEW.value,
            priority=SeverityLevel.HIGH.value,
            confidence_score=0.87,
            uncertainty_level=UncertaintyLevel.LOW.value,
            explanation="Spatial density sustained >80% for 20+ seconds in designated pedestrian walkway; matches advisory ADV-MHA-2026-08.",
            triggered_rule="CONGESTION_RAPID_BUILDUP_RULE",
            location_id=loc_ndls.id,
            advisory_id=advisory_transit.id,
        )
        db.add(incident_1)
        db.flush()

        alert_1 = Alert(
            alert_code="ALT-2026-0001",
            incident_id=incident_1.id,
            camera_id=cam_1.id,
            alert_type="CROWD_CONGESTION_WARNING",
            severity=SeverityLevel.HIGH.value,
            title="High Density Anomaly - Platform 1 Concourse",
            summary="Density 84% at NDLS Concourse South. Awaiting authorized human review before escalation.",
            # Strictly UNVERIFIED by default per Responsible AI rules
            review_status=ReviewStatus.UNVERIFIED.value,
            is_actionable=True,
            created_at=utc_now() - timedelta(minutes=14),
        )
        db.add(alert_1)
        db.flush()

        # Evidence record
        evidence_1 = Evidence(
            incident_id=incident_1.id,
            camera_event_id=event_1.id,
            evidence_type=EvidenceType.TELEMETRY_LOG.value,
            data_payload_json='{"density": 0.84, "motion_energy": 62.5, "event": "HIGH_CROWD_CONGESTION"}',
            hash_signature="e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
        )
        db.add(evidence_1)

        # Initial Audit Log
        audit_1 = AuditLog(
            event_type=AuditAction.INCIDENT_CREATED.value,
            actor_id="SYSTEM_INTELLIGENCE_ENGINE",
            action_summary="Synthesized Incident INC-2026-0001 from Edge Camera Event CAM-NDLS-CONCOURSE-01",
            after_state_json=f'{{"incident_code": "INC-2026-0001", "status": "NEW", "review_status": "UNVERIFIED"}}',
        )
        db.add(audit_1)

        db.commit()
        print("[+] Database successfully seeded with 14 entities and realistic public safety scenarios!")
    except Exception as e:
        db.rollback()
        print(f"[-] Seeding failed: {e}")
        raise
    finally:
        db.close()


if __name__ == "__main__":
    seed()
