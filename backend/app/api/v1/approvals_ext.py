"""
Approvals Extension API router for Superadmin & Admin workflows:
- Salary Approvals (Superadmin)
- Major Event Approvals (Superadmin)
- Pending Approvals Summary (Admin)
"""
import uuid
from datetime import date, datetime
from typing import Optional, List
from pydantic import BaseModel
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy.orm import selectinload

from app.db.database import get_db
from app.db.models import SalaryRecord, SchoolEventProposal, LeaveRequest, TeacherSubstitution, User, UserRole
from app.core.auth import get_current_user, require_role

router = APIRouter(prefix="/approvals-ext", tags=["Approvals & Governance Extensions"])


class SalaryDecisionRequest(BaseModel):
    status: str  # "approved" or "rejected"
    remarks: Optional[str] = None


class EventDecisionRequest(BaseModel):
    status: str  # "approved" or "rejected"
    feedback: Optional[str] = None


class EventProposalCreate(BaseModel):
    title: str
    description: str
    target_grades: str = "all"
    start_date: date
    end_date: date
    budget: float = 0.0


# ═════════════════════════════════════════════════════════════
# 1. SALARY APPROVALS (SUPERADMIN / CORRESPONDENT)
# ═════════════════════════════════════════════════════════════

@router.get("/salaries")
async def list_salary_records(
    month: Optional[str] = None,
    year: Optional[int] = None,
    status_filter: Optional[str] = None,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_role(UserRole.SUPER_ADMIN, UserRole.CORRESPONDENT, UserRole.ADMIN)),
):
    """List staff salary payout records for Superadmin review."""
    query = select(SalaryRecord).options(
        selectinload(SalaryRecord.staff).selectinload(User.department),
        selectinload(SalaryRecord.approved_by)
    )

    if month:
        query = query.where(SalaryRecord.month == month)
    if year:
        query = query.where(SalaryRecord.year == year)
    if status_filter:
        query = query.where(SalaryRecord.status == status_filter)

    query = query.order_by(SalaryRecord.created_at.desc())
    res = await db.execute(query)
    records = res.scalars().all()

    return [
        {
            "id": r.id,
            "staff_id": r.staff_id,
            "staff_name": r.staff.full_name if r.staff else "Staff Member",
            "staff_email": r.staff.email if r.staff else "",
            "department": r.staff.department.name if (r.staff and r.staff.department) else "Academics",
            "role": r.staff.role.value if r.staff else "staff",
            "month": r.month,
            "year": r.year,
            "base_salary": float(r.base_salary),
            "allowances": float(r.allowances or 0),
            "deductions": float(r.deductions or 0),
            "net_salary": float(r.net_salary),
            "status": r.status,
            "remarks": r.remarks,
            "approved_by": r.approved_by.full_name if r.approved_by else None,
            "created_at": r.created_at.isoformat() if r.created_at else None,
        }
        for r in records
    ]


@router.post("/salaries/{record_id}/decision")
async def decide_salary_record(
    record_id: str,
    req: SalaryDecisionRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_role(UserRole.SUPER_ADMIN, UserRole.CORRESPONDENT)),
):
    """Superadmin approves or rejects a salary payout."""
    res = await db.execute(select(SalaryRecord).where(SalaryRecord.id == record_id))
    record = res.scalars().first()

    if not record:
        raise HTTPException(status_code=404, detail="Salary record not found")

    if req.status not in ["approved", "rejected"]:
        raise HTTPException(status_code=400, detail="Status must be 'approved' or 'rejected'")

    record.status = req.status
    record.approved_by_id = current_user.id
    if req.remarks is not None:
        record.remarks = req.remarks

    await db.commit()
    return {
        "status": "success",
        "message": f"Salary payout for {record.month} {record.year} marked as {req.status}",
    }


# ═════════════════════════════════════════════════════════════
# 2. MAJOR EVENT APPROVALS (SUPERADMIN / CORRESPONDENT)
# ═════════════════════════════════════════════════════════════

