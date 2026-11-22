# OPERATION PRAHAAR AI — BEGINNER TECHNOLOGY STACK GUIDE
### Complete Reference for Every Technology Used in the Repository
**Format:** For each tool: *What it is* $\rightarrow$ *Why it is used* $\rightarrow$ *Where it is used in Prahaar AI* $\rightarrow$ *What breaks if removed*.

---

## 1. Python 3 (Language)

### What it is:
Python ek high-level, interpreted programming language hai jo simple English-like syntax, huge community support aur scientific computation libraries ke liye jaani jaati hai.

### Why it is used:
AI, data processing, cryptographic hashing, aur backend logic likhne ke liye Python industry standard hai. Isme code likhna fast hota hai aur standard libraries (jaise `hashlib`, `math`, `datetime`, `unittest`) out-of-the-box milte hain.

### Where it is used in our project:
- Entire `backend/` directory (`backend/app/main.py`, `backend/app/services/*`, etc.).
- Complete test suite in `tests/` (`test_phase_c_*.py`).
- Database seed script in `scripts/seed_database.py`.

### What would happen if removed:
Backend server, analytics calculations, Explainable AI factor trees, aur cryptographic audit hashing sab band ho jayenge. Project run hi nahi ho payega.

---

## 2. FastAPI (Web Framework)

### What it is:
FastAPI ek modern, high-performance web framework hai jo Python mein REST APIs banane ke liye use hota hai. Ye asynchronous programming (ASGI) par chalta hai.

### Why it is used:
1. **Speed:** NodeJS aur Go ke barabar speed deta hai.
2. **Auto Docs:** Ye bina kisi extra code ke `/docs` par Swagger UI interactive documentation generate kar deta hai.
3. **Pydantic Validation:** Input data ko automatic validate karta hai.

### Where it is used in our project:
- `backend/app/main.py`: `app = FastAPI(...)`
- `backend/app/api/router.py`: API route aggregation.
- `backend/app/api/endpoints/*`: Endpoints for health, analytics, incidents, governance, audit, and demo.

### What would happen if removed:
Frontend browser backend se baat nahi kar payega. Koi bhi HTTP GET ya POST request kaam nahi karegi.

---

## 3. React 18 (Frontend UI Library)

### What it is:
React ek JavaScript/TypeScript library hai jo Facebook (Meta) ne banayi hai. Ye reusable components ke through dynamic single-page web applications (SPA) banane ke kaam aati hai.

### Why it is used:
Prahaar AI ek dynamic Security Operations Center (SOC) dashboard hai. Jab koi incident trigger hota hai ya operator role change karta hai, toh React bina pura page reload kiye sirf specific card ya table ko smoothly re-render karta hai.

### Where it is used in our project:
- `frontend/src/App.tsx`: Main application container.
- `frontend/src/components/*`: `Header.tsx`, `Sidebar.tsx`, `DemoControllerModal.tsx`.
- `frontend/src/views/*`: `OverviewDashboard.tsx`, `CrowdAnalytics.tsx`, `HumanVerification.tsx`, `AuditLogs.tsx`.

### What would happen if removed:
Modern interactive user interface gayab ho jayega. Evaluator ko terminal se raw curl commands chala kar project check karna padega.

---

## 4. TypeScript (Programming Language for Frontend)

### What it is:
TypeScript JavaScript ka ek superset hai jisme types (Static Typing) add kiye gaye hain. Ye Microsoft ne banaya hai.

### Why it is used:
JavaScript mein agar koi variable `undefined` ho toh website crash ho jati hai. TypeScript compile time par hi bata deti hai ki `incident.status` ya `alert.id` exist karta hai ya nahi, jisse runtime bugs 90% kam ho jate hain.

### Where it is used in our project:
- Saari frontend files `.tsx` aur `.ts` extension mein hain.
- `frontend/src/types/index.ts`: Strongly typed interfaces (`SystemHealth`, `Incident`, `Alert`, `TrendPoint`, `AuditVerificationResponse`).

### What would happen if removed:
TypeScript hata kar plain JavaScript use karne se code mein data type mismatches hone ka khatra rahega aur refactoring karna mushkil ho jayega.

---

## 5. Vite 5 (Frontend Build Tool & Bundler)

### What it is:
Vite ek modern frontend build tool hai jo local development ke dauran ultra-fast dev server deta hai aur production ke liye code ko optimize (minify aur bundle) karta hai.

### Why it is used:
Purana tool (Create React App/Webpack) slow tha. Vite native ES modules use karta hai jisse code save karte hi instant browser update hota hai, aur production JS bundle ko sirf 262 KB mein pack kar deta hai.

### Where it is used in our project:
- `frontend/vite.config.ts`: Vite settings.
- `frontend/package.json`: Scripts `"dev": "vite"` aur `"build": "tsc && vite build"`.

### What would happen if removed:
Frontend ko compile karke browser mein chalana bohot slow ho jayega aur production deploy ke liye bundle nahi ban payega.

---

## 6. Tailwind CSS (Styling Framework)

### What it is:
Tailwind CSS ek utility-first CSS framework hai jo pre-made classes (jaise `flex`, `bg-slate-900`, `text-emerald-400`, `border`) provide karta hai.

