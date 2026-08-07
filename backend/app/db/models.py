import uuid
from datetime import datetime, date
from sqlalchemy import Column, String, Text, Boolean, Integer, Numeric, Date, DateTime, ForeignKey, Enum as SQLEnum, UniqueConstraint
from sqlalchemy.orm import relationship
import enum
from app.db.database import Base

class UserRole(str, enum.Enum):
    SUPER_ADMIN = "super_admin"
    CORRESPONDENT = "correspondent"
    ADMIN = "admin"
    PRINCIPAL = "principal"
    VICE_PRINCIPAL = "vice_principal"
    DEAN = "dean"
    DEPT_HEAD = "dept_head"
    TEACHER = "teacher"
    MENTOR = "mentor"
    STUDENT = "student"
    PARENT = "parent"
    FINANCE = "finance"
    WARDEN = "warden"
    LIBRARIAN = "librarian"

class AttendanceStatus(str, enum.Enum):
    PRESENT = "present"
    ABSENT = "absent"
    LATE = "late"

class SubmissionStatus(str, enum.Enum):
    NOT_SUBMITTED = "not_submitted"
    SUBMITTED = "submitted"
    LATE = "late"
    GRADED = "graded"

class EmailStatus(str, enum.Enum):
    QUEUED = "queued"
    SENT = "sent"
    FAILED = "failed"

# ─── Role Hierarchy Utility ────────────────────────────────────
# Used for permission checks: higher roles inherit access
ROLE_HIERARCHY = {
    UserRole.SUPER_ADMIN: 10,
    UserRole.CORRESPONDENT: 9,
    UserRole.ADMIN: 8,
    UserRole.PRINCIPAL: 7,
    UserRole.VICE_PRINCIPAL: 6,
    UserRole.DEAN: 5,
    UserRole.DEPT_HEAD: 4,
    UserRole.TEACHER: 3,
    UserRole.MENTOR: 2,
    UserRole.STUDENT: 1,
    UserRole.PARENT: 1,
}


class Department(Base):
    __tablename__ = "departments"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    name = Column(String(100), unique=True, nullable=False)
    code = Column(String(20), unique=True, nullable=False)
    dean_id = Column(String(36), ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    created_at = Column(DateTime(timezone=True), default=datetime.utcnow)

    dean = relationship("User", foreign_keys=[dean_id], back_populates="headed_department")


class User(Base):
    __tablename__ = "users"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    email = Column(String(255), unique=True, nullable=False)
    full_name = Column(String(100), nullable=False)
    role = Column(SQLEnum(UserRole), nullable=False, default=UserRole.STUDENT)
    password_hash = Column(String(255), nullable=True)  # bcrypt hash
    department_id = Column(String(36), ForeignKey("departments.id", ondelete="SET NULL"), nullable=True)
    assigned_grade = Column(String(20), nullable=True)  # e.g., "10", "LKG", "UKG"
    phone = Column(String(20), nullable=True)
    roll_number = Column(String(50), nullable=True)
    admission_number = Column(String(50), nullable=True)
    age = Column(Integer, nullable=True)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), default=datetime.utcnow)
    updated_at = Column(DateTime(timezone=True), default=datetime.utcnow, onupdate=datetime.utcnow)

    student_profile = relationship("Student", uselist=False, back_populates="user", cascade="all, delete-orphan")
    department = relationship("Department", foreign_keys=[department_id], backref="members")
    headed_department = relationship("Department", foreign_keys=[Department.dean_id], back_populates="dean", uselist=False)
    mentor_assignments = relationship("MentorAssignment", back_populates="mentor", foreign_keys="MentorAssignment.mentor_id")


class MentorAssignment(Base):
    __tablename__ = "mentor_assignments"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    mentor_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    class_id = Column(String(36), ForeignKey("classes.id", ondelete="CASCADE"), nullable=False)
    created_at = Column(DateTime(timezone=True), default=datetime.utcnow)

    __table_args__ = (UniqueConstraint('mentor_id', 'class_id', name='uq_mentor_class'),)

    mentor = relationship("User", foreign_keys=[mentor_id], back_populates="mentor_assignments")
    school_class = relationship("Class")


