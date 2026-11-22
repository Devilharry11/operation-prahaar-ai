"""
Operation Prahaar AI - Phase C Multi-Tier Human Governance Service
Implements a 3-tier human-in-the-loop decision gate:
Tier 1: Operator Inspection & Verification (VERIFIED / DISMISSED)
Tier 2: Watch Officer Confirmation / Return (CONFIRMED / RETURNED)
Tier 3: Chief Controller Advisory Sign-Off (APPROVED / REJECTED)
Strictly non-identifying; zero autonomous enforcement.
"""

from typing import List, Optional
from datetime import datetime, timezone
import json
import uuid
from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from backend.app.models.entities import Incident, Alert, HumanReview, Approval, AuditLog, User, Role
from backend.app.services.audit_chain import AuditChainService
from backend.app.schemas.governance import (
    Tier1ReviewRequest,
    Tier2ReviewRequest,
    Tier3ReviewRequest,
    GovernanceReviewResponse,
    GovernanceQueueItem,
    GovernanceQueueResponse,
)


def _validate_min_length(text: str, min_chars: int = 15, field_name: str = "Rationale") -> None:
    """Validate mandatory human review text length."""
    if not text or len(text.strip()) < min_chars:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=f"{field_name} is mandatory and must contain at least {min_chars} characters for compliance audit trail."
        )


