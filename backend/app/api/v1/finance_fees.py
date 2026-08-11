from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from typing import List
from uuid import uuid4
from datetime import datetime

from app.db.database import get_db
from app.db.models import User, UserRole, FeeStructure, FeeTransaction, Student, Scholarship
from app.api.v1.auth import get_current_user
from pydantic import BaseModel

router = APIRouter()

class FeeStructureCreate(BaseModel):
    grade: str
    academic_year: str
    term1: float
    term2: float
    bus: float
    hostel: float
    due_date: str

class FeePaymentRequest(BaseModel):
    student_id: str
    fee_structure_id: str
    amount_paid: float
    payment_method: str

def get_finance_admin(current_user: User = Depends(get_current_user)):
    if current_user.role not in [UserRole.FINANCE, UserRole.SUPER_ADMIN, UserRole.CORRESPONDENT, UserRole.ADMIN, UserRole.PRINCIPAL]:
        raise HTTPException(status_code=403, detail="Not authorized")
    return current_user

@router.post("/structures")
async def create_fee_structures(request: FeeStructureCreate, db: AsyncSession = Depends(get_db), current_user: User = Depends(get_finance_admin)):
    # Delete existing structures for this grade and year
    existing_result = await db.execute(select(FeeStructure).where(FeeStructure.grade == request.grade, FeeStructure.academic_year == request.academic_year))
    existing = existing_result.scalars().all()
    for fs in existing:
        await db.delete(fs)
        
    due = datetime.strptime(request.due_date, "%Y-%m-%d").date() if request.due_date else None
    
    structures = []
    if request.term1 > 0:
        structures.append(FeeStructure(id=str(uuid4()), grade=request.grade, fee_type="term1", amount=request.term1, academic_year=request.academic_year, due_date=due))
    if request.term2 > 0:
        structures.append(FeeStructure(id=str(uuid4()), grade=request.grade, fee_type="term2", amount=request.term2, academic_year=request.academic_year, due_date=due))
    if request.bus > 0:
        structures.append(FeeStructure(id=str(uuid4()), grade=request.grade, fee_type="bus", amount=request.bus, academic_year=request.academic_year, due_date=due))
    if request.hostel > 0:
        structures.append(FeeStructure(id=str(uuid4()), grade=request.grade, fee_type="hostel", amount=request.hostel, academic_year=request.academic_year, due_date=due))
        
    for fs in structures:
        db.add(fs)
        
    try:
        await db.commit()
        return {"success": True, "message": f"Updated fee structures for grade {request.grade}"}
    except Exception as e:
        await db.rollback()
        raise HTTPException(status_code=500, detail="Failed to save fee structures")

@router.get("/structures/{grade}")
async def get_fee_structures(grade: str, academic_year: str = "2026-2027", db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_user)):
    fs_result = await db.execute(select(FeeStructure).where(FeeStructure.grade == grade, FeeStructure.academic_year == academic_year))
    return fs_result.scalars().all()

from app.db.models import FeePayment
from app.services.email_service import email_service

