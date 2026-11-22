"""
Operation Prahaar AI - FastAPI Core Application Entrypoint
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from backend.app.core.config import settings
from backend.app.db.session import Base, engine
from backend.app.api.router import api_router
from backend.app import models  # Ensures all models are registered with Base.metadata

# Create tables in SQLite if not yet created
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    description="Advanced AI-Powered Counter-Terrorism Support & National Public Safety Intelligence Platform (Student Prototype)",
    docs_url="/docs",
    redoc_url="/redoc",
)

# Enable CORS for local and production Command Center dashboard
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_origin_regex=settings.CORS_ORIGIN_REGEX,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount all API endpoints
app.include_router(api_router, prefix=settings.API_V1_PREFIX)


@app.get("/")
def root():
    return {
        "platform": settings.APP_NAME,
        "tagline": "Justice Through Intelligence. Protection Through Technology.",
        "status": "OPERATIONAL",
        "documentation": "/docs",
        "health_check": f"{settings.API_V1_PREFIX}/health",
    }
