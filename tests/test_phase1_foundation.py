"""
Operation Prahaar AI - Phase 1 Foundation & Guardrails Unit Tests
"""

import sys
import unittest
from pathlib import Path

# Add project root to sys.path
BASE_DIR = Path(__file__).resolve().parent.parent
if str(BASE_DIR) not in sys.path:
    sys.path.insert(0, str(BASE_DIR))


class TestPhase1Foundation(unittest.TestCase):
    """Test suite for Phase 1 folder structure and foundational configurations."""

    def test_required_phase1_directories_exist(self):
        """Verify that all core Phase 1 architectural directories exist."""
        expected_directories = [
            BASE_DIR / "backend",
            BASE_DIR / "backend" / "app",
            BASE_DIR / "backend" / "app" / "core",
            BASE_DIR / "backend" / "app" / "db",
            BASE_DIR / "backend" / "app" / "models",
            BASE_DIR / "backend" / "app" / "schemas",
            BASE_DIR / "backend" / "app" / "api",
            BASE_DIR / "backend" / "app" / "services",
            BASE_DIR / "edge",
            BASE_DIR / "frontend",
            BASE_DIR / "data" / "samples",
            BASE_DIR / "data" / "advisories",
            BASE_DIR / "docs",
            BASE_DIR / "scripts",
            BASE_DIR / "tests",
        ]
        for dir_path in expected_directories:
            self.assertTrue(dir_path.is_dir(), f"Expected directory missing: {dir_path}")

    def test_required_phase1_files_exist(self):
        """Verify that all core configuration, documentation, and requirements files exist."""
        expected_files = [
            BASE_DIR / ".gitignore",
            BASE_DIR / ".env.example",
            BASE_DIR / "README.md",
            BASE_DIR / "docs" / "ARCHITECTURE.md",
            BASE_DIR / "docs" / "RESPONSIBLE_AI.md",
            BASE_DIR / "docs" / "HARDWARE_ROADMAP.md",
            BASE_DIR / "backend" / "requirements.txt",
            BASE_DIR / "backend" / "requirements-dev.txt",
            BASE_DIR / "edge" / "requirements-edge.txt",
            BASE_DIR / "backend" / "app" / "core" / "config.py",
            BASE_DIR / "edge" / "config.py",
        ]
        for file_path in expected_files:
            self.assertTrue(file_path.is_file(), f"Expected file missing: {file_path}")

    def test_responsible_ai_invariants(self):
        """Verify that safety and privacy invariants are strictly set to compliant values."""
        from backend.app.core.config import settings

        self.assertFalse(settings.ALLOW_FACIAL_RECOGNITION, "Facial recognition must be prohibited")
        self.assertFalse(settings.ALLOW_INDIVIDUAL_PROFILING, "Individual profiling must be prohibited")
        self.assertTrue(settings.REQUIRE_HUMAN_VERIFICATION, "Human verification must be strictly required")
        self.assertTrue(settings.PRIVACY_PRESERVING_MODE, "Privacy preserving mode must be active")

    def test_edge_configuration_defaults(self):
        """Verify that edge configuration imposes lightweight resource constraints."""
        from edge.config import edge_settings

        self.assertLessEqual(edge_settings.MAX_PROCESSING_FPS, 15, "FPS must be capped to prevent laptop CPU throttling")
        self.assertLessEqual(edge_settings.FRAME_WIDTH, 1280, "Resolution must be capped for edge simulation")
        self.assertTrue(edge_settings.DEVICE_ID.startswith("EDGE-"), "Edge ID must follow standard naming schema")


if __name__ == "__main__":
    unittest.main()

