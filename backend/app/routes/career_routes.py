from flask import Blueprint, request, jsonify
from app.models.career_model import CareerModel
from app.models.student_model import StudentModel
from app.services.recommender import RecommendationEngineService
from app.services.job_search_service import JobSearchService

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
    Generates real-time, verified job recommendations dynamically matched 
    to the student's actual skills, qualifications, and preferences.
    Searches across LinkedIn, Remotive, and Arbeitnow with valid application URLs.
    """
    try:
        data = request.get_json() or {}
        student_id = data.get("student_id")
        profile_data = data.get("profile")

        if not profile_data and student_id:
            profile_data = StudentModel.find_by_id(student_id)

        # Fallback empty profile structure if user hasn't registered yet
        if not profile_data:
            profile_data = {"skills": [], "academic_info": {"cgpa": 7.5}}

        query = data.get("query")
        location = data.get("location", "Remote")
        platform = data.get("platform", "all")
        force_refresh = data.get("refresh", False)

        # 1. Fetch & recommend real jobs across platforms
        real_job_recommendations = JobSearchService.evaluate_and_recommend(
            student_profile=profile_data,
            query=query,
            location=location,
            platform=platform,
            force_refresh=force_refresh
        )

        return jsonify({
            "status": "success",
            "count": len(real_job_recommendations),
            "data": real_job_recommendations,
            "query_used": query or "Profile Extracted Skills",
            "location_used": location,
            "platform_used": platform
        }), 200

    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500

@career_bp.route("/search-live", methods=["GET"])
def search_live_jobs():
    """
    Direct live search across LinkedIn, Arbeitnow, and Remotive job boards.
    """
    try:
        query = request.args.get("query", "Software Engineer")
        location = request.args.get("location", "Remote")
        platform = request.args.get("platform", "all")
        limit = int(request.args.get("limit", 25))

        jobs = JobSearchService.search_all_real_jobs(
            query=query,
            location=location,
            platform=platform,
            limit=limit
        )

        return jsonify({
            "status": "success",
            "count": len(jobs),
            "data": jobs
        }), 200
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500
