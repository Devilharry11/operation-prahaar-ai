"""
Operation Prahaar AI - Cryptographic Audit Ledger Service (Phase C Milestone C.4)
Implements an append-only, tamper-evident SHA-256 cryptographic hash chain across all audit logs:
- Block linkage: Every audit log record embeds the SHA-256 hash of its immediate predecessor.
- Genesis anchor: The initial record binds to a standardized 64-zero genesis hash.
- Tamper detection: Verifies both payload content integrity and chronological chain linkage.
- Backfill capability: Deterministically calculates hashes for legacy/unhashed audit records.
"""

from typing import List, Optional
from datetime import datetime, timezone
import hashlib
import uuid
from sqlalchemy.orm import Session
from backend.app.core.datetime_util import utc_now
from backend.app.models.entities import AuditLog
from backend.app.schemas.audit_verify import AuditVerificationResponse, TamperedAuditEntry

GENESIS_BLOCK_HASH: str = "0" * 64


def normalize_timestamp(ts: Optional[datetime]) -> str:
    """Normalize datetime or timestamp representation for deterministic hashing across SQLite roundtrips."""
    if ts is None:
        return ""
    if isinstance(ts, str):
        cleaned = ts.strip().replace(" ", "T")
        if "+" in cleaned:
            cleaned = cleaned.split("+")[0]
        if cleaned.endswith("Z"):
            cleaned = cleaned[:-1]
        return cleaned
    if hasattr(ts, "strftime"):
        naive = ts.replace(tzinfo=None) if hasattr(ts, "tzinfo") and ts.tzinfo is not None else ts
        iso = naive.isoformat()
        if "+" in iso:
            iso = iso.split("+")[0]
        if iso.endswith("Z"):
            iso = iso[:-1]
        return iso.replace(" ", "T")
    return str(ts).strip()


def calculate_audit_hash(
    audit_id: str,
    timestamp_str: str,
    actor_id: str,
    event_type: str,
    record_reference: Optional[str],
    action_summary: str,
    previous_hash: str,
) -> str:
    """
    Computes canonical SHA-256 digest over normalized audit entry components.
    Format:
    SHA-256( id | timestamp | actor_id | event_type | record_reference | action_summary | previous_hash )
    """
    ref_norm = (record_reference or "").strip()
    actor_norm = (actor_id or "").strip()
    event_norm = (event_type or "").strip()
    action_norm = (action_summary or "").strip()
    prev_norm = (previous_hash or GENESIS_BLOCK_HASH).strip()

    canonical_payload = (
        f"{audit_id}|{timestamp_str}|{actor_norm}|{event_norm}|{ref_norm}|{action_norm}|{prev_norm}"
    )
    return hashlib.sha256(canonical_payload.encode("utf-8")).hexdigest()


