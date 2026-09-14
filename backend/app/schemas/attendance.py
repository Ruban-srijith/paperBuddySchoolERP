from pydantic import BaseModel
from typing import List, Optional
from datetime import date

class AttendanceRecordItem(BaseModel):
    student_id: str
    status: str # 'present', 'absent', 'late'

class BatchAttendanceRequest(BaseModel):
    class_id: str
    marked_by: str
    date: date
    records: List[AttendanceRecordItem]

class WorkLogCreateRequest(BaseModel):
    teacher_id: str
    class_id: str
    subject_id: str
    syllabus_node_id: Optional[str] = None
    date: date
    summary: str

class WorkLogResponse(BaseModel):
    id: str
    teacher_id: str
    class_id: str
    subject_id: str
    syllabus_node_id: Optional[str] = None
    date: date
    summary: str
    auto_completed_node: bool = False
