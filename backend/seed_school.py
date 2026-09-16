"""
seed_school.py — PaperBuddy Full School Seed
=============================================
Seeds 500 Tamil students across LKG–12th (14 standards),
2 sections (A/B) for grades LKG–10, and 3 stream groups for 11th/12th:
  • 11-BioPCM  / 12-BioPCM
  • 11-PCM-CS  / 12-PCM-CS
  • 11-Commerce / 12-Commerce

Also seeds:
  • 12 Departments
  • 50+ Teachers with departments & subject majors
  • Class teachers assigned to every class
  • Subjects per department/level

Default password for all users: school@123

Usage:
    cd backend
    python seed_school.py
    python seed_school.py --drop   # clear first, then re-seed
"""

import asyncio
import uuid
import sys
import os
import random
from datetime import datetime, date, timezone, timedelta

# Load .env before importing app modules (needed when running directly)
try:
    from dotenv import load_dotenv
    _env_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), ".env")
    load_dotenv(dotenv_path=_env_path)
except ImportError:
    pass  # dotenv not installed — env vars must be set externally

from app.db.database import AsyncSessionLocal, engine, Base
from app.db.models import (
    School, User, Student, Class, Subject, Department,
    UserRole, PositionAttribute, LeaveRequest, DailyWorkLog,
)
from app.core.auth import hash_password

# ─── Config ────────────────────────────────────────────────────────────
SCHOOL_ID = "fcc6aea0-b378-4a72-808f-2cdbd361ed24"
DEFAULT_PWD = hash_password("school@123")

DROP_FIRST = "--drop" in sys.argv

ADMIN_USERS = [
    {"email": "superadmin@school.edu", "name": "System Super Admin", "role": UserRole.SUPER_ADMIN},
    {"email": "correspondent@school.edu", "name": "Mr. K. R. Sundaram", "role": UserRole.CORRESPONDENT},
    {"email": "principal@school.edu", "name": "Dr. Raghavan Nair", "role": UserRole.PRINCIPAL},
    {"email": "vp@school.edu", "name": "Mrs. Gayatri Varma", "role": UserRole.VICE_PRINCIPAL},
    {"email": "finance@school.edu", "name": "Mr. Rajesh Khanna (Finance)", "role": UserRole.FINANCE},
    {"email": "warden@school.edu", "name": "Col. R. S. Bhardwaj (Warden)", "role": UserRole.WARDEN},
    {"email": "librarian@school.edu", "name": "Mrs. Shanti Swaminathan", "role": UserRole.LIBRARIAN},
    {"email": "transport@school.edu", "name": "Mr. Selvaraj (Transport)", "role": UserRole.TRANSPORT},
    {"email": "mentor.10a@school.edu", "name": "Mrs. Priya Menon", "role": UserRole.MENTOR, "grade": "10"},
    {"email": "mentor.10b@school.edu", "name": "Mr. Arjun Reddy", "role": UserRole.MENTOR, "grade": "10"},
]

