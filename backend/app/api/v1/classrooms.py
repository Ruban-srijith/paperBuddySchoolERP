from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import func
from typing import List
import uuid

from app.db.database import get_db
from app.db.models import Classroom, User, UserRole
from app.core.auth import get_current_user, require_role
from app.schemas.classrooms import ClassroomCreate, ClassroomUpdate, ClassroomFrontendResponse

router = APIRouter()

def to_frontend(c: Classroom) -> dict:
    return {
        "id": c.id,
        "room_number": c.name,
        "building_block": c.building_block or "N/A",
        "room_type": c.room_type,
        "capacity": c.capacity or 0,
        "assigned_class": c.assigned_class or "None",
        "current_occupancy": c.current_occupancy or 0,
        "status": c.status
    }

@router.get("", response_model=List[ClassroomFrontendResponse])
async def list_classrooms(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    result = await db.execute(select(Classroom).order_by(Classroom.name))
    classrooms = result.scalars().all()
    return [to_frontend(c) for c in classrooms]

@router.post("", response_model=ClassroomFrontendResponse)
async def create_classroom(
    req: ClassroomCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_role(UserRole.VICE_PRINCIPAL, UserRole.SUPER_ADMIN, UserRole.CORRESPONDENT, UserRole.PRINCIPAL))
):
    room_name = (req.name or req.room_number or "").strip()
    if not room_name:
        raise HTTPException(status_code=400, detail="Room number / name is required")

    # Check for duplicate room name case-insensitively
    existing = await db.execute(
        select(Classroom).where(func.upper(Classroom.name) == room_name.upper())
    )
    if existing.scalar_one_or_none():
        raise HTTPException(status_code=400, detail=f"Space '{room_name}' already exists")

    is_lab = req.is_lab or (req.room_type == "lab")

    new_classroom = Classroom(
        id=str(uuid.uuid4()),
        school_id=current_user.school_id,
        name=room_name,
        building_block=req.building_block.strip() if req.building_block else None,
        room_type=req.room_type,
        capacity=req.capacity or 40,
        is_lab=is_lab,
        assigned_class=req.assigned_class.strip() if req.assigned_class else None,
        current_occupancy=req.current_occupancy or 0,
        status=req.status or "available"
    )
    db.add(new_classroom)
    await db.commit()
    await db.refresh(new_classroom)
    return to_frontend(new_classroom)

@router.put("/{classroom_id}", response_model=ClassroomFrontendResponse)
async def update_classroom(
    classroom_id: str,
    req: ClassroomUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_role(UserRole.VICE_PRINCIPAL, UserRole.SUPER_ADMIN, UserRole.CORRESPONDENT, UserRole.PRINCIPAL))
):
    result = await db.execute(select(Classroom).where(Classroom.id == classroom_id))
    classroom = result.scalar_one_or_none()
    if not classroom:
        raise HTTPException(status_code=404, detail="Classroom not found")

    update_data = req.model_dump(exclude_unset=True)
    if "room_number" in update_data and "name" not in update_data:
        update_data["name"] = update_data.pop("room_number")

    for key, value in update_data.items():
        if key == "name" and value:
            # Check duplicate name if renamed
            existing = await db.execute(
                select(Classroom).where(
                    func.upper(Classroom.name) == value.strip().upper(),
                    Classroom.id != classroom_id
                )
            )
            if existing.scalar_one_or_none():
                raise HTTPException(status_code=400, detail=f"Space '{value}' already exists")
            setattr(classroom, "name", value.strip())
        elif hasattr(classroom, key):
            setattr(classroom, key, value)
    
    await db.commit()
    await db.refresh(classroom)
    return to_frontend(classroom)

@router.delete("/{classroom_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_classroom(
    classroom_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_role(UserRole.VICE_PRINCIPAL, UserRole.SUPER_ADMIN, UserRole.CORRESPONDENT, UserRole.PRINCIPAL))
):
    result = await db.execute(select(Classroom).where(Classroom.id == classroom_id))
    classroom = result.scalar_one_or_none()
    if not classroom:
        raise HTTPException(status_code=404, detail="Classroom not found")
        
    await db.delete(classroom)
    await db.commit()
    return None
