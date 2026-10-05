# Generative AI-Powered Intelligent Placement and Career Recommendation System

A comprehensive, full-stack, intelligence-driven career recommendation and skill-gap analysis system designed for college students and academic placement cells. The system parses student resumes (PDF/DOCX), normalizes technical and soft skills against an industry taxonomy, calculates precise skill gaps against benchmark career roles, and generates multi-factor suitability recommendations.

---

## 1. PROJECT TITLE

**Project Name:** Generative AI-Powered Intelligent Placement and Career Recommendation System  
**Short Description:** An end-to-end web system that extracts student skills and qualifications from resumes, evaluates skill gaps against benchmark industry job roles, and recommends tailored career pathways using a weighted composite suitability algorithm.

---

## 2. PROJECT OVERVIEW

College students often struggle to align their academic preparation and skill sets with dynamic placement and industry job requirements. Traditional placement systems rely on manual CGPA cut-offs without providing actionable feedback on technical readiness or missing competencies.

**Problem Solved:**
1. **Automated Resume & Profile Analysis:** Eliminates manual data entry by extracting contact details, skills, education, projects, certifications, and experience directly from uploaded PDF and DOCX resumes.
2. **Standardized Skill Taxonomies:** Maps non-standardized resume phrasing and aliases (e.g., `py`, `python3`, `js`, `reactjs`) to canonical technical skills.
3. **Quantitative Skill-Gap Analysis:** Computes objective Skill Match % and Skill Gap % across Core, Secondary, and Soft skills for target job roles.
4. **Data-Driven Career Recommendations:** Ranks job roles based on a composite 100-point scoring model evaluating Skill Match (70%), Academic Relevance & CGPA Eligibility (15%), Interest Alignment (10%), and Project/Certification Relevance (5%).

---

## 3. CURRENT IMPLEMENTED MODULES

### Active Implemented Modules

#### Module 1 (M1) – Resume & Student Profile Analysis
* **Purpose:** Parses uploaded resume documents, extracts structured student data, normalizes extracted skills against a master taxonomy, and enables students to manage their confirmed profile.
* **Input:** Multipart file upload (`.pdf` or `.docx`), or manual JSON profile updates.
* **Processing:**
  * PDF text extraction via `PyMuPDF` (`fitz`), DOCX paragraph and table extraction via `python-docx`.
  * Regex-based section header segmentation (`education`, `skills`, `projects`, `certifications`, `experience`).
  * Boundary-aware taxonomy keyword matching (`\b` regex & tokenized set lookups).
  * Profile merging and skill deduplication.
