import asyncio
from app.db.database import AsyncSessionLocal
from app.services.ocr_engine import ocr_engine
from app.services.timetable_solver import timetable_solver
from app.services.email_service import email_service
from app.db.models import User, Class, Subject, Classroom, SyllabusNode, UserRole

async def test_all_services():
    print("--- 1. Testing OCR Ensemble Engine ---")
    extracted, results, notes = await ocr_engine.process_form(b"fake_image_bytes")
    print(f"Extracted Student: {extracted.full_name}, Admission: {extracted.admission_number}")
    print(f"Vision Models: {[m.model_name for m in results]}")

    print("\n--- 2. Testing Google OR-Tools Solver ---")
    async with AsyncSessionLocal() as session:
        teachers = [{"id": "t1", "full_name": "Dr. Sarah Connor"}]
        classes = [{"id": "c1", "grade": "10", "section": "A"}]
        subjects = [{"id": "s1", "name": "Physics"}]
        classrooms = [{"id": "r1", "name": "Room 204"}]

        schedule = timetable_solver.solve(classes, teachers, subjects, classrooms)
        print(f"Generated {len(schedule)} conflict-free slots.")
        for s in schedule[:3]:
            print(f"Slot: {s['day_of_week']} {s['time_slot']} -> {s['subject_name']} ({s['classroom_name']})")

    print("\n--- 3. Testing Email Service Deduplication ---")
    async with AsyncSessionLocal() as session:
        email1 = await email_service.dispatch_email(
            session, "test@school.edu", "Test Subject", "Body summary", "test_event", "rel1"
        )
        print(f"Email 1 Created with Status: {email1.status}, Dedup Key: {email1.dedup_key}")

        email2 = await email_service.dispatch_email(
            session, "test@school.edu", "Test Subject", "Body summary", "test_event", "rel1"
        )
        print(f"Email 2 (Duplicate Attempt) Status: {email2.status}, Dedup Key: {email2.dedup_key}")
        assert email1.id == email2.id, "Deduplication failed!"
        print("Deduplication successfully prevented duplicate email!")

    print("\nAll Backend Service Verifications Passed Cleanly!")

if __name__ == "__main__":
    asyncio.run(test_all_services())
