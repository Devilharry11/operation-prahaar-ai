# OPERATION PRAHAAR AI — HACKATHON LIVE DEMONSTRATION GUIDE
## 5-Minute Evaluator & Judge Walkthrough Script

**Platform Tagline:** *"Justice Through Intelligence. Protection Through Technology."*  
**Mission:** Decision-support platform for public safety watch officers and incident controllers.  
**Audience:** Hackathon Judges, Technical Evaluators & Public Safety Domain Experts.

---

### Pre-Demo Verification Checklist (10 Seconds)
1. Backend running: `http://127.0.0.1:8000/docs` (FastAPI Swagger UI).
2. Frontend running: `http://127.0.0.1:5173` (React SOC Command Center).
3. Database initialized: `prahaar.db` with baseline seed records.
4. Active Operator Badge in Header: Default `IND-OPR-4081` (R. Sharma, Control Operator).

---

### Scene 1: Enterprise SOC Dashboard & Responsible AI (1 Minute)
1. **Navigate to:** `http://127.0.0.1:5173`
2. **Key Talking Points:**
   - *"Welcome to Operation Prahaar AI. Built on a charcoal and emerald defense aesthetic, this platform provides real-time situational intelligence for crowded transit hubs like New Delhi Railway Station."*
   - Point out the **Responsible AI Invariants** in the top header:
     - `NO FACIAL RECOG`: Zero facial biometric capture, zero watchlists, zero cross-camera tracking.
     - `UNVERIFIED`: All AI-assisted alerts start strictly as unverified decision support.
     - `LIVE BACKEND`: Real-time SQLite and FastAPI connectivity.
   - Point out the **Operator Role Switcher** dropdown in the header:
     - `IND-OPR-4081`: Control Room Operator (Tier 1)
     - `IND-ANA-2094`: Senior Watch Officer (Tier 2)
     - `IND-ADM-001`: Chief Controller (Tier 3)

---

### Scene 2: Generate Safe Synthetic Demonstration Event (45 Seconds)
1. **Click:** `⚡ DEMO CONTROLLER` in the top header.
2. **Action:**
   - Select scenario: `SIMULATED CONGESTION ADVISORY` or `AGGREGATE OCCUPANCY EXCEEDED`.
   - Click: **`GENERATE DEMONSTRATION EVENT`**.
3. **Key Talking Points:**
   - *"The platform includes a safe, self-contained synthetic scenario generator. This allows evaluators to simulate spatial anomalies without connecting to physical CCTV cameras."*
   - Point out the green confirmation banner displaying the generated `INC-2026-XXXX` and `ALT-2026-XXXX` codes.
   - Close the modal.

---

### Scene 3: Spatial Density & 5-Minute Rolling Analytics (1 Minute)
1. **Click:** `Crowd Dynamics` in the left sidebar.
2. **Key Talking Points:**
   - *"Here we see non-identifying spatial density estimation across 4 demonstration zones: Main Concourse, Entry Hall, Waiting Area, and Exit Corridor."*
   - Point out the **5-Minute Rolling Density Telemetry** SVG curve chart:
     - Explain the dynamic wave simulation and nominal ($< 75\%$) vs congestion ($\ge 75\%$) threshold overlays.
     - Click the zone filter pills (`ZONE-A`, `ZONE-B`, `ALL`) to demonstrate interactive telemetry slicing.

---

### Scene 4: Explainable AI (XAI) Factor Attribution Breakdown (1 Minute)
1. **Click:** `Incident Dossier` in the left sidebar.
2. **Action:** Select an active incident from the list on the left.
3. **Key Talking Points:**
   - *"Prahaar AI eliminates 'black-box' artificial intelligence. Every safety alert provides a full Explainable AI breakdown."*
   - Review the **Transparent Attribution Factor Breakdown**:
     - Measured Headcount Density vs. Safety Baseline (Weight: 45%).
     - Flow Velocity Deceleration vs. Normal Corridor Benchmarks (Weight: 35%).
     - Edge Telemetry Quality & Frame Rate Consistency (Weight: 20%).
   - Point out the deterministic evaluation digest (`SHA-256`) and the explicit non-identifying disclaimer.

---

### Scene 5: 3-Tier Human Verification Console (HITL) (1 Minute)
1. **Click:** `Human Verification` in the left sidebar.
2. **Action — Tier 1 (Operator Inspection):**
   - Select active incident.
   - Type operational rationale: `"Visual inspection confirms aggregate crowd congestion at platform bottleneck."` ($\ge 15$ characters).
   - Click **`VERIFY INCIDENT (TIER 1)`** $\rightarrow$ Status advances to `VERIFIED`.
3. **Action — Tier 2 (Watch Officer Confirmation):**
   - In header dropdown, switch role to **`P. Patel (Watch Officer: Tier 2)`** (`IND-ANA-2094`).
   - Select **Tier 2: Watch Officer** tab.
   - Type supervisory explanation: `"Supervisory review corroborates sustained bottleneck influx; recommending public safety advisory."`
   - Click **`CONFIRM INCIDENT (TIER 2)`** $\rightarrow$ Status advances to `TACTICAL_CONFIRMED`.
4. **Action — Tier 3 (Chief Controller Sign-Off):**
   - In header dropdown, switch role to **`V. Verma (Chief Controller: Tier 3)`** (`IND-ADM-001`).
   - Select **Tier 3: Chief Controller** tab.
   - Type sign-off comments: `"Executive authorization granted for public safety advisory release."`
   - Click **`APPROVE ADVISORY RELEASE (TIER 3)`** $\rightarrow$ Status advances to `ADVISORY_PUBLISHED`.

---

### Scene 6: Cryptographic Audit Ledger Verification (30 Seconds)
1. **Click:** `Audit Ledger` in the left sidebar.
2. **Action:**
   - Click **`⚡ VERIFY CRYPTOGRAPHIC CHAIN`**.
3. **Key Talking Points:**
   - *"Every operator decision and state change is cryptographically chained via SHA-256 blocks to a genesis anchor."*
   - Observe the green seal: **`CRYPTOGRAPHIC CHAIN INTEGRITY VERIFIED — SEQUENTIALLY LINKED TO GENESIS ANCHOR`**.
   - Show the ledger table displaying the linked `Current Hash` and `Record Ref` for each verified step.
   - Explain that modifying an entry in SQLite triggers immediate tamper alerts during chain traversal.

---

### Summary for Evaluators:
- **₹0 Cloud Budget:** Completely local on a single 8 GB RAM laptop (< 300 MB RAM).
- **56/56 Tests Passing:** Complete automated test coverage in 1.9s.
- **Responsible AI:** Strictly human-in-the-loop, zero facial recognition, zero autonomous weapons or dispatch.
