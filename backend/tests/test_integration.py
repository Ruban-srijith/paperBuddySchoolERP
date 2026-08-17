"""
test_integration.py — End-to-End User Journey Tests
=====================================================
These tests simulate complete user journeys that span multiple API calls,
exactly as a real user would interact with the system from the UI.

Journeys covered:
  1. Admin Onboarding Journey:
     Login → Register teacher → Create class → Assign teacher → Bulk onboard students
     → Assign students to class → Verify student appears in class list

  2. Teacher Daily Operations Journey:
     Login → Get my class → Mark attendance for today → Submit work log
     → Verify log is visible

  3. Student Fee Payment Journey:
     Login → Pay fee → Get receipts → Download receipt → Verify receipt data

  4. Leave Application Journey (Full Cycle):
     Teacher logs in → Submits leave → Principal sees pending leave
     → Principal approves → Teacher sees approved status

  5. Warden Daily Operations Journey:
     Login as warden → Log incident → Log visitor → View summary
     → Check hostel attendance

  6. Transport Admin Journey:
     Login → Create route → Add stops → Create vehicle → Allocate student
"""
import pytest
import uuid
from datetime import date, timedelta
from httpx import AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession

from tests.conftest import make_user, auth_header
from app.db.models import UserRole


# ─── Journey 1: Admin Full Onboarding ──────────────────────────────────────
@pytest.mark.asyncio
class TestAdminOnboardingJourney:
    async def test_full_admin_onboard_flow(self, client: AsyncClient, super_admin, db_session):
        """
        Simulate an admin onboarding a new class and students:
        1. Admin creates a new class (Grade 10 - A)
        2. Admin creates a teacher account
        3. Admin assigns teacher to the class
        4. Admin bulk onboards 3 students into the class
        5. Admin verifies students appear in the class student list
        """
        # Step 1: Create class
        class_resp = await client.post(
            "/api/v1/classes",
            json={"grade": "10", "section": "A"},
            headers=auth_header(super_admin),
        )
        assert class_resp.status_code == 200
        class_id = class_resp.json()["id"]

        # Step 2: Create teacher
        teacher_resp = await client.post(
            "/api/v1/auth/register",
            json={
                "email": "journey_teacher@school.edu",
                "full_name": "Journey Teacher",
                "role": "teacher",
                "password": "Teacher@1234",
            },
            headers=auth_header(super_admin),
        )
        assert teacher_resp.status_code == 200
        teacher_id = teacher_resp.json()["id"]

        # Step 3: Assign teacher to class
        assign_resp = await client.put(
            f"/api/v1/classes/{class_id}/assign",
            json={"teacher_id": teacher_id},
            headers=auth_header(super_admin),
        )
        assert assign_resp.status_code == 200

        # Step 4: Bulk onboard 3 students
        onboard_resp = await client.post(
            "/api/v1/students/bulk-onboard",
            data={
                "class_id": class_id,
                "start_number": "1",
                "end_number": "3",
                "prefix": "J2026-",
            },
            headers=auth_header(super_admin),
        )
        assert onboard_resp.status_code == 200
        assert onboard_resp.json()["created_count"] == 3

        # Step 5: Verify students appear in the class list
        students_resp = await client.get(
            f"/api/v1/students?class_id={class_id}",
            headers=auth_header(super_admin),
        )
        assert students_resp.status_code == 200
        assert len(students_resp.json()) == 3


