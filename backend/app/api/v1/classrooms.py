from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from typing import List

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
    result = await db.execute(select(Classroom))
    classrooms = result.scalars().all()
    return [to_frontend(c) for c in classrooms]

@router.post("", response_model=ClassroomFrontendResponse)
async def create_classroom(
    req: ClassroomCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_role(UserRole.VICE_PRINCIPAL, UserRole.SUPER_ADMIN, UserRole.CORRESPONDENT, UserRole.PRINCIPAL))
):
    new_classroom = Classroom(**req.dict())
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

    update_data = req.dict(exclude_unset=True)
    for key, value in update_data.items():
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
