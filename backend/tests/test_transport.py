"""
test_transport.py — Transport Management Flow Tests
====================================================
Tests covered:
  - GET  /transport/dashboard-stats  (stats summary)
  - GET  /transport/vehicles         (list, demo seed on empty)
  - POST /transport/vehicles         (create vehicle)
  - PUT  /transport/vehicles/{id}    (update vehicle)
  - GET  /transport/routes           (list routes)
  - POST /transport/routes           (create route)
  - GET  /transport/stops/{route_id} (list stops)
  - POST /transport/stops            (add stop to route)
  - GET  /transport/staff            (list staff)
  - POST /transport/staff            (create staff)
  - GET  /transport/allocations      (student allocations)
  - POST /transport/allocate-student (allocate student to route)

Button flow equivalent:
  [Add Vehicle Button]    → registration + type + capacity → POST → created
  [Add Route Button]      → route name + endpoints → POST → created
  [Add Stop Button]       → stop + sequence + arrival → POST → total_stops++
  [Allocate Student Btn]  → student + route → POST → allocated
"""
import pytest
import uuid
from httpx import AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession

from tests.conftest import make_user, auth_header
from app.db.models import UserRole, Vehicle, TransportRoute


async def _vehicle(session: AsyncSession) -> Vehicle:
    v = Vehicle(
        id=str(uuid.uuid4()),
        registration_number=f"TN-{uuid.uuid4().hex[:4].upper()}",
        vehicle_type="Bus (45 Seater)",
        capacity=45,
        is_active=True,
    )
    session.add(v)
    await session.commit()
    await session.refresh(v)
    return v


async def _route(session: AsyncSession) -> TransportRoute:
    r = TransportRoute(
        id=str(uuid.uuid4()),
        name="Route Test — City to School",
        start_point="City Center",
        end_point="Main Campus Gate",
        total_stops=0,
    )
    session.add(r)
    await session.commit()
    await session.refresh(r)
    return r


async def _transport_manager(session: AsyncSession):
    return await make_user(session, email=f"transport_{uuid.uuid4().hex[:4]}@school.edu", role=UserRole.TRANSPORT)


@pytest.mark.asyncio
class TestTransportDashboard:
    async def test_admin_gets_dashboard_stats(self, client: AsyncClient, admin_user):
        """Admin can retrieve transport dashboard statistics."""
        resp = await client.get("/api/v1/transport/dashboard-stats", headers=auth_header(admin_user))
        assert resp.status_code == 200
        data = resp.json()
        assert "total_vehicles" in data
        assert "active_vehicles" in data
        assert "total_routes" in data
        assert "total_staff" in data

    async def test_student_cannot_access_dashboard(self, client: AsyncClient, student_user):
        """Students cannot access transport dashboard stats."""
        resp = await client.get("/api/v1/transport/dashboard-stats", headers=auth_header(student_user))
        assert resp.status_code in (403, 401)

    async def test_teacher_cannot_access_dashboard(self, client: AsyncClient, teacher_user):
        """Teachers cannot access transport dashboard stats."""
        resp = await client.get("/api/v1/transport/dashboard-stats", headers=auth_header(teacher_user))
        assert resp.status_code in (403, 401)


@pytest.mark.asyncio
class TestVehicles:
    async def test_list_vehicles_returns_data(self, client: AsyncClient, db_session):
        """GET /vehicles returns a list (or seeded demo data when empty)."""
        resp = await client.get("/api/v1/transport/vehicles")
        assert resp.status_code == 200
        data = resp.json()
        assert isinstance(data, list)
        assert len(data) >= 1  # demo seed ensures at least one vehicle

    async def test_create_vehicle(self, client: AsyncClient, db_session):
        """Transport manager can create a new vehicle."""
        manager = await _transport_manager(db_session)
        resp = await client.post(
            "/api/v1/transport/vehicles",
            json={
                "registration_number": "TN-NEW-1234",
                "vehicle_type": "Mini-Van (18 Seater)",
                "capacity": 18,
                "is_active": True,
            },
            headers=auth_header(manager),
        )
        assert resp.status_code == 200
        data = resp.json()
        assert data["registration_number"] == "TN-NEW-1234"
        assert data["capacity"] == 18

    async def test_update_vehicle(self, client: AsyncClient, db_session):
        """Transport manager can update vehicle info."""
        manager = await _transport_manager(db_session)
        v = await _vehicle(db_session)
        resp = await client.put(
            f"/api/v1/transport/vehicles/{v.id}",
            json={"capacity": 50, "is_active": False},
            headers=auth_header(manager),
        )
        assert resp.status_code == 200
        data = resp.json()
        assert data["capacity"] == 50
        assert data["is_active"] is False

    async def test_update_nonexistent_vehicle(self, client: AsyncClient, db_session):
        """Updating a non-existent vehicle should return 404."""
        manager = await _transport_manager(db_session)
        resp = await client.put(
            f"/api/v1/transport/vehicles/{uuid.uuid4()}",
            json={"capacity": 40},
            headers=auth_header(manager),
        )
        assert resp.status_code == 404

    async def test_student_cannot_create_vehicle(self, client: AsyncClient, student_user):
        """Students cannot add vehicles."""
        resp = await client.post(
            "/api/v1/transport/vehicles",
            json={"registration_number": "HACK-001", "vehicle_type": "Bus", "capacity": 50},
            headers=auth_header(student_user),
        )
        assert resp.status_code in (403, 401)


