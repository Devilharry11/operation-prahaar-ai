# OPERATION PRAHAAR AI — PROJECT EXECUTIVE ONE-PAGE SUMMARY

> **Tagline:** *"Justice Through Intelligence. Protection Through Technology."*  
> **Project Classification:** Independent Educational Technology Prototype & Responsible AI Decision Support System  
> **Target Environment:** Standard Windows Laptop (8 GB RAM budget, ₹0 Cloud Cost, Sub-300MB RAM Footprint)  
> **Repository:** `https://github.com/Devilharry11/operation-prahaar-ai`  
> **Active Checkpoint:** Commit `e401e03` | Release Tag `v1.0.0-hackathon`

---

## 1. Problem Statement
Modern Security Operations Centers (SOCs) in high-density transit hubs, railway terminals, and public gathering venues face critical operational bottlenecks:
- **Operator Vigilance Fatigue:** Human operators cannot effectively monitor dozens of concurrent video streams, missing early indicators of stampedes, corridor blockages, or abnormal congregations.
- **The "Black-Box" Dilemma:** Conventional AI algorithms generate opaque risk alerts without explaining contributing factors, leading to either blind over-reliance or operator dismissal.
- **Privacy Overreach & Liability:** Traditional surveillance systems risk civil liberty violations via invasive facial biometrics, demographic profiling, and autonomous automated physical actions.
- **Unverifiable Incident Audits:** Incident logs stored in standard databases can be retroactively altered, backdated, or deleted without algorithmic accountability.

---

## 2. Proposed Solution: The Prahaar Architecture
**Operation Prahaar AI** is an AI-assisted, human-in-the-loop decision-support platform that transforms raw public safety telemetry into actionable, explainable, and cryptographically accountable intelligence without ever processing biometric identity:

```
[ Camera Feeds ] ──> [ Non-Identifying Headcount Envelopes ] ──> [ 5-Min Rolling Window ]
                                                                             │
┌────────────────────────────────────────────────────────────────────────────┴──────────┐
│ 1. Explainable AI (XAI) Attribution: 40% Density + 35% Velocity Decel + 25% Signal    │
│ 2. 3-Tier Sequential Human Review: Operator (T1) ──> Supervisor (T2) ──> Chief (T3)   │
│ 3. Cryptographic Audit Chain: Append-only SHA-256 block ledger anchored to genesis    │
└───────────────────────────────────────────────────────────────────────────────────────┘
```

---

## 3. Five Core Architectural Features
1. **Aggregate Spatial Analytics:** Non-identifying spatial density tracking across 4 zones with 5-minute rolling influx rates and zero-division defensive guards.
2. **Explainable AI (XAI) Layer:** Mathematical factor attribution breakdown with percentage weights strictly summing to 100% and reproducible SHA-256 evaluation digests.
3. **Sequential 3-Tier Human Governance:** Role-Based Access Control (RBAC) enforcing sequential sign-off with an anti-rubber-stamping rule (minimum 15-character typed rationale).
4. **Cryptographic Audit Ledger:** Immutable block chaining using SHA-256 linking every operator action to a 64-zero genesis anchor with dynamic tamper and deletion detection.
5. **Synthetic Demo Controller:** Safe, isolated generation of 5 realistic public safety scenarios with atomic transaction rollbacks and baseline data protection.

---

## 4. Technology Stack & Local Budget
| Layer | Technologies Selected | Specifications |
| :--- | :--- | :--- |
| **Backend** | Python 3.10+, FastAPI, SQLAlchemy 2.0, Pydantic v2 | Sub-50ms endpoint latencies, strict schema validation, asynchronous ASGI. |
| **Database** | SQLite 3 (`prahaar.db`) | ₹0 cloud cost, zero background daemons, 100% offline portability. |
| **Frontend** | React 18, TypeScript, Vite 5, Tailwind CSS | Enterprise SOC charcoal/emerald design, 262 KB production JS bundle. |
| **Security** | SHA-256 Block Haining, RBAC Headers | Mathematical tamper detection, sequential cryptographic linkage. |
| **Testing** | Python `unittest`, FastAPI `TestClient`, Edge CDP | 56/56 automated tests passing in 1.85 seconds. |

---

## 5. Responsible AI Guardrails (Code-Enforced Invariants)
- **Zero Facial Biometrics:** No facial detection, matching, or feature embeddings in the codebase.
- **Zero Individual Tracking:** Anonymous headcount values only; no cross-camera person tracking.
- **Zero Autonomous Enforcement:** Strictly no autonomous dispatch, drone piloting, or weapon triggers.
- **Unverified by Default:** All AI alerts start as `UNVERIFIED`; escalation requires explicit human sign-off.
- **Zero Raw Frame Persistence:** Raw camera frames are analyzed in volatile memory and never saved to disk.

---

## 6. Access & Deployment Links
- **GitHub Repository:** [https://github.com/Devilharry11/operation-prahaar-ai](https://github.com/Devilharry11/operation-prahaar-ai)
- **Git Release Tag:** `v1.0.0-hackathon` (Commit `e401e03`)
- **Local Command Center (Verified Active):** `http://127.0.0.1:5173`
- **Local Backend API (Verified Active):** `http://127.0.0.1:8000/api/v1`
- **Local Health Endpoint (Verified 200 OK):** `http://127.0.0.1:8000/api/v1/health`
- **Render Cloud Backend Blueprint:** Configured in `render.yaml` (`operation-prahaar-ai-backend`)
- **Vercel Cloud Frontend Blueprint:** Configured in `vercel.json` and `frontend/vercel.json`

---

## 7. Verification Evidence & Quality Metrics
- **Automated Tests:** 56/56 unit & integration tests passing (`OK`) in 1.852s.
- **Production Build:** Vite production bundle compiled in 3.69s (0 errors).
- **Edge UI Verification:** 6 verified high-resolution screenshots archived in `docs/final_screenshots/`.
- **Archive Package:** `OPERATION_PRAHAAR_AI_FINAL.zip` (2.59 MB, 138 files, 100% CRC32 verified).
