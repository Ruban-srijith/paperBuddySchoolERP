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

@router.get("/student/{student_id}/dues")
async def get_student_dues(student_id: str, db: AsyncSession = Depends(get_db), current_user: User = Depends(get_finance_admin)):
    student_result = await db.execute(select(User).where(User.id == student_id, User.role == UserRole.STUDENT))
    student = student_result.scalars().first()
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")
        
    student_prof_result = await db.execute(select(Student).where(Student.user_id == student_id))
    student_prof = student_prof_result.scalars().first()

    grade = student.assigned_grade
    if not grade:
        return []

    fee_structures_result = await db.execute(select(FeeStructure).where(FeeStructure.grade == grade))
    fee_structures = fee_structures_result.scalars().all()

    dues = []
    for fs in fee_structures:
        if fs.fee_type == 'bus' and (not student_prof or not student_prof.is_bus_user):
            continue
        if fs.fee_type == 'hostel' and (not student_prof or not student_prof.is_hostel_user):
            continue
        transactions_result = await db.execute(
            select(FeeTransaction)
            .where(FeeTransaction.student_id == student_id, FeeTransaction.fee_structure_id == fs.id)
        )
        transactions = transactions_result.scalars().all()
        total_paid = sum(float(tx.amount_paid) for tx in transactions)
        
        # Determine if this fee structure should receive the scholarship discount (apply to term1 only for simplicity)
        discount = 0.0
        if fs.fee_type == 'term1':
            schol_res = await db.execute(select(Scholarship).where(Scholarship.student_id == student_id, Scholarship.is_active == True))
            scholars = schol_res.scalars().all()
            discount = sum(float(s.discount_amount) for s in scholars)
            
        final_amount = max(0, float(fs.amount) - discount)
        balance = final_amount - total_paid

        dues.append({
            "fee_structure_id": fs.id,
            "fee_type": fs.fee_type,
            "total_amount": float(fs.amount),
            "discount_applied": discount,
            "final_amount": final_amount,
            "total_paid": total_paid,
            "balance": balance,
            "due_date": fs.due_date
        })

    return dues

@router.post("/pay")
async def process_payment(request: FeePaymentRequest, db: AsyncSession = Depends(get_db), current_user: User = Depends(get_finance_admin)):
    student_result = await db.execute(select(User).where(User.id == request.student_id))
    student = student_result.scalars().first()
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")

    fs_result = await db.execute(select(FeeStructure).where(FeeStructure.id == request.fee_structure_id))
    fs = fs_result.scalars().first()
    if not fs:
        raise HTTPException(status_code=404, detail="Fee structure not found")

    receipt_no = f"RCPT-{datetime.utcnow().strftime('%Y%m%d%H%M%S')}-{str(uuid4())[:4]}"
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
    try:
        await db.commit()
        await db.refresh(transaction)
        return {"success": True, "receipt_number": receipt_no, "amount_paid": float(transaction.amount_paid)}
    except Exception as e:
        await db.rollback()
        raise HTTPException(status_code=500, detail="Failed to process payment")
