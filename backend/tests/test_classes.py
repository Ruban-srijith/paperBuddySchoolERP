"""
test_classes.py — Class & Teacher Allotment Tests
==================================================
Tests covered:
  - GET  /classes           (list classes)
  - POST /classes           (create class)
  - PUT  /classes/{id}/assign (assign teacher to class)
  - DELETE /classes/{id}/assign (remove teacher from class)
  - GET  /classes/my-class  (teacher's own class)

Button flow equivalent:
  [Create Class Button]      → grade + section → POST → created
  [Duplicate Class Check]    → same grade+section → 400
  [Assign Teacher Button]    → class_id + teacher_id → PUT → teacher updated
  [Remove Teacher Button]    → DELETE → teacher unlinked
  [My Class Button]          → teacher sees own class
"""
import pytest
import uuid
from httpx import AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession

from tests.conftest import make_user, auth_header
from app.db.models import UserRole, Class


async def _class(session: AsyncSession, grade: str = "9", section: str = "A") -> Class:
    cls = Class(
        id=str(uuid.uuid4()),
        grade=grade,
        section=section,
        school_id="school-001",
    )
    session.add(cls)
    await session.commit()
    await session.refresh(cls)
    return cls


@pytest.mark.asyncio
class TestListClasses:
    async def test_list_classes_unauthenticated(self, client: AsyncClient):
        """Classes list should be accessible without authentication (public endpoint)."""
        resp = await client.get("/api/v1/classes")
        assert resp.status_code == 200
        assert isinstance(resp.json(), list)

    async def test_list_classes_authenticated(self, client: AsyncClient, teacher_user):
        """Authenticated teacher can list classes."""
        resp = await client.get("/api/v1/classes", headers=auth_header(teacher_user))
        assert resp.status_code == 200

    async def test_class_response_fields(self, client: AsyncClient, db_session):
        """Each class entry should have grade and section fields."""
        await _class(db_session, "5", "B")
        resp = await client.get("/api/v1/classes")
        assert resp.status_code == 200
        data = resp.json()
        if data:
            assert "grade" in data[0]
            assert "section" in data[0]
            assert "id" in data[0]


@pytest.mark.asyncio
class TestCreateClass:
    async def test_admin_creates_class(self, client: AsyncClient, admin_user):
        """Admin can create a new class."""
        resp = await client.post(
            "/api/v1/classes",
            json={"grade": "11", "section": "C"},
            headers=auth_header(admin_user),
        )
        assert resp.status_code == 200
        data = resp.json()
        assert data["grade"] == "11"
        assert data["section"] == "C"

    async def test_duplicate_class_rejected(self, client: AsyncClient, admin_user, db_session):
        """Creating a class with the same grade and section should return 400."""
        await _class(db_session, "12", "A")
        resp = await client.post(
            "/api/v1/classes",
            json={"grade": "12", "section": "A"},
            headers=auth_header(admin_user),
        )
        assert resp.status_code == 400

    async def test_teacher_cannot_create_class(self, client: AsyncClient, teacher_user):
        """Teachers cannot create new classes."""
        resp = await client.post(
            "/api/v1/classes",
            json={"grade": "7", "section": "D"},
            headers=auth_header(teacher_user),
        )
        assert resp.status_code in (403, 401)

    async def test_student_cannot_create_class(self, client: AsyncClient, student_user):
        """Students cannot create classes."""
        resp = await client.post(
            "/api/v1/classes",
            json={"grade": "5", "section": "Z"},
            headers=auth_header(student_user),
        )
        assert resp.status_code in (403, 401)

    async def test_principal_can_create_class(self, client: AsyncClient, db_session):
        """Principals have authority to create classes."""
        principal = await make_user(db_session, email="principal3@school.edu", role=UserRole.PRINCIPAL)
        resp = await client.post(
            "/api/v1/classes",
            json={"grade": "LKG", "section": "A"},
            headers=auth_header(principal),
        )
        assert resp.status_code == 200


