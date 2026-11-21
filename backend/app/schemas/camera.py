"""
Operation Prahaar AI - Camera & Edge Device Schemas
"""

from typing import Optional, List
from datetime import datetime
from pydantic import BaseModel, ConfigDict, Field


class CameraBase(BaseModel):
    camera_code: str = Field(..., example="CAM-NDLS-01")
    name: str = Field(..., example="New Delhi Railway Station - Platform 1 Central")
    stream_url: str = Field(..., example="data/samples/sample_test.mp4")
    status: str = Field("ONLINE", example="ONLINE")
    resolution: str = Field("640x360", example="640x360")
    fps: int = Field(5, example=5)
    zone_polygon_json: Optional[str] = Field(None, example='[{"x": 100, "y": 150}, {"x": 300, "y": 150}]')
    location_id: str
    edge_device_id: Optional[str] = None


class CameraCreate(CameraBase):
    pass


class CameraRead(CameraBase):
    id: str
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class EdgeDeviceBase(BaseModel):
    device_id: str = Field(..., example="EDGE-IND-DELHI-001")
    name: str = Field(..., example="Mini-PC Edge Node Alpha")
    device_type: str = Field("VIRTUAL_LAPTOP", example="VIRTUAL_LAPTOP")
    ip_address: str = Field("127.0.0.1", example="127.0.0.1")
    location_id: Optional[str] = None


class EdgeDeviceHeartbeat(BaseModel):
    cpu_usage_pct: float = Field(..., example=14.5)
    ram_usage_mb: float = Field(..., example=240.0)
    uptime_seconds: int = Field(..., example=3600)
    status: str = Field("ONLINE", example="ONLINE")


class EdgeDeviceRead(EdgeDeviceBase):
    id: str
    status: str
    cpu_usage_pct: float
    ram_usage_mb: float
    uptime_seconds: int
    last_heartbeat: datetime
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)
