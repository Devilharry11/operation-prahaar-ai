"""
Operation Prahaar AI - Phase C Multi-Tier Human Governance Test Suite
Tests 3-Tier Human-in-the-Loop Verification:
Tier 1: Operator verification / dismissal + min rationale validation
Tier 2: Watch Officer tactical confirmation / return + state machine enforcement
Tier 3: Chief Controller advisory release sign-off + executive role authorization
Queue: Real-time inspection queue partitioning across all 3 tiers.
Runs in total database isolation (isolated temporary SQLite database).
"""

import sys
import unittest
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
from backend.app.models.entities import (
    Organization,
    Role,
    User,
    Location,
    Camera,
    Incident,
    Alert,
    HumanReview,
    Approval,
    AuditLog,
)


class TestPhaseCGovernance(unittest.TestCase):
    """Complete automated verification of Phase C Multi-Tier Human Governance."""

    @classmethod
    def setUpClass(cls):
        # 1. Isolated temporary test database
        cls.test_db_path = BASE_DIR / f"test_isolated_c3_{uuid.uuid4().hex[:8]}.db"
        if cls.test_db_path.exists():
            cls.test_db_path.unlink()

        cls.engine = create_engine(
            f"sqlite:///{cls.test_db_path}",
            connect_args={"check_same_thread": False},
            future=True,
        )
        Base.metadata.create_all(bind=cls.engine)
        cls.SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=cls.engine, future=True)

        # 2. Seed roles & users
        db = cls.SessionLocal()
        org = Organization(id="org-c3-1", name="Prahaar Test Safety Org", code="TEST-C3", contact_email="safety@prahaar.local")
        db.add(org)

        r_opr = Role(name="COMMAND_OPERATOR", description="Control Room Operator")
        r_ana = Role(name="INTELLIGENCE_ANALYST", description="Watch Officer / Analyst")
        r_ctl = Role(name="CHIEF_CONTROLLER", description="Chief Public Safety Controller")
        db.add_all([r_opr, r_ana, r_ctl])
        db.flush()

        # Users
        u_opr = User(
            id="u-opr-1",
            organization_id=org.id,
            role_id=r_opr.id,
            username="operator_sharma",
            email="sharma@prahaar.local",
            hashed_password="hash_secret",
            badge_number="IND-OPR-4081",
            full_name="Rajesh Sharma",
            is_active=True,
        )
        u_ana = User(
            id="u-ana-1",
            organization_id=org.id,
            role_id=r_ana.id,
            username="analyst_patel",
            email="patel@prahaar.local",
            hashed_password="hash_secret",
            badge_number="IND-ANA-2094",
            full_name="Priya Patel",
            is_active=True,
        )
        u_ctl = User(
            id="u-ctl-1",
            organization_id=org.id,
            role_id=r_ctl.id,
            username="controller_verma",
            email="verma@prahaar.local",
            hashed_password="hash_secret",
            badge_number="IND-ADM-001",
            full_name="Vikram Verma",
            is_active=True,
        )
        db.add_all([u_opr, u_ana, u_ctl])
        db.flush()

        # Locations & Cameras
        loc = Location(
            id="loc-c3-1",
            organization_id=org.id,
            name="Terminal Concourse",
            code="LOC-CONC-01",
            city="New Delhi",
            state="Delhi",
            venue_type="AIRPORT",
        )
        db.add(loc)
        db.flush()
        cam = Camera(
            id="cam-c3-1",
            location_id=loc.id,
            camera_code="CAM-CONCOURSE-01",
            name="Main Concourse High",
            stream_url="http://synthetic.stream/cam-c3-1",
            status="ONLINE",
        )
        db.add(cam)

        # Seed incidents for multi-tier flow testing
        cls.inc1_id = "inc-c3-test-1"
        inc1 = Incident(
            id=cls.inc1_id,
            location_id=loc.id,
            incident_code="INC-2026-C301",
            title="[SYNTHETIC DEMO] Crowd Density Surge Concourse A",
            description="Synthetic sudden crowd build-up at exit bottleneck.",
            status="NEW",
            priority="HIGH",
            confidence_score=0.88,
            uncertainty_level="LOW",
            explanation="Automated sensor threshold alert for synthetic concourse surge demo.",
            triggered_rule="DEMO_OCCUPANCY_THRESHOLD_RULE",
        )
        alt1 = Alert(
            id="alt-c3-test-1",
            alert_code="ALT-2026-C301",
            incident_id=inc1.id,
            camera_id=cam.id,
            alert_type="CROWD_SURGE",
            severity="HIGH",
            title="Crowd Surge Alert",
            summary="[SYNTHETIC DEMO] Density exceeded safety envelope.",
            review_status="UNVERIFIED",
        )

        cls.inc2_id = "inc-c3-test-2"
        inc2 = Incident(
            id=cls.inc2_id,
            location_id=loc.id,
            incident_code="INC-2026-C302",
            title="[SYNTHETIC DEMO] Platform Influx Warning",
            description="High congestion observed near platform entrance.",
            status="NEW",
            priority="MEDIUM",
            confidence_score=0.79,
            uncertainty_level="MEDIUM",
            explanation="Automated sensor threshold alert for synthetic platform congestion demo.",
            triggered_rule="DEMO_CONGESTION_FLOW_RULE",
        )
        alt2 = Alert(
            id="alt-c3-test-2",
            alert_code="ALT-2026-C302",
            incident_id=inc2.id,
            camera_id=cam.id,
            alert_type="SURGE_ALERT",
            severity="MEDIUM",
            title="Platform Surge Alert",
            summary="[SYNTHETIC DEMO] Flow rate slowing.",
            review_status="UNVERIFIED",
        )

        db.add_all([inc1, alt1, inc2, alt2])
        db.commit()
        db.close()

        # 3. Setup TestClient with override
        def override_get_db():
            test_db = cls.SessionLocal()
            try:
                yield test_db
            finally:
                test_db.close()

        app.dependency_overrides[get_db] = override_get_db
        cls.client = TestClient(app)

    @classmethod
    def tearDownClass(cls):
        app.dependency_overrides.clear()
        cls.engine.dispose()
        if cls.test_db_path.exists():
            try:
                cls.test_db_path.unlink()
            except Exception:
                pass

    def test_01_tier1_review_verified_success(self):
        """Tier 1: Operator reviews incident with min 15 chars rationale and verifies it."""
        response = self.client.post(
            "/api/v1/governance/tier1",
            headers={"X-Operator-Badge": "IND-OPR-4081"},
            json={
                "incident_id": self.inc1_id,
                "action": "VERIFIED",
                "rationale": "Verified aggregate crowd buildup at concourse bottleneck under normal lighting conditions.",
            },
        )
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertTrue(data["success"])
        self.assertEqual(data["tier"], 1)
        self.assertEqual(data["action"], "VERIFIED")
        self.assertEqual(data["new_status"], "VERIFIED")
        self.assertEqual(data["operator_badge"], "IND-OPR-4081")
        self.assertTrue(data["is_synthetic"])

    def test_02_tier1_rationale_validation_under_15_chars(self):
        """Tier 1: Rejects rationale shorter than 15 characters (HTTP 422)."""
        response = self.client.post(
            "/api/v1/governance/tier1",
            headers={"X-Operator-Badge": "IND-OPR-4081"},
            json={
                "incident_id": self.inc2_id,
                "action": "VERIFIED",
                "rationale": "Looks ok",  # Only 8 chars
            },
        )
        self.assertEqual(response.status_code, 422)

    def test_03_tier1_review_dismissed_success(self):
        """Tier 1: Operator dismisses incident with valid rationale."""
        response = self.client.post(
            "/api/v1/governance/tier1",
            headers={"X-Operator-Badge": "IND-OPR-4081"},
            json={
                "incident_id": self.inc2_id,
                "action": "DISMISSED",
                "rationale": "Transient movement artifact caused by scheduled cleaning cart pass, dismissed by operator.",
            },
        )
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertEqual(data["action"], "DISMISSED")
        self.assertEqual(data["new_status"], "DISMISSED")

    def test_04_tier2_rejects_unverified_incident(self):
        """Tier 2: Watch Officer cannot confirm an incident that was not Tier 1 VERIFIED (e.g. DISMISSED)."""
        response = self.client.post(
            "/api/v1/governance/tier2",
            headers={"X-Operator-Badge": "IND-ANA-2094"},
            json={
                "incident_id": self.inc2_id,  # Currently DISMISSED
                "action": "CONFIRMED",
                "explanation": "Attempting supervisory review without Tier-1 verification prerequisite.",
            },
        )
        self.assertEqual(response.status_code, 400)
        self.assertIn("Only Tier-1 VERIFIED incidents can proceed", response.json()["detail"])

    def test_05_tier2_confirmation_success(self):
        """Tier 2: Watch Officer confirms a Tier 1 VERIFIED incident."""
        response = self.client.post(
            "/api/v1/governance/tier2",
            headers={"X-Operator-Badge": "IND-ANA-2094"},
            json={
                "incident_id": self.inc1_id,  # Currently VERIFIED from test_01
                "action": "CONFIRMED",
                "explanation": "Supervisory review confirms sustained congestion trend; recommend public safety advisory.",
            },
        )
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertTrue(data["success"])
        self.assertEqual(data["tier"], 2)
        self.assertEqual(data["action"], "CONFIRMED")
        self.assertEqual(data["new_status"], "TACTICAL_CONFIRMED")
        self.assertEqual(data["operator_badge"], "IND-ANA-2094")

    def test_06_tier3_strictly_requires_chief_controller(self):
        """Tier 3: Operator and Analyst are blocked (HTTP 403) from executive advisory sign-off."""
        # Operator attempts Tier 3
        response_opr = self.client.post(
            "/api/v1/governance/tier3",
            headers={"X-Operator-Badge": "IND-OPR-4081"},
            json={
                "incident_id": self.inc1_id,
                "action": "APPROVED",
                "controller_comments": "Operator attempting executive advisory release approval without controller authority.",
            },
        )
        self.assertEqual(response_opr.status_code, 403)

        # Analyst attempts Tier 3
        response_ana = self.client.post(
            "/api/v1/governance/tier3",
            headers={"X-Operator-Badge": "IND-ANA-2094"},
            json={
                "incident_id": self.inc1_id,
                "action": "APPROVED",
                "controller_comments": "Analyst attempting executive advisory release approval without controller authority.",
            },
        )
        self.assertEqual(response_ana.status_code, 403)

    def test_07_tier3_chief_controller_approval_success(self):
        """Tier 3: Chief Controller approves public safety advisory release."""
        response = self.client.post(
            "/api/v1/governance/tier3",
            headers={"X-Operator-Badge": "IND-ADM-001"},
            json={
                "incident_id": self.inc1_id,  # TACTICAL_CONFIRMED
                "action": "APPROVED",
                "controller_comments": "Chief Controller executive sign-off granted for station concourse public guidance advisory.",
            },
        )
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertTrue(data["success"])
        self.assertEqual(data["tier"], 3)
        self.assertEqual(data["action"], "APPROVED")
        self.assertEqual(data["new_status"], "ADVISORY_PUBLISHED")
        self.assertEqual(data["operator_badge"], "IND-ADM-001")

    def test_08_governance_queue_inspection(self):
        """Queue: Returns partitioned pending queues across Tier 1, 2, and 3."""
        response = self.client.get("/api/v1/governance/queue")
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertIn("tier1_pending", data)
        self.assertIn("tier2_pending", data)
        self.assertIn("tier3_pending", data)
        self.assertIn("total_pending", data)
        self.assertTrue(data["is_synthetic"])


if __name__ == "__main__":
    unittest.main()
