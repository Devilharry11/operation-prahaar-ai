# OPERATION PRAHAAR AI
### Advanced AI-Powered Counter-Terrorism Support & National Public Safety Intelligence Platform

> **Tagline:** *"Justice Through Intelligence. Protection Through Technology."*  
> **Classification:** Independent Educational Technology Prototype & Responsible AI Decision Support System  
> **Target Environment:** Standard Windows Laptop (8 GB RAM budget, ₹0 Cloud Cost, Sub-300MB RAM Footprint)  
> **Current Status:** Phase C Fully Implemented, Stabilized, and Verified (56/56 Tests Passing)

---

## 1. Vision & Core Mission

- **Vision:** To contribute toward a safer nation and a world protected from public mass-casualty threats through advanced, transparent, explainable, and human-guided technology.
- **Mission:** Equip authorized public safety controllers and security watch officers with real-time spatial density awareness, explainable heuristic alerting, multi-tier human governance, and an immutable cryptographic audit ledger for high-density transit terminals and sensitive gathering venues.
- **Target Applications:** Mass transit corridors, railway terminals, airport concourses, and large public gathering venues.

---

## 2. Responsible AI & Strict Ethical Safeguards

**Operation Prahaar AI is strictly a human-in-the-loop decision-support prototype, NOT an autonomous law-enforcement or facial recognition system.**

### Strict Prohibitions (Enforced at Code & Architecture Level):
1. **NO Facial Recognition:** Does not scan, match, extract, or store individual facial biometric features.
2. **NO Individual Tracking:** Does not track individual people across cameras or create movement dossiers.
3. **NO Demographic Profiling:** Does not make inferences based on religion, ethnicity, gender, appearance, or attire.
4. **NO Autonomous Enforcement:** Strictly zero autonomous police dispatch, drone controls, automated physical actions, or weapon integration.
5. **NO Unverified Escalations:** Every alert defaults to `UNVERIFIED` and requires formal human sign-off before tactical notification.

### Core Capabilities:
1. **Non-Identifying Spatial Analytics:** Heuristic spatial density estimation, rolling 5-minute influx rates, and bottleneck congestion warnings.
2. **Explainable AI (XAI) Advisory Layer:** Transparent factor attribution breakdown with explicit percentage weights, baseline thresholds, and reproducible evaluation digests.
3. **3-Tier Human Governance Console:** Sequential decision gate (Tier 1 Operator Verification $\rightarrow$ Tier 2 Watch Officer Confirmation $\rightarrow$ Tier 3 Chief Controller Sign-Off) enforcing minimum 15-character operational rationale to prevent rubber-stamping.
4. **Cryptographic Audit Ledger:** Append-only SHA-256 block hash chain linking every event to a 64-zero genesis anchor with automated tamper and broken-link detection.
5. **Synthetic Demo Controller:** Safe, self-contained demonstration scenario generator for hackathon evaluations with atomic rollbacks and baseline protection.

---

## 3. High-Level System Architecture

```
+-----------------------------------------------------------------------------------+
|                            PRAHAAR COMMAND CENTER (React 18)                      |
|   Tailwind CSS • Lucide Icons • Enterprise Charcoal & Emerald Aesthetics          |
|   - Spatial Density & 5-Min Rolling SVG Charts    - Multi-Tier HITL Governance    |
|   - Explainable AI (XAI) Transparent Factors      - Cryptographic Chain Verifier  |
|   - Operator Role Switcher (Operator / Watch Officer / Chief Controller)         |
+------------------------------------------^----------------------------------------+
                                           | REST APIs (FastAPI)
+------------------------------------------v----------------------------------------+
|                             PRAHAAR INTELLIGENCE BACKEND                           |
|   FastAPI • SQLAlchemy • Pydantic v2 • SQLite (prahaar.db)                        |
|   - Milestone C.1: Aggregate Analytics Engine (4 Zones, 5-Min Rolling Window)    |
|   - Milestone C.2: Explainable AI Advisory Layer (Reproducible Heuristic Trees)   |
|   - Milestone C.3: 3-Tier Human Governance Service (RBAC & Sequential Gates)      |
|   - Milestone C.4: Cryptographic Audit Ledger Service (SHA-256 Block Chaining)    |
|   - Phase B: Synthetic Demo Controller (5 Safe Scenarios, Bounds & Reset Safety)  |
+------------------------------------------^----------------------------------------+
                                           | Simulated Telemetry
+------------------------------------------v----------------------------------------+
|                             LOCAL VISION & EDGE TELEMETRY                         |
|   Lightweight Headless Event Simulator • Non-identifying Headcount Envelopes      |
+-----------------------------------------------------------------------------------+
```

