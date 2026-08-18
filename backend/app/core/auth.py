"""
JWT Authentication & RBAC core module.
Provides token creation/verification and FastAPI dependencies for route protection.
"""
from datetime import datetime, timedelta, timezone
from typing import Optional, List
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from jose import JWTError, jwt
import bcrypt
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from app.core.config import settings
from app.db.database import get_db
from app.db.models import User, UserRole

# ─── Password Hashing ──────────────────────────────────────────
def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return bcrypt.checkpw(plain_password.encode('utf-8'), hashed_password.encode('utf-8'))

# ─── JWT Token ──────────────────────────────────────────────────
security = HTTPBearer(auto_error=False)

def create_access_token(user_id: str, role: str, email: str, school_id: Optional[str] = None) -> str:
    """Create a signed JWT token with user info in payload."""
    now = datetime.now(timezone.utc)
    expire = now + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    payload = {
        "sub": user_id,
        "role": role,
        "email": email,
        "school_id": school_id,
        "exp": expire,
        "iat": now,
    }
    return jwt.encode(payload, settings.SECRET_KEY, algorithm=settings.ALGORITHM)

def decode_access_token(token: str) -> dict:
    """Decode and verify a JWT token. Raises on invalid/expired tokens."""
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        return payload
    except JWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired authentication token",
            headers={"WWW-Authenticate": "Bearer"},
        )

# ─── FastAPI Dependencies ──────────────────────────────────────
async def get_current_user(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(security),
    db: AsyncSession = Depends(get_db),
) -> User:
    """
    Extract the current authenticated user from the Bearer token.
    Dependency for all protected endpoints.
    """
    if credentials is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication required. Please provide a Bearer token.",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    payload = decode_access_token(credentials.credentials)
    user_id: str = payload.get("sub")
    
    if not user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token payload",
        )
    
    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalars().first()
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found or has been deactivated",
        )
    
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="User account is deactivated",
        )
    
    return user


def require_role(*allowed_roles: UserRole):
    """
    Dependency factory that enforces role-based access control.
    Usage: Depends(require_role(UserRole.SUPER_ADMIN))
    """
    async def role_checker(current_user: User = Depends(get_current_user)) -> User:
        if current_user.role not in allowed_roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Access denied. Required role(s): {[r.value for r in allowed_roles]}. "
                       f"Your role: '{current_user.role.value}'.",
            )
        return current_user
    return role_checker


# ─── Convenience Shortcuts ─────────────────────────────────────
# Pre-built role checkers for common access patterns

require_admin_or_above = require_role(
    UserRole.SUPER_ADMIN, UserRole.CORRESPONDENT, UserRole.PRINCIPAL, UserRole.VICE_PRINCIPAL
)

require_principal_or_above = require_role(
    UserRole.SUPER_ADMIN, UserRole.CORRESPONDENT, UserRole.PRINCIPAL
)

require_dean_or_above = require_role(
    UserRole.SUPER_ADMIN, UserRole.CORRESPONDENT, UserRole.PRINCIPAL, UserRole.VICE_PRINCIPAL
)

require_dept_head_or_above = require_role(
    UserRole.SUPER_ADMIN, UserRole.CORRESPONDENT, UserRole.PRINCIPAL, UserRole.VICE_PRINCIPAL
)

require_teacher_or_above = require_role(
    UserRole.SUPER_ADMIN, UserRole.CORRESPONDENT, UserRole.PRINCIPAL, UserRole.VICE_PRINCIPAL, UserRole.TEACHER
)

require_mentor_or_above = require_role(
    UserRole.SUPER_ADMIN, UserRole.CORRESPONDENT, UserRole.PRINCIPAL, UserRole.VICE_PRINCIPAL, UserRole.TEACHER, UserRole.MENTOR
)

require_any_authenticated = require_role(
    UserRole.SUPER_ADMIN, UserRole.CORRESPONDENT, UserRole.PRINCIPAL,
    UserRole.VICE_PRINCIPAL, UserRole.TEACHER,
    UserRole.MENTOR, UserRole.STUDENT, UserRole.FINANCE, UserRole.WARDEN, UserRole.LIBRARIAN, UserRole.TRANSPORT
)
