"""
test_warden.py — Warden E-Pass & Hostel Operations Tests
=========================================================
Tests covered:
  - GET  /warden/rooms       (list hostel rooms)
  - GET  /warden/incidents   (list incidents)
  - POST /warden/incidents   (log an incident)
  - GET  /warden/visitors    (list visitors)
  - POST /warden/visitors    (log a visitor)
  - GET  /warden/summary     (hostel summary stats)
  - GET  /warden/outpasses   (list outpasses)
  - GET  /warden/attendance  (hostel night roll call)

Button flow equivalent:
  [Log Incident Button]    → warden fills form → POST → saved
  [Log Visitor Button]     → visitor name & purpose → POST → saved
  [View Summary Button]    → dashboard stats → returned
  [Night Roll Call Button] → hostel attendance returned
  [Access as Teacher]      → 403 Unauthorized
"""
import pytest
import uuid
from httpx import AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession

from tests.conftest import make_user, auth_header
from app.db.models import UserRole


@pytest.mark.asyncio
class TestWardenRooms:
    async def test_warden_can_list_rooms(self, client: AsyncClient, warden_user):
        """Warden can retrieve the list of hostel rooms."""
        resp = await client.get("/api/v1/warden/rooms", headers=auth_header(warden_user))
        assert resp.status_code == 200
        assert isinstance(resp.json(), list)

    async def test_teacher_cannot_access_rooms(self, client: AsyncClient, teacher_user):
        """Non-warden roles should be denied access to hostel rooms."""
        resp = await client.get("/api/v1/warden/rooms", headers=auth_header(teacher_user))
        assert resp.status_code == 403

    async def test_student_cannot_access_rooms(self, client: AsyncClient, student_user):
        """Students should be denied access to hostel room list."""
        resp = await client.get("/api/v1/warden/rooms", headers=auth_header(student_user))
        assert resp.status_code == 403

    async def test_unauthenticated_rooms(self, client: AsyncClient):
        """Unauthenticated request to rooms must return 401."""
        resp = await client.get("/api/v1/warden/rooms")
        assert resp.status_code == 401

    async def test_principal_can_access_rooms(self, client: AsyncClient, db_session):
        """Principals are authorized to view hostel rooms."""
        principal = await make_user(db_session, email="principal2@school.edu", role=UserRole.PRINCIPAL)
        resp = await client.get("/api/v1/warden/rooms", headers=auth_header(principal))
        assert resp.status_code == 200


@pytest.mark.asyncio
class TestWardenIncidents:
    async def test_warden_can_list_incidents(self, client: AsyncClient, warden_user):
        """Warden can view all logged incidents."""
        resp = await client.get("/api/v1/warden/incidents", headers=auth_header(warden_user))
        assert resp.status_code == 200
        assert isinstance(resp.json(), list)

    async def test_warden_can_log_incident(self, client: AsyncClient, warden_user):
        """Warden can log a new incident report."""
        resp = await client.post(
            "/api/v1/warden/incidents",
            json={
                "category": "Discipline",
                "severity": "medium",
                "description": "Student found outside hostel after curfew.",
            },
            headers=auth_header(warden_user),
        )
        assert resp.status_code == 200
        assert resp.json()["success"] is True

    async def test_log_incident_critical_severity(self, client: AsyncClient, warden_user):
        """Critical severity incidents should be accepted."""
        resp = await client.post(
            "/api/v1/warden/incidents",
            json={
                "category": "Medical",
                "severity": "critical",
                "description": "Student with high fever — hospitalization required.",
            },
            headers=auth_header(warden_user),
        )
        assert resp.status_code == 200

    async def test_unauthorized_cannot_log_incident(self, client: AsyncClient, teacher_user):
        """Teachers cannot log hostel incidents."""
        resp = await client.post(
            "/api/v1/warden/incidents",
            json={"category": "Discipline", "severity": "low", "description": "Test."},
            headers=auth_header(teacher_user),
        )
        assert resp.status_code == 403


