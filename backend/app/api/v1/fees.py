import uuid
from typing import List
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import JSONResponse
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy.orm import selectinload
from app.db.database import get_db
from app.db.models import User, UserRole, FeePayment
from app.schemas.fees import FeePaymentCreate, FeePaymentResponse, RazorpayOrderRequest, RazorpayOrderResponse, RazorpayVerifyRequest
from app.core.auth import get_current_user, require_role
from app.services.email_service import email_service
from app.core.config import settings
import razorpay

router = APIRouter(prefix="/fees", tags=["Fee Payment Gateway & Receipts"])

# Initialize Razorpay Client
razorpay_client = razorpay.Client(auth=(settings.RAZORPAY_KEY_ID, settings.RAZORPAY_KEY_SECRET))



from app.db.models import FeeTransaction

@router.post("/pay", response_model=FeePaymentResponse)
async def process_fee_payment(
    req: FeePaymentCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Process student fee payment, save record into fee_payments table,
    record FeeTransaction to reduce ledger dues, and trigger async email receipt notification.
    """
    txn_id = f"TXN-2026-{uuid.uuid4().hex[:8].upper()}"
    receipt_no = f"RCP-2026-{uuid.uuid4().hex[:6].upper()}"

    payment = FeePayment(
        id=str(uuid.uuid4()),
        student_id=current_user.id,
        title=req.title,
        amount=req.amount,
        payment_method=req.payment_method,
        transaction_id=txn_id,
        receipt_number=receipt_no,
        status="paid",
    )
    db.add(payment)

    if req.fee_structure_id:
        ft = FeeTransaction(
            id=str(uuid.uuid4()),
            student_id=current_user.id,
            fee_structure_id=req.fee_structure_id,
            amount_paid=req.amount,
            payment_method=req.payment_method,
            receipt_number=receipt_no,
            processed_by=current_user.id
        )
        db.add(ft)

    await db.commit()
    await db.refresh(payment)

    # Trigger Async Email Intimation with dedup key
    dedup = f"fee_payment_{payment.id}_{current_user.email}"
    await email_service.dispatch_email(
        db=db,
        recipient_email=current_user.email,
        subject=f"Fee Payment Receipt — {payment.receipt_number}",
        body_summary=f"Payment of ${float(payment.amount):.2f} for '{payment.title}' received via {payment.payment_method}. Transaction ID: {payment.transaction_id}",
        event_type="fee_payment",
        related_id=payment.id,
    )

    return FeePaymentResponse(
        id=payment.id,
        student_id=payment.student_id,
        student_name=current_user.full_name,
        title=payment.title,
        amount=float(payment.amount),
        payment_method=payment.payment_method,
        transaction_id=payment.transaction_id,
        receipt_number=payment.receipt_number,
        status=payment.status,
        created_at=payment.created_at,
    )


@router.post("/create-order", response_model=RazorpayOrderResponse)
async def create_razorpay_order(
    req: RazorpayOrderRequest,
    current_user: User = Depends(get_current_user),
):
    """
    Create a Razorpay order for fee payment.
    """
    try:
        # Amount should be in paise
        order_amount = int(req.amount * 100)
        order_currency = req.currency
        order_receipt = f"RCP-2026-{uuid.uuid4().hex[:6].upper()}"
        
        order_data = {
            "amount": order_amount,
            "currency": order_currency,
            "receipt": order_receipt,
            "payment_capture": 1
        }
        
        razorpay_order = razorpay_client.order.create(data=order_data)
        
        return RazorpayOrderResponse(
            order_id=razorpay_order["id"],
            amount=req.amount,
            currency=req.currency,
            key=settings.RAZORPAY_KEY_ID
        )
    except Exception as e:
        print(f"Error creating Razorpay order: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to create payment order")


@router.post("/verify-signature", response_model=FeePaymentResponse)
async def verify_razorpay_signature(
    req: RazorpayVerifyRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Verify the Razorpay signature and record the successful payment.
    """
    try:
        # Verify Signature
        razorpay_client.utility.verify_payment_signature({
            'razorpay_order_id': req.razorpay_order_id,
            'razorpay_payment_id': req.razorpay_payment_id,
            'razorpay_signature': req.razorpay_signature
        })
        
        # Once verified, save the payment record
        receipt_no = f"RCP-2026-{uuid.uuid4().hex[:6].upper()}"
        
        payment = FeePayment(
            id=str(uuid.uuid4()),
            student_id=current_user.id,
            title=req.title,
            amount=req.amount,
            payment_method=req.payment_method,
            transaction_id=req.razorpay_payment_id,
            receipt_number=receipt_no,
            status="paid",
        )
        db.add(payment)
        await db.commit()
        await db.refresh(payment)
        
        # Trigger Email
        dedup = f"fee_payment_{payment.id}_{current_user.email}"
        await email_service.dispatch_email(
            db=db,
            recipient_email=current_user.email,
            subject=f"Fee Payment Receipt — {payment.receipt_number}",
            body_summary=f"Payment of ₹{float(payment.amount):.2f} for '{payment.title}' received via {payment.payment_method}. Transaction ID: {payment.transaction_id}",
            event_type="fee_payment",
            related_id=payment.id,
        )
        
        return FeePaymentResponse(
            id=payment.id,
            student_id=payment.student_id,
            student_name=current_user.full_name,
            title=payment.title,
            amount=float(payment.amount),
            payment_method=payment.payment_method,
            transaction_id=payment.transaction_id,
            receipt_number=payment.receipt_number,
            status=payment.status,
            created_at=payment.created_at,
        )
        
    except razorpay.errors.SignatureVerificationError:
        raise HTTPException(status_code=400, detail="Invalid payment signature")
    except Exception as e:
        print(f"Error verifying payment: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to verify payment")


@router.get("/receipts", response_model=List[FeePaymentResponse])
async def list_fee_receipts(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    List fee payment receipts.
    Students see their own payment history; Admins/Principals see all payments.
    """
    query = select(FeePayment).options(selectinload(FeePayment.student)).order_by(FeePayment.created_at.desc())

    if current_user.role == UserRole.STUDENT:
        query = query.where(FeePayment.student_id == current_user.id)

    res = await db.execute(query)
    payments = res.scalars().all()

    return [
        FeePaymentResponse(
            id=p.id,
            student_id=p.student_id,
            student_name=p.student.full_name if p.student else "Student",
            title=p.title,
            amount=float(p.amount),
            payment_method=p.payment_method,
            transaction_id=p.transaction_id,
            receipt_number=p.receipt_number,
            status=p.status,
            created_at=p.created_at,
        )
        for p in payments
    ]


@router.get("/download/{payment_id}")
async def download_fee_receipt(
    payment_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Download printable PDF fee receipt metadata.
    """
    res = await db.execute(
        select(FeePayment).options(selectinload(FeePayment.student)).where(FeePayment.id == payment_id)
    )
    payment = res.scalars().first()

    if not payment:
        raise HTTPException(status_code=404, detail="Fee payment receipt not found")

    if current_user.role == UserRole.STUDENT and payment.student_id != current_user.id:
        raise HTTPException(status_code=403, detail="You can only download your own receipts")

    receipt_data = {
        "institution": "PaperBuddy International Academy",
        "receipt_number": payment.receipt_number,
        "transaction_id": payment.transaction_id,
        "date": payment.created_at.strftime("%Y-%m-%d %H:%M:%S UTC"),
        "student": {
            "id": payment.student_id,
            "name": payment.student.full_name if payment.student else "Student",
            "email": payment.student.email if payment.student else "",
        },
        "payment": {
            "title": payment.title,
            "amount": f"${float(payment.amount):.2f}",
            "payment_method": payment.payment_method,
            "status": payment.status.upper(),
        },
        "footer": "Official ERP System Computer Generated Receipt. No signature required.",
    }

    return JSONResponse(content=receipt_data)
