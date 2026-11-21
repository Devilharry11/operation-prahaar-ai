"""
Operation Prahaar AI - Audit Log Query Endpoints
Immutable, tamper-evident audit ledger.
"""

from typing import List, Optional
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from backend.app.db.session import get_db
from backend.app.models.entities import AuditLog
from backend.app.schemas.audit import AuditLogRead

router = APIRouter(tags=["Audit Logs"])


@router.get("/audit-logs", response_model=List[AuditLogRead])
def list_audit_logs(
    event_type: Optional[str] = None,
    actor_id: Optional[str] = None,
    limit: int = 100,
    db: Session = Depends(get_db),
):
    """
    Retrieve chronological audit trail records.
    Provides complete transparency into human reviews and system events.
    """
    query = db.query(AuditLog)
    if event_type:
        query = query.filter(AuditLog.event_type == event_type)
    if actor_id:
        query = query.filter(AuditLog.actor_id == actor_id)
    return query.order_by(AuditLog.created_at.desc()).limit(limit).all()
