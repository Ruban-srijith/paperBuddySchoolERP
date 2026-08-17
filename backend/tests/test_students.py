"""
test_students.py — Student Management Flow Tests
=================================================
Tests covered:
  - GET  /students              (list, admin-only, class filter)
  - POST /students/bulk-onboard (Strategy A: Range, Strategy B: CSV)
  - PUT  /students/assign-class (bulk class assignment)

Button flow equivalent:
  [Add Students Button] → range generator → bulk created
  [Import CSV Button]   → CSV upload → parsed & created
  [Assign Class Button] → student IDs + class_id → updated
  [View Students Button] → list with class filter
"""
import pytest
import io
import uuid
from httpx import AsyncClient

from tests.conftest import make_user, auth_header
from app.db.models import UserRole, Class, Student
from sqlalchemy.ext.asyncio import AsyncSession


async def _create_class(session: AsyncSession) -> Class:
    cls = Class(
        id=str(uuid.uuid4()),
        grade="10",
        section="A",
        school_id="school-001",
    )
    session.add(cls)
    await session.commit()
    await session.refresh(cls)
    return cls


async def _create_student(session: AsyncSession, class_id: str = None) -> Student:
    user = await make_user(session, role=UserRole.STUDENT)
    stu = Student(
        id=str(uuid.uuid4()),
        user_id=user.id,
        admission_number=f"ADM-{uuid.uuid4().hex[:6].upper()}",
        full_name=user.full_name,
        class_id=class_id,
    )
    session.add(stu)
    await session.commit()
    await session.refresh(stu)
    return stu


@pytest.mark.asyncio
class TestListStudents:
    async def test_admin_can_list_students(self, client: AsyncClient, admin_user, db_session):
        """Admin can list all students."""
        await _create_student(db_session)
        resp = await client.get("/api/v1/students", headers=auth_header(admin_user))
        assert resp.status_code == 200
        assert isinstance(resp.json(), list)

    async def test_student_cannot_list_students(self, client: AsyncClient, student_user):
        """Students are not allowed to list all student accounts."""
        resp = await client.get("/api/v1/students", headers=auth_header(student_user))
        assert resp.status_code in (403, 401)

    async def test_teacher_can_list_students(self, client: AsyncClient, teacher_user, db_session):
        """Teachers can list students (they need this for their class)."""
        resp = await client.get("/api/v1/students", headers=auth_header(teacher_user))
        assert resp.status_code == 200

    async def test_list_students_filtered_by_class(self, client: AsyncClient, admin_user, db_session):
        """Filtering by class_id should return only students of that class."""
        cls = await _create_class(db_session)
        await _create_student(db_session, class_id=cls.id)
        resp = await client.get(f"/api/v1/students?class_id={cls.id}", headers=auth_header(admin_user))
        assert resp.status_code == 200
        data = resp.json()
        for s in data:
            assert s["class_id"] == cls.id

    async def test_list_students_unauthenticated(self, client: AsyncClient):
        """Unauthenticated access should return 401."""
        resp = await client.get("/api/v1/students")
        assert resp.status_code == 401


@pytest.mark.asyncio
class TestBulkOnboardRange:
    async def test_range_onboard_success(self, client: AsyncClient, admin_user, db_session):
        """Admin can onboard students using the sequential range strategy."""
        cls = await _create_class(db_session)
        resp = await client.post(
            "/api/v1/students/bulk-onboard",
            data={
                "class_id": cls.id,
                "start_number": "1",
                "end_number": "5",
                "prefix": "TEST-",
                "default_password": "Student@123",
            },
            headers=auth_header(admin_user),
        )
        assert resp.status_code == 200
        data = resp.json()
        assert data["created_count"] == 5
        assert data["strategy"] == "range"

    async def test_range_missing_class_id(self, client: AsyncClient, admin_user):
        """Range strategy without class_id should return HTTP 400."""
        resp = await client.post(
            "/api/v1/students/bulk-onboard",
            data={"start_number": "1", "end_number": "5"},
            headers=auth_header(admin_user),
        )
        assert resp.status_code == 400

    async def test_range_start_greater_than_end(self, client: AsyncClient, admin_user, db_session):
        """start_number > end_number must return HTTP 400."""
        cls = await _create_class(db_session)
        resp = await client.post(
            "/api/v1/students/bulk-onboard",
            data={"class_id": cls.id, "start_number": "10", "end_number": "5"},
            headers=auth_header(admin_user),
        )
        assert resp.status_code == 400

    async def test_range_exceeds_1000_limit(self, client: AsyncClient, admin_user, db_session):
        """Requesting more than 1000 students per batch should be rejected."""
        cls = await _create_class(db_session)
        resp = await client.post(
            "/api/v1/students/bulk-onboard",
            data={"class_id": cls.id, "start_number": "1", "end_number": "1001"},
            headers=auth_header(admin_user),
        )
        assert resp.status_code == 400

    async def test_range_no_duplicate_emails_on_retry(self, client: AsyncClient, admin_user, db_session):
        """Re-running the same range must not crash — duplicates should be reported in errors."""
        cls = await _create_class(db_session)
        first = await client.post(
            "/api/v1/students/bulk-onboard",
            data={"class_id": cls.id, "start_number": "100", "end_number": "102", "prefix": "DUP-"},
            headers=auth_header(admin_user),
        )
        assert first.status_code == 200

        second = await client.post(
            "/api/v1/students/bulk-onboard",
            data={"class_id": cls.id, "start_number": "100", "end_number": "102", "prefix": "DUP-"},
            headers=auth_header(admin_user),
        )
        assert second.status_code == 200
        assert second.json()["created_count"] == 0  # all duplicates


