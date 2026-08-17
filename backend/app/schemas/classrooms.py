from pydantic import BaseModel, Field, ConfigDict
from typing import Optional

class ClassroomBase(BaseModel):
    name: str
    building_block: Optional[str] = None
    room_type: str = "classroom"
    capacity: Optional[int] = None
    is_lab: bool = False
    assigned_class: Optional[str] = None
    current_occupancy: int = 0
    status: str = "available"

class ClassroomCreate(ClassroomBase):
    pass

class ClassroomUpdate(BaseModel):
    name: Optional[str] = None
    building_block: Optional[str] = None
    room_type: Optional[str] = None
    capacity: Optional[int] = None
    is_lab: Optional[bool] = None
    assigned_class: Optional[str] = None
    current_occupancy: Optional[int] = None
    status: Optional[str] = None

class ClassroomResponse(ClassroomBase):
    id: str
    
    model_config = ConfigDict(from_attributes=True)

class ClassroomFrontendResponse(BaseModel):
    id: str
    room_number: str
    building_block: Optional[str] = None
    room_type: str
    capacity: Optional[int] = None
    assigned_class: Optional[str] = None
    current_occupancy: int
    status: str

    model_config = ConfigDict(from_attributes=True)
