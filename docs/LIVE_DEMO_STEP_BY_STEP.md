# OPERATION PRAHAAR AI — 7-MINUTE LIVE DEMONSTRATION SCRIPT
### Click-by-Click Evaluator Walkthrough Guide
**Application URL:** `http://127.0.0.1:5173`  
**Backend URL:** `http://127.0.0.1:8000/api/v1`  
**Duration:** Exactly 7 Minutes (420 Seconds)

---

## Quick Reference Demonstration Map

```
┌─────────┬──────────────────────────────────┬──────────────────────────────────────┐
│ Minute  │ Action / Screen                  │ Core Subject                         │
├─────────┼──────────────────────────────────┼──────────────────────────────────────┤
│ Min 1   │ Dashboard (Overview)             │ Problem Statement & Responsible AI   │
│ Min 2   │ Architecture & Header Badges     │ Tech Stack, Role Switcher, Invariants│
│ Min 3   │ Header -> Demo Controller Modal  │ Safe Synthetic Scenario Generation   │
│ Min 4   │ Sidebar -> Crowd Dynamics & XAI  │ 5-Min Rolling Window & Factor Tree   │
│ Min 5   │ Sidebar -> Human Verification    │ 3-Tier Gate & 15-Char Anti-Rubber    │
│ Min 6   │ Sidebar -> Audit Ledger          │ SHA-256 Hash Chain 1-Click Verifier  │
│ Min 7   │ Sidebar -> System Settings       │ Real-world Roadmap & Conclusion      │
└─────────┴──────────────────────────────────┴──────────────────────────────────────┘
```

---

## MINUTE 1 [00:00 – 01:00]: Introduction & Problem Statement

### On-Screen State:
- Browser open at `http://127.0.0.1:5173`.
- Overview Dashboard visible.

### Where to Look & Point:
- Point at the screen title: **OPERATION PRAHAAR AI**.
- Point at the top yellow demonstration banner: `SYNTHETIC DEMO — NOT REAL-WORLD MONITORING`.
- Point at the green status pill: `NO FACIAL RECOG`.

### What to Say:
> *"Good morning, Respected Professor. Today I am presenting **Operation Prahaar AI**.*  
> 
> *The problem we are addressing is critical in crowded public infrastructure like metro stations and railway concourses: human operators in Security Operations Centers suffer cognitive fatigue within 20 to 30 minutes of watching multiple CCTV screens, causing them to miss early signals of bottlenecks or crowd surges.*  
> 
> *However, simply introducing aggressive AI surveillance causes severe civil liberty concerns through facial biometrics and unverified automated actions. Prahaar AI provides a **Responsible AI decision-support platform** that analyzes non-identifying crowd geometry, mathematically explains every alert, enforces multi-tier human approval, and permanently logs all decisions in a cryptographic ledger—operating entirely within a ₹0 cloud budget."*

---

## MINUTE 2 [01:00 – 02:00]: Dashboard & Architecture

### What to Click:
1. Hover cursor over the **Live System Metrics** cards on the dashboard (Active Cameras, Edge Nodes, Monitored Zones).
2. Click on the **Operator Role Dropdown** in the top-right corner of the header.

### Where to Look & Point:
- Show the 3 operators in the dropdown:
  - `IND-OPR-4081`: Rajesh Sharma (Control Operator)
  - `IND-ANA-2094`: Priya Patel (Watch Officer)
  - `IND-ADM-001`: Vikram Verma (Chief Controller)
- Leave it currently selected on **Rajesh Sharma (Control Operator)**.

### What to Say:
> *"Here on the Command Center dashboard, our frontend is built with React 18, TypeScript, and Tailwind CSS. Notice our active operator badge in the header: right now, I am logged in as **Rajesh Sharma**, a Tier 1 frontline operator.*  
> 
> *Our backend runs on Python FastAPI with SQLAlchemy and SQLite. The entire application communicates via REST APIs with sub-50ms latency. Notice the security pill in the header: `NO FACIAL RECOG`. The architecture guarantees that no biometric feature extractor or individual person-tracking model exists anywhere in the codebase."*