---

## 4. Technology Stack & Local Budget

| Component | Selected Technologies | Specifications & Justification |
| :--- | :--- | :--- |
| **Backend** | Python 3.14+, FastAPI, SQLAlchemy, Pydantic v2 | High-throughput asynchronous REST API, typed schema enforcement, sub-50ms latency. |
| **Database** | SQLite 3 (`prahaar.db`) | Zero cloud budget (₹0 cost), zero external daemon required, fully self-contained. |
| **Frontend** | React 18, TypeScript, Vite 5, Tailwind CSS | Enterprise SOC design, sub-300KB production bundle, ultra-responsive UI. |
| **Integrity** | SHA-256 Cryptographic Hash Chaining | Immutable block ledger linking every audit entry to its predecessor and genesis anchor. |
| **Testing** | Python `unittest`, FastAPI `TestClient`, Microsoft Edge CDP | Complete automated test coverage (56/56 tests passing). |

---

## 5. Quickstart & Installation Guide

### Prerequisites
- Python 3.10+ (Tested on Python 3.14.6)
- Node.js 18+ (Tested on Node.js v24.18.1)
- Windows / Linux / macOS (Runs locally on 8 GB RAM laptop)

### Step 1: Install Backend Dependencies
```bash
python -m pip install -r requirements.txt
```

### Step 2: Install Frontend Dependencies
```bash
cd frontend
npm install
cd ..
```

### Step 3: Run Full Automated Verification Suite
Verify all 56 foundation, backend, demo controller, analytics, XAI, governance, and cryptographic audit tests:
```bash
python -m unittest discover -s tests -p "test_*.py" -v
```
*(All 56 tests execute and pass in under 2 seconds).*

### Step 4: Build Frontend Production Bundle
```bash
npm --prefix frontend run build
```

### Step 5: Start Local Platform
Open two terminal windows:

**Terminal 1 (Backend API):**
```bash
python -m uvicorn backend.app.main:app --host 127.0.0.1 --port 8000
```

**Terminal 2 (Command Center Frontend):**
```bash
npm --prefix frontend run dev
```

Open your browser to: **`http://127.0.0.1:5173`**

---

## 6. Hackathon Demonstration Workflow

Follow these 5 interactive demonstration steps during evaluation:

### Step 1: Situation Overview & Role Switcher
- Observe the enterprise SOC Command Center dashboard with live system health indicators.
- In the top header, observe the **Operator Role Switcher**:
  - `IND-OPR-4081`: Rajesh Sharma (Control Operator: Tier 1)
  - `IND-ANA-2094`: Priya Patel (Watch Officer: Tier 2)
  - `IND-ADM-001`: Vikram Verma (Chief Controller: Tier 3)
- Notice the **NO FACIAL RECOG** and **UNVERIFIED** safety guardrail pills.

### Step 2: Generate Safe Demonstration Scenario
- Click **⚡ DEMO CONTROLLER** in the top header.
- Select a scenario (e.g. `Simulated Congestion Advisory` or `Aggregate Occupancy Exceeded`).
- Click **GENERATE DEMONSTRATION EVENT**.
- Observe backend confirmation displaying the generated synthetic Incident and Alert codes (e.g. `INC-2026-XXXX`).

### Step 3: Spatial Density & Rolling Trend Analytics
- In the sidebar, navigate to **Crowd Dynamics**.
- Inspect the 4 monitored demonstration zones:
  - `ZONE-A`: Main Concourse
  - `ZONE-B`: Entry Hall
  - `ZONE-C`: Waiting Area
  - `ZONE-D`: Exit Corridor
- Observe the **5-Minute Rolling Density Telemetry** SVG curve chart with nominal ($< 75\%$) vs congestion ($\ge 75\%$) threshold overlays.

