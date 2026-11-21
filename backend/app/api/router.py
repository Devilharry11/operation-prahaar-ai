"""
Operation Prahaar AI - Central API Router
"""

from fastapi import APIRouter
from backend.app.api.endpoints import (
    health,
    cameras,
    events,
    incidents,
    alerts,
    reviews,
    advisories,
    audit,
)

api_router = APIRouter()

api_router.include_router(health.router)
api_router.include_router(cameras.router)
api_router.include_router(events.router)
api_router.include_router(incidents.router)
api_router.include_router(alerts.router)
api_router.include_router(reviews.router)
api_router.include_router(advisories.router)
api_router.include_router(audit.router)