@pytest.mark.asyncio
class TestAssignTeacher:
    async def test_assign_teacher_to_class(self, client: AsyncClient, admin_user, db_session):
        """Admin can assign a teacher as class teacher."""
        cls = await _class(db_session, "8", "C")
        teacher = await make_user(db_session, email=f"ct_{uuid.uuid4().hex[:4]}@school.edu", role=UserRole.TEACHER)

        resp = await client.put(
            f"/api/v1/classes/{cls.id}/assign",
            json={"teacher_id": teacher.id},
            headers=auth_header(admin_user),
        )
        assert resp.status_code == 200
        assert "assigned" in resp.json()["message"].lower()

    async def test_assign_to_nonexistent_class(self, client: AsyncClient, admin_user, db_session):
        """Assigning a teacher to a non-existent class should return 404."""
        teacher = await make_user(db_session, email=f"ct2_{uuid.uuid4().hex[:4]}@school.edu", role=UserRole.TEACHER)
        resp = await client.put(
            f"/api/v1/classes/{uuid.uuid4()}/assign",
            json={"teacher_id": teacher.id},
            headers=auth_header(admin_user),
        )
        assert resp.status_code == 404

    async def test_assign_nonexistent_teacher(self, client: AsyncClient, admin_user, db_session):
        """Assigning a non-existent user as class teacher should return 404."""
        cls = await _class(db_session, "8", "D")
        resp = await client.put(
            f"/api/v1/classes/{cls.id}/assign",
            json={"teacher_id": str(uuid.uuid4())},
            headers=auth_header(admin_user),
        )
        assert resp.status_code == 404

    async def test_teacher_cannot_assign_themselves(self, client: AsyncClient, teacher_user, db_session):
        """Teachers cannot assign themselves as class teacher."""
        cls = await _class(db_session, "9", "E")
        resp = await client.put(
            f"/api/v1/classes/{cls.id}/assign",
            json={"teacher_id": teacher_user.id},
            headers=auth_header(teacher_user),
        )
        assert resp.status_code in (403, 401)


@pytest.mark.asyncio
class TestRemoveTeacher:
    async def test_admin_can_unassign_class_teacher(self, client: AsyncClient, admin_user, db_session):
        """Admin can remove a teacher from a class."""
        cls = await _class(db_session, "10", "F")
        resp = await client.delete(
            f"/api/v1/classes/{cls.id}/assign",
            headers=auth_header(admin_user),
        )
        assert resp.status_code == 200
        assert "removed" in resp.json()["message"].lower()

    async def test_remove_from_nonexistent_class(self, client: AsyncClient, admin_user):
        """Removing teacher from non-existent class should return 404."""
        resp = await client.delete(
            f"/api/v1/classes/{uuid.uuid4()}/assign",
            headers=auth_header(admin_user),
        )
        assert resp.status_code == 404


@pytest.mark.asyncio
class TestMyClass:
    async def test_teacher_without_class_returns_404(self, client: AsyncClient, teacher_user):
        """Teacher not assigned as class teacher should get 404."""
        resp = await client.get("/api/v1/classes/my-class", headers=auth_header(teacher_user))
        assert resp.status_code == 404

    async def test_teacher_with_class_returns_class(self, client: AsyncClient, db_session):
        """Teacher assigned as class teacher can retrieve their class."""
        cls = await _class(db_session, "7", "G")
        teacher = await make_user(db_session, email=f"myt_{uuid.uuid4().hex[:4]}@school.edu", role=UserRole.TEACHER)

        # Manually set class_teacher_id
        from sqlalchemy.future import select
        from app.db.models import Class as ClassModel
        cls_res = await db_session.execute(select(ClassModel).where(ClassModel.id == cls.id))
        c = cls_res.scalar_one()
        c.class_teacher_id = teacher.id
        await db_session.commit()

        resp = await client.get("/api/v1/classes/my-class", headers=auth_header(teacher))
        assert resp.status_code == 200
        data = resp.json()
        assert data["grade"] == "7"
        assert data["section"] == "G"

    async def test_student_cannot_access_my_class(self, client: AsyncClient, student_user):
        """Students cannot access the teacher-scoped /my-class endpoint."""
        resp = await client.get("/api/v1/classes/my-class", headers=auth_header(student_user))
        assert resp.status_code in (403, 401)
