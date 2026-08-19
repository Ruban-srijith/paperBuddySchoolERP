import asyncio
from datetime import datetime, timezone
import uuid

from app.db.database import get_db, engine  # type: ignore
from app.db.models import User, DepartmentBudget, Vendor, Scholarship, Payroll, UserRole  # type: ignore
from sqlalchemy.future import select
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker

async_session = async_sessionmaker(
    bind=engine, class_=AsyncSession, expire_on_commit=False
)

async def seed():
    async with async_session() as db:
        # Check if budgets already exist to avoid duplication
        res = await db.execute(select(DepartmentBudget))
        if res.scalars().first() is None:
            # Seed Budgets
            budgets = [
                DepartmentBudget(id=str(uuid.uuid4()), department_name="Academics", academic_year="2026-2027", allocated_amount=10000000, utilized_amount=4500000),
                DepartmentBudget(id=str(uuid.uuid4()), department_name="Infrastructure & Maintenance", academic_year="2026-2027", allocated_amount=15000000, utilized_amount=12750000),
                DepartmentBudget(id=str(uuid.uuid4()), department_name="Events & Sports", academic_year="2026-2027", allocated_amount=3000000, utilized_amount=450000)
            ]
            db.add_all(budgets)

        # Check if vendors already exist
        res = await db.execute(select(Vendor))
        if res.scalars().first() is None:
            # Seed Vendors
            vendors = [
                Vendor(id=str(uuid.uuid4()), name="Dell Technologies India", category="IT Services", contact_email="enterprise@dell.com", contact_phone="1800-425-4026"),
                Vendor(id=str(uuid.uuid4()), name="Shree Stationery Mart", category="Academics", contact_email="sales@shreemart.in", contact_phone="+91 9876543210")
            ]
            db.add_all(vendors)

        # Get a student for Scholarships
        res = await db.execute(select(Scholarship))
        if res.scalars().first() is None:
            res_s = await db.execute(select(User).where(User.role == UserRole.STUDENT))
            students = res_s.scalars().all()
            if students:
                scholarships = [
                    Scholarship(id=str(uuid.uuid4()), student_id=students[0].id, name="State Merit Scholarship", discount_amount=15000, granted_by=students[0].id)
                ]
                if len(students) > 1:
                    scholarships.append(Scholarship(id=str(uuid.uuid4()), student_id=students[1].id, name="Sports Quota Waiver", discount_amount=10000, granted_by=students[1].id))
                db.add_all(scholarships)

        # Seed Payroll
        current_month = datetime.now(timezone.utc).strftime("%Y-%m")
        res = await db.execute(select(Payroll).where(Payroll.month == current_month))
        if res.scalars().first() is None:
            res_st = await db.execute(select(User).where(User.role.in_([UserRole.TEACHER, UserRole.MENTOR, UserRole.VICE_PRINCIPAL, UserRole.WARDEN, UserRole.FINANCE])))
            staff = res_st.scalars().all()
            if staff:
                payrolls = []
                # Create a payroll for the first staff member just to show a paid row
                base = 45000.0
                bonuses = 0.0
                deductions = 0.0
                net = base + bonuses - deductions
                payrolls.append(Payroll(
                    id=str(uuid.uuid4()),
                    staff_id=staff[0].id,
                    month=current_month,
                    base_salary=base,
                    bonuses=bonuses,
                    deductions=deductions,
                    net_salary=net,
                    status="paid",
                    paid_on=datetime.now(timezone.utc)
                ))
                db.add_all(payrolls)

        await db.commit()
        print("Successfully seeded mock data!")

if __name__ == "__main__":
    asyncio.run(seed())
