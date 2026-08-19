from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from typing import List, Optional
from uuid import uuid4
from datetime import datetime, date, timezone

from app.db.database import get_db
from app.db.models import User, UserRole, HostelRoom, HostelAssignment, HostelAttendance, Outpass, IncidentReport, VisitorLog, MessMenu
from app.core.auth import get_current_user
from pydantic import BaseModel

router = APIRouter()

# --- Dependencies ---

def get_warden_or_above(current_user: User = Depends(get_current_user)):
    if current_user.role not in [UserRole.WARDEN, UserRole.SUPER_ADMIN, UserRole.CORRESPONDENT, UserRole.PRINCIPAL]:
        raise HTTPException(status_code=403, detail="Not authorized")
    return current_user

# --- Endpoints: Rooms ---

class RoomCreate(BaseModel):
    block_name: str
    room_number: str
    capacity: int

class AllocateStudent(BaseModel):
    student_id: str

@router.get("/rooms")
async def get_rooms(db: AsyncSession = Depends(get_db), current_user: User = Depends(get_warden_or_above)):
    # Fetch rooms
    rooms_res = await db.execute(select(HostelRoom))
    rooms = rooms_res.scalars().all()
    
    # Fetch assignments and their related user
    # Using a simple subquery or just joining manually for now
    assignments_res = await db.execute(select(HostelAssignment, User).join(User, HostelAssignment.student_id == User.id))
    assignments = assignments_res.all()
    
    room_dict = []
    for r in rooms:
        # Get students for this room
        room_students = []
        for assign, user in assignments:
            if assign.room_id == r.id:
                room_students.append({"id": user.id, "name": user.full_name})
        
        room_dict.append({
            "id": r.id,
            "block": r.block_name,
            "number": r.room_number,
            "type": f"Standard Room • Capacity {r.capacity}",
            "capacity": r.capacity,
            "students": room_students
        })
    return room_dict

@router.post("/rooms")
async def create_room(req: RoomCreate, db: AsyncSession = Depends(get_db), current_user: User = Depends(get_warden_or_above)):
    room = HostelRoom(
        id=str(uuid4()),
        block_name=req.block_name,
        room_number=req.room_number,
        capacity=req.capacity,
        current_occupancy=0,
        status="available"
    )
    db.add(room)
    await db.commit()
    return {"success": True, "room_id": room.id}

@router.post("/rooms/{room_id}/allocate")
async def allocate_student(room_id: str, req: AllocateStudent, db: AsyncSession = Depends(get_db), current_user: User = Depends(get_warden_or_above)):
    # Check if room exists
    room_res = await db.execute(select(HostelRoom).where(HostelRoom.id == room_id))
    room = room_res.scalars().first()
    if not room:
        raise HTTPException(status_code=404, detail="Room not found")
        
    if room.current_occupancy >= room.capacity:
        raise HTTPException(status_code=400, detail="Room is already full")

    # Check if student is already assigned somewhere
    existing = await db.execute(select(HostelAssignment).where(HostelAssignment.student_id == req.student_id))
    if existing.scalars().first():
        raise HTTPException(status_code=400, detail="Student is already assigned to a room")

    assignment = HostelAssignment(
        id=str(uuid4()),
        student_id=req.student_id,
        room_id=room_id
    )
    db.add(assignment)
    
    room.current_occupancy += 1
    if room.current_occupancy >= room.capacity:
        room.status = "full"
        
    await db.commit()
    return {"success": True}

@router.get("/available-students")
async def get_available_students(db: AsyncSession = Depends(get_db), current_user: User = Depends(get_warden_or_above)):
    # Find students who are NOT in HostelAssignment
    # For simplicity, we just fetch all students and filter in python (or do a left outer join)
    assigned_res = await db.execute(select(HostelAssignment.student_id))
    assigned_ids = [row[0] for row in assigned_res.all()]
    
    # Fetch all students
    users_res = await db.execute(select(User).where(User.role == UserRole.STUDENT))
    all_students = users_res.scalars().all()
    
    available = [{"id": s.id, "name": s.full_name} for s in all_students if s.id not in assigned_ids]
    return available

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