### Step 4: Explainable AI (XAI) Attribution Breakdown
- In the sidebar, navigate to **Incident Dossier**.
- Select the generated incident.
- Examine the **Transparent Attribution Factor Breakdown**:
  - Measured Headcount Density vs. Safety Baseline.
  - Flow Velocity Deceleration vs. Normal Corridor Egress Speed.
  - Telemetry Frame Rate Quality.
  - Percentage factor weights summing to 100%.
  - Reproducible SHA-256 evaluation digest and non-identifying disclaimer.

### Step 5: 3-Tier Human Verification Console (HITL)
- In the sidebar, navigate to **Human Verification**.
- **Tier 1 (Operator Inspection):**
  - Select active incident.
  - Input operational rationale ($\ge 15$ characters).
  - Click **VERIFY INCIDENT (TIER 1)** $\rightarrow$ Status advances to `VERIFIED`.
- **Tier 2 (Watch Officer Confirmation):**
  - In top header, switch role to **P. Patel (Watch Officer: Tier 2)** (`IND-ANA-2094`).
  - Select **Tier 2: Watch Officer** tab.
  - Input supervisory explanation ($\ge 15$ characters).
  - Click **CONFIRM INCIDENT (TIER 2)** $\rightarrow$ Status advances to `TACTICAL_CONFIRMED`.
- **Tier 3 (Chief Controller Sign-Off):**
  - In top header, switch role to **V. Verma (Chief Controller: Tier 3)** (`IND-ADM-001`).
  - Select **Tier 3: Chief Controller** tab.
  - Input executive sign-off comments ($\ge 15$ characters).
  - Click **APPROVE ADVISORY RELEASE (TIER 3)** $\rightarrow$ Status advances to `ADVISORY_PUBLISHED`.

### Step 6: Cryptographic Audit Ledger Verification
- In the sidebar, navigate to **Audit Ledger**.
- Click **⚡ VERIFY CRYPTOGRAPHIC CHAIN**.
- Watch the platform traverse all blocks from the 64-zero genesis anchor to the chain head.
- Observe the green seal: **`CRYPTOGRAPHIC CHAIN INTEGRITY VERIFIED — SEQUENTIALLY LINKED TO GENESIS ANCHOR`**.
- Review the ledger table showing the sequential SHA-256 current and previous block hashes for every human decision!

---

## 7. Key Documentation & Hackathon Artifacts

For comprehensive evaluation, review the following documents:
- [System Architecture](file:///docs/FINAL_PROJECT_ARCHITECTURE.md): Complete end-to-end technical specification.
- [Hackathon Demo Guide](file:///docs/HACKATHON_DEMO_GUIDE.md): 5-minute evaluator and judge script.
- [Security & Responsible AI Review](file:///docs/FINAL_SECURITY_REVIEW.md): In-depth security, RBAC authorization, and ethical guardrail analysis.
- [Final Test Report](file:///docs/FINAL_TEST_REPORT.md): 56/56 unit, integration, and browser verification test matrix.
- [Known Limitations & Roadmap](file:///docs/KNOWN_LIMITATIONS.md): Transparent operational boundaries and hardware transition roadmap.
- [Edge UI Screenshots](file:///docs/final_screenshots/): High-resolution captures of the 6 core operational views.

---

## 8. Automated Test Suite Summary

```
======================================================================
Ran 56 tests in 1.892s — OK (0 failures, 0 errors)
======================================================================
- Foundation Tests: 4 passed
- Backend & Database Tests: 7 passed
- Frontend Configuration & Bundle Tests: 4 passed
- Phase B Demo Controller Stabilization Tests: 16 passed
- Phase C.1 Aggregate Analytics Tests: 7 passed
- Phase C.2 Explainable AI (XAI) Tests: 4 passed
- Phase C.3 Multi-Tier Human Governance Tests: 8 passed
- Phase C.4 Cryptographic Audit Hash Chain Tests: 6 passed
```

---

## 9. License & Acknowledgments

Developed as an independent student prototype for public safety innovation and responsible AI education. Dedicated to national public safety personnel and first responders who protect crowded public venues every day.
