from pydantic import BaseModel, ConfigDict
from typing import Optional, List
from datetime import datetime

class ParentChildSummary(BaseModel):
    student_id: str
    student_name: str
    email: str
    grade: Optional[str] = None
    section: Optional[str] = None
    admission_number: Optional[str] = None

class ParentChildOverviewResponse(BaseModel):
    student_id: str
    student_name: str
    grade: str
    section: str
    attendance_rate: float
    portion_progress: float
    fees_paid_count: int
    pending_fees_count: int
    mentor_notes_count: int

class BusTrackingResponse(BaseModel):
    id: str
    route_name: str
    driver_name: str
    driver_phone: str
    bus_number: str
    current_location: str
    status: str
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)
