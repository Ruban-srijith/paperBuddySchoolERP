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
    return result.scalars().all()

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

@router.get("/issues")
async def get_issues(db: AsyncSession = Depends(get_db), current_user: User = Depends(get_librarian_or_above)):
    result = await db.execute(select(BookIssue).order_by(BookIssue.issue_date.desc()))
    return result.scalars().all()

# --- Endpoints: Book Requests ---

@router.get("/requests")
async def get_requests(db: AsyncSession = Depends(get_db), current_user: User = Depends(get_librarian_or_above)):
    result = await db.execute(select(BookRequest).order_by(BookRequest.created_at.desc()))
    return result.scalars().all()

# --- Endpoints: Digital Resources ---

@router.get("/digital")
async def get_digital_resources(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(DigitalResource).order_by(DigitalResource.created_at.desc()))
    return result.scalars().all()
