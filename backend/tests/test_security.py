"""
test_security.py — Security & Authorization Edge Case Tests
============================================================
Tests critical security boundaries — things that MUST never pass.
Covers:
  - RBAC enforcement across all role boundaries
  - JWT token tampering / expiry / malformed tokens
  - Cross-user data access attempts (IDOR prevention)
  - Privilege escalation attempts (student tries to become admin)
  - SQL injection patterns in path params
  - Batch size enforcement
  - Unauthenticated access to every protected endpoint

These tests verify that the ERP's security model is watertight
from a testing perspective.
"""
import pytest
import uuid
from datetime import date
from httpx import AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession

from tests.conftest import make_user, auth_header
from app.db.models import UserRole, FeePayment


# ─── Endpoints that must require authentication ─────────────────────────────
PROTECTED_GET_ENDPOINTS = [
    "/api/v1/auth/me",
    "/api/v1/users",
    "/api/v1/departments",
    "/api/v1/attendance/summary",
    "/api/v1/fees/receipts",
    "/api/v1/warden/rooms",
    "/api/v1/warden/incidents",
    "/api/v1/warden/visitors",
    "/api/v1/warden/summary",
    "/api/v1/warden/attendance",
    "/api/v1/approvals/leave",
]

PROTECTED_POST_ENDPOINTS = [
    ("/api/v1/auth/change-password", {"current_password": "a", "new_password": "b"}),
    ("/api/v1/attendance/batch", {"class_id": "x", "date": str(date.today()), "records": []}),
    ("/api/v1/fees/pay", {"title": "Fee", "amount": 100.0, "payment_method": "UPI"}),
    ("/api/v1/warden/incidents", {"category": "Test", "severity": "low", "description": "Test"}),
    ("/api/v1/warden/visitors", {"visitor_name": "Test", "purpose": "Test"}),
    ("/api/v1/approvals/leave", {"leave_type": "CL", "start_date": "2026-09-01", "end_date": "2026-09-02", "reason": "test"}),
]


@pytest.mark.asyncio
class TestUnauthenticatedAccess:
    @pytest.mark.parametrize("endpoint", PROTECTED_GET_ENDPOINTS)
    async def test_all_protected_get_endpoints_require_auth(self, client: AsyncClient, endpoint: str):
        """Every protected GET endpoint must return 401 without a token."""
        resp = await client.get(endpoint)
        assert resp.status_code == 401, f"{endpoint} returned {resp.status_code} (expected 401)"

    @pytest.mark.parametrize("endpoint,body", PROTECTED_POST_ENDPOINTS)
    async def test_all_protected_post_endpoints_require_auth(self, client: AsyncClient, endpoint: str, body: dict):
        """Every protected POST endpoint must return 401 without a token."""
        resp = await client.post(endpoint, json=body)
        assert resp.status_code == 401, f"{endpoint} returned {resp.status_code} (expected 401)"


@pytest.mark.asyncio
class TestJWTSecurity:
    async def test_tampered_jwt_is_rejected(self, client: AsyncClient):
        """A tampered JWT (wrong signature) should return 401."""
        fake_token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJ1c2VyLTAwMSIsInJvbGUiOiJhZG1pbiIsImV4cCI6OTk5OTk5OTk5OX0.TAMPERED_SIGNATURE_HERE"
        resp = await client.get("/api/v1/auth/me", headers={"Authorization": f"Bearer {fake_token}"})
        assert resp.status_code == 401

    async def test_garbled_token_rejected(self, client: AsyncClient):
        """Garbage token string should return 401."""
        resp = await client.get("/api/v1/auth/me", headers={"Authorization": "Bearer not.a.token"})
        assert resp.status_code == 401

    async def test_empty_bearer_token_rejected(self, client: AsyncClient):
        """Empty Bearer value should return 401."""
        resp = await client.get("/api/v1/auth/me", headers={"Authorization": "Bearer "})
        assert resp.status_code == 401

    async def test_no_bearer_prefix_rejected(self, client: AsyncClient, db_session):
        """Token without 'Bearer ' prefix should fail."""
        user = await make_user(db_session, email="nb@school.edu", role=UserRole.TEACHER)
        from app.core.auth import create_access_token
        token = create_access_token(user_id=user.id, role=user.role.value, email=user.email, school_id=user.school_id)
        resp = await client.get("/api/v1/auth/me", headers={"Authorization": token})  # No "Bearer "
        assert resp.status_code == 401


