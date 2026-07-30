import os
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    PROJECT_NAME: str = "PaperBuddy School Operations & ERP"
    API_V1_STR: str = "/api/v1"
    DATABASE_URL: str = os.getenv(
        "DATABASE_URL", 
        "postgresql+asyncpg://postgres:postgres@localhost:5432/school_erp"
    )
    # Fallback sqlite for quick testing when postgres is unavailable
    SQLITE_DATABASE_URL: str = "sqlite+aiosqlite:///./school_erp.db"

    # JWT Authentication Settings
    SECRET_KEY: str = os.getenv("SECRET_KEY", "paperbuddy-super-secret-key-change-in-production-2026")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 480  # 8 hours

    # Default password for seeded users
    DEFAULT_PASSWORD: str = "school@123"
    
    class Config:
        case_sensitive = True

settings = Settings()

