# OPERATION PRAHAAR AI
### Advanced AI-Powered Counter-Terrorism Support & National Public Safety Intelligence Platform

> **Tagline:** *"Justice Through Intelligence. Protection Through Technology."*  
> **Classification:** Independent Student Technology Prototype & Decision-Support System  
> **Initial Target Environment:** Windows Laptop (8 GB RAM budget, ₹0 software cost)  

---

## 1. Vision & Mission

- **Vision:** To contribute towards a safer India and a world free from terrorism through advanced, transparent, and human-guided technology.
- **Mission:** Use Artificial Intelligence, computer vision, advanced hardware, edge computing, and security intelligence to assist authorized security agencies in improving public safety, identifying critical safety events, and coordinating rapid human-led responses.
- **Scope:** Designed specifically for sensitive public venues, transit hubs, religious sites, and crowded gathering locations.

---

## 2. Responsible AI & Ethical Boundaries

**Operation Prahaar AI is strictly a human-in-the-loop decision-support system, NOT an autonomous law-enforcement or terrorist-identification system.**

### What Prahaar AI Does NOT Do:
1. **NO Facial Recognition:** Does not scan, match, or identify individual human faces.
2. **NO Watchlists:** Does not create or process face-based watchlists.
3. **NO Individual Tracking:** Does not track specific individuals across cameras.
4. **NO Profiling:** Does not make inferences or alerts based on religion, ethnicity, appearance, or clothing.
5. **NO Autonomous Escalation:** Never sends automatic unverified accusations or alerts to police without authorized human verification.

### What Prahaar AI DOES Do:
1. **Spatial Crowd Analytics:** Estimates crowd density and detects rapid congestion anomalies.
2. **Zone Safety Monitoring:** Detects boundary intrusions into designated restricted zones (e.g., perimeter breaches).
3. **Intelligence Correlation:** Correlates spatial events against authorized security advisories.
4. **Explainable Alert Scoring:** Provides clear reasoning and uncertainty levels for every safety incident.
5. **Human Verification Workflow:** Enforces review, confirmation, or rejection by authorized operators.
6. **Immutable Audit Trail:** Logs all system events, operator reviews, and escalations.

---

## 3. High-Level Architecture

```
+-----------------------------------------------------------------------------------+
|                            PRAHAAR COMMAND CENTER (Web UI)                        |
|   React + TypeScript + Tailwind CSS (Indian Defence-Inspired Charcoal & Olive)   |
|   - Real-time Alert Queue       - Human Verification Panel   - Crowd Heatmaps     |
|   - Camera Grid Monitor         - Security Intelligence View - Audit Logs         |
+------------------------------------------^----------------------------------------+
                                           | REST APIs & WebSockets
+------------------------------------------v----------------------------------------+
|                             PRAHAAR INTELLIGENCE BACKEND                           |
|   FastAPI + SQLAlchemy + SQLite (Local Laptop / Zero Cost)                        |
|   - Intelligence Correlation Engine   - Incident Management & Scoring             |
|   - Advisory Matching Engine          - Human Review & Audit Logging Service      |
+------------------------------------------^----------------------------------------+
                                           | Secure JSON Telemetry
+------------------------------------------v----------------------------------------+
|                                PRAHAAR EDGE ENGINE                                |
|   Local Python + OpenCV Computer Vision Service (Simulated Mini PC on Laptop)     |
|   - Local CCTV Ingestion             - Motion & Crowd Density Estimation          |
|   - Virtual Tripwire & Zone Detection- Anonymized Event Packaging (No raw video)  |
+-----------------------------------------------------------------------------------+
```

---

## 4. Technology Stack

| Layer | Technologies Selected | Justification |
| :--- | :--- | :--- |
| **Backend** | Python 3.14+, FastAPI, SQLAlchemy, Pydantic v2, SQLite | High performance async API, typed schemas, lightweight local database with ₹0 cost. |
| **Edge Vision** | OpenCV, NumPy, Python headless video processing | Lightweight CPU-optimized processing suitable for 8 GB RAM laptop. |
| **Frontend** | React 18+, TypeScript, Tailwind CSS, Lucide Icons, Vite | Fast modern dashboard with defence-grade dark aesthetic and responsive UI. |
| **Testing** | Pytest, HTTPX, API verification scripts | Automated verification of data pipelines, schemas, and guardrails. |
| **Data Safety** | In-memory frame processing, zero facial capture | Complete privacy preservation by design. |

---

## 5. Development Roadmap (11 Phases)

- [x] **Phase 1: Project Foundation and Architecture** *(Current)*
- [ ] **Phase 2: Backend and Database Design**
- [ ] **Phase 3: Frontend Command-Centre Dashboard**
- [ ] **Phase 4: Sample CCTV Video Input Module**
- [ ] **Phase 5: Computer Vision and Crowd Analytics**
- [ ] **Phase 6: Safety Event Engine**
- [ ] **Phase 7: Edge-Processing Simulation**
- [ ] **Phase 8: Intelligence and Alert Management**
- [ ] **Phase 9: Human Verification and Audit Logs**
- [ ] **Phase 10: Testing and Performance Optimization**
- [ ] **Phase 11: Hackathon Presentation and Documentation**

---

## 6. Quick Start (Phase 1 Verification)

### Prerequisites Check
Run the Phase 1 verification script to ensure your environment and folder structure are properly initialized:

```powershell
python scripts/verify_phase1.py
```
