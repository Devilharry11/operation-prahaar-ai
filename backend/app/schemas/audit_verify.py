"""
Operation Prahaar AI - Cryptographic Audit Verification Schemas
Defines structured responses for verifying the tamper-evident SHA-256 hash chain of the audit ledger.
"""

from typing import List, Optional
from pydantic import BaseModel, Field


class TamperedAuditEntry(BaseModel):
    """Detailed record of an integrity violation or broken cryptographic link in the audit ledger."""
    audit_id: str = Field(..., description="ID of the affected audit log entry")
    record_reference: Optional[str] = Field(None, description="Linked business record reference (e.g., incident/alert ID)")
    event_type: str = Field(..., description="Event type string")
    actor_id: str = Field(..., description="Actor / badge ID associated with record")
    stored_hash: Optional[str] = Field(None, description="Hash currently stored in the database")
    recomputed_hash: str = Field(..., description="Expected hash calculated from canonical payload")
    stored_previous_hash: Optional[str] = Field(None, description="Previous hash stored in this entry")
    expected_previous_hash: Optional[str] = Field(None, description="Predecessor block hash that should link here")
    reason: str = Field(..., description="Explicit description of the tampering or chain breakage")


class AuditVerificationResponse(BaseModel):
    """Complete cryptographic integrity status of the audit log ledger."""
    is_valid: bool = Field(..., description="True if cryptographic hash chain is sequentially linked and consistent with genesis anchor")
    total_records_checked: int = Field(..., description="Total count of audit log entries inspected in chain")
    tampered_count: int = Field(0, description="Count of corrupted, tampered, or broken-link entries detected")
    tampered_records: List[TamperedAuditEntry] = Field(default_factory=list, description="List of detected anomalies")
    chain_head_hash: Optional[str] = Field(None, description="Current latest SHA-256 block hash at head of chain")
    genesis_hash: str = Field(..., description="Standard genesis block anchor hash")
    verification_timestamp: str = Field(..., description="ISO 8601 timestamp of verification execution")
    message: str = Field(..., description="Summary status message")
    is_synthetic: bool = Field(True, description="Strict synthetic data marker")
