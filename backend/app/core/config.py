import os
from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    PROJECT_NAME: str = "PaperBuddy School Operations & ERP"
    API_V1_STR: str = "/api/v1"
    DATABASE_URL: str = os.getenv(
        "DATABASE_URL", 
        "postgresql+asyncpg://postgres:postgres@localhost:5432/school_erp"
    )
    # Fallback sqlite for quick testing when postgres is unavailable
    SQLITE_DATABASE_URL: str = "sqlite+aiosqlite:///./school_erp.db"

    # MongoDB Settings (Local MongoDB)
    MONGODB_URL: str = os.getenv("MONGODB_URL", "mongodb://localhost:27017")
    MONGODB_DB_NAME: str = os.getenv("MONGODB_DB_NAME", "paperbuddy_erp")

    # JWT Authentication Settings
    SECRET_KEY: str = os.getenv("SECRET_KEY", "paperbuddy-super-secret-key-change-in-production-2026")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 43200  # 30 days

    # Default password for seeded users
    DEFAULT_PASSWORD: str = "school@123"

    # Razorpay Keys
    RAZORPAY_KEY_ID: str = os.getenv("RAZORPAY_KEY_ID", "")
    RAZORPAY_KEY_SECRET: str = os.getenv("RAZORPAY_KEY_SECRET", "")

    # OpenRouter / OCR API Integration
    OPENROUTER_API_KEY: str = os.getenv("OPENROUTER_API_KEY", "")
    OCR_API_KEY: str = os.getenv("OCR_API_KEY", "")
    GEMINI_API_KEY: str = os.getenv("GEMINI_API_KEY", "")
    OPENROUTER_MODEL: str = os.getenv("OPENROUTER_MODEL", "qwen/qwen3-vl-32b-instruct")
    OPENROUTER_SITE_URL: str = os.getenv("OPENROUTER_SITE_URL", "https://paperbuddy.erp")
    OPENROUTER_APP_NAME: str = os.getenv("OPENROUTER_APP_NAME", "PaperBuddy School ERP")

    # CORS: comma-separated list of allowed origins
    # e.g. ALLOWED_ORIGINS="https://app.paperbuddy.in,https://admin.paperbuddy.in"
    ALLOWED_ORIGINS: str = os.getenv("ALLOWED_ORIGINS", "http://localhost:3000")

    def get_cors_origins(self) -> list[str]:
        """Parse ALLOWED_ORIGINS into a list, stripping whitespace."""
        return [origin.strip() for origin in self.ALLOWED_ORIGINS.split(",") if origin.strip()]

    
    model_config = SettingsConfigDict(
        env_file=".env",
        case_sensitive=True,
        extra="allow",
    )

settings = Settings()


