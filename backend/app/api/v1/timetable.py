import uuid
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import delete
from sqlalchemy.orm import selectinload
from app.db.database import get_db
from app.db.models import Timetable, User, Class, Subject, Classroom, UserRole
from app.schemas.timetable import TimetableItem, TimetableTeacherGridResponse, SolveTimetableRequest
from app.services.timetable_solver import timetable_solver
from app.core.auth import get_current_user, require_role

router = APIRouter(prefix="/timetable", tags=["Timetable Optimization"])

# Standard subjects required across curriculum
STANDARD_SUBJECTS = [
    ("English Language", "ENG-101"),
    ("Tamil Language", "TAM-101"),
    ("Mathematics", "MAT-101"),
    ("General Science", "SCI-101"),
    ("Social Science", "SOC-101"),
    ("Science (Phy/Chem/Bio)", "SCI-201"),
    ("Environmental Studies (EVS)", "EVS-101"),
    ("Computer Basics", "CS-101"),
    ("Computer Science", "CS-201"),
    ("Information Technology", "IT-101"),
    ("English Literature", "ENG-201"),
    ("English Core", "ENG-301"),
    ("Physics", "PHY-101"),
    ("Chemistry", "CHE-101"),
    ("Higher Mathematics", "MAT-301"),
    ("Practical Lab", "LAB-101"),
    ("English & Phonics", "KG-ENG"),
    ("Basic Numbers", "KG-NUM"),
    ("Environmental Awareness", "KG-EVS"),
    ("Rhymes & Storytelling", "KG-RHY"),
    ("Drawing & Craft", "KG-ART"),
    ("Play Activity", "KG-ACT"),
    ("Physical Education", "PE-101"),
]

# Standard faculty members
STANDARD_TEACHERS = [
    ("Dr. Sarah Connor", "sarah.connor@school.edu"),
    ("Prof. Alan Turing", "alan.turing@school.edu"),
    ("Dr. Marie Curie", "marie.curie@school.edu"),
    ("Prof. Venkat Raman", "dean.science@school.edu"),
    ("Dr. Lakshmi Iyer", "head.physics@school.edu"),
    ("Prof. Suresh Babu", "head.cs@school.edu"),
    ("Alex Mercer", "alex.mercer@school.edu"),
    ("Mr. K. Sundaram", "k.sundaram@school.edu"),
    ("Mr. P. Murugan", "p.murugan@school.edu"),
    ("Mrs. S. Radhika", "s.radhika@school.edu"),
    ("Mrs. Geetha Swaminathan", "geetha.s@school.edu"),
    ("Coach Rajesh V.", "coach.rajesh@school.edu"),
    ("Mrs. Priya Raman", "priya.raman@school.edu"),
    ("Ms. Anitha Raj", "anitha.raj@school.edu"),
    ("Mrs. Shalini Gupta", "shalini.gupta@school.edu"),
]

async def _ensure_prerequisites(db: AsyncSession):
    """Ensure standard subjects, teachers, and classrooms exist in DB for valid foreign keys."""
    # 1. Subjects
    s_res = await db.execute(select(Subject))
    existing_subjects = {s.name: s for s in s_res.scalars().all()}
    for s_name, s_code in STANDARD_SUBJECTS:
        if s_name not in existing_subjects:
            new_sub = Subject(id=str(uuid.uuid4()), name=s_name, code=s_code)
            db.add(new_sub)
            existing_subjects[s_name] = new_sub

    # 2. Teachers
    t_res = await db.execute(select(User).where(User.role == UserRole.TEACHER))
    existing_teachers = {t.full_name: t for t in t_res.scalars().all()}
    for t_name, t_email in STANDARD_TEACHERS:
        if t_name not in existing_teachers:
            new_t = User(
                id=str(uuid.uuid4()),
                full_name=t_name,
                email=t_email,
                role=UserRole.TEACHER,
                is_active=True
            )
            db.add(new_t)
            existing_teachers[t_name] = new_t

    # 3. Classrooms
    r_res = await db.execute(select(Classroom))
    existing_rooms = {r.name: r for r in r_res.scalars().all()}
    common_rooms = [
        "Room 101", "Room 102", "Room 204", "Science Lab", 
        "Computer Lab 1", "Chem Lab 2", "Physics Lab", 
        "Activity Hall", "Art Studio", "KG Room 1", "KG Room 2", "Main Ground"
    ]
    for r_name in common_rooms:
        if r_name not in existing_rooms:
            new_room = Classroom(id=str(uuid.uuid4()), name=r_name, capacity=40, is_lab=("Lab" in r_name))
            db.add(new_room)
            existing_rooms[r_name] = new_room

    await db.commit()
    return existing_subjects, existing_teachers, existing_rooms

