import asyncio
from app.db.database import get_db, AsyncSessionLocal
from app.db.models import User, UserRole
from app.core.auth import hash_password

async def seed_transport_user():
    async with AsyncSessionLocal() as db:
        user = User(
            email="transport@school.edu",
            full_name="Transport Administrator",
            role=UserRole.TRANSPORT,
            password_hash=hash_password("password123")
        )
        db.add(user)
        await db.commit()
        print("Transport user created successfully!")

if __name__ == "__main__":
    asyncio.run(seed_transport_user())
