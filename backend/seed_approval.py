import asyncio
import uuid
from sqlalchemy.future import select
from app.db.database import get_db, engine # type: ignore
from app.db.models import User, DepartmentBudget, FinancialRequest, UserRole # type: ignore
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker

async_session = async_sessionmaker(
    bind=engine, class_=AsyncSession, expire_on_commit=False
)

async def seed():
    async with async_session() as db:
        # Check if already seeded
        res = await db.execute(select(FinancialRequest))
        if res.scalars().first() is None:
            # Get some users to act as requesters
            users_res = await db.execute(select(User).where(User.role.in_([UserRole.TEACHER, UserRole.PRINCIPAL, UserRole.FINANCE])))
            users = users_res.scalars().all()
            
            # Get some departments
            depts_res = await db.execute(select(DepartmentBudget))
            depts = depts_res.scalars().all()
            
            if users and depts:
                requests = [
                    FinancialRequest(
                        id=str(uuid.uuid4()),
                        requester_id=users[0].id,
                        department_id=depts[0].id,
                        title="New Lab Equipment",
                        description="Requesting funds to purchase 5 new microscopes for the biology lab.",
                        amount=250000,
                        priority="high",
                        status="pending"
                    ),
                    FinancialRequest(
                        id=str(uuid.uuid4()),
                        requester_id=users[-1].id if len(users) > 1 else users[0].id,
                        department_id=depts[1].id if len(depts) > 1 else depts[0].id,
                        title="Annual Sports Day Trophies",
                        description="Medals, trophies, and certificates for the upcoming annual sports day.",
                        amount=50000,
                        priority="normal",
                        status="pending"
                    ),
                    FinancialRequest(
                        id=str(uuid.uuid4()),
                        requester_id=users[0].id,
                        department_id=depts[0].id,
                        title="Smart Board Repair",
                        description="Repair cost for the smart board in room 104.",
                        amount=15000,
                        priority="urgent",
                        status="pending"
                    )
                ]
                db.add_all(requests)
                await db.commit()
                print("Successfully seeded approval requests mock data!")
            else:
                print("Could not seed: Required users or departments not found.")
        else:
            print("Data already exists.")

if __name__ == "__main__":
    asyncio.run(seed())
