import uuid
from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy.orm import selectinload
from sqlalchemy import func
from app.db.database import get_db
from app.db.models import (
    User, UserRole, MentorAssignment, Student, Attendance,
    SyllabusNode, LabSubmission, MentorLog
)
from app.schemas.mentorship import MentorLogCreate, MentorLogResponse, MenteeHolisticInsight
from app.core.auth import get_current_user, require_role

router = APIRouter(prefix="/mentorship", tags=["Mentorship Activity System"])


@router.get("/mentees", response_model=List[MenteeHolisticInsight])
async def get_assigned_mentees(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_role(
        UserRole.SUPER_ADMIN, UserRole.PRINCIPAL, UserRole.MENTOR
    )),
):
    """
    Get assigned mentees with holistic metrics (attendance rate %, portion tracker %, lab submission count).
    Mentors see their assigned class mentees; Admins/Principals see all mentees.
    """
    # 1. Fetch assigned classes for mentor
    if current_user.role == UserRole.MENTOR:
        ma_res = await db.execute(
            select(MentorAssignment).where(MentorAssignment.mentor_id == current_user.id)
        )
        assignments = ma_res.scalars().all()
        class_ids = [a.class_id for a in assignments]
        if not class_ids:
            # Fallback: get student profiles directly
            class_ids = []
    else:
        class_ids = []  # Empty means all classes for admin/principal

    # 2. Fetch student user records
    query = select(User).options(
        selectinload(User.student_profile).selectinload(Student.school_class)
    ).where(User.role == UserRole.STUDENT)

    if current_user.role == UserRole.MENTOR and class_ids:
        query = query.join(Student, Student.user_id == User.id).where(Student.class_id.in_(class_ids))

    res = await db.execute(query)
    students = res.scalars().all()

    insights = []
    for s in students:
        # Attendance %
        att_res = await db.execute(
            select(Attendance).where(Attendance.student_id == s.id)
        )
        attendance_rows = att_res.scalars().all()
        total_att = len(attendance_rows)
        present_att = sum(1 for a in attendance_rows if a.status.value in ["present", "late"])
        att_rate = round((present_att / total_att * 100.0), 1) if total_att > 0 else 0.0

        # Portion Progress %
        nodes_res = await db.execute(select(SyllabusNode))
        all_nodes = nodes_res.scalars().all()
        tot_nodes = len(all_nodes)
        comp_nodes = sum(1 for n in all_nodes if n.is_completed)
        portion_pct = round((comp_nodes / tot_nodes * 100.0), 1) if tot_nodes > 0 else 0.0

        # Lab Submissions
        labs_res = await db.execute(
            select(LabSubmission).where(LabSubmission.student_id == s.id)
        )
        labs = labs_res.scalars().all()
        sub_count = sum(1 for l in labs if l.status.value in ["submitted", "graded", "late"])
        pending_count = sum(1 for l in labs if l.status.value == "not_submitted")

        # Latest logs
        log_res = await db.execute(
            select(MentorLog)
            .options(selectinload(MentorLog.mentor), selectinload(MentorLog.student))
            .where(MentorLog.student_id == s.id)
            .order_by(MentorLog.created_at.desc())
            .limit(3)
        )
        recent_logs = log_res.scalars().all()

        log_responses = [
            MentorLogResponse(
                id=l.id,
                mentor_id=l.mentor_id,
                mentor_name=l.mentor.full_name if l.mentor else "Mentor",
                student_id=l.student_id,
                student_name=l.student.full_name if l.student else "Student",
                category=l.category,
                notes=l.notes,
                created_at=l.created_at,
            )
            for l in recent_logs
        ]

        grade_val = s.student_profile.school_class.grade if (s.student_profile and s.student_profile.school_class) else (s.assigned_grade or "10")
        sec_val = s.student_profile.school_class.section if (s.student_profile and s.student_profile.school_class) else "A"

        insights.append(MenteeHolisticInsight(
            student_id=s.id,
            student_name=s.full_name,
            email=s.email,
            grade=grade_val,
            section=sec_val,
            attendance_rate=att_rate,
            portion_progress=portion_pct,
            submitted_labs_count=sub_count,
            pending_labs_count=pending_count,
            latest_mentor_notes=log_responses,
        ))

    return insights


@router.post("/logs", response_model=MentorLogResponse)
async def create_mentor_log(
    req: MentorLogCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_role(
        UserRole.SUPER_ADMIN, UserRole.PRINCIPAL, UserRole.MENTOR
    )),
):
    """Log a mentorship activity note for a mentee."""
    student_res = await db.execute(select(User).where(User.id == req.student_id))
    student = student_res.scalars().first()
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")

    log_entry = MentorLog(
        id=str(uuid.uuid4()),
        mentor_id=current_user.id,
        student_id=req.student_id,
        category=req.category,
        notes=req.notes,
    )
    db.add(log_entry)
    await db.commit()
    await db.refresh(log_entry)

    return MentorLogResponse(
        id=log_entry.id,
        mentor_id=log_entry.mentor_id,
        mentor_name=current_user.full_name,
        student_id=log_entry.student_id,
        student_name=student.full_name,
        category=log_entry.category,
        notes=log_entry.notes,
        created_at=log_entry.created_at,
    )


@router.get("/logs/{student_id}", response_model=List[MentorLogResponse])
async def get_student_mentor_logs(
    student_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Get all mentorship logs for a student."""
    res = await db.execute(
        select(MentorLog)
        .options(selectinload(MentorLog.mentor), selectinload(MentorLog.student))
        .where(MentorLog.student_id == student_id)
        .order_by(MentorLog.created_at.desc())
    )
    logs = res.scalars().all()

    return [
        MentorLogResponse(
            id=l.id,
            mentor_id=l.mentor_id,
            mentor_name=l.mentor.full_name if l.mentor else "Mentor",
            student_id=l.student_id,
            student_name=l.student.full_name if l.student else "Student",
            category=l.category,
            notes=l.notes,
            created_at=l.created_at,
        )
        for l in logs
    ]