---

## MINUTE 3 [02:00 – 03:00]: Synthetic Demo Controller

### What to Click:
1. Click the glowing **⚡ DEMO CONTROLLER** button in the top navigation header.
2. In the modal, select **`SIM_OCCUPANCY_SURGE` (Simulated Concourse Density Surge)**.
3. Click **GENERATE DEMONSTRATION EVENT**.

### Where to Look & Point:
- Point to the green confirmation banner that pops up:
  `Successfully generated demonstration event: Incident INC-2026-XXXX, Alert ALT-2026-XXXX`.
- Close the modal by clicking the **Close (X)** button.
- Notice the amber notification pill in the header: **`1 UNVERIFIED`**.

### What to Say:
> *"To allow completely safe evaluations without accessing private CCTV cameras, we built a dedicated **Synthetic Demo Controller**. All scenario generation runs inside atomic database transactions, preventing data corruption and protecting our baseline seed records.*  
> 
> *I just simulated a rapid crowd surge in Concourse A. Notice that the alert immediately registered in the system, but its status is strictly **UNVERIFIED**. Our AI is explicitly prohibited from autonomously escalating or dispatching units. It now awaits human intervention."*

---

## MINUTE 4 [03:00 – 04:00]: Aggregate Analytics & Explainable AI (XAI)

### What to Click:
1. In the left sidebar, click **Crowd Dynamics** (`/analytics`).
2. Scroll to the **5-Minute Rolling Density Telemetry** chart.
3. Hover over the SVG data curve points.
4. Next, in the sidebar, click **Incident Dossier** (`/incidents`).
5. Click on the incident we just created to expand the **Explainable AI (XAI) Factor Drawer**.

### Where to Look & Point:
- On Crowd Dynamics: Point to the nominal ($< 75\%$) vs congestion ($\ge 75\%$) thresholds.
- On Incident Dossier: Point to the 3 factor weights in the drawer:
  - Density Surge: $40\%$
  - Flow Velocity Deceleration: $35\%$
  - Signal Quality: $25\%$
- Point to the bottom row: **Reproducible SHA-256 Evaluation Digest**.

### What to Say:
> *"In Crowd Dynamics, we see our 4 monitored zones. Instead of reacting to momentary spikes, our algorithm aggregates telemetry into a 5-minute rolling window (300 seconds), filtered by defensive zero-division clamping guards.*  
> 
> *Now look at our **Explainable AI (XAI) Drawer**. Instead of an opaque 'black-box' score, the operator sees the transparent mathematical breakdown: 40% weight to density, 35% weight to flow velocity deceleration, and 25% to signal quality. Crucially, the system calculates a deterministic SHA-256 evaluation digest of all inputs, making the decision logic mathematically reproducible for forensic audits."*

---

## MINUTE 5 [04:00 – 05:00]: Three-Tier Human Governance

### What to Click:
1. In the sidebar, click **Human Verification** (`/human-verification`).
2. **Demonstrate Anti-Rubber-Stamping:**
   - Select our incident under **Tier 1: Operator Review**.
   - Type `"ok"` in the Operational Rationale box.
   - Click **VERIFY INCIDENT (TIER 1)** $\rightarrow$ Point to the red validation error: *"Rationale must be at least 15 characters"*.
   - Replace with: `"Inspected Concourse A camera feed; physical density surge confirmed"` ($\ge 15$ chars).
   - Click **VERIFY INCIDENT (TIER 1)** $\rightarrow$ Status updates to `VERIFIED`.
