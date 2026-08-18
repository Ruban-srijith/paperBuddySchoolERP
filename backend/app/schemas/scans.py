from pydantic import BaseModel, Field, ConfigDict
from typing import Optional, Dict, Any, List
from datetime import datetime
from app.db.models import UserRole, ScanStatus

ROLE_CODES: Dict[UserRole, str] = {
    UserRole.SUPER_ADMIN: "SAD",
    UserRole.CORRESPONDENT: "COR",
    UserRole.PRINCIPAL: "PRN",
    UserRole.VICE_PRINCIPAL: "VPR",
    UserRole.TEACHER: "TCH",
    UserRole.MENTOR: "MNT",
    UserRole.STUDENT: "STD",
    UserRole.FINANCE: "FIN",
    UserRole.WARDEN: "WRD",
    UserRole.LIBRARIAN: "LIB",
    UserRole.TRANSPORT: "TRN"
}

ROLE_DOCUMENT_TYPES: Dict[UserRole, List[str]] = {
    UserRole.SUPER_ADMIN: ["system_audit_docs", "bulk_onboarding_sheets"],
    UserRole.CORRESPONDENT: ["bank_statements", "budget_sheets", "vendor_invoices", "admission_forms", "fee_challans", "id_proofs"],
    UserRole.PRINCIPAL: ["signed_circulars", "exam_approval_sheets"],
    UserRole.VICE_PRINCIPAL: ["leave_applications", "substitution_slips", "departmental_audit_reports", "syllabus_completion_sheets", "internal_exam_papers"],
    UserRole.TEACHER: ["answer_sheets", "attendance_registers", "worksheets"],
    UserRole.MENTOR: ["counseling_notes", "grievance_forms"],
    UserRole.STUDENT: ["handwritten_assignments", "lab_reports", "offline_fee_receipts", "medical_certificates"],
    UserRole.FINANCE: ["fee_receipts", "salary_slips"],
    UserRole.WARDEN: ["hostel_attendance", "outpass_forms"],
    UserRole.LIBRARIAN: ["book_requisitions", "damaged_book_reports"],
    UserRole.TRANSPORT: ["vehicle_logs", "fuel_receipts"]
}

class ScanRecordResponse(BaseModel):
    id: str
    unique_scan_id: str
    uploaded_by_id: str
    uploaded_by_name: Optional[str] = None
    role: UserRole
    document_type: str
    file_path: Optional[str] = None
    extracted_text: Optional[str] = None
    extracted_fields: Optional[Dict[str, Any]] = None
    confidence_score: Optional[float] = None
    status: ScanStatus
    linked_module: Optional[str] = None
    linked_object_id: Optional[str] = None
    verified_by_id: Optional[str] = None
    verified_by_name: Optional[str] = None
    verified_at: Optional[datetime] = None
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)

class ScanVerifyRequest(BaseModel):
    linked_module: Optional[str] = None
    linked_object_id: Optional[str] = None
    notes: Optional[str] = None
