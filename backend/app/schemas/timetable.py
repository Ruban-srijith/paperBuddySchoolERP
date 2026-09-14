from pydantic import BaseModel
from typing import List, Optional

class TimetableItem(BaseModel):
    id: str
    class_id: str
    class_name: str
    teacher_id: str
    teacher_name: str
    subject_id: str
    subject_name: str
    classroom_id: Optional[str] = None
    classroom_name: Optional[str] = None
    day_of_week: str
    time_slot: str

class TimetableTeacherGridResponse(BaseModel):
    teacher_id: str
    teacher_name: str
    schedule: List[TimetableItem]

class SolveTimetableRequest(BaseModel):
    class_ids: Optional[List[str]] = None
    teacher_ids: Optional[List[str]] = None
