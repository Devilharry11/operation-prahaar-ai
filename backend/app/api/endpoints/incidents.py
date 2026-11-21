"""
Operation Prahaar AI - Incident Management Endpoints
"""

from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from backend.app.db.session import get_db
from backend.app.models.entities import Incident
from backend.app.schemas.incident import IncidentCreate, IncidentRead

router = APIRouter(tags=["Incidents"])


@router.get("/incidents", response_model=List[IncidentRead])
def list_incidents(
    status: Optional[str] = None,
    priority: Optional[str] = None,
    limit: int = 50,
    db: Session = Depends(get_db),
):
    """List correlated public safety incidents."""
    query = db.query(Incident)
    if status:
        query = query.filter(Incident.status == status)
    if priority:
        query = query.filter(Incident.priority == priority)
    return query.order_by(Incident.created_at.desc()).limit(limit).all()


@router.get("/incidents/{incident_id}", response_model=IncidentRead)
def get_incident(incident_id: str, db: Session = Depends(get_db)):
    """Retrieve full incident details including explanation and confidence metrics."""
    incident = db.query(Incident).filter(Incident.id == incident_id).first()
    if not incident:
        raise HTTPException(status_code=404, detail="Incident not found")
    return incident
