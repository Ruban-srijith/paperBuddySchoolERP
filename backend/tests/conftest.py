"""
PaperBuddy School ERP — Pytest Configuration & Shared Fixtures
==============================================================
Sets up an in-memory SQLite test database, a test FastAPI client, and
JWT helpers so every test module can import pre-built fixtures.
"""
# ⚠️ MUST be set before any app imports so SQLAlchemy picks up SQLite
import os
os.environ.setdefault("DATABASE_URL", "sqlite+aiosqlite:///:memory:")
os.environ.setdefault("MONGODB_URL", "mongodb://localhost:27017")  # not used in tests

import pytest
import pytest_asyncio
import asyncio
import uuid
from typing import AsyncGenerator

from httpx import AsyncClient, ASGITransport
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
from sqlalchemy.pool import StaticPool

from app.main import app
from app.db.database import Base, get_db
from app.db.models import User, UserRole
from app.core.auth import hash_password, create_access_token

# ─── In-Memory SQLite Engine ─────────────────────────────────────────────────
TEST_DATABASE_URL = "sqlite+aiosqlite:///:memory:"

test_engine = create_async_engine(
    TEST_DATABASE_URL,
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)

TestSessionLocal = async_sessionmaker(
    bind=test_engine,
    expire_on_commit=False,
    class_=AsyncSession,
)


# ─── Event Loop ───────────────────────────────────────────────────────────────
@pytest.fixture(scope="session")
def event_loop():
    loop = asyncio.new_event_loop()
    yield loop
    loop.close()


# ─── DB Setup / Teardown ──────────────────────────────────────────────────────
@pytest_asyncio.fixture(scope="function")
async def db_session() -> AsyncGenerator[AsyncSession, None]:
    async with test_engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    async with TestSessionLocal() as session:
        yield session
    async with test_engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)


# ─── HTTPX client wired to the test DB ───────────────────────────────────────
@pytest_asyncio.fixture(scope="function")
async def client(db_session: AsyncSession) -> AsyncGenerator[AsyncClient, None]:
    async def override_get_db():
        yield db_session

    app.dependency_overrides[get_db] = override_get_db

    async with AsyncClient(
        transport=ASGITransport(app=app), base_url="http://test"
    ) as ac:
        yield ac

    app.dependency_overrides.clear()


# ─── Helper utilities ─────────────────────────────────────────────────────────
async def make_user(session: AsyncSession, **kwargs) -> User:
    user = User(
        id=str(uuid.uuid4()),
        email=kwargs.get("email", f"test_{uuid.uuid4().hex[:6]}@school.edu"),
        full_name=kwargs.get("full_name", "Test User"),
        role=kwargs.get("role", UserRole.TEACHER),
        password_hash=hash_password(kwargs.get("password", "Test@1234")),
        school_id=kwargs.get("school_id", "school-001"),
        is_active=kwargs.get("is_active", True),
    )
    session.add(user)
    await session.commit()
    await session.refresh(user)
    return user


def auth_header(user: User) -> dict:
    token = create_access_token(
        user_id=user.id,
        role=user.role.value,
        email=user.email,
        school_id=user.school_id,
    )
    return {"Authorization": f"Bearer {token}"}


# ─── Role Fixtures ────────────────────────────────────────────────────────────
@pytest_asyncio.fixture
async def super_admin(db_session):
    return await make_user(db_session, email="superadmin@school.edu", full_name="Super Admin", role=UserRole.SUPER_ADMIN)


@pytest_asyncio.fixture
async def admin_user(db_session):
    return await make_user(db_session, email="admin@school.edu", full_name="Admin User", role=UserRole.PRINCIPAL)


@pytest_asyncio.fixture
async def teacher_user(db_session):
    return await make_user(db_session, email="teacher@school.edu", full_name="Teacher User", role=UserRole.TEACHER)


@pytest_asyncio.fixture
async def student_user(db_session):
    return await make_user(db_session, email="student@school.edu", full_name="Student User", role=UserRole.STUDENT)


@pytest_asyncio.fixture
async def parent_user(db_session):
    return await make_user(db_session, email="parent@school.edu", full_name="Parent User", role=UserRole.STUDENT)


@pytest_asyncio.fixture
async def warden_user(db_session):
    return await make_user(db_session, email="warden@school.edu", full_name="Warden User", role=UserRole.WARDEN)
