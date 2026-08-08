import uuid
import json
import os
import random
import string
from datetime import datetime
from typing import List, Optional

from fastapi import APIRouter, UploadFile, File, Form, HTTPException, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy.orm import selectinload

from app.db.database import get_db
from app.db.models import User, ScanRecord, UserRole, ScanStatus, ROLE_HIERARCHY
from app.schemas.scans import (
    ScanRecordResponse,
    ScanVerifyRequest,
    ROLE_CODES,
    ROLE_DOCUMENT_TYPES,
)
from app.services.ocr_engine import ocr_engine
from app.core.auth import get_current_user

router = APIRouter(prefix="/scans", tags=["Universal OCR Scan Module"])


def generate_unique_scan_id(role: UserRole) -> str:
    role_code = ROLE_CODES.get(role, "GEN")
    date_str = datetime.utcnow().strftime("%Y%m%d")
    random_str = ''.join(random.choices(string.ascii_uppercase + string.digits, k=6))
    return f"{role_code}-{date_str}-{random_str}"


def format_scan_response(scan: ScanRecord) -> ScanRecordResponse:
    fields_dict = None
    if scan.extracted_fields:
        try:
            fields_dict = json.loads(scan.extracted_fields)
        except Exception:
            fields_dict = {"raw": scan.extracted_fields}

    return ScanRecordResponse(
        id=scan.id,
        unique_scan_id=scan.unique_scan_id,
        uploaded_by_id=scan.uploaded_by_id,
        uploaded_by_name=scan.uploaded_by.full_name if scan.uploaded_by else None,
        role=scan.role,
        document_type=scan.document_type,
        file_path=scan.file_path,
        extracted_text=scan.extracted_text,
        extracted_fields=fields_dict,
        confidence_score=float(scan.confidence_score) if scan.confidence_score is not None else None,
        status=scan.status,
        linked_module=scan.linked_module,
        linked_object_id=scan.linked_object_id,
        verified_by_id=scan.verified_by_id,
        verified_by_name=scan.verified_by.full_name if scan.verified_by else None,
        verified_at=scan.verified_at,
        created_at=scan.created_at,
        updated_at=scan.updated_at,
    )


@router.get("/allowed-types")
async def get_allowed_document_types(current_user: User = Depends(get_current_user)):
    """Returns permitted document types for the current user's role and all ERP roles."""
    user_types = ROLE_DOCUMENT_TYPES.get(current_user.role, [])
    all_role_types = {role.value: types for role, types in ROLE_DOCUMENT_TYPES.items()}
    return {
        "user_role": current_user.role.value,
        "user_role_code": ROLE_CODES.get(current_user.role, "GEN"),
        "allowed_types": user_types,
        "all_roles_map": all_role_types
    }


