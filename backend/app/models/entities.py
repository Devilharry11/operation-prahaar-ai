"""
Operation Prahaar AI - SQLAlchemy ORM Data Models (14 Core Entities)
Enforces Responsible AI, Data Minimization, and Chain-of-Custody Audit Trails.
"""

import uuid
from datetime import datetime
from typing import List, Optional
from sqlalchemy import (
    Column,
    String,
    Integer,
    Float,
    Boolean,
    DateTime,
    ForeignKey,
    Text,
    Table,
    Index,
)
from sqlalchemy.orm import relationship
from backend.app.db.session import Base
from backend.app.core.datetime_util import utc_now
from backend.app.models.enums import (
    SeverityLevel,
    ReviewStatus,
    IncidentStatus,
    UncertaintyLevel,
    CameraStatus,
    DeviceType,
    EventType,
    AdvisoryThreatLevel,
    EvidenceType,
    AuditAction,
)


def generate_uuid() -> str:
    return str(uuid.uuid4())


# Many-to-many relationship table between Role and Permission
role_permissions = Table(
    "role_permissions",
    Base.metadata,
    Column("role_id", String(36), ForeignKey("roles.id", ondelete="CASCADE"), primary_key=True),
    Column("permission_id", String(36), ForeignKey("permissions.id", ondelete="CASCADE"), primary_key=True),
)


class Organization(Base):
    """Sponsoring public safety / venue protection organization."""
    __tablename__ = "organizations"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    name = Column(String(120), nullable=False, unique=True)
    code = Column(String(30), nullable=False, unique=True, index=True)
    description = Column(Text, nullable=True)
    contact_email = Column(String(120), nullable=False)
    created_at = Column(DateTime, default=utc_now, nullable=False)

    users = relationship("User", back_populates="organization", cascade="all, delete-orphan")
    locations = relationship("Location", back_populates="organization", cascade="all, delete-orphan")


class Role(Base):
    """Role definition for Role-Based Access Control (RBAC)."""
    __tablename__ = "roles"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    name = Column(String(50), nullable=False, unique=True)
    description = Column(String(200), nullable=True)

    users = relationship("User", back_populates="role")
    permissions = relationship("Permission", secondary=role_permissions, back_populates="roles")


class Permission(Base):
    """Granular system permission."""
    __tablename__ = "permissions"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    name = Column(String(80), nullable=False, unique=True)
    description = Column(String(200), nullable=True)

    roles = relationship("Role", secondary=role_permissions, back_populates="permissions")


class User(Base):
    """Authorized human operator, analyst, or administrator. No biometric data stored."""
    __tablename__ = "users"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    username = Column(String(60), nullable=False, unique=True, index=True)
    email = Column(String(120), nullable=False, unique=True)
    hashed_password = Column(String(255), nullable=False)
    badge_number = Column(String(50), nullable=False, unique=True)
    full_name = Column(String(120), nullable=False)
    is_active = Column(Boolean, default=True, nullable=False)
    organization_id = Column(String(36), ForeignKey("organizations.id", ondelete="CASCADE"), nullable=False)
    role_id = Column(String(36), ForeignKey("roles.id"), nullable=False)
    created_at = Column(DateTime, default=utc_now, nullable=False)

    organization = relationship("Organization", back_populates="users")
    role = relationship("Role", back_populates="users")
    human_reviews = relationship("HumanReview", back_populates="reviewer")
    approvals = relationship("Approval", back_populates="approver")


