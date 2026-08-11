from pydantic import BaseModel
from typing import List, Optional
from datetime import date

class VehicleCreate(BaseModel):
    registration_number: str
    vehicle_type: str = "bus"
    capacity: int
    insurance_expiry: Optional[date] = None
    fitness_expiry: Optional[date] = None
    is_active: bool = True

class VehicleUpdate(BaseModel):
    registration_number: Optional[str] = None
    vehicle_type: Optional[str] = None
    capacity: Optional[int] = None
    insurance_expiry: Optional[date] = None
    fitness_expiry: Optional[date] = None
    is_active: Optional[bool] = None

class VehicleResponse(VehicleCreate):
    id: str

class TransportRouteCreate(BaseModel):
    name: str
    start_point: str
    end_point: str
    total_stops: int = 0

class TransportRouteResponse(TransportRouteCreate):
    id: str

class TransportStopCreate(BaseModel):
    route_id: str
    stop_name: str
    pickup_time: Optional[str] = None
    drop_time: Optional[str] = None
    monthly_fee: float = 0.0

class TransportStopResponse(TransportStopCreate):
    id: str

class TransportStaffCreate(BaseModel):
    name: str
    role: str = "driver"
    license_number: Optional[str] = None
    phone: Optional[str] = None
    assigned_vehicle_id: Optional[str] = None

class TransportStaffUpdate(BaseModel):
    name: Optional[str] = None
    role: Optional[str] = None
    license_number: Optional[str] = None
    phone: Optional[str] = None
    assigned_vehicle_id: Optional[str] = None

class TransportStaffResponse(TransportStaffCreate):
    id: str

class StudentTransportCreate(BaseModel):
    student_id: str
    stop_id: str
    status: str = "active"

class StudentTransportResponse(StudentTransportCreate):
    id: str
