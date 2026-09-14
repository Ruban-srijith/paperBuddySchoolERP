from pydantic import BaseModel, Field, ConfigDict
from typing import Optional
from datetime import date as DateType, datetime

class SubstitutionAutoAssignRequest(BaseModel):
    timetable_id: str
    original_teacher_id: str
    target_date: DateType = Field(default_factory=DateType.today)

class SubstitutionResponse(BaseModel):
    id: str
    timetable_id: str
    class_name: str
    subject_name: str
    day_of_week: str
    time_slot: str
    original_teacher_name: str
    substitute_teacher_name: str
    target_date: DateType
    status: str
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)
