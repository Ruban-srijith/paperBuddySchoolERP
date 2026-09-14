from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime

class LabAssignmentCreate(BaseModel):
    class_id: str
    subject_id: str
    teacher_id: str
    title: str
    description: Optional[str] = None
    file_url: Optional[str] = None
    due_date: datetime

class LabSubmissionCreate(BaseModel):
    lab_assignment_id: str
    student_id: str
    file_url: str

class LabSubmissionResponse(BaseModel):
    id: str
    lab_assignment_id: str
    assignment_title: str
    due_date: datetime
    student_id: str
    file_url: Optional[str] = None
    status: str # 'not_submitted', 'submitted', 'late', 'graded'
    submitted_at: Optional[datetime] = None
    grade: Optional[float] = None
    feedback: Optional[str] = None
