"""
Academic Calendar API router.
Provides shared school calendar events, holidays, examinations, and meetings.
Sub-admin / Admin / Superadmin can create and edit events; other roles view.
"""
import uuid
from datetime import date, datetime
from typing import Optional, List
from pydantic import BaseModel
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy.orm import selectinload

from app.db.database import get_db
from app.db.models import AcademicCalendarEvent, User, UserRole
from app.core.auth import get_current_user, require_role

router = APIRouter(prefix="/calendar", tags=["Academic Calendar"])


class CalendarEventCreate(BaseModel):
    title: str
    description: Optional[str] = None
    start_date: date
    end_date: date
    event_type: str = "Academic"  # Holiday, Examination, Event, Academic, Meeting
    grade_scope: str = "all"  # "all", "LKG", "10", etc.


class CalendarEventUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    start_date: Optional[date] = None
    end_date: Optional[date] = None
    event_type: Optional[str] = None
    grade_scope: Optional[str] = None


@router.get("/events")
async def list_calendar_events(
    grade: Optional[str] = Query(None, description="Filter by grade scope"),
    event_type: Optional[str] = Query(None, description="Filter by event type"),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """List calendar events accessible to the user."""
    query = select(AcademicCalendarEvent).options(selectinload(AcademicCalendarEvent.created_by))

    if event_type:
        query = query.where(AcademicCalendarEvent.event_type == event_type)

    if grade and grade.lower() != "all":
        query = query.where(
            (AcademicCalendarEvent.grade_scope == "all") | (AcademicCalendarEvent.grade_scope == grade)
        )

    query = query.order_by(AcademicCalendarEvent.start_date.asc())
    result = await db.execute(query)
    events = result.scalars().all()

    return [
        {
            "id": e.id,
            "title": e.title,
            "description": e.description,
            "start_date": str(e.start_date),
            "end_date": str(e.end_date),
            "event_type": e.event_type,
            "grade_scope": e.grade_scope,
            "created_by": e.created_by.full_name if e.created_by else "School Admin",
            "created_at": e.created_at.isoformat() if e.created_at else None,
        }
        for e in events
    ]


@router.post("/events")
async def create_calendar_event(
    req: CalendarEventCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_role(
        UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.PRINCIPAL, UserRole.VICE_PRINCIPAL, UserRole.DEAN
    )),
):
    """Create a new academic calendar event (Sub-admin/Admin/Superadmin only)."""
    new_event = AcademicCalendarEvent(
        id=str(uuid.uuid4()),
        title=req.title,
        description=req.description,
        start_date=req.start_date,
        end_date=req.end_date,
        event_type=req.event_type,
        grade_scope=req.grade_scope,
        created_by_id=current_user.id,
    )
    db.add(new_event)
    await db.commit()
    await db.refresh(new_event)

    return {
        "status": "success",
        "message": f"Calendar event '{new_event.title}' scheduled successfully",
        "event_id": new_event.id,
    }


@router.put("/events/{event_id}")
async def update_calendar_event(
    event_id: str,
    req: CalendarEventUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_role(
        UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.PRINCIPAL, UserRole.VICE_PRINCIPAL, UserRole.DEAN
    )),
):
    """Update an existing calendar event."""
    result = await db.execute(select(AcademicCalendarEvent).where(AcademicCalendarEvent.id == event_id))
    event = result.scalars().first()

    if not event:
        raise HTTPException(status_code=404, detail="Calendar event not found")

    if req.title is not None:
        event.title = req.title
    if req.description is not None:
        event.description = req.description
    if req.start_date is not None:
        event.start_date = req.start_date
    if req.end_date is not None:
        event.end_date = req.end_date
    if req.event_type is not None:
        event.event_type = req.event_type
    if req.grade_scope is not None:
        event.grade_scope = req.grade_scope

    await db.commit()
    return {"status": "success", "message": "Calendar event updated successfully"}


@router.delete("/events/{event_id}")
async def delete_calendar_event(
    event_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_role(
        UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.PRINCIPAL, UserRole.VICE_PRINCIPAL, UserRole.DEAN
    )),
):
    """Delete a calendar event."""
    result = await db.execute(select(AcademicCalendarEvent).where(AcademicCalendarEvent.id == event_id))
    event = result.scalars().first()

    if not event:
        raise HTTPException(status_code=404, detail="Calendar event not found")

    await db.delete(event)
    await db.commit()
    return {"status": "success", "message": "Calendar event deleted"}
