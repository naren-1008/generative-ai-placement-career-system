from datetime import datetime, timezone
from bson import ObjectId
from app.models.db import get_db

# In-memory student fallback store when MongoDB is disconnected
_in_memory_students = {}

class StudentModel:
    COLLECTION_NAME = "students"

    @classmethod
    def clear_in_memory_store(cls):
        global _in_memory_students
        _in_memory_students.clear()
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
            return db[StudentModel.COLLECTION_NAME]
        return None

    @staticmethod
    def format_doc(doc):
        if not doc:
            return None
        doc_copy = dict(doc)
        if "_id" in doc_copy:
            doc_copy["_id"] = str(doc_copy["_id"])
        return doc_copy

    @classmethod
    def find_all(cls):
        coll = cls.get_collection()
        if coll is None:
            return [cls.format_doc(s) for s in _in_memory_students.values()]
        students = list(coll.find({}))
        return [cls.format_doc(s) for s in students]

    @classmethod
    def find_by_id(cls, student_id):
        coll = cls.get_collection()
        if coll is None:
            for s in _in_memory_students.values():
                if str(s.get("_id")) == str(student_id) or s.get("student_id") == str(student_id) or s.get("user_id") == str(student_id):
                    return cls.format_doc(s)
            return None
        try:
            doc = None
            if ObjectId.is_valid(student_id):
                doc = coll.find_one({"_id": ObjectId(student_id)})
            if not doc:
                doc = coll.find_one({"user_id": str(student_id)})
            if not doc:
                doc = coll.find_one({"student_id": str(student_id)})
            return cls.format_doc(doc)
        except Exception:
            return None

    @classmethod
    def find_by_user_id(cls, user_id):
        user_id_str = str(user_id)
        coll = cls.get_collection()
        if coll is None:
            for s in _in_memory_students.values():
                if str(s.get("user_id")) == user_id_str:
                    return cls.format_doc(s)
            return None
        doc = coll.find_one({"user_id": user_id_str})
        return cls.format_doc(doc)

    @classmethod
    def create_or_update(cls, student_data):
        coll = cls.get_collection()
        now = datetime.now(timezone.utc).isoformat()
        student_data["updated_at"] = now

        user_id = student_data.get("user_id")
        student_id = student_data.get("student_id") or student_data.get("_id")

        if coll is None:
            key = str(user_id) if user_id else (str(student_id) if student_id else f"temp_stu_{len(_in_memory_students)+1}")
            if key not in _in_memory_students:
                student_data["created_at"] = now
                student_data["_id"] = key
            _in_memory_students[key] = student_data
            return cls.format_doc(student_data)

        # Priority 1: Update by user_id to prevent duplicates for authenticated users
        if user_id:
            user_id_str = str(user_id)
            student_data["user_id"] = user_id_str
            student_data.pop("_id", None)
            
            coll.update_one({"user_id": user_id_str}, {"$set": student_data}, upsert=True)
            updated_doc = coll.find_one({"user_id": user_id_str})
            return cls.format_doc(updated_doc)

        # Priority 2: Update by ObjectId or student_id
        if student_id and ObjectId.is_valid(student_id):
            student_data.pop("_id", None)
            coll.update_one({"_id": ObjectId(student_id)}, {"$set": student_data}, upsert=True)
            student_data["_id"] = str(student_id)
            return cls.format_doc(student_data)
        elif student_id:
            coll.update_one({"student_id": str(student_id)}, {"$set": student_data}, upsert=True)
            updated_doc = coll.find_one({"student_id": str(student_id)})
            return cls.format_doc(updated_doc)
        else:
            student_data["created_at"] = now
            result = coll.insert_one(student_data)
            student_data["_id"] = str(result.inserted_id)
            return cls.format_doc(student_data)
