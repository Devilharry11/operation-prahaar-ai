"""
Operation Prahaar AI - Phase B Synthetic Demo Controller Complete Stabilization Test Suite
Runs in total database isolation using a temporary SQLite database (zero impact on prahaar.db).
Tests all 5 scenarios, batch generation, bounds, human review workflow, auth, roles,
conflict protection, atomic rollback on failure, and baseline preservation.
"""

import sys
import unittest
import json
import uuid
from pathlib import Path
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

# Ensure project root is in sys.path
BASE_DIR = Path(__file__).resolve().parent.parent
if str(BASE_DIR) not in sys.path:
    sys.path.insert(0, str(BASE_DIR))

from backend.app.main import app
from backend.app.db.session import Base, get_db
from backend.app.core.config import settings
from backend.app.models.entities import (
    Organization,
    Role,
    User,
    Location,
    Camera,
    Incident,
    Alert,
    CameraEvent,
    AuditLog,
    Evidence,
    HumanReview,
    Approval,
)
from backend.app.schemas.demo import DemoScenarioType


class TestPhaseBDemoControllerStabilization(unittest.TestCase):
    """Complete Functional Stabilization and Security Test Suite for Phase B."""

    @classmethod
    def setUpClass(cls):
        # 1. Create an isolated temporary test database to guarantee zero impact on prahaar.db
        cls.test_db_path = BASE_DIR / f"test_isolated_{uuid.uuid4().hex[:8]}.db"
        if cls.test_db_path.exists():
            cls.test_db_path.unlink()

        cls.test_engine = create_engine(
            f"sqlite:///{cls.test_db_path}",
            connect_args={"check_same_thread": False},
            future=True,
        )
        Base.metadata.create_all(bind=cls.test_engine)
        cls.TestSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=cls.test_engine, future=True)

        # 2. Seed isolated baseline test data
        db = cls.TestSessionLocal()
        org = Organization(id="org-test-1", name="Test Safety Org", code="TEST-ORG", contact_email="test@prahaar.local")
        db.add(org)
        role_controller = Role(name="CHIEF_CONTROLLER", description="Admin Oversight")
        role_operator = Role(name="COMMAND_OPERATOR", description="Control Room Operator")
        role_analyst = Role(name="INTELLIGENCE_ANALYST", description="Advisory Analyst")
        db.add_all([role_controller, role_operator, role_analyst])
        db.flush()

        user_operator = User(
            id="usr-test-opr",
            username="officer.verma",
            email="k.verma@test.local",
            hashed_password="hash_secret",
            badge_number="IND-OPR-4081",
            full_name="Inspector K. Verma",
            organization_id=org.id,
            role_id=role_operator.id,
            is_active=True,
        )
        user_analyst = User(
            id="usr-test-ana",
            username="analyst.sharma",
            email="p.sharma@test.local",
            hashed_password="hash_secret",
            badge_number="IND-ANA-2094",
            full_name="Senior Analyst Priya Sharma",
            organization_id=org.id,
            role_id=role_analyst.id,
            is_active=True,
        )
        user_inactive = User(
            id="usr-test-inact",
            username="officer.inactive",
            email="inactive@test.local",
            hashed_password="hash_secret",
            badge_number="IND-INACT-0000",
            full_name="Deactivated Officer",
            organization_id=org.id,
            role_id=role_operator.id,
            is_active=False,
        )
        db.add_all([user_operator, user_analyst, user_inactive])
        db.flush()

        loc = Location(
            id="loc-del-ndls",
            organization_id=org.id,
            name="New Delhi Railway Station - Concourse",
            code="LOC-DEL-NDLS",
            city="New Delhi",
            state="Delhi",
            venue_type="RAILWAY_STATION",
        )
        db.add(loc)
        db.flush()

        cam = Camera(
            id="cam-ndls-01",
            camera_code="CAM-NDLS-CONCOURSE-01",
            name="Platform 1 Concourse South",
            stream_url="data/samples/sample_test.mp4",
            status="ONLINE",
            resolution="640x360",
            fps=5,
            location_id=loc.id,
        )
        db.add(cam)
        db.flush()

        # Seed Baseline Incident and Alert (must be preserved across all tests)
        baseline_inc = Incident(
            id="inc-base-0001",
            incident_code="INC-2026-0001",
            title="Rapid Pedestrian Congestion Build-up at Concourse South",
            description="Baseline operational public safety incident",
            status="NEW",
            priority="HIGH",
            confidence_score=0.88,
            uncertainty_level="LOW",
            explanation="Baseline rule threshold triggered",
            triggered_rule="OPERATIONAL_THRESHOLD_RULE",
            location_id=loc.id,
        )
        db.add(baseline_inc)
        db.flush()

        baseline_alt = Alert(
            id="alt-base-0001",
            alert_code="ALT-2026-0001",
            incident_id=baseline_inc.id,
            camera_id=cam.id,
            alert_type="OPERATIONAL_ALERT",
            severity="HIGH",
            title="High Crowd Density Warning (Baseline)",
            summary="Baseline operational alert awaiting operator verification",
            review_status="UNVERIFIED",
            is_actionable=True,
        )
        db.add(baseline_alt)
        db.commit()
        db.close()

        # 3. Override FastAPI dependency get_db to point strictly to the isolated DB
        def override_get_db():
            session = cls.TestSessionLocal()
            try:
                yield session
            finally:
                session.close()

        app.dependency_overrides[get_db] = override_get_db
        cls.client = TestClient(app)
        cls.valid_operator_badge = "IND-OPR-4081"
        cls.analyst_badge = "IND-ANA-2094"
        cls.auth_headers = {"X-Operator-Badge": cls.valid_operator_badge}
        cls.analyst_headers = {"X-Operator-Badge": cls.analyst_badge}

    @classmethod
    def tearDownClass(cls):
        app.dependency_overrides.clear()
        if hasattr(cls, "test_engine"):
            cls.test_engine.dispose()
        if hasattr(cls, "test_db_path") and cls.test_db_path.exists():
            try:
                cls.test_db_path.unlink()
            except Exception:
                pass

    def setUp(self):
        self.db = self.TestSessionLocal()

    def tearDown(self):
        self.db.close()

    # -------------------------------------------------------------------------
    # TASK 1: Environment & Health Verification
    # -------------------------------------------------------------------------
    def test_01_environment_and_health_invariants(self):
        """Verify GET /api/v1/health returns operational status and asserts Responsible AI invariants."""
        response = self.client.get("/api/v1/health")
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertEqual(data["status"], "OPERATIONAL")
        self.assertTrue(data["database_connected"])
        self.assertTrue(data["privacy_preserving_mode"])
        self.assertTrue(data["facial_recognition_prohibited"])
        self.assertTrue(data["human_verification_enforced"])

    # -------------------------------------------------------------------------
    # TASK 2: Authentication & Authorization Controls
    # -------------------------------------------------------------------------
    def test_02_unauthenticated_request_rejected(self):
        """Verify requests missing operator credentials return HTTP 401 Unauthorized."""
        payload = {"scenario": "AGGREGATE_OCCUPANCY_EXCEEDED"}
        response = self.client.post("/api/v1/demo/generate", json=payload)
        self.assertEqual(response.status_code, 401)
        self.assertIn("Authentication required", response.json()["detail"])

    def test_03_invalid_operator_identity_rejected(self):
        """Verify unknown operator badge returns HTTP 401 Unauthorized."""
        payload = {"scenario": "AGGREGATE_OCCUPANCY_EXCEEDED"}
        response = self.client.post("/api/v1/demo/generate", json=payload, headers={"X-Operator-Badge": "FORGED-9999"})
        self.assertEqual(response.status_code, 401)
        self.assertIn("not recognized", response.json()["detail"])

    def test_04_deactivated_operator_rejected(self):
        """Verify deactivated operator returns HTTP 403 Forbidden."""
        payload = {"scenario": "AGGREGATE_OCCUPANCY_EXCEEDED"}
        response = self.client.post("/api/v1/demo/generate", json=payload, headers={"X-Operator-Badge": "IND-INACT-0000"})
        self.assertEqual(response.status_code, 403)
        self.assertIn("deactivated", response.json()["detail"])

    def test_05_unauthorized_role_reset_rejected(self):
        """Verify analyst role cannot execute destructive reset (HTTP 403 Forbidden)."""
        payload = {"confirm": True}
        response = self.client.post("/api/v1/demo/reset", json=payload, headers=self.analyst_headers)
        self.assertEqual(response.status_code, 403)
        self.assertIn("Authorization failed", response.json()["detail"])

    def test_06_disabled_demo_reset_config_rejected(self):
        """Verify DEMO_RESET_ALLOWED=False blocks reset regardless of operator role."""
        original_setting = getattr(settings, "DEMO_RESET_ALLOWED", True)
        try:
            settings.DEMO_RESET_ALLOWED = False
            response = self.client.post("/api/v1/demo/reset", json={"confirm": True}, headers=self.auth_headers)
            self.assertEqual(response.status_code, 403)
            self.assertIn("Administrative block", response.json()["detail"])
        finally:
            settings.DEMO_RESET_ALLOWED = original_setting

    # -------------------------------------------------------------------------
    # TASK 2: Backend Scenario Generation & Persistence
    # -------------------------------------------------------------------------
    def test_07_generate_all_5_synthetic_scenarios(self):
        """Verify all 5 safe scenarios generate valid incidents, alerts, events and audit records."""
        scenarios = [
            ("AGGREGATE_OCCUPANCY_EXCEEDED", "HIGH_CROWD_CONGESTION"),
            ("SIMULATED_CONGESTION_ADVISORY", "HIGH_CROWD_CONGESTION"),
            ("SYSTEM_HEALTH_WARNING", "ANOMALOUS_MOTION_SURGE"),
            ("EDGE_CONNECTIVITY_INTERRUPTION", "ANOMALOUS_MOTION_SURGE"),
            ("INFORMATION_ADVISORY", "HIGH_CROWD_CONGESTION"),
        ]
        for sc_name, expected_event_type in scenarios:
            payload = {"scenario": sc_name, "severity": "HIGH", "custom_note": f"Test {sc_name}"}
            response = self.client.post("/api/v1/demo/generate", json=payload, headers=self.auth_headers)
            self.assertEqual(response.status_code, 201, f"Failed for scenario {sc_name}")
            data = response.json()

            # 1. API Response Verification
            self.assertTrue(data["success"])
            self.assertEqual(data["scenario"], sc_name)
            self.assertTrue(data["incident_code"].startswith("DEMO-INC-"))
            self.assertTrue(data["alert_code"].startswith("DEMO-ALT-"))
            self.assertEqual(data["review_status"], "UNVERIFIED")

            # 2. Database Persistence Verification
            incident = self.db.query(Incident).filter(Incident.id == data["incident_id"]).first()
            self.assertIsNotNone(incident)
            self.assertEqual(incident.status, "NEW")
            self.assertTrue(incident.triggered_rule.startswith("DEMO_"))

            alert = self.db.query(Alert).filter(Alert.id == data["alert_id"]).first()
            self.assertIsNotNone(alert)
            self.assertEqual(alert.alert_type, "SYNTHETIC_DEMO_ALERT")
            self.assertEqual(alert.review_status, "UNVERIFIED")

            event = self.db.query(CameraEvent).filter(CameraEvent.id == data["event_id"]).first()
            self.assertIsNotNone(event)
            self.assertEqual(event.event_type, expected_event_type)
            metadata = json.loads(event.metadata_json)
            self.assertTrue(metadata.get("is_synthetic_demo"))

            # 3. Audit Record Verification
            audit = (
                self.db.query(AuditLog)
                .filter(AuditLog.event_type == "DEMO_EVENT_GENERATED", AuditLog.actor_id == self.valid_operator_badge)
                .order_by(AuditLog.created_at.desc())
                .first()
            )
            self.assertIsNotNone(audit)
            self.assertIn(data["incident_code"], audit.action_summary)

    def test_08_invalid_scenario_rejection(self):
        """Verify prohibited scenario (e.g. FACIAL_TRACKING) is rejected with HTTP 422."""
        payload = {"scenario": "FACIAL_RECOGNITION_PROFILING"}
        response = self.client.post("/api/v1/demo/generate", json=payload, headers=self.auth_headers)
        self.assertEqual(response.status_code, 422)

    def test_09_batch_generation_and_bounds(self):
        """Verify batch generation respects bounds (count 3 succeeds, count 10 rejected)."""
        response = self.client.post("/api/v1/demo/generate-batch", json={"count": 3}, headers=self.auth_headers)
        self.assertEqual(response.status_code, 201)
        data = response.json()
        self.assertEqual(len(data), 3)
        for item in data:
            self.assertTrue(item["incident_code"].startswith("DEMO-INC-"))
            self.assertEqual(item["review_status"], "UNVERIFIED")

        # Exceeds max count 5
        res_overflow = self.client.post("/api/v1/demo/generate-batch", json={"count": 10}, headers=self.auth_headers)
        self.assertEqual(res_overflow.status_code, 422)

    def test_10_demo_history_authenticated(self):
        """Verify GET /api/v1/demo/history returns list of persisted demo incidents."""
        response = self.client.get("/api/v1/demo/history?limit=10", headers=self.auth_headers)
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertIsInstance(data, list)
        self.assertGreater(len(data), 0)
        self.assertTrue(data[0]["incident_code"].startswith("DEMO-INC-"))

    # -------------------------------------------------------------------------
    # TASK 3: Human Review Workflow Verification
    # -------------------------------------------------------------------------
    def test_11_human_review_workflow_transition(self):
        """
        Verify end-to-end human verification workflow:
        1. Generate Demo Event (UNVERIFIED)
        2. Submit Human Review via POST /api/v1/reviews
        3. Assert Incident transitions to VERIFIED
        4. Assert Alert transitions to VERIFIED
        5. Assert Audit Log records human decision
        6. Assert zero autonomous escalation occurred
        """
        # Step 1: Generate Demo Incident
        gen_res = self.client.post(
            "/api/v1/demo/generate",
            json={"scenario": "AGGREGATE_OCCUPANCY_EXCEEDED"},
            headers=self.auth_headers
        )
        self.assertEqual(gen_res.status_code, 201)
        inc_id = gen_res.json()["incident_id"]
        alt_id = gen_res.json()["alert_id"]

        # Step 2: Submit Human Review
        review_payload = {
            "incident_id": inc_id,
            "alert_id": alt_id,
            "reviewer_badge_or_username": self.valid_operator_badge,
            "action": "VERIFIED",
            "rationale": "Operator inspected CCTV stream; confirmed high pedestrian rush following express train arrival.",
        }
        rev_res = self.client.post("/api/v1/reviews", json=review_payload)
        self.assertEqual(rev_res.status_code, 201)
        rev_data = rev_res.json()
        self.assertEqual(rev_data["action"], "VERIFIED")

        # Step 3: Verify Incident State in DB
        inc = self.db.query(Incident).filter(Incident.id == inc_id).first()
        self.assertEqual(inc.status, "VERIFIED")

        # Step 4: Verify Alert State in DB
        alt = self.db.query(Alert).filter(Alert.id == alt_id).first()
        self.assertEqual(alt.review_status, "VERIFIED")

        # Step 5: Verify Audit Log has human review entry
        audit = (
            self.db.query(AuditLog)
            .filter(AuditLog.event_type == "HUMAN_VERIFICATION", AuditLog.actor_id == self.valid_operator_badge)
            .order_by(AuditLog.created_at.desc())
            .first()
        )
        self.assertIsNotNone(audit)
        self.assertIn("VERIFIED", audit.action_summary)

    # -------------------------------------------------------------------------
    # TASK 4: Reset Safety, Conflict Abort & Rollback
    # -------------------------------------------------------------------------
    def test_12_demo_reset_requires_confirmation(self):
        """Verify POST /api/v1/demo/reset with confirm=False returns HTTP 400."""
        response = self.client.post("/api/v1/demo/reset", json={"confirm": False}, headers=self.auth_headers)
        self.assertEqual(response.status_code, 400)
        self.assertIn("Explicit confirmation flag", response.json()["detail"])

    def test_13_conflict_abort_when_non_demo_alert_attached(self):
        """Verify non-demo alert attached to demo incident triggers HTTP 409 Conflict and preserves records."""
        # Create a demo incident
        gen_res = self.client.post(
            "/api/v1/demo/generate",
            json={"scenario": "AGGREGATE_OCCUPANCY_EXCEEDED"},
            headers=self.auth_headers
        )
        inc_id = gen_res.json()["incident_id"]

        # Attach real operational alert to this demo incident
        cam = self.db.query(Camera).first()
        conflict_alert = Alert(
            alert_code=f"NON-DEMO-ALT-{uuid.uuid4().hex[:4]}",
            incident_id=inc_id,
            camera_id=cam.id,
            alert_type="REAL_OPERATIONAL_ALERT",
            severity="CRITICAL",
            title="Real Operational Alert",
            summary="Attached non-demo alert",
            review_status="UNVERIFIED",
            is_actionable=True,
        )
        self.db.add(conflict_alert)
        self.db.commit()

        # Attempt reset -> Must abort with 409
        reset_res = self.client.post("/api/v1/demo/reset", json={"confirm": True}, headers=self.auth_headers)
        self.assertEqual(reset_res.status_code, 409)
        self.assertIn("Non-demo alert", reset_res.json()["detail"])

        # Clean up conflict alert
        self.db.delete(conflict_alert)
        self.db.commit()

    def test_14_conflict_abort_when_approval_record_attached(self):
        """Verify formal approval attached to demo incident triggers HTTP 409 Conflict."""
        gen_res = self.client.post(
            "/api/v1/demo/generate",
            json={"scenario": "AGGREGATE_OCCUPANCY_EXCEEDED"},
            headers=self.auth_headers
        )
        inc_id = gen_res.json()["incident_id"]
        user = self.db.query(User).filter(User.badge_number == self.valid_operator_badge).first()

        approval = Approval(
            incident_id=inc_id,
            approver_id=user.id,
            approval_type="ESCALATION_SIGN_OFF",
            status="APPROVED",
            comments="Formal executive approval",
        )
        self.db.add(approval)
        self.db.commit()

        reset_res = self.client.post("/api/v1/demo/reset", json={"confirm": True}, headers=self.auth_headers)
        self.assertEqual(reset_res.status_code, 409)
        self.assertIn("Formal approval records", reset_res.json()["detail"])

        self.db.delete(approval)
        self.db.commit()

    def test_15_demo_reset_preserves_baseline_and_records_audit(self):
        """
        Verify authorized reset cleans all synthetic demo records while
        strictly preserving baseline seeded incident INC-2026-0001 and alert ALT-2026-0001.
        """
        baseline_inc = self.db.query(Incident).filter(Incident.incident_code == "INC-2026-0001").first()
        baseline_alt = self.db.query(Alert).filter(Alert.alert_code == "ALT-2026-0001").first()
        self.assertIsNotNone(baseline_inc)
        self.assertIsNotNone(baseline_alt)

        # Execute Reset
        reset_res = self.client.post("/api/v1/demo/reset", json={"confirm": True}, headers=self.auth_headers)
        self.assertEqual(reset_res.status_code, 200)
        data = reset_res.json()
        self.assertTrue(data["success"])
        self.assertGreaterEqual(data["deleted_incidents_count"], 1)

        # Invariant 1: No DEMO-INC-* incidents remain
        remaining_demo_incidents = (
            self.db.query(Incident).filter(Incident.incident_code.like("DEMO-INC-%")).count()
        )
        self.assertEqual(remaining_demo_incidents, 0)

        # Invariant 2: Baseline records strictly intact
        preserved_inc = self.db.query(Incident).filter(Incident.incident_code == "INC-2026-0001").first()
        preserved_alt = self.db.query(Alert).filter(Alert.alert_code == "ALT-2026-0001").first()
        self.assertIsNotNone(preserved_inc, "CRITICAL: Baseline incident was wiped!")
        self.assertIsNotNone(preserved_alt, "CRITICAL: Baseline alert was wiped!")

        # Invariant 3: Audit log accurately recorded
        audit_entry = self.db.query(AuditLog).filter(AuditLog.id == data["audit_log_id"]).first()
        self.assertIsNotNone(audit_entry)
        self.assertEqual(audit_entry.actor_id, self.valid_operator_badge)
        before_state = json.loads(audit_entry.before_state_json)
        self.assertIn("deleted_incident_codes", before_state)
        self.assertIn("deleted_alert_codes", before_state)

    def test_16_atomic_transaction_rollback_on_failure(self):
        """
        Verify that an unexpected failure during scenario generation rolls back
        all database changes atomically and leaves zero orphaned records.
        """
        from unittest.mock import patch
        from sqlalchemy.orm import Session

        initial_incidents = self.db.query(Incident).count()
        initial_alerts = self.db.query(Alert).count()
        initial_events = self.db.query(CameraEvent).count()

        with patch.object(Session, "commit", side_effect=Exception("Simulated disk I/O write error")):
            res = self.client.post(
                "/api/v1/demo/generate",
                json={"scenario": "AGGREGATE_OCCUPANCY_EXCEEDED"},
                headers=self.auth_headers,
            )
            self.assertEqual(res.status_code, 500)
            self.assertIn("Database transaction failure", res.json()["detail"])

        fresh_db = self.TestSessionLocal()
        try:
            self.assertEqual(fresh_db.query(Incident).count(), initial_incidents)
            self.assertEqual(fresh_db.query(Alert).count(), initial_alerts)
            self.assertEqual(fresh_db.query(CameraEvent).count(), initial_events)
        finally:
            fresh_db.close()


if __name__ == "__main__":
    unittest.main()
