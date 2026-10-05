import os
import json
import logging
from app import create_app
from app.models.career_model import CareerModel
from app.models.db import is_db_connected

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def seed_database():
    app = create_app()
    with app.app_context():
        if not is_db_connected():
            logger.warning("MongoDB is not connected. Seed script cannot populate database.")
            return

        base_dir = os.path.dirname(os.path.abspath(__file__))
        json_path = os.path.join(base_dir, "app", "data", "career_roles.json")

        if not os.path.exists(json_path):
            logger.error(f"Career roles file not found at {json_path}")
            return

        with open(json_path, "r", encoding="utf-8") as f:
            careers = json.load(f)

        logger.info(f"Seeding {len(careers)} benchmark career roles into MongoDB...")
        success = CareerModel.seed_careers(careers)
        if success:
            logger.info("Database seeding completed successfully!")
        else:
            logger.error("Failed to seed database.")

if __name__ == "__main__":
    seed_database()
