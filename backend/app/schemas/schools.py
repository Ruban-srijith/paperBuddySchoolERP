from pydantic import BaseModel, EmailStr, ConfigDict
from typing import Optional
from datetime import datetime
from app.schemas.users import UserCreateRequest

class SchoolBase(BaseModel):
    name: str
    address: Optional[str] = None
    contact_email: Optional[EmailStr] = None

class SchoolCreate(SchoolBase):
    pass

class SchoolRegister(BaseModel):
    school: SchoolCreate
    admin_user: UserCreateRequest

class SchoolResponse(SchoolBase):
    id: str
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)
