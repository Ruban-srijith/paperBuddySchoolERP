"""
User Management API router.
GET    /users           — List all users (filterable by role, department, grade)
POST   /users           — Create user with role (Super Admin/Admin only)
PUT    /users/{id}      — Update user profile & role
GET    /users/by-role/{role} — List users by specific role
"""
import uuid
from typing import Optional, List
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy.orm import selectinload
from app.db.database import get_db
from app.db.models import User, UserRole, Department, Student
from app.core.auth import (
    hash_password, get_current_user, require_role
)
from app.schemas.users import UserCreateRequest, UserUpdateRequest, UserListResponse

router = APIRouter(prefix="/users", tags=["User Management"])


def _user_to_response(user: User) -> dict:
    """Convert User ORM to response dict."""
    return {
        "id": user.id,
        "email": user.email,
        "full_name": user.full_name,
        "role": user.role.value,
        "department_id": user.department_id,
        "department_name": user.department.name if user.department else None,
        "assigned_grade": user.assigned_grade,
        "phone": user.phone,
        "roll_number": user.roll_number,
        "admission_number": user.admission_number,
        "age": user.age,
        "profile_picture": getattr(user, 'profile_picture', None),
        "is_active": user.is_active,
        "created_at": user.created_at,
    }


@router.get("")
async def list_users(
    role: Optional[str] = Query(None, description="Filter by role"),
    department_id: Optional[str] = Query(None, description="Filter by department"),
    grade: Optional[str] = Query(None, description="Filter by assigned grade"),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_role(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.PRINCIPAL, UserRole.VICE_PRINCIPAL, UserRole.DEAN, UserRole.DEPT_HEAD)),
):
    """List all users with optional filtering."""
    query = select(User).options(selectinload(User.department))

    if role:
        try:
            role_enum = UserRole(role)
            query = query.where(User.role == role_enum)
        except ValueError:
            raise HTTPException(status_code=400, detail=f"Invalid role: {role}")

    if department_id:
        query = query.where(User.department_id == department_id)

    if grade:
        query = query.where(User.assigned_grade == grade)

    query = query.order_by(User.created_at.desc())
    result = await db.execute(query)
    users = result.scalars().all()

    return [_user_to_response(u) for u in users]


@router.post("")
async def create_user(
    req: UserCreateRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_role(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.VICE_PRINCIPAL)),
):
    """Create a new user with role assignment (Admin only)."""
    try:
        role_enum = UserRole(req.role)
    except ValueError:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid role '{req.role}'. Valid: {[r.value for r in UserRole]}",
        )

    # Check duplicate email
    existing = await db.execute(select(User).where(User.email == req.email))
    if existing.scalars().first():
        raise HTTPException(status_code=409, detail="Email already registered")

    new_user = User(
        id=str(uuid.uuid4()),
        email=req.email,
        full_name=req.full_name,
        role=role_enum,
        password_hash=hash_password(req.password),
        department_id=req.department_id,
        assigned_grade=req.assigned_grade,
        phone=req.phone,
        roll_number=req.roll_number,
        admission_number=req.admission_number,
        age=req.age,
    )
    db.add(new_user)
    
    if role_enum == UserRole.STUDENT:
        new_student = Student(
            id=str(uuid.uuid4()),
            user_id=new_user.id,
            admission_number=req.admission_number or f"ADM-{new_user.id[:8].upper()}",
            full_name=req.full_name,
            class_id=None,
        )
        db.add(new_student)
        
    await db.commit()

    # Re-fetch with relationships
    result = await db.execute(
        select(User).options(selectinload(User.department)).where(User.id == new_user.id)
    )
    created = result.scalars().first()

    return _user_to_response(created)


@router.put("/{user_id}")
async def update_user(
    user_id: str,
    req: UserUpdateRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_role(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.VICE_PRINCIPAL)),
):
    """Update user profile & role (Admin only)."""
    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalars().first()

    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    if req.full_name is not None:
        user.full_name = req.full_name
    if req.role is not None:
        try:
            user.role = UserRole(req.role)
        except ValueError:
            raise HTTPException(status_code=400, detail=f"Invalid role: {req.role}")
    if req.department_id is not None:
        user.department_id = req.department_id
    if req.assigned_grade is not None:
        user.assigned_grade = req.assigned_grade
    if req.phone is not None:
        user.phone = req.phone
    if req.roll_number is not None:
        user.roll_number = req.roll_number
    if req.admission_number is not None:
        user.admission_number = req.admission_number
    if req.age is not None:
        user.age = req.age
    if req.profile_picture is not None:
        user.profile_picture = req.profile_picture
    if req.is_active is not None:
        user.is_active = req.is_active

    await db.commit()

    # Re-fetch with relationships
    result = await db.execute(
        select(User).options(selectinload(User.department)).where(User.id == user_id)
    )
    updated = result.scalars().first()

    return _user_to_response(updated)


@router.get("/by-role/{role}")
async def get_users_by_role(
    role: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """List users by specific role. Accessible to all authenticated users."""
    try:
        role_enum = UserRole(role)
    except ValueError:
        raise HTTPException(status_code=400, detail=f"Invalid role: {role}")

    result = await db.execute(
        select(User)
        .options(selectinload(User.department))
        .where(User.role == role_enum)
        .order_by(User.full_name)
    )
    users = result.scalars().all()

    return [_user_to_response(u) for u in users]
