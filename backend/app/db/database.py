import os
import logging
from urllib.parse import urlparse, urlencode, parse_qs, urlunparse
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
from sqlalchemy.orm import declarative_base
from app.core.config import settings

logger = logging.getLogger("db")

def _build_engine(raw_url: str):
    db_url = (raw_url or "").strip().strip('"').strip("'")
    
    # Check if URL is invalid, empty, or placeholder text
    if not db_url or db_url.startswith("<") or not (db_url.startswith("postgres") or db_url.startswith("sqlite")):
        logger.warning(f"Invalid or unconfigured DATABASE_URL ('{raw_url}'). Falling back to SQLite.")
        db_url = settings.SQLITE_DATABASE_URL

    if db_url.startswith("postgresql://"):
        db_url = db_url.replace("postgresql://", "postgresql+asyncpg://", 1)
    elif db_url.startswith("postgres://"):
        db_url = db_url.replace("postgres://", "postgresql+asyncpg://", 1)

    is_sqlite = "sqlite" in db_url
    is_postgres = "postgresql+asyncpg" in db_url

    connect_args = {}
    if is_postgres:
        parsed = urlparse(db_url)
        qs = parse_qs(parsed.query, keep_blank_values=True)
        had_sslmode = qs.pop("sslmode", None)
        had_channel = qs.pop("channel_binding", None)
        ssl_required = bool(had_sslmode or had_channel)
        clean_query = urlencode({k: v[0] for k, v in qs.items()})
        db_url = urlunparse(parsed._replace(query=clean_query))
        if ssl_required:
            import ssl as _ssl
            ctx = _ssl.create_default_context()
            ctx.check_hostname = False
            ctx.verify_mode = _ssl.CERT_NONE
            connect_args = {"ssl": ctx}
    elif is_sqlite:
        connect_args = {"check_same_thread": False}

    try:
        return create_async_engine(
            db_url,
            echo=False,
            future=True,
            connect_args=connect_args,
        )
    except Exception as err:
        logger.error(f"Failed to create engine with URL '{db_url}': {err}. Falling back to SQLite.")
        return create_async_engine(
            settings.SQLITE_DATABASE_URL,
            echo=False,
            future=True,
            connect_args={"check_same_thread": False},
        )

engine = _build_engine(settings.DATABASE_URL)

AsyncSessionLocal = async_sessionmaker(
    bind=engine,
    class_=AsyncSession,
    expire_on_commit=False
)

Base = declarative_base()

async def get_db():
    async with AsyncSessionLocal() as session:
        try:
            yield session
        finally:
            await session.close()