class Student(Base):
    __tablename__ = "students"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=True)
    class_id = Column(String(36), ForeignKey("classes.id", ondelete="SET NULL"), nullable=True)
    admission_number = Column(String(50), unique=True, nullable=False)
    roll_number = Column(String(50), nullable=True)
    full_name = Column(String(100), nullable=False)
    father_name = Column(String(100), nullable=True)
    mother_name = Column(String(100), nullable=True)
    guardian_phone = Column(String(20), nullable=True)
    date_of_birth = Column(String(20), nullable=True)
    blood_group = Column(String(10), nullable=True)
    address = Column(Text, nullable=True)
    is_bus_user = Column(Boolean, default=False)
    is_hostel_user = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), default=datetime.utcnow)

    user = relationship("User", back_populates="student_profile")
    school_class = relationship("Class")

class Class(Base):
    __tablename__ = "classes"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    grade = Column(String(20), nullable=False)  # LKG, UKG, 1, 2, ..., 12
    section = Column(String(10), nullable=False)
    class_teacher_id = Column(String(36), ForeignKey("users.id", ondelete="SET NULL"), nullable=True)

    class_teacher = relationship("User", foreign_keys=[class_teacher_id])

    __table_args__ = (UniqueConstraint('grade', 'section', name='uq_class_grade_section'),)

class Subject(Base):
    __tablename__ = "subjects"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    code = Column(String(20), unique=True, nullable=False)
    name = Column(String(100), nullable=False)
    department_id = Column(String(36), ForeignKey("departments.id", ondelete="SET NULL"), nullable=True)

    department = relationship("Department")

class Classroom(Base):
    __tablename__ = "classrooms"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    name = Column(String(50), unique=True, nullable=False)
    capacity = Column(Integer, nullable=True)
    is_lab = Column(Boolean, default=False)
    building_block = Column(String(100), nullable=True)
    room_type = Column(String(50), nullable=False, default="classroom")
    assigned_class = Column(String(50), nullable=True)
    current_occupancy = Column(Integer, default=0)
    status = Column(String(20), nullable=False, default="available")

class SyllabusNode(Base):
    __tablename__ = "syllabus_nodes"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    subject_id = Column(String(36), ForeignKey("subjects.id", ondelete="CASCADE"), nullable=False)
    chapter_name = Column(String(150), nullable=False)
    topic_name = Column(String(200), nullable=False)
    weightage_percent = Column(Numeric(5, 2), default=0.00)
    is_completed = Column(Boolean, default=False)
    completed_at = Column(DateTime(timezone=True), nullable=True)

    subject = relationship("Subject")

class Timetable(Base):
    __tablename__ = "timetables"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    class_id = Column(String(36), ForeignKey("classes.id", ondelete="CASCADE"), nullable=False)
    teacher_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    subject_id = Column(String(36), ForeignKey("subjects.id", ondelete="CASCADE"), nullable=False)
    classroom_id = Column(String(36), ForeignKey("classrooms.id", ondelete="SET NULL"), nullable=True)
    day_of_week = Column(String(10), nullable=False)
    time_slot = Column(String(20), nullable=False)

    school_class = relationship("Class")
    teacher = relationship("User")
    subject = relationship("Subject")
    classroom = relationship("Classroom")

