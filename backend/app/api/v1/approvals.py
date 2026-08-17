import uuid
from typing import List
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy.orm import selectinload
from app.db.database import get_db
from app.db.models import User, UserRole, LeaveRequest
from app.schemas.approvals import LeaveRequestCreate, LeaveApprovalAction, LeaveRequestResponse
from app.core.auth import get_current_user, require_role

router = APIRouter(prefix="/approvals", tags=["Leave & Approval Workflows"])


@router.post("/leave", response_model=LeaveRequestResponse)
async def submit_leave_request(
    req: LeaveRequestCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Submit a staff leave application."""
    leave = LeaveRequest(
        id=str(uuid.uuid4()),
        applicant_id=current_user.id,
        leave_type=req.leave_type,
        start_date=req.start_date,
        end_date=req.end_date,
        reason=req.reason,
        status="pending",
    )
    db.add(leave)
    await db.commit()
    await db.refresh(leave)

    return LeaveRequestResponse(
        id=leave.id,
        applicant_id=leave.applicant_id,
        applicant_name=current_user.full_name,
        applicant_role=current_user.role.value,
        leave_type=leave.leave_type,
        start_date=leave.start_date,
        end_date=leave.end_date,
        reason=leave.reason,
        status=leave.status,
        approved_by_name=None,
        created_at=leave.created_at,
    )


@router.get("", response_model=List[LeaveRequestResponse])
@router.get("/", response_model=List[LeaveRequestResponse])
@router.get("/pending", response_model=List[LeaveRequestResponse])
@router.get("/leave", response_model=List[LeaveRequestResponse])
async def list_leave_requests(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """List staff leave requests. Principals/Correspondents see all; staff see their own."""
    query = select(LeaveRequest).options(
        selectinload(LeaveRequest.applicant),
        selectinload(LeaveRequest.approver)
    ).order_by(LeaveRequest.created_at.desc())

    if current_user.role not in [UserRole.SUPER_ADMIN, UserRole.CORRESPONDENT, UserRole.ADMIN, UserRole.PRINCIPAL]:
        query = query.where(LeaveRequest.applicant_id == current_user.id)

    res = await db.execute(query)
    leaves = res.scalars().all()

    return [
        LeaveRequestResponse(
            id=l.id,
            applicant_id=l.applicant_id,
            applicant_name=l.applicant.full_name if l.applicant else "Staff",
            applicant_role=l.applicant.role.value if l.applicant else "teacher",
            leave_type=l.leave_type,
            start_date=l.start_date,
            end_date=l.end_date,
            reason=l.reason,
            status=l.status,
            approved_by_name=l.approver.full_name if l.approver else None,
            created_at=l.created_at,
        )
        for l in leaves
    ]


@router.post("/leave/{request_id}", response_model=LeaveRequestResponse)
async def process_leave_approval(
    request_id: str,
    action: LeaveApprovalAction,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_role(
        UserRole.SUPER_ADMIN, UserRole.CORRESPONDENT, UserRole.ADMIN, UserRole.PRINCIPAL
    )),
):
    """Approve or Reject a staff leave request (Principal / Correspondent / Admin)."""
    res = await db.execute(
        select(LeaveRequest)
        .options(selectinload(LeaveRequest.applicant), selectinload(LeaveRequest.approver))
        .where(LeaveRequest.id == request_id)
    )
    leave = res.scalars().first()

    if not leave:
        raise HTTPException(status_code=404, detail="Leave request not found")

    leave.status = action.status.lower()
    leave.approved_by = current_user.id
    await db.commit()
    await db.refresh(leave)

    return LeaveRequestResponse(
        id=leave.id,
        applicant_id=leave.applicant_id,
        applicant_name=leave.applicant.full_name if leave.applicant else "Staff",
        applicant_role=leave.applicant.role.value if leave.applicant else "teacher",
        leave_type=leave.leave_type,
        start_date=leave.start_date,
        end_date=leave.end_date,
        reason=leave.reason,
        status=leave.status,
        approved_by_name=current_user.full_name,
        created_at=leave.created_at,
    )