# ─── Tamil Names Pool ──────────────────────────────────────────────────
TAMIL_BOYS_FIRST = [
    "Arjun", "Karthik", "Vikram", "Arun", "Surya", "Dinesh", "Praveen", "Vignesh",
    "Sathish", "Ganesh", "Suresh", "Ramesh", "Lokesh", "Harish", "Rajesh", "Naveen",
    "Manoj", "Deepak", "Sathya", "Hari", "Kumar", "Senthil", "Bala", "Murugan",
    "Ravi", "Saravanan", "Mohan", "Anand", "Venkat", "Prasad", "Ajith", "Vijay",
    "Gopal", "Shankar", "Abishek", "Dhanush", "Kavin", "Sujith", "Yuvan", "Nikhil",
    "Thamizh", "Selvam", "Kannan", "Kumaran", "Prabhu", "Madan", "Bharath", "Muthu",
    "Siddharth", "Ashwin", "Varun", "Kiran", "Rohit", "Suraj", "Vishal", "Jeeva",
    "Magesh", "Madhan", "Anbu", "Elango", "Vetri", "Pandian", "Boopathi", "Kabilan",
]
TAMIL_GIRLS_FIRST = [
    "Priya", "Kavya", "Sneha", "Divya", "Anitha", "Revathi", "Nithya", "Geetha",
    "Lakshmi", "Meena", "Kavitha", "Saranya", "Deepa", "Sujatha", "Janani", "Lavanya",
    "Nandhini", "Pavithra", "Ramya", "Swetha", "Nivetha", "Iswarya", "Pooja", "Hema",
    "Suganya", "Vaishnavi", "Keerthana", "Dharshini", "Abinaya", "Priyadharshini",
    "Brindha", "Sindhu", "Yamini", "Mythili", "Selvi", "Malathi", "Sumathi", "Usha",
    "Revathi", "Chandrika", "Padmavathi", "Hemalatha", "Sivakami", "Kalpana", "Meenakshi",
    "Saroja", "Kokila", "Vasantha", "Indira", "Ambika", "Sangeetha", "Bhuvana", "Aruna",
    "Chitra", "Komala", "Vidhya", "Ananya", "Narmadha", "Mathumitha", "Aswini", "Oviya",
]
TAMIL_LAST = [
    "Murugan", "Krishnan", "Rajan", "Selvam", "Pandian", "Ponnusamy", "Arumugam",
    "Shanmugam", "Subramaniam", "Venkataraman", "Ganesan", "Balakrishnan", "Thangavel",
    "Muthukumar", "Rajendran", "Natarajan", "Srinivasan", "Venkatesan", "Annamalai",
    "Periasamy", "Govindasamy", "Ramasamy", "Durai", "Sekar", "Pillai", "Nadar",
    "Chettiar", "Naidu", "Iyer", "Iyengar", "Reddy", "Kumar", "Raj", "Das",
    "Lingam", "Chinnaraj", "Manimaran", "Palanivel", "Elumalai", "Jayaraman",
]
TEACHER_FIRST = [
    # Group 1 — Tamil/Lang specialists
    "Balasubramanian", "Thirumoorthy", "Meenakshi", "Chandrasekaran", "Sivasubramanian",
    "Rajalakshmi", "Thamayanthi", "Murugesan", "Komalavalli", "Sumathilatha",
    "Ponselvi", "Malarvizhi",
    # Group 2 — Math/Science specialists
    "Annapoorna", "Venkateswaran", "Parasuraman", "Kamakshi",
    "Kalaiselvi", "Dhanabalan", "Indhumathi", "Sugumar", "Annapoorani",
    "Krishnamurthy", "Sivakami", "Radhakrishnan",
    "Palaniswami", "Subramanian", "Ganapathi", "Karunakaran",
    # Group 3 — Commerce/Social specialists
    "Nallamuthu", "Thenmozhi", "Soundarya", "Ravichandran",
    "Umamaheswari", "Sathiyamoorthy", "Nithyanandam", "Ponnambalam",
    "Saravanakumar", "Vijayalakshmi", "Devarajan", "Arumugam",
    # Group 4 — PE/Arts/Others
    "Parimalam", "Elanchezhian", "Muthusamy", "Velusamy",
    "Vasanthalakshmi", "Senthilkumar", "Kamalakannan", "Rathinavelu",
    "Sakunthala", "Madhivanan", "Thamizharasi", "Periyanayagam",
    "Karpagam", "Ezhilarasi", "Sundareswaran", "Mahalingam",
    # Group 5 — Senior Faculty & Lab Specialists
    "Gowrishankar", "Jagannathan", "Vidyasagar", "Thangam", "Sornam",
    "Nagalakshmi", "Premkumar", "Anuradha", "Suryanarayanan", "Muralidharan",
    "Padmavathi", "Kalyanasundaram", "Bhuvaneswari", "Vaidyanathan", "Chidambaram",
]

# ─── Class Structure ───────────────────────────────────────────────────
# LKG-10: 2 sections (A, B) → 28 classes × ~18 students = ~504, adjusted to 500
# 11th: 3 sections (BioPCM, PCM-CS, Commerce), 30 each
# 12th: 3 sections (BioPCM, PCM-CS, Commerce), 30 each

STANDARD_GRADES_2SEC = ["LKG", "UKG", "1", "2", "3", "4", "5", "6", "7", "8", "9", "10"]
STANDARD_SECTIONS_2SEC = ["A", "B"]

HIGHER_SEC_GRADES = ["11", "12"]
HIGHER_SEC_SECTIONS = ["BioPCM", "PCM-CS", "Commerce"]

STUDENTS_PER_CLASS = 30

