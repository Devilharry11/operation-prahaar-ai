"""
Operation Prahaar AI - Human Review Verification Endpoints
Enforces mandatory human verification before any incident or alert can be escalated.
"""

from typing import List
import json
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from backend.app.db.session import get_db
from backend.app.core.datetime_util import utc_now
from backend.app.models.entities import HumanReview, Alert, Incident, User, AuditLog
from backend.app.services.audit_chain import AuditChainService
from backend.app.schemas.review import HumanReviewCreate, HumanReviewRead
from backend.app.models.enums import ReviewStatus, IncidentStatus, AuditAction

router = APIRouter(tags=["Human Verification"])


@router.post("/reviews", response_model=HumanReviewRead, status_code=status.HTTP_201_CREATED)
def submit_human_review(payload: HumanReviewCreate, db: Session = Depends(get_db)):
    """
    Authorized human review of an incident / alert.
    Action must be one of: VERIFIED, DISMISSED, ESCALATED.
    """
    # 1. Validate Reviewer
    reviewer = db.query(User).filter(
        (User.badge_number == payload.reviewer_badge_or_username) |
        (User.username == payload.reviewer_badge_or_username)
    ).first()
    if not reviewer:
        raise HTTPException(
            status_code=400,
            detail=f"Authorized reviewer '{payload.reviewer_badge_or_username}' not recognized"
        )

    # 2. Validate Incident
    incident = db.query(Incident).filter(Incident.id == payload.incident_id).first()
    if not incident:
        raise HTTPException(status_code=404, detail="Incident not found")

    prior_status = incident.status
    action_upper = payload.action.upper()

    if action_upper not in ("VERIFIED", "DISMISSED", "ESCALATED"):
        raise HTTPException(status_code=400, detail="Action must be VERIFIED, DISMISSED, or ESCALATED")

    # 3. Map new status
    if action_upper == "VERIFIED":
        new_incident_status = IncidentStatus.VERIFIED.value
        new_alert_status = ReviewStatus.VERIFIED.value
    elif action_upper == "DISMISSED":
        new_incident_status = IncidentStatus.DISMISSED.value
        new_alert_status = ReviewStatus.REJECTED.value
    else:  # ESCALATED
        new_incident_status = IncidentStatus.ESCALATED.value
        new_alert_status = ReviewStatus.ESCALATED.value

    incident.status = new_incident_status

    # 4. If alert_id is provided, update Alert
    if payload.alert_id:
        alert = db.query(Alert).filter(Alert.id == payload.alert_id).first()
        if alert:
            alert.review_status = new_alert_status

    # 5. Create HumanReview Record
    review = HumanReview(
        alert_id=payload.alert_id,
        incident_id=payload.incident_id,
        reviewer_id=reviewer.id,
        action=action_upper,
        rationale=payload.rationale,
        prior_status=prior_status,
        new_status=new_incident_status,
        reviewed_at=utc_now(),
    )
    db.add(review)

    # 6. Append to Tamper-Evident Cryptographically Chained Audit Log
    audit = AuditChainService.append_audit_log(
        db=db,
        event_type=AuditAction.HUMAN_VERIFICATION.value,
        actor_id=reviewer.badge_number,
        action_summary=f"Human Reviewer {reviewer.full_name} ({reviewer.badge_number}) marked Incident {incident.incident_code} as {action_upper}. Rationale: {payload.rationale}",
        record_reference=incident.incident_code,
        before_state_json=json.dumps({"status": prior_status}),
        after_state_json=json.dumps({"status": new_incident_status, "rationale": payload.rationale}),
    )

    db.commit()
    db.refresh(review)
    return review


@router.get("/reviews", response_model=List[HumanReviewRead])
def list_human_reviews(incident_id: str = None, limit: int = 50, db: Session = Depends(get_db)):
    """List recent human verification actions."""
    query = db.query(HumanReview)
    if incident_id:
        query = query.filter(HumanReview.incident_id == incident_id)
    return query.order_by(HumanReview.reviewed_at.desc()).limit(limit).all()
