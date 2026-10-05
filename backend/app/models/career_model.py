import os
import json
from bson import ObjectId
from app.models.db import get_db

class CareerModel:
    COLLECTION_NAME = "career_roles"

    @staticmethod
    def get_collection():
        db = get_db()
        if db is not None:
            return db[CareerModel.COLLECTION_NAME]
        return None

    @staticmethod
    def format_doc(doc):
        if not doc:
            return None
        doc_copy = dict(doc)
        if "_id" in doc_copy:
            doc_copy["_id"] = str(doc_copy["_id"])
        return doc_copy

    @staticmethod
    def _load_json_fallback():
        try:
            base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
            json_path = os.path.join(base_dir, "data", "career_roles.json")
            with open(json_path, "r", encoding="utf-8") as f:
                return json.load(f)
        except Exception:
            return []

    @classmethod
    def find_all(cls):
        coll = cls.get_collection()
        if coll is not None:
            try:
                careers = list(coll.find({}))
                if careers:
                    return [cls.format_doc(c) for c in careers]
            except Exception:
                pass
        return cls._load_json_fallback()

    @classmethod
    def find_by_role_id(cls, role_id):
        coll = cls.get_collection()
        if coll is not None:
            try:
                doc = coll.find_one({"role_id": role_id})
                if not doc and ObjectId.is_valid(role_id):
                    doc = coll.find_one({"_id": ObjectId(role_id)})
                if doc:
                    return cls.format_doc(doc)
            except Exception:
                pass
        
        # Check json fallback dataset
        fallback_list = cls._load_json_fallback()
        for c in fallback_list:
            if c.get("role_id") == role_id or c.get("role_id").lower() == role_id.lower():
                return c
        return None

    @classmethod
    def seed_careers(cls, careers_list):
        coll = cls.get_collection()
        if coll is None:
            return False
        for c in careers_list:
            coll.update_one({"role_id": c["role_id"]}, {"$set": c}, upsert=True)
        return True
