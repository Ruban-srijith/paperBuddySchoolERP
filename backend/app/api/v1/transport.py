from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy.orm import selectinload

from app.db.database import get_db
from app.db.models import Vehicle, TransportRoute, TransportStop, TransportStaff, StudentTransport, UserRole
from app.schemas.transport import (
    VehicleCreate, VehicleUpdate, VehicleResponse,
    TransportRouteCreate, TransportRouteResponse,
    TransportStopCreate, TransportStopResponse,
    TransportStaffCreate, TransportStaffUpdate, TransportStaffResponse,
    StudentTransportCreate, StudentTransportUpdate, StudentTransportResponse
)
from app.core.auth import require_role

router = APIRouter(tags=["Transport Management"])

# ─── Dashboard Stats ──────────────────────────────────────────────────────────

@router.get("/dashboard-stats")
async def get_dashboard_stats(
    db: AsyncSession = Depends(get_db),
    current_user = Depends(require_role(UserRole.TRANSPORT, UserRole.SUPER_ADMIN, UserRole.PRINCIPAL))
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
                total_stops=5
            ),
            TransportRoute(
                id=str(uuid.uuid4()),
                name="Route 02 — T. Nagar / Guindy Express",
                start_point="Panagal Park, T. Nagar",
                end_point="Bharathi School Main Gate",
                total_stops=5
            )
        ]
        for r in sample_routes:
            db.add(r)
        try:
            await db.commit()
            routes = sample_routes
        except Exception:
            await db.rollback()

    response = []
    for r in routes:
        stops_res = await db.execute(select(TransportStop).where(TransportStop.route_id == r.id))
        stops = stops_res.scalars().all()
        stops_count = len(stops)

        # Seed stops for demo routes if not already present
        if stops_count == 0 and ("Anna Nagar" in r.name or "T. Nagar" in r.name):
            sample_stops = [
                TransportStop(route_id=r.id, stop_name="Anna Nagar Roundtana", pickup_time="07:15", drop_time="16:15"),
                TransportStop(route_id=r.id, stop_name="Shanti Colony", pickup_time="07:25", drop_time="16:05"),
                TransportStop(route_id=r.id, stop_name="Thirumangalam Metro", pickup_time="07:35", drop_time="15:55"),
                TransportStop(route_id=r.id, stop_name="Koyambedu Junction", pickup_time="07:45", drop_time="15:45"),
                TransportStop(route_id=r.id, stop_name="Campus North Gate", pickup_time="08:00", drop_time="15:30"),
            ] if "Anna Nagar" in r.name else [
                TransportStop(route_id=r.id, stop_name="Panagal Park", pickup_time="07:10", drop_time="16:20"),
                TransportStop(route_id=r.id, stop_name="T. Nagar Bus Terminus", pickup_time="07:20", drop_time="16:10"),
                TransportStop(route_id=r.id, stop_name="Guindy Kathipara", pickup_time="07:35", drop_time="15:55"),
                TransportStop(route_id=r.id, stop_name="Airport Signal", pickup_time="07:45", drop_time="15:45"),
                TransportStop(route_id=r.id, stop_name="Campus Main Gate", pickup_time="08:00", drop_time="15:30"),
            ]
            for s in sample_stops:
                db.add(s)
            try:
                await db.commit()
                stops_count = len(sample_stops)
            except Exception:
                await db.rollback()

        response.append(TransportRouteResponse(
            id=r.id,
            name=r.name,
            start_point=r.start_point,
            end_point=r.end_point,
            total_stops=stops_count
        ))
    return response

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

@router.get("/all-stops")
async def get_all_stops(db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(TransportStop).options(selectinload(TransportStop.route)).order_by(TransportStop.stop_name.asc())
    )
    stops = result.scalars().all()
    if not stops:
        # Seed default stops for existing routes
        routes_res = await db.execute(select(TransportRoute))
        routes = routes_res.scalars().all()
        if routes:
            r1_id = routes[0].id
            r2_id = routes[1].id if len(routes) > 1 else routes[0].id
            import uuid
            sample_stops = [
                TransportStop(id=str(uuid.uuid4()), route_id=r1_id, stop_name="Anna Nagar East Metro", pickup_time="07:15 AM", drop_time="04:45 PM", monthly_fee=1400.0),
                TransportStop(id=str(uuid.uuid4()), route_id=r1_id, stop_name="Roundtana Junction", pickup_time="07:30 AM", drop_time="04:30 PM", monthly_fee=1200.0),
                TransportStop(id=str(uuid.uuid4()), route_id=r1_id, stop_name="Shenoy Nagar Park", pickup_time="07:45 AM", drop_time="04:15 PM", monthly_fee=1000.0),
                TransportStop(id=str(uuid.uuid4()), route_id=r2_id, stop_name="T. Nagar Bus Terminus", pickup_time="07:10 AM", drop_time="04:50 PM", monthly_fee=1500.0),
                TransportStop(id=str(uuid.uuid4()), route_id=r2_id, stop_name="Guindy Kathipara Junction", pickup_time="07:35 AM", drop_time="04:25 PM", monthly_fee=1300.0),
                TransportStop(id=str(uuid.uuid4()), route_id=r2_id, stop_name="Main Campus North Gate", pickup_time="08:00 AM", drop_time="04:00 PM", monthly_fee=800.0),
            ]
            for s in sample_stops:
                db.add(s)
            try:
                await db.commit()
                res = await db.execute(
                    select(TransportStop).options(selectinload(TransportStop.route)).order_by(TransportStop.stop_name.asc())
                )
                stops = res.scalars().all()
            except Exception:
                await db.rollback()

    return [
        {
            "id": s.id,
            "route_id": s.route_id,
            "route_name": s.route.name if s.route else "Main Campus Route",
            "stop_name": s.stop_name,
            "pickup_time": s.pickup_time or "07:30 AM",
            "drop_time": s.drop_time or "04:30 PM",
            "monthly_fee": float(s.monthly_fee) if s.monthly_fee is not None else 1200.0
        }
        for s in stops
    ]

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

