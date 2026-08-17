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

from app.db.models import FeePayment, ParentStudentMap
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

    # If queried entity is a Parent, resolve to their child student
    if target_user and target_user.role == UserRole.PARENT:
        ps_res = await db.execute(select(ParentStudentMap).where(ParentStudentMap.parent_id == target_user.id))
        ps = ps_res.scalars().first()
        if ps:
            child_res = await db.execute(select(User).where(User.id == ps.student_id))
            child_user = child_res.scalars().first()
            if child_user:
                target_user = child_user
                user_id = target_user.id
                student_prof = None
        else:
            user_id = target_user.id
    else:
        user_id = target_user.id if target_user else (student_prof.user_id if student_prof else None)

    if not target_user and not student_prof:
        raise HTTPException(status_code=404, detail="Student record not found")

    # 2. Check authorization: Students/Parents can view own/child dues, Management/Teachers can view any student dues
    if current_user.role == UserRole.STUDENT and current_user.id != user_id:
        raise HTTPException(status_code=403, detail="Forbidden: You can only view your own fee dues.")

    if not student_prof and user_id:
        p_res = await db.execute(select(Student).where(Student.user_id == user_id))
        student_prof = p_res.scalars().first()

    raw_grade = (target_user.assigned_grade if target_user else None) or (student_prof.school_class.grade if student_prof and student_prof.school_class else "10")
    clean_grade = raw_grade.replace("Grade ", "").strip()
    base_grade = clean_grade.split("-")[0] if "-" in clean_grade else clean_grade

    # Match exact or base grade (e.g., "10-A", "10", "Grade 10")
    fee_structures_result = await db.execute(
        select(FeeStructure).where(FeeStructure.grade.in_([clean_grade, base_grade, f"Grade {base_grade}", "10-A", "10"]))
    )
    fee_structures = fee_structures_result.scalars().all()

    # Deduplicate fee_structures by fee_type
    seen_types = set()
    deduped_structures = []
    for fs in fee_structures:
        if fs.fee_type not in seen_types:
            seen_types.add(fs.fee_type)
            deduped_structures.append(fs)
    fee_structures = deduped_structures

    # Auto-initialize standard structures if completely empty
    if not fee_structures:
        default_defs = [
            ("term1", 45000.0),
            ("term2", 40000.0),
            ("bus", 12000.0),
            ("hostel", 65000.0)
        ]
        created_structures = []
        for ftype, amt in default_defs:
            new_fs = FeeStructure(
                id=str(uuid4()),
                grade=clean_grade or "10",
                fee_type=ftype,
                amount=amt,
                academic_year="2026-2027",
                due_date=datetime(2026, 12, 31).date()
            )
            db.add(new_fs)
            created_structures.append(new_fs)
        try:
            await db.commit()
            fee_structures = created_structures
        except Exception:
            await db.rollback()

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

        final_amount = max(0.0, float(fs.amount) - discount)
        balance = max(0.0, final_amount - total_paid)

        dues.append({
            "fee_structure_id": fs.id,
            "fee_type": fs.fee_type,
            "title": f"Grade {clean_grade} - {fs.fee_type.replace('_', ' ').title()} Fee",
            "total_amount": float(fs.amount),
            "discount_applied": discount,
            "final_amount": final_amount,
            "total_paid": total_paid,
            "balance": round(balance, 2),
            "status": "Paid" if balance <= 0 else "Pending",
            "due_date": str(fs.due_date) if fs.due_date else "2026-12-31"
        })

    return dues

@router.post("/pay")
async def process_payment(request: FeePaymentRequest, db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_user)):
    student_result = await db.execute(select(User).where(User.id == request.student_id))
    student = student_result.scalars().first()
    if not student:
        raise HTTPException(status_code=404, detail="Student user record not found")

    # If student is parent, resolve to child
    if student.role == UserRole.PARENT:
        ps_res = await db.execute(select(ParentStudentMap).where(ParentStudentMap.parent_id == student.id))
        ps = ps_res.scalars().first()
        if ps:
            ch_res = await db.execute(select(User).where(User.id == ps.student_id))
            student = ch_res.scalars().first() or student

    fs_result = await db.execute(select(FeeStructure).where(FeeStructure.id == request.fee_structure_id))
    fs = fs_result.scalars().first()
    if not fs:
        raise HTTPException(status_code=404, detail="Fee structure not found")

    # Check if already fully paid
    tx_res = await db.execute(select(FeeTransaction).where(FeeTransaction.student_id == student.id, FeeTransaction.fee_structure_id == fs.id))
    existing_txs = tx_res.scalars().all()
    already_paid = sum(float(tx.amount_paid) for tx in existing_txs)
    remaining_balance = max(0.0, float(fs.amount) - already_paid)

    if remaining_balance <= 0:
        raise HTTPException(status_code=400, detail="This fee item is already fully settled.")

    receipt_no = f"RCPT-{datetime.utcnow().strftime('%Y%m%d%H%M%S')}-{str(uuid4())[:4]}"
    txn_id = f"TXN-{str(uuid4())[:8].upper()}"

    # 1. Record FeeTransaction for ledger dues deduction
    transaction = FeeTransaction(
        id=str(uuid4()),
        student_id=student.id,
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
        student_id=student.id,
        title=f"Grade {fs.grade} - {fs.fee_type.replace('_', ' ').title()} Fee",
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

