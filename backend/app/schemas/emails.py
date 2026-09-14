from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime

class SendEmailRequest(BaseModel):
    recipient_email: str
    subject: str
    body_summary: str
    event_type: Optional[str] = "notification"
    related_id: Optional[str] = None

class EmailLogResponse(BaseModel):
    id: str
    recipient_email: str
    subject: str
    body_summary: Optional[str] = None
    event_type: Optional[str] = None
    related_id: Optional[str] = None
    dedup_key: Optional[str] = None
    status: str
    retry_count: int
    sent_at: Optional[datetime] = None
    created_at: datetime
