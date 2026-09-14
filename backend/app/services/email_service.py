import asyncio
import uuid
import logging
from datetime import datetime
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
        # Create unique deduplication key
        dedup_key = f"{event_type}:{related_id or 'none'}:{recipient_email}"

        # Check if email with dedup_key already exists
        query = select(EmailLog).where(EmailLog.dedup_key == dedup_key)
        res = await db.execute(query)
        existing = res.scalars().first()

        if existing:
            logger.info(f"Duplicate email attempt suppressed for key: {dedup_key}")
            return existing

        # Create new queued email log
        email_log = EmailLog(
            id=str(uuid.uuid4()),
            recipient_email=recipient_email,
            subject=subject,
            body_summary=body_summary,
            event_type=event_type,
            related_id=related_id,
            dedup_key=dedup_key,
            status=EmailStatus.QUEUED,
            retry_count=0
        )

        db.add(email_log)
        await db.commit()
        await db.refresh(email_log)

        # Background task simulation (sending via async SMTP)
        asyncio.create_task(self._simulate_smtp_send(email_log.id))

        return email_log

    async def _simulate_smtp_send(self, email_log_id: str):
        await asyncio.sleep(0.5) # Simulate SMTP latency
        from app.db.database import AsyncSessionLocal

        async with AsyncSessionLocal() as session:
            try:
                res = await session.execute(select(EmailLog).where(EmailLog.id == email_log_id))
                log = res.scalars().first()
                if log:
                    log.status = EmailStatus.SENT
                    log.sent_at = datetime.utcnow()
                    await session.commit()
            except Exception as e:
                logger.error(f"Error sending email {email_log_id}: {str(e)}")

email_service = EmailService()
