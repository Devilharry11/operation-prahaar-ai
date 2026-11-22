# OPERATION PRAHAAR AI — KNOWN LIMITATIONS & FUTURE SCOPE

**Project:** Operation Prahaar AI (Student Technology Prototype)  
**Target Environment:** Local Windows Laptop (8 GB RAM budget, ₹0 Cloud Cost)  
**Date:** 2026-11-22  

---

### 1. Prototype Scope & Resource Limitations

1. **Hardware Constraints:**
   - Designed to run on a standard 8 GB RAM laptop without dedicated GPU acceleration.
   - Background frame processing is throttled to 5 FPS to preserve CPU capacity.
   - High-throughput production deployments would require dedicated edge appliances with GPU/NPU acceleration (e.g., NVIDIA Jetson Orin or Intel OpenVINO hardware).

2. **Database Engine (SQLite):**
   - The platform utilizes local SQLite (`prahaar.db`) for zero-cost, zero-configuration local evaluation.
   - SQLite enforces database-level write locking, limiting simultaneous high-volume write concurrency.
   - Production deployments must migrate to enterprise PostgreSQL with connection pooling (e.g., PgBouncer) and read replicas.

3. **Development-Only Authentication:**
   - Operator identity is verified via the `X-Operator-Badge` HTTP header against SQLite `users` records.
   - This design enables seamless hackathon evaluation without external cloud OAuth2 providers.
   - Production deployments must integrate OAuth2 / OpenID Connect (OIDC), mutual TLS (mTLS) with smartcard / PKI authentication, and strict short-lived signed JWTs.

4. **Cryptographic Audit Ledger Boundary:**
   - The SHA-256 block hash chain successfully detects row alteration, reordering, and intermediate block deletion.
   - However, because the database is a local SQLite file, a user with direct OS root access could rewrite the entire database file from genesis.
   - Physical tamper-proofing in production requires Write-Once-Read-Many (WORM) storage or external distributed timestamping.

5. **Simulated Video Ingestion:**
   - Edge telemetry operates in simulation mode using local sample video files (`sample_test.mp4`) and mathematical Gaussian wave simulations.
   - Real-world integration with live RTSP/ONVIF streams from physical CCTV infrastructure is outside the scope of this student demonstration.

---

### 2. Future Scope Roadmap

1. **Federated Privacy-Preserving Learning:**
   - Distribute edge model weight updates across physical stations without transmitting raw video frames to central servers.
2. **Hardware Security Module (HSM) Integration:**
   - Anchor the genesis block and chain-head block hashes using dedicated hardware security chips (TPM 2.0 or FIPS 140-2 Level 3 HSM).
3. **Enterprise Message Broker Integration:**
   - Replace in-process polling with Apache Kafka or RabbitMQ event streaming for sub-second multi-station telemetry dispatch.
4. **GIS Geospatial Mapping Integration:**
   - Integrate vector maps (e.g., OpenLayers or Mapbox) with real GPS coordinate overlays for large-scale multi-terminal transportation hubs.
