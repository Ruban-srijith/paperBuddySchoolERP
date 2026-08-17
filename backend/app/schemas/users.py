from pydantic import BaseModel, Field, ConfigDict
from typing import Optional, List
from datetime import datetime

class UserCreateRequest(BaseModel):
    email: str
    full_name: str
    password: str = Field(default="school@123")
    role: str
    department_id: Optional[str] = None
    assigned_grade: Optional[str] = None
    phone: Optional[str] = None
    roll_number: Optional[str] = None
    admission_number: Optional[str] = None
    age: Optional[int] = None

class UserUpdateRequest(BaseModel):
    full_name: Optional[str] = None
    role: Optional[str] = None
    department_id: Optional[str] = None
    assigned_grade: Optional[str] = None
    phone: Optional[str] = None
    roll_number: Optional[str] = None
    admission_number: Optional[str] = None
    age: Optional[int] = None
    profile_picture: Optional[str] = None
    is_active: Optional[bool] = None

class UserListResponse(BaseModel):
    id: str
    email: str
    full_name: str
    role: str
    department_id: Optional[str] = None
    department_name: Optional[str] = None
    assigned_grade: Optional[str] = None
    phone: Optional[str] = None
    roll_number: Optional[str] = None
    admission_number: Optional[str] = None
    age: Optional[int] = None
    profile_picture: Optional[str] = None
    is_active: bool = True
    created_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)
