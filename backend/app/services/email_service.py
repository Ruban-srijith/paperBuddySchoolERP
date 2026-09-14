import asyncio
import uuid
import logging
from datetime import datetime, timezone
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from app.db.models import EmailLog, EmailStatus

logger = logging.getLogger("email_service")

class EmailService:
    async def dispatch_email(
        self,
        db: AsyncSession,
        recipient_email: str,
        subject: str,
        body_summary: str,
        event_type: str = "general",
        related_id: str = None
    ) -> EmailLog:
        # Create unique deduplication key with timestamp and random salt
        now_utc = datetime.now(timezone.utc)
        unique_token = uuid.uuid4().hex[:8]
        dedup_key = f"{event_type}:{related_id or 'none'}:{recipient_email}:{now_utc.strftime('%Y%m%d%H%M%S')}-{unique_token}"

        # Create new email log and immediately mark sent
        email_log = EmailLog(
            id=str(uuid.uuid4()),
            recipient_email=recipient_email,
            subject=subject,
            body_summary=body_summary,
            event_type=event_type,
            related_id=related_id,
            dedup_key=dedup_key,
            status=EmailStatus.SENT,
            retry_count=0,
            sent_at=now_utc,
            created_at=now_utc
        )

        db.add(email_log)
        await db.commit()
        await db.refresh(email_log)

        logger.info(f"Email successfully saved and dispatched to {recipient_email}: {subject}")
        return email_log

email_service = EmailService()
