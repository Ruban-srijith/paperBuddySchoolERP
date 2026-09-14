"""
test_approvals.py — Leave Request & Approval Workflow Tests
===========================================================
Tests covered:
  - POST /approvals/leave          (submit leave request)
  - GET  /approvals/leave          (list requests, scoped by role)
  - GET  /approvals/pending        (pending requests for principal)
  - POST /approvals/leave/{id}     (approve / reject — principal)

Button flow equivalent:
  [Apply Leave Button]    → teacher submits leave → status: pending
  [Approve Button]        → principal approves → status: approved
  [Reject Button]         → principal rejects → status: rejected
  [View My Leaves Button] → teacher sees own history
  [View All Leaves]       → principal sees all requests
"""
import pytest
import uuid
from datetime import date, timedelta
from httpx import AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession

from tests.conftest import make_user, auth_header
from app.db.models import UserRole, LeaveRequest


def future_date(days: int) -> str:
    return str(date.today() + timedelta(days=days))


async def _seed_leave(session: AsyncSession, applicant_id: str, status: str = "pending") -> LeaveRequest:
    leave = LeaveRequest(
        id=str(uuid.uuid4()),
        applicant_id=applicant_id,
        leave_type="Casual Leave",
        start_date=date.today() + timedelta(days=2),
        end_date=date.today() + timedelta(days=3),
        reason="Personal work",
        status=status,
    )
    session.add(leave)
    await session.commit()
    await session.refresh(leave)
    return leave


@pytest.mark.asyncio
class TestSubmitLeave:
    async def test_teacher_can_submit_leave(self, client: AsyncClient, teacher_user):
        """Teacher can submit a leave application."""
        resp = await client.post(
            "/api/v1/approvals/leave",
            json={
                "leave_type": "Casual Leave",
                "start_date": future_date(3),
                "end_date": future_date(4),
                "reason": "Family function",
            },
            headers=auth_header(teacher_user),
        )
        assert resp.status_code == 200
        data = resp.json()
        assert data["status"] == "pending"
        assert data["applicant_id"] == teacher_user.id
        assert data["leave_type"] == "Casual Leave"

    async def test_student_can_also_submit_leave(self, client: AsyncClient, student_user):
        """Students can also apply for leave through the same endpoint."""
        resp = await client.post(
            "/api/v1/approvals/leave",
            json={
                "leave_type": "Medical Leave",
                "start_date": future_date(1),
                "end_date": future_date(2),
                "reason": "Sick",
            },
            headers=auth_header(student_user),
        )
        assert resp.status_code == 200
        assert resp.json()["status"] == "pending"

    async def test_leave_requires_authentication(self, client: AsyncClient):
        """Unauthenticated leave submission should be rejected."""
        resp = await client.post(
            "/api/v1/approvals/leave",
            json={
                "leave_type": "Casual",
                "start_date": future_date(1),
                "end_date": future_date(2),
                "reason": "Test",
            },
        )
        assert resp.status_code == 401

    async def test_leave_response_has_required_fields(self, client: AsyncClient, teacher_user):
        """Leave response should include all mandatory fields."""
        resp = await client.post(
            "/api/v1/approvals/leave",
            json={
                "leave_type": "Sick Leave",
                "start_date": future_date(1),
                "end_date": future_date(1),
                "reason": "Headache",
            },
            headers=auth_header(teacher_user),
        )
        assert resp.status_code == 200
        data = resp.json()
        required = ["id", "applicant_id", "leave_type", "status", "start_date", "end_date"]
        for field in required:
            assert field in data, f"Field '{field}' missing from leave response"


@pytest.mark.asyncio
class TestListLeaveRequests:
    async def test_teacher_sees_only_own_requests(self, client: AsyncClient, teacher_user, db_session):
        """Teachers only see their own leave history."""
        await _seed_leave(db_session, teacher_user.id)
        other = await make_user(db_session, email="other_t@school.edu", role=UserRole.TEACHER)
        await _seed_leave(db_session, other.id)

        resp = await client.get("/api/v1/approvals/leave", headers=auth_header(teacher_user))
        assert resp.status_code == 200
        for leave in resp.json():
            assert leave["applicant_id"] == teacher_user.id

    async def test_principal_sees_all_requests(self, client: AsyncClient, db_session):
        """Principals can view all leave requests across the institution."""
        principal = await make_user(db_session, email="principal4@school.edu", role=UserRole.PRINCIPAL)
        teacher = await make_user(db_session, email="tleave@school.edu", role=UserRole.TEACHER)
        await _seed_leave(db_session, teacher.id)

        resp = await client.get("/api/v1/approvals/leave", headers=auth_header(principal))
        assert resp.status_code == 200
        data = resp.json()
        assert isinstance(data, list)
        assert len(data) >= 1

    async def test_pending_endpoint(self, client: AsyncClient, db_session):
        """GET /approvals/pending should return leave requests."""
        principal = await make_user(db_session, email="principal5@school.edu", role=UserRole.PRINCIPAL)
        resp = await client.get("/api/v1/approvals/pending", headers=auth_header(principal))
        assert resp.status_code == 200

    async def test_unauthenticated_list(self, client: AsyncClient):
        """Unauthenticated access to leave list must return 401."""
        resp = await client.get("/api/v1/approvals/leave")
        assert resp.status_code == 401


@pytest.mark.asyncio
class TestApproveLeave:
    async def test_principal_approves_leave(self, client: AsyncClient, db_session):
        """Principal can approve a pending leave request."""
        principal = await make_user(db_session, email="approver@school.edu", role=UserRole.PRINCIPAL)
        teacher = await make_user(db_session, email="leavee@school.edu", role=UserRole.TEACHER)
        leave = await _seed_leave(db_session, teacher.id, "pending")

        resp = await client.post(
            f"/api/v1/approvals/leave/{leave.id}",
            json={"status": "approved"},
            headers=auth_header(principal),
        )
        assert resp.status_code == 200
        data = resp.json()
        assert data["status"] == "approved"
        assert data["approved_by_name"] == principal.full_name

    async def test_principal_rejects_leave(self, client: AsyncClient, db_session):
        """Principal can reject a pending leave request."""
        principal = await make_user(db_session, email="rejecter@school.edu", role=UserRole.PRINCIPAL)
        teacher = await make_user(db_session, email="leavee2@school.edu", role=UserRole.TEACHER)
        leave = await _seed_leave(db_session, teacher.id, "pending")

        resp = await client.post(
            f"/api/v1/approvals/leave/{leave.id}",
            json={"status": "rejected"},
            headers=auth_header(principal),
        )
        assert resp.status_code == 200
        assert resp.json()["status"] == "rejected"

    async def test_teacher_cannot_approve_leave(self, client: AsyncClient, teacher_user, db_session):
        """Teachers cannot approve leave requests."""
        other = await make_user(db_session, email="tl2@school.edu", role=UserRole.TEACHER)
        leave = await _seed_leave(db_session, other.id)

        resp = await client.post(
            f"/api/v1/approvals/leave/{leave.id}",
            json={"status": "approved"},
            headers=auth_header(teacher_user),
        )
        assert resp.status_code in (403, 401)

    async def test_approve_nonexistent_leave(self, client: AsyncClient, db_session):
        """Approving a non-existent leave request should return 404."""
        principal = await make_user(db_session, email="principal6@school.edu", role=UserRole.PRINCIPAL)
        resp = await client.post(
            f"/api/v1/approvals/leave/{uuid.uuid4()}",
            json={"status": "approved"},
            headers=auth_header(principal),
        )
        assert resp.status_code == 404