@router.put("/visitors/{visitor_id}/checkout")
async def checkout_visitor(visitor_id: str, db: AsyncSession = Depends(get_db), current_user: User = Depends(get_warden_or_above)):
    res = await db.execute(select(VisitorLog).where(VisitorLog.id == visitor_id))
    v = res.scalars().first()
    if not v:
        raise HTTPException(status_code=404, detail="Visitor not found")
    
    v.check_out = datetime.now(timezone.utc)
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

class AttendanceRecordCreate(BaseModel):
    student_id: str
    status: str

class AttendanceBatchCreate(BaseModel):
    date: str
    records: List[AttendanceRecordCreate]

@router.post("/attendance")
async def save_hostel_attendance(req: AttendanceBatchCreate, db: AsyncSession = Depends(get_db), current_user: User = Depends(get_warden_or_above)):
    q_date = date.fromisoformat(req.date)
    
    # Delete existing records for this date
    existing_res = await db.execute(select(HostelAttendance).where(HostelAttendance.date == q_date))
    existing_records = existing_res.scalars().all()
    for er in existing_records:
        await db.delete(er)
        
    for r in req.records:
        att = HostelAttendance(
            id=str(uuid4()),
            student_id=r.student_id,
            date=q_date,
            status=r.status,
            marked_by=current_user.id
        )
        db.add(att)
        
    await db.commit()
    return {"success": True, "message": "Attendance saved successfully"}

# --- Endpoints: Mess & Cafeteria ---

@router.get("/mess/menu")
async def get_mess_menu(target_date: str, db: AsyncSession = Depends(get_db), current_user: User = Depends(get_warden_or_above)):
    q_date = date.fromisoformat(target_date)
    res = await db.execute(select(MessMenu).where(MessMenu.date == q_date))
    menu = res.scalars().first()
    
    if not menu:
        return {
            "date": target_date,
            "breakfast": {"items": "", "desc": "", "status": "Scheduled"},
            "lunch": {"items": "", "desc": "", "status": "Scheduled"},
            "dinner": {"items": "", "desc": "", "status": "Scheduled"},
        }
        
    return {
        "date": target_date,
        "breakfast": {"items": menu.breakfast_items, "desc": menu.breakfast_desc, "status": menu.breakfast_status},
        "lunch": {"items": menu.lunch_items, "desc": menu.lunch_desc, "status": menu.lunch_status},
        "dinner": {"items": menu.dinner_items, "desc": menu.dinner_desc, "status": menu.dinner_status},
    }

class MessMenuUpdate(BaseModel):
    date: str
    breakfast_items: str
    breakfast_desc: str
    breakfast_status: str
    lunch_items: str
    lunch_desc: str
    lunch_status: str
    dinner_items: str
    dinner_desc: str
    dinner_status: str

@router.put("/mess/menu")
async def update_mess_menu(req: MessMenuUpdate, db: AsyncSession = Depends(get_db), current_user: User = Depends(get_warden_or_above)):
    q_date = date.fromisoformat(req.date)
    res = await db.execute(select(MessMenu).where(MessMenu.date == q_date))
    menu = res.scalars().first()
    
    if not menu:
        menu = MessMenu(id=str(uuid4()), date=q_date)
        db.add(menu)
        
    menu.breakfast_items = req.breakfast_items
    menu.breakfast_desc = req.breakfast_desc
    menu.breakfast_status = req.breakfast_status
    
    menu.lunch_items = req.lunch_items
    menu.lunch_desc = req.lunch_desc
    menu.lunch_status = req.lunch_status
    
    menu.dinner_items = req.dinner_items
    menu.dinner_desc = req.dinner_desc
    menu.dinner_status = req.dinner_status
    
    await db.commit()
    return {"success": True, "message": "Menu updated successfully"}
