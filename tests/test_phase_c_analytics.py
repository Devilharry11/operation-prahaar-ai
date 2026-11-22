"""
Operation Prahaar AI - Phase C.1 Analytics Engine Tests
Tests aggregate spatial calculations, 5-minute rolling windows,
hotspot ranking, zero-division safety, and synthetic compliance.
"""

import uuid
from pathlib import Path
import unittest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from backend.app.main import app
from backend.app.db.session import Base, get_db
from backend.app.models import entities  # Ensures all entities are bound to Base.metadata
from backend.app.services.analytics import AnalyticsService, _safe_div, _classify_congestion, FICTIONAL_ZONES

BASE_DIR = Path(__file__).resolve().parent.parent


class TestPhaseC1Analytics(unittest.TestCase):
    """Test suite for Milestone C.1 Aggregate Spatial Analytics."""

    @classmethod
    def setUpClass(cls):
        cls.test_db_path = BASE_DIR / f"test_isolated_c1_{uuid.uuid4().hex[:8]}.db"
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

    def test_01_fictional_zones_definition(self):
        """Verify all 4 fictional demonstration zones are defined with realistic capacities."""
        self.assertIn("ZONE-A", FICTIONAL_ZONES)
        self.assertIn("ZONE-B", FICTIONAL_ZONES)
        self.assertIn("ZONE-C", FICTIONAL_ZONES)
        self.assertIn("ZONE-D", FICTIONAL_ZONES)
        for z_id, z in FICTIONAL_ZONES.items():
            self.assertGreater(z["capacity"], 0)
            self.assertIn("name", z)
            self.assertIn("camera_code", z)

    def test_02_safe_division_and_helpers(self):
        """Verify zero division safety and NaN handling."""
        self.assertEqual(_safe_div(10.0, 0.0, default=0.0), 0.0)
        self.assertEqual(_safe_div(10.0, 2.0), 5.0)
        self.assertEqual(_safe_div(float("nan"), 2.0), 0.0)

        # Congestion classification
        self.assertEqual(_classify_congestion(88.0), ("SEVERE", "CRITICAL_SURGE"))
        self.assertEqual(_classify_congestion(78.0), ("ELEVATED", "RISING"))
        self.assertEqual(_classify_congestion(60.0), ("MODERATE", "STABLE"))
        self.assertEqual(_classify_congestion(40.0), ("NORMAL", "FALLING"))

    def test_03_zone_metrics_calculation(self):
        """Verify calculation of metrics for an individual zone."""
        zm = AnalyticsService.get_zone_metrics(self.db, "ZONE-A")
        self.assertIsNotNone(zm)
        self.assertEqual(zm.zone_id, "ZONE-A")
        self.assertEqual(zm.capacity, 500)
        self.assertTrue(0.0 <= zm.occupancy_pct <= 100.0)
        self.assertTrue(zm.is_synthetic)

        # Invalid zone returns None safely
        invalid_zm = AnalyticsService.get_zone_metrics(self.db, "ZONE-NONEXISTENT")
        self.assertIsNone(invalid_zm)

    def test_04_trends_endpoint_and_5min_rolling_window(self):
        """Verify GET /api/v1/analytics/trends computes 5-minute rolling window buckets."""
        response = self.client.get("/api/v1/analytics/trends?window_minutes=60&point_interval_minutes=5")
        self.assertEqual(response.status_code, 200)
        data = response.json()

        self.assertTrue(data["is_synthetic"])
        self.assertEqual(data["window_minutes"], 60)
        self.assertEqual(data["point_interval_minutes"], 5)
        self.assertGreaterEqual(len(data["data_points"]), 12)

        # Verify point structure
        first_point = data["data_points"][0]
        self.assertIn("timestamp", first_point)
        self.assertIn("aggregate_occupancy_pct", first_point)
        self.assertIn("total_flow_inflow", first_point)
        self.assertIn("total_flow_outflow", first_point)
        self.assertIn("average_velocity_index", first_point)
        self.assertIn("data_quality_score", first_point)
        self.assertIn("uncertainty_level", first_point)
        self.assertTrue(first_point["is_synthetic"])

    def test_05_trends_zone_filtering(self):
        """Verify filtering trends by specific zone."""
        res_all = self.client.get("/api/v1/analytics/trends?window_minutes=30")
        self.assertEqual(res_all.status_code, 200)

        res_filtered = self.client.get("/api/v1/analytics/trends?window_minutes=30&zone_id=ZONE-B")
        self.assertEqual(res_filtered.status_code, 200)
        p = res_filtered.json()["data_points"][0]
        self.assertIn("ZONE-B", p["zone_occupancy_pct"])
        self.assertNotIn("ZONE-C", p["zone_occupancy_pct"])

    def test_06_hotspots_endpoint(self):
        """Verify GET /api/v1/analytics/hotspots returns ranked zones."""
        response = self.client.get("/api/v1/analytics/hotspots?limit=4")
        self.assertEqual(response.status_code, 200)
        data = response.json()

        self.assertTrue(data["is_synthetic"])
        self.assertEqual(data["total_monitored_zones"], 4)
        hotspots = data["hotspots"]
        self.assertEqual(len(hotspots), 4)

        # Verify sorting by occupancy descending
        for i in range(len(hotspots) - 1):
            self.assertGreaterEqual(hotspots[i]["current_occupancy_pct"], hotspots[i + 1]["current_occupancy_pct"])
            self.assertEqual(hotspots[i]["rank"], i + 1)
            self.assertTrue(hotspots[i]["is_synthetic"])

    def test_07_summary_endpoint(self):
        """Verify GET /api/v1/analytics/summary returns system-wide aggregate KPIs."""
        response = self.client.get("/api/v1/analytics/summary")
        self.assertEqual(response.status_code, 200)
        data = response.json()

        self.assertTrue(data["is_synthetic"])
        self.assertTrue(0.0 <= data["overall_network_occupancy_pct"] <= 100.0)
        self.assertEqual(data["active_zones_monitored"], 4)
        self.assertIn(data["flow_status"], ["OPTIMAL", "MODERATE_CONGESTION", "SURGE_WARNING"])
        self.assertIn(data["uncertainty_rating"], ["LOW", "MODERATE", "HIGH"])
        self.assertGreaterEqual(data["data_quality_score"], 0.90)


if __name__ == "__main__":
    unittest.main()
