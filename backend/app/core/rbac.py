from typing import List, Set, Optional, Union
from fastapi import Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy.orm import selectinload

from app.db.database import get_db
from app.core.auth import get_current_user, get_current_platform_user_optional
from app.db.models import User, PlatformUser, Permission, RolePermission, UserRoleAssociation, Role, PositionAttribute

class SecurityContext:
    """Encapsulates authenticated identity, tenant isolation, and resolved capability permissions."""
    def __init__(
        self,
        user: Optional[User] = None,
        platform_user: Optional[PlatformUser] = None,
        permissions: Optional[Set[str]] = None,
        roles: Optional[List[str]] = None,
        position_attributes: Optional[dict] = None
    ):
        self.user = user
        self.platform_user = platform_user
        self.school_id = user.school_id if user else None
        self.permissions = permissions or set()
        self.roles = roles or []
        self.position_attributes = position_attributes or {}

    @property
    def is_platform_user(self) -> bool:
        return self.platform_user is not None

    @property
    def is_platform_admin(self) -> bool:
        return self.platform_user is not None and self.platform_user.platform_role == "platform_super_admin"

    def has_permission(self, permission_code: str) -> bool:
        if self.is_platform_admin:
            return True
        return permission_code in self.permissions

    def has_any_role(self, role_codes: List[str]) -> bool:
        if self.is_platform_admin:
            return True
        return any(r in self.roles for r in role_codes)


async def get_security_context(
    current_user: Optional[User] = Depends(get_current_user),
    platform_user: Optional[PlatformUser] = Depends(get_current_platform_user_optional),
    db: AsyncSession = Depends(get_db)
) -> SecurityContext:
    """
    FastAPI dependency resolving the current user's security context,
    joining user_roles -> role_permissions -> permissions and position_attributes.
    """
    if platform_user:
        return SecurityContext(platform_user=platform_user, permissions={"*"})

    if not current_user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication credentials were not provided."
        )

    # 1. Query resolved capability permissions for the user
    stmt = (
        select(Permission.code)
        .join(RolePermission, Permission.id == RolePermission.permission_id)
        .join(UserRoleAssociation, RolePermission.role_id == UserRoleAssociation.role_id)
        .where(UserRoleAssociation.user_id == current_user.id)
    )
    perm_res = await db.execute(stmt)
    user_permissions = set(perm_res.scalars().all())

    # 2. Query user role codes
    role_stmt = (
        select(Role.code)
        .join(UserRoleAssociation, Role.id == UserRoleAssociation.role_id)
        .where(UserRoleAssociation.user_id == current_user.id)
    )
    role_res = await db.execute(role_stmt)
    user_roles = list(role_res.scalars().all())

    # 3. Query position attributes
    attr_stmt = select(PositionAttribute).where(PositionAttribute.user_id == current_user.id)
    attr_res = await db.execute(attr_stmt)
    attrs = {attr.attribute_type: attr.attribute_value for attr in attr_res.scalars().all()}

    return SecurityContext(
        user=current_user,
        permissions=user_permissions,
        roles=user_roles,
        position_attributes=attrs
    )


def requires_permission(permission_code: str):
    """
    FastAPI route dependency enforcing capability-based authorization.
    Automatically validates school_id scoping from the security context.
    """
    async def permission_checker(
        context: SecurityContext = Depends(get_security_context)
    ) -> SecurityContext:
        if not context.has_permission(permission_code):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Permission denied. Required capability: '{permission_code}'"
            )
        return context
    return permission_checker
