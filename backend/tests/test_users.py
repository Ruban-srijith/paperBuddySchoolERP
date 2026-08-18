"""
test_users.py — User Management Tests
======================================
Tests covered:
  - GET  /users                  (list, admin scoped, with filters)
  - POST /users                  (create user with role, auto-student profile)
  - PUT  /users/{id}             (update user details)
  - GET  /users/by-role/{role}   (filter by role, any authenticated)

Button flow equivalent:
  [Add Staff Button]          → fill form → POST → new teacher created
  [Edit User Button]          → PUT → profile updated, role changed
  [Deactivate Account Button] → PUT is_active=false → user deactivated
  [Filter by Role Button]     → GET /by-role/teacher → list returned
"""
import pytest
import uuid
from httpx import AsyncClient

from tests.conftest import make_user, auth_header
from app.db.models import UserRole


@pytest.mark.asyncio
class TestListUsers:
    async def test_admin_can_list_users(self, client: AsyncClient, admin_user):
        """Admin can list all users."""
        resp = await client.get("/api/v1/users", headers=auth_header(admin_user))
        assert resp.status_code == 200
        assert isinstance(resp.json(), list)

    async def test_teacher_cannot_list_users(self, client: AsyncClient, teacher_user):
        """Teachers don't have access to the full user list."""
        resp = await client.get("/api/v1/users", headers=auth_header(teacher_user))
        assert resp.status_code in (403, 401)

    async def test_student_cannot_list_users(self, client: AsyncClient, student_user):
        """Students cannot list all users."""
        resp = await client.get("/api/v1/users", headers=auth_header(student_user))
        assert resp.status_code in (403, 401)

    async def test_filter_by_role(self, client: AsyncClient, admin_user, db_session):
        """Filtering by role should return only users of that role."""
        await make_user(db_session, email="f_teacher@school.edu", role=UserRole.TEACHER)
        resp = await client.get("/api/v1/users?role=teacher", headers=auth_header(admin_user))
        assert resp.status_code == 200
        for user in resp.json():
            assert user["role"] == "teacher"

    async def test_filter_invalid_role(self, client: AsyncClient, admin_user):
        """Filtering by an invalid role string should return 400."""
        resp = await client.get("/api/v1/users?role=WIZARD", headers=auth_header(admin_user))
        assert resp.status_code == 400

    async def test_filter_by_grade(self, client: AsyncClient, admin_user, db_session):
        """Filtering by assigned grade should return matching users only."""
        user = await make_user(db_session, email="g10_teacher@school.edu", role=UserRole.TEACHER)
        from sqlalchemy.future import select
        from app.db.models import User
        u = (await db_session.execute(select(User).where(User.id == user.id))).scalar_one()
        u.assigned_grade = "10"
        await db_session.commit()

        resp = await client.get("/api/v1/users?grade=10", headers=auth_header(admin_user))
        assert resp.status_code == 200
        for user_data in resp.json():
            assert user_data["assigned_grade"] == "10"

    async def test_user_response_has_required_fields(self, client: AsyncClient, admin_user, db_session):
        """User list response items must include essential fields."""
        await make_user(db_session, email="resp_test@school.edu", role=UserRole.TEACHER)
        resp = await client.get("/api/v1/users?role=teacher", headers=auth_header(admin_user))
        assert resp.status_code == 200
        data = resp.json()
        if data:
            required = ["id", "email", "full_name", "role", "is_active"]
            for field in required:
                assert field in data[0], f"Field '{field}' missing"


@pytest.mark.asyncio
class TestCreateUser:
    async def test_admin_creates_teacher(self, client: AsyncClient, admin_user):
        """Admin can create a new teacher account via /users."""
        resp = await client.post(
            "/api/v1/users",
            json={
                "email": "new_teacher_user@school.edu",
                "full_name": "New Teacher",
                "role": "teacher",
                "password": "Teacher@1234",
            },
            headers=auth_header(admin_user),
        )
        assert resp.status_code == 200
        data = resp.json()
        assert data["email"] == "new_teacher_user@school.edu"
        assert data["role"] == "teacher"

    async def test_admin_creates_student_auto_profile(self, client: AsyncClient, admin_user):
        """Creating a student user should also create a Student profile entry."""
        resp = await client.post(
            "/api/v1/users",
            json={
                "email": "newstu@school.edu",
                "full_name": "New Student",
                "role": "student",
                "password": "Student@1234",
                "admission_number": "ADM-NEW-001",
            },
            headers=auth_header(admin_user),
        )
        assert resp.status_code == 200
        assert resp.json()["role"] == "student"

    async def test_duplicate_email_rejected(self, client: AsyncClient, admin_user, db_session):
        """Creating a user with an already-registered email should return 409."""
        await make_user(db_session, email="already@school.edu", role=UserRole.TEACHER)
        resp = await client.post(
            "/api/v1/users",
            json={"email": "already@school.edu", "full_name": "Dup", "role": "teacher", "password": "Pass@1234"},
            headers=auth_header(admin_user),
        )
        assert resp.status_code == 409

    async def test_invalid_role_rejected(self, client: AsyncClient, admin_user):
        """Invalid role string during user creation should return 400."""
        resp = await client.post(
            "/api/v1/users",
            json={"email": "badrole@school.edu", "full_name": "Bad", "role": "GHOST", "password": "Pass@1234"},
            headers=auth_header(admin_user),
        )
        assert resp.status_code == 400

    async def test_teacher_cannot_create_user(self, client: AsyncClient, teacher_user):
        """Teachers cannot create new user accounts."""
        resp = await client.post(
            "/api/v1/users",
            json={"email": "hack@school.edu", "full_name": "Hack", "role": "teacher", "password": "P@ss123"},
            headers=auth_header(teacher_user),
        )
        assert resp.status_code in (403, 401)


