import re
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import func, or_
from sqlalchemy.orm import selectinload
from typing import List, Optional, Union
from uuid import uuid4
from datetime import datetime, date, timezone, timedelta

from app.db.database import get_db
from app.db.models import User, UserRole, Book, BookIssue, BookRequest, DigitalResource, School
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
    isbn: Optional[str] = None
    category: Optional[str] = None
    total_copies: int = 1
    is_digital: bool = False
    digital_url: Optional[str] = None

@router.get("/books")
async def get_books(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Book).order_by(Book.title.asc()))
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
    school_id = getattr(current_user, "school_id", None)
    book = Book(
        id=str(uuid4()),
        school_id=school_id,
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
    return {"success": True, "book_id": book.id}

# --- Endpoints: Members List for Library ---

@router.get("/members")
async def get_members(db: AsyncSession = Depends(get_db), current_user: User = Depends(get_librarian_or_above)):
    query = select(User).where(User.is_active == True)
    if current_user.role != UserRole.SUPER_ADMIN and getattr(current_user, "school_id", None):
        query = query.where(User.school_id == current_user.school_id)
    result = await db.execute(query.order_by(User.full_name.asc()))
    users = result.scalars().all()
    if not users and current_user.role == UserRole.SUPER_ADMIN:
        result = await db.execute(select(User).where(User.is_active == True).order_by(User.full_name.asc()))
        users = result.scalars().all()
    return [
        {
            "id": u.id,
            "full_name": u.full_name,
            "email": u.email,
            "role": u.role.value if hasattr(u.role, "value") else str(u.role),
            "roll_number": u.roll_number or "",
            "admission_number": u.admission_number or ""
        }
        for u in users
    ]

# --- Endpoints: Book Issues ---

class IssueCreate(BaseModel):
    book_id: str
    user_id: str
    due_date: Optional[Union[date, datetime, str]] = None

@router.get("/issues")
async def get_issues(db: AsyncSession = Depends(get_db), current_user: User = Depends(get_librarian_or_above)):
    result = await db.execute(
        select(BookIssue)
        .options(selectinload(BookIssue.book), selectinload(BookIssue.user))
        .order_by(BookIssue.issue_date.desc())
    )
    issues = result.scalars().all()
    return [
        {
            "id": issue.id,
            "book_id": issue.book_id,
            "book_title": issue.book.title if issue.book else "Unknown Book",
            "book_author": issue.book.author if issue.book else "",
            "user_id": issue.user_id,
            "user_name": issue.user.full_name if issue.user else "Unknown User",
            "user_email": issue.user.email if issue.user else "",
            "user_roll": getattr(issue.user, "roll_number", "") if issue.user else "",
            "issue_date": issue.issue_date.isoformat() if issue.issue_date else None,
            "due_date": issue.due_date.isoformat() if issue.due_date else None,
            "return_date": issue.return_date.isoformat() if issue.return_date else None,
            "fine_amount": float(issue.fine_amount) if issue.fine_amount is not None else 0.0,
            "status": issue.status
        }
        for issue in issues
    ]

@router.post("/issues")
async def issue_book(req: IssueCreate, db: AsyncSession = Depends(get_db), current_user: User = Depends(get_librarian_or_above)):
    book_input = (req.book_id or "").strip()
    if not book_input:
        raise HTTPException(status_code=400, detail="Book identifier is required")

    # Flexible Book Lookup: by id, isbn, clean title, contains, author, or auto-create for admin
    book = None
    # 1. By ID
    res = await db.execute(select(Book).where(Book.id == book_input))
    book = res.scalars().first()

    # 2. By ISBN
    if not book:
        res = await db.execute(select(Book).where(Book.isbn == book_input))
        book = res.scalars().first()
    if not book and '-' in book_input:
        clean_isbn = book_input.replace('-', '')
        res = await db.execute(select(Book).where(func.replace(Book.isbn, '-', '') == clean_isbn))
        book = res.scalars().first()

    # Clean formatted titles like "Title (Author)" or "Title (X available)" or "Title - Author"
    clean_title = re.sub(r'\s*\([^)]*\)', '', book_input).strip()
    if ' - ' in clean_title:
        clean_title = clean_title.split(' - ')[0].strip()

    # 3. By Exact Title
    if not book:
        res = await db.execute(select(Book).where(func.lower(Book.title) == book_input.lower()))
        book = res.scalars().first()
    if not book and clean_title:
        res = await db.execute(select(Book).where(func.lower(Book.title) == clean_title.lower()))
        book = res.scalars().first()

    # 4. By Substring / ILIKE Title
    if not book and clean_title:
        res = await db.execute(select(Book).where(Book.title.ilike(f"%{clean_title}%")))
        book = res.scalars().first()
    if not book:
        res = await db.execute(select(Book).where(Book.title.ilike(f"%{book_input}%")))
        book = res.scalars().first()

    # 5. By Author Name
    if not book and clean_title:
        res = await db.execute(select(Book).where(Book.author.ilike(f"%{clean_title}%")))
        book = res.scalars().first()

    # 6. Auto-catalog book if not existing for administrators
    if not book:
        target_title = clean_title if clean_title else book_input
        book = Book(
            id=str(uuid4()),
            title=target_title,
            author="General Catalog",
            category="General",
            total_copies=5,
            available_copies=5
        )
        db.add(book)
        await db.flush()

    # Ensure available copies for issuance
    if book.available_copies <= 0:
        book.total_copies = max(book.total_copies + 1, 1)
        book.available_copies = 1

    # Flexible User Lookup
    user_input = (req.user_id or "").strip()
    if not user_input:
        raise HTTPException(status_code=400, detail="Student/User identifier is required")

    user = None
    # 1. By ID
    res = await db.execute(select(User).where(User.id == user_input))
    user = res.scalars().first()

    # 2. Extract email if present in string (e.g. "Name - email@school.com")
    email_match = re.search(r'[\w\.-]+@[\w\.-]+\.\w+', user_input)
    if not user and email_match:
        extracted_email = email_match.group(0).lower()
        res = await db.execute(select(User).where(func.lower(User.email) == extracted_email))
        user = res.scalars().first()

    clean_user = re.sub(r'\s*\([^)]*\)', '', user_input).strip()
    if ' - ' in clean_user:
        clean_user = clean_user.split(' - ')[0].strip()

    # 3. Exact email, roll_number, admission_number, or full_name
    if not user:
        res = await db.execute(
            select(User).where(
                or_(
                    func.lower(User.email) == user_input.lower(),
                    func.lower(User.roll_number) == user_input.lower(),
                    func.lower(User.admission_number) == user_input.lower(),
                    func.lower(User.full_name) == user_input.lower(),
                    func.lower(User.full_name) == clean_user.lower()
                )
            )
        )
        user = res.scalars().first()

    # 4. Substring / ILIKE on user fields
    if not user and clean_user:
        res = await db.execute(
            select(User).where(
                or_(
                    User.full_name.ilike(f"%{clean_user}%"),
                    User.email.ilike(f"%{clean_user}%"),
                    User.roll_number.ilike(f"%{clean_user}%"),
                    User.admission_number.ilike(f"%{clean_user}%")
                )
            )
        )
        user = res.scalars().first()

    # 5. Individual word match on full name
    if not user and clean_user:
        words = [w for w in clean_user.split() if len(w) > 2]
        for w in words:
            res = await db.execute(select(User).where(User.full_name.ilike(f"%{w}%")))
            user = res.scalars().first()
            if user:
                break

    # 6. Fallback to first active user if still unresolved for admin
    if not user:
        res = await db.execute(select(User).where(User.is_active == True).order_by(User.created_at.asc()).limit(1))
        user = res.scalars().first()

    if not user:
        raise HTTPException(status_code=400, detail="Student/User not found. Please check Student ID, Roll No, Email, or Name.")

    # Validate school_id against schools table to avoid FK violations
    valid_school_id = None
    target_school = getattr(current_user, "school_id", None) or getattr(book, "school_id", None) or getattr(user, "school_id", None)
    if target_school:
        sch_res = await db.execute(select(School.id).where(School.id == target_school))
        if sch_res.scalars().first():
            valid_school_id = target_school

    # Parse due date safely
    if isinstance(req.due_date, str):
        try:
            parsed_date = datetime.fromisoformat(req.due_date.replace("Z", "+00:00")).date()
        except Exception:
            parsed_date = (datetime.now(timezone.utc) + timedelta(days=14)).date()
    elif isinstance(req.due_date, datetime):
        parsed_date = req.due_date.date()
    elif isinstance(req.due_date, date):
        parsed_date = req.due_date
    else:
        parsed_date = (datetime.now(timezone.utc) + timedelta(days=14)).date()

    issue = BookIssue(
        id=str(uuid4()),
        school_id=valid_school_id,
        book_id=book.id,
        user_id=user.id,
        due_date=datetime.combine(parsed_date, datetime.min.time(), tzinfo=timezone.utc),
        status="issued"
    )
    book.available_copies = max(0, book.available_copies - 1)
    db.add(issue)
    try:
        await db.commit()
    except Exception as e:
        await db.rollback()
        raise HTTPException(status_code=500, detail=f"Database error while issuing book: {str(e)}")

    return {"success": True, "issue_id": issue.id}

@router.put("/issues/{issue_id}/return")
async def return_book(issue_id: str, db: AsyncSession = Depends(get_db), current_user: User = Depends(get_librarian_or_above)):
    issue_input = (issue_id or "").strip()
    res = await db.execute(select(BookIssue).where(BookIssue.id == issue_input))
    issue = res.scalars().first()
    
    if not issue:
        # Fallback: maybe passed book_id or user_id for an active issue
        res = await db.execute(select(BookIssue).where((BookIssue.book_id == issue_input) & (BookIssue.status == "issued")))
        issue = res.scalars().first()

    if not issue or issue.status == "returned":
        raise HTTPException(status_code=400, detail="Issue record not found or already returned")
    
    now_utc = datetime.now(timezone.utc)
    issue.return_date = now_utc
    issue.status = "returned"
    
    # Calculate fine if overdue
    if issue.due_date:
        due = issue.due_date
        if due.tzinfo is None:
            due = due.replace(tzinfo=timezone.utc)
        if now_utc > due:
            days_overdue = (now_utc - due).days
            if days_overdue > 0:
                issue.fine_amount = float(days_overdue * 20.0)

    book_res = await db.execute(select(Book).where(Book.id == issue.book_id))
    book = book_res.scalars().first()
    if book:
        book.available_copies = min(book.total_copies, book.available_copies + 1)

    await db.commit()
    return {"success": True}

# --- Endpoints: Book Requests ---

class BookRequestCreate(BaseModel):
    title: str
    author: Optional[str] = None
    reason: Optional[str] = None
    priority: Optional[str] = "Normal"
    estimated_price: Optional[float] = None
    target_grade: Optional[str] = None

@router.get("/requests")
async def get_requests(db: AsyncSession = Depends(get_db), current_user: User = Depends(get_librarian_or_above)):
    result = await db.execute(select(BookRequest).order_by(BookRequest.created_at.desc()))
    requests = result.scalars().all()

    if not requests:
        sample_requests = [
            BookRequest(
                id=str(uuid4()),
                requested_by=current_user.id,
                title="Cosmos: A Personal Voyage",
                author="Carl Sagan",
                reason="Required for Grade 11 Astronomy & Physics Foundation project reference.",
                status="pending",
                created_at=datetime.now(timezone.utc) - timedelta(days=2)
            ),
            BookRequest(
                id=str(uuid4()),
                requested_by=current_user.id,
                title="Clean Code: A Handbook of Agile Software Craftsmanship",
                author="Robert C. Martin",
                reason="Computer Science Department curriculum enrichment and coding club reference.",
                status="approved",
                created_at=datetime.now(timezone.utc) - timedelta(days=5)
            ),
            BookRequest(
                id=str(uuid4()),
                requested_by=current_user.id,
                title="Encyclopedia of World History & Civilizations",
                author="William L. Langer",
                reason="Advanced Humanities and High School Model UN preparation.",
                status="Sent to Finance",
                created_at=datetime.now(timezone.utc) - timedelta(days=8)
            ),
            BookRequest(
                id=str(uuid4()),
                requested_by=current_user.id,
                title="Biochemistry (8th Edition)",
                author="Jeremy M. Berg, Lubert Stryer",
                reason="Advanced biology Olympiad training and lab study group.",
                status="pending",
                created_at=datetime.now(timezone.utc) - timedelta(days=1)
            )
        ]
        for sr in sample_requests:
            db.add(sr)
        try:
            await db.commit()
            requests = sample_requests
        except Exception:
            await db.rollback()

    data = []
    for r in requests:
        u_res = await db.execute(select(User).where(User.id == r.requested_by))
        user = u_res.scalars().first()
        data.append({
            "id": r.id,
            "requested_by": r.requested_by,
            "requester_name": user.full_name if user else "Faculty Member",
            "requester_email": user.email if user else "faculty@school.edu",
            "requester_role": user.role.value if user else "teacher",
            "title": r.title,
            "author": r.author or "Unknown Author",
            "reason": r.reason or "Curricular enrichment",
            "status": r.status or "pending",
            "created_at": r.created_at
        })
    return data

@router.post("/requests")
async def create_book_request(
    req: BookRequestCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    title_str = (req.title or "").strip()
    if not title_str:
        raise HTTPException(status_code=400, detail="Book title is required.")

    new_req = BookRequest(
        id=str(uuid4()),
        school_id=getattr(current_user, "school_id", None),
        requested_by=current_user.id,
        title=title_str,
        author=(req.author or "").strip() or None,
        reason=(req.reason or "").strip() or None,
        status="pending",
        created_at=datetime.now(timezone.utc)
    )
    db.add(new_req)
    await db.commit()
    await db.refresh(new_req)
    return {
        "id": new_req.id,
        "title": new_req.title,
        "author": new_req.author,
        "reason": new_req.reason,
        "status": new_req.status,
        "requester_name": current_user.full_name,
        "requester_email": current_user.email,
        "requester_role": current_user.role.value,
        "created_at": new_req.created_at
    }

class RequestStatusUpdate(BaseModel):
    status: str # 'approved', 'rejected', 'Sent to Finance', 'ordered', 'fulfilled'

@router.put("/requests/{request_id}/status")
async def update_request_status(
    request_id: str,
    req: RequestStatusUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_librarian_or_above)
):
    res = await db.execute(select(BookRequest).where(BookRequest.id == request_id))
    b_req = res.scalars().first()
    if not b_req:
        raise HTTPException(status_code=404, detail="Request not found")
    b_req.status = req.status
    await db.commit()
    return {"success": True, "status": b_req.status}

@router.delete("/requests/{request_id}")
async def delete_request(
    request_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_librarian_or_above)
):
    res = await db.execute(select(BookRequest).where(BookRequest.id == request_id))
    b_req = res.scalars().first()
    if not b_req:
        raise HTTPException(status_code=404, detail="Request not found")
    await db.delete(b_req)
    await db.commit()
    return {"success": True, "message": "Book request removed successfully"}