# ─── Departments (13 total) ────────────────────────────────────────────
DEPARTMENTS = [
    {"name": "Tamil",               "code": "TAM"},
    {"name": "English",             "code": "ENG"},
    {"name": "Mathematics",         "code": "MATH"},
    {"name": "Science",             "code": "SCI"},
    {"name": "Social Science",      "code": "SOC"},
    {"name": "Physics",             "code": "PHY"},
    {"name": "Chemistry",           "code": "CHEM"},
    {"name": "Biology",             "code": "BIO"},
    {"name": "Computer Science",    "code": "CS"},
    {"name": "Commerce",            "code": "COM"},
    {"name": "Accountancy",         "code": "ACC"},
    {"name": "Economics",           "code": "ECO"},  # NEW — required for Commerce stream
    {"name": "Physical Education",  "code": "PE"},
]

# ─── Subjects by Department (32 subjects) ─────────────────────────────
SUBJECTS_DEF = [
    # code, name, dept_code, applicable_grades
    ("TAM-K",  "Tamil (Kindergarten)",          "TAM",  "LKG,UKG"),
    ("ENG-K",  "English (Kindergarten)",        "ENG",  "LKG,UKG"),
    ("TAM-P",  "Tamil (Primary)",               "TAM",  "1,2,3,4,5"),
    ("ENG-P",  "English (Primary)",             "ENG",  "1,2,3,4,5"),
    ("MATH-P", "Mathematics (Primary)",         "MATH", "1,2,3,4,5"),
    ("SCI-P",  "Environmental Science",         "SCI",  "1,2,3,4,5"),
    ("SOC-P",  "Social Science (Primary)",      "SOC",  "1,2,3,4,5"),
    ("TAM-M",  "Tamil (Middle)",                "TAM",  "6,7,8"),
    ("ENG-M",  "English (Middle)",              "ENG",  "6,7,8"),
    ("MATH-M", "Mathematics (Middle)",          "MATH", "6,7,8"),
    ("SCI-M",  "Science (Middle)",              "SCI",  "6,7,8"),
    ("SOC-M",  "Social Science (Middle)",       "SOC",  "6,7,8"),
    ("CS-M",   "Computer Basics (Middle)",      "CS",   "6,7,8"),
    ("TAM-S",  "Tamil (Secondary)",             "TAM",  "9,10"),
    ("ENG-S",  "English (Secondary)",           "ENG",  "9,10"),
    ("MATH-S", "Mathematics (Secondary)",       "MATH", "9,10"),
    ("SCI-S",  "Science (Secondary)",           "SCI",  "9,10"),
    ("SOC-S",  "Social Science (Secondary)",    "SOC",  "9,10"),
    ("CS-S",   "Computer Science (Secondary)",  "CS",   "9,10"),
    ("TAM-H",  "Tamil (Higher Sec)",            "TAM",  "11,12"),
    ("ENG-H",  "English (Higher Sec)",          "ENG",  "11,12"),
    ("PHY-H",  "Physics",                       "PHY",  "11,12"),
    ("CHEM-H", "Chemistry",                     "CHEM", "11,12"),
    ("BIO-H",  "Biology",                       "BIO",  "11,12"),
    ("MATH-H", "Mathematics (Higher Sec)",      "MATH", "11,12"),
    ("CS-H",   "Computer Science (Higher Sec)", "CS",   "11,12"),
    ("COM-H",  "Commerce",                      "COM",  "11,12"),
    ("ACC-H",  "Accountancy",                   "ACC",  "11,12"),
    ("ECO-H",  "Economics",                     "ECO",  "11,12"),  # NEW
    ("PE-ALL", "Physical Education",            "PE",   "1,2,3,4,5,6,7,8,9,10,11,12"),
    ("ART-P",  "Drawing & Craft (Primary)",     "PE",   "1,2,3,4,5"),
    ("MUSIC",  "Music & Fine Arts",             "PE",   "6,7,8,9,10"),
]

