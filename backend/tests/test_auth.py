"""
test_auth.py — Authentication Flow Tests
=========================================
Tests covered:
  - POST /auth/login  (success, wrong password, unknown email, inactive account)
  - GET  /auth/me     (authenticated, unauthenticated)
  - POST /auth/register (admin creates user, duplicate email, invalid role)
  - POST /auth/change-password (success, wrong current password)
  - PATCH /auth/me/profile-picture

Button flow equivalent:
  [Login Button] → valid creds → 200 + JWT token
  [Login Button] → invalid creds → 401
  [Register Button] → admin creates teacher → 200 + user profile
  [Change Password Button] → correct old pw → 200 success
"""
import pytest
import pytest_asyncio
from httpx import AsyncClient

from tests.conftest import make_user, auth_header
from app.db.models import UserRole


@pytest.mark.asyncio
class TestLoginFlow:
    async def test_login_success(self, client: AsyncClient, db_session):
        """User with correct credentials receives a JWT token."""
        user = await make_user(
            db_session,
            email="login_test@school.edu",
            password="Correct@Pass1",
            role=UserRole.TEACHER,
        )
        resp = await client.post(
            "/api/v1/auth/login",
            json={"email": "login_test@school.edu", "password": "Correct@Pass1"},
        )
        assert resp.status_code == 200
        data = resp.json()
        assert "access_token" in data
        assert data["email"] == "login_test@school.edu"
        assert data["role"] == "teacher"

    async def test_login_wrong_password(self, client: AsyncClient, db_session):
        """Wrong password should return HTTP 401."""
        await make_user(db_session, email="badpw@school.edu", password="Correct@Pass1", role=UserRole.TEACHER)
        resp = await client.post(
            "/api/v1/auth/login",
            json={"email": "badpw@school.edu", "password": "WrongPassword!"},
        )
        assert resp.status_code == 401
        assert "Invalid" in resp.json()["detail"]

    async def test_login_unknown_email(self, client: AsyncClient, db_session):
        """Login attempt with an email that doesn't exist should return 401."""
        resp = await client.post(
            "/api/v1/auth/login",
            json={"email": "ghost@school.edu", "password": "Any@1234"},
        )
        assert resp.status_code == 401

    async def test_login_inactive_account(self, client: AsyncClient, db_session):
        """Deactivated account should be blocked with HTTP 403."""
        await make_user(
            db_session,
            email="inactive@school.edu",
            password="Pass@1234",
            role=UserRole.TEACHER,
            is_active=False,
        )
        resp = await client.post(
            "/api/v1/auth/login",
            json={"email": "inactive@school.edu", "password": "Pass@1234"},
        )
        assert resp.status_code == 403
        assert "deactivated" in resp.json()["detail"].lower()

    async def test_login_returns_correct_role(self, client: AsyncClient, db_session):
        """Token response must carry the user's exact role."""
        await make_user(db_session, email="admin_login@school.edu", password="Admin@1234", role=)
        resp = await client.post(
            "/api/v1/auth/login",
            json={"email": "admin_login@school.edu", "password": "Admin@1234"},
        )
        assert resp.status_code == 200
        assert resp.json()["role"] == "admin"


@pytest.mark.asyncio
class TestGetMe:
    async def test_get_me_authenticated(self, client: AsyncClient, db_session):
        """Authenticated user can fetch their own profile."""
        user = await make_user(db_session, email="me_test@school.edu", role=UserRole.TEACHER)
        resp = await client.get("/api/v1/auth/me", headers=auth_header(user))
        assert resp.status_code == 200
        data = resp.json()
        assert data["email"] == "me_test@school.edu"
        assert data["role"] == "teacher"

    async def test_get_me_unauthenticated(self, client: AsyncClient):
        """Unauthenticated request to /me should return HTTP 401."""
        resp = await client.get("/api/v1/auth/me")
        assert resp.status_code == 401

    async def test_get_me_expired_token(self, client: AsyncClient):
        """Garbled / expired token should be rejected."""
        resp = await client.get(
            "/api/v1/auth/me",
            headers={"Authorization": "Bearer this.is.not.a.real.token"},
        )
        assert resp.status_code == 401


