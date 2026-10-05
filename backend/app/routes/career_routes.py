from flask import Blueprint, request, jsonify
from app.models.career_model import CareerModel
from app.models.student_model import StudentModel
from app.services.recommender import RecommendationEngineService

career_bp = Blueprint("career", __name__, url_prefix="/api/careers")

@career_bp.route("", methods=["GET"])
def get_careers():
    """Fetch list of benchmark career roles."""
    try:
        careers = CareerModel.find_all()
        return jsonify({"status": "success", "count": len(careers), "data": careers}), 200
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500

@career_bp.route("/<role_id>", methods=["GET"])
def get_career_by_role_id(role_id):
    """Fetch career role details by role_id."""
    try:
        career = CareerModel.find_by_role_id(role_id)
        if not career:
            return jsonify({"status": "error", "message": "Career role not found"}), 404
        return jsonify({"status": "success", "data": career}), 200
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500

@career_bp.route("/recommend", methods=["POST"])
def get_recommendations():
    """
    Generates career suitability recommendations for a given student profile or ID.
    """
    try:
        data = request.get_json() or {}
        student_id = data.get("student_id")
        profile_data = data.get("profile")

        if not profile_data and student_id:
            profile_data = StudentModel.find_by_id(student_id)

        if not profile_data:
            return jsonify({"status": "error", "message": "Student profile data or valid student_id is required."}), 400

        available_careers = CareerModel.find_all()
        
        # If DB is empty, load benchmark career dataset from JSON as fallback
        if not available_careers:
            import os, json
            base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
            careers_json_path = os.path.join(base_dir, "data", "career_roles.json")
            if os.path.exists(careers_json_path):
                with open(careers_json_path, "r", encoding="utf-8") as f:
                    available_careers = json.load(f)

        recommendations = RecommendationEngineService.recommend_careers(profile_data, available_careers)

        return jsonify({
            "status": "success",
            "count": len(recommendations),
            "data": recommendations
        }), 200

    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500
