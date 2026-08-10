from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from typing import List
from uuid import uuid4
from datetime import datetime, date

from app.db.database import get_db
from app.db.models import User, UserRole, HostelRoom, HostelAssignment, HostelAttendance, Outpass, IncidentReport, VisitorLog
from app.api.v1.auth import get_current_user
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