@pytest.mark.asyncio
class TestRegister:
    async def test_register_user_as_admin(self, client: AsyncClient, super_admin, db_session):
        """Super admin can create a new teacher account."""
        resp = await client.post(
            "/api/v1/auth/register",
            json={
                "email": "newteacher@school.edu",
                "full_name": "New Teacher",
                "role": "teacher",
                "password": "Teacher@1234",
            },
            headers=auth_header(super_admin),
        )
        assert resp.status_code == 200
        data = resp.json()
        assert data["email"] == "newteacher@school.edu"
        assert data["role"] == "teacher"

    async def test_register_duplicate_email(self, client: AsyncClient, super_admin, db_session):
        """Registering with an already-used email should return HTTP 409."""
        await make_user(db_session, email="dup@school.edu", role=UserRole.TEACHER)
        resp = await client.post(
            "/api/v1/auth/register",
            json={"email": "dup@school.edu", "full_name": "Dup", "role": "teacher", "password": "Pass@1234"},
            headers=auth_header(super_admin),
        )
        assert resp.status_code == 409

    async def test_register_invalid_role(self, client: AsyncClient, super_admin, db_session):
        """Invalid role string should return HTTP 400."""
        resp = await client.post(
            "/api/v1/auth/register",
            json={"email": "badrole@school.edu", "full_name": "Bad", "role": "GHOST_ROLE", "password": "Pass@1234"},
            headers=auth_header(super_admin),
        )
        assert resp.status_code == 400

    async def test_register_unauthorized_as_student(self, client: AsyncClient, student_user):
        """Students cannot register new users — must return 403."""
        resp = await client.post(
            "/api/v1/auth/register",
            json={"email": "hack@school.edu", "full_name": "Hacker", "role": "admin", "password": "Hack@1234"},
            headers=auth_header(student_user),
        )
        assert resp.status_code in (403, 401)


@pytest.mark.asyncio
class TestChangePassword:
    async def test_change_password_success(self, client: AsyncClient, db_session):
        """Users can change their own password with the correct current password."""
        user = await make_user(db_session, email="chpw@school.edu", password="Old@1234", role=UserRole.TEACHER)
        resp = await client.post(
            "/api/v1/auth/change-password",
            json={"current_password": "Old@1234", "new_password": "New@5678"},
            headers=auth_header(user),
        )
        assert resp.status_code == 200
        assert resp.json()["status"] == "success"

    async def test_change_password_wrong_current(self, client: AsyncClient, db_session):
        """Providing the wrong current password should return 401."""
        user = await make_user(db_session, email="chpw2@school.edu", password="Old@1234", role=UserRole.TEACHER)
        resp = await client.post(
            "/api/v1/auth/change-password",
            json={"current_password": "WRONG@pass", "new_password": "New@5678"},
            headers=auth_header(user),
        )
        assert resp.status_code == 401

    async def test_change_password_unauthenticated(self, client: AsyncClient):
        """Unauthenticated password change attempt must be rejected."""
        resp = await client.post(
            "/api/v1/auth/change-password",
            json={"current_password": "any", "new_password": "any"},
        )
        assert resp.status_code == 401


@pytest.mark.asyncio
class TestProfilePicture:
    async def test_update_profile_picture(self, client: AsyncClient, db_session):
        """User can update their own profile picture URL."""
        user = await make_user(db_session, email="pic@school.edu", role=UserRole.TEACHER)
        resp = await client.patch(
            "/api/v1/auth/me/profile-picture",
            json={"profile_picture": "https://cdn.school.edu/avatars/teacher1.jpg"},
            headers=auth_header(user),
        )
        assert resp.status_code == 200
        assert resp.json()["message"] == "Profile picture updated"
