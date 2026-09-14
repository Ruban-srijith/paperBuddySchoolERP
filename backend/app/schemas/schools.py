from pydantic import BaseModel, ConfigDict
from typing import Optional
from datetime import datetime
from app.schemas.users import UserCreateRequest

class SchoolBase(BaseModel):
    name: str
    address: Optional[str] = None
    contact_email: Optional[str] = None

class SchoolCreate(SchoolBase):
    pass

class SchoolRegister(BaseModel):
    school: SchoolCreate
    admin_user: UserCreateRequest

class SchoolResponse(SchoolBase):
    id: str
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)