# ─── Journey 2: Teacher Daily Operations ───────────────────────────────────
@pytest.mark.asyncio
class TestTeacherDailyOperationsJourney:
    async def test_teacher_daily_workflow(self, client: AsyncClient, db_session):
        """
        Simulate a teacher's morning routine:
        1. Teacher logs in
        2. Teacher marks attendance for 2 students
        3. Teacher submits a daily work log
        4. Teacher verifies their work log appears in list
        """
        from app.db.models import Class, Student

        # Setup: create teacher first, then class assigned to them
        teacher = await make_user(db_session, email="daily_teacher@school.edu", role=UserRole.TEACHER)

        cls = Class(
            id=str(uuid.uuid4()),
            grade="9",
            section="B",
            school_id="school-001",
            class_teacher_id=teacher.id,
        )
        db_session.add(cls)
        await db_session.commit()

        # Create 2 students
        students = []
        for i in range(2):
            u = await make_user(db_session, email=f"daily_stu{i}@school.edu", role=UserRole.STUDENT)
            s = Student(
                id=str(uuid.uuid4()),
                user_id=u.id,
                admission_number=f"DAY-{i:03d}",
                full_name=f"Daily Student {i}",
                class_id=cls.id,
            )
            db_session.add(s)
            students.append(u)
        await db_session.commit()

        today = str(date.today())

        # Step 1: Teacher logs in
        login_resp = await client.post(
            "/api/v1/auth/login",
            json={"email": "daily_teacher@school.edu", "password": "Test@1234"},
        )
        assert login_resp.status_code == 200
        token = login_resp.json()["access_token"]
        headers = {"Authorization": f"Bearer {token}"}

        # Step 2: Mark attendance
        att_resp = await client.post(
            "/api/v1/attendance/batch",
            json={
                "class_id": cls.id,
                "marked_by": teacher.id,
                "date": today,
                "records": [
                    {"student_id": students[0].id, "status": "present"},
                    {"student_id": students[1].id, "status": "absent"},
                ],
            },
            headers=headers,
        )
        assert att_resp.status_code == 200
        assert "success" in att_resp.json()["status"]

        # Step 3: Submit work log
        from app.db.models import Subject
        subj = Subject(id=str(uuid.uuid4()), code="MATH9", name="Mathematics", school_id="school-001")
        db_session.add(subj)
        await db_session.commit()

        log_resp = await client.post(
            "/api/v1/work-logs",
            json={
                "teacher_id": teacher.id,
                "class_id": cls.id,
                "subject_id": subj.id,
                "syllabus_node_id": None,
                "date": today,
                "summary": "Chapter 3: Quadratic Equations — Completed theory + examples",
            },
            headers=headers,
        )
        assert log_resp.status_code == 200
        assert "Quadratic" in log_resp.json()["summary"]

        # Step 4: Verify work log appears in list
        logs_resp = await client.get("/api/v1/work-logs", headers=headers)
        assert logs_resp.status_code == 200
        logs = logs_resp.json()
        assert len(logs) >= 1


# ─── Journey 3: Student Fee Payment Journey ─────────────────────────────────
@pytest.mark.asyncio
class TestStudentFeePaymentJourney:
    async def test_student_pays_fee_and_downloads_receipt(self, client: AsyncClient, db_session):
        """
        Simulate a student paying their term fee:
        1. Student logs in
        2. Student submits a fee payment
        3. Student fetches their receipt list
        4. Student downloads the specific receipt
        5. Validates receipt data integrity
        """
        student = await make_user(db_session, email="fee_student@school.edu", role=UserRole.STUDENT, password="Stu@1234")

        # Step 1: Login
        login = await client.post(
            "/api/v1/auth/login",
            json={"email": "fee_student@school.edu", "password": "Stu@1234"},
        )
        assert login.status_code == 200
        headers = {"Authorization": f"Bearer {login.json()['access_token']}"}

        # Step 2: Pay fee
        pay = await client.post(
            "/api/v1/fees/pay",
            json={"title": "Term 2 Tuition Fee", "amount": 12500.0, "payment_method": "UPI"},
            headers=headers,
        )
        assert pay.status_code == 200
        payment_id = pay.json()["id"]
        receipt_no = pay.json()["receipt_number"]

        # Step 3: Get receipts list
        receipts = await client.get("/api/v1/fees/receipts", headers=headers)
        assert receipts.status_code == 200
        receipt_ids = [r["id"] for r in receipts.json()]
        assert payment_id in receipt_ids

        # Step 4: Download the specific receipt
        download = await client.get(f"/api/v1/fees/download/{payment_id}", headers=headers)
        assert download.status_code == 200
        data = download.json()

        # Step 5: Validate receipt structure
        assert data["receipt_number"] == receipt_no
        assert data["payment"]["title"] == "Term 2 Tuition Fee"
        assert "12500" in data["payment"]["amount"]
        assert data["institution"] is not None


# ─── Journey 4: Leave Approval Full Cycle ───────────────────────────────────
@pytest.mark.asyncio
class TestLeaveApprovalCycleJourney:
    async def test_full_leave_approval_cycle(self, client: AsyncClient, db_session):
        """
        Complete leave workflow:
        1. Teacher submits a leave request
        2. Principal sees it in pending list
        3. Principal approves it
        4. Teacher refreshes their leave list and sees 'approved' status
        """
        teacher = await make_user(db_session, email="lj_teacher@school.edu", role=UserRole.TEACHER, password="T@1234")
        principal = await make_user(db_session, email="lj_principal@school.edu", role=UserRole.PRINCIPAL, password="P@1234")

        teacher_headers = auth_header(teacher)
        principal_headers = auth_header(principal)

        # Step 1: Teacher submits leave
        submit = await client.post(
            "/api/v1/approvals/leave",
            json={
                "leave_type": "Casual Leave",
                "start_date": str(date.today() + timedelta(days=5)),
                "end_date": str(date.today() + timedelta(days=6)),
                "reason": "Wedding anniversary",
            },
            headers=teacher_headers,
        )
        assert submit.status_code == 200
        leave_id = submit.json()["id"]
        assert submit.json()["status"] == "pending"

        # Step 2: Principal sees it in pending list
        pending = await client.get("/api/v1/approvals/pending", headers=principal_headers)
        assert pending.status_code == 200
        pending_ids = [l["id"] for l in pending.json()]
        assert leave_id in pending_ids

        # Step 3: Principal approves
        approve = await client.post(
            f"/api/v1/approvals/leave/{leave_id}",
            json={"status": "approved"},
            headers=principal_headers,
        )
        assert approve.status_code == 200
        assert approve.json()["status"] == "approved"

        # Step 4: Teacher refreshes — sees approved
        teacher_leaves = await client.get("/api/v1/approvals/leave", headers=teacher_headers)
        assert teacher_leaves.status_code == 200
        leave_data = next((l for l in teacher_leaves.json() if l["id"] == leave_id), None)
        assert leave_data is not None
        assert leave_data["status"] == "approved"


