from flask import Blueprint, request, jsonify
from app.services.nlp_extractor import NLPExtractorService
from app.services.skill_gap import SkillGapService
from app.models.career_model import CareerModel
from app.models.student_model import StudentModel
from app.routes.auth_middleware import token_required

skill_bp = Blueprint("skill", __name__, url_prefix="/api/skill-gap")
nlp_service = NLPExtractorService()

@skill_bp.route("/taxonomy", methods=["GET"])
def get_taxonomy():
    """Returns master skill dictionary/taxonomy."""
    return jsonify({"status": "success", "data": nlp_service.taxonomy}), 200

@skill_bp.route("/analyze", methods=["POST"])
@token_required
def analyze_skill_gap(current_user):
    """
    Performs authenticated skill-gap analysis comparing target career required skills
    against the authenticated student's confirmed M1 profile.
    """
    try:
        user_id = str(current_user["_id"])
        data = request.get_json() or {}
        role_id = data.get("role_id")
        custom_skills = data.get("skills")

        if not role_id:
            return jsonify({"status": "error", "message": "Target role_id is required."}), 400

        target_career = CareerModel.find_by_role_id(role_id)
        if not target_career:
            return jsonify({"status": "error", "message": f"Career role '{role_id}' not found."}), 404

        # Retrieve authenticated student's confirmed M1 profile
        student = StudentModel.find_by_user_id(user_id)
        student_skills = []

        if student:
            student_skills = student.get("parsed_profile", {}).get("skills", []) or student.get("skills", [])
        
        # Optionally allow explicit custom_skills in body if provided
        if custom_skills is not None and isinstance(custom_skills, list) and len(custom_skills) > 0:
            student_skills = custom_skills

        analysis_result = SkillGapService.analyze_gap(student_skills, target_career, nlp_service)

        return jsonify({
            "status": "success",
            "data": analysis_result
        }), 200

    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500