class Attendance(Base):
    __tablename__ = "attendance"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    student_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    class_id = Column(String(36), ForeignKey("classes.id", ondelete="CASCADE"), nullable=False)
    marked_by = Column(String(36), ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    date = Column(Date, nullable=False, default=date.today)
    status = Column(SQLEnum(AttendanceStatus), nullable=False)

    __table_args__ = (UniqueConstraint('student_id', 'date', name='uq_student_date_attendance'),)

    student = relationship("User", foreign_keys=[student_id])
    marked_by_user = relationship("User", foreign_keys=[marked_by])

class DailyWorkLog(Base):
    __tablename__ = "daily_work_logs"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    teacher_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    class_id = Column(String(36), ForeignKey("classes.id", ondelete="CASCADE"), nullable=False)
    subject_id = Column(String(36), ForeignKey("subjects.id", ondelete="CASCADE"), nullable=False)
    syllabus_node_id = Column(String(36), ForeignKey("syllabus_nodes.id", ondelete="SET NULL"), nullable=True)
    date = Column(Date, nullable=False, default=date.today)
    summary = Column(Text, nullable=False)
    created_at = Column(DateTime(timezone=True), default=datetime.utcnow)

    teacher = relationship("User")
    school_class = relationship("Class")
    subject = relationship("Subject")
    syllabus_node = relationship("SyllabusNode")

class LabAssignment(Base):
    __tablename__ = "lab_assignments"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    class_id = Column(String(36), ForeignKey("classes.id", ondelete="CASCADE"), nullable=False)
    subject_id = Column(String(36), ForeignKey("subjects.id", ondelete="CASCADE"), nullable=False)
    teacher_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    title = Column(String(200), nullable=False)
    description = Column(Text, nullable=True)
    file_url = Column(Text, nullable=True)
    due_date = Column(DateTime(timezone=True), nullable=False)
    created_at = Column(DateTime(timezone=True), default=datetime.utcnow)

    school_class = relationship("Class")
    subject = relationship("Subject")
    teacher = relationship("User")

class LabSubmission(Base):
    __tablename__ = "lab_submissions"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    lab_assignment_id = Column(String(36), ForeignKey("lab_assignments.id", ondelete="CASCADE"), nullable=False)
    student_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    file_url = Column(Text, nullable=True)
    status = Column(SQLEnum(SubmissionStatus), nullable=False, default=SubmissionStatus.NOT_SUBMITTED)
    submitted_at = Column(DateTime(timezone=True), nullable=True)
    grade = Column(Numeric(5, 2), nullable=True)
    feedback = Column(Text, nullable=True)

    __table_args__ = (UniqueConstraint('lab_assignment_id', 'student_id', name='uq_lab_student_submission'),)

    lab_assignment = relationship("LabAssignment")
    student = relationship("User")

class EmailLog(Base):
    __tablename__ = "email_logs"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    recipient_email = Column(String(255), nullable=False)
    subject = Column(String(200), nullable=False)
    body_summary = Column(Text, nullable=True)
    event_type = Column(String(50), nullable=True)
    related_id = Column(String(36), nullable=True)
    dedup_key = Column(String(255), unique=True, nullable=True)
    status = Column(SQLEnum(EmailStatus), nullable=False, default=EmailStatus.QUEUED)
    retry_count = Column(Integer, nullable=False, default=0)
    sent_at = Column(DateTime(timezone=True), nullable=True)
    created_at = Column(DateTime(timezone=True), default=datetime.utcnow)


class MentorLog(Base):
    __tablename__ = "mentor_logs"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    mentor_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    student_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    category = Column(String(50), nullable=False, default="academic")  # academic, behavioral, general
    notes = Column(Text, nullable=False)
    created_at = Column(DateTime(timezone=True), default=datetime.utcnow)

    mentor = relationship("User", foreign_keys=[mentor_id])
    student = relationship("User", foreign_keys=[student_id])


class FeePayment(Base):
    __tablename__ = "fee_payments"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    student_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    title = Column(String(200), nullable=False, default="Term Tuition Fee")
    amount = Column(Numeric(10, 2), nullable=False)
    payment_method = Column(String(50), nullable=False, default="Card")
    transaction_id = Column(String(100), unique=True, nullable=False)
    receipt_number = Column(String(100), unique=True, nullable=False)
    status = Column(String(20), nullable=False, default="paid")
    created_at = Column(DateTime(timezone=True), default=datetime.utcnow)

    student = relationship("User", foreign_keys=[student_id])


class ParentStudentMap(Base):
    __tablename__ = "parent_student_map"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    parent_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    student_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    relationship_type = Column(String(50), nullable=False, default="Parent")
    created_at = Column(DateTime(timezone=True), default=datetime.utcnow)

    __table_args__ = (UniqueConstraint('parent_id', 'student_id', name='uq_parent_student'),)

    parent = relationship("User", foreign_keys=[parent_id])
    student = relationship("User", foreign_keys=[student_id])


class LeaveRequest(Base):
    __tablename__ = "leave_requests"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    applicant_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    leave_type = Column(String(50), nullable=False, default="Casual")  # Casual, Medical, Academic
    start_date = Column(Date, nullable=False)
    end_date = Column(Date, nullable=False)
    reason = Column(Text, nullable=False)
    status = Column(String(20), nullable=False, default="pending")  # pending, approved, rejected
    approved_by = Column(String(36), ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    created_at = Column(DateTime(timezone=True), default=datetime.utcnow)

    applicant = relationship("User", foreign_keys=[applicant_id])
    approver = relationship("User", foreign_keys=[approved_by])


class TeacherSubstitution(Base):
    __tablename__ = "teacher_substitutions"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    timetable_id = Column(String(36), ForeignKey("timetables.id", ondelete="CASCADE"), nullable=False)
    original_teacher_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    substitute_teacher_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    date = Column(Date, nullable=False, default=date.today)
    status = Column(String(20), nullable=False, default="assigned")  # assigned, completed
    created_at = Column(DateTime(timezone=True), default=datetime.utcnow)

    timetable = relationship("Timetable")
    original_teacher = relationship("User", foreign_keys=[original_teacher_id])
    substitute_teacher = relationship("User", foreign_keys=[substitute_teacher_id])


class BusRoute(Base):
    __tablename__ = "bus_routes"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    route_name = Column(String(100), nullable=False)
    driver_name = Column(String(100), nullable=False)
    driver_phone = Column(String(20), nullable=False)
    bus_number = Column(String(50), nullable=False)
    current_location = Column(String(150), nullable=False, default="School Main Gate")
    status = Column(String(20), nullable=False, default="in_transit")  # in_transit, arrived, scheduled
    updated_at = Column(DateTime(timezone=True), default=datetime.utcnow)


class AcademicCalendarEvent(Base):
    __tablename__ = "academic_calendar_events"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    title = Column(String(200), nullable=False)
    description = Column(Text, nullable=True)
    start_date = Column(Date, nullable=False)
    end_date = Column(Date, nullable=False)
    event_type = Column(String(50), nullable=False, default="Academic")  # Holiday, Examination, Event, Academic, Meeting
    grade_scope = Column(String(50), nullable=False, default="all")  # "all", "LKG", "10", etc.
    created_by_id = Column(String(36), ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    created_at = Column(DateTime(timezone=True), default=datetime.utcnow)

    created_by = relationship("User", foreign_keys=[created_by_id])


class SalaryRecord(Base):
    __tablename__ = "salary_records"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    staff_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    month = Column(String(20), nullable=False)
    year = Column(Integer, nullable=False)
    base_salary = Column(Numeric(10, 2), nullable=False)
    allowances = Column(Numeric(10, 2), default=0.00)
    deductions = Column(Numeric(10, 2), default=0.00)
    net_salary = Column(Numeric(10, 2), nullable=False)
    status = Column(String(20), nullable=False, default="pending")  # pending, approved, rejected
    approved_by_id = Column(String(36), ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    remarks = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), default=datetime.utcnow)

    staff = relationship("User", foreign_keys=[staff_id])
    approved_by = relationship("User", foreign_keys=[approved_by_id])


class SchoolEventProposal(Base):
    __tablename__ = "school_event_proposals"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    title = Column(String(200), nullable=False)
    description = Column(Text, nullable=False)
    organizer_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    target_grades = Column(String(100), nullable=False, default="all")
    start_date = Column(Date, nullable=False)
    end_date = Column(Date, nullable=False)
    budget = Column(Numeric(10, 2), default=0.00)
    status = Column(String(20), nullable=False, default="pending")  # pending, approved, rejected
    approved_by_id = Column(String(36), ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    feedback = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), default=datetime.utcnow)

    organizer = relationship("User", foreign_keys=[organizer_id])
    approved_by = relationship("User", foreign_keys=[approved_by_id])


class ExamSchedule(Base):
    __tablename__ = "exam_schedules"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    exam_name = Column(String(150), nullable=False)  # e.g., "Term 1 Midterm Exam"
    grade = Column(String(20), nullable=False)  # e.g., "10", "12"
    subject_id = Column(String(36), ForeignKey("subjects.id", ondelete="CASCADE"), nullable=False)
    exam_date = Column(Date, nullable=False)
    start_time = Column(String(20), nullable=False)
    end_time = Column(String(20), nullable=False)
    max_marks = Column(Integer, default=100)
    classroom_id = Column(String(36), ForeignKey("classrooms.id", ondelete="SET NULL"), nullable=True)
    hall_allotment = Column(String(100), nullable=True)
    created_at = Column(DateTime(timezone=True), default=datetime.utcnow)

    subject = relationship("Subject")
    classroom = relationship("Classroom")


class Homework(Base):
    __tablename__ = "homeworks"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    class_id = Column(String(36), ForeignKey("classes.id", ondelete="CASCADE"), nullable=False)
    subject_id = Column(String(36), ForeignKey("subjects.id", ondelete="CASCADE"), nullable=False)
    teacher_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    title = Column(String(200), nullable=False)
    description = Column(Text, nullable=False)
    assigned_date = Column(Date, nullable=False, default=date.today)
    due_date = Column(Date, nullable=False)
    created_at = Column(DateTime(timezone=True), default=datetime.utcnow)

    school_class = relationship("Class")
    subject = relationship("Subject")
    teacher = relationship("User")


class Assignment(Base):
    __tablename__ = "assignments"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    class_id = Column(String(36), ForeignKey("classes.id", ondelete="CASCADE"), nullable=False)
    subject_id = Column(String(36), ForeignKey("subjects.id", ondelete="CASCADE"), nullable=False)
    teacher_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    title = Column(String(200), nullable=False)
    description = Column(Text, nullable=True)
    max_points = Column(Integer, default=100)
    due_date = Column(DateTime(timezone=True), nullable=False)
    attachment_url = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), default=datetime.utcnow)

    school_class = relationship("Class")
    subject = relationship("Subject")
    teacher = relationship("User")


