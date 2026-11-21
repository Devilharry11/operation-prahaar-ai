"""
Operation Prahaar AI - Health & System Status Endpoint
"""

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import text
from backend.app.db.session import get_db
from backend.app.core.config import settings
from backend.app.schemas.common import SystemHealthResponse

router = APIRouter(tags=["Health"])


@router.get("/health", response_model=SystemHealthResponse)
def get_system_health(db: Session = Depends(get_db)):
    """
    Returns operational readiness status and verifies strict Responsible AI constraints.
    """
    db_ok = False
    try:
        db.execute(text("SELECT 1"))
        db_ok = True
    except Exception:
        db_ok = False

    return SystemHealthResponse(
        status="OPERATIONAL" if db_ok else "DEGRADED",
        app_name=settings.APP_NAME,
        version=settings.APP_VERSION,
        environment=settings.ENVIRONMENT,
        database_connected=db_ok,
        privacy_preserving_mode=settings.PRIVACY_PRESERVING_MODE,
        facial_recognition_prohibited=(not settings.ALLOW_FACIAL_RECOGNITION),
        human_verification_enforced=settings.REQUIRE_HUMAN_VERIFICATION,
    )
