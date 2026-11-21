"""
Operation Prahaar AI - Incident Schemas
"""

from typing import Optional, List
from datetime import datetime
from pydantic import BaseModel, ConfigDict, Field


class IncidentBase(BaseModel):
    incident_code: str = Field(..., example="INC-2026-0001")
    title: str = Field(..., example="Sudden Crowd Surge at Gate 3 Entrance")
    description: str = Field(..., example="Rapid density buildup exceeding 80% threshold in pedestrian bottleneck.")
    status: str = Field("NEW", example="NEW")
    priority: str = Field("HIGH", example="HIGH")
    confidence_score: float = Field(..., ge=0.0, le=1.0, example=0.88)
    uncertainty_level: str = Field("LOW", example="LOW")
    explanation: str = Field(..., example="Density ratio increased from 0.35 to 0.82 in 12 seconds; matched active transit advisory.")
    triggered_rule: str = Field(..., example="CONGESTION_RAPID_BUILDUP_RULE")
    location_id: str
    advisory_id: Optional[str] = None


class IncidentCreate(IncidentBase):
    pass


class IncidentRead(IncidentBase):
    id: str
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)
