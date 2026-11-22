"""
Operation Prahaar AI - Phase C.2 Explainable AI (XAI) Tests
Verifies transparent rule-based explanation generation, reproducibility,
synthetic markers, and zero profiling constraints.
"""

import uuid
from pathlib import Path
import unittest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from backend.app.main import app
from backend.app.db.session import Base, get_db
from backend.app.models.entities import Incident, Evidence, Organization, Location, Camera
from backend.app.services.xai import XAIService

BASE_DIR = Path(__file__).resolve().parent.parent


class TestPhaseC2Explainability(unittest.TestCase):
    """Test suite for Milestone C.2 Explainable AI Engine."""

    @classmethod
    def setUpClass(cls):
        cls.test_db_path = BASE_DIR / f"test_isolated_c2_{uuid.uuid4().hex[:8]}.db"
        if cls.test_db_path.exists():
            cls.test_db_path.unlink()

        cls.engine = create_engine(f"sqlite:///{cls.test_db_path}", connect_args={"check_same_thread": False})
        Base.metadata.create_all(bind=cls.engine)
        cls.SessionLocal = sessionmaker(bind=cls.engine)

        def override_get_db():
            session = cls.SessionLocal()
            try:
                yield session
            finally:
                session.close()

        app.dependency_overrides[get_db] = override_get_db
        cls.client = TestClient(app)

        # Seed test location & incidents
        db = cls.SessionLocal()
        org = Organization(id="org-c2-1", name="Safety Corp", code="SAFE-1", contact_email="safe@test.local")
        db.add(org)
        loc = Location(id="loc-c2-1", name="NDLS", code="LOC-NDLS", city="Delhi", state="Delhi",
                       venue_type="TRANSIT_HUB", organization_id=org.id)
        db.add(loc)
        db.flush()

        # Incident 1: Occupancy
        cls.inc1_id = "inc-xai-01"
        cls.inc1 = Incident(
            id=cls.inc1_id,
            incident_code="DEMO-INC-XAI-001",
            title="[SYNTHETIC DEMO] Occupancy Threshold Exceeded",
            description="Synthetic high crowd occupancy test event",
            status="NEW",
            priority="HIGH",
            confidence_score=0.92,
            uncertainty_level="LOW",
            triggered_rule="DEMO_OCCUPANCY_THRESHOLD_RULE",
            explanation="Spatial occupancy density sustained >85% for 35 seconds.",
            location_id=loc.id,
        )
        # Incident 2: Congestion Flow
        cls.inc2_id = "inc-xai-02"
        cls.inc2 = Incident(
            id=cls.inc2_id,
            incident_code="DEMO-INC-XAI-002",
            title="[SYNTHETIC DEMO] Flow Deceleration",
            description="Synthetic bottleneck stall",
            status="NEW",
            priority="MEDIUM",
            confidence_score=0.85,
            uncertainty_level="MODERATE",
            triggered_rule="DEMO_CONGESTION_FLOW_RULE",
            explanation="Optical flow decelerated by 42%.",
            location_id=loc.id,
        )
        db.add_all([cls.inc1, cls.inc2])
        db.commit()
        db.close()

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

    def test_01_explain_occupancy_incident(self):
        """Verify explainability output structure for occupancy surge incident."""
        response = self.client.get(f"/api/v1/incidents/{self.inc1_id}/explainability")
        self.assertEqual(response.status_code, 200)
        data = response.json()

        # Verify non-negotiable fields
        self.assertEqual(data["incident_id"], self.inc1_id)
        self.assertEqual(data["incident_code"], "DEMO-INC-XAI-001")
        self.assertTrue(data["is_synthetic"])
        self.assertEqual(data["synthetic_data_marker"], "[SYNTHETIC DEMO]")
        self.assertEqual(data["applied_calculation_or_rule"], "DEMO_OCCUPANCY_THRESHOLD_RULE")
        self.assertIn("input_values", data)
        self.assertIn("contributing_factors", data)
        self.assertIn("data_quality", data)
        self.assertIn("limitations", data)
        self.assertIn("explanation", data)
        self.assertEqual(data["uncertainty_level"], "LOW")

        # Verify factors
        factors = data["contributing_factors"]
        self.assertGreater(len(factors), 0)
        self.assertTrue(any(f["factor_name"] == "Spatial Area Saturation" for f in factors))

    def test_02_explain_congestion_incident(self):
        """Verify explainability output structure for bottleneck flow deceleration."""
        response = self.client.get(f"/api/v1/incidents/{self.inc2_id}/explainability")
        self.assertEqual(response.status_code, 200)
        data = response.json()

        self.assertEqual(data["applied_calculation_or_rule"], "DEMO_CONGESTION_FLOW_RULE")
        self.assertEqual(data["uncertainty_level"], "MODERATE")
        self.assertIn("velocity", data["explanation"].lower())
        self.assertTrue(data["is_synthetic"])

    def test_03_explainability_reproducibility(self):
        """Verify explanation is 100% reproducible on repeated calls."""
        res1 = self.client.get(f"/api/v1/incidents/{self.inc1_id}/explainability").json()
        res2 = self.client.get(f"/api/v1/incidents/{self.inc1_id}/explainability").json()

        self.assertEqual(res1["applied_calculation_or_rule"], res2["applied_calculation_or_rule"])
        self.assertEqual(res1["input_values"], res2["input_values"])
        self.assertEqual(res1["explanation"], res2["explanation"])
        self.assertEqual(len(res1["contributing_factors"]), len(res2["contributing_factors"]))

    def test_04_nonexistent_incident_returns_404(self):
        """Verify 404 for unknown incident identifier."""
        response = self.client.get("/api/v1/incidents/inc-nonexistent-id-9999/explainability")
        self.assertEqual(response.status_code, 404)


if __name__ == "__main__":
    unittest.main()
