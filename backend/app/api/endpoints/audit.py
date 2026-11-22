"""
Operation Prahaar AI - Audit Log Query & Cryptographic Verification Endpoints
Immutable, tamper-evident audit ledger with SHA-256 cryptographic chain verification.
"""

from typing import List, Optional
from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session
from backend.app.db.session import get_db
from backend.app.models.entities import AuditLog
from backend.app.schemas.audit import AuditLogRead
from backend.app.schemas.audit_verify import AuditVerificationResponse
from backend.app.services.audit_chain import AuditChainService

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
    return query.order_by(AuditLog.created_at.desc(), AuditLog.id.desc()).limit(limit).all()


@router.post("/audit-logs/verify-chain", response_model=AuditVerificationResponse)
@router.get("/audit-logs/verify-chain", response_model=AuditVerificationResponse)
def verify_audit_ledger_chain(
    db: Session = Depends(get_db),
):
    """
    Cryptographic Audit Verification:
    - Traverses entire audit ledger from genesis block to current chain head.
    - Recomputes SHA-256 hash for every record from its canonical contents.
    - Validates sequential predecessor hash linkage.
    - Detects content tampering, deletion, or record reordering.
    """
    return AuditChainService.verify_audit_chain(db=db)


@router.post("/audit-logs/backfill-chain")
def backfill_audit_ledger_chain(
    db: Session = Depends(get_db),
):
    """
    Cryptographic Backfill Utility:
    Calculates and links hashes for existing unchained audit records without mutating event data.
    """
    updated = AuditChainService.backfill_existing_audit_logs(db=db)
    return {
        "success": True,
        "records_backfilled": updated,
        "message": f"Successfully backfilled {updated} audit records into cryptographic hash chain.",
    }