# ─── Teacher definitions — 65 teachers across 13 departments ──────────
# Format: (dept_code, major/specialty, teaches_grades)
TEACHER_DEFS = [
    # ── Tamil (7 teachers) ──────────────────────────────────────────────
    ("TAM", "Tamil Language & Early Literacy (KG)",         "LKG,UKG"),
    ("TAM", "Tamil Language & Literature (Primary)",        "1,2,3,4,5"),
    ("TAM", "Tamil Grammar & Prose (Middle)",               "6,7,8"),
    ("TAM", "Tamil Creative Writing & Folk Arts",           "6,7,8"),
    ("TAM", "Tamil Poetry & Comprehension (Secondary)",     "9,10"),
    ("TAM", "Tamil Literature & Essay (Higher Sec)",        "11,12"),
    ("TAM", "Tamil Oratory & Classical Literature",         "9,10,11,12"),
    # ── English (7 teachers) ────────────────────────────────────────────
    ("ENG", "English Communication & Phonics (KG)",         "LKG,UKG"),
    ("ENG", "English Language & Reading (Primary)",         "1,2,3,4,5"),
    ("ENG", "English Grammar & Comprehension (Middle)",     "6,7,8"),
    ("ENG", "English Remedial & Creative Composition",      "6,7,8"),
    ("ENG", "English Literature & Writing (Secondary)",     "9,10"),
    ("ENG", "English Literature (Higher Sec)",              "11,12"),
    ("ENG", "Communicative English & Spoken Skills",        "8,9,10,11,12"),
    # ── Mathematics (8 teachers) ────────────────────────────────────────
    ("MATH", "Number Concepts & Arithmetic (Primary 1-3)",  "1,2,3"),
    ("MATH", "Fractions, Geometry & Algebra (Primary 4-5)", "4,5"),
    ("MATH", "Foundation & Remedial Mathematics",           "6,7"),
    ("MATH", "Middle School Mathematics",                   "6,7,8"),
    ("MATH", "Secondary Mathematics & Statistics",          "9,10"),
    ("MATH", "Discrete Math & Analytical Reasoning",        "9,10"),
    ("MATH", "Higher Secondary Mathematics (Calculus)",     "11,12"),
    ("MATH", "Higher Secondary Mathematics (Statistics)",   "11,12"),
    # ── Science (6 teachers) ────────────────────────────────────────────
    ("SCI",  "Environmental Science (Primary 1-3)",         "1,2,3"),
    ("SCI",  "Environmental Science (Primary 4-5)",         "4,5"),
    ("SCI",  "General Science (Middle)",                    "6,7,8"),
    ("SCI",  "Integrated Science & Tinkering Lab",          "6,7,8"),
    ("SCI",  "Secondary Science & Lab Skills",              "9,10"),
    ("SCI",  "Experiential Science & Field Projects",       "9,10"),
    # ── Physics (4 teachers) ────────────────────────────────────────────
    ("PHY",  "Physics — Mechanics, Heat & Optics",          "11,12"),
    ("PHY",  "Physics — Electricity, Magnetism & Modern",   "11,12"),
    ("PHY",  "Applied Physics & Electronics Lab",           "11,12"),
    ("PHY",  "Physics Lab & Practical Coordinator",         "11,12"),
    # ── Chemistry (4 teachers) ──────────────────────────────────────────
    ("CHEM", "Inorganic & Organic Chemistry",               "11,12"),
    ("CHEM", "Physical Chemistry & Electrochemistry",       "11,12"),
    ("CHEM", "Organic Synthesis & Applied Chemistry",       "11,12"),
    ("CHEM", "Chemistry Lab & Practical Coordinator",       "11,12"),
    # ── Biology (4 teachers) ────────────────────────────────────────────
    ("BIO",  "Botany & Plant Physiology",                   "11,12"),
    ("BIO",  "Zoology, Human Physiology & Genetics",        "11,12"),
    ("BIO",  "Microbiology & Biotechnology",                "11,12"),
    ("BIO",  "Bio-Sciences & Ecology Lab Coordinator",      "11,12"),
    # ── Social Science (5 teachers) ─────────────────────────────────────
    ("SOC",  "History & Civics (Primary)",                  "1,2,3,4,5"),
    ("SOC",  "History & Geography (Middle)",                "6,7,8"),
    ("SOC",  "Civics & Indian Economy (Secondary)",         "9,10"),
    ("SOC",  "Political Science & History (Secondary)",     "9,10"),
    ("SOC",  "Economics & Environmental Geography",         "9,10"),
    # ── Computer Science (5 teachers) ───────────────────────────────────
    ("CS",   "Computer Basics & MS Office (Middle)",        "6,7,8"),
    ("CS",   "AI, Robotics & STEM Lab",                     "6,7,8,9,10"),
    ("CS",   "Python Programming & Data Structures (HS)",   "9,10,11,12"),
    ("CS",   "Database Systems, Networks & Web Dev (HS)",   "11,12"),
    ("CS",   "Full Stack Web & Cloud Technologies",         "11,12"),
    # ── Commerce (4 teachers) ───────────────────────────────────────────
    ("COM",  "Business Studies & Entrepreneurship",         "11,12"),
    ("COM",  "Marketing, Management & Business Law",        "11,12"),
    ("COM",  "Banking, Financial Markets & Insurance",      "11,12"),
    ("COM",  "Corporate Management & Business Ethics",      "11,12"),
    # ── Accountancy (4 teachers) ────────────────────────────────────────
    ("ACC",  "Financial Accounting & Bookkeeping",          "11,12"),
    ("ACC",  "Cost Accounting & Management Accounting",     "11,12"),
    ("ACC",  "Computerized Accounting & Tally/GST",         "11,12"),
    ("ACC",  "Auditing & Corporate Finance",                "11,12"),
    # ── Economics (3 teachers) ──────────────────────────────────────────
    ("ECO",  "Micro Economics & Consumer Theory",           "11,12"),
    ("ECO",  "Macro Economics, National Income & Banking",  "11,12"),
    ("ECO",  "Indian Economic Development & Public Finance","11,12"),
    # ── Physical Education (4 teachers) ─────────────────────────────────
    ("PE",   "Sports Science, Yoga & Drawing (Primary)",    "LKG,UKG,1,2,3,4,5"),
    ("PE",   "Athletics, Team Sports & Fitness (Middle)",   "6,7,8"),
    ("PE",   "Advanced Athletics & NCC (Secondary)",        "9,10"),
    ("PE",   "Sports Training & Games (Higher Sec)",        "11,12"),
]