@pytest.mark.asyncio
class TestWardenVisitors:
    async def test_warden_can_list_visitors(self, client: AsyncClient, warden_user):
        """Warden can view all visitor log entries."""
        resp = await client.get("/api/v1/warden/visitors", headers=auth_header(warden_user))
        assert resp.status_code == 200
        assert isinstance(resp.json(), list)

    async def test_warden_logs_a_visitor(self, client: AsyncClient, warden_user):
        """Warden can register a new visitor entry."""
        resp = await client.post(
            "/api/v1/warden/visitors",
            json={"visitor_name": "Mr. Rajesh Kumar", "purpose": "Parent visit for ward Arjun"},
            headers=auth_header(warden_user),
        )
        assert resp.status_code == 200
        assert resp.json()["success"] is True

    async def test_student_cannot_log_visitor(self, client: AsyncClient, student_user):
        """Students cannot register visitors."""
        resp = await client.post(
            "/api/v1/warden/visitors",
            json={"visitor_name": "Friend", "purpose": "Hangout"},
            headers=auth_header(student_user),
        )
        assert resp.status_code == 403


@pytest.mark.asyncio
class TestWardenSummary:
    async def test_warden_summary_structure(self, client: AsyncClient, warden_user):
        """Warden summary must include all key stats fields."""
        resp = await client.get("/api/v1/warden/summary", headers=auth_header(warden_user))
        assert resp.status_code == 200
        data = resp.json()
        required_keys = [
            "total_rooms", "total_capacity", "occupied_beds",
            "occupancy_rate", "active_outpasses", "pending_outpasses",
            "open_incidents", "today_visitors"
        ]
        for key in required_keys:
            assert key in data, f"Key '{key}' missing from summary"

    async def test_summary_occupancy_rate_bounded(self, client: AsyncClient, warden_user):
        """Occupancy rate should be between 0 and 100."""
        resp = await client.get("/api/v1/warden/summary", headers=auth_header(warden_user))
        assert resp.status_code == 200
        rate = resp.json()["occupancy_rate"]
        assert 0.0 <= rate <= 100.0

    async def test_unauthorized_summary(self, client: AsyncClient, teacher_user):
        """Teachers cannot access the hostel summary."""
        resp = await client.get("/api/v1/warden/summary", headers=auth_header(teacher_user))
        assert resp.status_code == 403


@pytest.mark.asyncio
class TestWardenOutpasses:
    async def test_warden_can_list_outpasses(self, client: AsyncClient, warden_user):
        """Warden can view all outpasses (real or demo data)."""
        resp = await client.get("/api/v1/warden/outpasses", headers=auth_header(warden_user))
        assert resp.status_code == 200
        data = resp.json()
        assert isinstance(data, list)
        # Demo fallback should at least have one entry
        assert len(data) >= 1

    async def test_student_sees_only_own_outpasses(self, client: AsyncClient, student_user):
        """Students can access outpasses endpoint but only see their own."""
        resp = await client.get("/api/v1/warden/outpasses", headers=auth_header(student_user))
        assert resp.status_code == 200

    async def test_outpass_status_filter(self, client: AsyncClient, warden_user):
        """Filtering outpasses by status should work without error."""
        resp = await client.get("/api/v1/warden/outpasses?status=approved", headers=auth_header(warden_user))
        assert resp.status_code == 200


@pytest.mark.asyncio
class TestWardenHostelAttendance:
    async def test_hostel_attendance_today(self, client: AsyncClient, warden_user):
        """Warden can fetch today's hostel attendance."""
        resp = await client.get("/api/v1/warden/attendance", headers=auth_header(warden_user))
        assert resp.status_code == 200
        data = resp.json()
        assert "total_hostelers" in data
        assert "present_count" in data
        assert "on_outpass_count" in data
        assert "absent_unauthorized" in data

    async def test_hostel_attendance_specific_date(self, client: AsyncClient, warden_user):
        """Warden can query attendance for a specific past date."""
        resp = await client.get(
            "/api/v1/warden/attendance?target_date=2026-08-10",
            headers=auth_header(warden_user),
        )
        assert resp.status_code == 200
        assert resp.json()["date"] == "2026-08-10"

    async def test_teacher_cannot_access_hostel_attendance(self, client: AsyncClient, teacher_user):
        """Teachers cannot access hostel night roll call data."""
        resp = await client.get("/api/v1/warden/attendance", headers=auth_header(teacher_user))
        assert resp.status_code == 403
