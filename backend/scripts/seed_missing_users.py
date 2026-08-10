import asyncio
import os
import sys
import uuid
from dotenv import load_dotenv

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.db.database import engine
from app.db.models import User, UserRole
from app.core.auth import hash_password
from sqlalchemy.future import select
from sqlalchemy.orm import sessionmaker
from sqlalchemy.ext.asyncio import AsyncSession

AsyncSessionLocal = sessionmaker(
    engine, class_=AsyncSession, expire_on_commit=False
)

async def add_missing_users():
    async with AsyncSessionLocal() as db:
        print("Checking users...")
        
        # Check Warden
        warden_result = await db.execute(select(User).where(User.email == "warden@school.edu"))
        warden = warden_result.scalars().first()
        if not warden:
            print("Adding warden...")
            w = User(
                id=str(uuid.uuid4()),
                email="warden@school.edu",
                full_name="Hostel Warden",
                role=UserRole.WARDEN,
                password_hash=hash_password("school@123")
            )
            db.add(w)
            
        # Check Librarian
        librarian_result = await db.execute(select(User).where(User.email == "librarian@school.edu"))
        librarian = librarian_result.scalars().first()
        if not librarian:
            print("Adding librarian...")
            l = User(
                id=str(uuid.uuid4()),
                email="librarian@school.edu",
                full_name="Chief Librarian",
                role=UserRole.LIBRARIAN,
                password_hash=hash_password("school@123")
            )
            db.add(l)
            
        # Check Finance
        finance_result = await db.execute(select(User).where(User.email == "finance@school.edu"))
        finance = finance_result.scalars().first()
        if not finance:
            print("Adding finance...")
            f = User(
                id=str(uuid.uuid4()),
                email="finance@school.edu",
                full_name="Finance Manager",
                role=UserRole.FINANCE,
                password_hash=hash_password("school@123")
            )
            db.add(f)
            
        await db.commit()
        print("Done!")

if __name__ == "__main__":
    load_dotenv()
    asyncio.run(add_missing_users())
