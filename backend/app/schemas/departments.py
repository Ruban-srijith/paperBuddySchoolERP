from pydantic import BaseModel, Field, ConfigDict
from typing import Optional, List
from datetime import datetime

class DepartmentCreateRequest(BaseModel):
    name: str = Field(..., json_schema_extra={"example": "Science"})
    code: str = Field(..., json_schema_extra={"example": "SCI"})
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

    model_config = ConfigDict(from_attributes=True)
