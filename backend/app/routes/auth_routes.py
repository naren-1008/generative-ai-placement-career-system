import re
from flask import Blueprint, request, jsonify
from app.models.user_model import UserModel
from app.models.student_model import StudentModel
from app.routes.auth_middleware import token_required

auth_bp = Blueprint("auth", __name__, url_prefix="/api/auth")

EMAIL_REGEX = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'

@auth_bp.route("/register", methods=["POST"])
def register():
    """
    Registers a new student account.
    Body: { email, password, confirm_password }
    """
    try:
        data = request.get_json() or {}
        email = data.get("email", "").strip()
        password = data.get("password", "")
        confirm_password = data.get("confirm_password", "")

        # 1. Validation
        if not email or not re.match(EMAIL_REGEX, email):
            return jsonify({"status": "error", "message": "Please provide a valid email address."}), 400

        if not password or len(password) < 6:
            return jsonify({"status": "error", "message": "Password must be at least 6 characters long."}), 400

        if password != confirm_password:
            return jsonify({"status": "error", "message": "Passwords do not match."}), 400

        # 2. Duplicate Check & User Creation
        try:
            user = UserModel.create_user(email, password)
        except ValueError as ve:
            return jsonify({"status": "error", "message": str(ve)}), 409

        # 3. Create initial linked student profile with dynamic user inputs
        user_id = user["_id"]
        name = data.get("name", "").strip() or email.split("@")[0].capitalize()
        phone = data.get("phone", "").strip()
        degree = data.get("degree", "").strip() or "B.Tech"
        branch = data.get("branch", "").strip() or "Computer Science"
        try:
            grad_year = int(data.get("graduation_year", 2025))
        except (ValueError, TypeError):
            grad_year = 2025
        try:
            cgpa = float(data.get("cgpa", 0.0))
        except (ValueError, TypeError):
            cgpa = 0.0

        initial_skills = data.get("skills", [])
        if isinstance(initial_skills, str):
            initial_skills = [s.strip() for s in initial_skills.split(",") if s.strip()]

        initial_profile = {
            "user_id": user_id,
            "personal_info": {
                "name": name,
                "email": email,
                "phone": phone,
                "github_url": data.get("github_url", ""),
                "linkedin_url": data.get("linkedin_url", "")
            },
            "academic_info": {
                "degree": degree,
                "branch": branch,
                "graduation_year": grad_year,
                "cgpa": cgpa,
                "tenth_percentage": float(data.get("tenth_percentage", 0.0) or 0.0),
                "twelfth_percentage": float(data.get("twelfth_percentage", 0.0) or 0.0)
            },
            "parsed_profile": {
                "skills": initial_skills,
                "education": [
                    {
                        "degree": f"{degree} {branch}",
                        "institution": data.get("institution", "University Department"),
                        "score": f"{cgpa} CGPA" if cgpa > 0 else "Pending",
                        "year": str(grad_year)
                    }
                ] if degree else [],
                "projects": [],
                "certifications": []
            },
            "interests": data.get("interests", [branch] if branch else [])
        }
        student_profile = StudentModel.create_or_update(initial_profile)

        # 4. Generate Token
        token = UserModel.generate_token(user_id, email)

        return jsonify({
            "status": "success",
            "message": "User registered successfully.",
            "token": token,
            "user": user,
            "student_profile": student_profile
        }), 201

    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500


@auth_bp.route("/login", methods=["POST"])
def login():
    """
    Authenticates a student user.
    Body: { email, password }
    """
    try:
        data = request.get_json() or {}
        email = data.get("email", "").strip()
        password = data.get("password", "")

        if not email or not password:
            return jsonify({"status": "error", "message": "Email and password are required."}), 400

        user_doc = UserModel.find_by_email(email)
        if not user_doc:
            return jsonify({"status": "error", "message": "Invalid email or password."}), 401

        if not UserModel.verify_password(user_doc["password_hash"], password):
            return jsonify({"status": "error", "message": "Invalid email or password."}), 401

        user = UserModel.format_doc(user_doc)
        token = UserModel.generate_token(user["_id"], user["email"])

        # Fetch linked student profile
        student_profile = StudentModel.find_by_user_id(user["_id"])
        if not student_profile:
            # Fallback create profile if not existing
            student_profile = StudentModel.create_or_update({
                "user_id": user["_id"],
                "personal_info": {"name": email.split("@")[0].capitalize(), "email": email},
                "academic_info": {"degree": "B.Tech", "branch": "Computer Science", "graduation_year": 2025, "cgpa": 0.0},
                "parsed_profile": {"skills": [], "education": [], "projects": [], "certifications": []},
                "interests": []
            })

        return jsonify({
            "status": "success",
            "message": "Login successful.",
            "token": token,
            "user": user,
            "student_profile": student_profile
        }), 200

    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500


@auth_bp.route("/me", methods=["GET"])
@token_required
def get_current_user_profile(current_user):
    """
    Returns current authenticated user profile & linked student document.
    """
    try:
        user_id = str(current_user["_id"])
        formatted_user = UserModel.format_doc(current_user)
        student_profile = StudentModel.find_by_user_id(user_id)

        return jsonify({
            "status": "success",
            "user": formatted_user,
            "student_profile": student_profile
        }), 200
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500
