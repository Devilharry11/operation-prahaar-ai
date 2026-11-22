"""
Operation Prahaar AI - Phase C Cryptographic Audit Chain Test Suite (Milestone C.4)
Tests append-only SHA-256 hash chaining, genesis block linkage, canonical hash calculation,
backfill capability, and adversary tamper-detection for audit ledgers.
Runs in total database isolation (temporary isolated SQLite file).
"""

import sys
import unittest
import uuid
from pathlib import Path
from datetime import datetime, timezone
from fastapi.testclient import TestClient
from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker

# Ensure project root is in sys.path
BASE_DIR = Path(__file__).resolve().parent.parent
if str(BASE_DIR) not in sys.path:
    sys.path.insert(0, str(BASE_DIR))

from backend.app.main import app
from backend.app.db.session import Base, get_db
from backend.app.models.entities import AuditLog
from backend.app.services.audit_chain import (
    AuditChainService,
    calculate_audit_hash,
    GENESIS_BLOCK_HASH,
    normalize_timestamp,
)


class TestPhaseCAuditChain(unittest.TestCase):
    """Complete automated verification of Cryptographic Audit Hash Chaining & Tamper Detection."""

    @classmethod
    def setUpClass(cls):
        # Isolated temporary database
        cls.test_db_path = BASE_DIR / f"test_isolated_c4_{uuid.uuid4().hex[:8]}.db"
        if cls.test_db_path.exists():
            cls.test_db_path.unlink()

        cls.engine = create_engine(
            f"sqlite:///{cls.test_db_path}",
            connect_args={"check_same_thread": False},
            future=True,
        )
        Base.metadata.create_all(bind=cls.engine)
        cls.SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=cls.engine, future=True)

        def override_get_db():
            test_db = cls.SessionLocal()
            try:
                yield test_db
            finally:
                test_db.close()

        app.dependency_overrides[get_db] = override_get_db
        cls.client = TestClient(app)

    @classmethod
    def tearDownClass(cls):
        app.dependency_overrides.clear()
        cls.engine.dispose()
        if cls.test_db_path.exists():
            try:
                cls.test_db_path.unlink()
            except Exception:
                pass

    def test_01_empty_audit_chain_verification(self):
        """Empty ledger verifies successfully anchored to genesis block."""
        db = self.SessionLocal()
        try:
            res = AuditChainService.verify_audit_chain(db)
            self.assertTrue(res.is_valid)
            self.assertEqual(res.total_records_checked, 0)
            self.assertEqual(res.tampered_count, 0)
            self.assertEqual(res.genesis_hash, GENESIS_BLOCK_HASH)
        finally:
            db.close()

    def test_02_sequential_audit_chain_append(self):
        """Audit entries link to predecessors with valid SHA-256 hashes."""
        db = self.SessionLocal()
        try:
            # Entry 1 (Genesis block child)
            e1 = AuditChainService.append_audit_log(
                db=db,
                event_type="OPERATOR_LOGIN",
                actor_id="IND-OPR-4081",
                action_summary="Operator logged in from terminal 4.",
                record_reference="AUTH-SES-001",
            )
            db.commit()
            self.assertEqual(e1.previous_hash, GENESIS_BLOCK_HASH)
            self.assertIsNotNone(e1.current_hash)
            self.assertEqual(len(e1.current_hash), 64)

            # Entry 2 (Links to Entry 1)
            e2 = AuditChainService.append_audit_log(
                db=db,
                event_type="HUMAN_VERIFICATION",
                actor_id="IND-OPR-4081",
                action_summary="Operator verified aggregate crowd surge alert ALT-2026-0001.",
                record_reference="ALT-2026-0001",
            )
            db.commit()
            self.assertEqual(e2.previous_hash, e1.current_hash)
            self.assertIsNotNone(e2.current_hash)

            # Entry 3 (Links to Entry 2)
            e3 = AuditChainService.append_audit_log(
                db=db,
                event_type="WATCH_OFFICER_CONFIRMATION",
                actor_id="IND-ANA-2094",
                action_summary="Watch Officer confirmed incident INC-2026-0001.",
                record_reference="INC-2026-0001",
            )
            db.commit()
            self.assertEqual(e3.previous_hash, e2.current_hash)

            # Verify chain
            res = AuditChainService.verify_audit_chain(db)
            self.assertTrue(res.is_valid)
            self.assertEqual(res.total_records_checked, 3)
            self.assertEqual(res.tampered_count, 0)
            self.assertEqual(res.chain_head_hash, e3.current_hash)
        finally:
            db.close()

    def test_03_tamper_detection_content_mutation(self):
        """Direct database SQL modification of action_summary triggers cryptographic tamper detection."""
        db = self.SessionLocal()
        try:
            # 1. Fetch latest entry
            target_entry = db.query(AuditLog).order_by(AuditLog.created_at.desc()).first()
            target_id = target_entry.id
            original_summary = target_entry.action_summary

            # 2. Simulate malicious attacker modifying action_summary directly in SQLite
            db.execute(
                text("UPDATE audit_logs SET action_summary = :tampered WHERE id = :id"),
                {"tampered": "Maliciously altered audit trail record to forge operator sign-off.", "id": target_id},
            )
            db.commit()

            # 3. Verify audit chain detects violation
            res = AuditChainService.verify_audit_chain(db)
            self.assertFalse(res.is_valid)
            self.assertGreater(res.tampered_count, 0)
            tampered_entry = next((e for e in res.tampered_records if e.audit_id == target_id), None)
            self.assertIsNotNone(tampered_entry)
            self.assertIn("tampering detected", tampered_entry.reason)

            # 4. Restore original content for subsequent tests
            db.execute(
                text("UPDATE audit_logs SET action_summary = :orig WHERE id = :id"),
                {"orig": original_summary, "id": target_id},
            )
            db.commit()

            # Re-verify restored clean state
            clean_res = AuditChainService.verify_audit_chain(db)
            self.assertTrue(clean_res.is_valid)
        finally:
            db.close()

    def test_04_tamper_detection_broken_chain_linkage(self):
        """Mutating previous_hash in a block triggers broken cryptographic link error."""
        db = self.SessionLocal()
        try:
            target_entry = db.query(AuditLog).order_by(AuditLog.created_at.desc()).first()
            target_id = target_entry.id
            orig_prev = target_entry.previous_hash

            # Mutate previous_hash
            db.execute(
                text("UPDATE audit_logs SET previous_hash = :fake_hash WHERE id = :id"),
                {"fake_hash": "a" * 64, "id": target_id},
            )
            db.commit()

            # Audit check
            res = AuditChainService.verify_audit_chain(db)
            self.assertFalse(res.is_valid)
            tampered = next((e for e in res.tampered_records if e.audit_id == target_id), None)
            self.assertIsNotNone(tampered)
            self.assertIn("Broken cryptographic link", tampered.reason)

            # Revert
            db.execute(
                text("UPDATE audit_logs SET previous_hash = :orig WHERE id = :id"),
                {"orig": orig_prev, "id": target_id},
            )
            db.commit()
        finally:
            db.close()

    def test_05_backfill_utility(self):
        """Backfill successfully hashes and chains unhashed legacy audit logs."""
        db = self.SessionLocal()
        try:
            # Wipe test table and insert raw unhashed rows
            db.execute(text("DELETE FROM audit_logs"))
            db.commit()

            raw_1 = AuditLog(
                id="raw-1",
                event_type="SYSTEM_BOOT",
                actor_id="SYSTEM",
                action_summary="System initialization completed.",
                created_at=datetime(2026, 1, 1, 10, 0, 0, tzinfo=timezone.utc),
            )
            raw_2 = AuditLog(
                id="raw-2",
                event_type="OPERATOR_LOGIN",
                actor_id="IND-OPR-4081",
                action_summary="Operator login session initiated.",
                created_at=datetime(2026, 1, 1, 10, 5, 0, tzinfo=timezone.utc),
            )
            db.add_all([raw_1, raw_2])
            db.commit()

            # Run backfill
            backfilled = AuditChainService.backfill_existing_audit_logs(db)
            self.assertEqual(backfilled, 2)

            # Verify chain
            res = AuditChainService.verify_audit_chain(db)
            self.assertTrue(res.is_valid)
            self.assertEqual(res.total_records_checked, 2)
            self.assertEqual(res.tampered_count, 0)
        finally:
            db.close()

    def test_06_verify_chain_api_endpoint(self):
        """GET and POST /api/v1/audit-logs/verify-chain returns valid HTTP 200 response."""
        res_get = self.client.get("/api/v1/audit-logs/verify-chain")
        self.assertEqual(res_get.status_code, 200)
        data_get = res_get.json()
        self.assertTrue(data_get["is_valid"])
        self.assertEqual(data_get["tampered_count"], 0)
        self.assertTrue(data_get["is_synthetic"])

        res_post = self.client.post("/api/v1/audit-logs/verify-chain")
        self.assertEqual(res_post.status_code, 200)
        data_post = res_post.json()
        self.assertTrue(data_post["is_valid"])


if __name__ == "__main__":
    unittest.main()
