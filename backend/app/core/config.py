"""
Operation Prahaar AI - Core System Configuration & Constants
"""

from typing import List
import os


class Settings:
    """Application settings with environment variable overrides and sensible local defaults."""

    # Application Metadata
    APP_NAME: str = os.getenv("APP_NAME", "OPERATION PRAHAAR AI")
    APP_VERSION: str = os.getenv("APP_VERSION", "1.0.0")
    ENVIRONMENT: str = os.getenv("ENVIRONMENT", "development")
    DEBUG: bool = os.getenv("DEBUG", "True").lower() in ("true", "1", "yes")

    # API Configuration
    API_V1_PREFIX: str = os.getenv("API_V1_PREFIX", "/api/v1")
    BACKEND_HOST: str = os.getenv("BACKEND_HOST", "127.0.0.1")
    BACKEND_PORT: int = int(os.getenv("BACKEND_PORT", "8000"))
    SECRET_KEY: str = os.getenv("SECRET_KEY", "prahaar-prototype-dev-secret-key-change-in-production-2026")

    # Database Configuration (Local SQLite for ₹0 cost laptop development)
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./prahaar.db")

    # Responsible AI Constraints (Hardcoded Safety Invariants)
    PRIVACY_PRESERVING_MODE: bool = True
    ALLOW_FACIAL_RECOGNITION: bool = False
    ALLOW_INDIVIDUAL_PROFILING: bool = False
    REQUIRE_HUMAN_VERIFICATION: bool = True
    AUDIT_LOG_RETENTION_DAYS: int = int(os.getenv("AUDIT_LOG_RETENTION_DAYS", "90"))

    # CORS Configuration
    CORS_ORIGINS: List[str] = [
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ]


# Singleton instance
settings = Settings()
