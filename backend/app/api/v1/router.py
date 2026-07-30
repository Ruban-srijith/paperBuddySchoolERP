from fastapi import APIRouter
from app.api.v1 import (
    auth, users, students, departments, ocr, timetable, attendance,
    portion, labs, emails, mentorship, fees, approvals, substitutions, parent, ai
)

api_router = APIRouter()

# Authentication & Core Admin Modules
api_router.include_router(auth.router)
api_router.include_router(users.router)
api_router.include_router(students.router)
api_router.include_router(departments.router)

# ERP Operations
api_router.include_router(ocr.router)
api_router.include_router(timetable.router)
api_router.include_router(attendance.router)
api_router.include_router(portion.router)
api_router.include_router(labs.router)
api_router.include_router(emails.router)

# Mentorship, Fees, Approvals & Enterprise Portals
api_router.include_router(mentorship.router)
api_router.include_router(fees.router)
api_router.include_router(approvals.router)
api_router.include_router(substitutions.router)
api_router.include_router(parent.router)
api_router.include_router(ai.router)
