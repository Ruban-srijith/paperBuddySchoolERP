import uuid
from datetime import datetime, date
from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy.orm import selectinload
from app.db.database import get_db
from app.db.models import Attendance, DailyWorkLog, SyllabusNode, AttendanceStatus, User, UserRole, Timetable
from app.schemas.attendance import BatchAttendanceRequest, WorkLogCreateRequest, WorkLogResponse
from app.core.auth import get_current_user, require_role

router = APIRouter(tags=["Attendance & Daily Work Logs"])

@router.post("/attendance/batch")
async def batch_mark_attendance(
    req: BatchAttendanceRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_role(
        UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.TEACHER, UserRole.MENTOR
    )),
):
    """Mark attendance for a batch of students (max 60 per request). Teachers can mark today / past 48h."""
    # 1. Enforce max 60 students per request constraint
    if len(req.records) > 60:
        raise HTTPException(
            status_code=400,
            detail="Batch attendance request exceeds maximum limit of 60 students per request."
        )

    # 2. Date boundary check — only till today (no future dates)
    today = date.today()
    if req.date > today:
        raise HTTPException(
            status_code=400,
            detail="Attendance cannot be marked for future dates (only till today)."
        )

    # 3. 48h boundary check for Teachers/Mentors (Admins can override older past dates)
    from datetime import timedelta
    if current_user.role in [UserRole.TEACHER, UserRole.MENTOR]:
        cutoff_date = today - timedelta(days=2)
        if req.date < cutoff_date:
            raise HTTPException(
                status_code=403,
                detail="Teachers can only mark attendance for today or the past 48 hours. Contact Admin for older past date overrides."
            )

    # Scope check: Teachers can only mark attendance for classes they teach
    if current_user.role == UserRole.TEACHER:
        tt_res = await db.execute(
            select(Timetable).where(
                Timetable.teacher_id == current_user.id,
                Timetable.class_id == req.class_id
            )
        )
        if not tt_res.scalars().first():
            raise HTTPException(status_code=403, detail="You can only mark attendance for your own classes")

    saved_records = []
    for rec in req.records:
        # Check if record for student and date exists
        q = select(Attendance).where(
            Attendance.student_id == rec.student_id,
            Attendance.date == req.date
        )
        existing_res = await db.execute(q)
        existing = existing_res.scalars().first()

        status_enum = AttendanceStatus(rec.status)
        if existing:
            existing.status = status_enum
            existing.marked_by = current_user.id
            saved_records.append(existing)
        else:
            att = Attendance(
                id=str(uuid.uuid4()),
                student_id=rec.student_id,
                class_id=req.class_id,
                marked_by=current_user.id,
                date=req.date,
                status=status_enum
            )
            db.add(att)
            saved_records.append(att)

    await db.commit()
    return {
        "status": "success",
        "message": f"Successfully updated attendance for {len(saved_records)} students on {req.date}",
        "class_id": req.class_id,
        "date": str(req.date)
    }

@router.get("/attendance/class/{class_id}")
async def get_class_attendance(
    class_id: str,
    target_date: str = None,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Get class attendance. Scoped by role."""
    query_date = datetime.strptime(target_date, "%Y-%m-%d").date() if target_date else date.today()
    q = (
        select(Attendance)
        .options(selectinload(Attendance.student))
        .where(Attendance.class_id == class_id, Attendance.date == query_date)
    )
    res = await db.execute(q)
    attendance_rows = res.scalars().all()

    # Students can only see their own attendance
    if current_user.role == UserRole.STUDENT:
        attendance_rows = [a for a in attendance_rows if a.student_id == current_user.id]

    return [
        {
            "id": a.id,
            "student_id": a.student_id,
            "student_name": a.student.full_name if a.student else "Student",
            "date": str(a.date),
            "status": a.status
        }
        for a in attendance_rows
    ]

@router.post("/work-logs", response_model=WorkLogResponse)
async def submit_work_log(
    req: WorkLogCreateRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_role(
        UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.TEACHER
    )),
):
    """Submit a daily work log. Teachers create logs for their own classes."""
    auto_completed = False

    # 1. Save work log
    work_log = DailyWorkLog(
        id=str(uuid.uuid4()),
        teacher_id=current_user.id if current_user.role == UserRole.TEACHER else req.teacher_id,
        class_id=req.class_id,
        subject_id=req.subject_id,
        syllabus_node_id=req.syllabus_node_id,
        date=req.date,
        summary=req.summary
    )
    db.add(work_log)

    # 2. Trigger behavior: auto-mark syllabus node complete
    if req.syllabus_node_id:
        node_res = await db.execute(select(SyllabusNode).where(SyllabusNode.id == req.syllabus_node_id))
        node = node_res.scalars().first()
        if node and not node.is_completed:
            node.is_completed = True
            node.completed_at = datetime.utcnow()
            auto_completed = True

    await db.commit()

    return WorkLogResponse(
        id=work_log.id,
        teacher_id=work_log.teacher_id,
        class_id=work_log.class_id,
        subject_id=work_log.subject_id,
        syllabus_node_id=work_log.syllabus_node_id,
        date=work_log.date,
        summary=work_log.summary,
        auto_completed_node=auto_completed
    )

@router.get("/work-logs")
async def list_work_logs(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """List work logs. Scoped by role: Teachers see own logs, Admin sees all."""
    q = (
        select(DailyWorkLog)
        .options(
            selectinload(DailyWorkLog.teacher),
            selectinload(DailyWorkLog.school_class),
            selectinload(DailyWorkLog.subject),
            selectinload(DailyWorkLog.syllabus_node)
        )
        .order_by(DailyWorkLog.created_at.desc())
    )

    # Scope: Teachers see only their own logs
    if current_user.role == UserRole.TEACHER:
        q = q.where(DailyWorkLog.teacher_id == current_user.id)

    res = await db.execute(q)
    logs = res.scalars().all()

    return [
        {
            "id": l.id,
            "teacher_name": l.teacher.full_name if l.teacher else "Teacher",
            "class_name": f"{l.school_class.grade}-{l.school_class.section}" if l.school_class else "Class",
            "subject_name": l.subject.name if l.subject else "Subject",
            "topic_name": l.syllabus_node.topic_name if l.syllabus_node else "General Overview",
            "date": str(l.date),
            "summary": l.summary,
            "created_at": l.created_at
        }
        for l in logs
    ]
