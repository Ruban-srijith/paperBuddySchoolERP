"""
test_departments.py — Department Management Tests
==================================================
Tests covered:
  - GET  /departments                         (list, any authenticated user)
  - POST /departments                         (create, admin only)
  - PUT  /departments/{id}                    (update)
  - DELETE /departments/{id}                  (delete)
  - GET  /departments/{id}/teachers           (list teachers in dept)
  - GET  /departments/{id}/subjects           (list subjects)
  - DELETE /departments/{id}/teachers/{tid}   (remove teacher from dept)

Button flow equivalent:
  [Create Department Button] → name + code → POST → created
  [Edit Department Button]   → PUT → updated
  [Delete Department Button] → DELETE → removed
  [View Teachers Button]     → list teachers by dept
"""
import pytest
import uuid
from httpx import AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession

from tests.conftest import make_user, auth_header
from app.db.models import UserRole, Department


async def _dept(session: AsyncSession, code: str = None) -> Department:
    d = Department(
        id=str(uuid.uuid4()),
        name=f"Dept {uuid.uuid4().hex[:4]}",
        code=code or f"D{uuid.uuid4().hex[:3].upper()}",
        school_id="school-001",
    )
    session.add(d)
    await session.commit()
    await session.refresh(d)
    return d


@pytest.mark.asyncio
class TestListDepartments:
    async def test_any_authenticated_user_can_list(self, client: AsyncClient, teacher_user):
        """Any authenticated user can view the department list."""
        resp = await client.get("/api/v1/departments", headers=auth_header(teacher_user))
        assert resp.status_code == 200
        assert isinstance(resp.json(), list)

    async def test_student_can_list_departments(self, client: AsyncClient, student_user):
        """Students can also list departments."""
        resp = await client.get("/api/v1/departments", headers=auth_header(student_user))
        assert resp.status_code == 200

    async def test_unauthenticated_cannot_list(self, client: AsyncClient):
        """Unauthenticated access to departments should return 401."""
        resp = await client.get("/api/v1/departments")
        assert resp.status_code == 401

    async def test_department_response_fields(self, client: AsyncClient, admin_user, db_session):
        """Department list items should contain the required fields."""
        await _dept(db_session)
        resp = await client.get("/api/v1/departments", headers=auth_header(admin_user))
        assert resp.status_code == 200
        data = resp.json()
        if data:
            required = ["id", "name", "code", "teacher_count"]
            for field in required:
                assert field in data[0], f"'{field}' missing from department response"


@pytest.mark.asyncio
class TestCreateDepartment:
    async def test_admin_creates_department(self, client: AsyncClient, admin_user):
        """Admin can create a new department."""
        resp = await client.post(
            "/api/v1/departments",
            json={"name": "Mathematics", "code": "MATH"},
            headers=auth_header(admin_user),
        )
        assert resp.status_code == 200
        data = resp.json()
        assert data["name"] == "Mathematics"
        assert data["code"] == "MATH"
        assert data["teacher_count"] == 0

    async def test_duplicate_department_code_rejected(self, client: AsyncClient, admin_user, db_session):
        """Creating two departments with the same code should return 409."""
        await _dept(db_session, code="SCI")
        resp = await client.post(
            "/api/v1/departments",
            json={"name": "Science Dupe", "code": "SCI"},
            headers=auth_header(admin_user),
        )
        assert resp.status_code == 409

    async def test_teacher_cannot_create_department(self, client: AsyncClient, teacher_user):
        """Teachers don't have permissions to create departments."""
        resp = await client.post(
            "/api/v1/departments",
            json={"name": "Illegal Dept", "code": "ILL"},
            headers=auth_header(teacher_user),
        )
        assert resp.status_code in (403, 401)

    async def test_student_cannot_create_department(self, client: AsyncClient, student_user):
        """Students cannot create departments."""
        resp = await client.post(
            "/api/v1/departments",
            json={"name": "Hack", "code": "HCK"},
            headers=auth_header(student_user),
        )
        assert resp.status_code in (403, 401)


