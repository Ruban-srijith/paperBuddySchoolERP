"""
Seed data script for PaperBuddy ERP.
Creates departments, all 16 grades (LKG–12th), and users for all 8 roles.
Default password for all users: school@123
"""
import asyncio
import uuid
from datetime import datetime, timedelta, date
from app.db.database import AsyncSessionLocal, engine, Base
from app.db.models import (
    User, Student, Class, Subject, Classroom, SyllabusNode,
    LabAssignment, UserRole, Department, MentorAssignment,
    MentorLog, FeePayment, ParentStudentMap, LeaveRequest,
    TeacherSubstitution, BusRoute
)
from app.core.auth import hash_password

DEFAULT_PWD = hash_password("school@123")

# ─── Deterministic IDs for easy reference ──────────────────────
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

# Grade levels (16 total: LKG through 12th)
GRADES = ["LKG", "UKG", "1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12"]
SECTIONS = ["A", "B"]


async def seed():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    async with AsyncSessionLocal() as session:
        # ═══════════════════════════════════════════════════════
        # 1. DEPARTMENTS
        # ═══════════════════════════════════════════════════════
        dept_sci = Department(id=DEPT_SCI_ID, name="Science", code="SCI", dean_id=DEAN_SCI_ID)
        dept_cs  = Department(id=DEPT_CS_ID, name="Computer Science", code="CS")
        dept_hum = Department(id=DEPT_HUM_ID, name="Humanities", code="HUM")
        session.add_all([dept_sci, dept_cs, dept_hum])

        # ═══════════════════════════════════════════════════════
        # 2. USERS (all 8 roles)
        # ═══════════════════════════════════════════════════════

        # Super Admin
        super_admin = User(
            id=SUPER_ADMIN_ID, email="superadmin@school.edu",
            full_name="System Super Admin", role=UserRole.SUPER_ADMIN,
            password_hash=DEFAULT_PWD
        )

        # Admin
        admin = User(
            id=ADMIN_ID, email="admin@school.edu",
            full_name="Principal Office Admin", role=UserRole.ADMIN,
            password_hash=DEFAULT_PWD
        )

        # Correspondent (School Owner)
        correspondent = User(
            id=CORRESPONDENT_ID, email="correspondent@school.edu",
            full_name="Mr. K. R. Sundaram", role=UserRole.CORRESPONDENT,
            password_hash=DEFAULT_PWD
        )

        # Principal
        principal = User(
            id=PRINCIPAL_ID, email="principal@school.edu",
            full_name="Dr. Raghavan Nair", role=UserRole.PRINCIPAL,
            password_hash=DEFAULT_PWD
        )

        # Vice Principal
        vice_principal = User(
            id=VP_ID, email="vp@school.edu",
            full_name="Mrs. Gayatri Varma", role=UserRole.VICE_PRINCIPAL,
            password_hash=DEFAULT_PWD
        )

        # Dean (Science)
        dean_sci = User(
            id=DEAN_SCI_ID, email="dean.science@school.edu",
            full_name="Prof. Venkat Raman", role=UserRole.DEAN,
            password_hash=DEFAULT_PWD, department_id=DEPT_SCI_ID
        )

        # Dept Heads
        dh_sci = User(
            id=DH_SCI_ID, email="head.physics@school.edu",
            full_name="Dr. Lakshmi Iyer", role=UserRole.DEPT_HEAD,
            password_hash=DEFAULT_PWD, department_id=DEPT_SCI_ID,
            assigned_grade="10"
        )
        dh_cs = User(
            id=DH_CS_ID, email="head.cs@school.edu",
            full_name="Prof. Suresh Babu", role=UserRole.DEPT_HEAD,
            password_hash=DEFAULT_PWD, department_id=DEPT_CS_ID,
            assigned_grade="10"
        )

        # Teachers
        t1 = User(
            id=TEACHER_1_ID, email="sarah.connor@school.edu",
            full_name="Dr. Sarah Connor", role=UserRole.TEACHER,
            password_hash=DEFAULT_PWD, department_id=DEPT_SCI_ID,
            assigned_grade="10"
        )
        t2 = User(
            id=TEACHER_2_ID, email="alan.turing@school.edu",
            full_name="Prof. Alan Turing", role=UserRole.TEACHER,
            password_hash=DEFAULT_PWD, department_id=DEPT_CS_ID,
            assigned_grade="10"
        )
        t3 = User(
            id=TEACHER_3_ID, email="marie.curie@school.edu",
            full_name="Dr. Marie Curie", role=UserRole.TEACHER,
            password_hash=DEFAULT_PWD, department_id=DEPT_SCI_ID,
            assigned_grade="10"
        )

        # Mentors
        mentor1 = User(
            id=MENTOR_1_ID, email="mentor.10a@school.edu",
            full_name="Mrs. Priya Menon", role=UserRole.MENTOR,
            password_hash=DEFAULT_PWD, assigned_grade="10"
        )
        mentor2 = User(
            id=MENTOR_2_ID, email="mentor.10b@school.edu",
            full_name="Mr. Arjun Reddy", role=UserRole.MENTOR,
            password_hash=DEFAULT_PWD, assigned_grade="10"
        )

        # Students
        st1_u = User(
            id=STU_1_ID, email="kishor.k@school.edu",
            full_name="Kishor Kumar", role=UserRole.STUDENT,
            password_hash=DEFAULT_PWD, assigned_grade="10"
        )
        st2_u = User(
            id=STU_2_ID, email="priya.sharma@school.edu",
            full_name="Priya Sharma", role=UserRole.STUDENT,
            password_hash=DEFAULT_PWD, assigned_grade="10"
        )
        st3_u = User(
            id=STU_3_ID, email="rahul.dev@school.edu",
            full_name="Rahul Dev", role=UserRole.STUDENT,
            password_hash=DEFAULT_PWD, assigned_grade="10"
        )
        st4_u = User(
            id=STU_4_ID, email="ananya.krishna@school.edu",
            full_name="Ananya Krishna", role=UserRole.STUDENT,
            password_hash=DEFAULT_PWD, assigned_grade="10"
        )
        st5_u = User(
            id=STU_5_ID, email="deepak.pillai@school.edu",
            full_name="Deepak Pillai", role=UserRole.STUDENT,
            password_hash=DEFAULT_PWD, assigned_grade="10"
        )

        # Parent
        parent1 = User(
            id=PARENT_1_ID, email="parent.kishor@school.edu",
            full_name="Mr. Ramesh Kumar (Parent)", role=UserRole.PARENT,
            password_hash=DEFAULT_PWD
        )

        session.add_all([
            super_admin, correspondent, admin, principal, vice_principal, dean_sci,
            dh_sci, dh_cs,
            t1, t2, t3,
            mentor1, mentor2,
            st1_u, st2_u, st3_u, st4_u, st5_u,
            parent1
        ])

        # ═══════════════════════════════════════════════════════
        # 3. CLASSES — All 16 grades × 2 sections = 32 classes
        # ═══════════════════════════════════════════════════════
        class_map = {}  # (grade, section) -> Class object
        for grade in GRADES:
            for section in SECTIONS:
                cls_id = str(uuid.uuid4())
                if grade == "10" and section == "A":
                    cls_id = "c1111111-1111-1111-1111-111111111111"
                elif grade == "10" and section == "B":
                    cls_id = "c2222222-2222-2222-2222-222222222222"

                cls = Class(id=cls_id, grade=grade, section=section)
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
        node1 = SyllabusNode(id="n1111111-1111-1111-1111-111111111111", subject_id=sub1.id, chapter_name="Kinematics", topic_name="Motion in One Dimension", weightage_percent=15.0, is_completed=True, completed_at=datetime.utcnow())
        node2 = SyllabusNode(id="n2222222-2222-2222-2222-222222222222", subject_id=sub1.id, chapter_name="Kinematics", topic_name="Projectiles & Vectors", weightage_percent=20.0, is_completed=False)
        node3 = SyllabusNode(id="n3333333-3333-3333-3333-333333333333", subject_id=sub1.id, chapter_name="Thermodynamics", topic_name="First Law of Thermodynamics", weightage_percent=25.0, is_completed=False)
        node4 = SyllabusNode(id="n4444444-4444-4444-4444-444444444444", subject_id=sub2.id, chapter_name="Data Structures", topic_name="Arrays & Linked Lists", weightage_percent=30.0, is_completed=True, completed_at=datetime.utcnow())
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
            user_id=STU_2_ID, class_id=c10a.id,
            admission_number="ADM-2026-043", roll_number="10A-02",
            full_name="Priya Sharma", father_name="Rajesh Sharma",
            mother_name="Sunita Sharma", guardian_phone="+919812345678",
            date_of_birth="2008-08-22", blood_group="A+",
            address="456 Park Avenue, Sector 12, New Delhi"
        )
        st3_p = Student(
            id="stp33333-3333-3333-3333-333333333333",
            user_id=STU_3_ID, class_id=c10a.id,
            admission_number="ADM-2026-044", roll_number="10A-03",
            full_name="Rahul Dev", father_name="Mohan Dev",
            mother_name="Sita Dev", guardian_phone="+919855512345",
            date_of_birth="2008-03-11", blood_group="B+",
            address="789 Green Lane, Sector 7, New Delhi"
        )
        st4_p = Student(
            id="stp44444-4444-4444-4444-444444444444",
            user_id=STU_4_ID, class_id=c10b.id,
            admission_number="ADM-2026-045", roll_number="10B-01",
            full_name="Ananya Krishna", father_name="Vijay Krishna",
            mother_name="Meera Krishna", guardian_phone="+919844456789",
            date_of_birth="2008-11-05", blood_group="AB+",
            address="321 Oak Road, Sector 9, New Delhi"
        )
        st5_p = Student(
            id="stp55555-5555-5555-5555-555555555555",
            user_id=STU_5_ID, class_id=c10b.id,
            admission_number="ADM-2026-046", roll_number="10B-02",
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
            due_date=datetime.utcnow() + timedelta(days=2)
        )
        lab2 = LabAssignment(
            id="lab22222-2222-2222-2222-222222222222",
            class_id=c10a.id, subject_id=sub1.id, teacher_id=TEACHER_1_ID,
            title="Lab 02: Verification of Ohm's Law & Circuit Analysis",
            description="Record voltage and current readings across variable resistors and plot V-I curve.",
            file_url="/uploads/ohms_law_lab_spec.pdf",
            due_date=datetime.utcnow() - timedelta(days=1)  # Expired due date to test 'late' status
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
        # 11. FEE PAYMENTS
        # ═══════════════════════════════════════════════════════
        fee1 = FeePayment(
            id="fee11111-1111-1111-1111-111111111111",
            student_id=STU_1_ID,
            title="Term 1 Tuition & Operations Fee",
            amount=450.00,
            payment_method="Card",
            transaction_id="TXN-2026-88F4A12B",
            receipt_number="RCP-2026-90412A",
            status="paid"
        )
        session.add(fee1)

        # ═══════════════════════════════════════════════════════
        # 12. PARENT STUDENT MAP & BUS ROUTES & LEAVE REQUESTS
        # ═══════════════════════════════════════════════════════
        ps_map1 = ParentStudentMap(
            id="ps111111-1111-1111-1111-111111111111",
            parent_id=PARENT_1_ID,
            student_id=STU_1_ID,
            relationship_type="Father"
        )
        session.add(ps_map1)

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

        await session.commit()
        print("=" * 60)
        print("DATABASE SEEDED SUCCESSFULLY!")
        print("=" * 60)
        print()
        print("Login Credentials (default password: school@123)")
        print("-" * 60)
        print(f"  Super Admin  : superadmin@school.edu")
        print(f"  Correspondent: correspondent@school.edu")
        print(f"  Admin        : admin@school.edu")
        print(f"  Principal    : principal@school.edu")
        print(f"  Vice Principal: vp@school.edu")
        print(f"  Dean (Sci)   : dean.science@school.edu")
        print(f"  Dept Head    : head.physics@school.edu")
        print(f"  Dept Head    : head.cs@school.edu")
        print(f"  Teacher      : sarah.connor@school.edu")
        print(f"  Teacher      : alan.turing@school.edu")
        print(f"  Teacher      : marie.curie@school.edu")
        print(f"  Mentor       : mentor.10a@school.edu")
        print(f"  Mentor       : mentor.10b@school.edu")
        print(f"  Student      : kishor.k@school.edu")
        print(f"  Parent       : parent.kishor@school.edu")
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