class Location(Base):
    """Physical venue, transit hub, or protected public sector zone."""
    __tablename__ = "locations"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    name = Column(String(120), nullable=False)
    code = Column(String(30), nullable=False, unique=True, index=True)
    city = Column(String(80), nullable=False)
    state = Column(String(80), nullable=False)
    venue_type = Column(String(60), nullable=False)  # Transit Hub, Public Plaza, Religious Site, Perimeter
    sensitivity_level = Column(String(20), default=SeverityLevel.MEDIUM.value, nullable=False)
    organization_id = Column(String(36), ForeignKey("organizations.id", ondelete="CASCADE"), nullable=False)
    created_at = Column(DateTime, default=utc_now, nullable=False)

    organization = relationship("Organization", back_populates="locations")
    cameras = relationship("Camera", back_populates="location", cascade="all, delete-orphan")
    edge_devices = relationship("EdgeDevice", back_populates="location")
    incidents = relationship("Incident", back_populates="location")


class EdgeDevice(Base):
    """Edge computing device (virtual laptop simulation or future Mini PC)."""
    __tablename__ = "edge_devices"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    device_id = Column(String(60), nullable=False, unique=True, index=True)
    name = Column(String(120), nullable=False)
    device_type = Column(String(30), default=DeviceType.VIRTUAL_LAPTOP.value, nullable=False)
    ip_address = Column(String(45), default="127.0.0.1", nullable=False)
    status = Column(String(20), default="ONLINE", nullable=False)
    cpu_usage_pct = Column(Float, default=0.0, nullable=False)
    ram_usage_mb = Column(Float, default=0.0, nullable=False)
    uptime_seconds = Column(Integer, default=0, nullable=False)
    location_id = Column(String(36), ForeignKey("locations.id", ondelete="SET NULL"), nullable=True)
    last_heartbeat = Column(DateTime, default=utc_now, nullable=False)
    created_at = Column(DateTime, default=utc_now, nullable=False)

    location = relationship("Location", back_populates="edge_devices")
    cameras = relationship("Camera", back_populates="edge_device")
    camera_events = relationship("CameraEvent", back_populates="edge_device")


class Camera(Base):
    """Registered CCTV or sample video input stream."""
    __tablename__ = "cameras"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    camera_code = Column(String(60), nullable=False, unique=True, index=True)
    name = Column(String(120), nullable=False)
    stream_url = Column(String(255), nullable=False)  # Local file path or RTSP simulation
    status = Column(String(20), default=CameraStatus.ONLINE.value, nullable=False)
    resolution = Column(String(30), default="640x360", nullable=False)
    fps = Column(Integer, default=5, nullable=False)
    zone_polygon_json = Column(Text, nullable=True)  # JSON coordinates of restricted zones / tripwires
    location_id = Column(String(36), ForeignKey("locations.id", ondelete="CASCADE"), nullable=False)
    edge_device_id = Column(String(36), ForeignKey("edge_devices.id", ondelete="SET NULL"), nullable=True)
    created_at = Column(DateTime, default=utc_now, nullable=False)

    location = relationship("Location", back_populates="cameras")
    edge_device = relationship("EdgeDevice", back_populates="cameras")
    camera_events = relationship("CameraEvent", back_populates="camera")
    alerts = relationship("Alert", back_populates="camera")


class CameraEvent(Base):
    """Anonymized spatial detection event dispatched by edge computer vision."""
    __tablename__ = "camera_events"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    camera_id = Column(String(36), ForeignKey("cameras.id", ondelete="CASCADE"), nullable=False, index=True)
    edge_device_id = Column(String(36), ForeignKey("edge_devices.id", ondelete="SET NULL"), nullable=True)
    event_type = Column(String(50), nullable=False, index=True)  # HIGH_CROWD_CONGESTION, RESTRICTED_ZONE_ENTRY
    severity = Column(String(20), default=SeverityLevel.MEDIUM.value, nullable=False)
    crowd_density_score = Column(Float, default=0.0, nullable=False)
    motion_energy = Column(Float, default=0.0, nullable=False)
    bounding_boxes_json = Column(Text, nullable=True)  # Anonymized spatial bounding boxes: [[x,y,w,h]]
    timestamp = Column(DateTime, default=utc_now, nullable=False, index=True)
    metadata_json = Column(Text, nullable=True)

    camera = relationship("Camera", back_populates="camera_events")
    edge_device = relationship("EdgeDevice", back_populates="camera_events")
    evidence_records = relationship("Evidence", back_populates="camera_event")


