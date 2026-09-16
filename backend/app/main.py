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

    # Auto-seed initial admin and demo data if relational DB contains 0 users
    try:
        from app.db.database import AsyncSessionLocal
        from app.db.models import User, PlatformUser, UserRole
        from sqlalchemy import select, func
        async with AsyncSessionLocal() as session:
            teacher_count = (await session.execute(select(func.count(User.id)).where(User.role == UserRole.TEACHER))).scalar() or 0
            student_count = (await session.execute(select(func.count(User.id)).where(User.role == UserRole.STUDENT))).scalar() or 0
            if teacher_count < 65 or student_count < 400:
                logger.info(f"Database contains only {teacher_count} teachers and {student_count} students. Executing full school auto-seed (65 teachers, 500 students)...")
                try:
                    from seed_school import seed as school_seed
                    await school_seed(drop=False)
                    logger.info("School auto-seed completed successfully!")
                except Exception as s_err:
                    logger.warning(f"seed_school error ({s_err}), falling back to seed_data...")
                    from seed_data import seed
                    await seed(drop_first=False)
                    logger.info("Fallback auto-seed completed.")
            else:
                # Also ensure PlatformUsers are seeded if missing
                plat_count = (await session.execute(select(func.count(PlatformUser.id)))).scalar()
                if plat_count == 0:
                    logger.info("PlatformUser table empty. Seeding platform users...")
                    from seed_data import DEFAULT_PWD
                    plat_super_admin = PlatformUser(
                        id="psa11111-1111-1111-1111-111111111111",
                        email="platformadmin@paperbuddy.erp",
                        full_name="Platform Super Admin",
                        password_hash=DEFAULT_PWD,
                        platform_role="platform_super_admin"
                    )
                    plat_support = PlatformUser(
                        id="psup1111-1111-1111-1111-111111111111",
                        email="support@paperbuddy.erp",
                        full_name="Platform Support Agent",
                        password_hash=DEFAULT_PWD,
                        platform_role="platform_support"
                    )
                    session.add_all([plat_super_admin, plat_support])
                    await session.commit()
                    logger.info("Platform users seeded successfully!")
    except Exception as seed_err:
        logger.warning(f"Auto-seed check/execution notice: {seed_err}")
    
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
    allow_origin_regex=r"https?://.*",
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
