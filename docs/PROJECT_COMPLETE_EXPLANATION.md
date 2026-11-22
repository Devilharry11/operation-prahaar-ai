# OPERATION PRAHAAR AI — COMPLETE PROJECT EXPLANATION FOR BEGINNERS
### Master Student Guide for Academic Defense & Viva Voce
**Project Title:** OPERATION PRAHAAR AI  
**Tagline:** *"Justice Through Intelligence. Protection Through Technology."*  
**Classification:** Independent Educational Technology Student Prototype & Responsible AI Decision Support System  
**Repository:** [https://github.com/Devilharry11/operation-prahaar-ai](https://github.com/Devilharry11/operation-prahaar-ai)

---

## PART 1: PROJECT INTRODUCTION (सरल Hinglish में)

### 1. Operation Prahaar AI क्या है?
Operation Prahaar AI ek **AI-Assisted Public Safety Decision Support Prototype** hai.  
Iska simple matlab ye hai ki ye koi autonomous police ya automated surveillance system nahi hai. Ye ek aisa software hai jo crowded public places (jaise railway stations, airport terminals, ya bade gathering venues) mein lage non-biometric sensors/cameras se aane wale data ko analyze karta hai. Agar kahin crowd crush (bheed ka dabav) ya corridor blockage jaisi situation ban rahi ho, toh ye security operators ko **early warning** deta hai, alert ka **karan (explainability)** batata hai, aur bina human officer ke approval ke koi action nahi leta.

### 2. Maine ye project kyun choose kiya?
Public places jaise New Delhi Railway Station ya transit hubs mein hazaaron log aate-jaate hain. Security Operations Centers (SOC) mein baithe human operators 50-100 CCTV screens ko lagataar dekhte hain. 20-30 minute baad **cognitive fatigue (dimagi thakan)** ki wajah se unka focus kam ho jata hai aur choti-choti bheed ki anomalies miss ho jati hain jab tak stampede (bhagdad) jaisi situation na ban jaye. Maine ye project isliye banaya taaki hum computers aur AI ka use karke bheed ki geometry aur flow ko monitor kar sakein, bina logon ki privacy kharab kiye.

### 3. Ye project kis problem ko solve karta hai?
1. **Operator Fatigue (Thakan):** Human operators har samay har screen par dhyan nahi de sakte.
2. **"Black-Box" AI Problem:** Zyada-tar AI systems sirf ek number dete hain (e.g. "80% Risk"), par ye nahi batate ki risk kyun hai. Prahaar AI explain karta hai ki kitna percent density ki wajah se hai aur kitna flow rukne ki wajah se.
3. **Privacy Overreach (Niji Zindagi par Hamla):** Bohot saare systems illegal facial recognition use karte hain. Prahaar AI mein **zero facial recognition** hai.
4. **Data Tampering (Audit logs badalna):** Purane systems mein database ke records ko edit kiya ja sakta hai. Humne SHA-256 cryptographic chain lagayi hai taaki koi record chupke se badla na ja sake.

### 4. Hamara Proposed Solution kya hai?
Humne 5 pillars par based architecture banaya hai:
- **Aggregate Analytics:** Individual logon ko track karne ke bajay hum pure zone ki bheed (headcount envelope) calculate karte hain.
- **Explainable AI (XAI):** Alert ka mathematical factor breakdown (40% Density + 35% Velocity + 25% Signal Quality).
- **3-Tier Human-in-the-Loop Governance:** AI alert create karega toh wo `UNVERIFIED` hoga. Pehle Operator verify karega, fir Supervisor confirm karega, tab Chief Controller advisory approve karega.
- **Cryptographic Audit Ledger:** Har action SHA-256 block chain se genesis block se juda hua hai.
- **Safe Synthetic Demo Controller:** Hackathon evaluation ke liye bina kisi real surveillance feed ke 5 safe scenarios generate karta hai.

### 5. Is technology se kinko fayda hoga?
- **Metro & Railway Station Masters:** Platforms par overload hone se pehle alerts milenge.
- **Airport Terminal Managers:** Security checkpoints par bottle-neck identify honge.
- **Event & Stadium Security:** Gates par excessive congestion pehle se pata chalegi.
- **Civil Rights & Privacy Regulators:** Kyunki isme kisi ka chehra scan nahi hota aur individual profiling bilkul banned hai.

### 6. Ye basic dashboard se alag kaise hai?
Ek simple dashboard sirf database se data fetch karke graphs dikhata hai.  
Prahaar AI mein:
- 5-minute rolling window aggregate trend calculations backend me run hoti hain.
- Heuristic Explainable AI evaluation trees mathematically decision digest banate hain.
- Multi-tier state-machine RBAC (Role-Based Access Control) enforced hai.
- Har audit log mathematically previous log ke SHA-256 hash se crypto-linked hai.

### 7. Is project ki limitations kya hain? (Honest truth for professor)
1. Ye ek **student prototype** hai, production-grade military/police system nahi hai.
2. Abhi physical cameras ke bajay **synthetic data generator** use ho raha hai.
3. Database **local SQLite** hai (zero cost ke liye), production mein PostgreSQL chahiye hoga.
4. Authentication **development badge headers (`X-Operator-Badge`)** par chalti hai, production mein OAuth2/OIDC biometric smart card chahiye hoga.

---

## PART 2: COMPLETE WORKFLOW STEP-BY-STEP (Fictional Example ke saath)

### Scenario:
*Maan lijiye New Delhi Metro Station ke Exit Corridor D mein achanak ek gate band hone se log jama hone lage.*

```
[ Step 1: Camera/Sensor Telemetry ]
           │
           ▼
[ Step 2: FastAPI Analytics Engine (5-Min Rolling Window) ]
           │
           ▼
[ Step 3: Heuristic Explainable AI (XAI) Factor Tree ]
           │
           ▼
[ Step 4: Incident Generated with Status = UNVERIFIED ]
           │
           ▼
[ Step 5: Tier 1 Operator Review (Min 15 Chars Rationale) ] ──> Status: VERIFIED
           │
           ▼
[ Step 6: Tier 2 Watch Officer Confirmation ] ───────────────> Status: TACTICAL_CONFIRMED
           │
           ▼
[ Step 7: Tier 3 Chief Controller Approval ] ────────────────> Status: ADVISORY_PUBLISHED
           │
           ▼
[ Step 8: Cryptographic Audit Ledger commits SHA-256 Block ]
```

### Detailed Steps:
1. **Application Startup:**
   - FastAPI server start hota hai (`uvicorn backend.app.main:app`).
   - SQLite database (`prahaar.db`) connect hoti hai aur 14 tables check karti hai.
   - Vite React development server start hota hai (`http://127.0.0.1:5173`).
2. **Frontend-Backend Communication:**
   - Frontend `fetch` calls bhejta hai `/api/v1` prefix par.
   - Headers mein `X-Operator-Badge` bhejta hai (e.g. `IND-OPR-4081`).
   - Backend Pydantic models se validate karta hai aur SQLAlchemy ORM ke through database query karta hai.
3. **Synthetic Demo Scenario Generation:**
   - Evaluator header mein `⚡ DEMO CONTROLLER` par click karta hai aur `SIM_OCCUPANCY_SURGE` choose karta hai.
   - Backend ke `POST /api/v1/demo/generate-event` par call jati hai.
   - Backend database transaction start karta hai aur synthetic CameraEvent, Incident, aur Alert insert karta hai.
4. **Aggregate Analytics Calculation:**
   - Algorithm `backend/app/services/analytics.py` 5-minute rolling window (300 seconds) ka average nikalta hai.
   - Zero-division guard: Agar headcount 0 hai toh `0.0` return karega, server crash nahi hoga.
5. **Explainable AI (XAI) Attribution:**
   - Algorithm 3 factors calculate karta hai:
     - $40\%$ Factor Weight: Density vs baseline threshold.
     - $35\%$ Factor Weight: Flow velocity deceleration.
     - $25\%$ Factor Weight: Signal quality index.
   - Inka sum exact $100\%$ hota hai aur input parameters ka SHA-256 evaluation digest generate hota hai.
6. **Human Verification Workflow:**
   - Alert default mein **`UNVERIFIED`** hota hai. AI ko public alert nikalne ki permission nahi hai.
   - Tier 1 Operator Rajesh Sharma (`IND-OPR-4081`) review open karta hai.
   - Minimum 15-character ka operational rationale likhna zaroori hai (e.g., *"Inspected feed, confirmed high density at exit gate"*). Agar 15 se kam likha toh HTTP 422 error aayega.
7. **Three-Tier Approval (Separation of Duties):**
   - Tier 1 verify karta hai $\rightarrow$ Status banta hai `VERIFIED`.
   - Tier 2 Supervisor Priya Patel (`IND-ANA-2094`) check karti hai $\rightarrow$ Status banta hai `TACTICAL_CONFIRMED`.
   - Tier 3 Chief Controller Vikram Verma (`IND-ADM-001`) approve karta hai $\rightarrow$ Status banta hai `ADVISORY_PUBLISHED`.
   - Agar ek basic operator Tier 3 button dabane ki koshish karega, toh backend usko HTTP 403 Forbidden return karega.
8. **SHA-256 Audit Chain Commitment:**
   - Har approval par `backend/app/services/audit_chain.py` ek naya block banata hai.
   - Naye block ka hash:
     $$\text{Hash}_n = \text{SHA-256}(\text{BlockID} + \text{Timestamp} + \text{Action} + \text{Summary} + \text{Badge} + \text{PreviousHash})$$
   - Block 1 ka previous hash 64-zero genesis block hai.
   - Jab koi `Verify Chain` button dabata hai, system saare blocks dobara recompute karke check karta hai ki kisi ne database mein kuch chhedchhad toh nahi ki.
9. **Database Storage:**
   - Relational schema in SQLite: `locations` $\rightarrow$ `cameras` $\rightarrow$ `camera_events` $\rightarrow$ `incidents` $\rightarrow$ `alerts` $\rightarrow$ `human_reviews` $\rightarrow$ `audit_logs`.
10. **Error Handling:**
    - Frontend mein agar backend offline ho jaye toh safe mock fallback chalu ho jata hai aur UI crash hone ke bajay offline error alert display karta hai.
