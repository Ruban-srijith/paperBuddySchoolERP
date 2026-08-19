import sys
sys.path.insert(0, '.')
import asyncio
import uuid
from sqlalchemy.future import select
from app.db.database import AsyncSessionLocal
from app.db.models import TransportStaff, StudentTransport, User, TransportRoute, TransportStop, Vehicle

async def seed_transport():
    db = AsyncSessionLocal()
    try:
        # Get a user (e.g. for student)
        user_res = await db.execute(select(User).limit(1))
        user = user_res.scalars().first()
        if not user:
            print("No users found. Please seed users first.")
            return

        # Let's verify we have routes and stops, and if not create one
        route_res = await db.execute(select(TransportRoute).limit(1))
        route = route_res.scalars().first()
        if not route:
            route = TransportRoute(
                id=str(uuid.uuid4()),
                name="Mock Route",
                start_point="A",
                end_point="B",
                total_stops=1
            )
            db.add(route)
            await db.commit()
            
        stop_res = await db.execute(select(TransportStop).where(TransportStop.route_id == route.id).limit(1))
        stop = stop_res.scalars().first()
        if not stop:
            stop = TransportStop(
                id=str(uuid.uuid4()),
                route_id=route.id,
                stop_name="Mock Stop",
                pickup_time="08:00 AM",
                drop_time="04:00 PM"
            )
            db.add(stop)
            await db.commit()

        # Seed Staff
        staff_data = [
            {"name": "Selvam Murugan", "role": "Driver", "license_number": "TN-DL-2009-8472", "phone": "9876543210"},
            {"name": "Rajesh K", "role": "Conductor", "license_number": "N/A", "phone": "8765432109"},
        ]
        
        for s in staff_data:
            db.add(TransportStaff(
                id=str(uuid.uuid4()),
                name=s["name"],
                role=s["role"],
                license_number=s["license_number"],
                phone=s["phone"]
            ))

        # Seed Allocations
        db.add(StudentTransport(
            id=str(uuid.uuid4()),
            student_id=user.id,
            stop_id=stop.id,
            status="active"
        ))

        await db.commit()
        print("Transport Staff and Allocations Mock Data Seeded Successfully!")
    finally:
        await db.close()

if __name__ == "__main__":
    asyncio.run(seed_transport())
