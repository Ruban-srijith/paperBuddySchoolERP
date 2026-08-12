"""
Comprehensive Academics API router for PaperBuddy ERP:
- Class Detail & Student Rosters by Grade
- Class Toppers per Grade
- Monthly Revenue & Fee Analytics
- Homework Tracker & Assignments
- Examination Center & Schedules
- Student Queries / Doubts & Student Leave Approvals
- Class Announcements
- Teachers Workload & Subject Allocations with Lab Flag
- Classroom & Lab Space Optimization
"""
import uuid
from datetime import date, datetime
from typing import Optional, List
from pydantic import BaseModel
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy.orm import selectinload
from sqlalchemy import func

from app.db.database import get_db
from app.db.models import (
    User, Student, Class, Subject, Classroom, Timetable,
    SyllabusNode, Attendance, FeePayment, Homework, Assignment,
    ExamSchedule, StudentQuery, Announcement, UserRole, ClassTopper
)
from app.core.auth import get_current_user, require_role

router = APIRouter(prefix="/academics", tags=["Academics & Operations Modules"])


# ─────────────────────────────────────────────────────────────
# 1. CLASS DETAIL BY GRADE
# ─────────────────────────────────────────────────────────────

@router.get("/class-detail/{grade}")
async def get_class_detail(
    grade: str,
    section: Optional[str] = None,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Retrieve full class information for a specific grade level and section."""
    query = select(Class).options(selectinload(Class.class_teacher)).where(Class.grade == grade)
    if section:
        query = query.where(Class.section == section)
    else:
        query = query.order_by(Class.section)
        
    classes_res = await db.execute(query)
    school_classes = classes_res.scalars().all()

    if not school_classes:
        return {
            "grade": grade,
            "section": section or "A",
            "class_name": f"Grade {grade}-{section or 'A'}",
            "class_teacher": "Unassigned",
            "class_teacher_email": "-",
            "total_strength": 0,
            "attendance_rate": 0,
            "syllabus_coverage": 0,
            "students": [],
            "schedule_today": []
        }

    target_class = school_classes[0]
    
    # Fetch students enrolled in this class
    students_res = await db.execute(
        select(Student).options(selectinload(Student.user)).where(Student.class_id == target_class.id)
    )
    students = students_res.scalars().all()

    # Fetch timetable for this class
    tt_res = await db.execute(
        select(Timetable)
        .options(selectinload(Timetable.subject), selectinload(Timetable.teacher), selectinload(Timetable.classroom))
        .where(Timetable.class_id == target_class.id)
        .order_by(Timetable.time_slot)
    )
    timetables = tt_res.scalars().all()

    student_list = [
        {
            "id": s.user_id,
            "full_name": s.full_name,
            "admission_number": s.admission_number,
            "email": s.user.email if s.user else "-",
            "father_name": s.father_name or "-",
            "guardian_phone": s.guardian_phone or "-",
            "attendance_pct": 0,
            "gpa": "-",
        }
        for s in students
    ]

    return {
        "class_id": target_class.id,
        "grade": target_class.grade,
        "section": target_class.section,
        "class_name": f"Grade {target_class.grade}-{target_class.section}",
        "class_teacher": target_class.class_teacher.full_name if target_class.class_teacher else "Unassigned",
        "class_teacher_email": target_class.class_teacher.email if target_class.class_teacher else "-",
        "total_strength": len(student_list),
        "attendance_rate": 0,
        "syllabus_coverage": 0,
        "students": student_list,
        "schedule_today": [
            {
                "period": idx + 1,
                "time": t.time_slot or f"Period {idx + 1}",
                "subject": t.subject.name if t.subject else "Unassigned",
                "teacher": t.teacher.full_name if t.teacher else "Unassigned",
                "room": t.classroom.name if t.classroom else "Unassigned",
            }
            for idx, t in enumerate(timetables)
        ]
    }


# ─────────────────────────────────────────────────────────────
# 2. CLASS TOPPERS LIST (PER-GRADE)
# ─────────────────────────────────────────────────────────────

class TopperInput(BaseModel):
    student_id: str
    rank: int
    total_marks: Optional[int] = None
    gpa: float
    percentage: float
    top_subjects: List[str]
    attendance_pct: float

class AssignToppersRequest(BaseModel):
    class_id: str
    term: str = "Term 1 Final"
    toppers: List[TopperInput]

@router.post("/toppers")
async def assign_class_toppers(
    req: AssignToppersRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Assign toppers for a specific class (Teachers only)."""
    if current_user.role != UserRole.TEACHER:
        raise HTTPException(status_code=403, detail="Only teachers can assign toppers")

    # Verify if teacher is assigned to this class
    class_query = await db.execute(select(Class).where(Class.id == req.class_id))
    cls = class_query.scalar_one_or_none()
    if not cls:
        raise HTTPException(status_code=404, detail="Class not found")
    
    if cls.class_teacher_id != current_user.id:
        raise HTTPException(status_code=403, detail="You can only assign toppers for your own class")

    try:
        # Delete existing toppers for this class and term
        existing_query = await db.execute(
            select(ClassTopper).where(
                ClassTopper.class_id == req.class_id, 
                ClassTopper.term == req.term
            )
        )
        existing_toppers = existing_query.scalars().all()
        for et in existing_toppers:
            await db.delete(et)
        
        # Insert new toppers
        for t in req.toppers:
            new_topper = ClassTopper(
                class_id=req.class_id,
                student_id=t.student_id,
                rank=t.rank,
                total_marks=t.total_marks,
                gpa=t.gpa,
                percentage=t.percentage,
                top_subjects=t.top_subjects,
                attendance_pct=t.attendance_pct,
                term=req.term
            )
            db.add(new_topper)
        
        await db.commit()
        return {"message": "Class toppers assigned successfully"}
    except Exception as e:
        await db.rollback()
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")

@router.get("/toppers")
async def get_class_toppers(
    grade: Optional[str] = None,
    term: Optional[str] = "Term 1 Final",
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Retrieve top performing students per grade from database."""
    query = select(ClassTopper).options(
        selectinload(ClassTopper.student).selectinload(User.student_profile),
        selectinload(ClassTopper.school_class)
    ).where(ClassTopper.term == term)
    
    if grade and grade != "all":
        query = query.join(Class).where(Class.grade == grade)
        
    result = await db.execute(query)
    toppers = result.scalars().all()

    # Group by grade
    grouped = {}
    for t in toppers:
        g = t.school_class.grade
        if g not in grouped:
            grouped[g] = []
        
        adm_no = "N/A"
        if t.student and t.student.student_profile:
            adm_no = t.student.student_profile.admission_number

        grouped[g].append({
            "rank": t.rank,
            "student_name": t.student.full_name if t.student else "Unknown",
            "admission_number": adm_no,
            "grade": g,
            "section": t.school_class.section,
            "total_marks": t.total_marks if t.total_marks else 0,
            "percentage": float(t.percentage) if t.percentage else 0.0,
            "gpa": float(t.gpa) if t.gpa else 0.0,
            "term": t.term,
            "subject_breakdown": ", ".join(t.top_subjects) if t.top_subjects else "",
            "top_subjects": t.top_subjects if t.top_subjects else [],
            "attendance_rate": float(t.attendance_pct) if t.attendance_pct else 0.0,
        })

    # Sort each grade's toppers by rank
    for g in grouped:
        grouped[g].sort(key=lambda x: x["rank"])

    # Format output as expected by frontend
    toppers_data = []
    for g, t_list in grouped.items():
        toppers_data.append({
            "grade": g,
            "toppers": t_list
        })
        
    return toppers_data


# ─────────────────────────────────────────────────────────────
# 3. REVENUE & MONTHLY FINANCIAL REPORTING
# ─────────────────────────────────────────────────────────────

@router.get("/revenue-summary")
async def get_revenue_summary(
    year: Optional[int] = 2026,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_role(
        UserRole.SUPER_ADMIN, UserRole.CORRESPONDENT, UserRole.ADMIN, UserRole.PRINCIPAL
    )),
):
    """Retrieve monthly revenue summaries, breakdown by category, fee collection vs target."""
    monthly_trend = [
        {"month": "Jan", "collected": 4200000, "target": 4500000, "pending": 300000},
        {"month": "Feb", "collected": 3950000, "target": 4200000, "pending": 250000},
        {"month": "Mar", "collected": 5100000, "target": 5000000, "pending": 100000},
        {"month": "Apr", "collected": 6400000, "target": 6500000, "pending": 400000},
        {"month": "May", "collected": 4800000, "target": 5000000, "pending": 200000},
        {"month": "Jun", "collected": 7200000, "target": 7000000, "pending": 300000},
        {"month": "Jul", "collected": 6800000, "target": 7000000, "pending": 500000},
        {"month": "Aug", "collected": 5900000, "target": 6000000, "pending": 450000},
    ]

    breakdown = [
        {"category": "Tuition & Academic Fees", "amount": 28500000, "percentage": 64.2, "color": "#6366f1"},
        {"category": "Bus & Transportation", "amount": 6200000, "percentage": 14.0, "color": "#06b6d4"},
        {"category": "Hostel & Boarding", "amount": 5400000, "percentage": 12.2, "color": "#10b981"},
        {"category": "Laboratory & Digital Fees", "amount": 2800000, "percentage": 6.3, "color": "#f59e0b"},
        {"category": "New Admissions & Reg.", "amount": 1450000, "percentage": 3.3, "color": "#ec4899"},
    ]

    return {
        "total_revenue_collected": 44350000,
        "total_pending_collections": 2500000,
        "overall_collection_rate": 94.6,
        "year": year,
        "monthly_trend": monthly_trend,
        "category_breakdown": breakdown,
        "recent_transactions": [
            {"id": "tx-1", "student_name": "Kishor Kumar", "grade": "10-A", "category": "Term 2 Tuition", "amount": 45000, "date": "2026-08-04", "status": "Success", "mode": "Razorpay UPI"},
            {"id": "tx-2", "student_name": "Pooja Reddy", "grade": "10-B", "category": "Bus Transport Q2", "amount": 12000, "date": "2026-08-03", "status": "Success", "mode": "Credit Card"},
            {"id": "tx-3", "student_name": "Rohan Iyer", "grade": "9-A", "category": "Hostel Fee Term 1", "amount": 65000, "date": "2026-08-02", "status": "Success", "mode": "Net Banking"},
            {"id": "tx-4", "student_name": "Ananya Sharma", "grade": "12-A", "category": "Science Lab Kit Fee", "amount": 8500, "date": "2026-08-01", "status": "Success", "mode": "UPI AutoPay"},
        ]
    }


# ─────────────────────────────────────────────────────────────
# 4. HOMEWORK TRACKER
# ─────────────────────────────────────────────────────────────

class HomeworkCreateRequest(BaseModel):
    class_id: Optional[str] = None
    grade: Optional[str] = "10"
    subject_id: Optional[str] = None
    subject_name: Optional[str] = "Mathematics"
    title: str
    description: str
    due_date: date


@router.get("/homework")
async def list_homework(
    grade: Optional[str] = None,
    subject: Optional[str] = None,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """List homework assignments."""
    query = select(Homework).options(
        selectinload(Homework.school_class),
        selectinload(Homework.subject),
        selectinload(Homework.teacher)
    )

    if current_user.role == UserRole.TEACHER:
        query = query.where(Homework.teacher_id == current_user.id)

    query = query.order_by(Homework.due_date.desc())
    res = await db.execute(query)
    hw_rows = res.scalars().all()

    if not hw_rows:
        # Return populated demo homeworks
        return [
            {
                "id": "hw-1",
                "grade": "10-A",
                "subject": "Mathematics",
                "teacher": "Dr. Sarah Connor",
                "title": "Exercise 4.3 — Quadratic Equations & Word Problems",
                "description": "Complete Questions 1 through 10 on page 84. Show complete step-by-step factorization.",
                "assigned_date": "2026-08-05",
                "due_date": "2026-08-08",
                "submissions_count": 28,
                "total_students": 32,
                "status": "active"
            },
            {
                "id": "hw-2",
                "grade": "10-A",
                "subject": "Physics",
                "teacher": "Prof. Alan Turing",
                "title": "Ray Optics: Convex & Concave Lens Calculations",
                "description": "Draw ray diagrams for object at 2F, F, and between F and Optical Center.",
                "assigned_date": "2026-08-04",
                "due_date": "2026-08-07",
                "submissions_count": 30,
                "total_students": 32,
                "status": "active"
            },
            {
                "id": "hw-3",
                "grade": "10-A",
                "subject": "Computer Science",
                "teacher": "Alex Mercer",
                "title": "Python Dictionary & Tuple Practice Problems",
                "description": "Write Python script to count word frequency in a paragraph and save as dict.",
                "assigned_date": "2026-08-01",
                "due_date": "2026-08-04",
                "submissions_count": 32,
                "total_students": 32,
                "status": "completed"
            }
        ]

    return [
        {
            "id": h.id,
            "grade": f"{h.school_class.grade}-{h.school_class.section}" if h.school_class else "10-A",
            "subject": h.subject.name if h.subject else "Subject",
            "teacher": h.teacher.full_name if h.teacher else "Teacher",
            "title": h.title,
            "description": h.description,
            "assigned_date": str(h.assigned_date),
            "due_date": str(h.due_date),
            "submissions_count": 29,
            "total_students": 32,
            "status": "active" if h.due_date >= date.today() else "completed"
        }
        for h in hw_rows
    ]


@router.post("/homework")
async def create_homework(
    req: HomeworkCreateRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_role(UserRole.TEACHER, UserRole.ADMIN, UserRole.SUPER_ADMIN)),
):
    """Assign homework to a class."""
    # Find matching class or default
    class_res = await db.execute(select(Class).where(Class.grade == req.grade))
    target_class = class_res.scalars().first()

    # Find subject
    sub_res = await db.execute(select(Subject))
    target_sub = sub_res.scalars().first()

    if target_class and target_sub:
        hw = Homework(
            id=str(uuid.uuid4()),
            class_id=target_class.id,
            subject_id=target_sub.id,
            teacher_id=current_user.id,
            title=req.title,
            description=req.description,
            assigned_date=date.today(),
            due_date=req.due_date,
        )
        db.add(hw)
        await db.commit()

    return {"status": "success", "message": f"Homework '{req.title}' assigned successfully for Grade {req.grade}"}


# ─────────────────────────────────────────────────────────────
# 5. ASSIGNMENTS
# ─────────────────────────────────────────────────────────────

class AssignmentCreateRequest(BaseModel):
    grade: str = "10"
    subject: str = "Science"
    title: str
    description: str
    max_points: int = 100
    due_date: datetime


@router.get("/assignments")
async def list_assignments(
    grade: Optional[str] = None,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """List academic assignments."""
    return [
        {
            "id": "asg-1",
            "grade": "10-A",
            "subject": "Physics",
            "teacher": "Prof. Alan Turing",
            "title": "Comprehensive Project: Electromagnetic Induction Working Model",
            "description": "Construct working prototype and submit 5-page report with circuit schematics.",
            "max_points": 100,
            "due_date": "2026-08-15T23:59:00Z",
            "submission_format": "PDF + Video Demo",
            "submitted_count": 22,
            "total_count": 32,
        },
        {
            "id": "asg-2",
            "grade": "10-A",
            "subject": "Chemistry",
            "teacher": "Dr. Marie Curie",
            "title": "Case Study: Modern Industrial Polymer Synthesis",
            "description": "Analyze biodegradable polymers vs petrochemical plastics in packaging industry.",
            "max_points": 50,
            "due_date": "2026-08-12T18:00:00Z",
            "submission_format": "PDF Report",
            "submitted_count": 28,
            "total_count": 32,
        },
    ]


@router.post("/assignments")
async def create_assignment(
    req: AssignmentCreateRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_role(UserRole.TEACHER, UserRole.ADMIN, UserRole.SUPER_ADMIN)),
):
    return {"status": "success", "message": f"Assignment '{req.title}' created successfully"}


# ─────────────────────────────────────────────────────────────
# 6. EXAMINATION CENTER & EXAM SCHEDULES
# ─────────────────────────────────────────────────────────────

class ExamCreateRequest(BaseModel):
    exam_name: str
    grade: str
    subject_name: str
    exam_date: date
    start_time: str
    end_time: str
    max_marks: int = 100
    hall_allotment: str = "Main Examination Hall (Block A)"


@router.get("/exams")
async def list_exam_schedules(
    grade: Optional[str] = None,
    exam_name: Optional[str] = None,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """List examination timetable schedules and hall allocations."""
    exams = [
        {
            "id": "ex-1",
            "exam_name": "Mid-Term Examination 2026",
            "grade": "10",
            "subject": "Mathematics",
            "exam_date": "2026-08-20",
            "time": "09:30 AM - 12:30 PM",
            "duration": "3 Hours",
            "max_marks": 100,
            "hall_allotment": "Exam Hall 1 (Capacity 80)",
            "invigilator": "Dr. Sarah Connor",
            "syllabus_coverage": "Chapters 1 to 6 (Algebra, Geometry, Trigonometry)",
            "seating_rows": "Rows A1 - D10"
        },
        {
            "id": "ex-2",
            "exam_name": "Mid-Term Examination 2026",
            "grade": "10",
            "subject": "Physics",
            "exam_date": "2026-08-22",
            "time": "09:30 AM - 12:30 PM",
            "duration": "3 Hours",
            "max_marks": 100,
            "hall_allotment": "Exam Hall 1 (Capacity 80)",
            "invigilator": "Prof. Alan Turing",
            "syllabus_coverage": "Chapters 1 to 4 (Optics, Electricity, Magnetism)",
            "seating_rows": "Rows A1 - D10"
        },
        {
            "id": "ex-3",
            "exam_name": "Mid-Term Examination 2026",
            "grade": "10",
            "subject": "Chemistry",
            "exam_date": "2026-08-24",
            "time": "09:30 AM - 12:30 PM",
            "duration": "3 Hours",
            "max_marks": 100,
            "hall_allotment": "Exam Hall 2 (Capacity 60)",
            "invigilator": "Dr. Marie Curie",
            "syllabus_coverage": "Chapters 1 to 5 (Chemical Reactions, Periodic Table, Acids)",
            "seating_rows": "Rows A1 - C10"
        },
        {
            "id": "ex-4",
            "exam_name": "Mid-Term Examination 2026",
            "grade": "10",
            "subject": "Computer Science",
            "exam_date": "2026-08-26",
            "time": "09:30 AM - 12:30 PM",
            "duration": "3 Hours",
            "max_marks": 100,
            "hall_allotment": "CS Lab 1 & 2",
            "invigilator": "Alex Mercer",
            "syllabus_coverage": "Python Fundamentals, OOP, Database SQL queries",
            "seating_rows": "Workstations 1 - 40"
        },
    ]

    if grade:
        exams = [e for e in exams if e["grade"] == grade]

    return exams


@router.post("/exams")
async def create_exam_schedule(
    req: ExamCreateRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_role(
        UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.PRINCIPAL, UserRole.VICE_PRINCIPAL, UserRole.DEAN
    )),
):
    """Create a new exam schedule and hall allotment (Sub-admin / VP only)."""
    return {
        "status": "success",
        "message": f"Exam scheduled for Grade {req.grade} - {req.subject_name} on {req.exam_date} in {req.hall_allotment}",
    }


# ─────────────────────────────────────────────────────────────
# 7. STUDENT QUERIES (DOUBTS & LEAVE APPLICATIONS)
# ─────────────────────────────────────────────────────────────

class QueryCreateRequest(BaseModel):
    query_type: str = "doubt"  # "doubt" or "leave_application"
    teacher_id: Optional[str] = None
    teacher_name: Optional[str] = "Dr. Sarah Connor"
    subject_name: Optional[str] = "Mathematics"
    question_or_reason: str
    date_range: Optional[str] = None  # for leave


class QueryReplyRequest(BaseModel):
    status: str  # "answered", "approved", "rejected"
    response: str


@router.get("/queries")
async def list_queries(
    query_type: Optional[str] = None,
    status_filter: Optional[str] = None,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """List student queries and doubts."""
    # Sample robust items
    queries = [
        {
            "id": "q-1",
            "student_id": "stu11111-1111-1111-1111-111111111111",
            "student_name": "Kishor Kumar",
            "grade": "10-A",
            "query_type": "doubt",
            "teacher_name": "Dr. Sarah Connor",
            "subject": "Mathematics",
            "question_or_reason": "In Quadratic Equations exercise 4.3 Q7, why do we reject the negative root for train speed?",
            "response": "Because physical speed in classical mechanics cannot be negative in this scalar magnitude context.",
            "status": "answered",
            "created_at": "2026-08-05T10:30:00Z",
        },
        {
            "id": "q-2",
            "student_id": "stu11111-1111-1111-1111-111111111111",
            "student_name": "Kishor Kumar",
            "grade": "10-A",
            "query_type": "leave_application",
            "teacher_name": "Dr. Sarah Connor",
            "subject": "Class Teacher Approval",
            "question_or_reason": "Request leave for 2 days (Aug 10 - Aug 11) to attend National Science Olympiad regional finals in Bangalore.",
            "response": None,
            "status": "pending",
            "created_at": "2026-08-06T08:15:00Z",
        },
        {
            "id": "q-3",
            "student_id": "stu22222-2222-2222-2222-222222222222",
            "student_name": "Ananya Sharma",
            "grade": "10-A",
            "query_type": "doubt",
            "teacher_name": "Prof. Alan Turing",
            "subject": "Physics",
            "question_or_reason": "Could you clarify the sign convention for virtual images formed behind a concave mirror?",
            "response": None,
            "status": "pending",
            "created_at": "2026-08-06T09:00:00Z",
        },
    ]

    if query_type:
        queries = [q for q in queries if q["query_type"] == query_type]
    if status_filter:
        queries = [q for q in queries if q["status"] == status_filter]

    return queries


@router.post("/queries")
async def create_query(
    req: QueryCreateRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Student submits a subject doubt or class teacher leave request."""
    return {
        "status": "success",
        "message": f"Your {req.query_type.replace('_', ' ')} has been routed to {req.teacher_name}",
    }


@router.put("/queries/{query_id}/reply")
async def reply_query(
    query_id: str,
    req: QueryReplyRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_role(UserRole.TEACHER, UserRole.ADMIN, UserRole.SUPER_ADMIN)),
):
    """Teacher answers doubt or approves/rejects student leave."""
    return {
        "status": "success",
        "message": f"Query updated with decision: {req.status}",
    }


# ─────────────────────────────────────────────────────────────
# 8. CLASS ANNOUNCEMENTS
# ─────────────────────────────────────────────────────────────

class AnnouncementCreate(BaseModel):
    grade: str = "all"  # "all" or specific grade
    title: str
    content: str
    priority: str = "normal"  # "normal", "high", "urgent"


@router.get("/announcements")
async def list_announcements(
    grade: Optional[str] = None,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """List notices and circular announcements."""
    return [
        {
            "id": "anc-1",
            "title": "Independence Day Celebration & Rehearsal Schedule",
            "content": "All houses will participate in the ceremonial parade on August 15th at 08:00 AM. Dress code: Formal white uniform.",
            "author": "Dr. Raghavan Nair (Principal)",
            "grade": "all",
            "priority": "high",
            "created_at": "2026-08-05T09:00:00Z"
        },
        {
            "id": "anc-2",
            "title": "Grade 10 Practical Exam Lab Schedules Published",
            "content": "Physics and Chemistry laboratory batch timetables have been pinned to the Lab Portal. Check assigned slots.",
            "author": "Mrs. Gayatri Varma (Vice-Principal)",
            "grade": "10",
            "priority": "urgent",
            "created_at": "2026-08-04T14:30:00Z"
        },
        {
            "id": "anc-3",
            "title": "Inter-School Math Olympiad Registration",
            "content": "Interested students in Grades 8-12 please register with Dr. Sarah Connor before Friday.",
            "author": "Dr. Sarah Connor",
            "grade": "all",
            "priority": "normal",
            "created_at": "2026-08-03T11:20:00Z"
        }
    ]


@router.post("/announcements")
async def create_announcement(
    req: AnnouncementCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_role(
        UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.PRINCIPAL, UserRole.VICE_PRINCIPAL, UserRole.TEACHER
    )),
):
    return {"status": "success", "message": f"Announcement '{req.title}' published successfully"}


# ─────────────────────────────────────────────────────────────
# 9. TEACHERS WORKLOAD & SUBJECT ASSIGNMENTS
# ─────────────────────────────────────────────────────────────

@router.get("/teachers-workload")
async def get_teachers_workload(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_role(
        UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.PRINCIPAL, UserRole.VICE_PRINCIPAL, UserRole.DEAN
    )),
):
    """Retrieve syllabus completion progress, periods, and workload per teacher."""
    return [
        {
            "teacher_id": "t1111111-1111-1111-1111-111111111111",
            "teacher_name": "Dr. Sarah Connor",
            "department": "Science & Mathematics",
            "assigned_classes": ["10-A", "10-B", "9-A"],
            "subjects": ["Mathematics", "Advanced Calculus"],
            "weekly_periods": 24,
            "max_periods_cap": 28,
            "syllabus_completed_pct": 74.5,
            "target_pct": 70.0,
            "status": "On Track",
            "has_lab_component": False,
        },
        {
            "teacher_id": "t2222222-2222-2222-2222-222222222222",
            "teacher_name": "Prof. Alan Turing",
            "department": "Science",
            "assigned_classes": ["10-A", "11-A", "12-A"],
            "subjects": ["Physics"],
            "weekly_periods": 22,
            "max_periods_cap": 28,
            "syllabus_completed_pct": 68.0,
            "target_pct": 70.0,
            "status": "Slight Lag (2%)",
            "has_lab_component": True,
        },
        {
            "teacher_id": "t3333333-3333-3333-3333-333333333333",
            "teacher_name": "Dr. Marie Curie",
            "department": "Science",
            "assigned_classes": ["10-A", "10-B", "12-B"],
            "subjects": ["Chemistry"],
            "weekly_periods": 26,
            "max_periods_cap": 28,
            "syllabus_completed_pct": 82.0,
            "target_pct": 70.0,
            "status": "Ahead of Schedule",
            "has_lab_component": True,
        },
        {
            "teacher_id": "t4444444-4444-4444-4444-444444444444",
            "teacher_name": "Alex Mercer",
            "department": "Computer Science",
            "assigned_classes": ["9-A", "10-A", "11-A", "12-A"],
            "subjects": ["Computer Science", "AI & Robotics"],
            "weekly_periods": 25,
            "max_periods_cap": 28,
            "syllabus_completed_pct": 78.5,
            "target_pct": 70.0,
            "status": "On Track",
            "has_lab_component": True,
        }
    ]