class StudentQuery(Base):
    __tablename__ = "student_queries"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    student_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    query_type = Column(String(50), nullable=False, default="doubt")  # "doubt" or "leave_application"
    teacher_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    subject_id = Column(String(36), ForeignKey("subjects.id", ondelete="SET NULL"), nullable=True)
    class_id = Column(String(36), ForeignKey("classes.id", ondelete="SET NULL"), nullable=True)
    question_or_reason = Column(Text, nullable=False)
    response = Column(Text, nullable=True)
    status = Column(String(20), nullable=False, default="pending")  # pending, answered, approved, rejected
    created_at = Column(DateTime(timezone=True), default=datetime.utcnow)

    student = relationship("User", foreign_keys=[student_id])
    teacher = relationship("User", foreign_keys=[teacher_id])
    subject = relationship("Subject")
    school_class = relationship("Class")


class Announcement(Base):
    __tablename__ = "announcements"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    class_id = Column(String(36), ForeignKey("classes.id", ondelete="SET NULL"), nullable=True)  # Null = All Classes
    author_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    title = Column(String(200), nullable=False)
    content = Column(Text, nullable=False)
    priority = Column(String(20), default="normal")  # normal, high, urgent
    created_at = Column(DateTime(timezone=True), default=datetime.utcnow)

    author = relationship("User", foreign_keys=[author_id])
    school_class = relationship("Class")