@router.get("/students")
async def get_transport_students(
    unallocated_only: bool = False,
    db: AsyncSession = Depends(get_db)
):
    """Fetch list of all students with their transport allocation status for quick selection & search."""
    from app.db.models import User, StudentTransport
    
    # Query all students
    users_res = await db.execute(
        select(User)
        .where(User.role == UserRole.STUDENT)
        .order_by(User.full_name.asc())
    )
    students = users_res.scalars().all()
    
    # Query all allocations
    allocs_res = await db.execute(
        select(StudentTransport)
        .options(
            selectinload(StudentTransport.student),
            selectinload(StudentTransport.stop).selectinload(TransportStop.route)
        )
    )
    allocations = allocs_res.scalars().all()
    alloc_map = {a.student_id: a for a in allocations}
    for a in allocations:
        if a.student:
            alloc_map[a.student.id] = a
            if a.student.email:
                alloc_map[a.student.email.lower()] = a
            if a.student.roll_number:
                alloc_map[a.student.roll_number.lower()] = a
    
    seen_ids = set()
    out = []
    for s in students:
        seen_ids.add(s.id)
        if s.email:
            seen_ids.add(s.email.lower())
        if s.roll_number:
            seen_ids.add(s.roll_number.lower())
            
        alloc = alloc_map.get(s.id)
        if not alloc and s.email:
            alloc = alloc_map.get(s.email.lower())
        if not alloc and s.roll_number:
            alloc = alloc_map.get(s.roll_number.lower())
            
        is_alloc = alloc is not None
        if unallocated_only and is_alloc:
            continue
            
        stop = alloc.stop if alloc else None
        route = stop.route if stop else None
        
        out.append({
            "id": s.id,
            "full_name": s.full_name or "Unknown Student",
            "roll_number": s.roll_number or getattr(s, "admission_number", "") or f"STU-{s.id[:6].upper()}",
            "admission_number": getattr(s, "admission_number", "") or "",
            "email": s.email or "",
            "phone": s.phone or "",
            "assigned_grade": s.assigned_grade or "Grade 10-A",
            "is_allocated": is_alloc,
            "allocated_stop_id": alloc.stop_id if alloc else None,
            "allocated_stop_name": stop.stop_name if stop else None,
            "allocated_route_name": route.name if route else None,
            "allocated_status": alloc.status if alloc else None,
        })
        
    if not unallocated_only:
        for a in allocations:
            if a.student_id not in seen_ids and (not a.student or a.student.id not in seen_ids):
                s = a.student
                stop = a.stop
                route = stop.route if stop else None
                student_display_name = s.full_name if s else f"Student ({a.student_id[:8]})"
                roll_val = getattr(s, "roll_number", "") or getattr(s, "admission_number", "") or f"STU-{a.student_id[:6].upper()}"
                out.append({
                    "id": a.student_id,
                    "full_name": student_display_name,
                    "roll_number": roll_val,
                    "admission_number": getattr(s, "admission_number", "") or "",
                    "email": getattr(s, "email", "") or "",
                    "phone": getattr(s, "phone", "") or "",
                    "assigned_grade": getattr(s, "assigned_grade", "") or "Grade 10-A",
                    "is_allocated": True,
                    "allocated_stop_id": a.stop_id,
                    "allocated_stop_name": stop.stop_name if stop else None,
                    "allocated_route_name": route.name if route else None,
                    "allocated_status": a.status or "active",
                })

    return out

