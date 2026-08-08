import asyncio
import uuid
import json
from datetime import datetime
from app.db.database import AsyncSessionLocal, engine, Base
from app.db.models import User, ScanRecord, UserRole, ScanStatus
from app.schemas.scans import ROLE_CODES, ROLE_DOCUMENT_TYPES
from app.api.v1.scans import generate_unique_scan_id
from app.services.ocr_engine import ocr_engine
from sqlalchemy.future import select
from sqlalchemy.orm import selectinload

async def run_scan_tests():
    print("--- 1. Initializing Database Schema including ScanRecords ---")
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    print("Database tables initialized successfully.")

    print("\n--- 2. Verifying Role Codes & Document Type Mappings ---")
    for role, code in ROLE_CODES.items():
        doc_types = ROLE_DOCUMENT_TYPES.get(role, [])
        sample_id = generate_unique_scan_id(role)
        print(f"Role: {role.value:<15} | Code: {code} | Sample ID: {sample_id} | Allowed Types ({len(doc_types)}): {doc_types}")
        assert sample_id.startswith(code), f"Sample ID {sample_id} does not start with code {code}"
        assert len(doc_types) > 0, f"Role {role.value} has no allowed document types!"

    print("\n--- 3. Testing Scan Creation & Multi-Model OCR Processing ---")
    async with AsyncSessionLocal() as session:
        # Create test teacher user
        teacher = User(
            id=str(uuid.uuid4()),
            email=f"teacher_{uuid.uuid4().hex[:6]}@school.edu",
            full_name="Prof. Alan Turing",
            role=UserRole.TEACHER
        )
        session.add(teacher)
        await session.commit()
        await session.refresh(teacher)

        scan_id = generate_unique_scan_id(UserRole.TEACHER)
        extracted_text, fields, confidence = await ocr_engine.process_universal_document(
            b"fake_answer_sheet_bytes", UserRole.TEACHER.value, "answer_sheets"
        )

        scan = ScanRecord(
            id=str(uuid.uuid4()),
            unique_scan_id=scan_id,
            uploaded_by_id=teacher.id,
            role=UserRole.TEACHER,
            document_type="answer_sheets",
            file_path=f"uploads/scans/{scan_id}_sheet.png",
            extracted_text=extracted_text,
            extracted_fields=json.dumps(fields),
            confidence_score=confidence,
            status=ScanStatus.COMPLETED
        )
        session.add(scan)
        await session.commit()
        print(f"Scan Created: ID={scan.unique_scan_id}, Role={scan.role.value}, Status={scan.status.value}, Confidence={scan.confidence_score}")
        assert scan.unique_scan_id.startswith("TCH-"), "Scan ID prefix mismatch!"

        # Create test HOD user to verify scan
        hod = User(
            id=str(uuid.uuid4()),
            email=f"hod_{uuid.uuid4().hex[:6]}@school.edu",
            full_name="Dr. Grace Hopper",
            role=UserRole.DEPT_HEAD
        )
        session.add(hod)
        await session.commit()

        print("\n--- 4. Testing Scan Verification Workflow ---")
        scan.status = ScanStatus.VERIFIED
        scan.verified_by_id = hod.id
        scan.verified_at = datetime.utcnow()
        scan.linked_module = "attendance"
        scan.linked_object_id = str(uuid.uuid4())
        await session.commit()

        # Re-fetch scan with relationships
        res = await session.execute(
            select(ScanRecord)
            .options(selectinload(ScanRecord.uploaded_by), selectinload(ScanRecord.verified_by))
            .where(ScanRecord.id == scan.id)
        )
        verified_scan = res.scalars().first()
        print(f"Verified Scan: ID={verified_scan.unique_scan_id}")
        print(f"Uploaded By: {verified_scan.uploaded_by.full_name} ({verified_scan.uploaded_by.role.value})")
        print(f"Verified By: {verified_scan.verified_by.full_name} ({verified_scan.verified_by.role.value}) at {verified_scan.verified_at}")
        print(f"Linked Module: {verified_scan.linked_module} -> {verified_scan.linked_object_id}")

        assert verified_scan.status == ScanStatus.VERIFIED, "Verification status failed!"
        assert verified_scan.verified_by_id == hod.id, "Verified by user mismatch!"

    print("\nUniversal OCR Scan Module Tests Passed Cleanly!")

if __name__ == "__main__":
    asyncio.run(run_scan_tests())