# =====================================================================
# Finance Models
# =====================================================================

class FeeStructure(Base):
    __tablename__ = "fee_structures"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    grade = Column(String(20), nullable=False)
    fee_type = Column(String(50), nullable=False) # e.g., 'tuition', 'transport', 'hostel'
    amount = Column(Numeric(10, 2), nullable=False)
    academic_year = Column(String(20), nullable=False)
    due_date = Column(Date, nullable=True)

class FeeTransaction(Base):
    __tablename__ = "fee_transactions"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    student_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    fee_structure_id = Column(String(36), ForeignKey("fee_structures.id", ondelete="SET NULL"), nullable=True)
    amount_paid = Column(Numeric(10, 2), nullable=False)
    payment_method = Column(String(50), nullable=False) # 'cash', 'card', 'upi'
    transaction_date = Column(DateTime(timezone=True), default=datetime.utcnow)
    receipt_number = Column(String(100), unique=True, nullable=False)
    processed_by = Column(String(36), ForeignKey("users.id", ondelete="SET NULL"), nullable=True)

    student = relationship("User", foreign_keys=[student_id])
    fee_structure = relationship("FeeStructure")
    processor = relationship("User", foreign_keys=[processed_by])

class Payroll(Base):
    __tablename__ = "payroll"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    staff_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    month = Column(String(20), nullable=False) # e.g., '2026-08'
    base_salary = Column(Numeric(10, 2), nullable=False)
    bonuses = Column(Numeric(10, 2), default=0)
    deductions = Column(Numeric(10, 2), default=0)
    net_salary = Column(Numeric(10, 2), nullable=False)
    status = Column(String(20), nullable=False, default="pending") # 'pending', 'paid'
    paid_on = Column(DateTime(timezone=True), nullable=True)

    staff = relationship("User", foreign_keys=[staff_id])

