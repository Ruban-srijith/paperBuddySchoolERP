import sys
sys.path.insert(0, '.')
import asyncio
from sqlalchemy.future import select
from app.db.database import AsyncSessionLocal
from app.db.models import DepartmentBudget, IncidentReport, VisitorLog
import uuid
from datetime import datetime, timezone

async def seed_data():
    db = AsyncSessionLocal()
    
    from app.db.models import User
    res_user = await db.execute(select(User))
    user = res_user.scalars().first()
    if not user:
        print("No user found. Please run seed.py first.")
        return
    admin_id = user.id

    # 1. Ensure Department exists for finance request
    dept_id = "dept1111-1111-1111-1111-111111111111"
    res_dept = await db.execute(select(DepartmentBudget).where(DepartmentBudget.id == dept_id))
    dept = res_dept.scalars().first()
    if not dept:
        dept = DepartmentBudget(
            id=dept_id,
            department_name="Hostel Maintenance",
            academic_year="2026",
            allocated_amount=50000.00,
            utilized_amount=0.00
        )
        db.add(dept)

    # 2. Add mock incidents
    res_inc = await db.execute(select(IncidentReport))
    if len(res_inc.scalars().all()) == 0:
        inc1 = IncidentReport(
            id=str(uuid.uuid4()),
            category="Discipline",
            severity="Medium",
            description="Noise complaint after lights out in Room 101. Warning issued.",
            status="Resolved",
            reported_by=admin_id
        )
        inc2 = IncidentReport(
            id=str(uuid.uuid4()),
            category="Maintenance",
            severity="High",
            description="Water leakage in Block B common bathroom.",
            status="Open",
            reported_by=admin_id
        )
        db.add(inc1)
        db.add(inc2)

    # 3. Add mock visitors
    res_vis = await db.execute(select(VisitorLog))
    if len(res_vis.scalars().all()) == 0:
        v1 = VisitorLog(
            id=str(uuid.uuid4()),
            visitor_name="Mr. Suresh Sharma",
            purpose="Dropping off winter clothes (Visiting: Rahul Sharma)",
            logged_by=admin_id
        )
        v2 = VisitorLog(
            id=str(uuid.uuid4()),
            visitor_name="Mrs. Kavita Kumar",
            purpose="Taking student for medical checkup (Visiting: Amit Kumar)",
            logged_by=admin_id,
            check_out=datetime.now(timezone.utc)
        )
        db.add(v1)
        db.add(v2)

    await db.commit()
    print("Mock data seeded successfully!")
    await db.close()

if __name__ == "__main__":
    asyncio.run(seed_data())