# ─── Helpers ───────────────────────────────────────────────────────────
def uid():
    return str(uuid.uuid4())

def rand_dob(min_age: int, max_age: int) -> str:
    today = date.today()
    start = today - timedelta(days=max_age * 365)
    end   = today - timedelta(days=min_age * 365)
    delta = (end - start).days
    return (start + timedelta(days=random.randint(0, delta))).strftime("%Y-%m-%d")

def student_age_for_grade(grade: str) -> tuple:
    """Return (min_age, max_age) for a grade."""
    if grade == "LKG": return (3, 4)
    if grade == "UKG": return (4, 5)
    try:
        g = int(grade)
        return (g + 5, g + 7)
    except ValueError:
        return (5, 18)

def slug(name: str) -> str:
    return name.lower().replace(" ", ".").replace("/", "-")

BLOOD_GROUPS = ["A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-"]
COMMUNITIES   = ["OC", "BC", "MBC", "SC", "ST", "BCM"]
GENDERS       = ["Male", "Female"]

student_counter = [0]
teacher_counter = [0]

def next_student_admission() -> str:
    student_counter[0] += 1
    return f"ADM{2024000 + student_counter[0]}"

def next_teacher_emp() -> str:
    teacher_counter[0] += 1
    return f"EMP{1000 + teacher_counter[0]}"

def make_student_name(gender: str) -> str:
    if gender == "Male":
        first = random.choice(TAMIL_BOYS_FIRST)
    else:
        first = random.choice(TAMIL_GIRLS_FIRST)
    last = random.choice(TAMIL_LAST)
    return f"{first} {last}"

def make_teacher_name(idx: int) -> str:
    return TEACHER_FIRST[idx % len(TEACHER_FIRST)]

