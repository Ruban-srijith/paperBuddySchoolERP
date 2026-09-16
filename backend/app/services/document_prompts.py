"""
document_prompts.py
────────────────────────────────────────────────────────────────────────────
Prompt registry for student document extraction.

Design rules:
  1. Each function defines ONLY the fields that actually exist on that
     document. Never ask for a field that isn't on the physical paper.
  2. Fields map 1-to-1 to what the frontend displays in extracted_data.
  3. The JSON instruction is auto-appended by each function — the engine
     (groq_service.py) just calls get_prompt() and sends it.
  4. Adding a new doc type = one new function + one line in PROMPT_REGISTRY.

Field naming convention (used in extracted_data / frontend display):
  full_name          → student / child / account holder name from document
  father_name        → father name (only if on that document)
  mother_name        → mother name (only if on that document)
  doc_number         → primary identifier (UID / cert no / roll no)
  date               → most relevant date (DOB / issue / leaving date)
  issuing_authority  → who issued the document
────────────────────────────────────────────────────────────────────────────
"""

from typing import Dict, Any


def _json_instruction(fields: list[str]) -> str:
    keys = ", ".join(f'"{k}"' for k in fields)
    return (
        f"\n\nReturn ONLY a valid minified JSON object with exactly these keys: "
        f"[{keys}]. No markdown, no explanation, no extra keys. "
        f"Use an empty string \"\" for any field you cannot read from the document."
    )


# ─── Aadhaar Card ─────────────────────────────────────────────────────────
# Fields on card: name, C/O (father/guardian), DOB, gender, address, 12-digit UID
def aadhaar(student_name: str, father_name: str = "") -> Dict[str, Any]:
    fields = ["full_name", "father_name", "doc_number", "date", "gender", "address", "issuing_authority"]
    return {
        "system_prompt": (
            "You are an expert Indian Government Identity Verification AI specializing in "
            "Aadhaar Cards issued by UIDAI. Extract identity fields accurately from the image."
        ),
        "user_prompt": (
            f"Analyze this Aadhaar Card image for student '{student_name}'.\n"
            "Extract these fields from the card:\n"
            "- full_name: Full name exactly as printed on card\n"
            "- father_name: Father / Guardian name (C/O or S/O or D/O line)\n"
            "- doc_number: The 12-digit UID number (format: XXXX XXXX XXXX)\n"
            "- date: Date of Birth printed on card (DD/MM/YYYY)\n"
            "- gender: MALE, FEMALE, or TRANSGENDER as printed\n"
            "- address: Full residential address including PIN code\n"
            "- issuing_authority: Always \"UIDAI\" for Aadhaar cards"
            + _json_instruction(fields)
        ),
        "fields": fields,
    }


# ─── Income Certificate ───────────────────────────────────────────────────
# Fields on cert: applicant name, father name, income amount, cert number, issuing officer
# Note: no mother name, no DOB on income certs
def income(student_name: str, father_name: str = "") -> Dict[str, Any]:
    fields = ["full_name", "father_name", "doc_number", "date", "annual_income", "validity_year", "issuing_authority"]
    return {
        "system_prompt": (
            "You are a Financial Verification AI specializing in Government Annual Income Certificates "
            "issued by Revenue Departments in India. Extract certified income details precisely."
        ),
        "user_prompt": (
            f"Analyze this Annual Income Certificate for '{student_name}' (Father: '{father_name}').\n"
            "Extract these fields from the certificate:\n"
            "- full_name: Student / applicant name as on certificate\n"
            "- father_name: Father's / Guardian's full name\n"
            "- doc_number: Certificate number or Application / Reference number\n"
            "- date: Certificate issue date\n"
            "- annual_income: Certified annual income figure exactly as written (e.g. Rs. 1,80,000)\n"
            "- validity_year: Academic year for which certificate is valid (e.g. 2026-2027)\n"
            "- issuing_authority: Revenue Officer / Tahsildar / District name"
            + _json_instruction(fields)
        ),
        "fields": fields,
    }


