"""
Dual-Mode Mass Student Onboarding API router.
POST /students/bulk-onboard — Strategy A (Range Generator) or Strategy B (CSV/Excel Upload)
GET  /students              — List all student profiles with filters
"""
import io
import uuid
from typing import Optional, List
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy.orm import selectinload
import pandas as pd

from app.db.database import get_db
from app.db.models import User, UserRole, Student, Class
from app.core.auth import require_role, hash_password
from app.schemas.students import (
    BulkOnboardRangeRequest, BulkOnboardResponse
)

router = APIRouter(prefix="/students", tags=["Student Management & Onboarding"])


@router.post("/bulk-onboard", response_model=BulkOnboardResponse)
async def bulk_onboard_students(
    file: Optional[UploadFile] = File(None),
    class_id: Optional[str] = Form(None),
    start_number: Optional[int] = Form(None),
    end_number: Optional[int] = Form(None),
    prefix: Optional[str] = Form("ADM-2026-"),
    default_password: Optional[str] = Form("Student@123"),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_role(UserRole.SUPER_ADMIN, UserRole.ADMIN)),
):
    """
    Dual-Mode Mass Student Onboarding Engine:
    - Strategy A (Sequential Range Generator): Provide start_number, end_number, prefix, class_id.
    - Strategy B (CSV / Excel Import): Provide uploaded .csv or .xlsx file up to 10MB.
    """
    errors: List[str] = []
    students_to_create = []

    # -------------------------------------------------------------
    # STRATEGY B: CSV / Excel Upload
    # -------------------------------------------------------------
    if file is not None:
        if not (file.filename.endswith(".csv") or file.filename.endswith(".xlsx") or file.filename.endswith(".xls")):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Unsupported file format. Please upload a .csv or .xlsx file."
            )
        
        content = await file.read()
        if len(content) > 10 * 1024 * 1024:  # 10 MB limit
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="File size exceeds maximum limit of 10MB."
            )
        
        try:
            if file.filename.endswith(".csv"):
                df = pd.read_csv(io.BytesIO(content))
            else:
                df = pd.read_excel(io.BytesIO(content))
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Failed to parse uploaded spreadsheet: {str(e)}"
            )

        if len(df) > 1000:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Maximum 1,000 records allowed per batch import. Found: {len(df)}"
            )

        # Standardize column names
        df.columns = [str(col).strip().lower().replace(" ", "_") for col in df.columns]

        for idx, row in df.iterrows():
            row_num = idx + 2  # header is line 1
            name = str(row.get("full_name", row.get("name", ""))).strip()
            email = str(row.get("email", "")).strip().lower()
            adm_no = str(row.get("admission_number", row.get("admission_no", row.get("adm_no", "")))).strip()
            father = str(row.get("father_name", "")).strip() or None
            phone = str(row.get("guardian_phone", row.get("phone", ""))).strip() or None
            target_class = str(row.get("class_id", class_id or "")).strip() or None

            if not name or not email or not adm_no:
                errors.append(f"Row {row_num}: Missing required fields (full_name, email, admission_number)")
                continue

            students_to_create.append({
                "full_name": name,
                "email": email,
                "admission_number": adm_no,
                "father_name": father,
                "guardian_phone": phone,
                "class_id": target_class,
                "password": default_password,
            })

        strategy_used = "csv_excel"

    # -------------------------------------------------------------
    # STRATEGY A: Sequential Range Generator
    # -------------------------------------------------------------
    elif start_number is not None and end_number is not None:
        if start_number > end_number:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="start_number cannot be greater than end_number"
            )
        if (end_number - start_number + 1) > 1000:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Range cannot generate more than 1,000 records per batch."
            )
        if not class_id:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="class_id is required for Range Generator Strategy"
            )

        prefix_clean = (prefix or "ADM-2026-").strip()
        for num in range(start_number, end_number + 1):
            adm_no = f"{prefix_clean}{num}"
            email = f"student_{prefix_clean.replace('-', '').lower()}{num}@school.edu"
            full_name = f"Student {prefix_clean}{num}"

            students_to_create.append({
                "full_name": full_name,
                "email": email,
                "admission_number": adm_no,
                "father_name": None,
                "guardian_phone": None,
                "class_id": class_id,
                "password": default_password,
            })

        strategy_used = "range"
    else:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Must provide either file (CSV/Excel) OR start_number & end_number for range generation."
        )

    if not students_to_create:
        return BulkOnboardResponse(
            success=False,
            strategy=strategy_used,
            total_processed=0,
            created_count=0,
            failed_count=len(errors),
            errors=errors,
            students_created=[]
        )

    # -------------------------------------------------------------
    # DB Pre-Validation for Duplicate Emails & Admission Numbers
    # -------------------------------------------------------------
    emails = [s["email"] for s in students_to_create]
    adm_nos = [s["admission_number"] for s in students_to_create]

    existing_emails_res = await db.execute(select(User.email).where(User.email.in_(emails)))
    existing_emails = set(existing_emails_res.scalars().all())

    existing_adms_res = await db.execute(select(Student.admission_number).where(Student.admission_number.in_(adm_nos)))
    existing_adms = set(existing_adms_res.scalars().all())

    valid_students = []
    for s in students_to_create:
        if s["email"] in existing_emails:
            errors.append(f"Duplicate email found in DB: {s['email']}")
            continue
        if s["admission_number"] in existing_adms:
            errors.append(f"Duplicate admission number found in DB: {s['admission_number']}")
            continue
        valid_students.append(s)

    # -------------------------------------------------------------
    # Single Async Database Transaction
    # -------------------------------------------------------------
    created_records = []
    try:
        for s in valid_students:
            user_id = str(uuid.uuid4())
            new_user = User(
                id=user_id,
                email=s["email"],
                full_name=s["full_name"],
                role=UserRole.STUDENT,
                password_hash=hash_password(s["password"]),
            )
            db.add(new_user)

            student_id = str(uuid.uuid4())
            new_student = Student(
                id=student_id,
                user_id=user_id,
                class_id=s["class_id"],
                admission_number=s["admission_number"],
                full_name=s["full_name"],
                father_name=s.get("father_name"),
                guardian_phone=s.get("guardian_phone"),
            )
            db.add(new_student)

            created_records.append({
                "user_id": user_id,
                "student_id": student_id,
                "email": s["email"],
                "full_name": s["full_name"],
                "admission_number": s["admission_number"],
                "class_id": s["class_id"],
            })

        await db.commit()
    except Exception as e:
        await db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Transaction failed during bulk student onboarding: {str(e)}"
        )

    return BulkOnboardResponse(
        success=len(created_records) > 0,
        strategy=strategy_used,
        total_processed=len(students_to_create),
        created_count=len(created_records),
        failed_count=len(students_to_create) - len(created_records) + len(errors),
        errors=errors,
        students_created=created_records,
    )


@router.get("")
async def list_students(
    class_id: Optional[str] = None,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_role(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.PRINCIPAL, UserRole.TEACHER, UserRole.MENTOR)),
):
    """List student profiles with optional class filtering."""
    query = select(Student).options(selectinload(Student.user), selectinload(Student.school_class))
    if class_id:
        query = query.where(Student.class_id == class_id)
    
    result = await db.execute(query)
    students = result.scalars().all()

    return [
        {
            "id": s.id,
            "user_id": s.user_id,
            "full_name": s.full_name,
            "admission_number": s.admission_number,
            "email": s.user.email if s.user else None,
            "class_id": s.class_id,
            "class_name": f"{s.school_class.grade}-{s.school_class.section}" if s.school_class else None,
            "father_name": s.father_name,
            "guardian_phone": s.guardian_phone,
            "created_at": s.created_at,
        }
        for s in students
    ]
