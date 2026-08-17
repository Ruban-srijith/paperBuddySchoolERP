from pydantic import BaseModel, Field, ConfigDict
from typing import Optional, List
from datetime import datetime

class MentorLogCreate(BaseModel):
    student_id: str
    category: str = Field("academic", json_schema_extra={"example": "academic"}) # academic, behavioral, general
    notes: str = Field(..., json_schema_extra={"example": "Discussed study schedule for upcoming Physics midterms."})

class MentorLogResponse(BaseModel):
    id: str
    mentor_id: str
    mentor_name: Optional[str] = None
    student_id: str
    student_name: Optional[str] = None
    category: str
    notes: str
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)

class MenteeHolisticInsight(BaseModel):
    student_id: str
    student_name: str
    email: str
    grade: Optional[str] = None
    section: Optional[str] = None
    attendance_rate: float = 0.0  # percentage
    portion_progress: float = 0.0  # percentage
    submitted_labs_count: int = 0
    pending_labs_count: int = 0
    latest_mentor_notes: List[MentorLogResponse] = []
