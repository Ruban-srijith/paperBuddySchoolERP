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
import random
from datetime import datetime, date, timezone, timedelta
from app.db.database import AsyncSessionLocal, engine, Base
from app.db.models import (
    School, User, Student, Class, Subject, Department,
    UserRole, PositionAttribute,
)
from app.core.auth import hash_password

# ─── Config ────────────────────────────────────────────────────────────
SCHOOL_ID = "fcc6aea0-b378-4a72-808f-2cdbd361ed24"
DEFAULT_PWD = hash_password("school@123")

DROP_FIRST = "--drop" in sys.argv

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
    "Balasubramanian", "Thirumoorthy", "Meenakshi", "Chandrasekaran", "Sivasubramanian",
    "Rajalakshmi", "Annapoorna", "Venkateswaran", "Parasuraman", "Kamakshi",
    "Kalaiselvi", "Dhanabalan", "Indhumathi", "Sugumar", "Annapoorani",
    "Krishnamurthy", "Sivakami", "Radhakrishnan", "Nallamuthu", "Thenmozhi",
    "Palaniswami", "Subramanian", "Soundarya", "Ravichandran", "Umamaheswari",
    "Sathiyamoorthy", "Parimalam", "Elanchezhian", "Vijayalakshmi", "Muthusamy",
    "Arumugam", "Ponselvi", "Devarajan", "Malarvizhi", "Saravanakumar",
    "Komalavalli", "Murugesan", "Nithyanandam", "Sumathilatha", "Ponnambalam",
    "Ganapathi", "Thamayanthi", "Karunakaran", "Sakunthala", "Velusamy",
    "Vasanthalakshmi", "Senthilkumar", "Kamalakannan", "Rathinavelu", "Madhivanan",
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

# ─── Departments ───────────────────────────────────────────────────────
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
    {"name": "Physical Education",  "code": "PE"},
]

# ─── Subjects by Department ────────────────────────────────────────────
SUBJECTS_DEF = [
    # code, name, dept_code, applicable_grades
    ("TAM-K",  "Tamil (Kindergarten)",   "TAM",  "LKG,UKG"),
    ("ENG-K",  "English (Kindergarten)", "ENG",  "LKG,UKG"),
    ("TAM-P",  "Tamil (Primary)",        "TAM",  "1,2,3,4,5"),
    ("ENG-P",  "English (Primary)",      "ENG",  "1,2,3,4,5"),
    ("MATH-P", "Mathematics (Primary)",  "MATH", "1,2,3,4,5"),
    ("SCI-P",  "Environmental Science",  "SCI",  "1,2,3,4,5"),
    ("SOC-P",  "Social Science (Pri)",   "SOC",  "1,2,3,4,5"),
    ("TAM-M",  "Tamil (Middle)",         "TAM",  "6,7,8"),
    ("ENG-M",  "English (Middle)",       "ENG",  "6,7,8"),
    ("MATH-M", "Mathematics (Middle)",   "MATH", "6,7,8"),
    ("SCI-M",  "Science (Middle)",       "SCI",  "6,7,8"),
    ("SOC-M",  "Social Science (Mid)",   "SOC",  "6,7,8"),
    ("TAM-S",  "Tamil (Secondary)",      "TAM",  "9,10"),
    ("ENG-S",  "English (Secondary)",    "ENG",  "9,10"),
    ("MATH-S", "Mathematics (Sec)",      "MATH", "9,10"),
    ("SCI-S",  "Science (Secondary)",    "SCI",  "9,10"),
    ("SOC-S",  "Social Science (Sec)",   "SOC",  "9,10"),
    ("TAM-H",  "Tamil (Higher Sec)",     "TAM",  "11,12"),
    ("ENG-H",  "English (Higher Sec)",   "ENG",  "11,12"),
    ("PHY-H",  "Physics",               "PHY",  "11,12"),
    ("CHEM-H", "Chemistry",             "CHEM", "11,12"),
    ("BIO-H",  "Biology",               "BIO",  "11,12"),
    ("MATH-H", "Mathematics (HS)",      "MATH", "11,12"),
    ("CS-H",   "Computer Science (HS)", "CS",   "11,12"),
    ("COM-H",  "Commerce",              "COM",  "11,12"),
    ("ACC-H",  "Accountancy",           "ACC",  "11,12"),
    ("PE-ALL", "Physical Education",    "PE",   "1,2,3,4,5,6,7,8,9,10,11,12"),
]

