"""
Department Management API router.
GET    /departments              — List all departments
POST   /departments              — Create department (Admin only)
GET    /departments/{id}/teachers — List teachers in department
GET    /departments/{id}/subjects — List subjects under department
"""
import uuid
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy.orm import selectinload
from sqlalchemy import func
from app.db.database import get_db
from app.db.models import User, UserRole, Department, Subject
from app.core.auth import get_current_user, require_role
from app.schemas.departments import DepartmentCreateRequest, DepartmentUpdateRequest, DepartmentResponse

router = APIRouter(prefix="/departments", tags=["Department Management"])


@router.get("")
async def list_departments(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """List all departments with dean info and teacher count."""
    result = await db.execute(
        select(Department).options(selectinload(Department.dean))
    )
    departments = result.scalars().all()

    dept_list = []
    for dept in departments:
        # Count teachers in this department
        count_res = await db.execute(
            select(func.count(User.id)).where(User.department_id == dept.id)
        )
        teacher_count = count_res.scalar() or 0

        dept_list.append({
            "id": dept.id,
            "name": dept.name,
            "code": dept.code,
            "dean_id": dept.dean_id,
            "dean_name": dept.dean.full_name if dept.dean else None,
            "teacher_count": teacher_count,
            "created_at": dept.created_at,
        })

    return dept_list


@router.post("")
async def create_department(
    req: DepartmentCreateRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_role(UserRole.SUPER_ADMIN, UserRole.CORRESPONDENT, UserRole.PRINCIPAL, UserRole.VICE_PRINCIPAL)),
):
    """Create a new department (Admin only)."""
    # Check duplicate code
    existing = await db.execute(select(Department).where(Department.code == req.code))
    if existing.scalars().first():
        raise HTTPException(status_code=409, detail="Department code already exists")

    new_dept = Department(
        id=str(uuid.uuid4()),
        name=req.name,
        code=req.code,
        dean_id=req.dean_id,
    )
    db.add(new_dept)
    await db.commit()
    await db.refresh(new_dept)

    return {
        "id": new_dept.id,
        "name": new_dept.name,
        "code": new_dept.code,
        "dean_id": new_dept.dean_id,
        "dean_name": None,
        "teacher_count": 0,
        "created_at": new_dept.created_at,
    }


@router.get("/{department_id}/teachers")
async def get_department_teachers(
    department_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """List teachers belonging to a department."""
    result = await db.execute(
        select(User)
        .where(User.department_id == department_id)
        .order_by(User.full_name)
    )
    teachers = result.scalars().all()

    return [
        {
            "id": t.id,
            "email": t.email,
            "full_name": t.full_name,
            "role": t.role.value,
            "assigned_grade": t.assigned_grade,
        }
        for t in teachers
    ]


@router.get("/{department_id}/subjects")
async def get_department_subjects(
    department_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """List subjects under a department."""
    result = await db.execute(
        select(Subject).where(Subject.department_id == department_id)
    )
    subjects = result.scalars().all()

    return [
        {
            "id": s.id,
            "code": s.code,
            "name": s.name,
        }
        for s in subjects
    ]

@router.put("/{dept_id}")
async def update_department(
    dept_id: str,
    req: DepartmentUpdateRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_role(UserRole.SUPER_ADMIN, UserRole.CORRESPONDENT, UserRole.PRINCIPAL, UserRole.VICE_PRINCIPAL)),
):
    """Update a department (e.g. set dean)."""
    dept = await db.execute(select(Department).where(Department.id == dept_id))
    dept_obj = dept.scalar_one_or_none()
    if not dept_obj:
        raise HTTPException(status_code=404, detail="Department not found")
        
    update_data = req.model_dump(exclude_unset=True)
    if "name" in update_data:
        dept_obj.name = update_data["name"]
    if "code" in update_data:
        dept_obj.code = update_data["code"]
    if "dean_id" in update_data:
        dept_obj.dean_id = update_data["dean_id"]

    await db.commit()
    return {"message": "Department updated successfully"}

@router.delete("/{dept_id}/teachers/{teacher_id}")
async def remove_teacher_from_department(
    dept_id: str,
    teacher_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_role(UserRole.SUPER_ADMIN, UserRole.CORRESPONDENT, UserRole.PRINCIPAL, UserRole.VICE_PRINCIPAL))
):
    teacher = await db.execute(select(User).where(User.id == teacher_id, User.department_id == dept_id))
    teacher_obj = teacher.scalar_one_or_none()
    if not teacher_obj:
        raise HTTPException(status_code=404, detail="Teacher not found in this department")
        
    teacher_obj.department_id = None
    await db.commit()
    return {"message": "Teacher removed from department"}

@router.delete("/{dept_id}")
async def delete_department(
    dept_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_role(UserRole.SUPER_ADMIN, UserRole.CORRESPONDENT, UserRole.PRINCIPAL, UserRole.VICE_PRINCIPAL))
):
    dept = await db.execute(select(Department).where(Department.id == dept_id))
    dept_obj = dept.scalar_one_or_none()
    if not dept_obj:
        raise HTTPException(status_code=404, detail="Department not found")
        
    await db.delete(dept_obj)
    await db.commit()
    return {"message": "Department deleted"}
