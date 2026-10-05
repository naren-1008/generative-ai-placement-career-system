import datetime
import jwt
from bson import ObjectId
from werkzeug.security import generate_password_hash, check_password_hash
from flask import current_app
from app.models.db import get_db

# In-memory user fallback store when MongoDB is disconnected
_in_memory_users = {}

class UserModel:
    COLLECTION_NAME = "users"

    @classmethod
    def clear_in_memory_store(cls):
        global _in_memory_users
        _in_memory_users.clear()
        coll = cls.get_collection()
        if coll is not None:
            try:
                coll.delete_many({})
            except Exception:
                pass

    @staticmethod
    def get_collection():
        db = get_db()
        if db is not None:
            return db[UserModel.COLLECTION_NAME]
        return None

    @staticmethod
    def format_doc(doc):
        if not doc:
            return None
        doc_copy = dict(doc)
        if "_id" in doc_copy:
            doc_copy["_id"] = str(doc_copy["_id"])
        # Never expose password_hash in formatted user output
        doc_copy.pop("password_hash", None)
        return doc_copy

    @classmethod
    def find_by_email(cls, email):
        email_clean = email.strip().lower()
        coll = cls.get_collection()
        if coll is not None:
            doc = coll.find_one({"email": email_clean})
            if doc:
                return doc
        return _in_memory_users.get(email_clean)

    @classmethod
    def find_by_id(cls, user_id):
        coll = cls.get_collection()
        if coll is not None:
            try:
                doc = None
                if ObjectId.is_valid(user_id):
                    doc = coll.find_one({"_id": ObjectId(user_id)})
                if not doc:
                    doc = coll.find_one({"_id": str(user_id)})
                if doc:
                    return doc
            except Exception:
                pass
        # Check in-memory fallback store
        for u in _in_memory_users.values():
            if str(u.get("_id")) == str(user_id):
                return u
        return None

    @classmethod
    def create_user(cls, email, password):
        email_clean = email.strip().lower()
        if cls.find_by_email(email_clean):
            raise ValueError("An account with this email already exists.")

        password_hash = generate_password_hash(password, method='scrypt')
        now = datetime.datetime.now(datetime.timezone.utc).isoformat()

        user_doc = {
            "email": email_clean,
            "password_hash": password_hash,
            "created_at": now,
            "updated_at": now
        }

        coll = cls.get_collection()
        if coll is not None:
            result = coll.insert_one(user_doc)
            user_doc["_id"] = result.inserted_id
        else:
            temp_id = f"user_{len(_in_memory_users) + 1}"
            user_doc["_id"] = temp_id
            _in_memory_users[email_clean] = user_doc

        return cls.format_doc(user_doc)

    @classmethod
    def verify_password(cls, stored_hash, password):
        return check_password_hash(stored_hash, password)

    @classmethod
    def generate_token(cls, user_id, email, secret_key=None):
        if not secret_key:
            try:
                secret_key = current_app.config.get("SECRET_KEY", "default_secret")
            except RuntimeError:
                secret_key = "default_secret"

        payload = {
            "user_id": str(user_id),
            "email": email,
            "exp": datetime.datetime.now(datetime.timezone.utc) + datetime.timedelta(days=7),
            "iat": datetime.datetime.now(datetime.timezone.utc)
        }
        return jwt.encode(payload, secret_key, algorithm="HS256")

    @classmethod
    def verify_token(cls, token, secret_key=None):
        if not secret_key:
            try:
                secret_key = current_app.config.get("SECRET_KEY", "default_secret")
            except RuntimeError:
                secret_key = "default_secret"
        try:
            payload = jwt.decode(token, secret_key, algorithms=["HS256"])
            return payload
        except (jwt.ExpiredSignatureError, jwt.InvalidTokenError):
            return None
