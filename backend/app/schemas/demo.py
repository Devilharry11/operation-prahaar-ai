"""
Operation Prahaar AI - Synthetic Demo Controller Schemas
Strictly limited to safe, non-identifying public safety demonstration scenarios.
"""

from typing import Optional, List, Dict, Any
from datetime import datetime
from pydantic import BaseModel, ConfigDict, Field
from enum import Enum


class DemoScenarioType(str, Enum):
    AGGREGATE_OCCUPANCY_EXCEEDED = "AGGREGATE_OCCUPANCY_EXCEEDED"
    SIMULATED_CONGESTION_ADVISORY = "SIMULATED_CONGESTION_ADVISORY"
    SYSTEM_HEALTH_WARNING = "SYSTEM_HEALTH_WARNING"
    EDGE_CONNECTIVITY_INTERRUPTION = "EDGE_CONNECTIVITY_INTERRUPTION"
    INFORMATION_ADVISORY = "INFORMATION_ADVISORY"


class DemoEventRequest(BaseModel):
    scenario: DemoScenarioType = Field(
        ...,
        description="Safe non-identifying public-safety demonstration scenario",
        example=DemoScenarioType.AGGREGATE_OCCUPANCY_EXCEEDED
    )
    camera_id: Optional[str] = Field(None, example="cam-ndls-01")
    severity: Optional[str] = Field("HIGH", example="HIGH")
    custom_note: Optional[str] = Field(None, example="Hackathon Stage Demonstration Event")


class DemoBatchRequest(BaseModel):
    count: int = Field(3, ge=1, le=5, description="Number of synthetic demonstration events to generate (1 to 5)")
    camera_id: Optional[str] = None


class DemoEventResponse(BaseModel):
    success: bool = True
    message: str
    scenario: str
    event_id: str
    incident_id: str
    incident_code: str
    alert_id: str
    alert_code: str
    review_status: str = "UNVERIFIED"
    timestamp: datetime


class DemoResetRequest(BaseModel):
    confirm: bool = Field(..., description="Must explicitly be true to confirm reset")
    operator_badge: Optional[str] = Field(None, example="IND-OPR-4081", description="Client reference identifier; actual authorization is enforced via authenticated session")


class DemoResetResponse(BaseModel):
    success: bool
    message: str
    deleted_events_count: int
    deleted_incidents_count: int
    deleted_alerts_count: int
    audit_log_id: str
    timestamp: datetime
