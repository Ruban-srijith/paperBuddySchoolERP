from pydantic import BaseModel, Field
from typing import Optional, Dict, Any, List

class StudentDataExtraction(BaseModel):
    full_name: str = Field(..., example="Kishor Kumar")
    email: Optional[str] = Field(None, example="kishor.k@school.edu")
    admission_number: str = Field(..., example="ADM-2026-042")
    roll_number: Optional[str] = Field(None, example="10B-14")
    father_name: Optional[str] = Field(None, example="Ramesh Kumar")
    mother_name: Optional[str] = Field(None, example="Anita Kumar")
    guardian_phone: Optional[str] = Field(None, example="+919876543210")
    date_of_birth: Optional[str] = Field(None, example="2008-05-14")
    blood_group: Optional[str] = Field(None, example="O+")
    address: Optional[str] = Field(None, example="123 Main St, Sector 4")

class ModelExtractionResult(BaseModel):
    model_name: str
    confidence: float
    data: Dict[str, Any]

class OCRProcessResponse(BaseModel):
    status: str = "success"
    student_id: str
    admission_number: str
    full_name: str
    verification_status: str = "auto_saved"
    data: StudentDataExtraction
    model_extractions: List[ModelExtractionResult]
    judge_consensus_notes: str
