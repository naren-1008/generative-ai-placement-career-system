from functools import wraps
from flask import request, jsonify
from app.models.user_model import UserModel

def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        # Allow CORS preflight OPTIONS requests to pass through without token check
        if request.method == 'OPTIONS':
            return f(current_user=None, *args, **kwargs)

        token = None

        auth_header = request.headers.get("Authorization")
        if auth_header and auth_header.startswith("Bearer "):
            token = auth_header.split(" ")[1]

        if not token:
            return jsonify({
                "status": "error",
                "message": "Authentication token is missing. Please log in."
            }), 401

        payload = UserModel.verify_token(token)
        if not payload:
            return jsonify({
                "status": "error",
                "message": "Invalid or expired token. Please log in again."
            }), 401

        user = UserModel.find_by_id(payload.get("user_id"))
        if not user:
            return jsonify({
                "status": "error",
                "message": "User associated with token no longer exists."
            }), 401

        return f(current_user=user, *args, **kwargs)

    return decorated
