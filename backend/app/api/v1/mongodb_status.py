"""
MongoDB Inspection and Health Router.
Provides endpoints for monitoring local MongoDB collections, document counts, and live data.
"""

from typing import Dict, Any, List
from fastapi import APIRouter, Depends, HTTPException
from app.db.mongo import get_async_mongo_db, ping_mongodb
from app.core.config import settings

router = APIRouter(prefix="/mongo", tags=["MongoDB Local Operations"])

@router.get("/status")
async def get_mongo_status(db = Depends(get_async_mongo_db)):
    """Return local MongoDB connection state, collections, and document counts."""
    is_connected = await ping_mongodb()
    if not is_connected:
        return {
            "status": "disconnected",
            "url": settings.MONGODB_URL,
            "database": settings.MONGODB_DB_NAME,
            "collections": []
        }
    
    collection_names = await db.list_collection_names()
    collection_stats = []
    
    for name in collection_names:
        count = await db[name].count_documents({})
        collection_stats.append({
            "collection": name,
            "count": count
        })
    
    return {
        "status": "connected",
        "url": settings.MONGODB_URL,
        "database": settings.MONGODB_DB_NAME,
        "total_collections": len(collection_names),
        "collections": collection_stats
    }

@router.get("/collections/{collection_name}")
async def get_collection_documents(
    collection_name: str,
    limit: int = 50,
    db = Depends(get_async_mongo_db)
):
    """Retrieve documents from a specific MongoDB collection."""
    if collection_name not in await db.list_collection_names():
        raise HTTPException(status_code=404, detail=f"Collection '{collection_name}' not found")
    
    cursor = db[collection_name].find({}).limit(limit)
    docs = []
    async for doc in cursor:
        doc["_id"] = str(doc["_id"])
        docs.append(doc)
    
    return {
        "collection": collection_name,
        "count": len(docs),
        "documents": docs
    }
