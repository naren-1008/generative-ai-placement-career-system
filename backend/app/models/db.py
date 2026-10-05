import logging
from pymongo import MongoClient
from pymongo.errors import ConnectionFailure, ServerSelectionTimeoutError

logger = logging.getLogger(__name__)

client = None
db = None

def init_db(app):
    global client, db
    mongo_uri = app.config["MONGO_URI"]
    db_name = app.config["DB_NAME"]
    
    try:
        # 5 second timeout for server selection
        client = MongoClient(mongo_uri, serverSelectionTimeoutMS=5000)
        # Test connection
        client.admin.command('ping')
        db = client[db_name]
        logger.info(f"Successfully connected to MongoDB database: {db_name}")
    except (ConnectionFailure, ServerSelectionTimeoutError) as e:
        logger.warning(f"Could not connect to MongoDB at {mongo_uri}. Reason: {e}")
        logger.warning("Database operations will operate in fallback mode or throw handled exceptions.")
        client = None
        db = None

def get_db():
    global db
    return db

def is_db_connected():
    global client
    if client is None:
        return False
    try:
        client.admin.command('ping')
        return True
    except Exception:
        return False