@pytest.mark.asyncio
class TestBulkOnboardCSV:
    def _make_csv(self, rows: list) -> bytes:
        header = "full_name,email,admission_number,father_name,guardian_phone"
        lines = [header] + [",".join(r) for r in rows]
        return "\n".join(lines).encode()

    async def test_csv_upload_success(self, client: AsyncClient, admin_user, db_session):
        """Valid CSV upload should create students successfully."""
        csv_data = self._make_csv([
            ("Alice Smith", "alice.s@school.edu", "CSV-001", "John Smith", "9876543210"),
            ("Bob Jones",  "bob.j@school.edu",   "CSV-002", "Tom Jones",  "9123456780"),
        ])
        resp = await client.post(
            "/api/v1/students/bulk-onboard",
            files={"file": ("students.csv", io.BytesIO(csv_data), "text/csv")},
            headers=auth_header(admin_user),
        )
        assert resp.status_code == 200
        data = resp.json()
        assert data["strategy"] == "csv_excel"
        assert data["created_count"] == 2

    async def test_csv_missing_required_fields(self, client: AsyncClient, admin_user, db_session):
        """CSV rows with missing required fields should produce errors, not a crash."""
        csv_data = b"full_name,email\nPartial Only,partial@school.edu"
        resp = await client.post(
            "/api/v1/students/bulk-onboard",
            files={"file": ("students.csv", io.BytesIO(csv_data), "text/csv")},
            headers=auth_header(admin_user),
        )
        assert resp.status_code == 200
        assert resp.json()["created_count"] == 0
        assert len(resp.json()["errors"]) > 0

    async def test_unsupported_file_format(self, client: AsyncClient, admin_user):
        """Uploading a .pdf file should return HTTP 400."""
        resp = await client.post(
            "/api/v1/students/bulk-onboard",
            files={"file": ("students.pdf", io.BytesIO(b"fake pdf"), "application/pdf")},
            headers=auth_header(admin_user),
        )
        assert resp.status_code == 400

    async def test_no_strategy_provided(self, client: AsyncClient, admin_user):
        """Sending neither file nor range params should return HTTP 400."""
        resp = await client.post(
            "/api/v1/students/bulk-onboard",
            data={"default_password": "Test@123"},
            headers=auth_header(admin_user),
        )
        assert resp.status_code == 400


@pytest.mark.asyncio
class TestAssignClass:
    async def test_assign_students_to_class(self, client: AsyncClient, admin_user, db_session):
        """Admin can bulk-assign students to a class."""
        cls = await _create_class(db_session)
        stu1 = await _create_student(db_session)
        stu2 = await _create_student(db_session)

        resp = await client.put(
            "/api/v1/students/assign-class",
            json={"student_ids": [stu1.id, stu2.id], "class_id": cls.id},
            headers=auth_header(admin_user),
        )
        assert resp.status_code == 200
        data = resp.json()
        assert data["updated_count"] == 2

    async def test_assign_nonexistent_students(self, client: AsyncClient, admin_user, db_session):
        """Assigning non-existent student IDs should return 404."""
        cls = await _create_class(db_session)
        resp = await client.put(
            "/api/v1/students/assign-class",
            json={"student_ids": ["ghost-id-1", "ghost-id-2"], "class_id": cls.id},
            headers=auth_header(admin_user),
        )
        assert resp.status_code == 404

    async def test_assign_class_unauthorized(self, client: AsyncClient, student_user, db_session):
        """Students cannot assign classes — must return 403."""
        cls = await _create_class(db_session)
        resp = await client.put(
            "/api/v1/students/assign-class",
            json={"student_ids": ["any"], "class_id": cls.id},
            headers=auth_header(student_user),
        )
        assert resp.status_code in (403, 401)