class Incident(Base):
    """Correlated public safety incident synthesized from events and security advisories."""
    __tablename__ = "incidents"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    incident_code = Column(String(50), nullable=False, unique=True, index=True)
    title = Column(String(180), nullable=False)
    description = Column(Text, nullable=False)
    status = Column(String(30), default=IncidentStatus.NEW.value, nullable=False, index=True)
    priority = Column(String(20), default=SeverityLevel.MEDIUM.value, nullable=False)
    confidence_score = Column(Float, default=0.5, nullable=False)
    uncertainty_level = Column(String(20), default=UncertaintyLevel.MODERATE.value, nullable=False)
    explanation = Column(Text, nullable=False)
    triggered_rule = Column(String(120), nullable=False)
    location_id = Column(String(36), ForeignKey("locations.id", ondelete="CASCADE"), nullable=False)
    advisory_id = Column(String(36), ForeignKey("security_advisories.id", ondelete="SET NULL"), nullable=True)
    created_at = Column(DateTime, default=utc_now, nullable=False, index=True)
    updated_at = Column(DateTime, default=utc_now, onupdate=utc_now, nullable=False)

    location = relationship("Location", back_populates="incidents")
    advisory = relationship("SecurityAdvisory", back_populates="incidents")
    alerts = relationship("Alert", back_populates="incident", cascade="all, delete-orphan")
    evidence = relationship("Evidence", back_populates="incident", cascade="all, delete-orphan")
    human_reviews = relationship("HumanReview", back_populates="incident", cascade="all, delete-orphan")
    approvals = relationship("Approval", back_populates="incident", cascade="all, delete-orphan")


class Alert(Base):
    """Actionable alert presented on the Command Center for Human Verification."""
    __tablename__ = "alerts"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    alert_code = Column(String(50), nullable=False, unique=True, index=True)
    incident_id = Column(String(36), ForeignKey("incidents.id", ondelete="CASCADE"), nullable=False)
    camera_id = Column(String(36), ForeignKey("cameras.id", ondelete="CASCADE"), nullable=False)
    alert_type = Column(String(60), nullable=False)
    severity = Column(String(20), default=SeverityLevel.MEDIUM.value, nullable=False, index=True)
    title = Column(String(180), nullable=False)
    summary = Column(Text, nullable=False)
    # Strictly defaulted to UNVERIFIED per Responsible AI rules
    review_status = Column(String(30), default=ReviewStatus.UNVERIFIED.value, nullable=False, index=True)
    is_actionable = Column(Boolean, default=True, nullable=False)
    created_at = Column(DateTime, default=utc_now, nullable=False, index=True)

    incident = relationship("Incident", back_populates="alerts")
    camera = relationship("Camera", back_populates="alerts")
    human_reviews = relationship("HumanReview", back_populates="alert")


class SecurityAdvisory(Base):
    """Verified official safety advisory or threat bulletin from authorized agencies."""
    __tablename__ = "security_advisories"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    advisory_code = Column(String(60), nullable=False, unique=True, index=True)
    issuing_agency = Column(String(120), nullable=False)
    title = Column(String(180), nullable=False)
    summary = Column(Text, nullable=False)
    threat_level = Column(String(20), default=AdvisoryThreatLevel.ADVISORY.value, nullable=False)
    target_locations = Column(String(255), nullable=False)
    recommended_actions = Column(Text, nullable=False)
    valid_from = Column(DateTime, nullable=False)
    valid_to = Column(DateTime, nullable=False)
    is_active = Column(Boolean, default=True, nullable=False)
    created_at = Column(DateTime, default=utc_now, nullable=False)

    incidents = relationship("Incident", back_populates="advisory")
    approvals = relationship("Approval", back_populates="advisory")


