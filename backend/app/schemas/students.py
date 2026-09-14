"""
Pydantic Schemas for Mass Student Onboarding & Student Management.
"""
from typing import Optional, List
from pydantic import BaseModel, EmailStr, Field

class BulkOnboardRangeRequest(BaseModel):
    start_number: int = Field(..., ge=1, description="Starting admission number (e.g., 101)")
    end_number: int = Field(..., ge=1, description="Ending admission number (e.g., 150)")
    prefix: str = Field(default="ADM-2026-", description="Prefix for admission number (e.g., ADM-2026-)")
    class_id: str = Field(..., description="Target class ID for all generated students")
    default_password: str = Field(default="Student@123", min_length=6, description="Default password for new accounts")
    email_domain: str = Field(default="school.edu", description="Domain for generated emails")

class StudentCSVRow(BaseModel):
    full_name: str
    email: EmailStr
    admission_number: str
    father_name: Optional[str] = None
    mother_name: Optional[str] = None
    guardian_phone: Optional[str] = None
    date_of_birth: Optional[str] = None
    blood_group: Optional[str] = None
    address: Optional[str] = None
    class_id: Optional[str] = None

class BulkOnboardResponse(BaseModel):
    success: bool
    strategy: str  # "range" or "csv_excel"
    total_processed: int
    created_count: int
    failed_count: int
    errors: List[str] = []
    students_created: List[dict] = []

class StudentClassAssignment(BaseModel):
    student_ids: List[str] = Field(..., description="List of student IDs to assign")
    class_id: Optional[str] = Field(None, description="The class ID to assign them to. If None, unassigns them.")
