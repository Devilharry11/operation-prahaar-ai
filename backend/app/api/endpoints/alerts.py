"""
Operation Prahaar AI - Alert Center Endpoints
Enforces strict UNVERIFIED default state for all generated alerts.
"""

from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from backend.app.db.session import get_db
from backend.app.models.entities import Alert
from backend.app.schemas.alert import AlertRead

router = APIRouter(tags=["Alerts"])


@router.get("/alerts", response_model=List[AlertRead])
def list_alerts(
    review_status: Optional[str] = None,
    severity: Optional[str] = None,
    limit: int = 50,
    db: Session = Depends(get_db),
):
    """
    List alerts. Filter by review_status (UNVERIFIED, VERIFIED, REJECTED, ESCALATED).
    Alerts must be handled by an authorized human operator.
    """
    query = db.query(Alert)
    if review_status:
        query = query.filter(Alert.review_status == review_status)
    if severity:
        query = query.filter(Alert.severity == severity)
    return query.order_by(Alert.created_at.desc()).limit(limit).all()


@router.get("/alerts/{alert_id}", response_model=AlertRead)
def get_alert(alert_id: str, db: Session = Depends(get_db)):
    """Retrieve a single alert."""
    alert = db.query(Alert).filter(Alert.id == alert_id).first()
    if not alert:
        raise HTTPException(status_code=404, detail="Alert not found")
    return alert
