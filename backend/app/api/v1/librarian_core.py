from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from typing import List
from uuid import uuid4
from datetime import datetime, date

from app.db.database import get_db
from app.db.models import User, UserRole, Book, BookIssue, BookRequest, DigitalResource
from app.api.v1.auth import get_current_user
from pydantic import BaseModel

router = APIRouter()

# --- Dependencies ---

def get_librarian_or_above(current_user: User = Depends(get_current_user)):
    if current_user.role not in [UserRole.LIBRARIAN, UserRole.SUPER_ADMIN, UserRole.CORRESPONDENT, UserRole.PRINCIPAL]:
        raise HTTPException(status_code=403, detail="Not authorized")
    return current_user

# --- Endpoints: Books (Inventory) ---

class BookCreate(BaseModel):
    title: str
    author: str
    isbn: str = None
    category: str = None
    total_copies: int = 1
    is_digital: bool = False
    digital_url: str = None

@router.get("/books")
async def get_books(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Book))
    books = result.scalars().all()
    if not books:
        sample_books = [
            Book(
                id=str(uuid4()),
                title="Concepts of Physics (Vol 1 & 2)",
                author="Dr. H. C. Verma",
                isbn="978-8177091878",
                category="Physics",
                total_copies=15,
                available_copies=12,
                is_digital=True,
                digital_url="/library/digital/hc_verma_physics.pdf"
            ),
            Book(
                id=str(uuid4()),
                title="Introduction to Algorithms (CLRS 4th Edition)",
                author="Thomas H. Cormen, Charles E. Leiserson",
                isbn="978-0262046305",
                category="Computer Science",
                total_copies=10,
                available_copies=8,
                is_digital=True,
                digital_url="/library/digital/clrs_algorithms.pdf"
            ),
            Book(
                id=str(uuid4()),
                title="Organic Chemistry: Structure and Function",
                author="K. Peter C. Vollhardt",
                isbn="978-1319079451",
                category="Chemistry",
                total_copies=12,
                available_copies=10,
                is_digital=False,
                digital_url=None
            ),
            Book(
                id=str(uuid4()),
                title="Higher Algebra & Calculus Masterclass",
                author="Hall & Knight / I. A. Maron",
                isbn="978-9351762560",
                category="Mathematics",
                total_copies=20,
                available_copies=17,
                is_digital=True,
                digital_url="/library/digital/higher_algebra.pdf"
            )
        ]
        for b in sample_books:
            db.add(b)
        try:
            await db.commit()
            books = sample_books
        except Exception:
            await db.rollback()
    return books

@router.post("/books")
async def add_book(req: BookCreate, db: AsyncSession = Depends(get_db), current_user: User = Depends(get_librarian_or_above)):
    book = Book(
        id=str(uuid4()),
        title=req.title,
        author=req.author,
        isbn=req.isbn,
        category=req.category,
        total_copies=req.total_copies,
        available_copies=req.total_copies,
        is_digital=req.is_digital,
        digital_url=req.digital_url
    )
    db.add(book)
    await db.commit()
    return {"success": True}

# --- Endpoints: Book Issues ---

from pydantic import BaseModel
from datetime import timedelta

class IssueCreate(BaseModel):
    book_id: str
    user_id: str
    due_date: date

@router.get("/issues")
async def get_issues(db: AsyncSession = Depends(get_db), current_user: User = Depends(get_librarian_or_above)):
    result = await db.execute(select(BookIssue).order_by(BookIssue.issue_date.desc()))
    return result.scalars().all()

@router.post("/issues")
async def issue_book(req: IssueCreate, db: AsyncSession = Depends(get_db), current_user: User = Depends(get_librarian_or_above)):
    # Verify book exists and has available copies
    book_res = await db.execute(select(Book).where(Book.id == req.book_id))
    book = book_res.scalars().first()
    if not book or book.available_copies <= 0:
        raise HTTPException(status_code=400, detail="Book not available")

    issue = BookIssue(
        id=str(uuid4()),
        book_id=req.book_id,
        user_id=req.user_id,
        due_date=datetime.combine(req.due_date, datetime.min.time(), tzinfo=timezone.utc),
        status="issued"
    )
    book.available_copies -= 1
    db.add(issue)
    await db.commit()
    return {"success": True}

@router.put("/issues/{issue_id}/return")
async def return_book(issue_id: str, db: AsyncSession = Depends(get_db), current_user: User = Depends(get_librarian_or_above)):
    res = await db.execute(select(BookIssue).where(BookIssue.id == issue_id))
    issue = res.scalars().first()
    if not issue or issue.status == "returned":
        raise HTTPException(status_code=400, detail="Issue not found or already returned")
    
    issue.return_date = datetime.now(timezone.utc)
    issue.status = "returned"
    
    # Calculate fine if overdue
    if issue.return_date > issue.due_date:
        days_overdue = (issue.return_date - issue.due_date).days
        if days_overdue > 0:
            issue.fine_amount = days_overdue * 20.0 # Example fine rate

    book_res = await db.execute(select(Book).where(Book.id == issue.book_id))
    book = book_res.scalars().first()
    if book:
        book.available_copies += 1

    await db.commit()
    return {"success": True}

# --- Endpoints: Book Requests ---

@router.get("/requests")
async def get_requests(db: AsyncSession = Depends(get_db), current_user: User = Depends(get_librarian_or_above)):
    result = await db.execute(select(BookRequest).order_by(BookRequest.created_at.desc()))
    return result.scalars().all()

class RequestStatusUpdate(BaseModel):
    status: str # 'approved', 'rejected', 'Sent to Finance'

@router.put("/requests/{request_id}/status")
async def update_request_status(request_id: str, req: RequestStatusUpdate, db: AsyncSession = Depends(get_db), current_user: User = Depends(get_librarian_or_above)):
    res = await db.execute(select(BookRequest).where(BookRequest.id == request_id))
    b_req = res.scalars().first()
    if not b_req:
        raise HTTPException(status_code=404, detail="Request not found")
    b_req.status = req.status
    await db.commit()
    return {"success": True}

# --- Endpoints: Digital Resources ---

@router.get("/digital")
async def get_digital_resources(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(DigitalResource).order_by(DigitalResource.created_at.desc()))
    return result.scalars().all()

class DigitalResourceCreate(BaseModel):
    title: str
    url: str
    category: str = None

@router.post("/digital")
async def add_digital_resource(req: DigitalResourceCreate, db: AsyncSession = Depends(get_db), current_user: User = Depends(get_librarian_or_above)):
    resource = DigitalResource(
        id=str(uuid4()),
        title=req.title,
        url=req.url,
        category=req.category
    )
    db.add(resource)
    await db.commit()
    return {"success": True}