# =====================================================================
# Warden / Hostel Models
# =====================================================================

class HostelRoom(Base):
    __tablename__ = "hostel_rooms"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    block_name = Column(String(50), nullable=False) # e.g., 'Block A', 'Girls Wing'
    room_number = Column(String(20), nullable=False)
    capacity = Column(Integer, nullable=False, default=2)
    current_occupancy = Column(Integer, nullable=False, default=0)
    status = Column(String(20), nullable=False, default="available") # 'available', 'full', 'maintenance'

    __table_args__ = (UniqueConstraint('block_name', 'room_number', name='uq_block_room'),)

class HostelAssignment(Base):
    __tablename__ = "hostel_assignments"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    student_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), unique=True, nullable=False)
    room_id = Column(String(36), ForeignKey("hostel_rooms.id", ondelete="CASCADE"), nullable=False)
    assigned_on = Column(Date, default=date.today)

    student = relationship("User", foreign_keys=[student_id])
    room = relationship("HostelRoom")

class Outpass(Base):
    __tablename__ = "outpasses"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    student_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    reason = Column(Text, nullable=False)
    departure_time = Column(DateTime(timezone=True), nullable=False)
    expected_return_time = Column(DateTime(timezone=True), nullable=False)
    actual_return_time = Column(DateTime(timezone=True), nullable=True)
    status = Column(String(20), nullable=False, default="pending") # 'pending', 'approved', 'rejected', 'active', 'completed'
    approved_by = Column(String(36), ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    created_at = Column(DateTime(timezone=True), default=datetime.utcnow)

    student = relationship("User", foreign_keys=[student_id])
    approver = relationship("User", foreign_keys=[approved_by])

# =====================================================================
# Advanced Finance Models (Phase 5)
# =====================================================================

class DepartmentBudget(Base):
    __tablename__ = "department_budgets"
    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    department_name = Column(String(100), nullable=False) # e.g., 'Academics', 'Hostel', 'Events', 'Infrastructure', 'Technology'
    academic_year = Column(String(20), nullable=False)
    allocated_amount = Column(Numeric(12, 2), nullable=False, default=0)
    utilized_amount = Column(Numeric(12, 2), nullable=False, default=0)
    created_at = Column(DateTime(timezone=True), default=datetime.utcnow)

class FinancialRequest(Base):
    __tablename__ = "financial_requests"
    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    requester_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    department_id = Column(String(36), ForeignKey("department_budgets.id", ondelete="SET NULL"), nullable=True)
    title = Column(String(200), nullable=False)
    description = Column(Text, nullable=False)
    amount = Column(Numeric(12, 2), nullable=False)
    status = Column(String(50), nullable=False, default="pending") # pending, approved_by_finance, approved_by_correspondent, rejected
    priority = Column(String(20), default="normal") # normal, high, urgent
    created_at = Column(DateTime(timezone=True), default=datetime.utcnow)
    
    requester = relationship("User", foreign_keys=[requester_id])
    department = relationship("DepartmentBudget")

class Vendor(Base):
    __tablename__ = "vendors"
    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    name = Column(String(150), nullable=False)
    category = Column(String(100), nullable=False) # e.g., 'IT Services', 'Food & Beverages', 'Stationery'
    contact_email = Column(String(100), nullable=True)
    contact_phone = Column(String(20), nullable=True)
    active_contract = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), default=datetime.utcnow)

