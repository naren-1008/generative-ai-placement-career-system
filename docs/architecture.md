# Architecture Overview - Generative AI Placement & Career System

## Core System Modules

### Phase 1 Modules (Implemented)
- **M1 — Resume & Student Profile Analysis**: Extacts text from `.pdf` and `.docx` using PyMuPDF and `python-docx`. Uses `spaCy` NLP and `taxonomy.json` for skill normalization and profile generation.
- **M2 — Skill-Gap Analysis**: Computes weighted match score, identifies matched vs missing core & secondary skills against target career benchmark roles.
- **M3 — Career Recommendation**: Ranks target career roles using composite suitability scoring (Skills 85%, CGPA eligibility 15%, Interest bonus +5%).

### Phase 2 Modules (Future Extensions)
- **M4 — Placement Readiness Prediction**: Scikit-Learn / XGBoost classification model.
- **M5 — Personalized Training Recommendation**: Structured learning roadmap based on missing core skills.
- **M6 — GenAI Career Guidance**: Modular LLM integration via Flask backend endpoint.
