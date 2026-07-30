from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime

class LoginRequest(BaseModel):
    email: str = Field(..., example="admin@school.edu")
    password: str = Field(..., example="school@123")

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user_id: str
    email: str
    full_name: str
    role: str
    department_id: Optional[str] = None
    assigned_grade: Optional[str] = None

class RegisterRequest(BaseModel):
    email: str = Field(..., example="new.teacher@school.edu")
    full_name: str = Field(..., example="Dr. New Teacher")
    password: str = Field(..., example="school@123")
    role: str = Field(..., example="teacher")
    department_id: Optional[str] = None
    assigned_grade: Optional[str] = None

class UserProfileResponse(BaseModel):
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

class ChangePasswordRequest(BaseModel):
    current_password: str
    new_password: str = Field(..., min_length=6)
