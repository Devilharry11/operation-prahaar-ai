"""
Operation Prahaar AI - Camera Event Schemas
Enforces strict spatial anonymization (no facial or identity attributes).
"""

from typing import Optional, List, Dict, Any
from datetime import datetime
from pydantic import BaseModel, ConfigDict, Field


class CameraEventCreate(BaseModel):
    camera_id: str = Field(..., example="cam-uuid-1234")
    edge_device_id: Optional[str] = Field(None, example="edge-uuid-5678")
    event_type: str = Field(..., example="HIGH_CROWD_CONGESTION")
    severity: str = Field("MEDIUM", example="HIGH")
    crowd_density_score: float = Field(..., ge=0.0, le=1.0, example=0.82)
    motion_energy: float = Field(0.0, example=45.2)
    bounding_boxes_json: Optional[str] = Field(None, example='[{"x": 120, "y": 80, "w": 40, "h": 90}]')
    metadata_json: Optional[str] = None
    timestamp: Optional[datetime] = None


class CameraEventRead(CameraEventCreate):
    id: str
    timestamp: datetime

    model_config = ConfigDict(from_attributes=True)
