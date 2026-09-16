from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from typing import List, Optional
from uuid import uuid4
from datetime import datetime, date

from app.db.database import get_db
from app.db.models import User, UserRole, DepartmentBudget, FinancialRequest, Vendor, Expense, Scholarship, Student
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
    contact_email: Optional[str] = None
    contact_phone: Optional[str] = None

class ExpenseCreate(BaseModel):
    department_id: Optional[str] = None
    vendor_id: Optional[str] = None
    request_id: Optional[str] = None
    title: str
    amount: float
    expense_date: Optional[date] = None

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
    budgets = result.scalars().all()
    if not budgets:
        sample_budgets = [
            DepartmentBudget(
                id=str(uuid4()),
                department_name="Academics & Examination",
                academic_year="2026-2027",
                allocated_amount=750000.0,
                utilized_amount=345000.0
            ),
            DepartmentBudget(
                id=str(uuid4()),
                department_name="Computer Science & Smart Classrooms",
                academic_year="2026-2027",
                allocated_amount=1200000.0,
                utilized_amount=680000.0
            ),
            DepartmentBudget(
                id=str(uuid4()),
                department_name="Sports & Athletics Infrastructure",
                academic_year="2026-2027",
                allocated_amount=450000.0,
                utilized_amount=185000.0
            ),
            DepartmentBudget(
                id=str(uuid4()),
                department_name="Campus Maintenance & Utilities",
                academic_year="2026-2027",
                allocated_amount=900000.0,
                utilized_amount=420000.0
            ),
            DepartmentBudget(
                id=str(uuid4()),
                department_name="Library Procurement & Journals",
                academic_year="2026-2027",
                allocated_amount=350000.0,
                utilized_amount=125000.0
            )
        ]
        for b in sample_budgets:
            db.add(b)
        try:
            await db.commit()
            budgets = sample_budgets
        except Exception:
            await db.rollback()
    return budgets

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

