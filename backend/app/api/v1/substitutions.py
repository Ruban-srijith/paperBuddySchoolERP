import uuid
from typing import List
from datetime import date
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy.orm import selectinload
from app.db.database import get_db
from app.db.models import User, UserRole, Timetable, TeacherSubstitution
from app.schemas.substitutions import SubstitutionAutoAssignRequest, SubstitutionResponse
from app.core.auth import get_current_user, require_role

router = APIRouter(prefix="/substitutions", tags=["Teacher Substitution Engine"])


@router.get("/list", response_model=List[SubstitutionResponse])
async def list_substitutions(
    target_date: str = None,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """List teacher substitutions assigned for a date."""
    query_date = date.fromisoformat(target_date) if target_date else date.today()

    res = await db.execute(
        select(TeacherSubstitution)
        .options(
            selectinload(TeacherSubstitution.timetable).selectinload(Timetable.school_class),
            selectinload(TeacherSubstitution.timetable).selectinload(Timetable.subject),
            selectinload(TeacherSubstitution.original_teacher),
            selectinload(TeacherSubstitution.substitute_teacher),
        )
        .where(TeacherSubstitution.date == query_date)
        .order_by(TeacherSubstitution.created_at.desc())
    )
    subs = res.scalars().all()

    return [
        SubstitutionResponse(
            id=s.id,
            timetable_id=s.timetable_id,
            class_name=f"{s.timetable.school_class.grade}-{s.timetable.school_class.section}" if (s.timetable and s.timetable.school_class) else "Class",
            subject_name=s.timetable.subject.name if (s.timetable and s.timetable.subject) else "Subject",
            day_of_week=s.timetable.day_of_week if s.timetable else "Monday",
            time_slot=s.timetable.time_slot if s.timetable else "09:00-10:00",
            original_teacher_name=s.original_teacher.full_name if s.original_teacher else "Absent Teacher",
            substitute_teacher_name=s.substitute_teacher.full_name if s.substitute_teacher else "Substitute",
            target_date=s.date,
            status=s.status,
            created_at=s.created_at,
        )
        for s in subs
    ]


@router.post("/auto-assign", response_model=SubstitutionResponse)
async def auto_assign_substitution(
    req: SubstitutionAutoAssignRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_role(
        UserRole.SUPER_ADMIN, UserRole.CORRESPONDENT, UserRole.ADMIN, UserRole.PRINCIPAL, UserRole.VICE_PRINCIPAL
    )),
):
    """Automatically find an available free teacher for the slot and assign substitution."""
    # 1. Fetch target timetable entry
    tt_res = await db.execute(
        select(Timetable)
        .options(selectinload(Timetable.school_class), selectinload(Timetable.subject))
        .where(Timetable.id == req.timetable_id)
    )
    tt = tt_res.scalars().first()

    if not tt:
        raise HTTPException(status_code=404, detail="Timetable slot not found")

    # 2. Find teachers who are NOT assigned in this day & time slot
    busy_teachers_res = await db.execute(
        select(Timetable.teacher_id).where(
            Timetable.day_of_week == tt.day_of_week,
            Timetable.time_slot == tt.time_slot
        )
    )
    busy_teacher_ids = set(busy_teachers_res.scalars().all())

    # Get all active teachers excluding original teacher
    available_teachers_res = await db.execute(
        select(User).where(
            User.role == UserRole.TEACHER,
            User.id != req.original_teacher_id
        )
    )
    all_teachers = available_teachers_res.scalars().all()

    free_teachers = [t for t in all_teachers if t.id not in busy_teacher_ids]

    # Pick first available free teacher (or fallback to any available teacher if constraint tight)
    substitute_teacher = free_teachers[0] if free_teachers else (all_teachers[0] if all_teachers else None)

    if not substitute_teacher:
        raise HTTPException(status_code=422, detail="No available teacher found for substitution")

    sub_entry = TeacherSubstitution(
        id=str(uuid.uuid4()),
        timetable_id=req.timetable_id,
        original_teacher_id=req.original_teacher_id,
        substitute_teacher_id=substitute_teacher.id,
        date=req.target_date,
        status="assigned",
    )
    db.add(sub_entry)
    await db.commit()
    await db.refresh(sub_entry)

    # Fetch original teacher name
    orig_res = await db.execute(select(User).where(User.id == req.original_teacher_id))
    orig_t = orig_res.scalars().first()

    return SubstitutionResponse(
        id=sub_entry.id,
        timetable_id=sub_entry.timetable_id,
        class_name=f"{tt.school_class.grade}-{tt.school_class.section}" if tt.school_class else "Class",
        subject_name=tt.subject.name if tt.subject else "Subject",
        day_of_week=tt.day_of_week,
        time_slot=tt.time_slot,
        original_teacher_name=orig_t.full_name if orig_t else "Absent Teacher",
        substitute_teacher_name=substitute_teacher.full_name,
        target_date=sub_entry.date,
        status=sub_entry.status,
        created_at=sub_entry.created_at,
    )
