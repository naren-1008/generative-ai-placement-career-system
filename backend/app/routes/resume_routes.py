import os
from werkzeug.utils import secure_filename
from flask import Blueprint, request, jsonify, current_app
from app.services.resume_parser import ResumeParserService
from app.services.nlp_extractor import NLPExtractorService
from app.models.student_model import StudentModel
from app.routes.auth_middleware import token_required

resume_bp = Blueprint("resume", __name__, url_prefix="/api/resume")
nlp_service = NLPExtractorService()

def allowed_file(filename):
    allowed = current_app.config.get("ALLOWED_EXTENSIONS", {"pdf", "docx"})
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in allowed

@resume_bp.route("/parse", methods=["POST"])
@token_required
def parse_resume(current_user):
    """
    Accepts a multipart file upload ('resume') for an authenticated user,
    extracts text and structured profile information, and returns a preview object.
    """
    try:
        user_id = str(current_user["_id"])

        if 'resume' not in request.files:
            return jsonify({"status": "error", "message": "No file uploaded. Form field key 'resume' is required."}), 400

        file = request.files['resume']
        if file.filename == '':
            return jsonify({"status": "error", "message": "No file selected for upload."}), 400

        if not allowed_file(file.filename):
            return jsonify({"status": "error", "message": "Unsupported file format. Only PDF (.pdf) and DOCX (.docx) files are allowed."}), 400

        filename = secure_filename(file.filename)
        upload_folder = current_app.config['UPLOAD_FOLDER']
        os.makedirs(upload_folder, exist_ok=True)
        file_path = os.path.join(upload_folder, f"{user_id}_{filename}")
        file.save(file_path)

        # 1. Extract plain text from document
        try:
            raw_text = ResumeParserService.extract_text(file_path)
        except Exception as parse_err:
            return jsonify({"status": "error", "message": f"Resume text extraction failed: {str(parse_err)}"}), 500

        if not raw_text or not raw_text.strip():
            return jsonify({"status": "error", "message": "Extracted text from resume is empty or corrupted."}), 400

        # 2. Run NLP entity and skill extraction pipeline
        parsed_data = nlp_service.extract_all(raw_text)
        parsed_data["user_id"] = user_id
        parsed_data["resume_metadata"] = {
            "filename": filename,
            "file_path": file_path,
            "raw_text": raw_text
        }

        return jsonify({
            "status": "success",
            "message": "Resume uploaded and parsed successfully.",
            "data": parsed_data
        }), 200

    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500


@resume_bp.route("/confirm-profile", methods=["POST"])
@token_required
def confirm_profile(current_user):
    """
    Merges confirmed parsed resume data with the authenticated student's existing profile.
    """
    try:
        user_id = str(current_user["_id"])
        payload = request.get_json() or {}

        existing_student = StudentModel.find_by_user_id(user_id) or {}

        # Merge skills (deduplicate)
        existing_skills = existing_student.get("parsed_profile", {}).get("skills", []) or existing_student.get("skills", [])
        incoming_skills = payload.get("parsed_profile", {}).get("skills", []) or payload.get("skills", [])
        merged_skills = sorted(list(set(existing_skills + incoming_skills)))

        # Merge contact/personal info (preserve existing manual entries if present)
        existing_personal = existing_student.get("personal_info", {})
        incoming_contact = payload.get("contact_info", {}) or payload.get("personal_info", {})
        
        merged_personal = {
            "name": existing_personal.get("name") or incoming_contact.get("name") or current_user.get("email", "").split("@")[0].capitalize(),
            "email": existing_personal.get("email") or incoming_contact.get("email") or current_user.get("email"),
            "phone": existing_personal.get("phone") or incoming_contact.get("phone", ""),
            "github_url": existing_personal.get("github_url") or incoming_contact.get("github", ""),
            "linkedin_url": existing_personal.get("linkedin_url") or incoming_contact.get("linkedin", "")
        }

        # Preserve existing academic info
        existing_academic = existing_student.get("academic_info", {})
        incoming_academic = payload.get("academic_info", {})
        merged_academic = {
            "degree": existing_academic.get("degree") or incoming_academic.get("degree", "B.Tech"),
            "branch": existing_academic.get("branch") or incoming_academic.get("branch", "Computer Science"),
            "graduation_year": existing_academic.get("graduation_year") or incoming_academic.get("graduation_year", 2025),
            "cgpa": incoming_academic.get("cgpa") if incoming_academic.get("cgpa") is not None else existing_academic.get("cgpa", 0.0),
            "tenth_percentage": incoming_academic.get("tenth_percentage") if incoming_academic.get("tenth_percentage") is not None else existing_academic.get("tenth_percentage", 0.0),
            "twelfth_percentage": incoming_academic.get("twelfth_percentage") if incoming_academic.get("twelfth_percentage") is not None else existing_academic.get("twelfth_percentage", 0.0)
        }

        # Merged parsed profile (skills, projects, education, certifications, experience)
        incoming_parsed = payload.get("parsed_profile", {})
        merged_parsed_profile = {
            "skills": merged_skills,
            "education": incoming_parsed.get("education", []) or existing_student.get("parsed_profile", {}).get("education", []),
            "projects": incoming_parsed.get("projects", []) or existing_student.get("parsed_profile", {}).get("projects", []),
            "certifications": incoming_parsed.get("certifications", []) or payload.get("certifications", []) or existing_student.get("parsed_profile", {}).get("certifications", []),
            "experience": incoming_parsed.get("experience", []) or payload.get("experience", []) or existing_student.get("parsed_profile", {}).get("experience", [])
        }

        merged_profile = {
            "user_id": user_id,
            "personal_info": merged_personal,
            "academic_info": merged_academic,
            "parsed_profile": merged_parsed_profile,
            "resume_metadata": payload.get("resume_metadata") or existing_student.get("resume_metadata"),
            "interests": existing_student.get("interests", payload.get("interests", []))
        }

        saved_profile = StudentModel.create_or_update(merged_profile)

        return jsonify({
            "status": "success",
            "message": "Extracted resume information successfully merged into student profile.",
            "data": saved_profile
        }), 200

    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500