@router.get("/allocations")
async def get_allocations(db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(StudentTransport)
        .options(
            selectinload(StudentTransport.student),
            selectinload(StudentTransport.stop).selectinload(TransportStop.route)
        )
    )
    allocs = result.scalars().all()
    if not allocs:
        import uuid
        from app.db.models import User
        # Ensure stops exist
        stops_res = await db.execute(select(TransportStop).options(selectinload(TransportStop.route)))
        stops = stops_res.scalars().all()
        if not stops:
            await get_all_stops(db)
            stops_res = await db.execute(select(TransportStop).options(selectinload(TransportStop.route)))
            stops = stops_res.scalars().all()

        students_res = await db.execute(select(User).where(User.role == UserRole.STUDENT).limit(6))
        students = students_res.scalars().all()
        if not students:
            all_users_res = await db.execute(select(User).limit(6))
            students = all_users_res.scalars().all()

        if students and stops:
            for idx, stu in enumerate(students):
                assigned_stop = stops[idx % len(stops)]
                db.add(StudentTransport(
                    id=str(uuid.uuid4()),
                    student_id=stu.id,
                    stop_id=assigned_stop.id,
                    status="active"
                ))
            try:
                await db.commit()
                res = await db.execute(
                    select(StudentTransport)
                    .options(
                        selectinload(StudentTransport.student),
                        selectinload(StudentTransport.stop).selectinload(TransportStop.route)
                    )
                )
                allocs = res.scalars().all()
            except Exception:
                await db.rollback()

    out = []
    for a in allocs:
        s = a.student
        stop = a.stop
        route = stop.route if stop else None
        
        student_display_name = s.full_name if s else f"Student ({a.student_id[:8]})"
        roll_val = getattr(s, "roll_number", "") or getattr(s, "admission_number", "") or f"STU-{a.student_id[:6].upper()}"
        grade_val = getattr(s, "assigned_grade", "") or "Grade 10-A"
        phone_val = getattr(s, "phone", "") or "+91 98765 43210"
        
        stop_display_name = stop.stop_name if stop else f"Stop ({a.stop_id[:8]})"
        route_display_name = route.name if route else "Route 01 – Main Express"
        pickup_val = getattr(stop, "pickup_time", "") or "07:30 AM"
        drop_val = getattr(stop, "drop_time", "") or "04:30 PM"
        fee_val = float(getattr(stop, "monthly_fee", 1200.0) or 1200.0)

        out.append({
            "id": a.id,
            "student_id": a.student_id,
            "stop_id": a.stop_id,
            "status": a.status or "active",
            "student_name": student_display_name,
            "student_roll": roll_val,
            "student_grade": grade_val,
            "student_phone": phone_val,
            "student_email": getattr(s, "email", "") or "",
            "stop_name": stop_display_name,
            "route_name": route_display_name,
            "pickup_time": pickup_val,
            "drop_time": drop_val,
            "monthly_fee": fee_val,
            "school_name": "Bharathi Matriculation Higher Secondary School"
        })
    return out

@router.post("/allocate-student")
async def allocate_student(
    req: StudentTransportCreate,
    db: AsyncSession = Depends(get_db),
    current_user = Depends(require_role(UserRole.TRANSPORT, UserRole.SUPER_ADMIN))
):
    import uuid
    from app.db.models import User
    
    student_input = (req.student_id or "").strip()
    stop_input = (req.stop_id or "").strip()

    # Look up student
    user = (await db.execute(select(User).where(User.id == student_input))).scalars().first()
    if not user:
        user = (await db.execute(select(User).where(User.email.ilike(student_input)))).scalars().first()
    if not user:
        user = (await db.execute(select(User).where(User.roll_number.ilike(student_input)))).scalars().first()
    if not user:
        user = (await db.execute(select(User).where(User.full_name.ilike(f"%{student_input}%")))).scalars().first()
        
    resolved_student_id = user.id if user else student_input

    # Look up stop
    stop = (await db.execute(select(TransportStop).where(TransportStop.id == stop_input))).scalars().first()
    if not stop:
        stop = (await db.execute(select(TransportStop).where(TransportStop.stop_name.ilike(f"%{stop_input}%")))).scalars().first()
    resolved_stop_id = stop.id if stop else stop_input

    # Check if existing allocation exists for student
    existing = (await db.execute(select(StudentTransport).where(StudentTransport.student_id == resolved_student_id))).scalars().first()
    if existing:
        existing.stop_id = resolved_stop_id
        existing.status = req.status or "active"
        await db.commit()
        await db.refresh(existing)
        return {"success": True, "id": existing.id, "student_id": existing.student_id, "stop_id": existing.stop_id, "status": existing.status}

    allocation = StudentTransport(
        id=str(uuid.uuid4()),
        student_id=resolved_student_id,
        stop_id=resolved_stop_id,
        status=req.status or "active"
    )
    db.add(allocation)
    await db.commit()
    await db.refresh(allocation)
    return {"success": True, "id": allocation.id, "student_id": allocation.student_id, "stop_id": allocation.stop_id, "status": allocation.status}

@router.put("/allocations/{allocation_id}", response_model=StudentTransportResponse)
async def update_allocation(
    allocation_id: str,
    req: StudentTransportUpdate,
    db: AsyncSession = Depends(get_db),
    current_user = Depends(require_role(UserRole.TRANSPORT, UserRole.SUPER_ADMIN))
):
    res = await db.execute(select(StudentTransport).where(StudentTransport.id == allocation_id))
    alloc = res.scalar_one_or_none()
    if not alloc:
        raise HTTPException(status_code=404, detail="Allocation not found")
    if req.stop_id is not None:
        alloc.stop_id = req.stop_id
    if req.status is not None:
        alloc.status = req.status
    await db.commit()
    await db.refresh(alloc)
    return alloc
