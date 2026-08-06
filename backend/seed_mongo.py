"""
Seed script for MongoDB Local database: paperbuddy_erp
Populates all collections with production-grade test data.
Run with: python seed_mongo.py
"""

import sys
import os
from datetime import datetime
import bcrypt
from pymongo import MongoClient

def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

MONGODB_URL = os.getenv("MONGODB_URL", "mongodb://localhost:27017")
DB_NAME = os.getenv("MONGODB_DB_NAME", "paperbuddy_erp")

def seed_mongodb():
    print(f"Connecting to MongoDB at {MONGODB_URL} (Database: {DB_NAME})...")
    client = MongoClient(MONGODB_URL, serverSelectionTimeoutMS=3000)
    
    # Test connection
    try:
        client.admin.command('ping')
        print("Connected to MongoDB successfully.")
    except Exception as e:
        print(f"ERROR: Could not connect to MongoDB at {MONGODB_URL}: {e}")
        sys.exit(1)

    db = client[DB_NAME]
    default_hashed = hash_password("school@123")

    # 1. Users Collection
    print("Seeding 'users' collection...")
    db.users.drop()
    users_data = [
        {
            "username": "superadmin",
            "email": "superadmin@school.edu",
            "full_name": "Dr. Arumugam Correspondent",
            "role": "super_admin",
            "hashed_password": default_hashed,
            "is_active": True,
            "department": "School Trust & Board of Governors",
            "assigned_grade": "All Grades (LKG-12th)",
            "phone": "+91 98401 00001",
            "created_at": datetime.utcnow()
        },
        {
            "username": "correspondent",
            "email": "correspondent@school.edu",
            "full_name": "Mr. K. Sundararajan",
            "role": "correspondent",
            "hashed_password": default_hashed,
            "is_active": True,
            "department": "School Trust & Board of Governors",
            "assigned_grade": "All Grades (LKG-12th)",
            "phone": "+91 98401 00002",
            "created_at": datetime.utcnow()
        },
        {
            "username": "admin",
            "email": "principal@school.edu",
            "full_name": "Dr. Sarah Connor",
            "role": "admin",
            "hashed_password": default_hashed,
            "is_active": True,
            "department": "Executive Academic Administration",
            "assigned_grade": "All Grades (LKG-12th)",
            "phone": "+91 98401 00003",
            "created_at": datetime.utcnow()
        },
        {
            "username": "principal",
            "email": "principal.office@school.edu",
            "full_name": "Dr. Sarah Connor",
            "role": "principal",
            "hashed_password": default_hashed,
            "is_active": True,
            "department": "Executive Academic Administration",
            "assigned_grade": "All Grades (LKG-12th)",
            "phone": "+91 98401 00004",
            "created_at": datetime.utcnow()
        },
        {
            "username": "subadmin",
            "email": "vp@school.edu",
            "full_name": "Prof. Alan Turing",
            "role": "vice_principal",
            "hashed_password": default_hashed,
            "is_active": True,
            "department": "Academic Operations & Curriculum",
            "assigned_grade": "Grades 9th-12th (Senior Wing)",
            "phone": "+91 98401 00005",
            "created_at": datetime.utcnow()
        },
        {
            "username": "vice_principal",
            "email": "vice_principal@school.edu",
            "full_name": "Prof. Alan Turing",
            "role": "vice_principal",
            "hashed_password": default_hashed,
            "is_active": True,
            "department": "Academic Operations & Curriculum",
            "assigned_grade": "Grades 9th-12th (Senior Wing)",
            "phone": "+91 98401 00006",
            "created_at": datetime.utcnow()
        },
        {
            "username": "dean",
            "email": "dean@school.edu",
            "full_name": "Dr. Marie Curie",
            "role": "dean",
            "hashed_password": default_hashed,
            "is_active": True,
            "department": "Science & Research Labs",
            "assigned_grade": "Grades 11th-12th",
            "phone": "+91 98401 00007",
            "created_at": datetime.utcnow()
        },
        {
            "username": "teacher",
            "email": "teacher@school.edu",
            "full_name": "Mrs. Revathi Raman",
            "role": "teacher",
            "hashed_password": default_hashed,
            "is_active": True,
            "department": "Science Department",
            "assigned_grade": "Grade 10 - Section A",
            "phone": "+91 98401 00008",
            "created_at": datetime.utcnow()
        },
        {
            "username": "mentor",
            "email": "mentor@school.edu",
            "full_name": "Mr. Alex Mercer",
            "role": "mentor",
            "hashed_password": default_hashed,
            "is_active": True,
            "department": "Student Guidance & Counseling",
            "assigned_grade": "Grade 10 & 11 (Mentorship Group A)",
            "phone": "+91 98401 00009",
            "created_at": datetime.utcnow()
        },
        {
            "username": "student",
            "email": "student@school.edu",
            "full_name": "Kishor Kumar",
            "role": "student",
            "hashed_password": default_hashed,
            "is_active": True,
            "department": "General Academics",
            "assigned_grade": "Grade 10 - Section A",
            "admission_no": "PB-2024-089",
            "roll_no": 1,
            "phone": "+91 98401 00010",
            "created_at": datetime.utcnow()
        },
        {
            "username": "parent",
            "email": "parent@school.edu",
            "full_name": "Mr. S. Kumar (Father of Kishor)",
            "role": "parent",
            "hashed_password": default_hashed,
            "is_active": True,
            "department": "Parent Council",
            "assigned_grade": "Grade 10 - Section A",
            "phone": "+91 98401 00011",
            "created_at": datetime.utcnow()
        }
    ]
    db.users.insert_many(users_data)
    print(f"  Inserted {len(users_data)} users.")

    # 2. Grade Levels (LKG through 12th)
    print("Seeding 'grade_levels' collection...")
    db.grade_levels.drop()
    grades = [
        {"code": "LKG", "name": "Lower Kindergarten", "stage": "Early Childhood", "sections": ["A", "B"], "total_students": 45, "class_teacher": "Ms. Anitha", "room": "Room 001"},
        {"code": "UKG", "name": "Upper Kindergarten", "stage": "Early Childhood", "sections": ["A", "B"], "total_students": 48, "class_teacher": "Ms. Bhavani", "room": "Room 002"},
        {"code": "1", "name": "Grade 1", "stage": "Primary", "sections": ["A", "B"], "total_students": 60, "class_teacher": "Mrs. Priya N", "room": "Room 101"},
        {"code": "2", "name": "Grade 2", "stage": "Primary", "sections": ["A", "B"], "total_students": 58, "class_teacher": "Mrs. Deepa K", "room": "Room 102"},
        {"code": "3", "name": "Grade 3", "stage": "Primary", "sections": ["A", "B"], "total_students": 62, "class_teacher": "Mr. Karthik", "room": "Room 103"},
        {"code": "4", "name": "Grade 4", "stage": "Primary", "sections": ["A", "B"], "total_students": 60, "class_teacher": "Mrs. Shanthi", "room": "Room 104"},
        {"code": "5", "name": "Grade 5", "stage": "Primary", "sections": ["A", "B"], "total_students": 64, "class_teacher": "Mr. Rajesh S", "room": "Room 105"},
        {"code": "6", "name": "Grade 6", "stage": "Middle", "sections": ["A", "B"], "total_students": 65, "class_teacher": "Mrs. Meena R", "room": "Room 201"},
        {"code": "7", "name": "Grade 7", "stage": "Middle", "sections": ["A", "B"], "total_students": 64, "class_teacher": "Mr. Suresh P", "room": "Room 202"},
        {"code": "8", "name": "Grade 8", "stage": "Middle", "sections": ["A", "B"], "total_students": 66, "class_teacher": "Mrs. Vidya M", "room": "Room 203"},
        {"code": "9", "name": "Grade 9", "stage": "Secondary", "sections": ["A", "B"], "total_students": 62, "class_teacher": "Mr. Alex Mercer", "room": "Room 204"},
        {"code": "10", "name": "Grade 10", "stage": "Secondary (Board)", "sections": ["A", "B"], "total_students": 60, "class_teacher": "Mrs. Revathi Raman", "room": "Room 301"},
        {"code": "11", "name": "Grade 11", "stage": "Higher Secondary", "sections": ["A (Science)", "B (Commerce)"], "total_students": 58, "class_teacher": "Dr. Marie Curie", "room": "Room 302"},
        {"code": "12", "name": "Grade 12", "stage": "Higher Secondary (Board)", "sections": ["A (Science)", "B (Commerce)"], "total_students": 56, "class_teacher": "Prof. Alan Turing", "room": "Room 303"},
    ]
    db.grade_levels.insert_many(grades)
    print(f"  Inserted {len(grades)} grade levels.")

    # 3. Academic Calendar Events
    print("Seeding 'calendar_events' collection...")
    db.calendar_events.drop()
    calendar_events = [
        {"title": "Independence Day Celebrations", "date": "2026-08-15", "type": "celebration", "target_audience": "All Students & Faculty", "description": "Flag hoisting at 08:00 AM, cultural parade & patriotic speeches."},
        {"title": "Term 1 Mid-Term Examinations", "date": "2026-08-18", "end_date": "2026-08-25", "type": "examination", "target_audience": "Grades 1 to 12", "description": "Centralized mid-term assessments across all CBSE subjects."},
        {"title": "Inter-House Athletics Meet & Relay Trials", "date": "2026-08-28", "type": "sports", "target_audience": "Grades 6 to 12", "description": "Track events, 4x100m relay, long jump, and shot put at main stadium."},
        {"title": "Teachers' Day & Student Leadership Assembly", "date": "2026-09-05", "type": "celebration", "target_audience": "All Campus", "description": "Special assembly felicitating teaching faculty and senior student leaders."},
        {"title": "Term 1 Report Card Distribution & PTM", "date": "2026-09-12", "type": "meeting", "target_audience": "Parents & Teachers", "description": "Parent-teacher conference to review student progress cards and attendance."}
    ]
    db.calendar_events.insert_many(calendar_events)
    print(f"  Inserted {len(calendar_events)} calendar events.")

    # 4. Salary Approvals & Payroll Records
    print("Seeding 'salary_records' collection...")
    db.salary_records.drop()
    salary_records = [
        {"employee_id": "EMP-1001", "name": "Dr. Sarah Connor", "role": "Principal", "month": "July 2026", "basic_pay": 95000, "hra": 25000, "da": 15000, "deductions": 7000, "net_salary": 128000, "status": "approved", "processed_on": "2026-08-01"},
        {"employee_id": "EMP-1002", "name": "Prof. Alan Turing", "role": "Vice-Principal", "month": "July 2026", "basic_pay": 82000, "hra": 20000, "da": 12000, "deductions": 6000, "net_salary": 108000, "status": "approved", "processed_on": "2026-08-01"},
        {"employee_id": "EMP-1003", "name": "Dr. Marie Curie", "role": "Dean of Science", "month": "July 2026", "basic_pay": 75000, "hra": 18000, "da": 11000, "deductions": 5500, "net_salary": 98500, "status": "pending_superadmin", "processed_on": "2026-08-02"},
        {"employee_id": "EMP-1004", "name": "Mrs. Revathi Raman", "role": "Senior Faculty", "month": "July 2026", "basic_pay": 62000, "hra": 15000, "da": 9000, "deductions": 4500, "net_salary": 81500, "status": "pending_superadmin", "processed_on": "2026-08-02"},
        {"employee_id": "EMP-1005", "name": "Mr. Alex Mercer", "role": "CS Faculty", "month": "July 2026", "basic_pay": 58000, "hra": 14000, "da": 8500, "deductions": 4200, "net_salary": 76300, "status": "pending_superadmin", "processed_on": "2026-08-02"}
    ]
    db.salary_records.insert_many(salary_records)
    print(f"  Inserted {len(salary_records)} salary records.")

    # 5. Major School Events & Budgets
    print("Seeding 'school_events' collection...")
    db.school_events.drop()
    school_events = [
        {"title": "Annual National Science & Innovation Expo 2026", "proposed_by": "Dr. Marie Curie", "category": "Academic / STEM", "budget_requested": 150000, "venue": "Central Auditorium & Science Wing", "date": "2026-09-18", "participants": 450, "status": "pending_superadmin", "description": "Inter-school science competition with 40 school teams, keynote roboticists, and tech exhibits."},
        {"title": "CBSE Cluster VI Football & Basketball Tournament", "proposed_by": "Sports Department", "category": "Sports Tournament", "budget_requested": 220000, "venue": "Main School Sports Pavilion", "date": "2026-10-10", "participants": 600, "status": "approved", "description": "Hosting regional championship with 24 visiting school teams across 4 days."},
        {"title": "Independence Day Flag Ceremony & Cultural Gala", "proposed_by": "Cultural Committee", "category": "National Celebration", "budget_requested": 45000, "venue": "Main Quadrangle", "date": "2026-08-15", "participants": 850, "status": "approved", "description": "Ceremonial flag hoisting, band parade, and cultural dance drama."}
    ]
    db.school_events.insert_many(school_events)
    print(f"  Inserted {len(school_events)} school events.")

    # 6. Teachers Workload & Syllabus Velocity
    print("Seeding 'teachers_workload' collection...")
    db.teachers_workload.drop()
    workload = [
        {"teacher_name": "Mrs. Revathi Raman", "department": "Science", "subject": "Physics (Grade 10)", "weekly_periods": 24, "max_periods": 26, "syllabus_pct": 72, "target_pct": 70, "lag_status": "on_track", "lab_sessions": 6},
        {"teacher_name": "Prof. Alan Turing", "department": "Mathematics", "subject": "Calculus (Grade 12)", "weekly_periods": 22, "max_periods": 26, "syllabus_pct": 68, "target_pct": 65, "lag_status": "ahead", "lab_sessions": 4},
        {"teacher_name": "Dr. Marie Curie", "department": "Science", "subject": "Chemistry (Grade 11 & 12)", "weekly_periods": 26, "max_periods": 26, "syllabus_pct": 75, "target_pct": 70, "lag_status": "ahead", "lab_sessions": 8},
        {"teacher_name": "Mr. Alex Mercer", "department": "Computer Science", "subject": "Python & AI (Grade 10 & 11)", "weekly_periods": 20, "max_periods": 26, "syllabus_pct": 80, "target_pct": 75, "lag_status": "ahead", "lab_sessions": 10}
    ]
    db.teachers_workload.insert_many(workload)
    print(f"  Inserted {len(workload)} workload records.")

    # 7. Classroom & Lab Allocations
    print("Seeding 'classroom_allocations' collection...")
    db.classroom_allocations.drop()
    classrooms = [
        {"room_number": "Room 101", "block": "Block A (Primary)", "type": "classroom", "capacity": 35, "assigned_class": "Grade 1-A", "occupancy": 30, "status": "occupied"},
        {"room_number": "Room 102", "block": "Block A (Primary)", "type": "classroom", "capacity": 35, "assigned_class": "Grade 1-B", "occupancy": 30, "status": "occupied"},
        {"room_number": "Room 201", "block": "Block B (Middle)", "type": "classroom", "capacity": 40, "assigned_class": "Grade 6-A", "occupancy": 32, "status": "occupied"},
        {"room_number": "Room 301", "block": "Block C (Senior)", "type": "classroom", "capacity": 40, "assigned_class": "Grade 10-A", "occupancy": 30, "status": "occupied"},
        {"room_number": "Physics Lab 204", "block": "Science Block", "type": "lab", "capacity": 36, "assigned_class": "Grade 10-A (Practical)", "occupancy": 30, "status": "occupied"},
        {"room_number": "Chem Lab 2", "block": "Science Block", "type": "lab", "capacity": 32, "assigned_class": "Grade 12-A", "occupancy": 28, "status": "occupied"},
        {"room_number": "CS Lab 1", "block": "Tech Wing", "type": "lab", "capacity": 40, "assigned_class": "Grade 11-A", "occupancy": 32, "status": "occupied"},
        {"room_number": "Main Auditorium", "block": "Central Complex", "type": "auditorium", "capacity": 500, "assigned_class": "School Assembly", "occupancy": 450, "status": "occupied"}
    ]
    db.classroom_allocations.insert_many(classrooms)
    print(f"  Inserted {len(classrooms)} classroom allocation records.")

    # 8. Examinations
    print("Seeding 'examinations' collection...")
    db.examinations.drop()
    exams = [
        {"subject": "Physics (Theory)", "code": "PHY-101", "grade": "10-A", "date": "2026-08-18", "time": "09:00 AM - 12:00 PM", "hall": "Hall A (Room 301)", "invigilator": "Prof. Alan Turing", "max_marks": 80, "status": "scheduled"},
        {"subject": "Mathematics", "code": "MAT-101", "grade": "10-A", "date": "2026-08-20", "time": "09:00 AM - 12:00 PM", "hall": "Hall A (Room 301)", "invigilator": "Dr. Marie Curie", "max_marks": 80, "status": "scheduled"},
        {"subject": "Computer Science (Practical)", "code": "CSC-102", "grade": "11-A", "date": "2026-08-22", "time": "01:30 PM - 04:30 PM", "hall": "CS Lab 1", "invigilator": "Alex Mercer", "max_marks": 30, "status": "scheduled"},
        {"subject": "Chemistry (Theory)", "code": "CHE-101", "grade": "12-A", "date": "2026-08-25", "time": "09:00 AM - 12:00 PM", "hall": "Hall B (Room 302)", "invigilator": "Mrs. Revathi Raman", "max_marks": 70, "status": "scheduled"}
    ]
    db.examinations.insert_many(exams)
    print(f"  Inserted {len(exams)} examination records.")

    # 9. Homework & Course Assignments
    print("Seeding 'homework' and 'assignments' collections...")
    db.homework.drop()
    hw = [
        {"title": "Electromagnetic Induction Practice Problems (Exercise 4.2)", "subject": "Physics", "grade": "10-A", "due_date": "2026-08-10", "description": "Solve questions 1 through 15 from Chapter 4. Draw neat ray diagrams for Faraday's law.", "status": "pending"},
        {"title": "Quadratic Equations Word Problems", "subject": "Mathematics", "grade": "10-A", "due_date": "2026-08-09", "description": "Complete NCERT exercise 3.4 on nature of roots and discriminant analysis.", "status": "submitted"},
        {"title": "Python Dictionary & Tuple Comprehensions", "subject": "Computer Science", "grade": "10-A", "due_date": "2026-08-12", "description": "Write code snippets for word frequency counting and nested dictionary inversion.", "status": "pending"}
    ]
    db.homework.insert_many(hw)

    db.assignments.drop()
    assignments = [
        {"title": "Ray Optics & Wave Theory Term Paper", "subject": "Physics", "grade": "10-A", "due_date": "2026-08-20", "max_marks": 50, "description": "5-page paper covering Snell's law derivation, telescope optics, and Huygens' principle proofs.", "submissions_count": 26, "total_students": 30},
        {"title": "Python Data Structures: Stacks & Queues", "subject": "Computer Science", "grade": "11-A", "due_date": "2026-08-18", "max_marks": 40, "description": "Implement dynamic stacks and double-ended queues with unit test suites.", "submissions_count": 28, "total_students": 32}
    ]
    db.assignments.insert_many(assignments)
    print(f"  Inserted {len(hw)} homework & {len(assignments)} assignments.")

    # 10. Academic Doubts & Queries
    print("Seeding 'academic_doubts' collection...")
    db.academic_doubts.drop()
    doubts = [
        {"student_name": "Kishor Kumar", "grade": "10-A", "subject": "Physics", "topic": "Electromagnetic Induction", "question": "In Lenz's Law, why is the induced current always in a direction that opposes the change in magnetic flux?", "asked_at": "Aug 06, 2026", "status": "open"},
        {"student_name": "Priya Sharma", "grade": "10-A", "subject": "Physics", "topic": "Optics", "question": "Could you clarify the difference between total internal reflection and critical angle refraction?", "asked_at": "Aug 05, 2026", "answer": "At critical angle, refraction angle is 90°. For greater angles, all light reflects back inside the denser medium.", "status": "resolved"}
    ]
    db.academic_doubts.insert_many(doubts)
    print(f"  Inserted {len(doubts)} academic doubts.")

    # 11. Announcements & Circulars
    print("Seeding 'announcements' collection...")
    db.announcements.drop()
    announcements = [
        {"title": "Revised Science Practical Timings for Term 1 Examination", "author": "Dr. Sarah Connor", "category": "academic", "date": "Aug 06, 2026", "content": "Physics practical lab batches for Grade 10-A will assemble in Room 204 starting at 09:00 AM sharp with printed lab record notebooks.", "pinned": True},
        {"title": "Independence Day Celebrations — Uniform & Assembly Guidelines", "author": "Principal's Office", "category": "event", "date": "Aug 05, 2026", "content": "All students are requested to be present in ceremonial white uniform by 08:00 AM on August 15th for the flag hoisting parade.", "pinned": True}
    ]
    db.announcements.insert_many(announcements)
    print(f"  Inserted {len(announcements)} announcements.")

    # 12. Fee Receipts & Financial Ledger
    print("Seeding 'fee_receipts' collection...")
    db.fee_receipts.drop()
    fees = [
        {"receipt_no": "REC-2026-0891", "student_name": "Kishor Kumar", "grade": "10-A", "category": "Tuition Fee (Term 1)", "amount": 25000, "status": "paid", "date": "2026-07-10", "payment_method": "Online NetBanking"},
        {"receipt_no": "REC-2026-0892", "student_name": "Kishor Kumar", "grade": "10-A", "category": "Laboratory Kit & Science Practicals", "amount": 5500, "status": "paid", "date": "2026-07-10", "payment_method": "UPI"},
        {"receipt_no": "REC-2026-0893", "student_name": "Kishor Kumar", "grade": "10-A", "category": "School Bus Transport (Route 4)", "amount": 12000, "status": "paid", "date": "2026-07-12", "payment_method": "UPI"},
        {"receipt_no": "REC-2026-1044", "student_name": "Kishor Kumar", "grade": "10-A", "category": "Tuition Fee (Term 2)", "amount": 25000, "status": "pending", "date": "2026-10-15", "payment_method": "Due"}
    ]
    db.fee_receipts.insert_many(fees)
    print(f"  Inserted {len(fees)} fee receipts.")

    # 13. Lab Experiments
    print("Seeding 'lab_experiments' collection...")
    db.lab_experiments.drop()
    labs = [
        {"title": "Ohm's Law & Verification of Resistance", "subject": "Physics", "grade": "Grade 10", "lab_room": "Physics Lab 204", "apparatus": ["Voltmeter", "Ammeter", "Rheostat", "Nichrome Wire"], "status": "active"},
        {"title": "Refraction through Glass Prism & Angle of Deviation", "subject": "Physics", "grade": "Grade 10", "lab_room": "Physics Lab 204", "apparatus": ["Triangular Prism", "Drawing Board", "Optical Pins"], "status": "active"},
        {"title": "Acid-Base Titration: HCl vs Standard Sodium Hydroxide", "subject": "Chemistry", "grade": "Grade 12", "lab_room": "Chem Lab 2", "apparatus": ["Burette", "Pipette", "Conical Flask", "Phenolphthalein Indicator"], "status": "active"}
    ]
    db.lab_experiments.insert_many(labs)
    print(f"  Inserted {len(labs)} lab experiments.")

    print("\n=======================================================")
    print("MongoDB Local Database 'paperbuddy_erp' Seeded Successfully!")
    print("=======================================================")

if __name__ == "__main__":
    seed_mongodb()
