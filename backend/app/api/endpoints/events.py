"""
Operation Prahaar AI - Camera Event Ingestion Endpoints
"""

from typing import List, Optional
import json
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from backend.app.db.session import get_db
from backend.app.core.datetime_util import utc_now
from backend.app.models.entities import CameraEvent, Camera, AuditLog
from backend.app.schemas.event import CameraEventCreate, CameraEventRead
from backend.app.models.enums import AuditAction

router = APIRouter(tags=["Camera Events"])


@router.post("/events", response_model=CameraEventRead, status_code=status.HTTP_201_CREATED)
def ingest_camera_event(payload: CameraEventCreate, db: Session = Depends(get_db)):
    """
    Ingests an anonymized spatial event from edge computer vision.
    Rejects any payload containing facial or biometric attributes.
    """
    camera = db.query(Camera).filter(Camera.id == payload.camera_id).first()
    if not camera:
        raise HTTPException(status_code=404, detail="Camera ID not found")

    event_record = CameraEvent(
        camera_id=payload.camera_id,
        edge_device_id=payload.edge_device_id,
        event_type=payload.event_type,
        severity=payload.severity,
        crowd_density_score=payload.crowd_density_score,
        motion_energy=payload.motion_energy,
        bounding_boxes_json=payload.bounding_boxes_json,
        metadata_json=payload.metadata_json,
        timestamp=payload.timestamp or utc_now(),
    )
    db.add(event_record)

    # Log to audit trail
    audit = AuditLog(
        event_type=AuditAction.EVENT_RECEIVED.value,
        actor_id=payload.edge_device_id or "EDGE_NODE",
        action_summary=f"Event {payload.event_type} (density: {payload.crowd_density_score:.2f}) from Camera {camera.camera_code}",
        after_state_json=json.dumps({
            "camera_code": camera.camera_code,
            "event_type": payload.event_type,
            "density": payload.crowd_density_score
        }),
    )
    db.add(audit)
    db.commit()
    db.refresh(event_record)
    return event_record


@router.get("/events", response_model=List[CameraEventRead])
def list_camera_events(
    camera_id: Optional[str] = None,
    event_type: Optional[str] = None,
    limit: int = 50,
    db: Session = Depends(get_db),
):
    """Retrieve recent spatial camera events."""
    query = db.query(CameraEvent)
    if camera_id:
        query = query.filter(CameraEvent.camera_id == camera_id)
    if event_type:
        query = query.filter(CameraEvent.event_type == event_type)
    return query.order_by(CameraEvent.timestamp.desc()).limit(limit).all()
