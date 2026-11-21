"""
Operation Prahaar AI - Human Review Schemas
Mandatory before any alert or incident can be escalated.
"""

from typing import Optional
from datetime import datetime
from pydantic import BaseModel, ConfigDict, Field


class HumanReviewCreate(BaseModel):
    alert_id: Optional[str] = None
    incident_id: str
    reviewer_badge_or_username: str = Field(..., example="OFFICER-7892")
    action: str = Field(..., example="VERIFIED")  # VERIFIED, DISMISSED, ESCALATED
    rationale: str = Field(..., min_length=5, example="Visual inspection of CCTV verifies localized bottleneck due to train arrival.")


class HumanReviewRead(BaseModel):
    id: str
    alert_id: Optional[str]
    incident_id: str
    reviewer_id: str
    action: str
    rationale: str
    prior_status: str
    new_status: str
    reviewed_at: datetime

    model_config = ConfigDict(from_attributes=True)
