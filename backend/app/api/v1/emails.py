from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from app.db.database import get_db
from app.db.models import EmailLog, User, UserRole
from app.schemas.emails import SendEmailRequest, EmailLogResponse
from app.services.email_service import email_service
from app.core.auth import get_current_user, require_role

router = APIRouter(prefix="/emails", tags=["Email Intimation Service"])

@router.post("/send", response_model=EmailLogResponse)
async def send_email(
    req: SendEmailRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_role(
        UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.PRINCIPAL
    )),
):
    """Send email notification. Admin/Principal only."""
    log = await email_service.dispatch_email(
        db=db,
        recipient_email=req.recipient_email,
        subject=req.subject,
        body_summary=req.body_summary,
        event_type=req.event_type,
        related_id=req.related_id
    )

    return EmailLogResponse(
        id=log.id,
        recipient_email=log.recipient_email,
        subject=log.subject,
        body_summary=log.body_summary,
        event_type=log.event_type,
        related_id=log.related_id,
        dedup_key=log.dedup_key,
        status=log.status,
        retry_count=log.retry_count,
        sent_at=log.sent_at,
        created_at=log.created_at
    )

@router.get("/logs", response_model=List[EmailLogResponse])
async def get_email_logs(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_role(
        UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.PRINCIPAL
    )),
):
    """View email logs. Admin/Principal only."""
    res = await db.execute(select(EmailLog).order_by(EmailLog.created_at.desc()))
    logs = res.scalars().all()
    return logs
