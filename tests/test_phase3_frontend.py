"""
Operation Prahaar AI - Phase 3 Frontend Command Center Verification Tests
"""

import sys
import unittest
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent


class TestPhase3Frontend(unittest.TestCase):
    """Test suite verifying Phase 3 Command Center dashboard components and build artifacts."""

    def test_frontend_project_configuration_exists(self):
        """Verify Vite, TypeScript, and Tailwind configuration files."""
        expected_configs = [
            BASE_DIR / "frontend" / "package.json",
            BASE_DIR / "frontend" / "vite.config.ts",
            BASE_DIR / "frontend" / "tsconfig.json",
            BASE_DIR / "frontend" / "tailwind.config.js",
            BASE_DIR / "frontend" / "postcss.config.js",
            BASE_DIR / "frontend" / "index.html",
        ]
        for cfg in expected_configs:
            self.assertTrue(cfg.is_file(), f"Configuration missing: {cfg}")

    def test_all_12_command_center_views_exist(self):
        """Verify that all 12 requested command center section views are implemented."""
        views_dir = BASE_DIR / "frontend" / "src" / "views"
        expected_views = [
            "OverviewDashboard.tsx",      # 1. Overview Dashboard
            "CameraManagement.tsx",      # 2. Camera Management
            "LiveVideoMonitoring.tsx",  # 3. Live/Sample Video Monitoring
            "CrowdAnalytics.tsx",        # 4. Crowd Analytics
            "SafetyEvents.tsx",          # 5. Safety Events
            "IncidentManagement.tsx",    # 6. Incident Management
            "SecurityIntelligence.tsx", # 7. Security Intelligence
            "AlertCenter.tsx",           # 8. Alert Center
            "HumanVerification.tsx",     # 9. Human Verification
            "AuditLogs.tsx",             # 10. Audit Logs
            "EdgeDeviceManagement.tsx",  # 11. Edge Device Management
            "SystemSettings.tsx",        # 12. System Settings
        ]
        for view_name in expected_views:
            view_path = views_dir / view_name
            self.assertTrue(view_path.is_file(), f"View component missing: {view_name}")

    def test_brand_identity_and_components_exist(self):
        """Verify Header, Sidebar, Type definitions, and API client."""
        src_dir = BASE_DIR / "frontend" / "src"
        self.assertTrue((src_dir / "components" / "Header.tsx").is_file())
        self.assertTrue((src_dir / "components" / "Sidebar.tsx").is_file())
        self.assertTrue((src_dir / "services" / "api.ts").is_file())
        self.assertTrue((src_dir / "types" / "index.ts").is_file())
        self.assertTrue((src_dir / "App.tsx").is_file())

    def test_production_build_bundle_exists(self):
        """Verify that the production build succeeded and artifacts are present."""
        dist_dir = BASE_DIR / "frontend" / "dist"
        self.assertTrue(dist_dir.is_dir(), "Frontend dist directory missing")
        self.assertTrue((dist_dir / "index.html").is_file(), "Built index.html missing")
        assets = list((dist_dir / "assets").glob("*.js"))
        self.assertGreater(len(assets), 0, "No built JavaScript bundles found in dist/assets")


if __name__ == "__main__":
    unittest.main()
