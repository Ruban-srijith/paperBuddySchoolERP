from pydantic import BaseModel, Field, ConfigDict
from typing import Optional, List, Dict, Any
from datetime import datetime

class StudentDocumentBase(BaseModel):
    document_type: str = Field(..., description="Type of document (aadhaar, community, income, tc, birth_cert, custom)")
    document_title: str

class StudentDocumentResponse(BaseModel):
    id: str
    student_id: str
    document_type: str
    document_title: str
    file_url: str
    masked_doc_number: Optional[str] = None
    verification_status: str  # 'VERIFIED', 'AI_WARNING', 'PENDING'
    ai_confidence: float
    ai_matched_fields: Optional[Dict[str, Any]] = None
    extracted_data: Optional[Dict[str, Any]] = None
    ai_remarks: Optional[str] = None
    uploaded_at: datetime

    model_config = ConfigDict(from_attributes=True)

class StudentDocumentStatusResponse(BaseModel):
    is_aadhaar_verified: bool
    aadhaar_doc: Optional[StudentDocumentResponse] = None
    uploaded_documents: List[StudentDocumentResponse]
    student_profile: Dict[str, Any]

class DocumentUnmaskRequest(BaseModel):
    document_id: str
    secret_key: str = Field(..., description="Student/User Unique Security Key or Account Password")

class DocumentUnmaskResponse(BaseModel):
    document_id: str
    document_type: str
    unmasked_doc_number: str
    verified_at: datetime

class AdminStudentDocumentRow(BaseModel):
    student_id: str
    student_name: str
    admission_number: str
    class_name: Optional[str] = None
    father_name: Optional[str] = None
    father_annual_income: Optional[str] = None
    community_category: Optional[str] = None
    aadhaar_status: str  # 'VERIFIED', 'MISSING', 'AI_WARNING'
    total_documents: int
    documents: List[StudentDocumentResponse]
