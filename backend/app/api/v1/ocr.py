import uuid
from fastapi import APIRouter, UploadFile, File, HTTPException, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from app.db.database import get_db
from app.db.models import User, Student, UserRole
from app.schemas.ocr import OCRProcessResponse, StudentDataExtraction
from app.services.ocr_engine import ocr_engine
from app.core.auth import get_current_user, require_role

router = APIRouter(prefix="/ocr", tags=["OCR Document Processing"])

@router.post("/process-student-form", response_model=OCRProcessResponse)
async def process_student_form(
    file: UploadFile = File(...),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_role(
        UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.PRINCIPAL
    )),
):
    """Process admission form via OCR. Admin/Principal only."""
    if not file.filename.lower().endswith(('.pdf', '.png', '.jpg', '.jpeg')):
        raise HTTPException(status_code=400, detail="Invalid file type. Only PDF, PNG, JPG allowed.")

    file_bytes = await file.read()
    if len(file_bytes) == 0:
        raise HTTPException(status_code=400, detail="Uploaded file is empty.")

    # 1. Multi-model OCR processing & LLM Judge consensus
    extraction_data, model_results, judge_notes = await ocr_engine.process_form(file_bytes)

    # 2. Check if student already exists by admission number
    query = select(Student).where(Student.admission_number == extraction_data.admission_number)
    res = await db.execute(query)
    existing_student = res.scalars().first()

    if existing_student:
        student_record = existing_student
    else:
        # Create corresponding user entry
        user_record = User(
            id=str(uuid.uuid4()),
            email=extraction_data.email or f"{extraction_data.admission_number.lower()}@school.edu",
            full_name=extraction_data.full_name,
            role=UserRole.STUDENT
        )
        db.add(user_record)
        await db.flush()

        # Insert record into students table
        student_record = Student(
            id=str(uuid.uuid4()),
            user_id=user_record.id,
            admission_number=extraction_data.admission_number,
            roll_number=extraction_data.roll_number,
            full_name=extraction_data.full_name,
            father_name=extraction_data.father_name,
            mother_name=extraction_data.mother_name,
            guardian_phone=extraction_data.guardian_phone,
            date_of_birth=extraction_data.date_of_birth,
            blood_group=extraction_data.blood_group,
            address=extraction_data.address
        )
        db.add(student_record)
        await db.commit()
        await db.refresh(student_record)

    return OCRProcessResponse(
        status="success",
        student_id=student_record.id,
        admission_number=student_record.admission_number,
        full_name=student_record.full_name,
        verification_status="auto_saved",
        data=extraction_data,
        model_extractions=model_results,
        judge_consensus_notes=judge_notes
    )

@router.get("/students")
async def list_ocr_students(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """List all OCR-processed students. Accessible to all authenticated users."""
    res = await db.execute(select(Student))
    students = res.scalars().all()
    return students
