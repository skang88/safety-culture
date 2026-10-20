import os
import logging
from motor.motor_asyncio import AsyncIOMotorClient

logger = logging.getLogger("safepulse.db")

MONGO_URI = os.getenv("MONGO_URI", "mongodb://localhost:27017/safepulse")
DB_NAME = os.getenv("DB_NAME", "safepulse")

class MongoDB:
    client: AsyncIOMotorClient = None
    db = None
    is_connected: bool = False

mongo_db = MongoDB()

async def connect_to_mongo():
    try:
        mongo_db.client = AsyncIOMotorClient(
            MONGO_URI,
            serverSelectionTimeoutMS=2500
        )
        mongo_db.db = mongo_db.client[DB_NAME]
        # 핑 테스트
        await mongo_db.client.admin.command('ping')
        mongo_db.is_connected = True
        logger.info(f"MongoDB 연결 성공: {MONGO_URI}")
    except Exception as e:
        mongo_db.is_connected = False
        logger.warning(f"MongoDB 연결 실패 (로컬 메모리 폴백 모드 작동): {e}")

async def close_mongo_connection():
    if mongo_db.client:
        mongo_db.client.close()
        logger.info("MongoDB 연결 종료")

def get_database():
    return mongo_db.db
