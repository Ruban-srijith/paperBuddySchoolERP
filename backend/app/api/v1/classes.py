from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import delete, update
from sqlalchemy.orm import selectinload
from typing import List

from app.db.database import get_db
from app.db.models import (
    Class, User, UserRole, Student, Timetable, Attendance,
    DailyWorkLog, LabAssignment, Homework, HomeworkSubmission,
    Assignment, MentorAssignment, ClassTopper
)
from app.schemas.classes import ClassResponse, ClassCreate, AssignTeacherRequest
from app.core.auth import require_role, get_current_user

router = APIRouter(prefix="/classes", tags=["Classes & Allotments"])

@router.get("", response_model=List[ClassResponse])
async def get_classes(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Class).options(selectinload(Class.class_teacher)))
    classes = result.scalars().all()
    
    response = []
    for c in classes:
        teacher_name = None
        department_id = None
        if c.class_teacher:
            teacher_name = c.class_teacher.full_name
            department_id = c.class_teacher.department_id
            
        response.append(ClassResponse(
            id=c.id,
            grade=c.grade,
            section=c.section,
            class_teacher_id=c.class_teacher_id,
            teacher_name=teacher_name,
            department_id=department_id
        ))
    return response

@router.post("", response_model=ClassResponse)
async def create_class(
    class_data: ClassCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_role(UserRole.SUPER_ADMIN, UserRole.CORRESPONDENT, UserRole.PRINCIPAL, UserRole.VICE_PRINCIPAL))
):
    grade = str(class_data.grade).strip()
    section = str(class_data.section).strip().upper()

    # Check if class already exists
    existing = await db.execute(select(Class).where(Class.grade == grade, Class.section == section))
    if existing.scalar_one_or_none():
        raise HTTPException(status_code=400, detail="Class already exists")
        
    new_class = Class(grade=grade, section=section)
    db.add(new_class)
    await db.commit()
    await db.refresh(new_class)
    
    return ClassResponse(
        id=new_class.id,
        grade=new_class.grade,
        section=new_class.section
    )

@router.delete("/{class_id}")
async def delete_class(
    class_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_role(UserRole.SUPER_ADMIN, UserRole.CORRESPONDENT, UserRole.PRINCIPAL, UserRole.VICE_PRINCIPAL))
):
    result = await db.execute(select(Class).where(Class.id == class_id))
    db_class = result.scalar_one_or_none()
    if not db_class:
        raise HTTPException(status_code=404, detail="Class not found")
        
    # Unassign teacher if assigned
    if db_class.class_teacher_id:
        teacher_res = await db.execute(select(User).where(User.id == db_class.class_teacher_id))
        teacher = teacher_res.scalar_one_or_none()
        if teacher and teacher.assigned_grade == db_class.grade:
            teacher.assigned_grade = None

    # Unassign students from this class
    await db.execute(update(Student).where(Student.class_id == class_id).values(class_id=None))

    # Clean up dependent records safely
    hw_res = await db.execute(select(Homework.id).where(Homework.class_id == class_id))
    hw_ids = hw_res.scalars().all()
    if hw_ids:
        await db.execute(delete(HomeworkSubmission).where(HomeworkSubmission.homework_id.in_(hw_ids)))
    await db.execute(delete(Homework).where(Homework.class_id == class_id))
    await db.execute(delete(Assignment).where(Assignment.class_id == class_id))
    await db.execute(delete(Timetable).where(Timetable.class_id == class_id))
    await db.execute(delete(MentorAssignment).where(MentorAssignment.class_id == class_id))
    await db.execute(delete(Attendance).where(Attendance.class_id == class_id))
    await db.execute(delete(DailyWorkLog).where(DailyWorkLog.class_id == class_id))
    await db.execute(delete(LabAssignment).where(LabAssignment.class_id == class_id))
    await db.execute(delete(ClassTopper).where(ClassTopper.class_id == class_id))

    await db.delete(db_class)
    await db.commit()
    return {"message": "Class deleted successfully"}

@router.put("/{class_id}/assign")
async def assign_teacher(
    class_id: str,
    assign_data: AssignTeacherRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_role(UserRole.SUPER_ADMIN, UserRole.CORRESPONDENT, UserRole.PRINCIPAL, UserRole.VICE_PRINCIPAL))
):
    result = await db.execute(select(Class).where(Class.id == class_id))
    db_class = result.scalar_one_or_none()
    if not db_class:
        raise HTTPException(status_code=404, detail="Class not found")
        
    teacher_result = await db.execute(select(User).where(User.id == assign_data.teacher_id))
    teacher = teacher_result.scalar_one_or_none()
    if not teacher:
        raise HTTPException(status_code=404, detail="Teacher not found")
        
    # Update the teacher's assigned_grade in their User profile
    teacher.assigned_grade = db_class.grade
    
    db_class.class_teacher_id = assign_data.teacher_id
    await db.commit()
    
    return {"message": "Teacher assigned successfully"}

@router.get("/my-class", response_model=ClassResponse)
async def get_my_class(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_role(UserRole.TEACHER, UserRole.SUPER_ADMIN, UserRole.CORRESPONDENT, UserRole.PRINCIPAL, UserRole.VICE_PRINCIPAL))
):
    # Find the class where this user is the class teacher
    result = await db.execute(
        select(Class)
        .where(Class.class_teacher_id == current_user.id)
    )
    db_class = result.scalar_one_or_none()
    
    if not db_class:
        raise HTTPException(status_code=404, detail="No class assigned to you")
        
    return ClassResponse(
        id=db_class.id,
        grade=db_class.grade,
        section=db_class.section,
        class_teacher_id=db_class.class_teacher_id,
        teacher_name=current_user.full_name
    )

@router.delete("/{class_id}/assign")
async def remove_assigned_teacher(
    class_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_role(UserRole.SUPER_ADMIN, UserRole.CORRESPONDENT, UserRole.PRINCIPAL, UserRole.VICE_PRINCIPAL))
):
    result = await db.execute(select(Class).where(Class.id == class_id))
    db_class = result.scalar_one_or_none()
    if not db_class:
        raise HTTPException(status_code=404, detail="Class not found")
        
    if db_class.class_teacher_id:
        teacher_result = await db.execute(select(User).where(User.id == db_class.class_teacher_id))
        teacher = teacher_result.scalar_one_or_none()
        if teacher:
            teacher.assigned_grade = None
            
    db_class.class_teacher_id = None
    await db.commit()
    
    return {"message": "Teacher removed successfully"}