### Why it is used:
Humein ek professional defense/SOC style dark theme banana tha. Tailwind ki wajah se bina 10 alag CSS files likhe, inline classes se clean dark charcoal layout aur glowing emerald alerts ban gaye.

### Where it is used in our project:
- `frontend/tailwind.config.js`: Custom color palette definitions.
- Saare React component JSX elements ke `className` attributes mein.

### What would happen if removed:
Frontend ki styling bilkul khatam ho jayegi aur website 1990 ke plain white HTML page jaisi dikhegi.

---

## 7. SQLAlchemy 2.0 (ORM - Object Relational Mapper)

### What it is:
SQLAlchemy Python ka leading database toolkit hai. Ye SQL queries ko direct text mein likhne ke bajay Python classes aur objects ke roop mein likhne ki suvidha deta hai.

### Why it is used:
1. **Security:** SQL Injection attacks ko automatically block karta hai.
2. **Portability:** Aaj SQLite par chal raha hai, kal code badle bina PostgreSQL ya MySQL par switch ho sakta hai.
3. **Transaction Safety:** Commit aur Rollback ko safely manage karta hai.

### Where it is used in our project:
- `backend/app/db/session.py`: Database engine & SessionLocal.
- `backend/app/models/entities.py`: 14 relational tables (models).
- `backend/app/services/*`: DB queries (`db.query(Incident)...`).

### What would happen if removed:
Humein manually raw SQL strings likhne padenge, database connection pooling handle karni padegi, aur SQL injection ka bhari khatra paida ho jayega.

---

## 8. SQLite 3 (Database Engine)

### What it is:
SQLite ek lightweight, file-based relational database engine hai jo kisi alag server process ke bina directly application ke sath embed ho jata hai.

### Why it is used:
Hamare project ka strict target tha: **₹0 cloud cost** aur **8 GB student laptop**. SQLite ke liye koi external background daemon (jaise MySQL ya PostgreSQL server) install nahi karna padta. Pura data ek single file (`prahaar.db`) mein save hota hai.

### Where it is used in our project:
- `prahaar.db`: Local database file.
- `backend/app/core/config.py`: `DATABASE_URL = "sqlite:///./prahaar.db"`.

### What would happen if removed:
Application stateful nahi rahegi. Server band hote hi saare cameras, incidents, reviews aur audit logs delete ho jayenge.

---

## 9. SHA-256 (Cryptographic Hashing Algorithm)

### What it is:
Secure Hash Algorithm (SHA) with 256-bit digest ek one-way cryptographic mathematical function hai jo kisi bhi size ke data ko 64-character hexadecimal string mein convert karta hai.

### Why it is used:
1. **Collision Resistance:** Do alag texts ka same hash aana practically impossible hai.
2. **Avalanche Effect:** Agar input ka ek character bhi change ho jaye, toh pura output hash completely badal jata hai.
3. **Tamper Evidence:** Audit logs ko chained block hash banakar internal data tampering pakadne ke liye use hota hai.

### Where it is used in our project:
- `backend/app/services/audit_chain.py`: Audit block hashing aur genesis block verification.
- `backend/app/services/xai.py`: Decision evaluation digest reproducibility.

### What would happen if removed:
Audit ledger normal database table ban jayega jise koi bhi database admin chupke se bina kisi trace ke edit ya delete kar sakta hai.

---

## 10. Git & GitHub (Version Control & Collaboration)

### What it is:
Git ek distributed version control system hai jo code changes ka history track karta hai. GitHub ek cloud hosting platform hai jahan Git repositories publically host hoti hain.

### Why it is used:
Code ke checkpoint branches (`main`, `phase-c-implementation`) maintain karne ke liye, releases (`v1.0.0-hackathon`) tag karne ke liye, aur college professor ke sath live repository link share karne ke liye.

### Where it is used in our project:
- `.git/` folder and commits history.
- Repository: `https://github.com/Devilharry11/operation-prahaar-ai`.

### What would happen if removed:
Code backup nahi rahega, project ka version history kho jayega, aur professor ko code dikhana mushkil ho jayega.

---

## 11. Render (Cloud Backend Hosting)

### What it is:
Render ek unified cloud platform hai jo web services, APIs, aur background workers ko host karta hai.

### Why it is used:
FastAPI backend ko public internet par free mein host karne ke liye. Hamare `render.yaml` blueprint ke sath ye automatic GitHub se connect hokar database seed karta hai aur API run karta hai.

### Where it is used in our project:
- `render.yaml` blueprint file in repository root.

### What would happen if removed:
Backend sirf aapke local laptop (`127.0.0.1:8000`) par chalega, professor apne laptop se ghar baithe cloud API access nahi kar payenge.

---

## 12. Vercel (Cloud Frontend Edge Hosting)

### What it is:
Vercel ek global edge hosting platform hai jo React, Next.js aur Vite frontend applications ko worldwide content delivery network (CDN) par serve karta hai.

### Why it is used:
Command Center React frontend ko public HTTPS link par deploy karne ke liye jahan se koi bhi evaluator instant dashboard open kar sake.

### Where it is used in our project:
- `vercel.json` (root) aur `frontend/vercel.json`: Single Page Application (SPA) routing configuration.

### What would happen if removed:
Frontend sirf local browser (`localhost:5173`) par chalega aur online demo link nahi ban payega.
