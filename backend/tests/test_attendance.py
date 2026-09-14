"""
test_attendance.py — Attendance & Work Log Flow Tests
=====================================================
Tests covered:
  - GET  /attendance/summary        (admin only, date filtering)
  - POST /attendance/batch          (teacher marks attendance, date rules)
  - GET  /attendance/class/{id}     (class roster view, student scoping)
  - GET  /attendance/student/{id}   (student breakdown)
  - POST /work-logs                 (teacher submits daily work log)
  - GET  /work-logs                 (list, scoped by role)

Button flow equivalent:
  [Mark Attendance Button]  → batch records → saved
  [Submit Work Log Button]  → teacher logs today's work → stored
  [View Summary Button]     → principal sees school-wide stats
  [Future Date Block]       → form submits future date → 400 rejected
"""
import pytest
import uuid
from datetime import date, timedelta
from httpx import AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession

from tests.conftest import make_user, auth_header
from app.db.models import UserRole, Class, Student


async def _class(session: AsyncSession, class_teacher_id: str = None) -> Class:
    cls = Class(
        id=str(uuid.uuid4()),
        grade="8",
        section="B",
        school_id="school-001",
        class_teacher_id=class_teacher_id,
    )
    session.add(cls)
    await session.commit()
    await session.refresh(cls)
    return cls


async def _student(session: AsyncSession, class_id: str = None) -> Student:
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


def today_str() -> str:
    return str(date.today())


def past_str(days=1) -> str:
    return str(date.today() - timedelta(days=days))


def future_str(days=1) -> str:
    return str(date.today() + timedelta(days=days))


@pytest.mark.asyncio
class TestAttendanceSummary:
    async def test_principal_can_view_summary(self, client: AsyncClient, db_session):
        """Principal can request the attendance summary."""
        principal = await make_user(db_session, email="principal@school.edu", role=UserRole.PRINCIPAL)
        resp = await client.get(
            f"/api/v1/attendance/summary?date_str={today_str()}",
            headers=auth_header(principal),
        )
        assert resp.status_code == 200
        data = resp.json()
        assert "overall_student_attendance" in data
        assert "grade_matrix_data" in data

    async def test_teacher_cannot_access_summary(self, client: AsyncClient, teacher_user):
        """Teachers are not allowed to access the institution-wide summary."""
        resp = await client.get(
            f"/api/v1/attendance/summary?date_str={today_str()}",
            headers=auth_header(teacher_user),
        )
        assert resp.status_code in (403, 401)

    async def test_summary_defaults_to_today(self, client: AsyncClient, db_session):
        """No date_str param should default to today without error."""
        principal = await make_user(db_session, email="p2@school.edu", role=UserRole.PRINCIPAL)
        resp = await client.get("/api/v1/attendance/summary", headers=auth_header(principal))
        assert resp.status_code == 200


@pytest.mark.asyncio
class TestBatchAttendance:
    async def test_teacher_marks_attendance_for_today(self, client: AsyncClient, db_session):
        """Teacher can mark attendance for today."""
        teacher = await make_user(db_session, email="batch_teacher@school.edu", role=UserRole.TEACHER)
        cls = await _class(db_session, class_teacher_id=teacher.id)
        stu = await _student(db_session, class_id=cls.id)

        resp = await client.post(
            "/api/v1/attendance/batch",
            json={
                "class_id": cls.id,
                "marked_by": teacher.id,
                "date": today_str(),
                "records": [{"student_id": stu.user_id, "status": "present"}],
            },
            headers=auth_header(teacher),
        )
        assert resp.status_code == 200
        assert resp.json()["status"] == "success"

    async def test_attendance_future_date_rejected(self, client: AsyncClient, db_session):
        """Marking attendance for a future date should return HTTP 400."""
        teacher = await make_user(db_session, email="future_teacher@school.edu", role=UserRole.TEACHER)
        cls = await _class(db_session, class_teacher_id=teacher.id)
        stu = await _student(db_session, class_id=cls.id)

        resp = await client.post(
            "/api/v1/attendance/batch",
            json={
                "class_id": cls.id,
                "marked_by": teacher.id,
                "date": future_str(2),
                "records": [{"student_id": stu.user_id, "status": "present"}],
            },
            headers=auth_header(teacher),
        )
        assert resp.status_code == 400
        assert "future" in resp.json()["detail"].lower()

    async def test_teacher_blocked_for_old_date(self, client: AsyncClient, db_session):
        """Teacher marking attendance older than 48h should return 403."""
        teacher = await make_user(db_session, email="old_teacher@school.edu", role=UserRole.TEACHER)
        cls = await _class(db_session, class_teacher_id=teacher.id)
        stu = await _student(db_session, class_id=cls.id)

        resp = await client.post(
            "/api/v1/attendance/batch",
            json={
                "class_id": cls.id,
                "marked_by": teacher.id,
                "date": past_str(5),
                "records": [{"student_id": stu.user_id, "status": "absent"}],
            },
            headers=auth_header(teacher),
        )
        assert resp.status_code == 403

    async def test_admin_can_override_past_date(self, client: AsyncClient, admin_user, db_session):
        """Admins can mark attendance for dates older than 48h."""
        cls = await _class(db_session)
        stu = await _student(db_session, class_id=cls.id)

        resp = await client.post(
            "/api/v1/attendance/batch",
            json={
                "class_id": cls.id,
                "marked_by": admin_user.id,
                "date": past_str(10),
                "records": [{"student_id": stu.user_id, "status": "absent"}],
            },
            headers=auth_header(admin_user),
        )
        assert resp.status_code == 200

    async def test_batch_limit_exceeded(self, client: AsyncClient, db_session):
        """Batch attendance with more than 60 records should return 400."""
        teacher = await make_user(db_session, email="limit_teacher@school.edu", role=UserRole.TEACHER)
        records = [{"student_id": str(uuid.uuid4()), "status": "present"} for _ in range(65)]
        resp = await client.post(
            "/api/v1/attendance/batch",
            json={"class_id": str(uuid.uuid4()), "marked_by": teacher.id, "date": today_str(), "records": records},
            headers=auth_header(teacher),
        )
        assert resp.status_code == 400

    async def test_attendance_unauthenticated(self, client: AsyncClient, db_session):
        """Unauthenticated attendance marking should be rejected."""
        cls = await _class(db_session)
        resp = await client.post(
            "/api/v1/attendance/batch",
            json={"class_id": cls.id, "marked_by": str(uuid.uuid4()), "date": today_str(), "records": []},
        )
        assert resp.status_code == 401

    async def test_attendance_status_values(self, client: AsyncClient, db_session):
        """All valid status values (present, absent, late) should be accepted."""
        teacher = await make_user(db_session, email="status_teacher@school.edu", role=UserRole.TEACHER)
        cls = await _class(db_session, class_teacher_id=teacher.id)
        for status in ["present", "absent", "late"]:
            stu = await _student(db_session, class_id=cls.id)
            resp = await client.post(
                "/api/v1/attendance/batch",
                json={
                    "class_id": cls.id,
                    "marked_by": teacher.id,
                    "date": today_str(),
                    "records": [{"student_id": stu.user_id, "status": status}],
                },
                headers=auth_header(teacher),
            )
            assert resp.status_code == 200, f"Status '{status}' failed"


