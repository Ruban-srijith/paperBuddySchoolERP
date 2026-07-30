from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime

class UserCreateRequest(BaseModel):
    email: str
    full_name: str
    password: str = Field(default="school@123")
    role: str
    department_id: Optional[str] = None
    assigned_grade: Optional[str] = None

class UserUpdateRequest(BaseModel):
    full_name: Optional[str] = None
    role: Optional[str] = None
    department_id: Optional[str] = None
    assigned_grade: Optional[str] = None
    is_active: Optional[bool] = None

class UserListResponse(BaseModel):
    id: str
    email: str
    full_name: str
    role: str
    department_id: Optional[str] = None
    department_name: Optional[str] = None
    assigned_grade: Optional[str] = None
    is_active: bool = True
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True