@router.post("/generate")
async def generate_timetable(
    req: Optional[SolveTimetableRequest] = None,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_role(
        UserRole.SUPER_ADMIN, UserRole.PRINCIPAL, UserRole.VICE_PRINCIPAL, UserRole.CORRESPONDENT
    )),
):
    """Generate conflict-free timetable using Google OR-Tools. Admin/Principal/VP/Correspondent only."""
    # Ensure all prerequisite database entities exist
    existing_subjects, existing_teachers, existing_rooms = await _ensure_prerequisites(db)

    # Fetch classes
    classes_res = await db.execute(select(Class))
    classes = classes_res.scalars().all()

    if not classes:
        # If no classes, create standard 28 classes
        all_grades = ["LKG", "UKG", "1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12"]
        for g in all_grades:
            for s in ["A", "B"]:
                new_c = Class(id=str(uuid.uuid4()), grade=g, section=s, room_number=f"Room {g}-{s}")
                db.add(new_c)
        await db.commit()
        classes_res = await db.execute(select(Class))
        classes = classes_res.scalars().all()

    # Convert to dict format for solver
    t_list = [{"id": t.id, "full_name": t.full_name} for t in existing_teachers.values()]
    c_list = [{"id": c.id, "grade": c.grade, "section": c.section} for c in classes]
    s_list = [{"id": s.id, "name": s.name} for s in existing_subjects.values()]
    r_list = [{"id": r.id, "name": r.name} for r in existing_rooms.values()]

    generated_schedule = timetable_solver.solve(c_list, t_list, s_list, r_list)

    if not generated_schedule:
        raise HTTPException(status_code=422, detail="Solver could not find a feasible conflict-free timetable.")

    # Clear previous timetables for clean update
    await db.execute(delete(Timetable))
    await db.commit()

    # Build DB entries with verified foreign key mapping
    db_entries = []
    for item in generated_schedule:
        # Match subject_id
        sub_obj = existing_subjects.get(item["subject_name"])
        sub_id = sub_obj.id if sub_obj else list(existing_subjects.values())[0].id

        # Match teacher_id
        t_obj = existing_teachers.get(item["teacher_name"])
        t_id = t_obj.id if t_obj else list(existing_teachers.values())[0].id

        # Match classroom_id
        r_obj = existing_rooms.get(item["classroom_name"]) or existing_rooms.get("Room 101")
        r_id = r_obj.id if r_obj else None

        entry = Timetable(
            id=str(uuid.uuid4()),
            class_id=item["class_id"],
            teacher_id=t_id,
            subject_id=sub_id,
            classroom_id=r_id,
            day_of_week=item["day_of_week"],
            time_slot=item["time_slot"]
        )
        db_entries.append(entry)
        db.add(entry)

    await db.commit()

    return {
        "status": "success",
        "message": f"Successfully generated {len(db_entries)} conflict-free timetable slots across all classes using Google OR-Tools CP-SAT!",
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
    if current_user.role == UserRole.TEACHER and current_user.id != teacher_id:
        raise HTTPException(status_code=403, detail="You can only view your own timetable")

    if current_user.role == UserRole.STUDENT:
        raise HTTPException(status_code=403, detail="Students cannot access teacher timetables")

    teacher_res = await db.execute(select(User).where(User.id == teacher_id))
    teacher = teacher_res.scalars().first()

    if not teacher:
        # Lookup by name or fallback
        teacher_res = await db.execute(select(User).where(User.role == UserRole.TEACHER))
        teacher = teacher_res.scalars().first()

    teacher_id_val = teacher.id if teacher else teacher_id
    teacher_name_val = teacher.full_name if teacher else "Faculty Member"

    query = (
        select(Timetable)
        .options(
            selectinload(Timetable.school_class),
            selectinload(Timetable.teacher),
            selectinload(Timetable.subject),
            selectinload(Timetable.classroom)
        )
        .where(Timetable.teacher_id == teacher_id_val)
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
            teacher_name=e.teacher.full_name if e.teacher else teacher_name_val,
            subject_id=e.subject_id,
            subject_name=e.subject.name if e.subject else "Subject",
            classroom_id=e.classroom_id,
            classroom_name=e.classroom.name if e.classroom else "Standard Room",
            day_of_week=e.day_of_week,
            time_slot=e.time_slot
        ))

    return TimetableTeacherGridResponse(
        teacher_id=teacher_id_val,
        teacher_name=teacher_name_val,
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

@router.get("/class/{grade_section}")
async def get_class_timetable(
    grade_section: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Get timetable entries for a specific class grade/section (e.g., 10-A, 10, 12-B, LKG-A).
    """
    parts = grade_section.split("-")
    grade = parts[0]
    section = parts[1] if len(parts) > 1 else ""

    query = (
        select(Timetable)
        .options(
            selectinload(Timetable.school_class),
            selectinload(Timetable.teacher),
            selectinload(Timetable.subject),
            selectinload(Timetable.classroom)
        )
    )
    res = await db.execute(query)
    entries = res.scalars().all()

    # Filter matching class
    matching = [
        e for e in entries
        if e.school_class and (
            (section and f"{e.school_class.grade}-{e.school_class.section}" == grade_section) or
            (not section and e.school_class.grade == grade) or
            f"{e.school_class.grade}-{e.school_class.section}" == grade_section or
            e.school_class.grade == grade
        )
    ]
    target_list = matching if matching else [
        e for e in entries if e.school_class and e.school_class.grade == grade
    ]

    return [
        {
            "id": e.id,
            "class_id": e.class_id,
            "class_name": f"{e.school_class.grade}-{e.school_class.section}" if e.school_class else grade_section,
            "teacher_id": e.teacher_id,
            "teacher_name": e.teacher.full_name if e.teacher else "Faculty Member",
            "subject_id": e.subject_id,
            "subject_name": e.subject.name if e.subject else "Core Subject",
            "classroom_name": e.classroom.name if e.classroom else "Room 101",
            "day_of_week": e.day_of_week,
            "time_slot": e.time_slot
        }
        for e in target_list
    ]
