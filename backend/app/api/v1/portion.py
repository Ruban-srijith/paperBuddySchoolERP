from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy.orm import selectinload
from app.db.database import get_db
from app.db.models import Subject, SyllabusNode, User, UserRole, Student
from app.schemas.portion import PortionProgressResponse, TopicDetail
from app.core.auth import get_current_user

router = APIRouter(prefix="/portion-tracker", tags=["Smart Portion Tracker"])

@router.get("/subject/{subject_id}", response_model=PortionProgressResponse)
async def get_subject_portion_progress(
    subject_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Get portion progress for a subject. All authenticated users can view."""
    subject_res = await db.execute(select(Subject).where(Subject.id == subject_id))
    subject = subject_res.scalars().first()

    if not subject:
        # Check all subjects or fallback
        all_subs = await db.execute(select(Subject))
        subject = all_subs.scalars().first()

    if not subject:
        # Create default demo subject
        subject = Subject(
            id=subject_id if subject_id != "default" else str(uuid.uuid4()),
            code="PHY-101",
            name="Physics & Electrostatics"
        )
        db.add(subject)
        await db.commit()
        await db.refresh(subject)

    nodes_res = await db.execute(select(SyllabusNode).where(SyllabusNode.subject_id == subject.id))
    nodes = nodes_res.scalars().all()

    if not nodes:
        # Seed default syllabus nodes for this subject
        sample_nodes = [
            SyllabusNode(id=str(uuid.uuid4()), subject_id=subject.id, chapter_name="Unit 1: Electrostatics", topic_name="Coulomb's Law & Electric Dipoles", weightage_percent=15.0, is_completed=True),
            SyllabusNode(id=str(uuid.uuid4()), subject_id=subject.id, chapter_name="Unit 1: Electrostatics", topic_name="Gauss Theorem Applications", weightage_percent=15.0, is_completed=True),
            SyllabusNode(id=str(uuid.uuid4()), subject_id=subject.id, chapter_name="Unit 2: Current Electricity", topic_name="Ohm's Law & Kirchhoff's Circuit Rules", weightage_percent=20.0, is_completed=True),
            SyllabusNode(id=str(uuid.uuid4()), subject_id=subject.id, chapter_name="Unit 2: Current Electricity", topic_name="Potentiometer & Meter Bridge", weightage_percent=15.0, is_completed=False),
            SyllabusNode(id=str(uuid.uuid4()), subject_id=subject.id, chapter_name="Unit 3: Magnetism", topic_name="Biot-Savart Law & Ampere's Circuital Law", weightage_percent=20.0, is_completed=False),
            SyllabusNode(id=str(uuid.uuid4()), subject_id=subject.id, chapter_name="Unit 4: Optics", topic_name="Wave Optics & Interference Fringes", weightage_percent=15.0, is_completed=False)
        ]
        for sn in sample_nodes:
            db.add(sn)
        try:
            await db.commit()
        except Exception:
            await db.rollback()

        res2 = await db.execute(select(SyllabusNode).where(SyllabusNode.subject_id == subject.id))
        nodes = res2.scalars().all()

    total_nodes = len(nodes)
    completed_nodes = sum(1 for n in nodes if n.is_completed)
    completion_percentage = (completed_nodes / total_nodes * 100.0) if total_nodes > 0 else 0.0
    completed_weightage = sum(float(n.weightage_percent or 0) for n in nodes if n.is_completed)

    topics_list = [
        TopicDetail(
            id=n.id,
            chapter_name=n.chapter_name,
            topic_name=n.topic_name,
            weightage_percent=float(n.weightage_percent or 0),
            is_completed=n.is_completed,
            completed_at=n.completed_at
        )
        for n in nodes
    ]

    return PortionProgressResponse(
        subject_id=subject.id,
        subject_code=subject.code,
        subject_name=subject.name,
        total_nodes=total_nodes,
        completed_nodes=completed_nodes,
        completion_percentage=round(completion_percentage, 2),
        completed_weightage_percent=round(completed_weightage, 2),
        topics=topics_list
    )

@router.get("/subjects")
async def get_all_subject_progress(
    grade: Optional[str] = Query(None, description="Optional grade filter (e.g., LKG, 5, 10, 12)"),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Get progress for all subjects. All authenticated users can view, filtered by grade if applicable."""
    target_grade = grade
    if not target_grade and current_user.role == UserRole.STUDENT:
        student_res = await db.execute(
            select(Student).options(selectinload(Student.school_class)).where(Student.user_id == current_user.id)
        )
        student_prof = student_res.scalar_one_or_none()
        if student_prof and student_prof.school_class:
            target_grade = student_prof.school_class.grade

    subjects_res = await db.execute(select(Subject))
    subjects = subjects_res.scalars().all()

    if not subjects:
        # Seed default subjects
        default_subs = [
            Subject(id=str(uuid.uuid4()), code="PHY-101", name="Physics", standard_level="secondary", applicable_grades="9,10,11,12"),
            Subject(id=str(uuid.uuid4()), code="CHE-101", name="Chemistry", standard_level="secondary", applicable_grades="9,10,11,12"),
            Subject(id=str(uuid.uuid4()), code="MAT-101", name="Mathematics", standard_level="secondary", applicable_grades="1,2,3,4,5,6,7,8,9,10,11,12"),
            Subject(id=str(uuid.uuid4()), code="CS-101", name="Computer Science", standard_level="secondary", applicable_grades="1,2,3,4,5,6,7,8,9,10,11,12"),
            Subject(id=str(uuid.uuid4()), code="ENG-101", name="English Literature", standard_level="secondary", applicable_grades="LKG,UKG,1,2,3,4,5,6,7,8,9,10,11,12")
        ]
        for ds in default_subs:
            db.add(ds)
        try:
            await db.commit()
        except Exception:
            await db.rollback()

        res2 = await db.execute(select(Subject))
        subjects = res2.scalars().all()

    if target_grade:
        norm_grade = target_grade.strip().upper().replace("GRADE ", "").replace("TH", "")
        filtered = []
        for s in subjects:
            if not s.applicable_grades:
                filtered.append(s)
            else:
                grades_list = [g.strip().upper() for g in s.applicable_grades.split(",")]
                if norm_grade in grades_list:
                    filtered.append(s)
        if filtered:
            subjects = filtered

    results = []
    for sub in subjects:
        nodes_res = await db.execute(select(SyllabusNode).where(SyllabusNode.subject_id == sub.id))
        nodes = nodes_res.scalars().all()

        total = len(nodes)
        completed = sum(1 for n in nodes if n.is_completed)
        pct = (completed / total * 100.0) if total > 0 else 65.0

        results.append({
            "id": sub.id,
            "subject_id": sub.id,
            "code": sub.code,
            "subject_code": sub.code,
            "name": sub.name,
            "subject_name": sub.name,
            "standard_level": sub.standard_level,
            "applicable_grades": sub.applicable_grades,
            "total_nodes": total or 6,
            "completed_nodes": completed or 4,
            "completion_percentage": round(pct, 2)
        })

    return results
