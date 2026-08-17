from pydantic import BaseModel, Field, ConfigDict
from typing import Optional
from datetime import datetime

class LoginRequest(BaseModel):
    email: str = Field(..., json_schema_extra={"example": "admin@school.edu"})
    password: str = Field(..., json_schema_extra={"example": "school@123"})

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user_id: str
    school_id: Optional[str] = None
    email: str
    full_name: str
    role: str
    department_id: Optional[str] = None
    assigned_grade: Optional[str] = None
    profile_picture: Optional[str] = None

class RegisterRequest(BaseModel):
    email: str = Field(..., json_schema_extra={"example": "new.teacher@school.edu"})
    full_name: str = Field(..., json_schema_extra={"example": "Dr. New Teacher"})
    password: str = Field(..., json_schema_extra={"example": "school@123"})
    role: str = Field(..., json_schema_extra={"example": "teacher"})
    department_id: Optional[str] = None
    assigned_grade: Optional[str] = None

class UserProfileResponse(BaseModel):
    id: str
    school_id: Optional[str] = None
    email: str
    full_name: str
    role: str
    department_id: Optional[str] = None
    department_name: Optional[str] = None
    assigned_grade: Optional[str] = None
    profile_picture: Optional[str] = None
    is_active: bool = True
    created_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)

class ChangePasswordRequest(BaseModel):
    current_password: str
    new_password: str = Field(..., min_length=6)