@router.delete("/budgets/{budget_id}")
async def delete_budget(budget_id: str, db: AsyncSession = Depends(get_db), current_user: User = Depends(get_finance_or_above)):
    res = await db.execute(select(DepartmentBudget).where(DepartmentBudget.id == budget_id))
    budget = res.scalar_one_or_none()
    if not budget:
        raise HTTPException(status_code=404, detail="Budget not found")
    await db.delete(budget)
    await db.commit()
    return {"success": True, "message": "Department budget deleted successfully"}


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
    vendors = result.scalars().all()
    if not vendors:
        sample_vendors = [
            Vendor(
                id=str(uuid4()),
                name="Sri Lakshmi Stationeries & Publications",
                category="Stationery & Books",
                contact_email="sales@srilakshmi.in",
                contact_phone="+91 98410 11223",
                active_contract=True
            ),
            Vendor(
                id=str(uuid4()),
                name="Apex Edutech Labs & Hardware",
                category="IT & Lab Equipment",
                contact_email="support@apexedutech.com",
                contact_phone="+91 94440 55667",
                active_contract=True
            ),
            Vendor(
                id=str(uuid4()),
                name="Sun Power Solar & Electricals",
                category="Maintenance & Utilities",
                contact_email="admin@sunpowersolar.in",
                contact_phone="+91 97900 12345",
                active_contract=True
            ),
            Vendor(
                id=str(uuid4()),
                name="Modern Cleaners & Facility Management",
                category="Facility Services",
                contact_email="info@modernclean.org",
                contact_phone="+91 98840 99881",
                active_contract=True
            ),
            Vendor(
                id=str(uuid4()),
                name="Kaveri Catering & Canteen Supplies",
                category="Food & Beverages",
                contact_email="canteen@kaverifoods.com",
                contact_phone="+91 94450 78901",
                active_contract=True
            )
        ]
        for v in sample_vendors:
            db.add(v)
        try:
            await db.commit()
            vendors = sample_vendors
        except Exception:
            await db.rollback()
    return vendors

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
    
    if not exps:
        # Fetch or seed a budget and vendor to link sample expenses
        b_res = await db.execute(select(DepartmentBudget))
        budgets = b_res.scalars().all()
        v_res = await db.execute(select(Vendor))
        vendors = v_res.scalars().all()
        
        sample_expenses = [
            Expense(
                id=str(uuid4()),
                department_id=budgets[1].id if len(budgets) > 1 else None,
                vendor_id=vendors[1].id if len(vendors) > 1 else None,
                title="Quarterly Smartboard Maintenance & Cloud Software Licenses",
                amount=45000.0,
                expense_date=date.today()
            ),
            Expense(
                id=str(uuid4()),
                department_id=budgets[0].id if len(budgets) > 0 else None,
                vendor_id=vendors[0].id if len(vendors) > 0 else None,
                title="Annual Mid-Term Exam Answer Sheets & Stationery Bundles",
                amount=28500.0,
                expense_date=date.today()
            ),
            Expense(
                id=str(uuid4()),
                department_id=budgets[3].id if len(budgets) > 3 else None,
                vendor_id=vendors[2].id if len(vendors) > 2 else None,
                title="Campus Solar Panel Inverter Servicing & Battery Check",
                amount=16800.0,
                expense_date=date.today()
            ),
            Expense(
                id=str(uuid4()),
                department_id=budgets[2].id if len(budgets) > 2 else None,
                vendor_id=vendors[0].id if len(vendors) > 0 else None,
                title="Annual Sports Day Medals, Trophies & Running Track Markings",
                amount=32000.0,
                expense_date=date.today()
            ),
            Expense(
                id=str(uuid4()),
                department_id=budgets[4].id if len(budgets) > 4 else None,
                vendor_id=vendors[0].id if len(vendors) > 0 else None,
                title="National Academic Journal Subscriptions & Reference Books",
                amount=14200.0,
                expense_date=date.today()
            )
        ]
        for se in sample_expenses:
            db.add(se)
        try:
            await db.commit()
            exps = sample_expenses
        except Exception:
            await db.rollback()

    data = []
    for e in exps:
        dept_name = "General / Unassigned"
        if e.department_id:
            dept_res = await db.execute(select(DepartmentBudget).where(DepartmentBudget.id == e.department_id))
            dept = dept_res.scalars().first()
            if dept:
                dept_name = dept.department_name
                
        vendor_name = "Direct / Self Procurement"
        if e.vendor_id:
            v_res = await db.execute(select(Vendor).where(Vendor.id == e.vendor_id))
            v = v_res.scalars().first()
            if v:
                vendor_name = v.name
        
        data.append({
            "id": e.id,
            "title": e.title,
            "amount": float(e.amount),
            "expense_date": e.expense_date.isoformat() if e.expense_date else str(date.today()),
            "department_id": e.department_id,
            "department_name": dept_name,
            "vendor_id": e.vendor_id,
            "vendor_name": vendor_name
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
        expense_date=req.expense_date or date.today(),
        processed_by=current_user.id
    )
    db.add(exp)
    
    # Update utilized amount on budget
    if req.department_id:
        dept_res = await db.execute(select(DepartmentBudget).where(DepartmentBudget.id == req.department_id))
        dept = dept_res.scalars().first()
        if dept:
            dept.utilized_amount = float(dept.utilized_amount or 0) + req.amount
            
    await db.commit()
    return {"success": True, "id": exp.id}

@router.delete("/expenses/{expense_id}")
async def delete_expense(expense_id: str, db: AsyncSession = Depends(get_db), current_user: User = Depends(get_finance_or_above)):
    res = await db.execute(select(Expense).where(Expense.id == expense_id))
    exp = res.scalar_one_or_none()
    if not exp:
        raise HTTPException(status_code=404, detail="Expense not found")
    
    # Optionally deduct from budget utilization
    if exp.department_id:
        dept_res = await db.execute(select(DepartmentBudget).where(DepartmentBudget.id == exp.department_id))
        dept = dept_res.scalars().first()
        if dept and dept.utilized_amount:
            dept.utilized_amount = max(0.0, float(dept.utilized_amount) - float(exp.amount))

    await db.delete(exp)
    await db.commit()
    return {"success": True, "message": "Expense record deleted"}

# --- Endpoints: Scholarships ---

@router.get("/scholarships")
async def get_scholarships(db: AsyncSession = Depends(get_db), current_user: User = Depends(get_finance_or_above)):
    result = await db.execute(select(Scholarship).where(Scholarship.is_active == True))
    scholars = result.scalars().all()
    
    data = []
    for s in scholars:
        student_name = "Unknown"
        st_res = await db.execute(select(Student).where(Student.id == s.student_id))
        st = st_res.scalars().first()
        if st and st.full_name:
            student_name = st.full_name
        else:
            u_res = await db.execute(select(User).where(User.id == s.student_id))
            u = u_res.scalars().first()
            if u and u.full_name:
                student_name = u.full_name

        data.append({
            "id": s.id,
            "student_id": s.student_id,
            "student_name": student_name,
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