@router.get("/events")
async def list_event_proposals(
    status_filter: Optional[str] = None,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """List major school event proposals."""
    query = select(SchoolEventProposal).options(
        selectinload(SchoolEventProposal.organizer),
        selectinload(SchoolEventProposal.approved_by)
    )

    if status_filter:
        query = query.where(SchoolEventProposal.status == status_filter)

    query = query.order_by(SchoolEventProposal.created_at.desc())
    res = await db.execute(query)
    proposals = res.scalars().all()

    return [
        {
            "id": p.id,
            "title": p.title,
            "description": p.description,
            "organizer_name": p.organizer.full_name if p.organizer else "Staff",
            "target_grades": p.target_grades,
            "start_date": str(p.start_date),
            "end_date": str(p.end_date),
            "budget": float(p.budget or 0),
            "status": p.status,
            "feedback": p.feedback,
            "approved_by": p.approved_by.full_name if p.approved_by else None,
            "created_at": p.created_at.isoformat() if p.created_at else None,
        }
        for p in proposals
    ]


@router.post("/events")
async def create_event_proposal(
    req: EventProposalCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Submit a major school event proposal."""
    proposal = SchoolEventProposal(
        id=str(uuid.uuid4()),
        title=req.title,
        description=req.description,
        organizer_id=current_user.id,
        target_grades=req.target_grades,
        start_date=req.start_date,
        end_date=req.end_date,
        budget=req.budget,
        status="pending",
    )
    db.add(proposal)
    await db.commit()
    return {"status": "success", "message": f"Event proposal '{req.title}' submitted for approval"}


@router.post("/events/{event_id}/decision")
async def decide_event_proposal(
    event_id: str,
    req: EventDecisionRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_role(UserRole.SUPER_ADMIN, UserRole.CORRESPONDENT, UserRole.ADMIN)),
):
    """Superadmin / Admin approves or rejects major event proposal."""
    res = await db.execute(select(SchoolEventProposal).where(SchoolEventProposal.id == event_id))
    proposal = res.scalars().first()

    if not proposal:
        raise HTTPException(status_code=404, detail="Event proposal not found")

    proposal.status = req.status
    proposal.approved_by_id = current_user.id
    if req.feedback:
        proposal.feedback = req.feedback

    await db.commit()
    return {"status": "success", "message": f"Event proposal '{proposal.title}' marked as {req.status}"}


# ═════════════════════════════════════════════════════════════
# 3. PENDING APPROVALS CONSOLIDATED SUMMARY (ADMIN / PRINCIPAL)
# ═════════════════════════════════════════════════════════════

@router.get("/pending-summary")
async def get_pending_approvals_summary(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_role(UserRole.ADMIN, UserRole.PRINCIPAL, UserRole.SUPER_ADMIN)),
):
    """Consolidated view of all items awaiting Admin / Principal action."""
    # Pending leaves
    leaves_res = await db.execute(
        select(LeaveRequest)
        .options(selectinload(LeaveRequest.user))
        .where(LeaveRequest.status == "pending")
    )
    pending_leaves = leaves_res.scalars().all()

    # Pending events
    events_res = await db.execute(
        select(SchoolEventProposal)
        .options(selectinload(SchoolEventProposal.organizer))
        .where(SchoolEventProposal.status == "pending")
    )
    pending_events = events_res.scalars().all()

    # Pending salaries (for correspondent/admin overview)
    salaries_res = await db.execute(
        select(SalaryRecord)
        .options(selectinload(SalaryRecord.staff))
        .where(SalaryRecord.status == "pending")
    )
    pending_salaries = salaries_res.scalars().all()

    return {
        "total_pending_count": len(pending_leaves) + len(pending_events) + len(pending_salaries),
        "leaves": [
            {
                "id": l.id,
                "type": "Leave Request",
                "applicant_name": l.user.full_name if l.user else "User",
                "role": l.user.role.value if l.user else "staff",
                "start_date": str(l.start_date),
                "end_date": str(l.end_date),
                "reason": l.reason,
                "created_at": l.created_at.isoformat() if l.created_at else None,
            }
            for l in pending_leaves
        ],
        "events": [
            {
                "id": e.id,
                "type": "Major Event Proposal",
                "title": e.title,
                "organizer": e.organizer.full_name if e.organizer else "Staff",
                "budget": float(e.budget or 0),
                "start_date": str(e.start_date),
                "created_at": e.created_at.isoformat() if e.created_at else None,
            }
            for e in pending_events
        ],
        "salaries": [
            {
                "id": s.id,
                "type": "Salary Payout",
                "staff_name": s.staff.full_name if s.staff else "Staff",
                "month": s.month,
                "year": s.year,
                "amount": float(s.net_salary),
                "created_at": s.created_at.isoformat() if s.created_at else None,
            }
            for s in pending_salaries
        ],
    }
