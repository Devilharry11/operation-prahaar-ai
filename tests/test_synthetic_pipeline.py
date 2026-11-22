"""
Operation Prahaar AI - Synthetic Alert Generation Pipeline End-to-End Tests
Tests:
1. Fictional aggregate zone metrics evaluation (occupancy >= 75%).
2. Synthetic incident and alert generation (CameraEvent, Incident, Alert, Evidence).
3. Initial UNVERIFIED status for alerts and NEW status for incidents.
4. Deduplication window (15 minutes) for identical threshold breaches.
5. Queue visibility in HITL Review (Tier 1 Operator).
6. State transition upon authorized human officer review.
7. SHA-256 cryptographic audit block chain linkage and tamper detection.
"""

import uuid
from pathlib import Path
import unittest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from backend.app.main import app
from backend.app.db.session import Base, get_db
from backend.app.models import entities  # bind all models
from backend.app.models.entities import (
    Organization,
    Role,
    User,
    Location,
    Camera,
    CameraEvent,
    Incident,
    Alert,
    Evidence,
    AuditLog,
)
from backend.app.services.analytics import AnalyticsService, FICTIONAL_ZONES
from backend.app.services.audit_chain import AuditChainService

BASE_DIR = Path(__file__).resolve().parent.parent


class TestSyntheticAlertPipeline(unittest.TestCase):
    """Test suite for the connected synthetic alert generation pipeline."""

    @classmethod
    def setUpClass(cls):
        cls.test_db_path = BASE_DIR / f"test_isolated_pipeline_{uuid.uuid4().hex[:8]}.db"
        if cls.test_db_path.exists():
            cls.test_db_path.unlink()

        cls.engine = create_engine(f"sqlite:///{cls.test_db_path}", connect_args={"check_same_thread": False})
        Base.metadata.create_all(bind=cls.engine)
        cls.SessionLocal = sessionmaker(bind=cls.engine)

        # Seed baseline Organization, Role, User, Location, and Cameras
        db = cls.SessionLocal()
        org = Organization(
            id="org-test-pipeline",
            name="Delhi Safety Bureau",
            code="DEL-SAFETY",
            contact_email="safety@delhi.gov.in",
        )
        db.add(org)

        role_opr = Role(name="COMMAND_OPERATOR", description="Control Room Operator")
        db.add(role_opr)
        db.flush()

        operator = User(
            id="usr-opr-pipeline",
            organization_id=org.id,
            role_id=role_opr.id,
            username="operator.verma",
            email="verma@safety.delhi.gov.in",
            hashed_password="secure_hash_placeholder",
            badge_number="IND-OPR-4081",
            full_name="Sub-Inspector K. Verma",
            is_active=True,
        )
        db.add(operator)

        loc = Location(
            id="loc-test-ndls",
            organization_id=org.id,
            name="New Delhi Central Station",
            code="LOC-DEL-NDLS",
            city="New Delhi",
            state="Delhi",
            venue_type="RAILWAY_STATION",
        )
        db.add(loc)
        db.flush()

        # Seed cameras corresponding to distinct camera_code in FICTIONAL_ZONES
        seen_codes = set()
        for z_id, z_data in FICTIONAL_ZONES.items():
            cam_code = z_data["camera_code"]
            if cam_code not in seen_codes:
                seen_codes.add(cam_code)
                cam = Camera(
                    id=f"cam-{cam_code.lower()}",
                    camera_code=cam_code,
                    name=f"{z_data['name']} Primary Monitor",
                    stream_url=f"rtsp://simulated/{cam_code.lower()}",
                    status="ONLINE",
                    location_id=loc.id,
                )
                db.add(cam)

        db.commit()
        db.close()

        def override_get_db():
            session = cls.SessionLocal()
            try:
                yield session
            finally:
                session.close()

        app.dependency_overrides[get_db] = override_get_db
        cls.client = TestClient(app)

    @classmethod
    def tearDownClass(cls):
        app.dependency_overrides.clear()
        if hasattr(cls, "engine"):
            cls.engine.dispose()
        if hasattr(cls, "test_db_path") and cls.test_db_path.exists():
            try:
                cls.test_db_path.unlink()
            except Exception:
                pass

    def setUp(self):
        self.db = self.SessionLocal()

    def tearDown(self):
        self.db.close()

    def test_01_analytics_zones_endpoint(self):
        """Verify GET /api/v1/analytics/zones returns 4 fictional zones with occupancy ratio."""
        response = self.client.get("/api/v1/analytics/zones")
        self.assertEqual(response.status_code, 200)
        zones = response.json()
        self.assertEqual(len(zones), 4)

        zone_ids = [z["zone_id"] for z in zones]
        self.assertIn("ZONE-A", zone_ids)
        self.assertIn("ZONE-B", zone_ids)
        self.assertIn("ZONE-C", zone_ids)
        self.assertIn("ZONE-D", zone_ids)

        for z in zones:
            self.assertTrue(z["is_synthetic"])
            self.assertGreater(z["capacity_limit"], 0)
            self.assertTrue(0.0 <= z["occupancy_ratio"] <= 1.0)
            self.assertIn(z["density_trend"], ["RISING", "FALLING", "STABLE", "CRITICAL_SURGE"])

    def test_02_analytics_summary_threshold_evaluation(self):
        """Verify GET /api/v1/analytics/summary auto-evaluates high-density zones and populates summary."""
        response = self.client.get("/api/v1/analytics/summary")
        self.assertEqual(response.status_code, 200)
        data = response.json()

        self.assertTrue(data["is_synthetic"])
        self.assertIn("zones", data)
        self.assertEqual(len(data["zones"]), 4)
        self.assertIn("system_density_ratio", data)
        self.assertIn("critical_zones_count", data)
        self.assertIn("avg_flow_velocity_mps", data)
        self.assertIn("active_surge_alerts", data)

    def test_03_generate_synthetic_incident_explicit(self):
        """Verify manual synthetic incident generation creates full relational safety records."""
        payload = {
            "zone_id": "ZONE-A",
            "severity": "HIGH",
            "custom_note": "Educational test surge",
            "operator_badge": "IND-OPR-4081",
            "force": True,
        }
        response = self.client.post(
            "/api/v1/analytics/generate-incident",
            headers={"X-Operator-Badge": "IND-OPR-4081"},
            json=payload,
        )
        self.assertEqual(response.status_code, 201)
        res_data = response.json()

        self.assertTrue(res_data["is_synthetic"])
        self.assertFalse(res_data["deduplicated"])
        self.assertIsNotNone(res_data["incident_id"])
        self.assertIsNotNone(res_data["alert_code"])
        self.assertIsNotNone(res_data["event_id"])
        self.assertEqual(res_data["zone_id"], "ZONE-A")
        self.assertEqual(res_data["severity"], "HIGH")
        self.assertEqual(res_data["review_status"], "UNVERIFIED")

        # Verify DB records
        inc = self.db.query(Incident).filter(Incident.id == res_data["incident_id"]).first()
        self.assertIsNotNone(inc)
        self.assertEqual(inc.status, "NEW")
        self.assertEqual(inc.incident_code, res_data["incident_code"])
        self.assertTrue("[SYNTHETIC DEMO]" in inc.title)

        alt = self.db.query(Alert).filter(Alert.alert_code == res_data["alert_code"]).first()
        self.assertIsNotNone(alt)
        self.assertEqual(alt.review_status, "UNVERIFIED")
        self.assertEqual(alt.severity, "HIGH")

        evt = self.db.query(CameraEvent).filter(CameraEvent.id == res_data["event_id"]).first()
        self.assertIsNotNone(evt)
        self.assertGreaterEqual(evt.crowd_density_score, 0.75)
        self.assertEqual(evt.event_type, "HIGH_CROWD_CONGESTION")

        # Verify evidence record was linked
        evidence = self.db.query(Evidence).filter(Evidence.incident_id == inc.id).first()
        self.assertIsNotNone(evidence)
        self.assertEqual(evidence.evidence_type, "TELEMETRY_LOG")

    def test_04_deduplication_window_prevents_spam(self):
        """Verify calling threshold evaluation within 15 minutes deduplicates without force."""
        # First call with force=True to ensure an active alert exists
        self.client.post(
            "/api/v1/analytics/generate-incident",
            headers={"X-Operator-Badge": "IND-OPR-4081"},
            json={"zone_id": "ZONE-B", "severity": "HIGH", "force": True},
        )

        # Second call immediately after without force
        response = self.client.post(
            "/api/v1/analytics/generate-incident",
            headers={"X-Operator-Badge": "IND-OPR-4081"},
            json={"zone_id": "ZONE-B", "severity": "HIGH", "force": False},
        )
        self.assertEqual(response.status_code, 201)
        data = response.json()
        self.assertTrue(data["deduplicated"])
        self.assertIn("Deduplicated", data["message"])

    def test_05_incident_appears_in_hitl_queue(self):
        """Verify the newly created unverified incident appears in the HITL review queue."""
        res = self.client.post(
            "/api/v1/analytics/generate-incident",
            headers={"X-Operator-Badge": "IND-OPR-4081"},
            json={"zone_id": "ZONE-C", "severity": "CRITICAL", "force": True},
        )
        self.assertEqual(res.status_code, 201)
        inc_id = res.json()["incident_id"]

        queue_res = self.client.get("/api/v1/governance/queue")
        self.assertEqual(queue_res.status_code, 200)
        queue_data = queue_res.json()

        tier1_pending_ids = [item["incident_id"] for item in queue_data["tier1_pending"]]
        self.assertIn(inc_id, tier1_pending_ids)

    def test_06_human_verification_workflow_and_audit_transition(self):
        """Verify Tier 1 human review transitions incident to VERIFIED with audit block."""
        res = self.client.post(
            "/api/v1/analytics/generate-incident",
            headers={"X-Operator-Badge": "IND-OPR-4081"},
            json={"zone_id": "ZONE-D", "severity": "HIGH", "force": True},
        )
        self.assertEqual(res.status_code, 201)
        inc_id = res.json()["incident_id"]
        inc = self.db.query(Incident).filter(Incident.id == inc_id).first()
        self.assertIsNotNone(inc)

        # Attempt review with short rationale (should fail validation >= 15 chars with HTTP 422)
        short_review = self.client.post(
            "/api/v1/governance/tier1",
            headers={"X-Operator-Badge": "IND-OPR-4081"},
            json={
                "incident_id": inc_id,
                "action": "VERIFIED",
                "rationale": "Too short",
            },
        )
        self.assertEqual(short_review.status_code, 422)

        # Valid review with >= 15 chars rationale
        valid_review = self.client.post(
            "/api/v1/governance/tier1",
            headers={"X-Operator-Badge": "IND-OPR-4081"},
            json={
                "incident_id": inc_id,
                "action": "VERIFIED",
                "rationale": "Verified high density surge at Platform 4 north entry stairs under normal lighting.",
            },
        )
        self.assertEqual(valid_review.status_code, 200)
        rev_data = valid_review.json()
        self.assertTrue(rev_data["success"])
        self.assertEqual(rev_data["new_status"], "VERIFIED")

        # Verify incident status in DB
        self.db.refresh(inc)
        self.assertEqual(inc.status, "VERIFIED")

        # Verify corresponding alert status updated
        alt = self.db.query(Alert).filter(Alert.incident_id == inc.id).first()
        if alt:
            self.assertEqual(alt.review_status, "VERIFIED")

    def test_07_tamper_evident_audit_chain_verification(self):
        """Verify complete SHA-256 block chain integrity verification."""
        verify_res = self.client.get("/api/v1/audit-logs/verify-chain")
        self.assertEqual(verify_res.status_code, 200)
        v_data = verify_res.json()

        self.assertTrue(v_data["is_valid"])
        self.assertGreater(v_data["total_records_checked"], 0)
        self.assertIsNotNone(v_data["genesis_hash"])
        self.assertIsNotNone(v_data["chain_head_hash"])

    def test_08_tamper_detection_in_audit_chain(self):
        """Verify modifying any block hash or payload in the audit ledger breaks chain integrity."""
        # Find any non-genesis audit log record and modify its action summary
        log_to_tamper = (
            self.db.query(AuditLog)
            .filter(AuditLog.previous_hash != None)
            .order_by(AuditLog.id.desc())
            .first()
        )
        if log_to_tamper:
            original_summary = log_to_tamper.action_summary
            log_to_tamper.action_summary = "TAMPERED BY MALICIOUS ACTOR"
            self.db.commit()

            # Verify chain reports failure
            res_after_tamper = self.client.get("/api/v1/audit-logs/verify-chain")
            self.assertEqual(res_after_tamper.status_code, 200)
            tamper_data = res_after_tamper.json()
            self.assertFalse(tamper_data["is_valid"])
            self.assertIn("tampered", tamper_data["message"].lower())

            # Restore original value so subsequent tests are clean
            log_to_tamper.action_summary = original_summary
            self.db.commit()


if __name__ == "__main__":
    unittest.main()
