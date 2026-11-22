# OPERATION PRAHAAR AI — PROJECT ARCHITECTURE EXPLAINED
### In-Depth Architectural Specification, Directory Breakdown & Code Mapping
**Classification:** Academic Engineering Documentation  
**Target:** Beginners & Students Defending Full-Stack System Architecture

---

## 1. High-Level Architecture Flowchart

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                       1. FRONTEND: PRAHAAR COMMAND CENTER                   │
│   React 18 • TypeScript • Tailwind CSS • Vite 5 (Port 5173)                 │
│   - Header Role Switcher (Rajesh Sharma / Priya Patel / Vikram Verma)      │
│   - Crowd Dynamics (5-Min Rolling Window SVG Curves)                        │
│   - Incident Dossier & XAI Factor Attribution Drawer                        │
│   - 3-Tier Human Verification Console (Status & Validation Feedback)        │
│   - Cryptographic Audit Ledger & Chain Verifier Component                   │
└──────────────────────────────────────┬──────────────────────────────────────┘
                                       │ HTTP / REST Calls
                                       │ Headers: X-Operator-Badge: IND-OPR-4081
                                       ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                       2. API ROUTING & VALIDATION LAYER                     │
│   FastAPI • Pydantic v2 • CORSMiddleware (Port 8000, Prefix: /api/v1)       │
│   - Router: backend/app/api/router.py                                       │
│   - Endpoints: /health, /analytics, /incidents, /governance, /audit-logs    │
│   - Schemas: Pydantic v2 Models validating payloads before execution        │
│   - RBAC Security: get_current_active_operator dependency in auth.py        │
└──────────────────────────────────────┬──────────────────────────────────────┘
                                       │
                                       ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                       3. BACKEND CORE BUSINESS LOGIC                        │
│   Python Services Layer                                                     │
│   - analytics.py: Rolling 5-min aggregation, zero-division clamping guards  │
│   - xai.py: Factor attribution (40% Density, 35% Velocity, 25% Signal)      │
│   - governance.py: Sequential 3-Tier HITL state machine, min 15-char check  │
│   - audit_chain.py: SHA-256 block hash computation & genesis link traversal │
│   - demo.py: Synthetic scenario generator with atomic transaction rollbacks │
└──────────────────────────────────────┬──────────────────────────────────────┘
                                       │ SQLAlchemy ORM 2.0
                                       ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                       4. PERSISTENCE & DATA STORAGE                         │
│   SQLite Database Engine (prahaar.db)                                       │
│   - 14 Relational Tables with foreign keys & timestamped indexes            │
│   - ACID Transaction Boundaries (commit on success, rollback on error)      │
│   - Baseline Seed Records: INC-2026-0001 & ALT-2026-0001 protected          │
└──────────────────────────────────────┬──────────────────────────────────────┘
                                       │
                                       ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                       5. CRYPTOGRAPHIC INTEGRITY AUDIT                      │
│   SHA-256 Mathematical Hash Chain Engine                                    │
│   - Genesis Anchor: 64 x '0' string                                         │
│   - Block Formula: SHA-256(BlockID + Timestamp + Action + Summary + PrevHash)│
│   - Tamper Detection: Detects SQL cell modification, insertion & deletion   │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Directory Structure Breakdown