* **Output:** Structured profile JSON containing `contact_info`, `skills`, `education`, `projects`, `certifications`, `experience`, and `resume_metadata`.
* **Important Files Involved:**
  * [`backend/app/services/resume_parser.py`](file:///c:/Users/sahan/final%20year%20project/backend/app/services/resume_parser.py)
  * [`backend/app/services/nlp_extractor.py`](file:///c:/Users/sahan/final%20year%20project/backend/app/services/nlp_extractor.py)
  * [`backend/app/routes/resume_routes.py`](file:///c:/Users/sahan/final%20year%20project/backend/app/routes/resume_routes.py)
  * [`backend/app/models/student_model.py`](file:///c:/Users/sahan/final%20year%20project/backend/app/models/student_model.py)
  * [`frontend/src/pages/ProfilePage.jsx`](file:///c:/Users/sahan/final%20year%20project/frontend/src/pages/ProfilePage.jsx)

#### Module 2 (M2) – Skill-Gap Analysis
* **Purpose:** Performs a detailed comparative analysis between the student's confirmed skills and the skill requirements of a chosen benchmark career role.
* **Input:** Authenticated student profile skills and target career role ID (`role_id`).
* **Processing:**
  * Normalizes student and benchmark requirement skills via taxonomy lookup.
  * Separates skills into Core, Secondary, and Soft skill tiers.
  * Computes weighted match score (Core: 60%, Secondary: 30%, Soft: 10%).
  * Identifies matched skills, missing core skills, missing secondary skills, missing soft skills, and extra student skills.
* **Output:** JSON response containing `skill_match_percentage`, `skill_gap_percentage`, `matched_core_skills`, `missing_core_skills`, `matched_secondary_skills`, `missing_secondary_skills`, `matched_soft_skills`, `missing_soft_skills`, `extra_skills`, `breakdown_scores`, and `readiness_summary`.
* **Important Files Involved:**
  * [`backend/app/services/skill_gap.py`](file:///c:/Users/sahan/final%20year%20project/backend/app/services/skill_gap.py)
  * [`backend/app/routes/skill_routes.py`](file:///c:/Users/sahan/final%20year%20project/backend/app/routes/skill_routes.py)
  * [`backend/app/data/taxonomy.json`](file:///c:/Users/sahan/final%20year%20project/backend/app/data/taxonomy.json)
  * [`frontend/src/pages/SkillGapPage.jsx`](file:///c:/Users/sahan/final%20year%20project/frontend/src/pages/SkillGapPage.jsx)

#### Module 3 (M3) – Career Recommendation
* **Purpose:** Evaluates the student's entire profile against all benchmark career roles in the database and generates a ranked list of suitability recommendations.
* **Input:** Student profile (skills, CGPA, branch, interests, projects, certifications) and list of active career roles.
* **Processing:**
  * Runs M2 skill-gap calculation for each career role to scale Skill Match to a 70-point maximum.
  * Evaluates academic eligibility (CGPA vs minimum CGPA & branch alignment) for a 15-point maximum.
  * Checks interest alignment against role title/category/domain for a 10-point maximum.
  * Checks project and certification relevance for a 5-point maximum.
  * Sums component scores into a composite 0-100 suitability score and sorts roles in descending order.
* **Output:** Ranked array of recommended career objects with `suitability_score`, `score_components`, `reasons`, and `skill_gap_details`.
* **Important Files Involved:**
  * [`backend/app/services/recommender.py`](file:///c:/Users/sahan/final%20year%20project/backend/app/services/recommender.py)
  * [`backend/app/routes/career_routes.py`](file:///c:/Users/sahan/final%20year%20project/backend/app/routes/career_routes.py)
  * [`backend/app/models/career_model.py`](file:///c:/Users/sahan/final%20year%20project/backend/app/models/career_model.py)
  * [`backend/app/data/career_roles.json`](file:///c:/Users/sahan/final%20year%20project/backend/app/data/career_roles.json)
  * [`frontend/src/pages/CareerPage.jsx`](file:///c:/Users/sahan/final%20year%20project/frontend/src/pages/CareerPage.jsx)

---

### Planned / Future Scope Modules

The system architecture defines standard extension hooks for future development phases:
* **Module 4 (M4) – Placement Readiness Prediction:** Planned machine learning classification model (Scikit-Learn / XGBoost) to predict placement probability based on historical placement records.
* **Module 5 (M5) – Personalized Training Recommendation:** Planned learning path generator to auto-curate course modules for identified missing core skills.
* **Module 6 (M6) – GenAI Career Guidance:** Future GenAI integration hook (configured via `LLM_PROVIDER` in [`.env.example`](file:///c:/Users/sahan/final%20year%20project/backend/.env.example)) to provide natural language career advice and resume feedback.

---

## 4. TECHNOLOGY STACK

| Technology | Purpose | Where Used in Project |
| :--- | :--- | :--- |
| **React 19** | Modern UI framework for interactive single-page web app | [`frontend/src/App.jsx`](file:///c:/Users/sahan/final%20year%20project/frontend/src/App.jsx), [`frontend/src/pages/`](file:///c:/Users/sahan/final%20year%20project/frontend/src/pages/) |
| **Vite 8** | High-performance frontend build tool and dev server | [`frontend/vite.config.js`](file:///c:/Users/sahan/final%20year%20project/frontend/vite.config.js), [`frontend/package.json`](file:///c:/Users/sahan/final%20year%20project/frontend/package.json) |
| **Vanilla CSS** | Custom glassmorphic styling, responsive layout, CSS variables | [`frontend/src/index.css`](file:///c:/Users/sahan/final%20year%20project/frontend/src/index.css), [`frontend/src/App.css`](file:///c:/Users/sahan/final%20year%20project/frontend/src/App.css) |
| **Axios 1.20** | HTTP client with JWT interceptor for REST API calls | [`frontend/src/services/api.js`](file:///c:/Users/sahan/final%20year%20project/frontend/src/services/api.js) |
| **Lucide React** | Modern SVG UI icon set | [`frontend/src/components/`](file:///c:/Users/sahan/final%20year%20project/frontend/src/components/), [`frontend/src/pages/`](file:///c:/Users/sahan/final%20year%20project/frontend/src/pages/) |
| **Python 3.10+** | Backend runtime environment | [`backend/run.py`](file:///c:/Users/sahan/final%20year%20project/backend/run.py), [`backend/app/`](file:///c:/Users/sahan/final%20year%20project/backend/app/) |
| **Flask 3.0+** | Lightweight Python REST API web framework | [`backend/app/__init__.py`](file:///c:/Users/sahan/final%20year%20project/backend/app/__init__.py), [`backend/app/routes/`](file:///c:/Users/sahan/final%20year%20project/backend/app/routes/) |
| **Flask-CORS 4.0+** | Cross-Origin Resource Sharing handling for React frontend | [`backend/app/__init__.py`](file:///c:/Users/sahan/final%20year%20project/backend/app/__init__.py) |
| **PyMongo 4.6+** | MongoDB driver for document persistence & queries | [`backend/app/models/db.py`](file:///c:/Users/sahan/final%20year%20project/backend/app/models/db.py) |
| **PyJWT 2.8+** | HS256 JWT generation, signing, and verification | [`backend/app/models/user_model.py`](file:///c:/Users/sahan/final%20year%20project/backend/app/models/user_model.py), [`backend/app/routes/auth_middleware.py`](file:///c:/Users/sahan/final%20year%20project/backend/app/routes/auth_middleware.py) |
| **Werkzeug** | `scrypt` password hashing and secure filename sanitization | [`backend/app/models/user_model.py`](file:///c:/Users/sahan/final%20year%20project/backend/app/models/user_model.py), [`backend/app/routes/resume_routes.py`](file:///c:/Users/sahan/final%20year%20project/backend/app/routes/resume_routes.py) |
| **PyMuPDF (fitz) 1.23+** | Fast PDF text parsing & extraction | [`backend/app/services/resume_parser.py`](file:///c:/Users/sahan/final%20year%20project/backend/app/services/resume_parser.py) |
| **python-docx 1.1+** | Microsoft Word DOCX paragraph and table parsing | [`backend/app/services/resume_parser.py`](file:///c:/Users/sahan/final%20year%20project/backend/app/services/resume_parser.py) |
| **spaCy 3.7+** | Natural language tokenization & rule-based entity parsing | [`backend/app/services/nlp_extractor.py`](file:///c:/Users/sahan/final%20year%20project/backend/app/services/nlp_extractor.py) |
| **pytest 8.0+** | Automated unit & regression test suite | [`backend/tests/`](file:///c:/Users/sahan/final%20year%20project/backend/tests/) |

---

## 5. SYSTEM ARCHITECTURE

The application uses a decoupled client-server REST architecture. The React frontend interacts with the Flask REST API via Axios. The Flask API authenticates requests through custom JWT middleware, executes NLP and recommendation services, and persists state in MongoDB (with automatic in-memory fallback if MongoDB is offline).

```
React Frontend (Vite)
       │
       ▼
Axios (with JWT Bearer Interceptor)
       │
       ▼
Flask REST API (Port 5000)
 ┌─────┴──────────────────────────────────────────────────────┐
 │ Blueprints: auth_bp | student_bp | resume_bp | skill_bp | career_bp │
 └─────┬──────────────────────────────────────────────────────┘
       │
       ▼
Authentication Middleware (auth_middleware.py -> PyJWT verification)
       │
       ▼
Service Layer
 ├─ ResumeParserService   (PyMuPDF / python-docx)
 ├─ NLPExtractorService   (spaCy / Regex / taxonomy.json)
 ├─ SkillGapService       (Weighted Core/Sec/Soft algorithm)
 └─ RecommendationEngineService (100-Point Composite Suitability Engine)
       │
       ▼
Database Layer
 ├─ MongoDB (users, students, career_roles collections via PyMongo)
 └─ In-Memory Fallback Stores (_in_memory_users, _in_memory_students, career_roles.json)
```

---

## 6. PROJECT FOLDER STRUCTURE

```
final year project/
├── README.md                           # Root project documentation
├── docs/
│   ├── architecture.md                 # System architectural documentation
│   └── setup_guide.md                  # Local installation & startup guide
├── backend/
│   ├── run.py                          # Flask application entry point
│   ├── seed_db.py                      # Database seeder for career benchmark roles
│   ├── requirements.txt                # Backend Python package dependencies
│   ├── .env.example                    # Environment variable configuration template
│   ├── .env                            # Local environment settings (MongoDB URI, Secret Key)
│   ├── uploads/                        # Server directory for uploaded resume files
│   ├── app/
│   │   ├── __init__.py                 # Flask app factory, CORS, and Blueprint registration
│   │   ├── config.py                   # Centralized configuration & recommendation weights
│   │   ├── data/
│   │   │   ├── taxonomy.json           # Master skill dictionary and canonical alias map
│   │   │   └── career_roles.json       # Benchmark industry job roles and skill requirements
│   │   ├── models/
│   │   │   ├── db.py                   # PyMongo client initialization & health ping
│   │   │   ├── user_model.py           # User account schema, scrypt hashing, JWT token logic
│   │   │   ├── student_model.py        # Student profile collection CRUD & in-memory fallback
│   │   │   └── career_model.py         # Career role database queries & JSON fallback loader
│   │   ├── routes/
│   │   │   ├── auth_middleware.py      # @token_required JWT verification decorator
│   │   │   ├── auth_routes.py          # /api/auth endpoints (register, login, me)
│   │   │   ├── student_routes.py       # /api/students endpoints (get, update profiles)
│   │   │   ├── resume_routes.py        # /api/resume endpoints (parse, confirm-profile)
│   │   │   ├── skill_routes.py         # /api/skill-gap endpoints (taxonomy, analyze)
│   │   │   └── career_routes.py        # /api/careers endpoints (get careers, recommend)
│   │   └── services/
│   │       ├── resume_parser.py        # Raw text extraction from PDF and DOCX files
│   │       ├── nlp_extractor.py        # Regex section splitter, contact regex & skill extractor
│   │       ├── skill_gap.py            # M2 Skill-gap calculation algorithm
│   │       └── recommender.py          # M3 Composite 100-point career recommendation engine
│   └── tests/
│       ├── test_backend.py             # Integration tests for health, NLP, gap, & recommender
│       ├── test_auth.py                # Unit tests for registration, password hashing, & JWT
│       ├── test_auth_me.py             # Session validation tests for /api/auth/me
│       ├── test_auth_regression.py     # Auth edge-case regression suite
│       ├── test_resume.py              # Resume parser & NLP extraction test suite
│       ├── test_resume_refinement.py   # Profile merging verification tests
│       └── test_skill_gap.py           # Skill-gap edge case unit tests
└── frontend/
    ├── package.json                    # Frontend Node.js dependencies and scripts
    ├── vite.config.js                  # Vite server port configuration & build settings
    ├── index.html                      # Single page application HTML entry template
    └── src/
        ├── main.jsx                    # React application DOM root launcher
        ├── App.jsx                     # Top-level routing layout & toast notification container
        ├── App.css                     # Component layout styling & responsive grid classes
        ├── index.css                   # Glassmorphic CSS design system tokens & variables
        ├── components/
        │   └── common/
        │       ├── Navbar.jsx          # Header navigation bar with active tab controls & user info
        │       └── Footer.jsx          # Application footer
        ├── context/
        │   └── StudentContext.jsx      # React Context for session, user state, and active tab
        ├── services/
        │   └── api.js                  # Centralized Axios API client with Bearer token interceptor
        └── pages/
            ├── AuthPage.jsx            # Student registration and login tab
            ├── ProfilePage.jsx         # Module 1: Resume upload, skill editor, and profile manager
            ├── SkillGapPage.jsx        # Module 2: Interactive target role skill-gap analyzer
            └── CareerPage.jsx          # Module 3: Ranked career recommendations dashboard
```

---

## 7. BACKEND EXPLANATION

* **Flask Application Factory ([`backend/app/__init__.py`](file:///c:/Users/sahan/final%20year%20project/backend/app/__init__.py)):** Instantiates the Flask app, configures CORS for cross-origin React calls (`/api/*`), initializes database connectivity, registers Blueprints, and exposes health endpoints (`/` and `/api/health`).
* **Application Initialization ([`backend/run.py`](file:///c:/Users/sahan/final%20year%20project/backend/run.py)):** Reads environment variables (`PORT`, `FLASK_DEBUG`) and starts the WSGI server on `0.0.0.0:5000`.
* **Configuration ([`backend/app/config.py`](file:///c:/Users/sahan/final%20year%20project/backend/app/config.py)):** Loads parameters from `.env` (`SECRET_KEY`, `MONGO_URI`, `DB_NAME`, `UPLOAD_FOLDER`, `MAX_CONTENT_LENGTH`) and establishes recommendation engine max weight weights (`SKILL_MATCH_MAX: 70.0`, `ACADEMIC_ELIGIBILITY_MAX: 15.0`, `INTEREST_ALIGNMENT_MAX: 10.0`, `PROJECT_CERT_RELEVANCE_MAX: 5.0`).
* **Database Connection ([`backend/app/models/db.py`](file:///c:/Users/sahan/final%20year%20project/backend/app/models/db.py)):** Connects via `pymongo.MongoClient` with a 5000ms server selection timeout (`init_db`). If MongoDB is offline, `is_db_connected()` returns `False` and models transparently switch to thread-safe in-memory stores.
* **Authentication Middleware ([`backend/app/routes/auth_middleware.py`](file:///c:/Users/sahan/final%20year%20project/backend/app/routes/auth_middleware.py)):** Defines `@token_required` decorator that extracts the HTTP `Authorization: Bearer <token>` header, decodes the JWT signature, and passes `current_user` to protected routes.
* **Routes Layer ([`backend/app/routes/`](file:///c:/Users/sahan/final%20year%20project/backend/app/routes/)):**
  * `auth_routes.py`: Manages user registration, `scrypt` password hashing, login, token generation, and current profile fetching (`/api/auth/me`).
  * `student_routes.py`: CRUD endpoints for student profiles.
  * `resume_routes.py`: Handles multipart document upload (`/api/resume/parse`) and profile merging (`/api/resume/confirm-profile`).
  * `skill_routes.py`: Exposes taxonomy and calculates skill gap against target roles (`/api/skill-gap/analyze`).
  * `career_routes.py`: Lists career roles and generates suitability recommendations (`/api/careers/recommend`).
* **Services Layer ([`backend/app/services/`](file:///c:/Users/sahan/final%20year%20project/backend/app/services/)):** Encapsulates core business logic for file text extraction (`resume_parser.py`), NLP section parsing and skill extraction (`nlp_extractor.py`), skill gap scoring (`skill_gap.py`), and recommendation ranking (`recommender.py`).
* **Models Layer ([`backend/app/models/`](file:///c:/Users/sahan/final%20year%20project/backend/app/models/)):** Abstracts MongoDB collections (`users`, `students`, `career_roles`) with formatted document output (`_id` converted to string, `password_hash` omitted).

---

## 8. FRONTEND EXPLANATION

* **React Application:** Built with React 19 and Vite 8 as a fast Single Page Application (SPA).
* **Pages ([`frontend/src/pages/`](file:///c:/Users/sahan/final%20year%20project/frontend/src/pages/)):**
  * `AuthPage.jsx`: Interactive toggle between student login and registration forms with client-side validation.
  * `ProfilePage.jsx` (M1): Modern upload dropzone for PDF/DOCX resumes, instant text extraction display, skill chip editor (add/remove skills), and academic detail fields.
  * `SkillGapPage.jsx` (M2): Target career selector cards, circular/bar progress visualizations for Skill Match % and Skill Gap %, matched vs missing core/secondary/soft skills breakdowns, and extra skill indicators.
  * `CareerPage.jsx` (M3): Ranked suitability cards with match score breakdown chips (Skill, Academic, Interest, Project/Cert), eligibility badges, and direct action triggers.
* **Components ([`frontend/src/components/common/`](file:///c:/Users/sahan/final%20year%20project/frontend/src/components/common/)):**
  * `Navbar.jsx`: Displays application branding, active tab navigation, student identity badge, and logout button.
  * `Footer.jsx`: Bottom branding and status information.
* **Context & State Management ([`frontend/src/context/StudentContext.jsx`](file:///c:/Users/sahan/final%20year%20project/frontend/src/context/StudentContext.jsx)):** Holds central state (`token`, `user`, `studentProfile`, `activeTab`, `selectedTargetRole`, `notification`). On app mount, executes an authoritative session validation call to `/api/auth/me`.
* **Axios API Client ([`frontend/src/services/api.js`](file:///c:/Users/sahan/final%20year%20project/frontend/src/services/api.js)):** Configures base URL `/api`. Request interceptor injects `Authorization: Bearer <token>` from `localStorage` and automatically deletes `Content-Type` for `FormData` requests to allow standard boundary generation. Response interceptor clears stale tokens on HTTP 401 Unauthorized responses.

---

## 9. DATABASE

The backend uses **MongoDB** as its primary persistence store via the `PyMongo` driver. If MongoDB is unavailable, the application operates seamlessly using thread-safe in-memory data structures.

### Collections and Schemas

#### 1. `users` Collection
Stores authentication credentials for registered students.
```json
{
  "_id": "ObjectId('65f...')",
  "email": "student@college.edu",
  "password_hash": "scrypt:32768:8:1$...",
  "created_at": "2025-10-05T20:00:00+00:00",
  "updated_at": "2025-10-05T20:00:00+00:00"
}
```

#### 2. `students` Collection
Stores detailed profile information, linked to a user account via `user_id`.
```json
{
  "_id": "ObjectId('65f...')",
  "user_id": "65f...",
  "student_id": "user_65f...",
  "personal_info": {
    "name": "Alex Morgan",
    "email": "student@college.edu",
    "phone": "+91 9876543210",
    "github_url": "https://github.com/alexmorgan",
    "linkedin_url": "https://linkedin.com/in/alexmorgan"
  },
  "academic_info": {
    "degree": "B.Tech",
    "branch": "Computer Science & Engineering",
    "graduation_year": 2025,
    "cgpa": 8.5,
    "tenth_percentage": 90.0,
    "twelfth_percentage": 88.5
  },
  "parsed_profile": {
    "skills": ["Python", "Flask", "React", "MongoDB", "SQL", "Git", "REST APIs"],
    "education": [{"degree": "B.Tech", "details": "B.Tech Computer Science Engineering"}],
    "projects": [{"title": "Placement Engine", "description": "Built Flask backend and React UI"}],
    "certifications": ["Python for Data Science"],
    "experience": []
  },
  "interests": ["Backend Development", "Software Engineering"],
  "resume_metadata": {
    "filename": "Alex_Resume.pdf",
    "file_path": "uploads/user_65f_Alex_Resume.pdf"
  },
  "created_at": "2025-10-05T20:00:00+00:00",
  "updated_at": "2025-10-05T20:00:00+00:00"
}
```

#### 3. `career_roles` Collection
Stores benchmark industry job roles and requirements.
```json
{
  "_id": "ObjectId('65f...')",
  "role_id": "ROLE_BACKEND_DEV",
  "title": "Backend Developer",
  "category": "Software Engineering",
  "domain": "Web & Server Architecture",
  "description": "Architects server-side logic, database integrations, RESTful APIs, and business workflows.",
  "required_skills": {
    "core": ["Python", "Flask", "Node.js", "REST APIs", "SQL", "MongoDB", "Git"],
    "secondary": ["Docker", "Redis", "Linux"],
    "soft_skills": ["Problem Solving", "Communication"]
  },
  "academic_eligibility": {
    "min_cgpa": 6.0,
    "allowed_branches": ["Computer Science & Engineering", "Information Technology", "Electrical Engineering"]
  },
  "demand_level": "High"
}
```

### Collection Relationships & Connection Logic
* **Relationship:** 1-to-1 relationship between `users` and `students` linked by `students.user_id = users._id`.
* **Connection Logic:** Implemented in [`backend/app/models/db.py`](file:///c:/Users/sahan/final%20year%20project/backend/app/models/db.py). `init_db(app)` initializes `pymongo.MongoClient(MONGO_URI, serverSelectionTimeoutMS=5000)` and tests connectivity with `client.admin.command('ping')`.

---

## 10. AUTHENTICATION AND SECURITY

```
Registration ──> Password Hashing ──> Login ──> JWT Generation ──> Frontend Storage ──> API Request ──> JWT Verification
```

1. **Registration ([`auth_routes.py`](file:///c:/Users/sahan/final%20year%20project/backend/app/routes/auth_routes.py)):** Validates email format using regex (`r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'`) and verifies password length ($\ge 6$ characters).
2. **Password Hashing ([`user_model.py`](file:///c:/Users/sahan/final%20year%20project/backend/app/models/user_model.py)):** Hashes passwords securely using Werkzeug's `generate_password_hash(password, method='scrypt')`. Plaintext passwords are never saved.
3. **Login ([`auth_routes.py`](file:///c:/Users/sahan/final%20year%20project/backend/app/routes/auth_routes.py)):** Verifies user credentials using Werkzeug's `check_password_hash(stored_hash, password)`.
4. **JWT Generation ([`user_model.py`](file:///c:/Users/sahan/final%20year%20project/backend/app/models/user_model.py)):** Generates signed JSON Web Tokens using `pyjwt` (`HS256` algorithm) containing `{ user_id, email, iat, exp }` with a 7-day expiration time.
5. **Frontend Token Storage ([`StudentContext.jsx`](file:///c:/Users/sahan/final%20year%20project/frontend/src/context/StudentContext.jsx)):** Stores the token in browser `localStorage`.
6. **API Request Authorization ([`api.js`](file:///c:/Users/sahan/final%20year%20project/frontend/src/services/api.js)):** Axios request interceptor attaches the token as `Authorization: Bearer <token>`.
7. **JWT Verification ([`auth_middleware.py`](file:///c:/Users/sahan/final%20year%20project/backend/app/routes/auth_middleware.py)):** The `@token_required` decorator extracts the token, verifies the signature via `jwt.decode()`, checks expiration, and retrieves the active user object.

---

## 11. RESUME PROCESSING

Document parsing and entity extraction pipeline:

```
[Resume File Upload (.pdf / .docx)]
              │
              ▼
[ResumeParserService.extract_text()]
  ├─ PDF  ──> PyMuPDF fitz page text extraction
  └─ DOCX ──> python-docx paragraph & table cell extraction
              │
              ▼
[NLPExtractorService.extract_all()]
  ├─ Contact Regex (Email, Phone, GitHub, LinkedIn)
  ├─ Section Splitter (SECTION_PATTERNS regex)
  ├─ Skill Taxonomy Extraction (Word boundary regex & taxonomy.json)
  ├─ Education Line Extraction (Degree keywords: B.Tech, M.Tech, BCA, etc.)
  ├─ Project Block Extraction
  ├─ Certification Keyword Scanning (certified, coursera, udemy, aws, etc.)
  └─ Experience Block Extraction
              │
              ▼
[Profile Confirmation & Storage]
  └─ /api/resume/confirm-profile merges skills & updates StudentModel
```

* **Source Files:**
  * [`backend/app/services/resume_parser.py`](file:///c:/Users/sahan/final%20year%20project/backend/app/services/resume_parser.py)
  * [`backend/app/services/nlp_extractor.py`](file:///c:/Users/sahan/final%20year%20project/backend/app/services/nlp_extractor.py)
  * [`backend/app/routes/resume_routes.py`](file:///c:/Users/sahan/final%20year%20project/backend/app/routes/resume_routes.py)
  * [`frontend/src/pages/ProfilePage.jsx`](file:///c:/Users/sahan/final%20year%20project/frontend/src/pages/ProfilePage.jsx)

---

## 12. NLP / INFORMATION EXTRACTION

> [!NOTE]
> **Implementation Clarification:** The current production codebase uses deterministic, high-speed **Regex section boundary segmentation**, **spaCy tokenization**, and **Taxonomy Alias Matching**. It does **not** rely on external LLM APIs, heavy vector embeddings, or RAG models for resume parsing.

### NLP Extraction Methodology

1. **Section Header Segmentation:**  
   Splits text into logical blocks using regex boundary patterns defined in [`backend/app/services/nlp_extractor.py`](file:///c:/Users/sahan/final%20year%20project/backend/app/services/nlp_extractor.py):
   ```python
   SECTION_PATTERNS = {
       "education": r'^\s*(education|academic background|academics|qualifications|academic details)\s*$',
       "skills": r'^\s*(skills|technical skills|key skills|technologies|core competencies)\s*$',
       "projects": r'^\s*(projects|key projects|academic projects|personal projects)\s*$',
       "certifications": r'^\s*(certifications|certificates|professional certifications|credentials)\s*$',
       "experience": r'^\s*(experience|work experience|internships|professional experience)\s*$'
   }
   ```

2. **Taxonomy Skill Normalization:**  
   Loads [`backend/app/data/taxonomy.json`](file:///c:/Users/sahan/final%20year%20project/backend/app/data/taxonomy.json) containing categories (`Programming Languages`, `Web & Backend Frameworks`, `Databases & Storage`, `Data Science & Machine Learning`, `DevOps & Tools`, `Soft Skills`). Matches resume tokens against canonical names and aliases using word-boundary regular expressions:
   ```python
   pattern = r'\b' + re.escape(alias_lower) + r'\b'
   ```

3. **Contact Entity Extraction:**
   * Email: `r'[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}'`
   * Phone: `r'(\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}'`
   * GitHub: `r'https?://(?:www\.)?github\.com/[a-zA-Z0-9_-]+'`
   * LinkedIn: `r'https?://(?:www\.)?linkedin\.com/in/[a-zA-Z0-9_-]+'`

---

## 13. M2 – SKILL GAP ANALYSIS

Calculates technical and soft skill readiness against benchmark job roles in [`backend/app/services/skill_gap.py`](file:///c:/Users/sahan/final%20year%20project/backend/app/services/skill_gap.py).

### Skill Tiers and Weighting

Benchmark skills are split into three weighted categories:
* **Core Skills Weight:** 60% (0 – 60.0 points)
* **Secondary Skills Weight:** 30% (0 – 30.0 points)
* **Soft Skills Weight:** 10% (0 – 10.0 points)

### Exact Implementation Formulas

$$\text{Core Score} = \begin{cases} \left( \frac{|\text{Matched Core Skills}|}{|\text{Required Core Skills}|} \right) \times 60.0 & \text{if } |\text{Required Core Skills}| > 0 \\ 60.0 & \text{otherwise} \end{cases}$$

$$\text{Secondary Score} = \begin{cases} \left( \frac{|\text{Matched Secondary Skills}|}{|\text{Required Secondary Skills}|} \right) \times 30.0 & \text{if } |\text{Required Secondary Skills}| > 0 \\ 30.0 & \text{otherwise} \end{cases}$$

$$\text{Soft Score} = \begin{cases} \left( \frac{|\text{Matched Soft Skills}|}{|\text{Required Soft Skills}|} \right) \times 10.0 & \text{if } |\text{Required Soft Skills}| > 0 \\ 10.0 & \text{otherwise} \end{cases}$$

$$\text{Skill Match \%} = \text{round}\left( \min\left(100.0,\, \text{Core Score} + \text{Secondary Score} + \text{Soft Score}\right),\, 1 \right)$$

$$\text{Skill Gap \%} = \text{round}\left( \max\left(0.0,\, 100.0 - \text{Skill Match \%}\right),\, 1 \right)$$

---

## 14. M3 – CAREER RECOMMENDATION

Computes a normalized composite suitability score (0.0 to 100.0 points) across all available career roles in [`backend/app/services/recommender.py`](file:///c:/Users/sahan/final%20year%20project/backend/app/services/recommender.py).

### Normalized 100-Point Scoring Model

$$\text{Composite Suitability Score} = \text{Skill Score} + \text{Academic Score} + \text{Interest Score} + \text{Project/Cert Score}$$

#### 1. Skill Match Component (Max 70.0 Points)
$$\text{Skill Score} = \text{round}\left( \frac{\text{Skill Match \%}}{100.0} \times 70.0,\, 2 \right)$$

#### 2. Academic Relevance & Eligibility Component (Max 15.0 Points)
Evaluates student CGPA and Branch against target role benchmark limits (`min_cgpa`, `allowed_branches`):
$$\text{Academic Score} = \begin{cases} 
15.0 & \text{if CGPA } \ge \text{min\_cgpa AND Branch is Aligned} \\
10.0 & \text{if CGPA } \ge \text{min\_cgpa AND Branch is Not Aligned} \\
7.5 & \text{if CGPA } < \text{min\_cgpa AND Branch is Aligned} \\
0.0 & \text{if CGPA } < \text{min\_cgpa AND Branch is Not Aligned}
\end{cases}$$

#### 3. Interest Alignment Component (Max 10.0 Points)
$$\text{Interest Score} = \begin{cases} 
10.0 & \text{if student interest matches role title, category, or domain} \\
0.0 & \text{otherwise}
\end{cases}$$

#### 4. Project & Certification Relevance Component (Max 5.0 Points)
$$\text{Project/Cert Score} = \begin{cases} 
5.0 & \text{if domain-relevant project or certification is found} \\
2.5 & \text{if general projects/certifications exist (not domain-specific)} \\
0.0 & \text{if no projects or certifications listed}
\end{cases}$$

#### Final Ranking
Roles are sorted in descending order of `suitability_score`.

---

## 15. API ENDPOINTS

| Method | Endpoint | Purpose | Authentication Required |
| :--- | :--- | :--- | :--- |
| `GET` | `/` | System version and active modules operational status | No |
| `GET` | `/api/health` | System health check and database connectivity check | No |
| `POST` | `/api/auth/register` | Register a new student account | No |
| `POST` | `/api/auth/login` | Authenticate student and issue JWT token | No |
| `GET` | `/api/auth/me` | Fetch authenticated user profile & linked student profile | **Yes (JWT)** |
| `GET` | `/api/students` | Retrieve all student profiles | No |
| `GET` | `/api/students/<student_id>` | Retrieve student profile by ID or `user_id` | No |
| `POST` / `PUT` | `/api/students` | Save or update student profile | Optional (JWT linked if present) |
| `POST` | `/api/resume/parse` | Parse uploaded PDF or DOCX resume document | **Yes (JWT)** |
| `POST` | `/api/resume/confirm-profile` | Merge confirmed extracted resume data into student profile | **Yes (JWT)** |
| `GET` | `/api/skill-gap/taxonomy` | Fetch master skill taxonomy dictionary | No |
| `POST` | `/api/skill-gap/analyze` | Perform skill-gap analysis for target `role_id` | **Yes (JWT)** |
| `GET` | `/api/careers` | Fetch list of benchmark career roles | No |
| `GET` | `/api/careers/<role_id>` | Fetch specific career role details by `role_id` | No |
| `POST` | `/api/careers/recommend` | Generate ranked career suitability recommendations | No |

---

## 16. HOW TO INSTALL AND RUN LOCALLY

Follow these execution instructions for Windows (PowerShell).

### A. Prerequisites
* **Python:** Python 3.10 or higher installed. Verify with `python --version`.
* **Node.js:** Node.js v18 or higher and `npm` installed. Verify with `node -v` and `npm -v`.
* **MongoDB (Optional):** Local MongoDB instance on port 27017 or MongoDB Atlas connection string. *(If MongoDB is offline, system automatically operates in-memory)*.

### B. Backend Setup
Open PowerShell and navigate to the project backend directory:
```powershell
cd backend
```

### C. Backend Environment Setup
Create a `.env` file in the `backend/` directory by copying `.env.example`:
```powershell
Copy-Item .env.example .env
```
*(Optionally modify `SECRET_KEY` or `MONGO_URI` inside `.env` if using custom database parameters)*.

### D. MongoDB Setup
Ensure MongoDB service is running locally on port 27017, or update `MONGO_URI` in `.env`.
If MongoDB is not running, the application will issue a log warning and run using in-memory fallbacks.

### E. Installing Python Dependencies
Create a virtual environment and install backend requirements:
```powershell
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
```

### F. Starting Backend
Seed the benchmark database roles and start the Flask REST server:
```powershell
python seed_db.py
python run.py
```
*The backend server will run at `http://localhost:5000`.*

### G. Frontend Setup
Open a **new** PowerShell terminal tab/window and navigate to the `frontend/` directory:
```powershell
cd frontend
```

### H. Installing npm Dependencies
Install frontend packages:
```powershell
npm install
```

### I. Starting Frontend
Start the Vite development server:
```powershell
npm run dev
```

### J. Opening the Application in Browser
Open your browser and navigate to the Vite application URL:
```
http://localhost:3000
```
*(or the local server URL displayed in the Vite terminal output, e.g., `http://localhost:5173`)*.
