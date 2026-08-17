from pydantic import BaseModel, Field, ConfigDict
from typing import Optional
from datetime import date, datetime

class LeaveRequestCreate(BaseModel):
    leave_type: str = Field("Casual", json_schema_extra={"example": "Casual"})  # Casual, Medical, Academic
    start_date: date = Field(..., json_schema_extra={"example": "2026-08-01"})
    end_date: date = Field(..., json_schema_extra={"example": "2026-08-03"})
    reason: str = Field(..., json_schema_extra={"example": "Attending educational conference."})

class LeaveApprovalAction(BaseModel):
    status: str = Field(..., json_schema_extra={"example": "approved"})  # approved, rejected

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

    model_config = ConfigDict(from_attributes=True)
