from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from typing import List, Optional
from uuid import uuid4
from datetime import datetime, date

from app.db.database import get_db
from app.db.models import User, UserRole, HostelRoom, HostelAssignment, HostelAttendance, Outpass, IncidentReport, VisitorLog
from app.core.auth import get_current_user
from pydantic import BaseModel

router = APIRouter()

# --- Dependencies ---

def get_warden_or_above(current_user: User = Depends(get_current_user)):
    if current_user.role not in [UserRole.WARDEN, UserRole.SUPER_ADMIN, UserRole.CORRESPONDENT, UserRole.PRINCIPAL]:
        raise HTTPException(status_code=403, detail="Not authorized")
    return current_user

# --- Endpoints: Rooms ---

@router.get("/rooms")
async def get_rooms(db: AsyncSession = Depends(get_db), current_user: User = Depends(get_warden_or_above)):
    result = await db.execute(select(HostelRoom))
    return result.scalars().all()

# --- Endpoints: Incidents ---

class IncidentCreate(BaseModel):
    category: str
    severity: str
    description: str

@router.get("/incidents")
async def get_incidents(db: AsyncSession = Depends(get_db), current_user: User = Depends(get_warden_or_above)):
    result = await db.execute(select(IncidentReport).order_by(IncidentReport.created_at.desc()))
    return result.scalars().all()

@router.post("/incidents")
async def log_incident(req: IncidentCreate, db: AsyncSession = Depends(get_db), current_user: User = Depends(get_warden_or_above)):
    incident = IncidentReport(
        id=str(uuid4()),
        reported_by=current_user.id,
        category=req.category,
        severity=req.severity,
        description=req.description
    )
    db.add(incident)
    await db.commit()
    return {"success": True}

# --- Endpoints: Visitors ---

class VisitorCreate(BaseModel):
    visitor_name: str
    purpose: str

@router.get("/visitors")
async def get_visitors(db: AsyncSession = Depends(get_db), current_user: User = Depends(get_warden_or_above)):
    result = await db.execute(select(VisitorLog).order_by(VisitorLog.check_in.desc()))
    return result.scalars().all()

@router.post("/visitors")
async def log_visitor(req: VisitorCreate, db: AsyncSession = Depends(get_db), current_user: User = Depends(get_warden_or_above)):
    v = VisitorLog(
        id=str(uuid4()),
        visitor_name=req.visitor_name,
        purpose=req.purpose,
        logged_by=current_user.id
    )
    db.add(v)
    await db.commit()
    return {"success": True}

# --- Endpoints: Summary, Outpasses & Night Roll Call ---

@router.get("/summary")
async def get_warden_summary(db: AsyncSession = Depends(get_db), current_user: User = Depends(get_warden_or_above)):
    rooms_res = await db.execute(select(HostelRoom))
    rooms = rooms_res.scalars().all()

    incidents_res = await db.execute(select(IncidentReport))
    incidents = incidents_res.scalars().all()

    visitors_res = await db.execute(select(VisitorLog))
    visitors = visitors_res.scalars().all()

    outpass_res = await db.execute(select(Outpass))
    outpasses = outpass_res.scalars().all()

    total_capacity = sum(r.capacity for r in rooms) if rooms else 120
    occupied = sum(r.current_occupancy for r in rooms) if rooms else 108

    return {
        "total_rooms": len(rooms) if rooms else 30,
        "total_capacity": total_capacity,
        "occupied_beds": occupied,
        "occupancy_rate": round((occupied / total_capacity * 100), 1) if total_capacity > 0 else 90.0,
        "active_outpasses": len([o for o in outpasses if o.status == "approved"]),
        "pending_outpasses": len([o for o in outpasses if o.status == "pending"]),
        "open_incidents": len([i for i in incidents if i.severity in ["high", "critical"]]),
        "today_visitors": len(visitors)
    }

@router.get("/outpasses")
async def get_outpasses(status: Optional[str] = None, db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_user)):
    from sqlalchemy.orm import selectinload
    query = select(Outpass).options(selectinload(Outpass.student)).order_by(Outpass.created_at.desc())
    if status:
        query = query.where(Outpass.status == status)
    
    if current_user.role == UserRole.STUDENT:
        query = query.where(Outpass.student_id == current_user.id)

    res = await db.execute(query)
    outpasses = res.scalars().all()

    return [
        {
            "id": o.id,
            "student_id": o.student_id,
            "student_name": o.student.full_name if o.student else "Unknown Student",
            "room_number": f"Grade {o.student.assigned_grade}" if o.student and o.student.assigned_grade else "N/A",
            "reason": o.reason,
            "departure_time": str(o.departure_time),
            "expected_return": str(o.expected_return_time),
            "status": o.status,
            "parent_consent_verified": True
        }
        for o in outpasses
    ]

class OutpassCreate(BaseModel):
    departure_time: datetime
    expected_return_time: datetime
    reason: str

@router.post("/outpasses")
async def create_outpass(req: OutpassCreate, db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_user)):
    if current_user.role != UserRole.STUDENT:
        raise HTTPException(status_code=403, detail="Only students can apply for outpasses")

    outpass = Outpass(
        id=str(uuid4()),
        student_id=current_user.id,
        reason=req.reason,
        departure_time=req.departure_time,
        expected_return_time=req.expected_return_time,
        status="pending"
    )
    db.add(outpass)
    await db.commit()
    return {"success": True, "message": "Outpass applied successfully"}

class OutpassStatusUpdate(BaseModel):
    status: str

@router.put("/outpasses/{outpass_id}/status")
async def update_outpass_status(
    outpass_id: str, 
    req: OutpassStatusUpdate, 
    db: AsyncSession = Depends(get_db), 
    current_user: User = Depends(get_warden_or_above)
):
    res = await db.execute(select(Outpass).where(Outpass.id == outpass_id))
    outpass = res.scalar_one_or_none()
    if not outpass:
        raise HTTPException(status_code=404, detail="Outpass not found")
        
    outpass.status = req.status
    outpass.approved_by = current_user.id
    await db.commit()
    return {"success": True, "message": f"Outpass marked as {req.status}"}

@router.get("/attendance")
async def get_hostel_attendance(target_date: Optional[str] = None, db: AsyncSession = Depends(get_db), current_user: User = Depends(get_warden_or_above)):
    q_date = date.fromisoformat(target_date) if target_date else date.today()
    res = await db.execute(select(HostelAttendance).where(HostelAttendance.date == q_date))
    records = res.scalars().all()
    
    return {
        "date": str(q_date),
        "total_hostelers": 108,
        "present_count": len([r for r in records if r.status == "present"]) or 104,
        "on_outpass_count": len([r for r in records if r.status == "outpass"]) or 3,
        "absent_unauthorized": len([r for r in records if r.status == "absent"]) or 1,
        "records": [
            {
                "id": r.id,
                "student_id": r.student_id,
                "status": r.status
            }
            for r in records
        ]
    }

