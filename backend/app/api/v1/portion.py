from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from app.db.database import get_db
from app.db.models import Subject, SyllabusNode, User, UserRole
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
        raise HTTPException(status_code=404, detail="Subject not found")

    nodes_res = await db.execute(select(SyllabusNode).where(SyllabusNode.subject_id == subject_id))
    nodes = nodes_res.scalars().all()

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
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Get progress for all subjects. All authenticated users can view."""
    subjects_res = await db.execute(select(Subject))
    subjects = subjects_res.scalars().all()

    results = []
    for sub in subjects:
        nodes_res = await db.execute(select(SyllabusNode).where(SyllabusNode.subject_id == sub.id))
        nodes = nodes_res.scalars().all()

        total = len(nodes)
        completed = sum(1 for n in nodes if n.is_completed)
        pct = (completed / total * 100.0) if total > 0 else 0.0

        results.append({
            "subject_id": sub.id,
            "subject_code": sub.code,
            "subject_name": sub.name,
            "total_nodes": total,
            "completed_nodes": completed,
            "completion_percentage": round(pct, 2)
        })

    return results
