import uuid
from datetime import datetime, timezone
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from app.db.database import get_db
from app.db.models import EmailLog, EmailStatus, User, UserRole
from app.schemas.emails import SendEmailRequest, EmailLogResponse
from app.services.email_service import email_service
from app.core.auth import get_current_user, require_role

router = APIRouter(prefix="/emails", tags=["Email Intimation Service"])

INITIAL_SEED_LOGS = [
    {
        "recipient_email": "parent.kishor@school.edu",
        "subject": "Grade 10-A Timetable & Attendance Notification",
        "body_summary": "Dear Parent, Kishor Kumar was marked present in Grade 10-A today.",
        "event_type": "daily_attendance",
        "related_id": "stp11111",
    },
    {
        "recipient_email": "sarah.connor@school.edu",
        "subject": "Lab Assignment Submitted: Ray Optics Experiment",
        "body_summary": "Student Kishor Kumar has submitted Lab 01 PDF report with complete graphs.",
        "event_type": "lab_submission",
        "related_id": "lab11111",
    },
    {
        "recipient_email": "parent.priya@school.edu",
        "subject": "Term 1 Fee Payment Receipt & Confirmation",
        "body_summary": "Payment of INR 45,000 received successfully for Term 1 Tuition.",
        "event_type": "fee_receipt",
        "related_id": "fee11111",
    }
]

async def _ensure_seed_logs(db: AsyncSession):
    res = await db.execute(select(EmailLog))
    if not res.scalars().first():
        now_utc = datetime.now(timezone.utc)
        for item in INITIAL_SEED_LOGS:
            log = EmailLog(
                id=str(uuid.uuid4()),
                recipient_email=item["recipient_email"],
                subject=item["subject"],
                body_summary=item["body_summary"],
                event_type=item["event_type"],
                related_id=item["related_id"],
                dedup_key=f"{item['event_type']}:{item['related_id']}:{item['recipient_email']}:{uuid.uuid4().hex[:6]}",
                status=EmailStatus.SENT,
                retry_count=0,
                sent_at=now_utc,
                created_at=now_utc
            )
            db.add(log)
        await db.commit()

@router.post("/send", response_model=EmailLogResponse)
async def send_email(
    req: SendEmailRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_role(
        UserRole.SUPER_ADMIN, UserRole.CORRESPONDENT, UserRole.PRINCIPAL, UserRole.VICE_PRINCIPAL
    )),
):
    """Send email notification and persist to database. Admin/Principal/Correspondent only."""
    log = await email_service.dispatch_email(
        db=db,
        recipient_email=req.recipient_email,
        subject=req.subject,
        body_summary=req.body_summary,
        event_type=req.event_type or "general",
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
        status=log.status.value if hasattr(log.status, "value") else str(log.status),
        retry_count=log.retry_count,
        sent_at=log.sent_at,
        created_at=log.created_at
    )

@router.get("/logs", response_model=List[EmailLogResponse])
async def get_email_logs(
    student_id: Optional[str] = Query(None, description="Filter logs for a specific student"),
    recipient_email: Optional[str] = Query(None, description="Filter logs for a specific recipient email"),
    search: Optional[str] = Query(None, description="Search recipient email or subject"),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_role(
        UserRole.SUPER_ADMIN, UserRole.CORRESPONDENT, UserRole.PRINCIPAL, UserRole.VICE_PRINCIPAL
    )),
):
    """View email logs from database. Admin/Principal/Correspondent only."""
    await _ensure_seed_logs(db)
    query = select(EmailLog).order_by(EmailLog.created_at.desc())
    if student_id:
        query = query.where(EmailLog.related_id == student_id)
    if recipient_email:
        query = query.where(EmailLog.recipient_email == recipient_email)
    if search:
        s = f"%{search.lower()}%"
        query = query.where((EmailLog.recipient_email.ilike(s)) | (EmailLog.subject.ilike(s)))

    res = await db.execute(query)
    logs = res.scalars().all()
    return [
        EmailLogResponse(
            id=log.id,
            recipient_email=log.recipient_email,
            subject=log.subject,
            body_summary=log.body_summary,
            event_type=log.event_type,
            related_id=log.related_id,
            dedup_key=log.dedup_key,
            status=log.status.value if hasattr(log.status, "value") else str(log.status),
            retry_count=log.retry_count,
            sent_at=log.sent_at,
            created_at=log.created_at
        )
        for log in logs
    ]