3. **Demonstrate Supervisory Review:**
   - In the header role dropdown, switch to **Priya Patel (Watch Officer: Tier 2)** (`IND-ANA-2094`).
   - Select the **Tier 2: Watch Officer** tab.
   - Type: `"Cross-verified with exit corridor D; queuing clearance initiated"` ($\ge 15$ chars).
   - Click **CONFIRM INCIDENT (TIER 2)** $\rightarrow$ Status updates to `TACTICAL_CONFIRMED`.
4. **Demonstrate Chief Controller Sign-Off:**
   - Switch role to **Vikram Verma (Chief Controller: Tier 3)** (`IND-ADM-001`).
   - Select the **Tier 3: Chief Controller** tab.
   - Type: `"Public safety announcement authorized for concourse displays"` ($\ge 15$ chars).
   - Click **APPROVE ADVISORY RELEASE (TIER 3)** $\rightarrow$ Status updates to `ADVISORY_PUBLISHED`.

### What to Say:
> *"This is our **Sequential 3-Tier Governance Gate**.  
> Notice that when I tried to type 'ok', the backend rejected it. We enforce a mandatory 15-character rationale check to eliminate lazy rubber-stamping.  
> 
> First, Operator Rajesh Sharma verified the feed. Then I switched to Watch Officer Priya Patel, who confirmed tactical evidence. Finally, Chief Controller Vikram Verma authorized the public advisory. If a junior operator attempts to call the Tier 3 endpoint directly, our FastAPI backend blocks the request with an HTTP 403 Forbidden error."*

---

## MINUTE 6 [05:00 – 06:00]: SHA-256 Cryptographic Audit Ledger

### What to Click:
1. In the sidebar, click **Audit Ledger** (`/audit-logs`).
2. Scroll through the ledger table showing the newly committed review blocks.
3. Click the glowing green button: **⚡ VERIFY CRYPTOGRAPHIC CHAIN**.

### Where to Look & Point:
- Point to the columns: `Block ID`, `Timestamp`, `Action`, `Operator Badge`, `Previous Hash`, `Current Hash`.
- Point to Block #1 at the bottom: show the previous hash of 64 zeros (`0000...0000`).
- Point to the green verification badge:
  **`CRYPTOGRAPHIC CHAIN INTEGRITY VERIFIED — SEQUENTIALLY LINKED TO GENESIS ANCHOR`**.

### What to Say:
> *"In public safety, audit logs cannot simply be mutable database records that an administrator can edit or delete later.*  
> 
> *Every review action we just performed generated an immutable cryptographic block. Each block combines its data with the SHA-256 hash of the block before it, all anchored to a 64-zero genesis block.*  
> 
> *When I clicked 'Verify Cryptographic Chain', the backend traversed every block from block 1 to the current head, recomputing every hash in real time. If an attacker had modified even a single character in the SQLite database, the chain would fail and pinpoint the exact tampered block."*

---

## MINUTE 7 [06:00 – 07:00]: Limitations, Roadmap & Conclusion

### What to Click:
1. In the sidebar, click **System Settings** (`/settings`).
2. Point to the **Responsible AI Compliance Matrix** (All green checkmarks).

### What to Say:
> *"To conclude, let me address our project's scope and limitations honestly:  
> 1. This is an educational student prototype, so we currently run on local SQLite and synthetic telemetry rather than live physical RTSP feeds.  
> 2. Operator identity is currently managed via development badge headers rather than enterprise PKI smart cards.  
> 3. In our hardware roadmap, we have planned edge acceleration cards (Hailo-8 / NVIDIA Jetson) running quantized non-biometric models, and cloud WORM storage to prevent offline file-level database replacement.*  
> 
> *Our project proves that national public safety can be significantly enhanced using artificial intelligence while strictly safeguarding citizen privacy, providing transparent mathematical explainability, and enforcing cryptographic accountability at zero cloud cost.*  
> 
> *Thank you very much, Sir. The complete source code, 56 passing unit tests, and documentation are live on GitHub. I am now ready for your questions."*