class AuditChainService:
    """Service handling cryptographic audit ledger creation, backfill, and tamper verification."""

    @staticmethod
    def get_latest_chain_head(db: Session) -> Optional[AuditLog]:
        """Fetch the most recent audit log in the chain."""
        return (
            db.query(AuditLog)
            .order_by(AuditLog.created_at.desc(), AuditLog.id.desc())
            .first()
        )

    @classmethod
    def append_audit_log(
        cls,
        db: Session,
        event_type: str,
        actor_id: str,
        action_summary: str,
        record_reference: Optional[str] = None,
        before_state_json: Optional[str] = None,
        after_state_json: Optional[str] = None,
        ip_address: str = "127.0.0.1",
        created_at: Optional[datetime] = None,
    ) -> AuditLog:
        """
        Create a new audit log record, cryptographically chained to the latest entry.
        """
        now = created_at or utc_now()
        timestamp_str = normalize_timestamp(now)
        audit_id = str(uuid.uuid4())

        # Determine previous hash from current head of chain
        latest = cls.get_latest_chain_head(db)
        if latest and latest.current_hash:
            prev_hash = latest.current_hash
        elif latest and not latest.current_hash:
            # If latest is unhashed, compute its hash first
            prev_timestamp = normalize_timestamp(latest.created_at)
            prev_hash = calculate_audit_hash(
                audit_id=latest.id,
                timestamp_str=prev_timestamp,
                actor_id=latest.actor_id,
                event_type=latest.event_type,
                record_reference=latest.record_reference,
                action_summary=latest.action_summary,
                previous_hash=latest.previous_hash or GENESIS_BLOCK_HASH,
            )
            latest.current_hash = prev_hash
            db.add(latest)
        else:
            prev_hash = GENESIS_BLOCK_HASH

        curr_hash = calculate_audit_hash(
            audit_id=audit_id,
            timestamp_str=timestamp_str,
            actor_id=actor_id,
            event_type=event_type,
            record_reference=record_reference,
            action_summary=action_summary,
            previous_hash=prev_hash,
        )

        audit_entry = AuditLog(
            id=audit_id,
            event_type=event_type,
            actor_id=actor_id,
            ip_address=ip_address,
            action_summary=action_summary,
            record_reference=record_reference,
            before_state_json=before_state_json,
            after_state_json=after_state_json,
            previous_hash=prev_hash,
            current_hash=curr_hash,
            created_at=now,
        )
        db.add(audit_entry)
        return audit_entry

    @classmethod
    def backfill_existing_audit_logs(cls, db: Session) -> int:
        """
        Sequentially chains and hashes any existing unhashed audit log entries chronologically.
        Preserves original event records and baseline data completely.
        """
        logs = db.query(AuditLog).order_by(AuditLog.created_at.asc(), AuditLog.id.asc()).all()
        if not logs:
            return 0

        updated_count = 0
        running_prev_hash = GENESIS_BLOCK_HASH

        for log in logs:
            ts_str = normalize_timestamp(log.created_at)
            # Recompute previous hash and current hash
            needs_update = False

            if log.previous_hash != running_prev_hash:
                log.previous_hash = running_prev_hash
                needs_update = True

            expected_curr = calculate_audit_hash(
                audit_id=log.id,
                timestamp_str=ts_str,
                actor_id=log.actor_id,
                event_type=log.event_type,
                record_reference=log.record_reference,
                action_summary=log.action_summary,
                previous_hash=running_prev_hash,
            )

            if log.current_hash != expected_curr:
                log.current_hash = expected_curr
                needs_update = True

            if needs_update:
                updated_count += 1

            running_prev_hash = log.current_hash

        if updated_count > 0:
            db.commit()

        return updated_count

    @classmethod
    def verify_audit_chain(cls, db: Session) -> AuditVerificationResponse:
        """
        Independently audits the entire audit ledger from genesis to head.
        Verifies:
        1. Predecessor linkage: Does previous_hash match predecessor's current_hash?
        2. Content integrity: Does current_hash match SHA-256(canonical_payload)?
        Returns complete diagnostic of any tampered or corrupted entries.
        """
        now_iso = datetime.now(timezone.utc).isoformat()
        logs = db.query(AuditLog).order_by(AuditLog.created_at.asc(), AuditLog.id.asc()).all()

        if not logs:
            return AuditVerificationResponse(
                is_valid=True,
                total_records_checked=0,
                tampered_count=0,
                tampered_records=[],
                chain_head_hash=GENESIS_BLOCK_HASH,
                genesis_hash=GENESIS_BLOCK_HASH,
                verification_timestamp=now_iso,
                message="Audit ledger is empty; genesis anchor intact.",
                is_synthetic=True,
            )

        tampered_entries: List[TamperedAuditEntry] = []
        expected_prev_hash = GENESIS_BLOCK_HASH

        for log in logs:
            ts_str = normalize_timestamp(log.created_at)
            computed_hash = calculate_audit_hash(
                audit_id=log.id,
                timestamp_str=ts_str,
                actor_id=log.actor_id,
                event_type=log.event_type,
                record_reference=log.record_reference,
                action_summary=log.action_summary,
                previous_hash=log.previous_hash or GENESIS_BLOCK_HASH,
            )

            # Check 1: Chain Linkage
            if (log.previous_hash or "") != expected_prev_hash:
                tampered_entries.append(
                    TamperedAuditEntry(
                        audit_id=log.id,
                        record_reference=log.record_reference,
                        event_type=log.event_type,
                        actor_id=log.actor_id,
                        stored_hash=log.current_hash,
                        recomputed_hash=computed_hash,
                        stored_previous_hash=log.previous_hash,
                        expected_previous_hash=expected_prev_hash,
                        reason=(
                            f"Broken cryptographic link: previous_hash '{log.previous_hash}' does not match "
                            f"preceding block hash '{expected_prev_hash}'."
                        ),
                    )
                )
            # Check 2: Content Digest Integrity
            elif log.current_hash != computed_hash:
                tampered_entries.append(
                    TamperedAuditEntry(
                        audit_id=log.id,
                        record_reference=log.record_reference,
                        event_type=log.event_type,
                        actor_id=log.actor_id,
                        stored_hash=log.current_hash,
                        recomputed_hash=computed_hash,
                        stored_previous_hash=log.previous_hash,
                        expected_previous_hash=expected_prev_hash,
                        reason="Content tampering detected: stored current_hash does not match recomputed SHA-256 payload digest.",
                    )
                )

            # Advance expected previous hash to this block's stored current hash
            expected_prev_hash = log.current_hash or computed_hash

        is_valid = len(tampered_entries) == 0
        total_count = len(logs)
        last_hash = logs[-1].current_hash if logs else GENESIS_BLOCK_HASH

        if is_valid:
            message = (
                f"Cryptographic verification SUCCESS: All {total_count} audit records match sequential "
                f"SHA-256 hash digests anchored to genesis block. (Chain integrity verified)."
            )
        else:
            message = (
                f"Cryptographic verification FAILED: Detected {len(tampered_entries)} tampered or "
                f"broken entries across {total_count} records."
            )

        return AuditVerificationResponse(
            is_valid=is_valid,
            total_records_checked=total_count,
            tampered_count=len(tampered_entries),
            tampered_records=tampered_entries,
            chain_head_hash=last_hash,
            genesis_hash=GENESIS_BLOCK_HASH,
            verification_timestamp=now_iso,
            message=message,
            is_synthetic=True,
        )