@pytest.mark.asyncio
class TestUpdateDepartment:
    async def test_admin_can_update_department(self, client: AsyncClient, admin_user, db_session):
        """Admin can update department details."""
        dept = await _dept(db_session)
        resp = await client.put(
            f"/api/v1/departments/{dept.id}",
            json={"name": "Updated Math Dept"},
            headers=auth_header(admin_user),
        )
        assert resp.status_code == 200
        assert "updated" in resp.json()["message"].lower()

    async def test_update_nonexistent_dept(self, client: AsyncClient, admin_user):
        """Updating a non-existent department should return 404."""
        resp = await client.put(
            f"/api/v1/departments/{uuid.uuid4()}",
            json={"name": "Ghost"},
            headers=auth_header(admin_user),
        )
        assert resp.status_code == 404

    async def test_teacher_cannot_update_dept(self, client: AsyncClient, teacher_user, db_session):
        """Teachers cannot update department info."""
        dept = await _dept(db_session)
        resp = await client.put(
            f"/api/v1/departments/{dept.id}",
            json={"name": "Modified"},
            headers=auth_header(teacher_user),
        )
        assert resp.status_code in (403, 401)


@pytest.mark.asyncio
class TestDeleteDepartment:
    async def test_admin_can_delete_department(self, client: AsyncClient, admin_user, db_session):
        """Admin can delete a department."""
        dept = await _dept(db_session)
        resp = await client.delete(f"/api/v1/departments/{dept.id}", headers=auth_header(admin_user))
        assert resp.status_code == 200

    async def test_delete_nonexistent_dept(self, client: AsyncClient, admin_user):
        """Deleting a non-existent department should return 404."""
        resp = await client.delete(f"/api/v1/departments/{uuid.uuid4()}", headers=auth_header(admin_user))
        assert resp.status_code == 404

    async def test_student_cannot_delete_dept(self, client: AsyncClient, student_user, db_session):
        """Students cannot delete departments."""
        dept = await _dept(db_session)
        resp = await client.delete(f"/api/v1/departments/{dept.id}", headers=auth_header(student_user))
        assert resp.status_code in (403, 401)


@pytest.mark.asyncio
class TestDepartmentTeachers:
    async def test_list_teachers_in_department(self, client: AsyncClient, admin_user, db_session):
        """Admin can view teachers belonging to a specific department."""
        dept = await _dept(db_session)
        # Create a teacher in that department
        teacher = await make_user(
            db_session,
            email=f"dept_teacher_{uuid.uuid4().hex[:4]}@school.edu",
            role=UserRole.TEACHER,
        )
        # Assign department manually
        from sqlalchemy.future import select
        from app.db.models import User
        user_res = await db_session.execute(select(User).where(User.id == teacher.id))
        u = user_res.scalar_one()
        u.department_id = dept.id
        await db_session.commit()

        resp = await client.get(
            f"/api/v1/departments/{dept.id}/teachers",
            headers=auth_header(admin_user),
        )
        assert resp.status_code == 200
        data = resp.json()
        assert isinstance(data, list)
        assert any(t["id"] == teacher.id for t in data)

    async def test_list_teachers_empty_dept(self, client: AsyncClient, admin_user, db_session):
        """Department with no teachers should return empty list."""
        dept = await _dept(db_session)
        resp = await client.get(
            f"/api/v1/departments/{dept.id}/teachers",
            headers=auth_header(admin_user),
        )
        assert resp.status_code == 200
        assert resp.json() == []


@pytest.mark.asyncio
class TestDepartmentSubjects:
    async def test_list_subjects_for_department(self, client: AsyncClient, teacher_user, db_session):
        """Any authenticated user can list subjects of a department."""
        dept = await _dept(db_session)
        resp = await client.get(
            f"/api/v1/departments/{dept.id}/subjects",
            headers=auth_header(teacher_user),
        )
        assert resp.status_code == 200
        assert isinstance(resp.json(), list)
