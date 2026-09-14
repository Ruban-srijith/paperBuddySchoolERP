import sys
sys.path.insert(0, '.')
import asyncio
import os
from sqlalchemy.future import select
from sqlalchemy.orm import selectinload
from app.db.database import AsyncSessionLocal
from app.db.models import User, UserRole, HostelRoom, HostelAssignment, Student, Class
import uuid
from datetime import date, timezone

async def seed_mock_data():
    db = AsyncSessionLocal()
    
    # Check if there are existing students to use
    users_res = await db.execute(select(User).where(User.role == UserRole.STUDENT))
    students = users_res.scalars().all()
    
    if len(students) < 10:
        print("Creating mock students...")
        for i in range(10):
            new_user = User(
                id=str(uuid.uuid4()),
                email=f"mock_student_{i}@example.com",
                full_name=f"Mock Student {i}",
                role=UserRole.STUDENT,
                assigned_grade="10",
                is_active=True
            )
            db.add(new_user)
            students.append(new_user)
        await db.commit()

    print("Creating mock rooms...")
    rooms_data = [
        {"block": "Block A (Boys)", "number": "101", "capacity": 3},
        {"block": "Block A (Boys)", "number": "102", "capacity": 2},
        {"block": "Block B (Girls)", "number": "201", "capacity": 4},
    ]
    
    created_rooms = []
    for r_data in rooms_data:
        room = HostelRoom(
            id=str(uuid.uuid4()),
            block_name=r_data["block"],
            room_number=r_data["number"],
            capacity=r_data["capacity"],
            current_occupancy=0,
            status="available"
        )
        db.add(room)
        created_rooms.append(room)
        
    await db.commit()
    
    print("Allocating students to rooms...")
    # Allocate students
    # Room 1: 3 students
    # Room 2: 2 students
    # Room 3: 2 students
    
    student_index = 0
    
    for room in created_rooms:
        num_to_assign = min(room.capacity, 2 if room.capacity == 4 else room.capacity)
        
        for _ in range(num_to_assign):
            if student_index < len(students):
                assignment = HostelAssignment(
                    id=str(uuid.uuid4()),
                    student_id=students[student_index].id,
                    room_id=room.id,
                    assigned_on=date.today()
                )
                db.add(assignment)
                room.current_occupancy += 1
                student_index += 1
                
        if room.current_occupancy >= room.capacity:
            room.status = "full"
            
    await db.commit()
    print("Successfully seeded mock data!")
    await db.close()

if __name__ == "__main__":
    asyncio.run(seed_mock_data())
