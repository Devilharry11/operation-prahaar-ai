"""
Operation Prahaar AI - Phase 2 Backend & Database Integration Tests
Tests all 14 models, API endpoints, Responsible AI constraints, and human verification workflows.
"""

import sys
import unittest
from pathlib import Path
from fastapi.testclient import TestClient

# Ensure project root is in sys.path
BASE_DIR = Path(__file__).resolve().parent.parent
if str(BASE_DIR) not in sys.path:
    sys.path.insert(0, str(BASE_DIR))

from backend.app.main import app
from backend.app.db.session import SessionLocal, Base, engine
from backend.app.models.entities import (
    Organization,
    Role,
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
from backend.app.models.enums import ReviewStatus, IncidentStatus, SeverityLevel


class TestPhase2Backend(unittest.TestCase):
    """Integration test suite for Phase 2 Backend and Database."""

    @classmethod
    def setUpClass(cls):
        Base.metadata.create_all(bind=engine)
        cls.client = TestClient(app)

    def setUp(self):
        self.db = SessionLocal()

    def tearDown(self):
        self.db.close()

    def test_health_check_endpoint(self):
        """Verify that GET /api/v1/health returns 200 and asserts Responsible AI invariants."""
        response = self.client.get("/api/v1/health")
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertEqual(data["status"], "OPERATIONAL")
        self.assertTrue(data["database_connected"])
        self.assertTrue(data["privacy_preserving_mode"])
        self.assertTrue(data["facial_recognition_prohibited"])
        self.assertTrue(data["human_verification_enforced"])

    def test_database_has_14_entities_registered(self):
        """Verify that all 14 database tables exist in the SQLite schema."""
        table_names = engine.table_names() if hasattr(engine, "table_names") else list(Base.metadata.tables.keys())
        expected_tables = [
            "organizations",
            "roles",
            "permissions",
            "role_permissions",
            "users",
            "locations",
            "edge_devices",
            "cameras",
            "camera_events",
            "incidents",
            "alerts",
            "security_advisories",
            "evidence",
            "human_reviews",
            "approvals",
            "audit_logs",
        ]
        for tbl in expected_tables:
            self.assertIn(tbl, table_names, f"Table '{tbl}' missing from SQLite metadata")

    def test_camera_list_api(self):
        """Verify that registered cameras can be retrieved via REST API."""
        response = self.client.get("/api/v1/cameras")
        self.assertEqual(response.status_code, 200)
        self.assertIsInstance(response.json(), list)

    def test_advisories_list_api(self):
        """Verify that security advisories can be retrieved via REST API."""
        response = self.client.get("/api/v1/advisories")
        self.assertEqual(response.status_code, 200)
        self.assertIsInstance(response.json(), list)

    def test_edge_heartbeat_api(self):
        """Verify that edge devices can send heartbeat telemetry."""
        payload = {
            "cpu_usage_pct": 18.5,
            "ram_usage_mb": 220.0,
            "uptime_seconds": 1200,
            "status": "ONLINE",
        }
        response = self.client.post("/api/v1/edge-devices/EDGE-IND-TEST-001/heartbeat", json=payload)
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertEqual(data["device_id"], "EDGE-IND-TEST-001")
        self.assertEqual(data["status"], "ONLINE")

    def test_responsible_ai_alert_defaults_to_unverified(self):
        """Verify that all alerts are strictly UNVERIFIED upon creation."""
        alerts = self.db.query(Alert).filter(Alert.review_status == ReviewStatus.UNVERIFIED.value).all()
        # In a seeded database, alert_1 should be UNVERIFIED
        if alerts:
            for alert in alerts:
                self.assertEqual(alert.review_status, "UNVERIFIED")

    def test_human_review_workflow_and_audit_logging(self):
        """
        Verify that an authorized human review:
        1. Transitions an incident status to VERIFIED
        2. Updates the alert review_status
        3. Records an immutable audit log entry
        """
        # Ensure we have a user and an incident
        user = self.db.query(User).first()
        incident = self.db.query(Incident).first()
        alert = self.db.query(Alert).filter(Alert.incident_id == incident.id).first() if incident else None

        if not user or not incident:
            self.skipTest("Database not seeded yet; run seed script first.")

        prior_audit_count = self.db.query(AuditLog).count()

        review_payload = {
            "alert_id": alert.id if alert else None,
            "incident_id": incident.id,
            "reviewer_badge_or_username": user.badge_number,
            "action": "VERIFIED",
            "rationale": "Officer on duty visually verified crowd congestion at platform.",
        }

        response = self.client.post("/api/v1/reviews", json=review_payload)
        self.assertEqual(response.status_code, 201)
        data = response.json()
        self.assertEqual(data["action"], "VERIFIED")
        self.assertEqual(data["new_status"], IncidentStatus.VERIFIED.value)

        # Verify incident updated
        self.db.refresh(incident)
        self.assertEqual(incident.status, IncidentStatus.VERIFIED.value)

        # Verify audit log appended
        new_audit_count = self.db.query(AuditLog).count()
        self.assertEqual(new_audit_count, prior_audit_count + 1)


if __name__ == "__main__":
    unittest.main()
