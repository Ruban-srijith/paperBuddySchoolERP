import asyncio
from app.db.database import AsyncSessionLocal
from app.db.models import Class, Student, Timetable
from sqlalchemy.future import select
from sqlalchemy.orm import selectinload

async def test():
    async with AsyncSessionLocal() as db:
        try:
            tt_res = await db.execute(select(Timetable))
            timetables = tt_res.scalars().all()
        except Exception as e:
            print("Error in timetables query:")
            print(e)
            return

        print('Success')

asyncio.run(test())
