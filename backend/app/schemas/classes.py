from pydantic import BaseModel
from typing import Optional

class ClassBase(BaseModel):
    grade: str
    section: str

class ClassCreate(ClassBase):
    pass

class ClassResponse(ClassBase):
    id: str
    class_teacher_id: Optional[str] = None
    teacher_name: Optional[str] = None
    department_id: Optional[str] = None

    class Config:
        from_attributes = True

class AssignTeacherRequest(BaseModel):
    teacher_id: str
