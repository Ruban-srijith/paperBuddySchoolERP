from pydantic import BaseModel, Field
from typing import Optional
from datetime import date, datetime

class LeaveRequestCreate(BaseModel):
    leave_type: str = Field("Casual", example="Casual")  # Casual, Medical, Academic
    start_date: date = Field(..., example="2026-08-01")
    end_date: date = Field(..., example="2026-08-03")
    reason: str = Field(..., example="Attending educational conference.")

class LeaveApprovalAction(BaseModel):
    status: str = Field(..., example="approved")  # approved, rejected

class LeaveRequestResponse(BaseModel):
    id: str
    applicant_id: str
    applicant_name: Optional[str] = None
    applicant_role: Optional[str] = None
    leave_type: str
    start_date: date
    end_date: date
    reason: str
    status: str
    approved_by_name: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True
