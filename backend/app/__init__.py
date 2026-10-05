from flask import Flask, jsonify
from flask_cors import CORS
from app.config import Config
from app.models.db import init_db

def create_app(config_class=Config):
    app = Flask(__name__)
    app.config.from_object(config_class)
    config_class.init_app(app)

    # Enable CORS for React frontend cross-origin REST calls
    CORS(app, resources={r"/api/*": {"origins": "*"}})

    # Initialize MongoDB connection
    init_db(app)

    # Register API Blueprints
    from app.routes.auth_routes import auth_bp
    from app.routes.student_routes import student_bp
    from app.routes.resume_routes import resume_bp
    from app.routes.skill_routes import skill_bp
    from app.routes.career_routes import career_bp

    app.register_blueprint(auth_bp)
    app.register_blueprint(student_bp)
    app.register_blueprint(resume_bp)
    app.register_blueprint(skill_bp)
    app.register_blueprint(career_bp)

    @app.route("/")
    def index():
        return jsonify({
            "system": "Generative AI-Powered Placement & Career Recommendation System",
            "version": "1.0.0",
            "status": "operational",
            "active_modules": ["M1 - Profile & Resume Analysis", "M2 - Skill Gap Analysis", "M3 - Career Recommendation"]
        })

    @app.route("/api/health")
    def health_check():
        from app.models.db import is_db_connected
        return jsonify({
            "status": "healthy",
            "db_connected": is_db_connected()
        })

    return app