# ─── Journey 5: Warden Daily Operations ─────────────────────────────────────
@pytest.mark.asyncio
class TestWardenDailyJourney:
    async def test_warden_daily_routine(self, client: AsyncClient, warden_user):
        """
        Warden's daily hostel management flow:
        1. View hostel summary stats
        2. Log a visitor
        3. Log a discipline incident
        4. Check today's attendance
        5. View outpasses
        """
        headers = auth_header(warden_user)

        # Step 1: View summary
        summary = await client.get("/api/v1/warden/summary", headers=headers)
        assert summary.status_code == 200
        assert summary.json()["total_rooms"] >= 0

        # Step 2: Log visitor
        visitor = await client.post(
            "/api/v1/warden/visitors",
            json={"visitor_name": "Mr. Parent Singh", "purpose": "Parent-teacher meeting"},
            headers=headers,
        )
        assert visitor.status_code == 200

        # Step 3: Log incident
        incident = await client.post(
            "/api/v1/warden/incidents",
            json={"category": "Discipline", "severity": "low", "description": "Late return to room."},
            headers=headers,
        )
        assert incident.status_code == 200

        # Step 4: Check attendance
        attendance = await client.get("/api/v1/warden/attendance", headers=headers)
        assert attendance.status_code == 200
        assert "present_count" in attendance.json()

        # Step 5: View outpasses
        outpasses = await client.get("/api/v1/warden/outpasses", headers=headers)
        assert outpasses.status_code == 200
        assert isinstance(outpasses.json(), list)


# ─── Journey 6: Transport Admin Journey ─────────────────────────────────────
@pytest.mark.asyncio
class TestTransportAdminJourney:
    async def test_transport_setup_flow(self, client: AsyncClient, db_session):
        """
        Complete transport configuration flow:
        1. Create a route
        2. Add 2 stops to the route
        3. Create a vehicle
        4. Create a driver
        5. Allocate a student to the route
        """
        manager = await make_user(
            db_session,
            email="transport_mgr@school.edu",
            role=UserRole.TRANSPORT,
            password="T@1234",
        )
        headers = auth_header(manager)

        # Step 1: Create route
        route = await client.post(
            "/api/v1/transport/routes",
            json={"name": "Route Journey", "start_point": "City A", "end_point": "School", "total_stops": 0},
            headers=headers,
        )
        assert route.status_code == 200
        route_id = route.json()["id"]

        # Step 2: Add stops and capture the first stop's ID
        stop_id = None
        for i, stop_name in enumerate(["Stop Alpha", "Stop Beta"], start=1):
            stop_resp = await client.post(
                "/api/v1/transport/stops",
                json={"route_id": route_id, "stop_name": stop_name, "pickup_time": f"07:3{i}"},
                headers=headers,
            )
            assert stop_resp.status_code == 200
            if stop_id is None:
                stop_id = stop_resp.json()["id"]

        # Step 3: Create vehicle
        vehicle = await client.post(
            "/api/v1/transport/vehicles",
            json={"registration_number": "TN-JOURNEY-01", "vehicle_type": "Bus", "capacity": 45, "is_active": True},
            headers=headers,
        )
        assert vehicle.status_code == 200

        # Step 4: Create driver
        driver = await client.post(
            "/api/v1/transport/staff",
            json={"name": "Ramesh Driver", "role": "Driver", "phone": "9876543210"},
            headers=headers,
        )
        assert driver.status_code == 200

        # Step 5: Allocate student
        student = await make_user(db_session, email="transport_stu@school.edu", role=UserRole.STUDENT)
        alloc = await client.post(
            "/api/v1/transport/allocate-student",
            json={"student_id": student.id, "stop_id": stop_id, "status": "active"},
            headers=headers,
        )
        assert alloc.status_code == 200
        assert alloc.json()["student_id"] == student.id