# ─── Community / Caste Certificate ───────────────────────────────────────
# Fields on cert: student name, father name, category, sub-caste, cert number, issuing officer
# Note: no mother name, no DOB on community certs
def community(student_name: str, father_name: str = "") -> Dict[str, Any]:
    fields = ["full_name", "father_name", "doc_number", "date", "community_category", "sub_caste", "issuing_authority"]
    return {
        "system_prompt": (
            "You are a Government Caste & Category Verification AI. "
            "Extract the officially certified caste category and sub-caste from the certificate."
        ),
        "user_prompt": (
            f"Analyze this Community / Caste Certificate for '{student_name}'.\n"
            "Extract these fields from the certificate:\n"
            "- full_name: Student's name as on certificate\n"
            "- father_name: Father's name as on certificate\n"
            "- doc_number: Certificate number or reference number\n"
            "- date: Certificate issue date\n"
            "- community_category: Official category as printed — must be one of: "
            "OBC, MBC, BC, SC, ST, EWS, General\n"
            "- sub_caste: Specific sub-caste or community name as printed\n"
            "- issuing_authority: Tahsildar / Revenue Officer / District"
            + _json_instruction(fields)
        ),
        "fields": fields,
    }


# ─── Transfer Certificate (TC) ────────────────────────────────────────────
# Fields on TC: student name, father name, TC number, EMIS/admission no,
#   previous school, class last studied, date of leaving, conduct
# Note: no income, no category, no DOB typically (they use age or class)
def tc(student_name: str, father_name: str = "") -> Dict[str, Any]:
    fields = ["full_name", "father_name", "doc_number", "date", "previous_institution", "class_last_studied", "conduct_character", "emis_number"]
    return {
        "system_prompt": (
            "You are an Academic Verification AI specializing in School Transfer Certificates (TC). "
            "Extract institutional details, academic record, and conduct evaluation from the TC."
        ),
        "user_prompt": (
            f"Analyze this Transfer Certificate (TC) for '{student_name}'.\n"
            "Extract these fields from the TC:\n"
            "- full_name: Student's full name\n"
            "- father_name: Father's name as on TC\n"
            "- doc_number: TC Certificate number\n"
            "- date: Date of leaving / date of issue\n"
            "- previous_institution: Previous school / institution full name\n"
            "- class_last_studied: Standard / Grade last studied (e.g. IX, 9th, Grade 9)\n"
            "- conduct_character: Conduct / Character as certified (e.g. Good, Excellent)\n"
            "- emis_number: EMIS number or Admission number as printed, empty string if not found"
            + _json_instruction(fields)
        ),
        "fields": fields,
    }


# ─── Birth Certificate ────────────────────────────────────────────────────
# Fields on cert: child name, father name, MOTHER name (birth certs always have mother),
#   DOB, place of birth, registration number, issuing municipal authority
def birth_cert(student_name: str, father_name: str = "") -> Dict[str, Any]:
    fields = ["full_name", "father_name", "mother_name", "doc_number", "date", "place_of_birth", "gender", "issuing_authority"]
    return {
        "system_prompt": (
            "You are a Vital Statistics Verification AI specializing in Government Birth Certificates. "
            "Birth certificates always contain both parent names. Extract all fields accurately."
        ),
        "user_prompt": (
            f"Analyze this Birth Certificate for child '{student_name}'.\n"
            "Extract these fields from the certificate:\n"
            "- full_name: Child's full name\n"
            "- father_name: Father's full name\n"
            "- mother_name: Mother's full name (always present on birth certificates)\n"
            "- doc_number: Birth Registration number\n"
            "- date: Date of birth (DD/MM/YYYY)\n"
            "- place_of_birth: Hospital name and city / place of birth\n"
            "- gender: MALE or FEMALE\n"
            "- issuing_authority: Municipal Corporation / Gram Panchayat / Health Officer"
            + _json_instruction(fields)
        ),
        "fields": fields,
    }


