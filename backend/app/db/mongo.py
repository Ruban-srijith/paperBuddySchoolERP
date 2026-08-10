import logging
from typing import Generator, Any
from pymongo import MongoClient
from motor.motor_asyncio import AsyncIOMotorClient, AsyncIOMotorDatabase
from app.core.config import settings

logger = logging.getLogger("mongo")

# Async Motor Client (for async FastAPI endpoints and background tasks)
_async_client: AsyncIOMotorClient | None = None

# Sync PyMongo Client (for seed scripts and synchronous utilities)
_sync_client: MongoClient | None = None

def get_async_mongo_client() -> AsyncIOMotorClient:
    global _async_client
    if _async_client is None:
        _async_client = AsyncIOMotorClient(
            settings.MONGODB_URL,
            serverSelectionTimeoutMS=3000
        )
    return _async_client

def get_async_mongo_db() -> AsyncIOMotorDatabase:
    client = get_async_mongo_client()
    return client[settings.MONGODB_DB_NAME]

def get_sync_mongo_client() -> MongoClient:
    global _sync_client
    if _sync_client is None:
        _sync_client = MongoClient(
            settings.MONGODB_URL,
            serverSelectionTimeoutMS=3000
        )
    return _sync_client

def get_sync_mongo_db() -> Any:
    client = get_sync_mongo_client()
    return client[settings.MONGODB_DB_NAME]

async def get_mongo_db() -> AsyncIOMotorDatabase:
    """FastAPI dependency for injecting MongoDB async database."""
    return get_async_mongo_db()

async def ping_mongodb() -> bool:
    """Check connection to MongoDB local instance."""
    try:
        client = get_async_mongo_client()
        await client.admin.command('ping')
        logger.info("Successfully connected to MongoDB at %s (Database: %s)", settings.MONGODB_URL, settings.MONGODB_DB_NAME)
        return True
    except Exception as e:
        logger.warning("MongoDB ping failed on %s: %s", settings.MONGODB_URL, e)
        return False
