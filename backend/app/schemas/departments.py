from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime

class DepartmentCreateRequest(BaseModel):
    name: str = Field(..., example="Science")
    code: str = Field(..., example="SCI")
    dean_id: Optional[str] = None

class DepartmentUpdateRequest(BaseModel):
    name: Optional[str] = None
    code: Optional[str] = None
    dean_id: Optional[str] = None

class DepartmentResponse(BaseModel):
    id: str
    name: str
    code: str
    dean_id: Optional[str] = None
    dean_name: Optional[str] = None
    teacher_count: int = 0
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True
