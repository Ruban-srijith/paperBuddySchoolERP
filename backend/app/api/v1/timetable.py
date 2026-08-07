import uuid
from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy.orm import selectinload
from app.db.database import get_db
from app.db.models import Timetable, User, Class, Subject, Classroom, UserRole
from app.schemas.timetable import TimetableItem, TimetableTeacherGridResponse, SolveTimetableRequest
from app.services.timetable_solver import timetable_solver
from app.core.auth import get_current_user, require_role

router = APIRouter(prefix="/timetable", tags=["Timetable Optimization"])

@router.post("/generate")
async def generate_timetable(
    req: SolveTimetableRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_role(
        UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.PRINCIPAL, UserRole.VICE_PRINCIPAL, UserRole.CORRESPONDENT
    )),
):
    """Generate conflict-free timetable using OR-Tools. Admin/Principal only."""
    # Fetch teachers, classes, subjects, classrooms from database
    teachers_res = await db.execute(select(User).where(User.role == UserRole.TEACHER))
    teachers = teachers_res.scalars().all()

    classes_res = await db.execute(select(Class))
    classes = classes_res.scalars().all()

    subjects_res = await db.execute(select(Subject))
    subjects = subjects_res.scalars().all()

    classrooms_res = await db.execute(select(Classroom))
    classrooms = classrooms_res.scalars().all()

    if not teachers or not classes or not subjects:
        raise HTTPException(status_code=400, detail="Must have teachers, classes, and subjects seeded in database.")

    # Convert ORM objects to dict list for OR-Tools solver
    t_list = [{"id": t.id, "full_name": t.full_name} for t in teachers]
    c_list = [{"id": c.id, "grade": c.grade, "section": c.section} for c in classes]
    s_list = [{"id": s.id, "name": s.name} for s in subjects]
    r_list = [{"id": r.id, "name": r.name} for r in classrooms] if classrooms else [{"id": str(uuid.uuid4()), "name": "Room 101"}]

    generated_schedule = timetable_solver.solve(c_list, t_list, s_list, r_list)

    if not generated_schedule:
        raise HTTPException(status_code=422, detail="Solver could not find a feasible conflict-free timetable.")

    # Persist generated schedule into timetables database table
    # Clear previous timetables for clean update
    await db.execute(select(Timetable))
    await db.commit()

    db_entries = []
    for item in generated_schedule:
        entry = Timetable(
            id=str(uuid.uuid4()),
            class_id=item["class_id"],
            teacher_id=item["teacher_id"],
            subject_id=item["subject_id"],
            classroom_id=item["classroom_id"],
            day_of_week=item["day_of_week"],
            time_slot=item["time_slot"]
        )
        db_entries.append(entry)
        db.add(entry)

    await db.commit()

    return {
        "status": "success",
        "message": f"Successfully generated {len(db_entries)} conflict-free timetable slots using Google OR-Tools",
        "total_slots": len(db_entries),
        "schedule": generated_schedule
    }

@router.get("/teacher/{teacher_id}", response_model=TimetableTeacherGridResponse)
async def get_teacher_timetable(
    teacher_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Get teacher's timetable. Teachers can only view their own schedule."""
    # Teachers can only view their own timetable
    if current_user.role == UserRole.TEACHER and current_user.id != teacher_id:
        raise HTTPException(status_code=403, detail="You can only view your own timetable")

    # Students cannot access teacher timetables directly
    if current_user.role == UserRole.STUDENT:
        raise HTTPException(status_code=403, detail="Students cannot access teacher timetables")

    teacher_res = await db.execute(select(User).where(User.id == teacher_id))
    teacher = teacher_res.scalars().first()

    if not teacher:
        raise HTTPException(status_code=404, detail="Teacher not found")

    query = (
        select(Timetable)
        .options(
            selectinload(Timetable.school_class),
            selectinload(Timetable.teacher),
            selectinload(Timetable.subject),
            selectinload(Timetable.classroom)
        )
        .where(Timetable.teacher_id == teacher_id)
    )
    res = await db.execute(query)
    entries = res.scalars().all()

    items = []
    for e in entries:
        items.append(TimetableItem(
            id=e.id,
            class_id=e.class_id,
            class_name=f"{e.school_class.grade}-{e.school_class.section}" if e.school_class else "Class",
            teacher_id=e.teacher_id,
            teacher_name=e.teacher.full_name if e.teacher else "Teacher",
            subject_id=e.subject_id,
            subject_name=e.subject.name if e.subject else "Subject",
            classroom_id=e.classroom_id,
            classroom_name=e.classroom.name if e.classroom else "Standard Room",
            day_of_week=e.day_of_week,
            time_slot=e.time_slot
        ))

    return TimetableTeacherGridResponse(
        teacher_id=teacher.id,
        teacher_name=teacher.full_name,
        schedule=items
    )

@router.get("/all")
async def get_all_timetables(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Get all timetables. View scope depends on role."""
    query = (
        select(Timetable)
        .options(
            selectinload(Timetable.school_class),
            selectinload(Timetable.teacher),
            selectinload(Timetable.subject),
            selectinload(Timetable.classroom)
        )
    )

    # Teachers see only their own schedule
    if current_user.role == UserRole.TEACHER:
        query = query.where(Timetable.teacher_id == current_user.id)

    res = await db.execute(query)
    entries = res.scalars().all()
    
    return [
        {
            "id": e.id,
            "class_name": f"{e.school_class.grade}-{e.school_class.section}" if e.school_class else "",
            "teacher_name": e.teacher.full_name if e.teacher else "",
            "subject_name": e.subject.name if e.subject else "",
            "classroom_name": e.classroom.name if e.classroom else "Room 101",
            "day_of_week": e.day_of_week,
            "time_slot": e.time_slot
        }
        for e in entries
    ]