### Frontend (`frontend/`)
```
frontend/
├── index.html                    # HTML entrypoint, title & meta tags
├── package.json                  # NPM packages (react, lucide-react, tailwindcss, vite)
├── tsconfig.json                 # TypeScript strict compiler options
├── vite.config.ts                # Vite dev server & proxy build configuration
├── tailwind.config.js            # SOC dark-mode charcoal & emerald palette
├── vercel.json                   # SPA rewrite rules for cloud deployment
├── .env.example                  # VITE_API_BASE_URL placeholder
└── src/
    ├── main.tsx                  # React DOM root render
    ├── App.tsx                   # Top-level state orchestrator & demo banner
    ├── index.css                 # Tailwind directives & custom scrollbars
    ├── vite-env.d.ts             # Vite client environment types declaration
    ├── types/
    │   └── index.ts              # Full TypeScript type definitions (Alert, Incident, XAI, etc.)
    ├── services/
    │   └── api.ts                # PrahaarAPI client with dynamic baseUrl & fallback resilience
    ├── components/
    │   ├── Header.tsx            # Top nav header, active role badge dropdown, status pills
    │   ├── Sidebar.tsx           # 12-section navigation bar with unverified alert badges
    │   ├── Common.tsx            # Reusable StatCard, StatusBadge, GlassPanel components
    │   └── DemoControllerModal.tsx # Interactive modal for 5 synthetic demo scenarios
    └── views/
        ├── OverviewDashboard.tsx # Global SOC dashboard with KPI cards & camera grid
        ├── CrowdAnalytics.tsx    # 4-zone spatial metrics & 5-min rolling SVG trend curve
        ├── IncidentManagement.tsx# Incident list with XAI Factor Drawer integration
        ├── HumanVerification.tsx # 3-Tier sequential review console (T1, T2, T3 tabs)
        ├── AuditLogs.tsx         # Cryptographic audit ledger with 1-click verify button
        ├── AlertCenter.tsx       # Real-time alert list with review status tags
        ├── CameraManagement.tsx  # Camera feed registry
        ├── LiveVideoMonitoring.tsx # Simulated camera surveillance grids
        ├── SafetyEvents.tsx      # Low-level camera event log
        ├── SecurityIntelligence.tsx # Threat advisories & location summaries
        ├── EdgeDeviceManagement.tsx # Virtual edge node telemetry status
        └── SystemSettings.tsx    # System configuration & Responsible AI compliance checks
```

### Backend (`backend/`)
```
backend/
├── app/
│   ├── main.py                   # FastAPI initialization, CORS middleware, API router mount
│   ├── core/
│   │   ├── config.py             # Settings class (CORS, DB URL, Responsible AI invariants)
│   │   ├── security.py           # Password hashing & operator credential helpers
│   │   └── datetime_util.py      # UTC-compliant ISO datetime normalization helpers
│   ├── db/
│   │   ├── base.py               # SQLAlchemy declarative Base registration
│   │   └── session.py            # SQLite engine & scoped SessionLocal factory
│   ├── models/
│   │   ├── entities.py           # 14 SQLAlchemy ORM table definitions
│   │   └── enums.py              # Strongly-typed Enums (ReviewStatus, IncidentStatus, Severity)
│   ├── schemas/
│   │   ├── analytics.py          # Pydantic v2 schemas for 5-min rolling window trends
│   │   ├── xai.py                # Pydantic v2 schemas for factor attribution breakdown
│   │   ├── governance.py         # Schemas for Tier 1, 2, 3 review requests & validation
│   │   ├── audit_verify.py       # Cryptographic chain verification response schema
│   │   └── demo.py               # Request/response schemas for synthetic demo scenarios
│   ├── services/
│   │   ├── analytics.py          # Spatial density engine, clamping, zero-division guards
│   │   ├── xai.py                # Explainable AI heuristic tree & evaluation digest generator
│   │   ├── governance.py         # 3-tier sequential state machine & 15-char rationale checks
│   │   ├── audit_chain.py        # SHA-256 block hash computation & tamper detection algorithm
│   │   └── demo.py               # Transactional synthetic scenario generation & reset logic
│   └── api/
│       ├── router.py             # Combines all modular route controllers
│       ├── deps.py               # Database session dependency (get_db)
│       └── endpoints/
│           ├── health.py         # GET /api/v1/health (asserts Responsible AI invariants)
│           ├── analytics.py      # /api/v1/analytics/zones, /trends, /hotspots, /summary
│           ├── incidents.py      # /api/v1/incidents & /api/v1/incidents/{id}/explain (XAI)
│           ├── governance.py     # /api/v1/governance/queue, /tier1, /tier2, /tier3
│           ├── audit.py          # /api/v1/audit-logs & /api/v1/audit-logs/verify-chain
│           └── demo.py           # /api/v1/demo/generate-event & /api/v1/demo/reset
```

---

## 3. Database Schema: All 14 Relational Tables