class Expense(Base):
    __tablename__ = "expenses"
    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    department_id = Column(String(36), ForeignKey("department_budgets.id", ondelete="SET NULL"), nullable=True)
    vendor_id = Column(String(36), ForeignKey("vendors.id", ondelete="SET NULL"), nullable=True)
    request_id = Column(String(36), ForeignKey("financial_requests.id", ondelete="SET NULL"), nullable=True)
    title = Column(String(200), nullable=False)
    amount = Column(Numeric(12, 2), nullable=False)
    expense_date = Column(Date, default=date.today)
    processed_by = Column(String(36), ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    
    department = relationship("DepartmentBudget")
    vendor = relationship("Vendor")
    request = relationship("FinancialRequest")
    processor = relationship("User", foreign_keys=[processed_by])

class Scholarship(Base):
    __tablename__ = "scholarships"
    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    student_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    name = Column(String(150), nullable=False) # e.g., 'Merit Scholarship', 'Sports Quota'
    discount_amount = Column(Numeric(10, 2), nullable=False, default=0) # Flat deduction per fee structure calculation
    is_active = Column(Boolean, default=True)
    granted_by = Column(String(36), ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    created_at = Column(DateTime(timezone=True), default=datetime.utcnow)
    
    student = relationship("User", foreign_keys=[student_id])
    granter = relationship("User", foreign_keys=[granted_by])

# =====================================================================
# Advanced Hostel & Warden Models (Phase 6)
# =====================================================================

class HostelAttendance(Base):
    __tablename__ = "hostel_attendance"
    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    student_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    date = Column(Date, nullable=False, default=date.today)
    status = Column(String(20), nullable=False) # Present, Absent, Leave
    marked_by = Column(String(36), ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    
    student = relationship("User", foreign_keys=[student_id])

class IncidentReport(Base):
    __tablename__ = "incident_reports"
    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    student_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=True) # Optional, if it's general
    reported_by = Column(String(36), ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    severity = Column(String(20), default="Low") # Low, Medium, High, Critical
    category = Column(String(50), nullable=False) # Discipline, Health, Maintenance, Security
    description = Column(Text, nullable=False)
    status = Column(String(50), default="Open") # Open, Under Investigation, Resolved
    created_at = Column(DateTime(timezone=True), default=datetime.utcnow)
    
    student = relationship("User", foreign_keys=[student_id])
    reporter = relationship("User", foreign_keys=[reported_by])

class VisitorLog(Base):
    __tablename__ = "visitor_logs"
    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    visitor_name = Column(String(100), nullable=False)
    relation_to_student = Column(String(50), nullable=True)
    student_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=True)
    purpose = Column(String(200), nullable=False)
    check_in = Column(DateTime(timezone=True), default=datetime.utcnow)
    check_out = Column(DateTime(timezone=True), nullable=True)
    logged_by = Column(String(36), ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    
    student = relationship("User", foreign_keys=[student_id])


# ─── Library Management Ecosystem ─────────────────────────────

class Book(Base):
    __tablename__ = "library_books"
    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    title = Column(String(255), nullable=False)
    author = Column(String(255), nullable=False)
    isbn = Column(String(50), nullable=True, unique=True)
    category = Column(String(100), nullable=True)
    total_copies = Column(Integer, default=1)
    available_copies = Column(Integer, default=1)
    is_digital = Column(Boolean, default=False)
    digital_url = Column(String(500), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

class BookIssue(Base):
    __tablename__ = "library_issues"
    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    book_id = Column(String(36), ForeignKey("library_books.id"), nullable=False)
    user_id = Column(String(36), ForeignKey("users.id"), nullable=False)
    issue_date = Column(DateTime, default=datetime.utcnow)
    due_date = Column(DateTime, nullable=False)
    return_date = Column(DateTime, nullable=True)
    fine_amount = Column(Numeric(10, 2), default=0.0)
    status = Column(String(50), default="issued") # issued, returned, overdue
    
    book = relationship("Book")
    user = relationship("User")

class BookRequest(Base):
    __tablename__ = "library_requests"
    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    requested_by = Column(String(36), ForeignKey("users.id"), nullable=False)
    title = Column(String(255), nullable=False)
    author = Column(String(255), nullable=True)
    reason = Column(Text, nullable=True)
    status = Column(String(50), default="pending") # pending, approved, rejected, ordered
    created_at = Column(DateTime, default=datetime.utcnow)
    
    requester = relationship("User")

class DigitalResource(Base):
    __tablename__ = "library_digital_resources"
    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    title = Column(String(255), nullable=False)
    url = Column(String(500), nullable=False)
    category = Column(String(100), nullable=True)
    access_count = Column(Integer, default=0)
    created_at = Column(DateTime, default=datetime.utcnow)