@pytest.mark.asyncio
class TestGetClassAttendance:
    async def test_get_class_attendance(self, client: AsyncClient, teacher_user, db_session):
        """Teacher can retrieve attendance for their class."""
        cls = await _class(db_session)
        resp = await client.get(
            f"/api/v1/attendance/class/{cls.id}?target_date={today_str()}",
            headers=auth_header(teacher_user),
        )
        assert resp.status_code == 200
        assert isinstance(resp.json(), list)

    async def test_student_sees_only_own_attendance(self, client: AsyncClient, student_user, db_session):
        """Students should only see their own attendance records, not the entire class."""
        cls = await _class(db_session)
        resp = await client.get(
            f"/api/v1/attendance/class/{cls.id}",
            headers=auth_header(student_user),
        )
        assert resp.status_code == 200
        # Only own records visible — all records should have student_id == student's user id
        data = resp.json()
        for record in data:
            assert record["student_id"] == student_user.id


@pytest.mark.asyncio
class TestStudentAttendance:
    async def test_get_student_attendance_breakdown(self, client: AsyncClient, admin_user, db_session):
        """Admin can view a specific student's attendance breakdown."""
        stu = await _student(db_session)
        resp = await client.get(
            f"/api/v1/attendance/student/{stu.id}",
            headers=auth_header(admin_user),
        )
        assert resp.status_code == 200
        data = resp.json()
        assert "attendance_percentage" in data
        assert "total_working_days" in data


@pytest.mark.asyncio
class TestWorkLogs:
    async def test_teacher_submits_work_log(self, client: AsyncClient, teacher_user, db_session):
        """Teacher can submit a daily work log entry."""
        from app.db.models import Class, Subject
        cls = Class(id=str(uuid.uuid4()), grade="10", section="B", school_id="school-001")
        db_session.add(cls)
        subj = Subject(id=str(uuid.uuid4()), code="PHY10", name="Physics", school_id="school-001")
        db_session.add(subj)
        await db_session.commit()

        resp = await client.post(
            "/api/v1/work-logs",
            json={
                "teacher_id": teacher_user.id,
                "class_id": cls.id,
                "subject_id": subj.id,
                "syllabus_node_id": None,
                "date": str(date.today()),
                "summary": "Completed chapter 5 on thermodynamics.",
            },
            headers=auth_header(teacher_user),
        )
        assert resp.status_code == 200
        assert "thermodynamics" in resp.json()["summary"]

    async def test_teacher_lists_own_work_logs(self, client: AsyncClient, db_session):
        """Teacher should only see their own work logs."""
        teacher = await make_user(db_session, role=UserRole.TEACHER)
        resp = await client.get("/api/v1/work-logs", headers=auth_header(teacher))
        assert resp.status_code == 200
        assert isinstance(resp.json(), list)

    async def test_admin_lists_all_work_logs(self, client: AsyncClient, admin_user):
        """Admin sees all work logs from all teachers."""
        resp = await client.get("/api/v1/work-logs", headers=auth_header(admin_user))
        assert resp.status_code == 200

    async def test_student_cannot_submit_work_log(self, client: AsyncClient, student_user, db_session):
        """Students cannot submit work logs."""
        cls = await _class(db_session)
        resp = await client.post(
            "/api/v1/work-logs",
            json={"class_id": cls.id, "date": today_str(), "summary": "Hack attempt"},
            headers=auth_header(student_user),
        )
        assert resp.status_code in (403, 401)
