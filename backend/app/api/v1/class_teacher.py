from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from typing import List

from app.db.database import get_db
from app.db.models import User, UserRole, Student, Class, FeeStructure, FeeTransaction
from app.api.v1.auth import get_current_user
from pydantic import BaseModel

router = APIRouter()

class AuxServiceUpdate(BaseModel):
    is_bus_user: bool
    is_hostel_user: bool

def get_teacher(current_user: User = Depends(get_current_user)):
    if current_user.role not in [UserRole.TEACHER, UserRole.ADMIN, UserRole.PRINCIPAL, UserRole.SUPER_ADMIN, UserRole.CORRESPONDENT]:
        raise HTTPException(status_code=403, detail="Not authorized")
    return current_user

@router.get("/students/fees")
async def get_class_students_fees(db: AsyncSession = Depends(get_db), current_user: User = Depends(get_teacher)):
    # Find the class where this user is the class teacher
    class_result = await db.execute(select(Class).where(Class.class_teacher_id == current_user.id))
    my_class = class_result.scalars().first()
    
    if not my_class:
        # If not a class teacher, return empty for now
        return []
        
    grade = my_class.grade

    # Get all students in this class
    students_result = await db.execute(select(User).where(User.assigned_grade == grade, User.role == UserRole.STUDENT))
    users = students_result.scalars().all()
    
    # Get fee structures for this grade
    fs_result = await db.execute(select(FeeStructure).where(FeeStructure.grade == grade))
    fee_structures = fs_result.scalars().all()

    student_data = []
    
    for u in users:
        prof_result = await db.execute(select(Student).where(Student.user_id == u.id))
        prof = prof_result.scalars().first()
        
        is_bus = prof.is_bus_user if prof else False
        is_hostel = prof.is_hostel_user if prof else False
        
        # Calculate fees
        total_due = 0.0
        total_paid = 0.0
        for fs in fee_structures:
            if fs.fee_type == 'bus' and not is_bus:
                continue
            if fs.fee_type == 'hostel' and not is_hostel:
                continue
                
            total_due += float(fs.amount)
            
            tx_result = await db.execute(select(FeeTransaction).where(FeeTransaction.student_id == u.id, FeeTransaction.fee_structure_id == fs.id))
            txs = tx_result.scalars().all()
            total_paid += sum(float(t.amount_paid) for t in txs)
            
        student_data.append({
            "id": u.id,
            "full_name": u.full_name,
            "admission_number": prof.admission_number if prof else "N/A",
            "is_bus_user": is_bus,
            "is_hostel_user": is_hostel,
            "total_due": total_due,
            "total_paid": total_paid,
            "balance": total_due - total_paid
        })
        
    return student_data

@router.put("/student/{student_id}/aux-services")
async def update_aux_services(student_id: str, request: AuxServiceUpdate, db: AsyncSession = Depends(get_db), current_user: User = Depends(get_teacher)):
    prof_result = await db.execute(select(Student).where(Student.user_id == student_id))
    prof = prof_result.scalars().first()
    
    if not prof:
        raise HTTPException(status_code=404, detail="Student profile not found")
        
    prof.is_bus_user = request.is_bus_user
    prof.is_hostel_user = request.is_hostel_user
    
    try:
        await db.commit()
        return {"success": True}
    except Exception as e:
        await db.rollback()
        raise HTTPException(status_code=500, detail="Failed to update auxiliary services")