class Evidence(Base):
    """Contextual telemetry and anonymized audit evidence with SHA-256 integrity check."""
    __tablename__ = "evidence"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    incident_id = Column(String(36), ForeignKey("incidents.id", ondelete="CASCADE"), nullable=False)
    camera_event_id = Column(String(36), ForeignKey("camera_events.id", ondelete="SET NULL"), nullable=True)
    evidence_type = Column(String(50), nullable=False)  # TELEMETRY_LOG, DENSITY_METRIC, etc.
    data_payload_json = Column(Text, nullable=False)
    file_path = Column(String(255), nullable=True)  # Path to anonymized snapshot if any
    hash_signature = Column(String(64), nullable=False)  # SHA-256 for chain of custody
    created_at = Column(DateTime, default=utc_now, nullable=False)

    incident = relationship("Incident", back_populates="evidence")
    camera_event = relationship("CameraEvent", back_populates="evidence_records")


class HumanReview(Base):
    """Human-in-the-loop decision record. Mandatory before any incident escalation."""
    __tablename__ = "human_reviews"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    alert_id = Column(String(36), ForeignKey("alerts.id", ondelete="CASCADE"), nullable=True)
    incident_id = Column(String(36), ForeignKey("incidents.id", ondelete="CASCADE"), nullable=False)
    reviewer_id = Column(String(36), ForeignKey("users.id"), nullable=False)
    action = Column(String(30), nullable=False)  # VERIFIED, DISMISSED, ESCALATED
    rationale = Column(Text, nullable=False)
    prior_status = Column(String(30), nullable=False)
    new_status = Column(String(30), nullable=False)
    reviewed_at = Column(DateTime, default=utc_now, nullable=False, index=True)

    alert = relationship("Alert", back_populates="human_reviews")
    incident = relationship("Incident", back_populates="human_reviews")
    reviewer = relationship("User", back_populates="human_reviews")


class Approval(Base):
    """Formal human sign-off for critical advisories or tactical escalations."""
    __tablename__ = "approvals"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    incident_id = Column(String(36), ForeignKey("incidents.id", ondelete="CASCADE"), nullable=True)
    advisory_id = Column(String(36), ForeignKey("security_advisories.id", ondelete="CASCADE"), nullable=True)
    approver_id = Column(String(36), ForeignKey("users.id"), nullable=False)
    approval_type = Column(String(60), nullable=False)  # ESCALATION_SIGN_OFF, ADVISORY_RELEASE
    status = Column(String(30), default="PENDING", nullable=False)  # PENDING, APPROVED, REJECTED
    comments = Column(Text, nullable=True)
    created_at = Column(DateTime, default=utc_now, nullable=False)
    decided_at = Column(DateTime, nullable=True)

    incident = relationship("Incident", back_populates="approvals")
    advisory = relationship("SecurityAdvisory", back_populates="approvals")
    approver = relationship("User", back_populates="approvals")


class AuditLog(Base):
    """Append-only, tamper-evident audit ledger for compliance, accountability and transparency."""
    __tablename__ = "audit_logs"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    event_type = Column(String(60), nullable=False, index=True)
    actor_id = Column(String(60), default="SYSTEM", nullable=False, index=True)
    ip_address = Column(String(45), default="127.0.0.1", nullable=False)
    action_summary = Column(String(255), nullable=False)
    record_reference = Column(String(100), nullable=True, index=True)
    before_state_json = Column(Text, nullable=True)
    after_state_json = Column(Text, nullable=True)
    previous_hash = Column(String(64), nullable=True)
    current_hash = Column(String(64), nullable=True, index=True)
    created_at = Column(DateTime, default=utc_now, nullable=False, index=True)

    __table_args__ = (
        Index("idx_audit_logs_event_actor", "event_type", "actor_id"),
    )
