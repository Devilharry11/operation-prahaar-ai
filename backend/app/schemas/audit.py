"""
Operation Prahaar AI - Audit Log Schemas
"""

from typing import Optional
from datetime import datetime
from pydantic import BaseModel, ConfigDict, Field


class AuditLogRead(BaseModel):
    id: str
    event_type: str
    actor_id: str
    ip_address: str
    action_summary: str
    record_reference: Optional[str] = None
    before_state_json: Optional[str] = None
    after_state_json: Optional[str] = None
    previous_hash: Optional[str] = None
    current_hash: Optional[str] = None
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)
