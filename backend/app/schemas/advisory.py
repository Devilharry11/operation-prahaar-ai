"""
Operation Prahaar AI - Security Advisory Schemas
"""

from typing import Optional
from datetime import datetime
from pydantic import BaseModel, ConfigDict, Field


class SecurityAdvisoryBase(BaseModel):
    advisory_code: str = Field(..., example="ADV-MHA-2026-08")
    issuing_agency: str = Field(..., example="Bureau of Public Safety Intelligence")
    title: str = Field(..., example="Heightened Vigilance Advisory: Public Transit Nodes")
    summary: str = Field(..., example="Increased monitoring requested across high-density metro and rail junctions.")
    threat_level: str = Field("ELEVATED", example="ELEVATED")
    target_locations: str = Field(..., example="All Major Metropolitan Transit Hubs")
    recommended_actions: str = Field(..., example="Enable perimeter tripwires and reduce congestion thresholds.")
    valid_from: datetime
    valid_to: datetime
    is_active: bool = True


class SecurityAdvisoryCreate(SecurityAdvisoryBase):
    pass


class SecurityAdvisoryRead(SecurityAdvisoryBase):
    id: str
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)
