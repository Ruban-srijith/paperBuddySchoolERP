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
from sqlalchemy import func
from sqlalchemy.future import select
from app.db.database import get_db
from app.db.models import User, UserRole, Department, PlatformUser, Permission, RolePermission, UserRoleAssociation, Role
from app.core.auth import (
    hash_password, verify_password, create_access_token,
    get_current_user, require_role
)
from app.schemas.auth import (
    LoginRequest, TokenResponse, RegisterRequest,
    UserProfileResponse, ChangePasswordRequest
)
from pydantic import BaseModel

router = APIRouter(prefix="/auth", tags=["Authentication"])


async def resolve_user_permissions_and_roles(user_id: str, db: AsyncSession):
    # Query permissions
    perm_stmt = (
        select(Permission.code)
        .join(RolePermission, Permission.id == RolePermission.permission_id)
        .join(UserRoleAssociation, RolePermission.role_id == UserRoleAssociation.role_id)
        .where(UserRoleAssociation.user_id == user_id)
    )
    perm_res = await db.execute(perm_stmt)
    permissions = list(set(perm_res.scalars().all()))

    # Query role codes
    role_stmt = (
        select(Role.code)
        .join(UserRoleAssociation, Role.id == UserRoleAssociation.role_id)
        .where(UserRoleAssociation.user_id == user_id)
    )
    role_res = await db.execute(role_stmt)
    roles = list(set(role_res.scalars().all()))

    return roles, permissions


@router.post("/login", response_model=TokenResponse)
async def login(req: LoginRequest, db: AsyncSession = Depends(get_db)):
    """Authenticate user (school user or platform admin) with email + password and return JWT token."""
    email_clean = (req.email or "").strip().lower()

    # 1. Check PlatformUser table first
    plat_res = await db.execute(select(PlatformUser).where(func.lower(PlatformUser.email) == email_clean))
    plat_user = plat_res.scalars().first()

    if plat_user:
        if not verify_password(req.password, plat_user.password_hash):
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid email or password")
        if not plat_user.is_active:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Platform admin account is deactivated.")

        token = create_access_token(
            user_id=plat_user.id,
            role=plat_user.platform_role,
            email=plat_user.email,
            is_platform=True
        )

        return TokenResponse(
            access_token=token,
            user_id=plat_user.id,
            school_id=None,
            email=plat_user.email,
            full_name=plat_user.full_name,
            role=plat_user.platform_role,
            platform_role=plat_user.platform_role,
            roles=[plat_user.platform_role],
            permissions=["*"]
        )

    # 2. Check school_users (User table)
    result = await db.execute(select(User).where(func.lower(User.email) == email_clean))
    user = result.scalars().first()

    if not user or not user.password_hash or not verify_password(req.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
        )

    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Account is deactivated. Contact administrator.",
        )

    roles, permissions = await resolve_user_permissions_and_roles(user.id, db)
    if not roles:
        roles = [user.role.value]

    access_token = create_access_token(
        user_id=user.id,
        role=user.role.value,
        email=user.email,
        school_id=user.school_id
    )

    return TokenResponse(
        access_token=access_token,
        user_id=user.id,
        school_id=user.school_id,
        email=user.email,
        full_name=user.full_name,
        role=user.role.value,
        roles=roles,
        permissions=permissions,
        department_id=user.department_id,
        assigned_grade=user.assigned_grade,
    )


@router.get("/me", response_model=UserProfileResponse)
async def get_me(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Return the current authenticated user's profile."""
    dept_name = None
    if current_user.department_id:
        dept_res = await db.execute(select(Department).where(Department.id == current_user.department_id))
        dept = dept_res.scalar_one_or_none()
        if dept:
            dept_name = dept.name

    roles, permissions = await resolve_user_permissions_and_roles(current_user.id, db)
    if not roles:
        roles = [current_user.role.value]

    return UserProfileResponse(
        id=current_user.id,
        school_id=current_user.school_id,
        email=current_user.email,
        full_name=current_user.full_name,
        role=current_user.role.value,
        roles=roles,
        permissions=permissions,
        department_id=current_user.department_id,
        department_name=dept_name,
        assigned_grade=current_user.assigned_grade,
        profile_picture=current_user.profile_picture,
        is_active=current_user.is_active,
        created_at=current_user.created_at,
    )

class ProfilePictureUpdate(BaseModel):
    profile_picture: str

@router.patch("/me/profile-picture")
async def update_profile_picture(
    req: ProfilePictureUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    current_user.profile_picture = req.profile_picture
    await db.commit()
    return {"message": "Profile picture updated"}


@router.post("/register", response_model=UserProfileResponse)
async def register_user(
    req: RegisterRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_role(UserRole.SUPER_ADMIN)),
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
        school_id=current_user.school_id,
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
        school_id=new_user.school_id,
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