@pytest.mark.asyncio
class TestPrivilegeEscalation:
    async def test_student_cannot_access_admin_endpoints(self, client: AsyncClient, student_user):
        """Students must be blocked from all admin-level endpoints."""
        blocked = [
            ("GET", "/api/v1/users"),
            ("GET", "/api/v1/attendance/summary"),
            ("GET", "/api/v1/warden/rooms"),
            ("GET", "/api/v1/warden/summary"),
            ("GET", "/api/v1/transport/dashboard-stats"),
        ]
        for method, endpoint in blocked:
            if method == "GET":
                resp = await client.get(endpoint, headers=auth_header(student_user))
            assert resp.status_code in (403, 401), \
                f"Student accessed {endpoint} — returned {resp.status_code} (should be 403/401)"

    async def test_teacher_cannot_access_warden_endpoints(self, client: AsyncClient, teacher_user):
        """Teachers should be blocked from warden-only endpoints."""
        resp = await client.get("/api/v1/warden/rooms", headers=auth_header(teacher_user))
        assert resp.status_code == 403

        resp2 = await client.get("/api/v1/warden/summary", headers=auth_header(teacher_user))
        assert resp2.status_code == 403

    async def test_student_cannot_bulk_onboard(self, client: AsyncClient, student_user, db_session):
        """Students cannot initiate student onboarding."""
        resp = await client.post(
            "/api/v1/students/bulk-onboard",
            data={"start_number": "1", "end_number": "5", "class_id": str(uuid.uuid4())},
            headers=auth_header(student_user),
        )
        assert resp.status_code in (403, 401)

    async def test_student_cannot_create_department(self, client: AsyncClient, student_user):
        """Students cannot create departments."""
        resp = await client.post(
            "/api/v1/departments",
            json={"name": "Hack Dept", "code": "HCK"},
            headers=auth_header(student_user),
        )
        assert resp.status_code in (403, 401)

    async def test_student_cannot_register_new_user(self, client: AsyncClient, student_user):
        """Students cannot register new users (privilege escalation attempt)."""
        resp = await client.post(
            "/api/v1/auth/register",
            json={"email": "escalate@school.edu", "full_name": "Escalate", "role": "admin", "password": "P@ss"},
            headers=auth_header(student_user),
        )
        assert resp.status_code in (403, 401)


@pytest.mark.asyncio
class TestIDOR:
    """Insecure Direct Object Reference prevention tests."""

    async def test_student_cannot_download_other_students_receipt(self, client: AsyncClient, db_session):
        """Student A cannot download Student B's fee receipt."""
        student_a = await make_user(db_session, email="stu_a@school.edu", role=UserRole.STUDENT)
        student_b = await make_user(db_session, email="stu_b@school.edu", role=UserRole.STUDENT)

        # Seed a payment for Student B
        payment = FeePayment(
            id=str(uuid.uuid4()),
            student_id=student_b.id,
            title="Term Fee",
            amount=5000.0,
            payment_method="UPI",
            transaction_id="TXN-IDOR-001",
            receipt_number="RCP-IDOR-001",
            status="paid",
        )
        db_session.add(payment)
        await db_session.commit()

        # Student A tries to download Student B's receipt → must be 403
        resp = await client.get(
            f"/api/v1/fees/download/{payment.id}",
            headers=auth_header(student_a),
        )
        assert resp.status_code == 403

    async def test_student_sees_only_own_receipts(self, client: AsyncClient, db_session):
        """Fee receipts must be scoped — student cannot see other students' receipts."""
        student_a = await make_user(db_session, email="stu_ra@school.edu", role=UserRole.STUDENT)
        student_b = await make_user(db_session, email="stu_rb@school.edu", role=UserRole.STUDENT)

        # Seed a payment for Student B only
        payment = FeePayment(
            id=str(uuid.uuid4()),
            student_id=student_b.id,
            title="Term Fee",
            amount=3000.0,
            payment_method="Cash",
            transaction_id="TXN-SCOPE-001",
            receipt_number="RCP-SCOPE-001",
            status="paid",
        )
        db_session.add(payment)
        await db_session.commit()

        # Student A fetches receipts — should NOT see Student B's receipt
        resp = await client.get("/api/v1/fees/receipts", headers=auth_header(student_a))
        assert resp.status_code == 200
        receipt_ids = [r["id"] for r in resp.json()]
        assert payment.id not in receipt_ids


@pytest.mark.asyncio
class TestInputValidation:
    async def test_sql_injection_in_class_id(self, client: AsyncClient, admin_user):
        """SQL injection patterns in query params should not crash the server."""
        injections = [
            "'; DROP TABLE students; --",
            "1 OR 1=1",
            "\" OR \"1\"=\"1",
        ]
        for injection in injections:
            resp = await client.get(
                f"/api/v1/students?class_id={injection}",
                headers=auth_header(admin_user),
            )
            # Should return 200 with empty list, not 500
            assert resp.status_code in (200, 422), \
                f"Injection '{injection}' caused status {resp.status_code}"

    async def test_massive_batch_is_rejected(self, client: AsyncClient, teacher_user, db_session):
        """Sending a batch of >60 attendance records must be rejected with 400."""
        from app.db.models import Class
        cls = Class(id=str(uuid.uuid4()), grade="6", section="A", school_id="school-001")
        db_session.add(cls)
        await db_session.commit()

        records = [{"student_id": str(uuid.uuid4()), "status": "present"} for _ in range(65)]
        resp = await client.post(
            "/api/v1/attendance/batch",
            json={"class_id": cls.id, "marked_by": str(uuid.uuid4()), "date": str(date.today()), "records": records},
            headers=auth_header(teacher_user),
        )
        assert resp.status_code == 400

    async def test_nonexistent_resource_returns_404(self, client: AsyncClient, admin_user):
        """Accessing any non-existent resource by ID should return 404."""
        ghost_id = str(uuid.uuid4())
        resp = await client.get(f"/api/v1/fees/download/{ghost_id}", headers=auth_header(admin_user))
        assert resp.status_code == 404

    async def test_empty_leave_reason_is_handled(self, client: AsyncClient, teacher_user):
        """Empty string fields should not crash the backend."""
        resp = await client.post(
            "/api/v1/approvals/leave",
            json={
                "leave_type": "Casual Leave",
                "start_date": str(date.today()),
                "end_date": str(date.today()),
                "reason": "",
            },
            headers=auth_header(teacher_user),
        )
        # Either 200 (empty reason accepted) or 422 (validation rejected) — never 500
        assert resp.status_code in (200, 422)
        assert resp.status_code != 500
