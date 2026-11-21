"""
Operation Prahaar AI - Alert Schemas
Defaults strictly to UNVERIFIED per Responsible AI principles.
"""

from typing import Optional
from datetime import datetime
from pydantic import BaseModel, ConfigDict, Field


class AlertBase(BaseModel):
    alert_code: str = Field(..., example="ALT-2026-0001")
    incident_id: str
    camera_id: str
    alert_type: str = Field(..., example="CROWD_CONGESTION_WARNING")
    severity: str = Field("MEDIUM", example="HIGH")
    title: str = Field(..., example="High Crowd Density Warning")
    summary: str = Field(..., example="Density 82% at Platform 1. Human review required before escalation.")
    review_status: str = Field("UNVERIFIED", example="UNVERIFIED")
    is_actionable: bool = Field(True, example=True)


class AlertCreate(AlertBase):
    pass


class AlertRead(AlertBase):
    id: str
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)