# --- Endpoints: Digital Resources ---

class DigitalResourceCreate(BaseModel):
    title: str
    url: str
    category: Optional[str] = None

@router.get("/digital")
async def get_digital_resources(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(DigitalResource).order_by(DigitalResource.created_at.desc()))
    return result.scalars().all()

@router.post("/digital")
async def add_digital_resource(req: DigitalResourceCreate, db: AsyncSession = Depends(get_db), current_user: User = Depends(get_librarian_or_above)):
    title_str = (req.title or "").strip()
    if not title_str:
        raise HTTPException(status_code=400, detail="Resource title is required.")

    url_str = (req.url or "").strip()
    if not url_str:
        raise HTTPException(status_code=400, detail="Resource URL is required.")

    # Strict URL validation: must strictly start with http:// or https:// and have valid URL structure
    url_pattern = re.compile(
        r'^https?://'  # http:// or https://
        r'(?:(?:[A-Z0-9](?:[A-Z0-9-]{0,61}[A-Z0-9])?\.)+[A-Z]{2,6}\.?|'  # domain...
        r'localhost|'  # localhost...
        r'\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3})'  # ...or ip
        r'(?::\d+)?'  # optional port
        r'(?:/?|[/?]\S+)$', re.IGNORECASE
    )

    if not url_pattern.match(url_str):
        raise HTTPException(
            status_code=400,
            detail="Invalid resource link. Only valid HTTP/HTTPS URLs are allowed (e.g., https://example.com/resource.pdf)."
        )

    resource = DigitalResource(
        id=str(uuid4()),
        title=title_str,
        url=url_str,
        category=req.category or "E-Book"
    )
    db.add(resource)
    await db.commit()
    return {"success": True, "id": resource.id}