# ─── Academic Marksheet ───────────────────────────────────────────────────
# Fields on marksheet: student name, roll number, board, year, marks, percentage, result
# Note: father name may appear on some boards, mother name sometimes too
#   but it is NOT a primary field — don't force it. Ask only what reliably appears.
def marksheet(student_name: str, father_name: str = "") -> Dict[str, Any]:
    fields = ["full_name", "doc_number", "date", "board_name", "total_marks", "percentage", "result_status", "issuing_authority"]
    return {
        "system_prompt": (
            "You are an Academic Records Evaluation AI specializing in School Marksheets and Grade Cards "
            "(Tamil Nadu State Board, CBSE, ICSE, etc.). Extract examination results accurately."
        ),
        "user_prompt": (
            f"Analyze this Academic Marksheet for '{student_name}'.\n"
            "Extract these fields from the marksheet:\n"
            "- full_name: Student's name as printed\n"
            "- doc_number: Roll number or Registration number\n"
            "- date: Examination year or result date (e.g. March 2025)\n"
            "- board_name: Examination board name (e.g. Tamil Nadu State Board, CBSE)\n"
            "- total_marks: Total marks obtained (e.g. 487/500)\n"
            "- percentage: Percentage or CGPA as printed (e.g. 97.4%)\n"
            "- result_status: PASS or FAIL\n"
            "- issuing_authority: Same as board name or institution name"
            + _json_instruction(fields)
        ),
        "fields": fields,
    }


# ─── Medical Fitness Certificate ──────────────────────────────────────────
# Fields: student name, blood group, fitness status, doctor name, reg no, hospital
# Note: no father/mother name — medical certs are about the individual
def medical_fitness(student_name: str, father_name: str = "") -> Dict[str, Any]:
    fields = ["full_name", "doc_number", "date", "blood_group", "fitness_status", "doctor_name", "issuing_authority"]
    return {
        "system_prompt": (
            "You are a Healthcare Records Verification AI. "
            "Extract blood group, fitness certification, and doctor details from medical certificates."
        ),
        "user_prompt": (
            f"Analyze this Medical Fitness Certificate for '{student_name}'.\n"
            "Extract these fields from the certificate:\n"
            "- full_name: Patient / student name\n"
            "- doc_number: Doctor's Registration / License number (MCI or State Medical Council)\n"
            "- date: Certificate issue date\n"
            "- blood_group: Blood group exactly as written (e.g. A+, O-, B+, AB+)\n"
            "- fitness_status: Certified fitness declaration (e.g. Physically Fit, Fit for School)\n"
            "- doctor_name: Certifying doctor's full name\n"
            "- issuing_authority: Hospital / Clinic / Medical Centre name"
            + _json_instruction(fields)
        ),
        "fields": fields,
    }


# ─── Scholarship Letter ───────────────────────────────────────────────────
# Fields: student name, scheme, sanction order no, amount, academic year, dept
# Note: no mother/father on most scholarship sanction letters
def scholarship_letter(student_name: str, father_name: str = "") -> Dict[str, Any]:
    fields = ["full_name", "doc_number", "date", "scholarship_scheme", "sanctioned_amount", "academic_year", "issuing_authority"]
    return {
        "system_prompt": (
            "You are a Financial Grants Verification AI. "
            "Extract scholarship scheme, sanction details, and grant amount from government allotment orders."
        ),
        "user_prompt": (
            f"Analyze this Scholarship Allotment / Sanction Letter for '{student_name}'.\n"
            "Extract these fields:\n"
            "- full_name: Student / beneficiary name\n"
            "- doc_number: Sanction Order number or Reference number\n"
            "- date: Sanction date or issue date\n"
            "- scholarship_scheme: Full scholarship scheme / program name\n"
            "- sanctioned_amount: Grant amount as written (e.g. Rs. 25,000)\n"
            "- academic_year: Academic year (e.g. 2025-2026)\n"
            "- issuing_authority: Government department / ministry name"
            + _json_instruction(fields)
        ),
        "fields": fields,
    }


