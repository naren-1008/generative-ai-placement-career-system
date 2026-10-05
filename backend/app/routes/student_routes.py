from flask import Blueprint, request, jsonify
from app.models.student_model import StudentModel
from app.models.user_model import UserModel

student_bp = Blueprint("student", __name__, url_prefix="/api/students")

@student_bp.route("", methods=["GET"])
def get_all_students():
    """Fetch all student profiles."""
    try:
        students = StudentModel.find_all()
        return jsonify({"status": "success", "count": len(students), "data": students}), 200
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500

@student_bp.route("/<student_id>", methods=["GET"])
def get_student_by_id(student_id):
    """Fetch student profile by ID or user_id."""
    try:
        student = StudentModel.find_by_id(student_id)
        if not student:
            return jsonify({"status": "error", "message": "Student profile not found"}), 404
        return jsonify({"status": "success", "data": student}), 200
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500

@student_bp.route("", methods=["POST", "PUT"])
def create_or_update_student():
    """Save or update student profile."""
    try:
        data = request.get_json()
        if not data:
            return jsonify({"status": "error", "message": "Request body must be valid JSON"}), 400

        # Check for Authorization Bearer token header if supplied
        auth_header = request.headers.get("Authorization")
        if auth_header and auth_header.startswith("Bearer "):
            token = auth_header.split(" ")[1]
            payload = UserModel.verify_token(token)
            if payload:
                data["user_id"] = str(payload.get("user_id"))

        # Basic input validation
        personal_info = data.get("personal_info", {})
        if not personal_info.get("name"):
            return jsonify({"status": "error", "message": "Student name is required"}), 400

        saved_profile = StudentModel.create_or_update(data)
        return jsonify({
            "status": "success",
            "message": "Student profile saved successfully",
            "data": saved_profile
        }), 200
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500
