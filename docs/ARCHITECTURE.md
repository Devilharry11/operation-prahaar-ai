# OPERATION PRAHAAR AI — SYSTEM ARCHITECTURE
### Advanced AI-Powered Counter-Terrorism Support & National Public Safety Intelligence Platform

---

## 1. Executive Architectural Overview

Operation Prahaar AI is engineered as an **Edge-to-Command Center Decision Support Architecture** designed for high reliability, low latency, privacy compliance, and modest hardware footprints (capable of running fully on a standard 8 GB RAM laptop during prototyping, and scaling to dedicated Mini PC edge nodes).

```
                                      [ Authorized CCTV Source / Sample Stream ]
                                                          |
                                                          v
================================================================================================================
                                          PRAHAAR EDGE NODE (Local Machine)
================================================================================================================
  +-------------------------+     +-------------------------+     +-----------------------------------+
  |   Video Ingestion &     | --> |   Spatial Vision Pipe   | --> |     Edge Event Dispatcher         |
  |   Frame Sampler (OpenCV)|     |   - Background MOG2     |     |  - Filters raw frames (discards)  |
  |   (5-10 fps CPU cap)    |     |   - Density Estimation  |     |  - Constructs Anonymized Event    |
  +-------------------------+     |   - Polygon Zone Check  |     |  - Signs & POSTs JSON Payload     |
                                  +-------------------------+     +-----------------+-----------------+
                                                                                    |
                                                                                    | Secure Local HTTP/JSON
                                                                                    v
================================================================================================================
                                   PRAHAAR INTELLIGENCE BACKEND (FastAPI + SQLite)
================================================================================================================
  +---------------------------------------------------------------------------------+
  | REST API Gateway (/api/v1/events, /api/v1/incidents, /api/v1/reviews)           |
  +---------------------------------------------------------------------------------+
                                    |
            +-----------------------+-----------------------+
            v                                               v
  +-------------------------------+             +-----------------------------------+
  |   Intelligence Engine         |             |   SQLite Database (SQLAlchemy)    |
  |   - Spatiotemporal Clustering |             |   - Cameras & Edge Devices        |
  |   - Advisory Correlation      | <---------> |   - Incidents & Safety Events     |
  |   - Severity & Confidence Calc|             |   - Advisories & Human Reviews    |
  |   - Explainability Generator  |             |   - Immutable Audit Logs          |
  +-------------------------------+             +-----------------------------------+
            |
            v
  +-------------------------------+
  |   Human Review Dispatcher     |
  |   (Marks alerts as UNVERIFIED)|
  +-------------------------------+
            |
            v
================================================================================================================
                                  PRAHAAR COMMAND CENTER (React + Vite + Tailwind)
================================================================================================================
  +---------------------------------------------------------------------------------+
  | Professional Defence-Inspired Dashboard (Olive Green #1B2E1E / Charcoal Slate)  |
  | - Live Situation Overview & Telemetry Grid                                      |
  | - Camera Status & Heatmap Density View                                          |
  | - Unverified Alert Queue with Evidence Snapshot                                 |
  | - Operator Human Verification Console (Verify / Dismiss / Escalate)             |
  | - Audit Log Viewer & Compliance Ledger                                          |
  +---------------------------------------------------------------------------------+
```

---

## 2. Core Architectural Principles

### A. Privacy Preservation by Architectural Segregation
- **No Biometric Extraction:** The vision pipeline never performs facial detection, landmark extraction, facial embeddings, or demographic classification.
- **Ephemeral Frame Buffering:** Raw video frames are analyzed in memory and immediately discarded. Only structured, non-identifying telemetry (e.g., `event_type="HIGH_CROWD_CONGESTION"`, `bounding_boxes=[...]`, `density_ratio=0.82`) is persisted.
- **Zero Cross-Camera Tracking:** Events are indexed strictly by camera ID and timestamp; individuals are never linked or re-identified across disparate camera feeds.

### B. Human-in-the-Loop Decision Support
- **Unverified by Default:** All AI-generated safety events enter the system as `UNVERIFIED`.
- **Mandatory Operator Action:** No automated enforcement action or police notification is dispatched. An authorized human operator must inspect the event summary, examine the context, and execute an explicit **Verify**, **Dismiss**, or **Escalate** command.
- **Audit Logging:** Every human review decision is recorded with operator ID, timestamp, rationale, and prior state in an append-only audit ledger.

### C. Resource Efficiency for 8 GB RAM Laptop
- Frame ingestion is downscaled (e.g., 640x360 or 480p) and sampled at 5–10 frames per second to ensure CPU usage remains under 25% and memory footprint under 300 MB.
- Backend runs an asynchronous FastAPI ASGI server with SQLite connection pooling, consuming under 60 MB RAM.
- Frontend is pre-compiled via Vite and rendered as an optimized single-page application.

---

## 3. Database Schema Blueprint (Phase 2 Preview)

The database consists of 14 core entities:
1. `organizations`: Sponsoring public safety/venue entity.
2. `users`: Authorized personnel with role-based access.
3. `roles_permissions`: Granular RBAC definitions (Admin, Operator, Analyst, Auditor).
4. `locations`: Venue/facility physical zones.
5. `cameras`: Registered CCTV streams with zone polygon definitions.
6. `edge_devices`: Edge hardware units (laptop simulator or Mini PC).
7. `camera_events`: Raw spatial telemetry events from edge nodes.
8. `incidents`: Correlated safety situations grouping multiple events.
9. `alerts`: Actionable alerts raised by the Intelligence Engine.
10. `security_advisories`: Government or agency safety notices.
11. `evidence`: Event contextual metadata and anonymized visual metrics.
12. `human_reviews`: Operator determinations (Verified / Rejected / Escalated).
13. `approvals`: Multi-tier sign-off for critical advisories.
14. `audit_logs`: Append-only tamper-evident compliance audit trail.

---

## 4. Communication Protocols

| Component Link | Protocol | Data Format | Security Mechanism |
| :--- | :--- | :--- | :--- |
| **Edge -> Backend** | HTTP/REST (POST) | JSON Payload | Shared Device Token + Signature |
| **Backend -> Frontend** | HTTP/REST + Polling/SSE | JSON | Bearer JWT / Session Header |
| **Frontend -> Backend** | HTTP/REST (PATCH/POST) | JSON | Role-Checked Operator Auth |
