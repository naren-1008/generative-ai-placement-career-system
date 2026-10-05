import os
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

class Config:
    SECRET_KEY = os.getenv("SECRET_KEY", "default_dev_secret_key_2025")
    MONGO_URI = os.getenv("MONGO_URI", "mongodb://localhost:27017/")
    DB_NAME = os.getenv("DB_NAME", "placement_career_db")
    
    BASE_DIR = os.path.abspath(os.path.dirname(__file__))
    UPLOAD_FOLDER = os.path.join(BASE_DIR, "..", os.getenv("UPLOAD_FOLDER", "uploads"))
    MAX_CONTENT_LENGTH = int(os.getenv("MAX_CONTENT_LENGTH", 16 * 1024 * 1024))
    
    ALLOWED_EXTENSIONS = {"pdf", "docx"}
    
    # LLM config placeholder for future GenAI integration
    LLM_PROVIDER = os.getenv("LLM_PROVIDER", "mock")
    LLM_API_KEY = os.getenv("LLM_API_KEY", "")

    # M3 Recommendation Engine Normalized 100-Point Model Weights
    RECOMMENDATION_WEIGHTS = {
        "SKILL_MATCH_MAX": 70.0,            # Skill Match (70%)
        "ACADEMIC_ELIGIBILITY_MAX": 15.0,   # Academic Relevance & CGPA Eligibility (15%)
        "INTEREST_ALIGNMENT_MAX": 10.0,     # Interest Alignment (10%)
        "PROJECT_CERT_RELEVANCE_MAX": 5.0    # Project & Certification Relevance (5%)
    }

    @staticmethod
    def init_app(app):
        # Ensure upload folder exists
        os.makedirs(Config.UPLOAD_FOLDER, exist_ok=True)
