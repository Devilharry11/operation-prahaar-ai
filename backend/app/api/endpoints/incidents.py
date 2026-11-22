"""
Operation Prahaar AI - Incident Management Endpoints
"""

from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from backend.app.db.session import get_db
from backend.app.models.entities import Incident
from backend.app.schemas.incident import IncidentCreate, IncidentRead
from backend.app.schemas.xai import IncidentExplainabilityResponse
from backend.app.services.xai import XAIService

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


@router.get("/incidents/{incident_id}/explainability", response_model=IncidentExplainabilityResponse)
def get_incident_explainability(incident_id: str, db: Session = Depends(get_db)):
    """
    Retrieve transparent, rule-based Explainable AI (XAI) breakdown for an incident.
    Outputs input values, applied calculation rule, uncertainty level, and data quality.
    """
    return XAIService.explain_incident(db=db, incident_id=incident_id)
