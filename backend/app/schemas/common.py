"""
Operation Prahaar AI - Common Schemas
"""

from typing import Generic, TypeVar, Optional, Any, List
from datetime import datetime
from pydantic import BaseModel, ConfigDict, Field
from backend.app.core.datetime_util import utc_now

T = TypeVar("T")


class APIResponse(BaseModel, Generic[T]):
    success: bool = True
    message: str = "Operation completed successfully"
    data: Optional[T] = None


class SystemHealthResponse(BaseModel):
    status: str
    app_name: str
    version: str
    environment: str
    database_connected: bool
    privacy_preserving_mode: bool
    facial_recognition_prohibited: bool
    human_verification_enforced: bool
    timestamp: datetime = Field(default_factory=utc_now)