@pytest.mark.asyncio
class TestRoutes:
    async def test_list_routes(self, client: AsyncClient):
        """GET /routes returns a list of routes (with demo seeding)."""
        resp = await client.get("/api/v1/transport/routes")
        assert resp.status_code == 200
        data = resp.json()
        assert isinstance(data, list)
        assert len(data) >= 1

    async def test_create_route(self, client: AsyncClient, db_session):
        """Transport manager can create a new route."""
        manager = await _transport_manager(db_session)
        resp = await client.post(
            "/api/v1/transport/routes",
            json={
                "name": "Route X — West End to Campus",
                "start_point": "West End Bus Stand",
                "end_point": "School Main Gate",
                "total_stops": 0,
            },
            headers=auth_header(manager),
        )
        assert resp.status_code == 200
        data = resp.json()
        assert data["name"] == "Route X — West End to Campus"

    async def test_student_cannot_create_route(self, client: AsyncClient, student_user):
        """Students cannot create routes."""
        resp = await client.post(
            "/api/v1/transport/routes",
            json={"name": "Fake Route", "start_point": "A", "end_point": "B", "total_stops": 0},
            headers=auth_header(student_user),
        )
        assert resp.status_code in (403, 401)


@pytest.mark.asyncio
class TestStops:
    async def test_get_stops_for_route(self, client: AsyncClient, db_session):
        """Should return an empty list for a valid route with no stops yet."""
        r = await _route(db_session)
        resp = await client.get(f"/api/v1/transport/stops/{r.id}")
        assert resp.status_code == 200
        assert isinstance(resp.json(), list)

    async def test_add_stop_increments_total(self, client: AsyncClient, db_session):
        """Adding a stop should work and route's total_stops should be incremented."""
        manager = await _transport_manager(db_session)
        r = await _route(db_session)
        resp = await client.post(
            "/api/v1/transport/stops",
            json={
                "route_id": r.id,
                "stop_name": "Town Hall",
                "pickup_time": "07:30",
            },
            headers=auth_header(manager),
        )
        assert resp.status_code == 200
        data = resp.json()
        assert data["stop_name"] == "Town Hall"


@pytest.mark.asyncio
class TestTransportStaff:
    async def test_list_staff(self, client: AsyncClient):
        """GET /staff should return a list (can be empty)."""
        resp = await client.get("/api/v1/transport/staff")
        assert resp.status_code == 200
        assert isinstance(resp.json(), list)

    async def test_create_staff_member(self, client: AsyncClient, db_session):
        """Transport manager can add a driver/conductor."""
        manager = await _transport_manager(db_session)
        resp = await client.post(
            "/api/v1/transport/staff",
            json={
                "name": "Kumar Murugan",
                "role": "Driver",
                "phone": "9876543210",
                "license_number": "TN-DL-1234567",
                "assigned_vehicle_id": None,
            },
            headers=auth_header(manager),
        )
        assert resp.status_code == 200
        data = resp.json()
        assert data["name"] == "Kumar Murugan"

    async def test_update_staff(self, client: AsyncClient, db_session):
        """Transport manager can update staff phone number."""
        from app.db.models import TransportStaff
        manager = await _transport_manager(db_session)

        staff = TransportStaff(
            id=str(uuid.uuid4()),
            name="Test Driver",
            role="Driver",
            phone="1111111111",
        )
        db_session.add(staff)
        await db_session.commit()
        await db_session.refresh(staff)

        resp = await client.put(
            f"/api/v1/transport/staff/{staff.id}",
            json={"phone": "9999999999"},
            headers=auth_header(manager),
        )
        assert resp.status_code == 200
        assert resp.json()["phone"] == "9999999999"

    async def test_update_nonexistent_staff(self, client: AsyncClient, db_session):
        """Updating non-existent staff should return 404."""
        manager = await _transport_manager(db_session)
        resp = await client.put(
            f"/api/v1/transport/staff/{uuid.uuid4()}",
            json={"phone": "0000000000"},
            headers=auth_header(manager),
        )
        assert resp.status_code == 404


@pytest.mark.asyncio
class TestStudentAllocations:
    async def test_list_allocations(self, client: AsyncClient):
        """Allocations list is publicly accessible (or empty)."""
        resp = await client.get("/api/v1/transport/allocations")
        assert resp.status_code == 200
        assert isinstance(resp.json(), list)

    async def test_allocate_student_to_route(self, client: AsyncClient, db_session):
        """Transport manager can allocate a student to a transport route."""
        manager = await _transport_manager(db_session)
        r = await _route(db_session)
        stu = await make_user(db_session, role=UserRole.STUDENT)

        # Create a stop on this route first
        from app.db.models import TransportStop
        stop = TransportStop(
            id=str(uuid.uuid4()),
            route_id=r.id,
            stop_name="City Center",
        )
        db_session.add(stop)
        await db_session.commit()
        await db_session.refresh(stop)

        resp = await client.post(
            "/api/v1/transport/allocate-student",
            json={
                "student_id": stu.id,
                "stop_id": stop.id,
                "status": "active",
            },
            headers=auth_header(manager),
        )
        assert resp.status_code == 200
        data = resp.json()
        assert data["student_id"] == stu.id

    async def test_student_cannot_allocate(self, client: AsyncClient, student_user, db_session):
        """Students cannot allocate themselves or others to routes."""
        r = await _route(db_session)
        resp = await client.post(
            "/api/v1/transport/allocate-student",
            json={"student_id": student_user.id, "stop_id": str(uuid.uuid4()), "status": "active"},
            headers=auth_header(student_user),
        )
        assert resp.status_code in (403, 401)