# ─── Parent / Guardian Photo ID ───────────────────────────────────────────
# Fields: parent name, ID number, ID type, address
# Note: this is the PARENT's document — full_name is the parent, not the student
def parent_id(student_name: str, father_name: str = "") -> Dict[str, Any]:
    fields = ["full_name", "doc_number", "date", "id_type", "address", "issuing_authority"]
    return {
        "system_prompt": (
            "You are an Identity Verification AI specializing in Indian government photo ID cards "
            "(Voter ID / EPIC, Passport). Extract the cardholder's identity details accurately."
        ),
        "user_prompt": (
            f"Analyze this Parent / Guardian photo ID document for parent of '{student_name}'.\n"
            "Note: The name on this document is the PARENT's name, not the student's.\n"
            "Extract these fields:\n"
            "- full_name: Parent / Guardian's full name as on the ID card\n"
            "- doc_number: Voter ID (EPIC) number or Passport number\n"
            "- date: Date of birth or date of issue on the card\n"
            "- id_type: Type of ID — \"Voter ID\" or \"Passport\"\n"
            "- address: Address as printed on the ID card\n"
            "- issuing_authority: Election Commission of India (for Voter ID) or "
            "Passport Office / Ministry of External Affairs (for Passport)"
            + _json_instruction(fields)
        ),
        "fields": fields,
    }


# ─── Sports / Co-curricular Certificate ──────────────────────────────────
# Fields: student name, event, level, position, organizer, cert number
# Note: no father/mother, no DOB on sports certificates
def sports_cert(student_name: str, father_name: str = "") -> Dict[str, Any]:
    fields = ["full_name", "doc_number", "date", "event_name", "competition_level", "position_secured", "issuing_authority"]
    return {
        "system_prompt": (
            "You are an Extracurricular Achievement Verification AI. "
            "Extract competition details, level, and award information from sports and activity certificates."
        ),
        "user_prompt": (
            f"Analyze this Sports / Co-curricular Certificate for '{student_name}'.\n"
            "Extract these fields:\n"
            "- full_name: Student's name as on the certificate\n"
            "- doc_number: Certificate number or serial number, empty string if not found\n"
            "- date: Date of event or certificate issue date\n"
            "- event_name: Full event / competition / championship name\n"
            "- competition_level: Level — District, State, National, or International\n"
            "- position_secured: Position or award (e.g. 1st Place, Gold Medal, Participant)\n"
            "- issuing_authority: Organizing body / association / school name"
            + _json_instruction(fields)
        ),
        "fields": fields,
    }


# ─── Generic / Unknown ────────────────────────────────────────────────────
def generic(student_name: str, father_name: str = "") -> Dict[str, Any]:
    fields = ["full_name", "doc_number", "date", "issuing_authority", "document_title"]
    return {
        "system_prompt": (
            "You are a School Operations Document Verification AI. "
            "Extract the most important identifying details from this document."
        ),
        "user_prompt": (
            f"Analyze this document for '{student_name}'.\n"
            "Extract:\n"
            "- full_name: Person's name on the document\n"
            "- doc_number: Any reference, certificate, or ID number found\n"
            "- date: Most relevant date on the document\n"
            "- issuing_authority: Issuing organization or authority\n"
            "- document_title: Title or type of document as printed"
            + _json_instruction(fields)
        ),
        "fields": fields,
    }


# ─── Registry ─────────────────────────────────────────────────────────────
PROMPT_REGISTRY: Dict[str, Any] = {
    "aadhaar":           aadhaar,
    "income":            income,
    "community":         community,
    "tc":                tc,
    "birth_cert":        birth_cert,
    "marksheet":         marksheet,
    "medical_fitness":   medical_fitness,
    "scholarship_letter": scholarship_letter,
    "parent_id":         parent_id,
    "sports_cert":       sports_cert,
    "generic":           generic,
    "custom":            generic,   # alias
    "auto":              generic,   # alias for auto-detect fallback
}


def get_prompt(doc_type: str, student_name: str, father_name: str = "") -> Dict[str, Any]:
    """
    Returns the prompt config for a given document type.
    Falls back to generic if doc_type is unknown.
    """
    fn = PROMPT_REGISTRY.get(doc_type.lower().strip(), generic)
    return fn(student_name=student_name, father_name=father_name)
