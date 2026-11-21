"""
Operation Prahaar AI - Security Advisory Endpoints
"""

from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from backend.app.db.session import get_db
from backend.app.models.entities import SecurityAdvisory, AuditLog
from backend.app.schemas.advisory import SecurityAdvisoryCreate, SecurityAdvisoryRead
from backend.app.models.enums import AuditAction

router = APIRouter(tags=["Security Advisories"])


@router.get("/advisories", response_model=List[SecurityAdvisoryRead])
def list_advisories(active_only: bool = True, db: Session = Depends(get_db)):
    """List verified security advisories."""
    query = db.query(SecurityAdvisory)
    if active_only:
        query = query.filter(SecurityAdvisory.is_active.is_(True))
    return query.order_by(SecurityAdvisory.created_at.desc()).all()


@router.post("/advisories", response_model=SecurityAdvisoryRead, status_code=status.HTTP_201_CREATED)
def create_advisory(payload: SecurityAdvisoryCreate, db: Session = Depends(get_db)):
    """Ingest a verified advisory issued by authorized public safety agencies."""
    existing = db.query(SecurityAdvisory).filter(SecurityAdvisory.advisory_code == payload.advisory_code).first()
    if existing:
        raise HTTPException(status_code=400, detail="Advisory code already exists")

    advisory = SecurityAdvisory(
        advisory_code=payload.advisory_code,
        issuing_agency=payload.issuing_agency,
        title=payload.title,
        summary=payload.summary,
        threat_level=payload.threat_level,
        target_locations=payload.target_locations,
        recommended_actions=payload.recommended_actions,
        valid_from=payload.valid_from,
        valid_to=payload.valid_to,
        is_active=payload.is_active,
    )
    db.add(advisory)

    audit = AuditLog(
        event_type=AuditAction.ADVISORY_INGESTED.value,
        actor_id=payload.issuing_agency,
        action_summary=f"Security Advisory Ingested: {advisory.advisory_code} - {advisory.title}",
        after_state_json=f'{{"code": "{advisory.advisory_code}", "threat_level": "{advisory.threat_level}"}}',
    )
    db.add(audit)
    db.commit()
    db.refresh(advisory)
    return advisory
