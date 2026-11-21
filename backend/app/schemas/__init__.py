"""
Operation Prahaar AI - Schemas Package Initializer
"""

from backend.app.schemas.common import APIResponse, SystemHealthResponse
from backend.app.schemas.camera import CameraCreate, CameraRead, EdgeDeviceBase, EdgeDeviceHeartbeat, EdgeDeviceRead
from backend.app.schemas.event import CameraEventCreate, CameraEventRead
from backend.app.schemas.incident import IncidentCreate, IncidentRead
from backend.app.schemas.alert import AlertCreate, AlertRead
from backend.app.schemas.review import HumanReviewCreate, HumanReviewRead
from backend.app.schemas.advisory import SecurityAdvisoryCreate, SecurityAdvisoryRead
from backend.app.schemas.audit import AuditLogRead

__all__ = [
    "APIResponse",
    "SystemHealthResponse",
    "CameraCreate",
    "CameraRead",
    "EdgeDeviceBase",
    "EdgeDeviceHeartbeat",
    "EdgeDeviceRead",
    "CameraEventCreate",
    "CameraEventRead",
    "IncidentCreate",
    "IncidentRead",
    "AlertCreate",
    "AlertRead",
    "HumanReviewCreate",
    "HumanReviewRead",
    "SecurityAdvisoryCreate",
    "SecurityAdvisoryRead",
    "AuditLogRead",
]
