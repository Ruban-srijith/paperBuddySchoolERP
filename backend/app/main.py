import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.db.database import engine, Base
from app.db.mongo import ping_mongodb, get_async_mongo_db
from app.api.v1.router import api_router

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("main")

@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("Initializing relational database tables...")
    try:
        async with engine.begin() as conn:
            await conn.run_sync(Base.metadata.create_all)
        logger.info("Relational database initialized successfully.")
    except Exception as e:
        if "already exists" in str(e).lower() or "duplicate key" in str(e).lower():
            # Enum type already exists in PostgreSQL — tables are already set up
            logger.info("Database schema already exists — skipping creation.")
        else:
            logger.error(f"Database initialization error: {e}")
            raise
    
    if "neon" in str(engine.url).lower():
        logger.info("the neon db is connected to verify")
    
    # Initialize & verify MongoDB Local connection
    mongo_ok = await ping_mongodb()
    if mongo_ok:
        logger.info("MongoDB local database initialized and ready.")
    else:
        logger.warning("MongoDB local database connection could not be established.")

    allowed = settings.get_cors_origins()
    logger.info(f"CORS allowed origins: {allowed}")
    yield


app = FastAPI(
    title=settings.PROJECT_NAME,
    openapi_url=f"{settings.API_V1_STR}/openapi.json",
    lifespan=lifespan
)

# CORS middleware — support all local dev origins and production env
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:3001",
        "http://127.0.0.1:3001",
        "http://localhost:8000",
        "http://127.0.0.1:8000"
    ] + settings.get_cors_origins(),
    allow_origin_regex=r"https?://(localhost|127\.0\.0\.1|.*\.vercel\.app)(:\d+)?",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(api_router, prefix=settings.API_V1_STR)

@app.get("/")
async def root():
    return {
        "status": "online",
        "app": settings.PROJECT_NAME,
        "docs": "/docs",
        "version": "1.0.0"
    }