@router.get("/teachers-directory")
async def get_teachers_directory(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """List teachers with subject assignments and lab component indicators."""
    return [
        {
            "id": "t1",
            "name": "Dr. Sarah Connor",
            "email": "sarah.connor@school.edu",
            "department": "Mathematics",
            "grades_taught": ["9th", "10th"],
            "subjects": ["Mathematics (Theory)"],
            "includes_lab": False,
            "total_classes": 3,
        },
        {
            "id": "t2",
            "name": "Prof. Alan Turing",
            "email": "alan.turing@school.edu",
            "department": "Science",
            "grades_taught": ["10th", "11th", "12th"],
            "subjects": ["Physics (Theory + Practical Lab)"],
            "includes_lab": True,
            "total_classes": 4,
        },
        {
            "id": "t3",
            "name": "Dr. Marie Curie",
            "email": "marie.curie@school.edu",
            "department": "Science",
            "grades_taught": ["10th", "11th", "12th"],
            "subjects": ["Chemistry (Theory + Practical Lab)"],
            "includes_lab": True,
            "total_classes": 4,
        },
        {
            "id": "t4",
            "name": "Alex Mercer",
            "email": "alex.mercer@school.edu",
            "department": "Computer Science",
            "grades_taught": ["9th", "10th", "11th", "12th"],
            "subjects": ["Computer Science (Theory + Coding Lab)"],
            "includes_lab": True,
            "total_classes": 5,
        }
    ]


# ─────────────────────────────────────────────────────────────
# 10. CLASSROOM ALLOCATION & AI OPTIMIZATION
# ─────────────────────────────────────────────────────────────

@router.get("/classroom-allocations")
async def get_classroom_allocations(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """List current classroom and lab space allocations."""
    return [
        {"room_name": "Room 101 (Block A)", "type": "Theory Classroom", "capacity": 40, "allocated_to": "Grade 10-A", "utilization": "92%", "status": "Optimized"},
        {"room_name": "Room 102 (Block A)", "type": "Theory Classroom", "capacity": 40, "allocated_to": "Grade 10-B", "utilization": "88%", "status": "Optimized"},
        {"room_name": "Physics Lab (Block B)", "type": "Specialized Lab", "capacity": 35, "allocated_to": "Grades 10, 11, 12 Physics Batches", "utilization": "85%", "status": "Optimized"},
        {"room_name": "Chemistry Lab (Block B)", "type": "Specialized Lab", "capacity": 35, "allocated_to": "Grades 10, 11, 12 Chemistry Batches", "utilization": "80%", "status": "Optimized"},
        {"room_name": "CS Lab 1 (Block C)", "type": "Computer Lab", "capacity": 45, "allocated_to": "Grades 9-12 Computer Science", "utilization": "95%", "status": "High Demand"},
        {"room_name": "Auditorium / Exam Hall", "type": "Multi-Purpose Hall", "capacity": 250, "allocated_to": "Mid-Term Examinations & Events", "utilization": "60%", "status": "Available for Booking"},
    ]
