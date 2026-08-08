import asyncio
import uuid
from sqlalchemy.future import select

from app.db.database import AsyncSessionLocal
from app.db.models import User, UserRole, Student

async def fix():
    async with AsyncSessionLocal() as db:
        res = await db.execute(select(User).where(User.role == UserRole.STUDENT))
        users = res.scalars().all()
        
        for u in users:
            s_res = await db.execute(select(Student).where(Student.user_id == u.id))
            if not s_res.scalars().first():
                print(f"Creating missing Student record for {u.email}")
                new_student = Student(
                    id=str(uuid.uuid4()),
                    user_id=u.id,
                    admission_number=u.admission_number or f"ADM-{u.id[:8].upper()}",
                    full_name=u.full_name,
                    class_id=None,
                )
                db.add(new_student)
        
        await db.commit()
        print("Done!")

if __name__ == "__main__":
    asyncio.run(fix())
