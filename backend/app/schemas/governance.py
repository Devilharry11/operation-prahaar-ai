"""
Operation Prahaar AI - Phase C Multi-Tier Human Governance Schemas
Defines request and response models for 3-tier human-in-the-loop verification.
Strictly non-identifying; zero autonomous enforcement.
"""

from typing import List, Optional
from pydantic import BaseModel, Field


class Tier1ReviewRequest(BaseModel):
    """Tier 1: Control Room Operator Inspection & Initial Verification."""
    incident_id: str = Field(..., description="ID of incident to review")
    alert_id: Optional[str] = Field(None, description="Optional linked alert ID")
    action: str = Field(..., pattern="^(VERIFIED|DISMISSED)$", description="Operator decision: VERIFIED or DISMISSED")
    rationale: str = Field(..., min_length=15, description="Mandatory operational review rationale (min 15 chars)")


class Tier2ReviewRequest(BaseModel):
    """Tier 2: Senior Watch Officer Confirmation / Return."""
    incident_id: str = Field(..., description="ID of incident to confirm or return")
    action: str = Field(..., pattern="^(CONFIRMED|RETURNED)$", description="Watch Officer action: CONFIRMED or RETURNED")
    explanation: str = Field(..., min_length=15, description="Mandatory supervisory rationale (min 15 chars)")


class Tier3ReviewRequest(BaseModel):
    """Tier 3: Chief Controller Public Safety Advisory Publication Approval."""
    incident_id: str = Field(..., description="ID of incident to approve advisory release for")
    advisory_id: Optional[str] = Field(None, description="Optional linked advisory ID")
    action: str = Field(..., pattern="^(APPROVED|REJECTED)$", description="Chief Controller decision: APPROVED or REJECTED")
    controller_comments: str = Field(..., min_length=15, description="Mandatory executive sign-off comments (min 15 chars)")


class GovernanceReviewResponse(BaseModel):
    """Unified response following any governance tier decision."""
    success: bool
    tier: int
    incident_id: str
    incident_code: str
    action: str
    new_status: str
    operator_badge: str
    timestamp: str
    audit_log_id: str
    message: str
    is_synthetic: bool = Field(True, description="Strict synthetic data marker")


class GovernanceQueueItem(BaseModel):
    """Item pending review in the governance queue."""
    tier: int
    incident_id: str
    incident_code: str
    title: str
    severity: str
    status: str
    confidence_score: float
    uncertainty_level: str
    tier1_status: Optional[str] = None
    tier1_rationale: Optional[str] = None
    tier2_status: Optional[str] = None
    tier2_explanation: Optional[str] = None
    created_at: str
    is_synthetic: bool = True


class GovernanceQueueResponse(BaseModel):
    """Overview of pending reviews across Tier 1, Tier 2, and Tier 3."""
    tier1_pending: List[GovernanceQueueItem]
    tier2_pending: List[GovernanceQueueItem]
    tier3_pending: List[GovernanceQueueItem]
    total_pending: int
    is_synthetic: bool = Field(True, description="Strict synthetic data marker")
    generated_at: str