@router.post("/upload", response_model=ScanRecordResponse)
async def upload_and_process_scan(
    file: UploadFile = File(...),
    document_type: str = Form(...),
    linked_module: Optional[str] = Form(None),
    linked_object_id: Optional[str] = Form(None),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Upload a document image/PDF for OCR scanning.
    Validates document_type against role whitelist, generates a unique scan ID,
    runs multi-model OCR extraction, and persists the ScanRecord.
    """
    allowed_types = ROLE_DOCUMENT_TYPES.get(current_user.role, [])
    if document_type not in allowed_types:
        raise HTTPException(
            status_code=400,
            detail=f"Document type '{document_type}' is not permitted for role '{current_user.role.value}'. Allowed: {allowed_types}"
        )

    if not file.filename.lower().endswith(('.pdf', '.png', '.jpg', '.jpeg', '.webp')):
        raise HTTPException(status_code=400, detail="Unsupported file format. Please upload PDF, PNG, JPG, or WEBP.")

    file_bytes = await file.read()
    if len(file_bytes) == 0:
        raise HTTPException(status_code=400, detail="Uploaded file is empty.")

    # Generate guaranteed unique scan ID
    for _ in range(5):
        candidate_id = generate_unique_scan_id(current_user.role)
        query = select(ScanRecord).where(ScanRecord.unique_scan_id == candidate_id)
        res = await db.execute(query)
        if not res.scalars().first():
            unique_scan_id = candidate_id
            break
    else:
        unique_scan_id = f"{ROLE_CODES.get(current_user.role, 'GEN')}-{uuid.uuid4().hex[:12].upper()}"

    # Save file artifact locally
    upload_dir = os.path.join("uploads", "scans", datetime.utcnow().strftime("%Y/%m/%d"))
    os.makedirs(upload_dir, exist_ok=True)
    file_name = f"{unique_scan_id}_{file.filename}"
    file_path = os.path.join(upload_dir, file_name)

    try:
        with open(file_path, "wb") as f:
            f.write(file_bytes)
    except Exception:
        file_path = f"uploads/scans/{file_name}"

    # OCR extraction via Multi-Model pipeline
    extracted_text, extracted_fields, confidence = await ocr_engine.process_universal_document(
        file_bytes, current_user.role.value, document_type
    )

    # Persist ScanRecord
    scan = ScanRecord(
        id=str(uuid.uuid4()),
        unique_scan_id=unique_scan_id,
        uploaded_by_id=current_user.id,
        role=current_user.role,
        document_type=document_type,
        file_path=file_path,
        extracted_text=extracted_text,
        extracted_fields=json.dumps(extracted_fields),
        confidence_score=confidence,
        status=ScanStatus.COMPLETED,
        linked_module=linked_module,
        linked_object_id=linked_object_id,
    )
    db.add(scan)
    await db.commit()

    # Re-query with relationship loading
    res = await db.execute(
        select(ScanRecord)
        .options(selectinload(ScanRecord.uploaded_by), selectinload(ScanRecord.verified_by))
        .where(ScanRecord.id == scan.id)
    )
    saved_scan = res.scalars().first()
    return format_scan_response(saved_scan)


@router.get("/", response_model=List[ScanRecordResponse])
async def list_scans(
    role: Optional[UserRole] = Query(None),
    status: Optional[ScanStatus] = Query(None),
    document_type: Optional[str] = Query(None),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Retrieve filterable scan records respecting role hierarchy:
    - Executive/Leadership roles (Rank >= 5): view all system scans
    - HOD (Rank 4): view department scans + own scans
    - Teacher/Mentor/Student/Parent: view own uploaded scans
    """
    user_rank = ROLE_HIERARCHY.get(current_user.role, 1)

    query = select(ScanRecord).options(
        selectinload(ScanRecord.uploaded_by),
        selectinload(ScanRecord.verified_by)
    )

    if user_rank < 5:  # Below Dean level
        if current_user.role == UserRole.DEPT_HEAD and current_user.department_id:
            # HOD can view department members' scans
            dept_user_ids_res = await db.execute(
                select(User.id).where(User.department_id == current_user.department_id)
            )
            dept_user_ids = dept_user_ids_res.scalars().all()
            query = query.where(
                (ScanRecord.uploaded_by_id == current_user.id) | (ScanRecord.uploaded_by_id.in_(dept_user_ids))
            )
        else:
            query = query.where(ScanRecord.uploaded_by_id == current_user.id)

    # Optional filters
    if role:
        query = query.where(ScanRecord.role == role)
    if status:
        query = query.where(ScanRecord.status == status)
    if document_type:
        query = query.where(ScanRecord.document_type == document_type)

    query = query.order_by(ScanRecord.created_at.desc())
    res = await db.execute(query)
    scans = res.scalars().all()

    return [format_scan_response(s) for s in scans]


@router.get("/{unique_scan_id}", response_model=ScanRecordResponse)
async def get_scan_by_unique_id(
    unique_scan_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Retrieve details for a single scan by unique_scan_id."""
    res = await db.execute(
        select(ScanRecord)
        .options(selectinload(ScanRecord.uploaded_by), selectinload(ScanRecord.verified_by))
        .where(ScanRecord.unique_scan_id == unique_scan_id)
    )
    scan = res.scalars().first()
    if not scan:
        raise HTTPException(status_code=404, detail="Scan record not found.")

    user_rank = ROLE_HIERARCHY.get(current_user.role, 1)
    if user_rank < 5 and scan.uploaded_by_id != current_user.id:
        if not (current_user.role == UserRole.DEPT_HEAD and scan.uploaded_by and scan.uploaded_by.department_id == current_user.department_id):
            raise HTTPException(status_code=403, detail="Permission denied to access this scan record.")

    return format_scan_response(scan)


@router.put("/{unique_scan_id}/verify", response_model=ScanRecordResponse)
async def verify_scan_record(
    unique_scan_id: str,
    payload: ScanVerifyRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Verification endpoint: Evaluators/HODs/Admins can verify scans,
    update status to 'verified', and link them to system modules.
    """
    res = await db.execute(
        select(ScanRecord)
        .options(selectinload(ScanRecord.uploaded_by), selectinload(ScanRecord.verified_by))
        .where(ScanRecord.unique_scan_id == unique_scan_id)
    )
    scan = res.scalars().first()
    if not scan:
        raise HTTPException(status_code=404, detail="Scan record not found.")

    user_rank = ROLE_HIERARCHY.get(current_user.role, 1)
    uploader_rank = ROLE_HIERARCHY.get(scan.role, 1)

    # Permission check: Must be higher rank than uploader, or HOD in same dept, or Super Admin/Admin/Principal
    is_authorized = (
        user_rank > uploader_rank or
        current_user.role in [UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.PRINCIPAL] or
        (current_user.role == UserRole.DEPT_HEAD and scan.uploaded_by and scan.uploaded_by.department_id == current_user.department_id)
    )

    if not is_authorized:
        raise HTTPException(
            status_code=403,
            detail=f"User role '{current_user.role.value}' cannot verify scans submitted by '{scan.role.value}'."
        )

    scan.status = ScanStatus.VERIFIED
    scan.verified_by_id = current_user.id
    scan.verified_at = datetime.utcnow()

    if payload.linked_module:
        scan.linked_module = payload.linked_module
    if payload.linked_object_id:
        scan.linked_object_id = payload.linked_object_id

    await db.commit()

    # Re-query with relationship loading
    res = await db.execute(
        select(ScanRecord)
        .options(selectinload(ScanRecord.uploaded_by), selectinload(ScanRecord.verified_by))
        .where(ScanRecord.id == scan.id)
    )
    updated_scan = res.scalars().first()
    return format_scan_response(updated_scan)