# ─── Teacher definitions — dept, major/specialty ───────────────────────
# Format: (name_index, dept_code, major, teaches_grades)
TEACHER_DEFS = [
    # Tamil (3 teachers)
    ("TAM", "Tamil Language & Literature",          "LKG,UKG,1,2,3,4,5"),
    ("TAM", "Tamil Grammar & Composition",          "6,7,8,9,10"),
    ("TAM", "Tamil Literature (Higher Secondary)",  "11,12"),
    # English (3 teachers)
    ("ENG", "English Language & Communication",     "LKG,UKG,1,2,3,4,5"),
    ("ENG", "English Literature & Grammar",         "6,7,8,9,10"),
    ("ENG", "English Literature (Higher Secondary)","11,12"),
    # Mathematics (4 teachers)
    ("MATH", "Primary Mathematics",                 "1,2,3,4,5"),
    ("MATH", "Middle School Mathematics",           "6,7,8"),
    ("MATH", "Secondary Mathematics & Statistics",  "9,10"),
    ("MATH", "Higher Secondary Mathematics",        "11,12"),
    # Science / Physics / Chemistry / Biology
    ("SCI",  "Environmental & General Science",     "1,2,3,4,5,6,7,8"),
    ("SCI",  "Secondary Science",                   "9,10"),
    ("PHY",  "Physics (Mechanics & Optics)",        "11,12"),
    ("PHY",  "Physics (Electricity & Magnetism)",   "11,12"),
    ("CHEM", "Inorganic & Organic Chemistry",       "11,12"),
    ("CHEM", "Physical Chemistry & Practicals",     "11,12"),
    ("BIO",  "Botany & Zoology",                    "11,12"),
    ("BIO",  "Human Physiology & Genetics",         "11,12"),
    # Social Science (2 teachers)
    ("SOC",  "History & Civics (Primary)",          "1,2,3,4,5,6,7,8"),
    ("SOC",  "Geography & Economics (Secondary)",   "9,10"),
    # Computer Science (2 teachers)
    ("CS",   "Python Programming & Algorithms",     "11,12"),
    ("CS",   "Database Systems & Networks",         "11,12"),
    # Commerce (2 teachers)
    ("COM",  "Business Studies & Management",       "11,12"),
    ("COM",  "Economics & Business Environment",    "11,12"),
    # Accountancy (2 teachers)
    ("ACC",  "Financial Accounting",                "11,12"),
    ("ACC",  "Cost & Management Accounting",        "11,12"),
    # Physical Education (2 teachers)
    ("PE",   "Sports Science & Yoga",               "1,2,3,4,5,6,7,8"),
    ("PE",   "Athletics & Team Sports",             "9,10,11,12"),
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

# ─── Main Seed ─────────────────────────────────────────────────────────
async def seed():
    print("=" * 60)
    print("PaperBuddy School Seeder — Full 500-student run")
    print("=" * 60)

    if DROP_FIRST:
        print("\n[1/7] Dropping and recreating tables...")
        async with engine.begin() as conn:
            from sqlalchemy import text
            if "postgresql" in str(engine.url):
                tables = (
                    "position_attributes, students, attendance, "
                    "timetables, homeworks, assignments, lab_assignments, syllabus_nodes, "
                    "subjects, classes, departments, users"
                )
                try:
                    await conn.execute(text(f"TRUNCATE TABLE {tables} RESTART IDENTITY CASCADE;"))
                    print("  Truncated relevant tables.")
                except Exception as e:
                    print(f"  Truncate notice: {e}")
            else:
                await conn.run_sync(Base.metadata.drop_all)
                await conn.run_sync(Base.metadata.create_all)
        print("  Done.")
    else:
        print("\n[1/7] Creating tables if they don't exist...")
        async with engine.begin() as conn:
            await conn.run_sync(Base.metadata.create_all)
        print("  Done.")

    async with AsyncSessionLocal() as session:
        from sqlalchemy import text, select

        # ── Resolve school ──────────────────────────────────────────
        print("\n[2/7] Resolving school record...")
        result = await session.execute(select(School).where(School.id == SCHOOL_ID))
        school = result.scalars().first()
        if not school:
            school = School(
                id=SCHOOL_ID,
                name="Bharathi Matriculation Hr. Sec. School",
                address="104 Gandhi Road, Anna Nagar, Chennai, Tamil Nadu 600040",
                contact_email="admin@bharathischool.edu"
            )
            session.add(school)
            await session.flush()
            print("  Created school.")
        else:
            print("  School already exists — reusing.")

        # ── Departments ────────────────────────────────────────────
        print("\n[3/7] Creating departments...")
        dept_map: dict[str, Department] = {}
        for dept_def in DEPARTMENTS:
            result = await session.execute(
                select(Department).where(Department.code == dept_def["code"])
            )
            existing = result.scalars().first()
            if existing:
                dept_map[dept_def["code"]] = existing
            else:
                d = Department(
                    id=uid(),
                    school_id=SCHOOL_ID,
                    name=dept_def["name"],
                    code=dept_def["code"],
                )
                session.add(d)
                dept_map[dept_def["code"]] = d
        await session.flush()
        print(f"  {len(dept_map)} departments ready.")

        # ── Subjects ───────────────────────────────────────────────
        print("\n[4/7] Creating subjects...")
        subject_map: dict[str, Subject] = {}
        for (code, name, dept_code, grades) in SUBJECTS_DEF:
            result = await session.execute(
                select(Subject).where(Subject.code == code)
            )
            existing = result.scalars().first()
            if existing:
                subject_map[code] = existing
            else:
                s = Subject(
                    id=uid(),
                    school_id=SCHOOL_ID,
                    code=code,
                    name=name,
                    department_id=dept_map[dept_code].id,
                    applicable_grades=grades,
                )
                session.add(s)
                subject_map[code] = s
        await session.flush()
        print(f"  {len(subject_map)} subjects ready.")

        # ── Classes ────────────────────────────────────────────────
        print("\n[5/7] Creating classes...")
        class_map: dict[str, Class] = {}

        # Grades LKG–10: 2 sections each
        for grade in STANDARD_GRADES_2SEC:
            for section in STANDARD_SECTIONS_2SEC:
                key = f"{grade}-{section}"
                result = await session.execute(
                    select(Class).where(Class.grade == grade, Class.section == section)
                )
                existing = result.scalars().first()
                if existing:
                    class_map[key] = existing
                else:
                    c = Class(
                        id=uid(),
                        school_id=SCHOOL_ID,
                        grade=grade,
                        section=section,
                    )
                    session.add(c)
                    class_map[key] = c

        # Grades 11–12: 3 stream sections each
        for grade in HIGHER_SEC_GRADES:
            for section in HIGHER_SEC_SECTIONS:
                key = f"{grade}-{section}"
                result = await session.execute(
                    select(Class).where(Class.grade == grade, Class.section == section)
                )
                existing = result.scalars().first()
                if existing:
                    class_map[key] = existing
                else:
                    c = Class(
                        id=uid(),
                        school_id=SCHOOL_ID,
                        grade=grade,
                        section=section,
                    )
                    session.add(c)
                    class_map[key] = c

        await session.flush()
        total_classes = len(class_map)
        print(f"  {total_classes} classes created.")

        # ── Teachers ───────────────────────────────────────────────
        print("\n[6/7] Creating teachers...")
        teachers: list[User] = []
        teacher_idx = 0

        for (dept_code, major, teaches_grades) in TEACHER_DEFS:
            name = make_teacher_name(teacher_idx)
            emp_no = next_teacher_emp()
            email = f"teacher.{slug(name)}.{emp_no.lower()}@bharathischool.edu"

            t = User(
                id=uid(),
                school_id=SCHOOL_ID,
                email=email,
                full_name=name,
                role=UserRole.TEACHER,
                password_hash=DEFAULT_PWD,
                department_id=dept_map[dept_code].id,
                phone=f"9{random.randint(100000000, 999999999)}",
                is_active=True,
            )
            session.add(t)
            teachers.append(t)
            teacher_idx += 1

        await session.flush()
        print(f"  {len(teachers)} teachers created.")

        # ── Assign class teachers (cycle through teachers) ─────────
        print("  Assigning class teachers...")
        all_class_ids = list(class_map.values())
        for i, cls in enumerate(all_class_ids):
            teacher = teachers[i % len(teachers)]
            cls.class_teacher_id = teacher.id

        # Also add PositionAttribute for each teacher→class assignment
        for i, cls in enumerate(all_class_ids):
            teacher = teachers[i % len(teachers)]
            pa = PositionAttribute(
                id=uid(),
                user_id=teacher.id,
                attribute_type="class_teacher_of",
                attribute_value=cls.id,
            )
            session.add(pa)

        await session.flush()
        print("  Class teachers assigned.")

        # ── Students ───────────────────────────────────────────────
        print("\n[7/7] Creating 500 students...")

        # Plan: distribute 500 students. Each of the 28+6=34 classes gets 30.
        # That's 34 × 30 = 1020 theoretically, but we cap at 500 total.
        # Fill classes in order until we reach 500.
        all_class_keys = (
            [f"{g}-{s}" for g in STANDARD_GRADES_2SEC for s in STANDARD_SECTIONS_2SEC] +
            [f"{g}-{s}" for g in HIGHER_SEC_GRADES for s in HIGHER_SEC_SECTIONS]
        )

        total_students_target = 500
        students_created = 0
        roll_counters: dict[str, int] = {}

        FATHER_FIRST = [
            "Murugan", "Rajan", "Selvam", "Pandian", "Ponnusamy",
            "Arumugam", "Shanmugam", "Subramaniam", "Venkataraman",
            "Ganesan", "Balakrishnan", "Thangavel", "Muthukumar",
        ]
        MOTHER_FIRST = [
            "Meena", "Kavitha", "Saranya", "Deepa", "Sujatha",
            "Revathi", "Lakshmi", "Nalini", "Padmavathi", "Usha",
        ]

        for class_key in all_class_keys:
            if students_created >= total_students_target:
                break

            cls = class_map[class_key]
            grade = cls.grade

            # How many to put in this class?
            remaining = total_students_target - students_created
            count_in_class = min(STUDENTS_PER_CLASS, remaining)

            roll_counters[class_key] = 0

            for i in range(count_in_class):
                gender = random.choice(GENDERS)
                full_name = make_student_name(gender)
                adm = next_student_admission()
                roll_counters[class_key] += 1
                roll = f"{grade}{cls.section}{roll_counters[class_key]:02d}"
                min_age, max_age = student_age_for_grade(grade)
                dob = rand_dob(min_age, max_age)

                # Generate email for student user
                email = f"student.{adm.lower()}@bharathischool.edu"

                # User record
                u = User(
                    id=uid(),
                    school_id=SCHOOL_ID,
                    email=email,
                    full_name=full_name,
                    role=UserRole.STUDENT,
                    password_hash=DEFAULT_PWD,
                    assigned_grade=grade,
                    roll_number=roll,
                    admission_number=adm,
                    phone=f"9{random.randint(100000000, 999999999)}",
                    is_active=True,
                )
                session.add(u)
                await session.flush()

                father_name = f"{random.choice(FATHER_FIRST)} {random.choice(TAMIL_LAST)}"
                mother_name = f"{random.choice(MOTHER_FIRST)} {random.choice(TAMIL_LAST)}"

                # Student profile
                s = Student(
                    id=uid(),
                    school_id=SCHOOL_ID,
                    user_id=u.id,
                    class_id=cls.id,
                    admission_number=adm,
                    roll_number=roll,
                    full_name=full_name,
                    father_name=father_name,
                    mother_name=mother_name,
                    guardian_phone=f"9{random.randint(100000000, 999999999)}",
                    date_of_birth=dob,
                    blood_group=random.choice(BLOOD_GROUPS),
                    gender=gender,
                    community_category=random.choice(COMMUNITIES),
                    address=f"{random.randint(1, 200)}, {random.choice(['Anna Nagar', 'T Nagar', 'Adyar', 'Tambaram', 'Chromepet', 'Velachery', 'Porur', 'Ambattur'])}, Chennai",
                    is_bus_user=random.choice([True, False]),
                    is_hostel_user=False,
                )
                session.add(s)
                students_created += 1

            # Flush every class to avoid memory overload
            await session.flush()
            print(f"  ✓  {class_key:<18}  {count_in_class:>2} students  (total: {students_created})")

        await session.commit()

    print("\n" + "=" * 60)
    print(f"✅  Seeding complete!")
    print(f"    Students : {students_created}")
    print(f"    Teachers : {len(teachers)}")
    print(f"    Classes  : {total_classes}")
    print(f"    Depts    : {len(dept_map)}")
    print(f"    Subjects : {len(subject_map)}")
    print(f"\n    Default password: school@123")
    print("=" * 60)


if __name__ == "__main__":
    asyncio.run(seed())
