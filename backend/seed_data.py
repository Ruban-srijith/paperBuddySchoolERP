"""
Seed data script for PaperBuddy ERP.
Creates departments, all 16 grades (LKG–12th), and users for all 8 roles.
Default password for all users: school@123
"""
import asyncio
import uuid
from datetime import datetime, timedelta, date, timezone
from app.db.database import AsyncSessionLocal, engine, Base
from app.db.models import (
    School, User, Student, Class, Subject, Classroom, SyllabusNode,
    LabAssignment, UserRole, Department, MentorAssignment,
    MentorLog, FeePayment, ParentStudentMap, LeaveRequest,
    TeacherSubstitution, BusRoute, AcademicCalendarEvent,
    SalaryRecord, SchoolEventProposal, ExamSchedule,
    Homework, Assignment, StudentQuery, Announcement,
    FeeStructure, FeeTransaction
)
from app.core.auth import hash_password

DEFAULT_PWD = hash_password("school@123")

# ─── Deterministic IDs for easy reference ──────────────────────
# Schools
SCHOOL_1_ID = "fcc6aea0-b378-4a72-808f-2cdbd361ed24"
SCHOOL_2_ID = "school22-2222-2222-2222-222222222222"
SCHOOL_3_ID = "school33-3333-3333-3333-333333333333"
SCHOOL_4_ID = "school44-4444-4444-4444-444444444444"

# Departments
DEPT_SCI_ID = "dept1111-1111-1111-1111-111111111111"
DEPT_CS_ID  = "dept2222-2222-2222-2222-222222222222"
DEPT_HUM_ID = "dept3333-3333-3333-3333-333333333333"

# Users
SUPER_ADMIN_ID   = "sa111111-1111-1111-1111-111111111111"
CORRESPONDENT_ID = "corr1111-1111-1111-1111-111111111111"
ADMIN_ID         = "a1111111-1111-1111-1111-111111111111"
PRINCIPAL_ID     = "pr111111-1111-1111-1111-111111111111"
VP_ID            = "vp111111-1111-1111-1111-111111111111"
DEAN_SCI_ID      = "de111111-1111-1111-1111-111111111111"
DH_SCI_ID        = "dh111111-1111-1111-1111-111111111111"
DH_CS_ID         = "dh222222-2222-2222-2222-222222222222"
TEACHER_1_ID     = "t1111111-1111-1111-1111-111111111111"
TEACHER_2_ID     = "t2222222-2222-2222-2222-222222222222"
TEACHER_3_ID     = "t3333333-3333-3333-3333-333333333333"
MENTOR_1_ID      = "me111111-1111-1111-1111-111111111111"
MENTOR_2_ID      = "me222222-2222-2222-2222-222222222222"
STU_1_ID         = "stu11111-1111-1111-1111-111111111111"
STU_2_ID         = "stu22222-2222-2222-2222-222222222222"
STU_3_ID         = "stu33333-3333-3333-3333-333333333333"
STU_4_ID         = "stu44444-4444-4444-4444-444444444444"
STU_5_ID         = "stu55555-5555-5555-5555-555555555555"
PARENT_1_ID      = "parent11-1111-1111-1111-111111111111"
FINANCE_ID       = "fin11111-1111-1111-1111-111111111111"
WARDEN_ID        = "war11111-1111-1111-1111-111111111111"
LIBRARIAN_ID     = "lib11111-1111-1111-1111-111111111111"
TRANSPORT_ID     = "tra11111-1111-1111-1111-111111111111"

# Grade levels (16 total: LKG through 12th)
GRADES = ["LKG", "UKG", "1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12"]
SECTIONS = ["A", "B"]


