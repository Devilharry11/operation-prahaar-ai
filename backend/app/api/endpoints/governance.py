"""
Operation Prahaar AI - Phase C Multi-Tier Human Governance Endpoints
Implements the 3-tier sequential human verification decision gates:
Tier 1: Control Room Operator Verification (VERIFIED / DISMISSED)
Tier 2: Watch Officer Confirmation / Return (CONFIRMED / RETURNED)
Tier 3: Chief Controller Public Safety Advisory Publication Sign-Off (APPROVED / REJECTED)
Queue: Real-time inspection queue partitioned across all 3 tiers.

Strictly human-in-the-loop: Zero autonomous dispatch, zero automated enforcement.
"""

from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session
from backend.app.db.session import get_db
from backend.app.core.auth import get_current_operator
from backend.app.models.entities import User
from backend.app.schemas.governance import (
    Tier1ReviewRequest,
    Tier2ReviewRequest,
    Tier3ReviewRequest,
    GovernanceReviewResponse,
    GovernanceQueueResponse,
)
from backend.app.services.governance import GovernanceService

router = APIRouter()


@router.post(
    "/tier1",
    response_model=GovernanceReviewResponse,
    status_code=status.HTTP_200_OK,
    summary="Tier 1: Operator Initial Review & Verification",
)
def process_tier1_review(
    payload: Tier1ReviewRequest,
    current_user: User = Depends(get_current_operator),
    db: Session = Depends(get_db),
):
    """
    Tier 1 Operational Inspection:
    - Verifies or dismisses an unverified incident.
    - Requires COMMAND_OPERATOR or CHIEF_CONTROLLER role.
    - Requires minimum 15 characters operational rationale.
    - Updates incident and linked alert state atomically.
    """
    return GovernanceService.process_tier1(db=db, payload=payload, current_user=current_user)


@router.post(
    "/tier2",
    response_model=GovernanceReviewResponse,
    status_code=status.HTTP_200_OK,
    summary="Tier 2: Watch Officer Tactical Confirmation / Return",
)
def process_tier2_review(
    payload: Tier2ReviewRequest,
    current_user: User = Depends(get_current_operator),
    db: Session = Depends(get_db),
):
    """
    Tier 2 Supervisory Review:
    - Confirms or returns an incident previously verified at Tier 1.
    - Requires INTELLIGENCE_ANALYST, COMMAND_OPERATOR, or CHIEF_CONTROLLER role.
    - Strictly rejects incidents that have not passed Tier 1 verification.
    - Requires minimum 15 characters supervisory rationale.
    """
    return GovernanceService.process_tier2(db=db, payload=payload, current_user=current_user)


@router.post(
    "/tier3",
    response_model=GovernanceReviewResponse,
    status_code=status.HTTP_200_OK,
    summary="Tier 3: Chief Controller Advisory Publication Sign-Off",
)
def process_tier3_review(
    payload: Tier3ReviewRequest,
    current_user: User = Depends(get_current_operator),
    db: Session = Depends(get_db),
):
    """
    Tier 3 Executive Authorization:
    - Approves or rejects publication of a Public Safety Advisory.
    - Strictly requires CHIEF_CONTROLLER role.
    - Strictly rejects incidents not confirmed at Tier 2 (TACTICAL_CONFIRMED).
    - Requires minimum 15 characters controller comments.
    """
    return GovernanceService.process_tier3(db=db, payload=payload, current_user=current_user)


@router.get(
    "/queue",
    response_model=GovernanceQueueResponse,
    status_code=status.HTTP_200_OK,
    summary="Get multi-tier human governance queues",
)
def get_governance_queues(
    db: Session = Depends(get_db),
):
    """
    Returns pending items for all 3 verification tiers:
    - Tier 1: Incidents in NEW or UNVERIFIED status.
    - Tier 2: Incidents in VERIFIED status.
    - Tier 3: Incidents in TACTICAL_CONFIRMED status.
    """
    return GovernanceService.get_queues(db=db)
