"""
Operation Prahaar AI - Camera & Edge Device Management Endpoints
"""

from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from backend.app.db.session import get_db
from backend.app.core.datetime_util import utc_now
from backend.app.models.entities import Camera, EdgeDevice, AuditLog
from backend.app.schemas.camera import (
    CameraCreate,
    CameraRead,
    EdgeDeviceBase,
    EdgeDeviceRead,
    EdgeDeviceHeartbeat,
)
from backend.app.models.enums import AuditAction

router = APIRouter(tags=["Cameras & Edge Devices"])


@router.get("/cameras", response_model=List[CameraRead])
def list_cameras(location_id: Optional[str] = None, db: Session = Depends(get_db)):
    """List all registered CCTV and video monitoring streams."""
    query = db.query(Camera)
    if location_id:
        query = query.filter(Camera.location_id == location_id)
    return query.order_by(Camera.created_at.desc()).all()


@router.get("/cameras/{camera_id}", response_model=CameraRead)
def get_camera(camera_id: str, db: Session = Depends(get_db)):
    """Retrieve details for a single camera feed."""
    camera = db.query(Camera).filter(Camera.id == camera_id).first()
    if not camera:
        raise HTTPException(status_code=404, detail="Camera not found")
    return camera


@router.post("/cameras", response_model=CameraRead, status_code=status.HTTP_201_CREATED)
def register_camera(payload: CameraCreate, db: Session = Depends(get_db)):
    """Register an authorized CCTV or sample video input source."""
    existing = db.query(Camera).filter(Camera.camera_code == payload.camera_code).first()
    if existing:
        raise HTTPException(status_code=400, detail=f"Camera code {payload.camera_code} already registered")

    camera = Camera(
        camera_code=payload.camera_code,
        name=payload.name,
        stream_url=payload.stream_url,
        status=payload.status,
        resolution=payload.resolution,
        fps=payload.fps,
        zone_polygon_json=payload.zone_polygon_json,
        location_id=payload.location_id,
        edge_device_id=payload.edge_device_id,
    )
    db.add(camera)

    audit = AuditLog(
        event_type=AuditAction.CAMERA_REGISTERED.value,
        actor_id="SYSTEM",
        action_summary=f"Camera registered: {camera.camera_code} ({camera.name})",
        after_state_json=f'{{"camera_code": "{camera.camera_code}", "location_id": "{camera.location_id}"}}',
    )
    db.add(audit)
    db.commit()
    db.refresh(camera)
    return camera


@router.get("/edge-devices", response_model=List[EdgeDeviceRead])
def list_edge_devices(db: Session = Depends(get_db)):
    """List all edge processing nodes (laptop simulators or field Mini PCs)."""
    return db.query(EdgeDevice).all()


@router.post("/edge-devices/{device_id}/heartbeat", response_model=EdgeDeviceRead)
def record_edge_heartbeat(device_id: str, payload: EdgeDeviceHeartbeat, db: Session = Depends(get_db)):
    """Receive periodic telemetry and device health from an edge node."""
    device = db.query(EdgeDevice).filter(EdgeDevice.device_id == device_id).first()
    if not device:
        # Auto-register edge node if newly reporting
        device = EdgeDevice(
            device_id=device_id,
            name=f"Edge Node {device_id}",
            status=payload.status,
            cpu_usage_pct=payload.cpu_usage_pct,
            ram_usage_mb=payload.ram_usage_mb,
            uptime_seconds=payload.uptime_seconds,
            last_heartbeat=utc_now(),
        )
        db.add(device)
    else:
        device.cpu_usage_pct = payload.cpu_usage_pct
        device.ram_usage_mb = payload.ram_usage_mb
        device.uptime_seconds = payload.uptime_seconds
        device.status = payload.status
        device.last_heartbeat = utc_now()

    db.commit()
    db.refresh(device)
    return device
