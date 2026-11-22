"""
Operation Prahaar AI - Operator Authentication & Authorization Module

NOTE ON SECURITY CONTEXT (PROTOTYPE STATUS):
This module implements development-only operator authentication suitable for
local student prototype evaluation. It validates requests against the registered
User and Role entities in SQLite via the 'X-Operator-Badge' header or Bearer token.

NOTICE: This implementation is NOT a production-grade identity provider.
Production deployments must replace this with OAuth2 / OIDC / PKI-backed
mutual TLS authentication and strict short-lived JWT signatures.
"""

from typing import Optional
from fastapi import Header, Depends, HTTPException, status
from sqlalchemy.orm import Session
from backend.app.db.session import get_db
from backend.app.models.entities import User, Role
from backend.app.core.config import settings


def get_current_operator(
    x_operator_badge: Optional[str] = Header(None, alias="X-Operator-Badge"),
    authorization: Optional[str] = Header(None, alias="Authorization"),
    db: Session = Depends(get_db),
) -> User:
    """
    Validates that the incoming request carries a verified operator identity
    matching an active record in the authorized User registry.
    """
    badge_candidate: Optional[str] = None

    if x_operator_badge and x_operator_badge.strip():
        badge_candidate = x_operator_badge.strip()
    elif authorization and authorization.startswith("Bearer "):
        badge_candidate = authorization.replace("Bearer ", "").strip()

    if not badge_candidate:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication required: Missing 'X-Operator-Badge' header or Bearer authorization credential.",
            headers={"WWW-Authenticate": "Badge"},
        )

    # Validate against registered User entities
    user = (
        db.query(User)
        .filter((User.badge_number == badge_candidate) | (User.username == badge_candidate))
        .first()
    )

    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Authentication failed: Operator identifier '{badge_candidate}' is not recognized in the security registry.",
            headers={"WWW-Authenticate": "Badge"},
        )

    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=f"Access denied: Operator account '{badge_candidate}' has been deactivated.",
        )

    return user


def require_demo_reset_permission(
    current_user: User = Depends(get_current_operator),
    db: Session = Depends(get_db),
) -> User:
    """
    Enforces that:
    1. Demo reset operations are administratively allowed by configuration.
    2. The authenticated operator possesses an authorized operational role
       (CHIEF_CONTROLLER or COMMAND_OPERATOR).
    """
    if not getattr(settings, "DEMO_RESET_ALLOWED", True):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Administrative block: Destructive demo reset operations are disabled in backend configuration.",
        )

    role = db.query(Role).filter(Role.id == current_user.role_id).first()
    allowed_roles = {"CHIEF_CONTROLLER", "COMMAND_OPERATOR"}

    if not role or role.name not in allowed_roles:
        role_name = role.name if role else "UNASSIGNED"
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=(
                f"Authorization failed: Operator '{current_user.badge_number}' with role '{role_name}' "
                f"is not authorized to perform data reset. Required roles: {', '.join(allowed_roles)}."
            ),
        )

    return current_user