# ─── Main Seed (phase-isolated sessions to avoid Neon timeout) ─────────
async def seed(drop: bool = False):
    from sqlalchemy import text, select, func

    drop_mode = drop or DROP_FIRST

    print("=" * 60)
    print("PaperBuddy School Seeder — 65 Teachers / 500 Students")
    print("=" * 60)

    # ── Phase 0: Drop / Create Tables ─────────────────────────────
    print("\n[0/7] Preparing schema...")
    async with engine.begin() as conn:
        if drop_mode and "postgresql" in str(engine.url):
            tables = (
                "position_attributes, students, attendance, "
                "timetables, homeworks, assignments, lab_assignments, syllabus_nodes, "
                "subjects, classes, departments, users, leave_requests, daily_work_logs"
            )
            try:
                await conn.execute(text(f"TRUNCATE TABLE {tables} RESTART IDENTITY CASCADE;"))
                print("  Truncated tables.")
            except Exception as e:
                print(f"  Truncate notice: {e}")
            try:
                await conn.execute(text("ALTER TABLE users ALTER COLUMN assigned_grade TYPE VARCHAR(100);"))
            except Exception:
                pass
        elif drop_mode:
            await conn.run_sync(Base.metadata.drop_all)
        await conn.run_sync(Base.metadata.create_all)
    print("  Schema ready.")

    # ── Phase 1: School ────────────────────────────────────────────
    print("\n[1/7] School record...")
    async with AsyncSessionLocal() as s:
        res = await s.execute(select(School).where(School.id == SCHOOL_ID))
        if not res.scalars().first():
            s.add(School(
                id=SCHOOL_ID,
                name="Bharathi Matriculation Hr. Sec. School",
                address="104 Gandhi Road, Anna Nagar, Chennai, Tamil Nadu 600040",
                contact_email="admin@bharathischool.edu"
            ))
            await s.commit()
            print("  Created school.")
        else:
            print("  School already exists.")

    # ── Phase 1b: Administrative Accounts ─────────────────────────
    print("\n[1b/7] Ensuring administrative accounts...")
    async with AsyncSessionLocal() as s:
        for adm in ADMIN_USERS:
            res = await s.execute(select(User).where(User.email == adm["email"]))
            existing = res.scalars().first()
            if not existing:
                u = User(
                    id=uid(),
                    school_id=SCHOOL_ID,
                    email=adm["email"],
                    full_name=adm["name"],
                    role=adm["role"],
                    password_hash=DEFAULT_PWD,
                    assigned_grade=adm.get("grade"),
                    phone=f"9{random.randint(100000000, 999999999)}",
                    is_active=True,
                )
                s.add(u)
            else:
                existing.password_hash = DEFAULT_PWD
                existing.is_active = True
                if adm.get("grade"):
                    existing.assigned_grade = adm.get("grade")
        await s.commit()
    print("  Admin accounts ready.")

    # ── Phase 2: Departments ───────────────────────────────────────
    print("\n[2/7] Departments...")
    dept_id_map: dict[str, str] = {}
    async with AsyncSessionLocal() as s:
        for dept_def in DEPARTMENTS:
            res = await s.execute(select(Department).where(Department.code == dept_def["code"]))
            existing = res.scalars().first()
            if existing:
                dept_id_map[dept_def["code"]] = existing.id
            else:
                d = Department(id=uid(), school_id=SCHOOL_ID, name=dept_def["name"], code=dept_def["code"])
                s.add(d)
                await s.flush()
                dept_id_map[dept_def["code"]] = d.id
        await s.commit()
    print(f"  {len(dept_id_map)} departments ready.")

    # ── Phase 3: Subjects ─────────────────────────────────────────
    print("\n[3/7] Subjects...")
    subj_id_map: dict[str, str] = {}
    async with AsyncSessionLocal() as s:
        for (code, name, dept_code, grades) in SUBJECTS_DEF:
            res = await s.execute(select(Subject).where(Subject.code == code))
            existing = res.scalars().first()
            if existing:
                subj_id_map[code] = existing.id
            else:
                sub = Subject(id=uid(), school_id=SCHOOL_ID, code=code, name=name,
                              department_id=dept_id_map[dept_code], applicable_grades=grades)
                s.add(sub)
                await s.flush()
                subj_id_map[code] = sub.id
        await s.commit()
    print(f"  {len(subj_id_map)} subjects ready.")

    # ── Phase 4: Classes ───────────────────────────────────────────
    print("\n[4/7] Classes...")
    class_map: dict[str, str] = {}  # key → class.id
    async with AsyncSessionLocal() as s:
        for grade in STANDARD_GRADES_2SEC:
            for section in STANDARD_SECTIONS_2SEC:
                key = f"{grade}-{section}"
                res = await s.execute(select(Class).where(Class.grade == grade, Class.section == section))
                existing = res.scalars().first()
                if existing:
                    class_map[key] = existing.id
                else:
                    c = Class(id=uid(), school_id=SCHOOL_ID, grade=grade, section=section)
                    s.add(c)
                    await s.flush()
                    class_map[key] = c.id

        for grade in HIGHER_SEC_GRADES:
            for section in HIGHER_SEC_SECTIONS:
                key = f"{grade}-{section}"
                res = await s.execute(select(Class).where(Class.grade == grade, Class.section == section))
                existing = res.scalars().first()
                if existing:
                    class_map[key] = existing.id
                else:
                    c = Class(id=uid(), school_id=SCHOOL_ID, grade=grade, section=section)
                    s.add(c)
                    await s.flush()
                    class_map[key] = c.id
        await s.commit()
    print(f"  {len(class_map)} classes ready.")

    # ── Phase 5: Teachers ─────────────────────────────────────────
    print("\n[5/7] Creating teachers...")
    teacher_ids: list[str] = []
    async with AsyncSessionLocal() as s:
        for idx, (dept_code, major, teaches_grades) in enumerate(TEACHER_DEFS):
            name = make_teacher_name(idx)
            emp_no = next_teacher_emp()
            email = f"teacher.{slug(name)}.{emp_no.lower()}@bharathischool.edu"
            res = await s.execute(select(User).where(User.email == email))
            existing = res.scalars().first()
            if existing:
                existing.department_id = dept_id_map.get(dept_code)
                existing.assigned_grade = f"Grades {teaches_grades}"
                existing.password_hash = DEFAULT_PWD
                existing.is_active = True
                teacher_ids.append(existing.id)
            else:
                t = User(
                    id=uid(), school_id=SCHOOL_ID,
                    email=email, full_name=name,
                    role=UserRole.TEACHER, password_hash=DEFAULT_PWD,
                    department_id=dept_id_map.get(dept_code),
                    assigned_grade=f"Grades {teaches_grades}",
                    phone=f"9{random.randint(100000000, 999999999)}",
                    is_active=True,
                )
                s.add(t)
                await s.flush()
                teacher_ids.append(t.id)
        await s.commit()
    print(f"  {len(teacher_ids)} teachers created.")

    # ── Phase 5b: Assign class teachers ───────────────────────────
    print("  Assigning class teachers...")
    all_class_keys_ordered = (
        [f"{g}-{s}" for g in STANDARD_GRADES_2SEC for s in STANDARD_SECTIONS_2SEC] +
        [f"{g}-{s}" for g in HIGHER_SEC_GRADES for s in HIGHER_SEC_SECTIONS]
    )
    async with AsyncSessionLocal() as s:
        for i, key in enumerate(all_class_keys_ordered):
            class_id = class_map[key]
            teacher_id = teacher_ids[i % len(teacher_ids)]
            cls = await s.get(Class, class_id)
            if cls:
                cls.class_teacher_id = teacher_id
            pa = PositionAttribute(
                id=uid(), user_id=teacher_id,
                attribute_type="class_teacher_of",
                attribute_value=class_id,
            )
            s.add(pa)
            t_user = await s.get(User, teacher_id)
            if t_user:
                t_user.assigned_grade = f"Class Teacher ({key})"
        await s.commit()
    print("  Class teachers assigned.")

    # ── Phase 6: Students (batched by class, fresh session each) ──
    print("\n[6/7] Creating 500 students across ALL 30 classes...")

    lower_keys = [f"{g}-{s}" for g in STANDARD_GRADES_2SEC for s in STANDARD_SECTIONS_2SEC]
    higher_keys = [f"{g}-{s}" for g in HIGHER_SEC_GRADES for s in HIGHER_SEC_SECTIONS]
    STUDENTS_HIGHER = 30
    STUDENTS_LOWER_TOTAL = 500 - (len(higher_keys) * STUDENTS_HIGHER)
    base = STUDENTS_LOWER_TOTAL // len(lower_keys)
    extra = STUDENTS_LOWER_TOTAL % len(lower_keys)
    allocation: dict[str, int] = {}
    for i, k in enumerate(lower_keys):
        allocation[k] = base + (1 if i < extra else 0)
    for k in higher_keys:
        allocation[k] = STUDENTS_HIGHER

    FATHER_FIRST = ["Murugan","Rajan","Selvam","Pandian","Ponnusamy","Arumugam",
                    "Shanmugam","Subramaniam","Venkataraman","Ganesan","Balakrishnan",
                    "Thangavel","Muthukumar"]
    MOTHER_FIRST = ["Meena","Kavitha","Saranya","Deepa","Sujatha","Revathi",
                    "Lakshmi","Nalini","Padmavathi","Usha"]
    AREAS = ['Anna Nagar','T Nagar','Adyar','Tambaram','Chromepet','Velachery','Porur','Ambattur']

    total_students = 0
    for class_key in all_class_keys_ordered:
        count = allocation[class_key]
        class_id = class_map[class_key]
        grade_val = class_key.split("-")[0]
        section_val = class_key.split("-", 1)[1]

        # Fresh session per class to avoid Neon timeout
        async with AsyncSessionLocal() as s:
            existing_count = (await s.execute(select(func.count(Student.id)).where(Student.class_id == class_id))).scalar_one() or 0
            if existing_count >= count:
                total_students += existing_count
                continue

            needed = count - existing_count
            for i in range(needed):
                gender = random.choice(GENDERS)
                full_name = make_student_name(gender)
                adm = next_student_admission()
                roll = f"{grade_val}{section_val}{(existing_count + i + 1):02d}"
                min_age, max_age = student_age_for_grade(grade_val)
                dob = rand_dob(min_age, max_age)
                email = f"student.{adm.lower()}@bharathischool.edu"

                u = User(
                    id=uid(), school_id=SCHOOL_ID,
                    email=email, full_name=full_name,
                    role=UserRole.STUDENT, password_hash=DEFAULT_PWD,
                    assigned_grade=grade_val,
                    roll_number=roll, admission_number=adm,
                    phone=f"9{random.randint(100000000, 999999999)}",
                    is_active=True,
                )
                s.add(u)
                await s.flush()

                st = Student(
                    id=uid(), school_id=SCHOOL_ID,
                    user_id=u.id, class_id=class_id,
                    admission_number=adm, roll_number=roll,
                    full_name=full_name,
                    father_name=f"{random.choice(FATHER_FIRST)} {random.choice(TAMIL_LAST)}",
                    mother_name=f"{random.choice(MOTHER_FIRST)} {random.choice(TAMIL_LAST)}",
                    guardian_phone=f"9{random.randint(100000000, 999999999)}",
                    date_of_birth=dob,
                    blood_group=random.choice(BLOOD_GROUPS),
                    gender=gender,
                    community_category=random.choice(COMMUNITIES),
                    address=f"{random.randint(1,200)}, {random.choice(AREAS)}, Chennai",
                    is_bus_user=random.choice([True, False]),
                    is_hostel_user=False,
                )
                s.add(st)
                total_students += 1
            await s.commit()

        print(f"  ✓  {class_key:<18}  {count:>2} students  (total: {total_students})")

    # ── Phase 7: Sample Duty Leave & Daily Work Logs ───────────────
    print("\n[7/7] Seeding sample teacher attendance & work logs...")
    async with AsyncSessionLocal() as s:
        today_val = date.today()
        # 3 teachers on approved leave
        if len(teacher_ids) >= 3:
            leave_teachers = [teacher_ids[14 % len(teacher_ids)], teacher_ids[38 % len(teacher_ids)], teacher_ids[52 % len(teacher_ids)]]
            for t_id in leave_teachers:
                existing_leave = (await s.execute(select(LeaveRequest).where(
                    LeaveRequest.applicant_id == t_id,
                    LeaveRequest.start_date <= today_val,
                    LeaveRequest.end_date >= today_val
                ))).scalars().first()
                if not existing_leave:
                    s.add(LeaveRequest(
                        id=uid(),
                        school_id=SCHOOL_ID,
                        applicant_id=t_id,
                        leave_type="Duty Leave",
                        start_date=today_val,
                        end_date=today_val,
                        reason="Inter-school athletic meet supervision & valuation duty",
                        status="approved"
                    ))
        # 12 daily work logs
        all_classes = list(class_map.values())
        all_subjects = list(subj_id_map.values())
        for idx in range(min(12, len(teacher_ids))):
            t_id = teacher_ids[idx]
            c_id = all_classes[idx % len(all_classes)]
            sub_id = all_subjects[idx % len(all_subjects)]
            existing_log = (await s.execute(select(DailyWorkLog).where(
                DailyWorkLog.teacher_id == t_id,
                DailyWorkLog.date == today_val
            ))).scalars().first()
            if not existing_log:
                s.add(DailyWorkLog(
                    id=uid(),
                    school_id=SCHOOL_ID,
                    teacher_id=t_id,
                    class_id=c_id,
                    subject_id=sub_id,
                    date=today_val,
                    summary=f"Completed standard syllabus unit {idx+1} lesson review and interactive student quiz."
                ))
        await s.commit()
    print("  Teacher leave records & daily work logs ready.")

    print("\n" + "=" * 60)
    print(f"✅  Seeding complete!")
    print(f"    Students : {total_students} (across ALL 30 classes)")
    print(f"    Teachers : {len(teacher_ids)}")
    print(f"    Classes  : {len(class_map)}")
    print(f"    Depts    : {len(dept_id_map)}")
    print(f"    Subjects : {len(subj_id_map)}")
    print(f"    11th/12th: 30 students each × 6 stream classes = 180")
    print(f"    LKG–10th : 13-14 each × 24 classes = 320")
    print(f"\n    Default password: school@123")
    print("=" * 60)

    return {
        "students": total_students,
        "teachers": len(teacher_ids),
        "classes": len(class_map),
        "depts": len(dept_id_map),
        "subjects": len(subj_id_map)
    }


if __name__ == "__main__":
    asyncio.run(seed())