class GovernanceService:
    """Core multi-tier governance state machine and verification workflows."""

    @staticmethod
    def process_tier1(db: Session, payload: Tier1ReviewRequest, current_user: User) -> GovernanceReviewResponse:
        """
        Tier 1: Control Room Operator Inspection.
        Permitted roles: COMMAND_OPERATOR, CHIEF_CONTROLLER.
        """
        role_name = current_user.role.name if current_user.role else ""
        if role_name not in ["COMMAND_OPERATOR", "CHIEF_CONTROLLER"]:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Tier 1 review requires COMMAND_OPERATOR or CHIEF_CONTROLLER role. Current role: '{role_name}'."
            )

        _validate_min_length(payload.rationale, 15, "Operational rationale")

        incident = db.query(Incident).filter(Incident.id == payload.incident_id).first()
        if not incident:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Incident '{payload.incident_id}' not found.")

        now = datetime.now(timezone.utc)
        action_upper = payload.action.upper()
        prior_status = incident.status

        if action_upper == "VERIFIED":
            new_inc_status = "VERIFIED"
            new_alt_status = "VERIFIED"
        else:
            new_inc_status = "DISMISSED"
            new_alt_status = "REJECTED"

        incident.status = new_inc_status
        incident.updated_at = now

        # Update linked alert if provided or find first alert
        alert = None
        if payload.alert_id:
            alert = db.query(Alert).filter(Alert.id == payload.alert_id).first()
        if not alert:
            alert = db.query(Alert).filter(Alert.incident_id == incident.id).first()

        if alert:
            alert.review_status = new_alt_status

        # Create HumanReview record
        review = HumanReview(
            alert_id=alert.id if alert else None,
            incident_id=incident.id,
            reviewer_id=current_user.id,
            action=action_upper,
            rationale=payload.rationale,
            prior_status=prior_status,
            new_status=new_inc_status,
            reviewed_at=now,
        )
        db.add(review)

        # Audit Log (Cryptographically Chained)
        audit = AuditChainService.append_audit_log(
            db=db,
            event_type="HUMAN_VERIFICATION",
            actor_id=current_user.badge_number,
            action_summary=f"Tier-1 Operator ({current_user.badge_number}) marked Incident {incident.incident_code} as {action_upper}.",
            record_reference=incident.incident_code,
            before_state_json=json.dumps({"status": prior_status}),
            after_state_json=json.dumps({"status": new_inc_status, "rationale": payload.rationale, "tier": 1}),
            created_at=now,
        )
        db.commit()

        return GovernanceReviewResponse(
            success=True,
            tier=1,
            incident_id=incident.id,
            incident_code=incident.incident_code,
            action=action_upper,
            new_status=new_inc_status,
            operator_badge=current_user.badge_number,
            timestamp=now.isoformat(),
            audit_log_id=audit.id,
            message=f"Tier-1 verification submitted by {current_user.badge_number}: Incident status updated to {new_inc_status}.",
            is_synthetic=True,
        )

    @staticmethod
    def process_tier2(db: Session, payload: Tier2ReviewRequest, current_user: User) -> GovernanceReviewResponse:
        """
        Tier 2: Senior Watch Officer Supervisory Review.
        Permitted roles: INTELLIGENCE_ANALYST, COMMAND_OPERATOR, CHIEF_CONTROLLER.
        Prerequisite: Incident must be in VERIFIED state from Tier 1.
        """
        role_name = current_user.role.name if current_user.role else ""
        if role_name not in ["INTELLIGENCE_ANALYST", "COMMAND_OPERATOR", "CHIEF_CONTROLLER"]:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Tier 2 supervisory review requires INTELLIGENCE_ANALYST or higher role. Current role: '{role_name}'."
            )

        _validate_min_length(payload.explanation, 15, "Supervisory explanation")

        incident = db.query(Incident).filter(Incident.id == payload.incident_id).first()
        if not incident:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Incident '{payload.incident_id}' not found.")

        # Invariant: Tier 2 requires incident to have passed Tier 1 VERIFIED
        if incident.status != "VERIFIED":
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=(
                    f"Tier-2 review rejected: Incident '{incident.incident_code}' is in '{incident.status}' state. "
                    f"Only Tier-1 VERIFIED incidents can proceed to Tier-2 supervisory confirmation."
                )
            )

        now = datetime.now(timezone.utc)
        action_upper = payload.action.upper()
        prior_status = incident.status

        if action_upper == "CONFIRMED":
            new_inc_status = "TACTICAL_CONFIRMED"
            approval_status = "APPROVED"
        else:  # RETURNED
            new_inc_status = "NEW"
            approval_status = "REJECTED"
            # Return alert to UNVERIFIED so Tier-1 can re-evaluate
            alert = db.query(Alert).filter(Alert.incident_id == incident.id).first()
            if alert:
                alert.review_status = "UNVERIFIED"

        incident.status = new_inc_status
        incident.updated_at = now

        # Create or update Tier-2 approval record
        approval = Approval(
            incident_id=incident.id,
            approver_id=current_user.id,
            approval_type="WATCH_OFFICER_CONFIRMATION",
            status=approval_status,
            comments=payload.explanation,
            created_at=now,
            decided_at=now,
        )
        db.add(approval)

        audit = AuditChainService.append_audit_log(
            db=db,
            event_type="WATCH_OFFICER_CONFIRMATION",
            actor_id=current_user.badge_number,
            action_summary=f"Tier-2 Watch Officer ({current_user.badge_number}) marked Incident {incident.incident_code} as {action_upper}.",
            record_reference=incident.incident_code,
            before_state_json=json.dumps({"status": prior_status}),
            after_state_json=json.dumps({"status": new_inc_status, "explanation": payload.explanation, "tier": 2}),
            created_at=now,
        )
        db.commit()

        return GovernanceReviewResponse(
            success=True,
            tier=2,
            incident_id=incident.id,
            incident_code=incident.incident_code,
            action=action_upper,
            new_status=new_inc_status,
            operator_badge=current_user.badge_number,
            timestamp=now.isoformat(),
            audit_log_id=audit.id,
            message=f"Tier-2 confirmation submitted by {current_user.badge_number}: Incident status updated to {new_inc_status}.",
            is_synthetic=True,
        )

    @staticmethod
    def process_tier3(db: Session, payload: Tier3ReviewRequest, current_user: User) -> GovernanceReviewResponse:
        """
        Tier 3: Chief Controller Public Safety Advisory Publication Sign-Off.
        Permitted roles: CHIEF_CONTROLLER strictly.
        Prerequisite: Incident must be in TACTICAL_CONFIRMED state from Tier 2.
        """
        role_name = current_user.role.name if current_user.role else ""
        if role_name != "CHIEF_CONTROLLER":
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Tier 3 executive release sign-off strictly requires CHIEF_CONTROLLER authority. Current role: '{role_name}'."
            )

        _validate_min_length(payload.controller_comments, 15, "Controller comments")

        incident = db.query(Incident).filter(Incident.id == payload.incident_id).first()
        if not incident:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Incident '{payload.incident_id}' not found.")

        # Invariant: Tier 3 requires prior Tier 2 confirmation
        if incident.status != "TACTICAL_CONFIRMED":
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=(
                    f"Tier-3 advisory sign-off rejected: Incident '{incident.incident_code}' is in '{incident.status}' state. "
                    f"Only Tier-2 TACTICAL_CONFIRMED incidents can receive Chief Controller advisory sign-off."
                )
            )

        now = datetime.now(timezone.utc)
        action_upper = payload.action.upper()
        prior_status = incident.status

        if action_upper == "APPROVED":
            new_inc_status = "ADVISORY_PUBLISHED"
            approval_status = "APPROVED"
        else:  # REJECTED
            new_inc_status = "ADVISORY_REJECTED"
            approval_status = "REJECTED"

        incident.status = new_inc_status
        incident.updated_at = now

        approval = Approval(
            incident_id=incident.id,
            advisory_id=payload.advisory_id,
            approver_id=current_user.id,
            approval_type="EXECUTIVE_ADVISORY_SIGN_OFF",
            status=approval_status,
            comments=payload.controller_comments,
            created_at=now,
            decided_at=now,
        )
        db.add(approval)

        audit = AuditChainService.append_audit_log(
            db=db,
            event_type="EXECUTIVE_ADVISORY_SIGN_OFF",
            actor_id=current_user.badge_number,
            action_summary=f"Tier-3 Chief Controller ({current_user.badge_number}) {action_upper} public safety advisory release for {incident.incident_code}.",
            record_reference=incident.incident_code,
            before_state_json=json.dumps({"status": prior_status}),
            after_state_json=json.dumps({"status": new_inc_status, "comments": payload.controller_comments, "tier": 3}),
            created_at=now,
        )
        db.commit()

        return GovernanceReviewResponse(
            success=True,
            tier=3,
            incident_id=incident.id,
            incident_code=incident.incident_code,
            action=action_upper,
            new_status=new_inc_status,
            operator_badge=current_user.badge_number,
            timestamp=now.isoformat(),
            audit_log_id=audit.id,
            message=f"Tier-3 Chief Controller sign-off ({action_upper}) completed: Incident updated to {new_inc_status}.",
            is_synthetic=True,
        )

    @staticmethod
    def get_queues(db: Session) -> GovernanceQueueResponse:
        """Retrieve items awaiting decisions in Tier 1, Tier 2, and Tier 3 queues."""
        now = datetime.now(timezone.utc)

        # Tier 1 Pending: status is NEW or UNVERIFIED
        t1_incidents = (
            db.query(Incident)
            .filter(Incident.status.in_(["NEW", "UNVERIFIED"]))
            .order_by(Incident.created_at.desc())
            .limit(20)
            .all()
        )
        t1_items = [
            GovernanceQueueItem(
                tier=1,
                incident_id=i.id,
                incident_code=i.incident_code,
                title=i.title,
                severity=i.priority,
                status=i.status,
                confidence_score=i.confidence_score,
                uncertainty_level=i.uncertainty_level,
                created_at=i.created_at.isoformat() if i.created_at else now.isoformat(),
                is_synthetic=True,
            )
            for i in t1_incidents
        ]

        # Tier 2 Pending: status is VERIFIED (awaiting Watch Officer confirmation)
        t2_incidents = (
            db.query(Incident)
            .filter(Incident.status == "VERIFIED")
            .order_by(Incident.updated_at.desc())
            .limit(20)
            .all()
        )
        t2_items = []
        for i in t2_incidents:
            last_review = db.query(HumanReview).filter(HumanReview.incident_id == i.id).order_by(HumanReview.reviewed_at.desc()).first()
            t2_items.append(
                GovernanceQueueItem(
                    tier=2,
                    incident_id=i.id,
                    incident_code=i.incident_code,
                    title=i.title,
                    severity=i.priority,
                    status=i.status,
                    confidence_score=i.confidence_score,
                    uncertainty_level=i.uncertainty_level,
                    tier1_status=last_review.action if last_review else "VERIFIED",
                    tier1_rationale=last_review.rationale if last_review else "Prior operator verification recorded.",
                    created_at=i.created_at.isoformat() if i.created_at else now.isoformat(),
                    is_synthetic=True,
                )
            )

        # Tier 3 Pending: status is TACTICAL_CONFIRMED (awaiting Controller Advisory approval)
        t3_incidents = (
            db.query(Incident)
            .filter(Incident.status == "TACTICAL_CONFIRMED")
            .order_by(Incident.updated_at.desc())
            .limit(20)
            .all()
        )
        t3_items = []
        for i in t3_incidents:
            last_approval = db.query(Approval).filter(Approval.incident_id == i.id).order_by(Approval.created_at.desc()).first()
            t3_items.append(
                GovernanceQueueItem(
                    tier=3,
                    incident_id=i.id,
                    incident_code=i.incident_code,
                    title=i.title,
                    severity=i.priority,
                    status=i.status,
                    confidence_score=i.confidence_score,
                    uncertainty_level=i.uncertainty_level,
                    tier2_status=last_approval.status if last_approval else "APPROVED",
                    tier2_explanation=last_approval.comments if last_approval else "Prior Watch Officer tactical confirmation.",
                    created_at=i.created_at.isoformat() if i.created_at else now.isoformat(),
                    is_synthetic=True,
                )
            )

        total = len(t1_items) + len(t2_items) + len(t3_items)
        return GovernanceQueueResponse(
            tier1_pending=t1_items,
            tier2_pending=t2_items,
            tier3_pending=t3_items,
            total_pending=total,
            is_synthetic=True,
            generated_at=now.isoformat(),
        )