| # | Table Name | Key Columns | Purpose |
| :- | :--- | :--- | :--- |
| 1 | `organizations` | `id, name, code, contact_email` | Tenant agency managing the venue. |
| 2 | `roles` | `id, name, description` | System security roles (`COMMAND_OPERATOR`, `INTELLIGENCE_ANALYST`, `CHIEF_CONTROLLER`). |
| 3 | `permissions` | `id, code, description` | Granular capability flags. |
| 4 | `users` | `id, badge_number, full_name, email, role_id, is_active` | Human operators authenticated in the SOC. |
| 5 | `locations` | `id, name, code, venue_type, city, capacity` | Physical venues (e.g. New Delhi Railway Station). |
| 6 | `edge_devices` | `id, device_id, name, location_id, ip_address, status` | Virtual edge processing nodes. |
| 7 | `cameras` | `id, camera_id, name, stream_url, zone_code, location_id` | Monitored camera channels across zones A–D. |
| 8 | `camera_events` | `id, event_id, camera_id, event_type, confidence, metadata_json` | Low-level vision events (headcount, bounding boxes). |
| 9 | `incidents` | `id, incident_id, title, status, severity, explanation` | Aggregated security situations requiring human review. |
| 10 | `alerts` | `id, alert_id, incident_id, review_status, uncertainty_level` | Operator-facing alert notifications (defaults to `UNVERIFIED`). |
| 11 | `security_advisories`| `id, advisory_id, title, threat_level, status` | Published public safety advisories (requires Tier 3 sign-off). |
| 12 | `evidence` | `id, incident_id, evidence_type, file_path, hash_sha256` | Attached telemetry digests and frame references. |
| 13 | `human_reviews` | `id, incident_id, reviewer_id, review_status, rationale` | Human decision records with minimum 15-char rationale. |
| 14 | `audit_logs` | `id, action, summary, operator_badge, block_hash, previous_hash` | Immutable cryptographic ledger table. |

---

## 4. Key API Endpoints & HTTP Methods

| HTTP Method | Route | Backend Controller | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/v1/health` | `health.py:get_system_health` | Returns server health, DB status, and Responsible AI invariants. |
| `POST` | `/api/v1/demo/generate-event` | `demo.py:generate_event` | Generates safe synthetic demo incident, alert, and audit record. |
| `GET` | `/api/v1/analytics/zones` | `analytics.py:get_zones` | Returns real-time density metrics for Zones A, B, C, D. |
| `GET` | `/api/v1/analytics/trends` | `analytics.py:get_trends` | Returns 5-minute rolling window aggregate trend buckets. |
| `GET` | `/api/v1/incidents/{id}/explain`| `incidents.py:explain_incident` | Computes XAI factor attribution breakdown and SHA-256 digest. |
| `GET` | `/api/v1/governance/queue` | `governance.py:get_queue` | Returns partitioned queues for Tier 1, Tier 2, and Tier 3 reviews. |
| `POST` | `/api/v1/governance/tier1/review`| `governance.py:tier1_review` | Validates $\ge 15$-char rationale; transitions to `VERIFIED` or `DISMISSED`. |
| `POST` | `/api/v1/governance/tier2/confirm`| `governance.py:tier2_confirm` | Watch Officer confirmation; transitions to `TACTICAL_CONFIRMED`. |
| `POST` | `/api/v1/governance/tier3/approve`| `governance.py:tier3_approve` | Chief Controller sign-off; transitions to `ADVISORY_PUBLISHED`. |
| `GET` | `/api/v1/audit-logs/verify-chain` | `audit.py:verify_chain` | Recalculates full SHA-256 chain from genesis block; detects tampering. |

---

## 5. Authentication & Authorization Workflow

```
[ Frontend Request ]
  └── Header: X-Operator-Badge: IND-ANA-2094
         │
         ▼
[ FastAPI Dependency: get_current_active_operator in backend/app/api/endpoints/governance.py ]
  ├── 1. Queries SQLite users table: SELECT * FROM users WHERE badge_number = 'IND-ANA-2094'
  │      └── If not found: raises HTTPException(status_code=401, detail="Invalid operator identity")
  ├── 2. Checks active status: if not user.is_active
  │      └── If false: raises HTTPException(status_code=403, detail="Operator account deactivated")
  └── 3. Checks Role Permission:
         ├── If calling Tier 3 endpoint:
         │   └── Checks: if user.role.name != 'CHIEF_CONTROLLER'
         │       └── raises HTTPException(status_code=403, detail="Tier 3 requires Chief Controller")
         └── If authorized: injects authenticated operator object into controller
```
