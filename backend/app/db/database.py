import os
import logging
from urllib.parse import urlparse, urlencode, parse_qs, urlunparse
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
from sqlalchemy.orm import declarative_base
from app.core.config import settings

logger = logging.getLogger("db")

# Parse and normalise the DATABASE_URL for asyncpg
db_url = (settings.DATABASE_URL or "").strip()
if not db_url:
    db_url = settings.SQLITE_DATABASE_URL

# Convert postgresql:// → postgresql+asyncpg://
if db_url.startswith("postgresql://"):
    db_url = db_url.replace("postgresql://", "postgresql+asyncpg://", 1)
elif db_url.startswith("postgres://"):
    db_url = db_url.replace("postgres://", "postgres+asyncpg://" if "postgres+asyncpg" in db_url else "postgresql+asyncpg://", 1)

is_sqlite = "sqlite" in db_url
is_postgres = "postgresql+asyncpg" in db_url

# asyncpg does not understand sslmode= or channel_binding= in the URL.
# Strip them out and pass ssl via connect_args instead.
connect_args = {}
ssl_required = False
if is_postgres:
    parsed = urlparse(db_url)
    qs = parse_qs(parsed.query, keep_blank_values=True)
    had_sslmode = qs.pop("sslmode", None)
    had_channel = qs.pop("channel_binding", None)
    if had_sslmode or had_channel:
        ssl_required = True
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

engine = create_async_engine(
    db_url,
    echo=False,
    future=True,
    connect_args=connect_args,
)

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
