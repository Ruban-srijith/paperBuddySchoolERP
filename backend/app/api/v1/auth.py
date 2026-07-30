"""
Authentication API router.
POST /auth/login — Email + password login, returns JWT access token.
GET  /auth/me — Returns current authenticated user profile.
POST /auth/register — (Super Admin/Admin only) Create new user with role assignment.
POST /auth/change-password — Change own password.
"""
import uuid
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from app.db.database import get_db
from app.db.models import User, UserRole, Department
from app.core.auth import (
    hash_password, verify_password, create_access_token,
    get_current_user, require_role
)
from app.schemas.auth import (
    LoginRequest, TokenResponse, RegisterRequest,
    UserProfileResponse, ChangePasswordRequest
)

router = APIRouter(prefix="/auth", tags=["Authentication"])


@router.post("/login", response_model=TokenResponse)
async def login(req: LoginRequest, db: AsyncSession = Depends(get_db)):
    """Authenticate user with email + password and return a JWT token."""
    result = await db.execute(select(User).where(User.email == req.email))
    user = result.scalars().first()

    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
        )

    if not user.password_hash:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Account has no password set. Contact administrator.",
        )

    if not verify_password(req.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
        )

    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Account is deactivated. Contact administrator.",
        )

    access_token = create_access_token(
        user_id=user.id,
        role=user.role.value,
        email=user.email
    )

    return TokenResponse(
        access_token=access_token,
        user_id=user.id,
        email=user.email,
        full_name=user.full_name,
        role=user.role.value,
        department_id=user.department_id,
        assigned_grade=user.assigned_grade,
    )


@router.get("/me", response_model=UserProfileResponse)
async def get_me(current_user: User = Depends(get_current_user)):
    """Return the current authenticated user's profile."""
    dept_name = None
    if current_user.department:
        dept_name = current_user.department.name

    return UserProfileResponse(
        id=current_user.id,
        email=current_user.email,
        full_name=current_user.full_name,
        role=current_user.role.value,
        department_id=current_user.department_id,
        department_name=dept_name,
        assigned_grade=current_user.assigned_grade,
        is_active=current_user.is_active,
        created_at=current_user.created_at,
    )


@router.post("/register", response_model=UserProfileResponse)
async def register_user(
    req: RegisterRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_role(UserRole.SUPER_ADMIN, UserRole.ADMIN)),
):
    """Create a new user (Super Admin / Admin only)."""
    # Validate role
    try:
        role_enum = UserRole(req.role)
    except ValueError:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid role '{req.role}'. Valid roles: {[r.value for r in UserRole]}",
        )

    # Check duplicate email
    existing = await db.execute(select(User).where(User.email == req.email))
    if existing.scalars().first():
        raise HTTPException(status_code=409, detail="A user with this email already exists.")

    # Validate department if provided
    dept_name = None
    if req.department_id:
        dept_res = await db.execute(select(Department).where(Department.id == req.department_id))
        dept = dept_res.scalars().first()
        if not dept:
            raise HTTPException(status_code=404, detail="Department not found")
        dept_name = dept.name

    new_user = User(
        id=str(uuid.uuid4()),
        email=req.email,
        full_name=req.full_name,
        role=role_enum,
        password_hash=hash_password(req.password),
        department_id=req.department_id,
        assigned_grade=req.assigned_grade,
    )
    db.add(new_user)
    await db.commit()
    await db.refresh(new_user)

    return UserProfileResponse(
        id=new_user.id,
        email=new_user.email,
        full_name=new_user.full_name,
        role=new_user.role.value,
        department_id=new_user.department_id,
        department_name=dept_name,
        assigned_grade=new_user.assigned_grade,
        is_active=new_user.is_active,
        created_at=new_user.created_at,
    )


@router.post("/change-password")
async def change_password(
    req: ChangePasswordRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Change the current user's password."""
    if not current_user.password_hash:
        raise HTTPException(status_code=400, detail="No password set for this account.")

    if not verify_password(req.current_password, current_user.password_hash):
        raise HTTPException(status_code=401, detail="Current password is incorrect.")

    current_user.password_hash = hash_password(req.new_password)
    await db.commit()

    return {"status": "success", "message": "Password changed successfully"}
