from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select

from app.db.database import get_db
from app.db.models import Vehicle, TransportRoute, TransportStop, TransportStaff, StudentTransport, UserRole
from app.schemas.transport import (
    VehicleCreate, VehicleUpdate, VehicleResponse,
    TransportRouteCreate, TransportRouteResponse,
    TransportStopCreate, TransportStopResponse,
    TransportStaffCreate, TransportStaffUpdate, TransportStaffResponse,
    StudentTransportCreate, StudentTransportResponse
)
from app.core.auth import require_role

router = APIRouter(tags=["Transport Management"])

# ─── Dashboard Stats ──────────────────────────────────────────────────────────

@router.get("/dashboard-stats")
async def get_dashboard_stats(
    db: AsyncSession = Depends(get_db),
    current_user = Depends(require_role(UserRole.TRANSPORT, UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.PRINCIPAL))
):
    vehicles = await db.execute(select(Vehicle))
    routes = await db.execute(select(TransportRoute))
    staff = await db.execute(select(TransportStaff))
    
    vehicles_list = vehicles.scalars().all()
    
    return {
        "total_vehicles": len(vehicles_list),
        "active_vehicles": len([v for v in vehicles_list if v.is_active]),
        "total_routes": len(routes.scalars().all()),
        "total_staff": len(staff.scalars().all())
    }

# ─── Vehicles ─────────────────────────────────────────────────────────────────

@router.get("/vehicles", response_model=List[VehicleResponse])
async def get_vehicles(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Vehicle))
    vehicles = result.scalars().all()
    if not vehicles:
        import uuid
        sample_vehicles = [
            Vehicle(
                id=str(uuid.uuid4()),
                registration_number="TN-01-AB-4021",
                vehicle_type="Bus (45 Seater)",
                capacity=45,
                is_active=True
            ),
            Vehicle(
                id=str(uuid.uuid4()),
                registration_number="TN-01-CD-8912",
                vehicle_type="Bus (52 Seater)",
                capacity=52,
                is_active=True
            ),
            Vehicle(
                id=str(uuid.uuid4()),
                registration_number="TN-01-EF-3320",
                vehicle_type="Mini-Van (18 Seater)",
                capacity=18,
                is_active=True
            )
        ]
        for v in sample_vehicles:
            db.add(v)
        try:
            await db.commit()
            vehicles = sample_vehicles
        except Exception:
            await db.rollback()
    return vehicles

@router.post("/vehicles", response_model=VehicleResponse)
async def create_vehicle(
    req: VehicleCreate,
    db: AsyncSession = Depends(get_db),
    current_user = Depends(require_role(UserRole.TRANSPORT, UserRole.SUPER_ADMIN))
):
    vehicle = Vehicle(**req.model_dump())
    db.add(vehicle)
    await db.commit()
    await db.refresh(vehicle)
    return vehicle

@router.put("/vehicles/{vehicle_id}", response_model=VehicleResponse)
async def update_vehicle(
    vehicle_id: str,
    req: VehicleUpdate,
    db: AsyncSession = Depends(get_db),
    current_user = Depends(require_role(UserRole.TRANSPORT, UserRole.SUPER_ADMIN))
):
    result = await db.execute(select(Vehicle).where(Vehicle.id == vehicle_id))
    vehicle = result.scalar_one_or_none()
    if not vehicle:
        raise HTTPException(status_code=404, detail="Vehicle not found")
        
    update_data = req.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(vehicle, key, value)
        
    await db.commit()
    await db.refresh(vehicle)
    return vehicle

# ─── Routes ───────────────────────────────────────────────────────────────────

@router.get("/routes", response_model=List[TransportRouteResponse])
async def get_routes(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(TransportRoute))
    routes = result.scalars().all()
    if not routes:
        import uuid
        sample_routes = [
            TransportRoute(
                id=str(uuid.uuid4()),
                name="Route 01 — Anna Nagar to Main Campus",
                start_point="Anna Nagar Tower",
                end_point="Bharathi School Main Gate",
                total_stops=6
            ),
            TransportRoute(
                id=str(uuid.uuid4()),
                name="Route 02 — T. Nagar / Guindy Express",
                start_point="Panagal Park, T. Nagar",
                end_point="Bharathi School Main Gate",
                total_stops=8
            )
        ]
        for r in sample_routes:
            db.add(r)
        try:
            await db.commit()
            routes = sample_routes
        except Exception:
            await db.rollback()
    return routes

@router.post("/routes", response_model=TransportRouteResponse)
async def create_route(
    req: TransportRouteCreate,
    db: AsyncSession = Depends(get_db),
    current_user = Depends(require_role(UserRole.TRANSPORT, UserRole.SUPER_ADMIN))
):
    route = TransportRoute(**req.model_dump())
    db.add(route)
    await db.commit()
    await db.refresh(route)
    return route

# ─── Stops ────────────────────────────────────────────────────────────────────

@router.get("/stops/{route_id}", response_model=List[TransportStopResponse])
async def get_stops(route_id: str, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(TransportStop).where(TransportStop.route_id == route_id))
    return result.scalars().all()

@router.post("/stops", response_model=TransportStopResponse)
async def create_stop(
    req: TransportStopCreate,
    db: AsyncSession = Depends(get_db),
    current_user = Depends(require_role(UserRole.TRANSPORT, UserRole.SUPER_ADMIN))
):
    stop = TransportStop(**req.model_dump())
    db.add(stop)
    await db.commit()
    await db.refresh(stop)
    
    # Update total stops count
    route_res = await db.execute(select(TransportRoute).where(TransportRoute.id == req.route_id))
    route = route_res.scalar_one_or_none()
    if route:
        route.total_stops += 1
        await db.commit()
        
    return stop

# ─── Staff ────────────────────────────────────────────────────────────────────

@router.get("/staff", response_model=List[TransportStaffResponse])
async def get_staff(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(TransportStaff))
    return result.scalars().all()

@router.post("/staff", response_model=TransportStaffResponse)
async def create_staff(
    req: TransportStaffCreate,
    db: AsyncSession = Depends(get_db),
    current_user = Depends(require_role(UserRole.TRANSPORT, UserRole.SUPER_ADMIN))
):
    staff = TransportStaff(**req.model_dump())
    db.add(staff)
    await db.commit()
    await db.refresh(staff)
    return staff

@router.put("/staff/{staff_id}", response_model=TransportStaffResponse)
async def update_staff(
    staff_id: str,
    req: TransportStaffUpdate,
    db: AsyncSession = Depends(get_db),
    current_user = Depends(require_role(UserRole.TRANSPORT, UserRole.SUPER_ADMIN))
):
    result = await db.execute(select(TransportStaff).where(TransportStaff.id == staff_id))
    staff = result.scalar_one_or_none()
    if not staff:
        raise HTTPException(status_code=404, detail="Staff not found")
        
    update_data = req.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(staff, key, value)
        
    await db.commit()
    await db.refresh(staff)
    return staff

# ─── Allocations ──────────────────────────────────────────────────────────────

@router.get("/allocations", response_model=List[StudentTransportResponse])
async def get_allocations(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(StudentTransport))
    return result.scalars().all()

@router.post("/allocate-student", response_model=StudentTransportResponse)
async def allocate_student(
    req: StudentTransportCreate,
    db: AsyncSession = Depends(get_db),
    current_user = Depends(require_role(UserRole.TRANSPORT, UserRole.SUPER_ADMIN))
):
    allocation = StudentTransport(**req.model_dump())
    db.add(allocation)
    await db.commit()
    await db.refresh(allocation)
    return allocation
