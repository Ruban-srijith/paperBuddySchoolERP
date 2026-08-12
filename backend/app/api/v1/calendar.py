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

    if not events:
        # Seed rich default academic calendar events for 2026-2027 academic year
        demo_events = [
            AcademicCalendarEvent(
                id=str(uuid.uuid4()),
                title="Independence Day Celebration & Flag Hoisting",
                description="Annual Independence Day parade, cultural program by Grades 6-10, and address by Principal.",
                start_date=date(2026, 8, 15),
                end_date=date(2026, 8, 15),
                event_type="Holiday",
                grade_scope="all",
                created_by_id=current_user.id
            ),
            AcademicCalendarEvent(
                id=str(uuid.uuid4()),
                title="Mid-Term Examination Week (Grades 6–12)",
                description="Comprehensive Term 1 written examinations. Morning session 9:00 AM – 12:00 PM.",
                start_date=date(2026, 8, 20),
                end_date=date(2026, 8, 28),
                event_type="Examination",
                grade_scope="all",
                created_by_id=current_user.id
            ),
            AcademicCalendarEvent(
                id=str(uuid.uuid4()),
                title="Parent-Teacher Meeting (Term 1 Progress Review)",
                description="Interactive academic review meeting with parents to discuss student performance and report cards.",
                start_date=date(2026, 9, 5),
                end_date=date(2026, 9, 5),
                event_type="Meeting",
                grade_scope="all",
                created_by_id=current_user.id
            ),
            AcademicCalendarEvent(
                id=str(uuid.uuid4()),
                title="Annual Science & AI Technology Exhibition",
                description="Student project showcase, robotics demonstrations, and STEM working model competitions.",
                start_date=date(2026, 9, 18),
                end_date=date(2026, 9, 19),
                event_type="Event",
                grade_scope="all",
                created_by_id=current_user.id
            ),
            AcademicCalendarEvent(
                id=str(uuid.uuid4()),
                title="Gandhi Jayanti National Holiday",
                description="School closed for Gandhi Jayanti. Special morning homage and cleanliness drive.",
                start_date=date(2026, 10, 2),
                end_date=date(2026, 10, 2),
                event_type="Holiday",
                grade_scope="all",
                created_by_id=current_user.id
            ),
            AcademicCalendarEvent(
                id=str(uuid.uuid4()),
                title="Diwali Festive Holidays & Vacation",
                description="School closed for Diwali festival holidays. Reopens on October 28th.",
                start_date=date(2026, 10, 23),
                end_date=date(2026, 10, 27),
                event_type="Holiday",
                grade_scope="all",
                created_by_id=current_user.id
            ),
            AcademicCalendarEvent(
                id=str(uuid.uuid4()),
                title="Inter-School Athletics & Sports Meet",
                description="Annual sports meet including track events, football finals, and prize distribution ceremony.",
                start_date=date(2026, 11, 14),
                end_date=date(2026, 11, 15),
                event_type="Celebration",
                grade_scope="all",
                created_by_id=current_user.id
            )
        ]
        for de in demo_events:
            db.add(de)
        try:
            await db.commit()
        except Exception:
            await db.rollback()

        # Re-query
        res2 = await db.execute(query)
        events = res2.scalars().all()

    return [
        {
            "id": e.id,
            "title": e.title,
            "description": e.description,
            "start_date": str(e.start_date),
            "end_date": str(e.end_date),
            "category": e.event_type.lower() if e.event_type else "event",
            "event_type": e.event_type,
            "grade_scope": e.grade_scope,
            "target_audience": e.grade_scope,
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