@router.get("/student/{student_id}/dues")
async def get_student_dues(student_id: str, db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_user)):
    # 1. Flexible Student Lookup by User.id, Student.id, or Student.admission_number
    student_query = select(User).where(
        (User.id == student_id) | (User.email == student_id)
    )
    user_res = await db.execute(student_query)
    target_user = user_res.scalars().first()

    student_prof = None
    if not target_user:
        # Search in Student profile table by admission_number or id
        prof_res = await db.execute(
            select(Student).where(
                (Student.id == student_id) | (Student.admission_number == student_id)
            )
        )
        student_prof = prof_res.scalars().first()
        if student_prof and student_prof.user_id:
            u_res = await db.execute(select(User).where(User.id == student_prof.user_id))
            target_user = u_res.scalars().first()

    if not target_user and not student_prof:
        raise HTTPException(status_code=404, detail="Student record not found")

    user_id = target_user.id if target_user else student_prof.user_id

    # 2. Check authorization: Students/Parents can view own/child dues, Management/Teachers can view any student dues
    if current_user.role in [UserRole.STUDENT, UserRole.PARENT]:
        if current_user.id != user_id and current_user.role == UserRole.STUDENT:
            raise HTTPException(status_code=403, detail="Forbidden: You can only view your own fee dues.")

    if not student_prof and user_id:
        p_res = await db.execute(select(Student).where(Student.user_id == user_id))
        student_prof = p_res.scalars().first()

    grade = (target_user.assigned_grade if target_user else None) or (student_prof.school_class.grade if student_prof and student_prof.school_class else "10-A")

    fee_structures_result = await db.execute(select(FeeStructure).where(FeeStructure.grade == grade))
    fee_structures = fee_structures_result.scalars().all()

    # Fallback to standard 10-A structures if grade specific structure hasn't been initialized
    if not fee_structures:
        fallback_res = await db.execute(select(FeeStructure).where(FeeStructure.grade == "10-A"))
        fee_structures = fallback_res.scalars().all()

    dues = []
    for fs in fee_structures:
        if fs.fee_type == 'bus' and (not student_prof or not student_prof.is_bus_user):
            continue
        if fs.fee_type == 'hostel' and (not student_prof or not student_prof.is_hostel_user):
            continue

        transactions_result = await db.execute(
            select(FeeTransaction)
            .where(FeeTransaction.student_id == user_id, FeeTransaction.fee_structure_id == fs.id)
        )
        transactions = transactions_result.scalars().all()
        total_paid = sum(float(tx.amount_paid) for tx in transactions)

        # Scholarship discount on term1
        discount = 0.0
        if fs.fee_type == 'term1':
            schol_res = await db.execute(select(Scholarship).where(Scholarship.student_id == user_id, Scholarship.is_active == True))
            scholars = schol_res.scalars().all()
            discount = sum(float(s.discount_amount) for s in scholars)

        final_amount = max(0, float(fs.amount) - discount)
        balance = final_amount - total_paid

        dues.append({
            "fee_structure_id": fs.id,
            "fee_type": fs.fee_type,
            "title": f"Grade {grade} - {fs.fee_type.replace('_', ' ').title()}",
            "total_amount": float(fs.amount),
            "discount_applied": discount,
            "final_amount": final_amount,
            "total_paid": total_paid,
            "balance": max(0.0, balance),
            "due_date": fs.due_date
        })

    return dues

@router.post("/pay")
async def process_payment(request: FeePaymentRequest, db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_user)):
    student_result = await db.execute(select(User).where(User.id == request.student_id))
    student = student_result.scalars().first()
    if not student:
        raise HTTPException(status_code=404, detail="Student user record not found")

    fs_result = await db.execute(select(FeeStructure).where(FeeStructure.id == request.fee_structure_id))
    fs = fs_result.scalars().first()
    if not fs:
        raise HTTPException(status_code=404, detail="Fee structure not found")

    receipt_no = f"RCPT-{datetime.utcnow().strftime('%Y%m%d%H%M%S')}-{str(uuid4())[:4]}"
    txn_id = f"TXN-{str(uuid4())[:8].upper()}"

    # 1. Record FeeTransaction for ledger dues deduction
    transaction = FeeTransaction(
        id=str(uuid4()),
        student_id=request.student_id,
        fee_structure_id=request.fee_structure_id,
        amount_paid=request.amount_paid,
        payment_method=request.payment_method,
        receipt_number=receipt_no,
        processed_by=current_user.id
    )
    db.add(transaction)

    # 2. Record FeePayment receipt record for unified receipts log
    payment = FeePayment(
        id=str(uuid4()),
        student_id=request.student_id,
        title=f"Grade {fs.grade} - {fs.fee_type.replace('_', ' ').title()}",
        amount=request.amount_paid,
        payment_method=request.payment_method,
        transaction_id=txn_id,
        receipt_number=receipt_no,
        status="paid"
    )
    db.add(payment)

    try:
        await db.commit()
        await db.refresh(transaction)

        # Dispatch email intimation
        if student.email:
            await email_service.dispatch_email(
                db=db,
                recipient_email=student.email,
                subject=f"Fee Payment Receipt — {receipt_no}",
                body_summary=f"Fee payment of ₹{request.amount_paid:.2f} for '{payment.title}' processed via {request.payment_method}. Receipt: {receipt_no}",
                event_type="fee_payment",
                related_id=payment.id
            )

        return {
            "success": True,
            "receipt_number": receipt_no,
            "transaction_id": txn_id,
            "amount_paid": float(transaction.amount_paid)
        }
    except Exception as e:
        await db.rollback()
        raise HTTPException(status_code=500, detail="Failed to process fee payment")

