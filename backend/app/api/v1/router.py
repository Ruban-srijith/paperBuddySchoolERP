from fastapi import APIRouter
from app.api.v1 import (
    auth, users, students, departments, ocr, timetable, attendance,
    portion, labs, emails, mentorship, fees, approvals, substitutions, parent, ai,
    calendar, approvals_ext, academics, mongodb_status, classes, classrooms,
    finance_fees, finance_payroll, class_teacher, finance_core, warden_core, librarian_core, scans,
    transport
)

api_router = APIRouter()

# Authentication & Core Admin Modules
api_router.include_router(auth.router)
api_router.include_router(users.router)
api_router.include_router(students.router)
api_router.include_router(departments.router)

# ERP Operations
api_router.include_router(ocr.router)
api_router.include_router(scans.router)
api_router.include_router(timetable.router)
api_router.include_router(attendance.router)

api_router.include_router(portion.router)
api_router.include_router(labs.router)
api_router.include_router(emails.router)
api_router.include_router(classrooms.router, prefix="/classrooms", tags=["classrooms"])

# Finance Operations
api_router.include_router(finance_fees.router, prefix="/finance/fees", tags=["finance_fees"])
api_router.include_router(finance_payroll.router, prefix="/finance/payroll", tags=["finance_payroll"])

# Mentorship, Fees, Approvals & Enterprise Portals
api_router.include_router(mentorship.router)
api_router.include_router(fees.router)
api_router.include_router(approvals.router)
api_router.include_router(substitutions.router)
api_router.include_router(parent.router)
api_router.include_router(ai.router)

# Multi-Role Extensions: Calendar, Governance Approvals, Academics & Workload
api_router.include_router(calendar.router)
api_router.include_router(approvals_ext.router)
api_router.include_router(academics.router)
api_router.include_router(mongodb_status.router)
api_router.include_router(classes.router)
api_router.include_router(class_teacher.router, prefix="/class-teacher", tags=["class_teacher"])
api_router.include_router(finance_core.router, prefix="/finance/core", tags=["finance_core"])
api_router.include_router(warden_core.router, prefix="/warden", tags=["Warden E-Pass Operations"])
api_router.include_router(librarian_core.router, prefix="/librarian", tags=["Librarian Operations"])
api_router.include_router(transport.router, prefix="/transport", tags=["Transport Management"])