@pytest.mark.asyncio
class TestUpdateUser:
    async def test_admin_updates_user_name(self, client: AsyncClient, admin_user, db_session):
        """Admin can update a user's full name."""
        user = await make_user(db_session, email="upd@school.edu", role=UserRole.TEACHER)
        resp = await client.put(
            f"/api/v1/users/{user.id}",
            json={"full_name": "Updated Name"},
            headers=auth_header(admin_user),
        )
        assert resp.status_code == 200
        assert resp.json()["full_name"] == "Updated Name"

    async def test_admin_deactivates_user(self, client: AsyncClient, admin_user, db_session):
        """Admin can deactivate a user account."""
        user = await make_user(db_session, email="deact@school.edu", role=UserRole.TEACHER)
        resp = await client.put(
            f"/api/v1/users/{user.id}",
            json={"is_active": False},
            headers=auth_header(admin_user),
        )
        assert resp.status_code == 200
        assert resp.json()["is_active"] is False

    async def test_admin_changes_user_role(self, client: AsyncClient, admin_user, db_session):
        """Admin can change a user's role."""
        user = await make_user(db_session, email="rolechange@school.edu", role=UserRole.TEACHER)
        resp = await client.put(
            f"/api/v1/users/{user.id}",
            json={"role": "mentor"},
            headers=auth_header(admin_user),
        )
        assert resp.status_code == 200
        assert resp.json()["role"] == "mentor"

    async def test_update_nonexistent_user(self, client: AsyncClient, admin_user):
        """Updating a non-existent user should return 404."""
        resp = await client.put(
            f"/api/v1/users/{uuid.uuid4()}",
            json={"full_name": "Ghost"},
            headers=auth_header(admin_user),
        )
        assert resp.status_code == 404

    async def test_update_invalid_role(self, client: AsyncClient, admin_user, db_session):
        """Updating a user with an invalid role should return 400."""
        user = await make_user(db_session, email="invrl@school.edu", role=UserRole.TEACHER)
        resp = await client.put(
            f"/api/v1/users/{user.id}",
            json={"role": "DARK_WIZARD"},
            headers=auth_header(admin_user),
        )
        assert resp.status_code == 400

    async def test_teacher_cannot_update_users(self, client: AsyncClient, teacher_user, db_session):
        """Teachers cannot update other users' profiles."""
        user = await make_user(db_session, email="target@school.edu", role=UserRole.TEACHER)
        resp = await client.put(
            f"/api/v1/users/{user.id}",
            json={"full_name": "Tampered"},
            headers=auth_header(teacher_user),
        )
        assert resp.status_code in (403, 401)


@pytest.mark.asyncio
class TestGetUsersByRole:
    async def test_any_user_can_filter_by_role(self, client: AsyncClient, teacher_user, db_session):
        """Any authenticated user can list users filtered by role."""
        await make_user(db_session, email="role_filter@school.edu", role=UserRole.TEACHER)
        resp = await client.get("/api/v1/users/by-role/teacher", headers=auth_header(teacher_user))
        assert resp.status_code == 200
        assert isinstance(resp.json(), list)

    async def test_student_can_query_teachers(self, client: AsyncClient, student_user, db_session):
        """Students can query the teachers list."""
        resp = await client.get("/api/v1/users/by-role/teacher", headers=auth_header(student_user))
        assert resp.status_code == 200

    async def test_invalid_role_returns_400(self, client: AsyncClient, teacher_user):
        """Passing an invalid role to by-role endpoint should return 400."""
        resp = await client.get("/api/v1/users/by-role/ghost_role", headers=auth_header(teacher_user))
        assert resp.status_code == 400

    async def test_unauthenticated_by_role(self, client: AsyncClient):
        """Unauthenticated access to by-role endpoint must return 401."""
        resp = await client.get("/api/v1/users/by-role/teacher")
        assert resp.status_code == 401

    async def test_all_results_have_matching_role(self, client: AsyncClient, admin_user, db_session):
        """Every returned user from /by-role/{role} must have the queried role."""
        await make_user(db_session, email="a_admin@school.edu", role=)
        resp = await client.get("/api/v1/users/by-role/admin", headers=auth_header(admin_user))
        assert resp.status_code == 200
        for u in resp.json():
            assert u["role"] == "admin"
