from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from typing import List
from uuid import uuid4
from datetime import datetime, date

from app.db.database import get_db
from app.db.models import User, UserRole, DepartmentBudget, FinancialRequest, Vendor, Expense, Scholarship
from app.api.v1.auth import get_current_user
from pydantic import BaseModel

router = APIRouter()

# --- Pydantic Models ---

class BudgetCreate(BaseModel):
    department_name: str
    academic_year: str
    allocated_amount: float

class RequestCreate(BaseModel):
    department_id: str
    title: str
    description: str
    amount: float
    priority: str

class RequestApprove(BaseModel):
    status: str # approved_by_finance, rejected

class VendorCreate(BaseModel):
    name: str
    category: str
    contact_email: str
    contact_phone: str

class ExpenseCreate(BaseModel):
    department_id: str
    vendor_id: str
    request_id: str
    title: str
    amount: float

class ScholarshipCreate(BaseModel):
    student_id: str
    name: str
    discount_amount: float

# --- Dependencies ---

def get_finance_or_above(current_user: User = Depends(get_current_user)):
    if current_user.role not in [UserRole.FINANCE, UserRole.SUPER_ADMIN, UserRole.CORRESPONDENT, UserRole.PRINCIPAL]:
        raise HTTPException(status_code=403, detail="Not authorized")
    return current_user

# --- Endpoints: Budgets ---

@router.get("/budgets")
async def get_budgets(db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_user)):
    result = await db.execute(select(DepartmentBudget))
    return result.scalars().all()

@router.post("/budgets")
async def create_budget(req: BudgetCreate, db: AsyncSession = Depends(get_db), current_user: User = Depends(get_finance_or_above)):
    budget = DepartmentBudget(
        id=str(uuid4()),
        department_name=req.department_name,
        academic_year=req.academic_year,
        allocated_amount=req.allocated_amount,
        utilized_amount=0
    )
    db.add(budget)
    await db.commit()
    return budget

# --- Endpoints: Financial Requests ---

@router.get("/requests")
async def get_requests(db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_user)):
    # Finance/Principal sees all. Others see their own.
    if current_user.role in [UserRole.FINANCE, UserRole.SUPER_ADMIN, UserRole.CORRESPONDENT, UserRole.PRINCIPAL]:
        result = await db.execute(select(FinancialRequest).order_by(FinancialRequest.created_at.desc()))
    else:
        result = await db.execute(select(FinancialRequest).where(FinancialRequest.requester_id == current_user.id).order_by(FinancialRequest.created_at.desc()))
    
    reqs = result.scalars().all()
    # attach requester names
    data = []
    for r in reqs:
        u_res = await db.execute(select(User).where(User.id == r.requester_id))
        user = u_res.scalars().first()
        dept_res = await db.execute(select(DepartmentBudget).where(DepartmentBudget.id == r.department_id))
        dept = dept_res.scalars().first()
        data.append({
            "id": r.id,
            "title": r.title,
            "description": r.description,
            "amount": r.amount,
            "status": r.status,
            "priority": r.priority,
            "created_at": r.created_at,
            "requester_name": user.full_name if user else "Unknown",
            "department_name": dept.department_name if dept else "General"
        })
    return data

@router.post("/requests")
async def create_request(req: RequestCreate, db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_user)):
    fin_req = FinancialRequest(
        id=str(uuid4()),
        requester_id=current_user.id,
        department_id=req.department_id,
        title=req.title,
        description=req.description,
        amount=req.amount,
        priority=req.priority
    )
    db.add(fin_req)
    await db.commit()
    return {"success": True, "message": "Request submitted."}

@router.put("/requests/{req_id}/approve")
async def approve_request(req_id: str, action: RequestApprove, db: AsyncSession = Depends(get_db), current_user: User = Depends(get_finance_or_above)):
    result = await db.execute(select(FinancialRequest).where(FinancialRequest.id == req_id))
    fin_req = result.scalars().first()
    if not fin_req:
        raise HTTPException(status_code=404, detail="Request not found")
        
    fin_req.status = action.status
    await db.commit()
    return {"success": True}

# --- Endpoints: Vendors ---

@router.get("/vendors")
async def get_vendors(db: AsyncSession = Depends(get_db), current_user: User = Depends(get_finance_or_above)):
    result = await db.execute(select(Vendor))
    return result.scalars().all()

@router.post("/vendors")
async def create_vendor(req: VendorCreate, db: AsyncSession = Depends(get_db), current_user: User = Depends(get_finance_or_above)):
    v = Vendor(id=str(uuid4()), **req.dict())
    db.add(v)
    await db.commit()
    return v

# --- Endpoints: Expenses ---

@router.get("/expenses")
async def get_expenses(db: AsyncSession = Depends(get_db), current_user: User = Depends(get_finance_or_above)):
    result = await db.execute(select(Expense).order_by(Expense.expense_date.desc()))
    exps = result.scalars().all()
    
    data = []
    for e in exps:
        dept_res = await db.execute(select(DepartmentBudget).where(DepartmentBudget.id == e.department_id))
        dept = dept_res.scalars().first()
        v_res = await db.execute(select(Vendor).where(Vendor.id == e.vendor_id))
        v = v_res.scalars().first()
        
        data.append({
            "id": e.id,
            "title": e.title,
            "amount": float(e.amount),
            "expense_date": e.expense_date,
            "department_name": dept.department_name if dept else "N/A",
            "vendor_name": v.name if v else "N/A"
        })
    return data

@router.post("/expenses")
async def log_expense(req: ExpenseCreate, db: AsyncSession = Depends(get_db), current_user: User = Depends(get_finance_or_above)):
    exp = Expense(
        id=str(uuid4()),
        department_id=req.department_id if req.department_id else None,
        vendor_id=req.vendor_id if req.vendor_id else None,
        request_id=req.request_id if req.request_id else None,
        title=req.title,
        amount=req.amount,
        processed_by=current_user.id
    )
    db.add(exp)
    
    # Update utilized amount on budget
    if req.department_id:
        dept_res = await db.execute(select(DepartmentBudget).where(DepartmentBudget.id == req.department_id))
        dept = dept_res.scalars().first()
        if dept:
            dept.utilized_amount = float(dept.utilized_amount) + req.amount
            
    await db.commit()
    return {"success": True}

# --- Endpoints: Scholarships ---

@router.get("/scholarships")
async def get_scholarships(db: AsyncSession = Depends(get_db), current_user: User = Depends(get_finance_or_above)):
    result = await db.execute(select(Scholarship).where(Scholarship.is_active == True))
    scholars = result.scalars().all()
    
    data = []
    for s in scholars:
        u_res = await db.execute(select(User).where(User.id == s.student_id))
        u = u_res.scalars().first()
        data.append({
            "id": s.id,
            "student_id": s.student_id,
            "student_name": u.full_name if u else "Unknown",
            "name": s.name,
            "discount_amount": float(s.discount_amount),
            "created_at": s.created_at
        })
    return data

@router.post("/scholarships")
async def assign_scholarship(req: ScholarshipCreate, db: AsyncSession = Depends(get_db), current_user: User = Depends(get_finance_or_above)):
    s = Scholarship(
        id=str(uuid4()),
        student_id=req.student_id,
        name=req.name,
        discount_amount=req.discount_amount,
        granted_by=current_user.id
    )
    db.add(s)
    await db.commit()
    return {"success": True}