async def seed():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)
        await conn.run_sync(Base.metadata.create_all)

    async with AsyncSessionLocal() as session:
        # ═══════════════════════════════════════════════════════
        # 0. REGISTERED SCHOOLS
        # ═══════════════════════════════════════════════════════
        school1 = School(
            id=SCHOOL_1_ID,
            name="Bharathi Matriculation Hr. Sec. School",
            address="104 Gandhi Road, Anna Nagar, Chennai, Tamil Nadu",
            contact_email="admin@bharathischool.edu"
        )
        school2 = School(
            id=SCHOOL_2_ID,
            name="Delhi Public International School (DPS)",
            address="Sector 4, Dwarka, New Delhi",
            contact_email="contact@dpsinternational.edu"
        )
        school3 = School(
            id=SCHOOL_3_ID,
            name="St. Xavier's Model Academy",
            address="30 Park Street, Kolkata, West Bengal",
            contact_email="info@stxaviersacademy.edu"
        )
        school4 = School(
            id=SCHOOL_4_ID,
            name="PaperBuddy Demonstration Academy",
            address="Tech Park Avenue, Bengaluru, Karnataka",
            contact_email="demo@paperbuddy.erp"
        )
        session.add_all([school1, school2, school3, school4])
        await session.flush()

        # ═══════════════════════════════════════════════════════
        # 1. DEPARTMENTS
        # ═══════════════════════════════════════════════════════
        dept_sci = Department(id=DEPT_SCI_ID, school_id=SCHOOL_1_ID, name="Science", code="SCI")
        dept_cs  = Department(id=DEPT_CS_ID, school_id=SCHOOL_1_ID, name="Computer Science", code="CS")
        dept_hum = Department(id=DEPT_HUM_ID, school_id=SCHOOL_1_ID, name="Humanities", code="HUM")
        session.add_all([dept_sci, dept_cs, dept_hum])
        await session.flush()

        # ═══════════════════════════════════════════════════════
        # 2. USERS (all 15 ERP roles)
        # ═══════════════════════════════════════════════════════

        # Super Admin
        super_admin = User(
            id=SUPER_ADMIN_ID, school_id=SCHOOL_1_ID, email="superadmin@school.edu",
            full_name="System Super Admin", role=UserRole.SUPER_ADMIN,
            password_hash=DEFAULT_PWD
        )

        # Correspondent (School Owner)
        correspondent = User(
            id=CORRESPONDENT_ID, school_id=SCHOOL_1_ID, email="correspondent@school.edu",
            full_name="Mr. K. R. Sundaram", role=UserRole.CORRESPONDENT,
            password_hash=DEFAULT_PWD
        )

        # Principal
        principal = User(
            id=PRINCIPAL_ID, school_id=SCHOOL_1_ID, email="principal@school.edu",
            full_name="Dr. Raghavan Nair", role=UserRole.PRINCIPAL,
            password_hash=DEFAULT_PWD
        )

        # Vice Principal
        vice_principal = User(
            id=VP_ID, school_id=SCHOOL_1_ID, email="vp@school.edu",
            full_name="Mrs. Gayatri Varma", role=UserRole.VICE_PRINCIPAL,
            password_hash=DEFAULT_PWD
        )

        # Teachers
        t1 = User(
            id=TEACHER_1_ID, school_id=SCHOOL_1_ID, email="sarah.connor@school.edu",
            full_name="Dr. Sarah Connor", role=UserRole.TEACHER,
            password_hash=DEFAULT_PWD, department_id=DEPT_SCI_ID,
            assigned_grade="10"
        )
        t2 = User(
            id=TEACHER_2_ID, school_id=SCHOOL_1_ID, email="alan.turing@school.edu",
            full_name="Prof. Alan Turing", role=UserRole.TEACHER,
            password_hash=DEFAULT_PWD, department_id=DEPT_CS_ID,
            assigned_grade="10"
        )
        t3 = User(
            id=TEACHER_3_ID, school_id=SCHOOL_1_ID, email="marie.curie@school.edu",
            full_name="Dr. Marie Curie", role=UserRole.TEACHER,
            password_hash=DEFAULT_PWD, department_id=DEPT_SCI_ID,
            assigned_grade="10"
        )

        # Mentors
        mentor1 = User(
            id=MENTOR_1_ID, school_id=SCHOOL_1_ID, email="mentor.10a@school.edu",
            full_name="Mrs. Priya Menon", role=UserRole.MENTOR,
            password_hash=DEFAULT_PWD, assigned_grade="10"
        )
        mentor2 = User(
            id=MENTOR_2_ID, school_id=SCHOOL_1_ID, email="mentor.10b@school.edu",
            full_name="Mr. Arjun Reddy", role=UserRole.MENTOR,
            password_hash=DEFAULT_PWD, assigned_grade="10"
        )

        # Students
        st1_u = User(
            id=STU_1_ID, school_id=SCHOOL_1_ID, email="kishor.k@school.edu",
            full_name="Kishor Kumar", role=UserRole.STUDENT,
            password_hash=DEFAULT_PWD, assigned_grade="10"
        )
        st2_u = User(
            id=STU_2_ID, school_id=SCHOOL_1_ID, email="priya.sharma@school.edu",
            full_name="Priya Sharma", role=UserRole.STUDENT,
            password_hash=DEFAULT_PWD, assigned_grade="9"
        )
        st3_u = User(
            id=STU_3_ID, school_id=SCHOOL_1_ID, email="rahul.dev@school.edu",
            full_name="Rahul Dev", role=UserRole.STUDENT,
            password_hash=DEFAULT_PWD, assigned_grade="9"
        )
        st4_u = User(
            id=STU_4_ID, school_id=SCHOOL_1_ID, email="ananya.krishna@school.edu",
            full_name="Ananya Krishna", role=UserRole.STUDENT,
            password_hash=DEFAULT_PWD, assigned_grade="9"
        )
        st5_u = User(
            id=STU_5_ID, school_id=SCHOOL_1_ID, email="deepak.pillai@school.edu",
            full_name="Deepak Pillai", role=UserRole.STUDENT,
            password_hash=DEFAULT_PWD, assigned_grade="9"
        )

        # (Parent role removed)

        # Finance Officer
        fin_user = User(
            id=FINANCE_ID, school_id=SCHOOL_1_ID, email="finance@school.edu",
            full_name="Mr. Rajesh Khanna (Finance)", role=UserRole.FINANCE,
            password_hash=DEFAULT_PWD
        )

        # Hostel Warden
        warden_user = User(
            id=WARDEN_ID, school_id=SCHOOL_1_ID, email="warden@school.edu",
            full_name="Col. R. S. Bhardwaj (Warden)", role=UserRole.WARDEN,
            password_hash=DEFAULT_PWD
        )

        # Librarian
        lib_user = User(
            id=LIBRARIAN_ID, school_id=SCHOOL_1_ID, email="librarian@school.edu",
            full_name="Mrs. Meenakshi Sundaram", role=UserRole.LIBRARIAN,
            password_hash=DEFAULT_PWD
        )

        # Transport Manager
        trans_user = User(
            id=TRANSPORT_ID, school_id=SCHOOL_1_ID, email="transport@school.edu",
            full_name="Mr. Selvam Murugan (Transport)", role=UserRole.TRANSPORT,
            password_hash=DEFAULT_PWD
        )

        session.add_all([
            super_admin, correspondent, principal, vice_principal,
            t1, t2, t3,
            mentor1, mentor2,
            st1_u, st2_u, st3_u, st4_u, st5_u,
            fin_user, warden_user, lib_user, trans_user
        ])

        # ═══════════════════════════════════════════════════════
        class_map = {}  # (grade, section) -> Class object
        for grade in GRADES:
            for section in SECTIONS:
                cls_id = str(uuid.uuid4())
                if grade == "10" and section == "A":
                    cls_id = "c1111111-1111-1111-1111-111111111111"
                elif grade == "10" and section == "B":
                    cls_id = "c2222222-2222-2222-2222-222222222222"

                cls = Class(
                    id=cls_id, 
                    grade=grade, 
                    section=section,
                    class_teacher_id=TEACHER_1_ID if grade == "10" and section == "A" else None
                )
                class_map[(grade, section)] = cls
                session.add(cls)

        c10a = class_map[("10", "A")]
        c10b = class_map[("10", "B")]

        # ═══════════════════════════════════════════════════════
        # 4. MENTOR ASSIGNMENTS
        # ═══════════════════════════════════════════════════════
        ma1 = MentorAssignment(id=str(uuid.uuid4()), mentor_id=MENTOR_1_ID, class_id=c10a.id)
        ma2 = MentorAssignment(id=str(uuid.uuid4()), mentor_id=MENTOR_2_ID, class_id=c10b.id)
        session.add_all([ma1, ma2])

        # ═══════════════════════════════════════════════════════
        # 5. SUBJECTS (with department association)
        # ═══════════════════════════════════════════════════════
        sub1 = Subject(id="s1111111-1111-1111-1111-111111111111", code="PHY101", name="Physics", department_id=DEPT_SCI_ID)
        sub2 = Subject(id="s2222222-2222-2222-2222-222222222222", code="CS102", name="Computer Science", department_id=DEPT_CS_ID)
        sub3 = Subject(id="s3333333-3333-3333-3333-333333333333", code="CHEM103", name="Chemistry", department_id=DEPT_SCI_ID)
        session.add_all([sub1, sub2, sub3])

        # ═══════════════════════════════════════════════════════
        # 6. CLASSROOMS
        # ═══════════════════════════════════════════════════════
        r1 = Classroom(id="r1111111-1111-1111-1111-111111111111", name="Room 204", capacity=40, is_lab=False)
        r2 = Classroom(id="r2222222-2222-2222-2222-222222222222", name="Computer Lab 1", capacity=30, is_lab=True)
        r3 = Classroom(id="r3333333-3333-3333-3333-333333333333", name="Chem Lab 2", capacity=35, is_lab=True)
        session.add_all([r1, r2, r3])

        # ═══════════════════════════════════════════════════════
        # 7. SYLLABUS NODES
        # ═══════════════════════════════════════════════════════
        node1 = SyllabusNode(id="n1111111-1111-1111-1111-111111111111", subject_id=sub1.id, chapter_name="Kinematics", topic_name="Motion in One Dimension", weightage_percent=15.0, is_completed=True, completed_at=datetime.now(timezone.utc))
        node2 = SyllabusNode(id="n2222222-2222-2222-2222-222222222222", subject_id=sub1.id, chapter_name="Kinematics", topic_name="Projectiles & Vectors", weightage_percent=20.0, is_completed=False)
        node3 = SyllabusNode(id="n3333333-3333-3333-3333-333333333333", subject_id=sub1.id, chapter_name="Thermodynamics", topic_name="First Law of Thermodynamics", weightage_percent=25.0, is_completed=False)
        node4 = SyllabusNode(id="n4444444-4444-4444-4444-444444444444", subject_id=sub2.id, chapter_name="Data Structures", topic_name="Arrays & Linked Lists", weightage_percent=30.0, is_completed=True, completed_at=datetime.now(timezone.utc))
        node5 = SyllabusNode(id="n5555555-5555-5555-5555-555555555555", subject_id=sub2.id, chapter_name="Algorithms", topic_name="Sorting & Binary Search", weightage_percent=35.0, is_completed=False)
        session.add_all([node1, node2, node3, node4, node5])

        # ═══════════════════════════════════════════════════════
        # 8. STUDENT PROFILES
        # ═══════════════════════════════════════════════════════
        st1_p = Student(
            id="stp11111-1111-1111-1111-111111111111",
            user_id=STU_1_ID, class_id=c10a.id,
            admission_number="ADM-2026-042", roll_number="10A-01",
            full_name="Kishor Kumar", father_name="Ramesh Kumar",
            mother_name="Anita Kumar", guardian_phone="+919876543210",
            date_of_birth="2008-05-14", blood_group="O+",
            address="123 Main St, Sector 4, New Delhi"
        )
        st2_p = Student(
            id="stp22222-2222-2222-2222-222222222222",
            user_id=STU_2_ID, class_id=class_map[("9", "A")].id,
            admission_number="ADM-2026-043", roll_number="09A-01",
            full_name="Priya Sharma", father_name="Rajesh Sharma",
            mother_name="Sunita Sharma", guardian_phone="+919812345678",
            date_of_birth="2008-08-22", blood_group="A+",
            address="456 Park Avenue, Sector 12, New Delhi"
        )
        st3_p = Student(
            id="stp33333-3333-3333-3333-333333333333",
            user_id=STU_3_ID, class_id=class_map[("9", "A")].id,
            admission_number="ADM-2026-044", roll_number="09A-02",
            full_name="Rahul Dev", father_name="Mohan Dev",
            mother_name="Sita Dev", guardian_phone="+919855512345",
            date_of_birth="2008-03-11", blood_group="B+",
            address="789 Green Lane, Sector 7, New Delhi"
        )
        st4_p = Student(
            id="stp44444-4444-4444-4444-444444444444",
            user_id=STU_4_ID, class_id=class_map[("9", "B")].id,
            admission_number="ADM-2026-045", roll_number="09B-01",
            full_name="Ananya Krishna", father_name="Vijay Krishna",
            mother_name="Meera Krishna", guardian_phone="+919844456789",
            date_of_birth="2008-11-05", blood_group="AB+",
            address="321 Oak Road, Sector 9, New Delhi"
        )
        st5_p = Student(
            id="stp55555-5555-5555-5555-555555555555",
            user_id=STU_5_ID, class_id=class_map[("9", "B")].id,
            admission_number="ADM-2026-046", roll_number="09B-02",
            full_name="Deepak Pillai", father_name="Suresh Pillai",
            mother_name="Geetha Pillai", guardian_phone="+919877789012",
            date_of_birth="2008-07-18", blood_group="O-",
            address="654 Elm Street, Sector 15, New Delhi"
        )
        session.add_all([st1_p, st2_p, st3_p, st4_p, st5_p])

        # ═══════════════════════════════════════════════════════
        # 9. LAB ASSIGNMENTS
        # ═══════════════════════════════════════════════════════
        lab1 = LabAssignment(
            id="lab11111-1111-1111-1111-111111111111",
            class_id=c10a.id, subject_id=sub2.id, teacher_id=TEACHER_2_ID,
            title="Lab 01: Python Binary Search Tree Implementation",
            description="Implement a binary search tree in Python with insert, search, and delete operations.",
            file_url="/uploads/bst_lab_spec.pdf",
            due_date=datetime.now(timezone.utc) + timedelta(days=2)
        )
        lab2 = LabAssignment(
            id="lab22222-2222-2222-2222-222222222222",
            class_id=c10a.id, subject_id=sub1.id, teacher_id=TEACHER_1_ID,
            title="Lab 02: Verification of Ohm's Law & Circuit Analysis",
            description="Record voltage and current readings across variable resistors and plot V-I curve.",
            file_url="/uploads/ohms_law_lab_spec.pdf",
            due_date=datetime.now(timezone.utc) - timedelta(days=1)  # Expired due date to test 'late' status
        )
        session.add_all([lab1, lab2])

        # ═══════════════════════════════════════════════════════
        # 10. MENTOR LOGS
        # ═══════════════════════════════════════════════════════
        mlog1 = MentorLog(
            id="mlog1111-1111-1111-1111-111111111111",
            mentor_id=MENTOR_1_ID,
            student_id=STU_1_ID,
            category="academic",
            notes="Reviewed Physics kinematics progress. Kishor is tracking well on topic weightage."
        )
        mlog2 = MentorLog(
            id="mlog2222-2222-2222-2222-222222222222",
            mentor_id=MENTOR_1_ID,
            student_id=STU_2_ID,
            category="behavioral",
            notes="Priya demonstrated strong leadership in lab group assignment."
        )
        session.add_all([mlog1, mlog2])

        # ═══════════════════════════════════════════════════════
        # 11. FEE STRUCTURES & PAYMENTS
        # ═══════════════════════════════════════════════════════
        fs_term1 = FeeStructure(
            id="fs111111-1111-1111-1111-111111111111",
            grade="10",
            fee_type="term1",
            amount=45000.00,
            academic_year="2026-2027",
            due_date=date(2026, 12, 31)
        )
        fs_term2 = FeeStructure(
            id="fs222222-2222-2222-2222-222222222222",
            grade="10",
            fee_type="term2",
            amount=40000.00,
            academic_year="2026-2027",
            due_date=date(2026, 12, 31)
        )
        fs_bus = FeeStructure(
            id="fs333333-3333-3333-3333-333333333333",
            grade="10",
            fee_type="bus",
            amount=12000.00,
            academic_year="2026-2027",
            due_date=date(2026, 12, 31)
        )
        fs_hostel = FeeStructure(
            id="fs444444-4444-4444-4444-444444444444",
            grade="10",
            fee_type="hostel",
            amount=65000.00,
            academic_year="2026-2027",
            due_date=date(2026, 12, 31)
        )
        session.add_all([fs_term1, fs_term2, fs_bus, fs_hostel])

        fee1 = FeePayment(
            id="fee11111-1111-1111-1111-111111111111",
            student_id=STU_1_ID,
            title="Grade 10 - Term 1 Tuition Fee",
            amount=45000.00,
            payment_method="Razorpay UPI",
            transaction_id="pay_demo_seed_001",
            receipt_number="PB-REC-2026-4421",
            status="paid"
        )
        session.add(fee1)

        tx1 = FeeTransaction(
            id="ft111111-1111-1111-1111-111111111111",
            student_id=STU_1_ID,
            fee_structure_id=fs_term1.id,
            amount_paid=45000.00,
            payment_method="Razorpay UPI",
            receipt_number="PB-REC-2026-4421",
            processed_by=SUPER_ADMIN_ID
        )
        session.add(tx1)


        # ═══════════════════════════════════════════════════════
        # 12. PARENT STUDENT MAP & BUS ROUTES & LEAVE REQUESTS
        # ═══════════════════════════════════════════════════════
        leave1 = LeaveRequest(
            id="l1111111-1111-1111-1111-111111111111",
            applicant_id=TEACHER_1_ID,
            leave_type="Casual",
            start_date=date.today() + timedelta(days=2),
            end_date=date.today() + timedelta(days=3),
            reason="Attending National Physics Seminar",
            status="pending"
        )
        session.add(leave1)

        bus1 = BusRoute(
            id="b1111111-1111-1111-1111-111111111111",
            route_name="Route 4 - Sector 12 Express",
            driver_name="Ramesh Singh",
            driver_phone="+919811122233",
            bus_number="DL-01-AB-1234",
            current_location="Approaching Sector 12 Metro Station (2.4 km away)",
            status="in_transit"
        )
        session.add(bus1)

        # ═══════════════════════════════════════════════════════
        # 11. ACADEMIC CALENDAR EVENTS
        # ═══════════════════════════════════════════════════════
        cal_events = [
            AcademicCalendarEvent(
                id="cal11111-1111-1111-1111-111111111111",
                title="Independence Day & Flag Hoisting",
                description="Annual Independence Day ceremonial flag hoisting and cultural programs.",
                start_date=date(2026, 8, 15),
                end_date=date(2026, 8, 15),
                event_type="Holiday",
                grade_scope="all",
                created_by_id=VP_ID
            ),
            AcademicCalendarEvent(
                id="cal22222-2222-2222-2222-222222222222",
                title="Term 1 Mid-Term Examination",
                description="Mid-term theory and practical examinations for Grades 6 through 12.",
                start_date=date(2026, 8, 20),
                end_date=date(2026, 8, 28),
                event_type="Examination",
                grade_scope="all",
                created_by_id=VP_ID
            ),
            AcademicCalendarEvent(
                id="cal33333-3333-3333-3333-333333333333",
                title="National Science Exhibition & Tech Fest",
                description="Inter-school science showcase and robotics competitions in main auditorium.",
                start_date=date(2026, 9, 5),
                end_date=date(2026, 9, 6),
                event_type="Event",
                grade_scope="all",
                created_by_id=VP_ID
            ),
            AcademicCalendarEvent(
                id="cal44444-4444-4444-4444-444444444444",
                title="Staff Academic Council & Curriculum Review",
                description="Term 1 progress review and lesson planning sync for all faculty.",
                start_date=date(2026, 8, 30),
                end_date=date(2026, 8, 30),
                event_type="Meeting",
                grade_scope="all",
                created_by_id=PRINCIPAL_ID
            ),
        ]
        session.add_all(cal_events)

        # ═══════════════════════════════════════════════════════
        # 12. SALARY RECORDS (SUPERADMIN APPROVAL)
        # ═══════════════════════════════════════════════════════
        salary_records = [
            SalaryRecord(
                id="sal11111-1111-1111-1111-111111111111",
                staff_id=TEACHER_1_ID,
                month="July",
                year=2026,
                base_salary=65000.00,
                allowances=5000.00,
                deductions=2000.00,
                net_salary=68000.00,
                status="approved",
                approved_by_id=CORRESPONDENT_ID,
                remarks="Regular monthly salary approved."
            ),
            SalaryRecord(
                id="sal22222-2222-2222-2222-222222222222",
                staff_id=TEACHER_2_ID,
                month="August",
                year=2026,
                base_salary=72000.00,
                allowances=6000.00,
                deductions=2500.00,
                net_salary=75500.00,
                status="pending",
                remarks="Awaiting Correspondent approval for August payroll."
            ),
            SalaryRecord(
                id="sal33333-3333-3333-3333-333333333333",
                staff_id=TEACHER_3_ID,
                month="August",
                year=2026,
                base_salary=70000.00,
                allowances=5500.00,
                deductions=2200.00,
                net_salary=73300.00,
                status="pending",
                remarks="August salary request submitted."
            ),
        ]
        session.add_all(salary_records)

        # ═══════════════════════════════════════════════════════
        # 13. MAJOR EVENT PROPOSALS
        # ═══════════════════════════════════════════════════════
        event_proposals = [
            SchoolEventProposal(
                id="evp11111-1111-1111-1111-111111111111",
                title="Annual Inter-School Sports Meet 2026",
                description="3-day athletic meet with 24 participating schools, track events, and prize distribution.",
                organizer_id=TEACHER_1_ID,
                target_grades="all",
                start_date=date(2026, 9, 18),
                end_date=date(2026, 9, 20),
                budget=250000.00,
                status="pending",
            ),
            SchoolEventProposal(
                id="evp22222-2222-2222-2222-222222222222",
                title="Astronomy & Night Sky Observation Camp",
                description="Telescope observation and astrophysicist guest lecture for Grades 8-12.",
                organizer_id=TEACHER_2_ID,
                target_grades="8-12",
                start_date=date(2026, 10, 10),
                end_date=date(2026, 10, 11),
                budget=85000.00,
                status="approved",
                approved_by_id=CORRESPONDENT_ID,
                feedback="Approved. Please coordinate safety with campus security."
            )
        ]
        session.add_all(event_proposals)

        # ═══════════════════════════════════════════════════════
        # 14. HOMEWORK, QUERIES & ANNOUNCEMENTS
        # ═══════════════════════════════════════════════════════
        hw1 = Homework(
            id="hw111111-1111-1111-1111-111111111111",
            class_id=c10a.id,
            subject_id=sub1.id,
            teacher_id=TEACHER_1_ID,
            title="Exercise 4.3 — Quadratic Equations Factorization",
            description="Complete Q1 through Q10 on page 84. Submit step-by-step working.",
            assigned_date=date.today(),
            due_date=date.today() + timedelta(days=2),
        )
        session.add(hw1)

        q1 = StudentQuery(
            id="sq111111-1111-1111-1111-111111111111",
            student_id=STU_1_ID,
            query_type="doubt",
            teacher_id=TEACHER_1_ID,
            subject_id=sub1.id,
            class_id=c10a.id,
            question_or_reason="In Quadratic Equations exercise 4.3 Q7, why do we reject the negative root for train speed?",
            response="Because speed magnitude in classical mechanics cannot be negative.",
            status="answered",
        )
        q2 = StudentQuery(
            id="sq222222-2222-2222-2222-222222222222",
            student_id=STU_1_ID,
            query_type="leave_application",
            teacher_id=TEACHER_1_ID,
            class_id=c10a.id,
            question_or_reason="Request 2 days leave (Aug 10-11) for Science Olympiad finals.",
            status="pending",
        )
        session.add_all([q1, q2])

        anc1 = Announcement(
            id="anc11111-1111-1111-1111-111111111111",
            class_id=None,
            author_id=PRINCIPAL_ID,
            title="Independence Day Flag Hoisting & Parade",
            content="Independence Day celebration on Aug 15th at 8:00 AM. Dress code: Formal white uniform.",
            priority="high",
        )
        session.add(anc1)

        await session.commit()
        print("=" * 60)
        print("DATABASE SEEDED SUCCESSFULLY!")
        print("=" * 60)
        print()
        print("Login Credentials (default password: school@123)")
        print("-" * 60)
        print(f"  Super Admin  : superadmin@school.edu")
        print(f"  Correspondent: correspondent@school.edu")
        print(f"  Principal    : principal@school.edu")
        print(f"  Vice Principal: vp@school.edu")
        print(f"  Teacher      : sarah.connor@school.edu")
        print(f"  Teacher      : alan.turing@school.edu")
        print(f"  Teacher      : marie.curie@school.edu")
        print(f"  Mentor       : mentor.10a@school.edu")
        print(f"  Mentor       : mentor.10b@school.edu")
        print(f"  Student      : kishor.k@school.edu")
        print(f"  Student      : priya.sharma@school.edu")
        print(f"  Student      : rahul.dev@school.edu")
        print(f"  Student      : ananya.krishna@school.edu")
        print(f"  Student      : deepak.pillai@school.edu")
        print("-" * 60)
        print(f"  Grades       : {', '.join(GRADES)}")
        print(f"  Classes      : {len(GRADES) * len(SECTIONS)} total ({len(GRADES)} grades × {len(SECTIONS)} sections)")
        print(f"  Departments  : Science, Computer Science, Humanities")
        print("=" * 60)

if __name__ == "__main__":
    asyncio.run(seed())
