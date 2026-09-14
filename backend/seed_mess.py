import sys
sys.path.insert(0, '.')
import asyncio
from sqlalchemy.future import select
from app.db.database import AsyncSessionLocal
from app.db.models import MessMenu
import uuid
from datetime import date

async def seed_mess_data():
    db = AsyncSessionLocal()
    
    today = date.today()
    res = await db.execute(select(MessMenu).where(MessMenu.date == today))
    existing = res.scalars().first()
    
    if not existing:
        menu = MessMenu(
            id=str(uuid.uuid4()),
            date=today,
            breakfast_items="Idli, Vada, Sambar",
            breakfast_desc="Coconut Chutney, Coffee / Milk",
            breakfast_status="Served",
            lunch_items="Rice, Roti, Dal Makhani",
            lunch_desc="Mixed Veg Curry, Salad, Papad",
            lunch_status="Preparing",
            dinner_items="Phulka, Paneer Butter Masala",
            dinner_desc="Jeera Rice, Gulab Jamun",
            dinner_status="Scheduled"
        )
        db.add(menu)
        await db.commit()
        print("Mock Mess Menu seeded successfully!")
    else:
        print("Menu already exists for today.")
        
    await db.close()

if __name__ == "__main__":
    asyncio.run(seed_mess_data())
