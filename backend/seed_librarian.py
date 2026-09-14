import sys
sys.path.insert(0, '.')
import asyncio
import uuid
from datetime import datetime, timedelta, timezone, date
from sqlalchemy.future import select
from app.db.database import AsyncSessionLocal
from app.db.models import User, Book, BookIssue, DigitalResource, BookRequest

async def seed_librarian():
    db = AsyncSessionLocal()
    try:
        # Get a user (e.g. for student, teacher)
        user_res = await db.execute(select(User).limit(1))
        user = user_res.scalars().first()
        if not user:
            print("No users found. Please seed users first.")
            return
        
        user_id = user.id

        # Seed Books
        books_data = [
            {"title": "Advanced Physics Vol 2", "author": "H.C. Verma", "isbn": "978-0134093413", "category": "Science", "total_copies": 12, "available_copies": 5},
            {"title": "To Kill a Mockingbird", "author": "Harper Lee", "isbn": "978-0060935467", "category": "Fiction", "total_copies": 8, "available_copies": 8},
            {"title": "Introduction to Algorithms", "author": "Thomas H. Cormen", "isbn": "978-0262033848", "category": "Computer Science", "total_copies": 5, "available_copies": 0},
            {"title": "World History", "author": "Philip Parker", "isbn": "978-1465462404", "category": "History", "total_copies": 10, "available_copies": 10},
        ]
        
        seeded_books = []
        for b in books_data:
            book = Book(
                id=str(uuid.uuid4()),
                title=b["title"],
                author=b["author"],
                isbn=b["isbn"],
                category=b["category"],
                total_copies=b["total_copies"],
                available_copies=b["available_copies"],
                is_digital=False
            )
            db.add(book)
            seeded_books.append(book)
        
        # Seed Digital Resources
        digitals = [
            {"title": "Nature Science Journal (Annual Subs)", "url": "https://nature.com", "category": "Journal", "access_count": 1402},
            {"title": "Python for Data Science (Video Series)", "url": "https://coursera.org", "category": "Video Course", "access_count": 845},
            {"title": "Global History Database", "url": "https://jstor.org", "category": "Database", "access_count": 320},
        ]
        for d in digitals:
            db.add(DigitalResource(
                id=str(uuid.uuid4()),
                title=d["title"],
                url=d["url"],
                category=d["category"],
                access_count=d["access_count"]
            ))

        # Seed Book Requests
        reqs = [
            {"title": "Quantum Computing Since Democritus", "author": "Scott Aaronson", "reason": "Required for the new Grade 12 Advanced Tech elective course.", "status": "pending"},
            {"title": "A Brief History of Time", "author": "Stephen Hawking", "reason": "Physics project reference.", "status": "Sent to Finance"},
            {"title": "The Design of Everyday Things", "author": "Don Norman", "reason": "Design principles", "status": "approved"},
        ]
        for r in reqs:
            db.add(BookRequest(
                id=str(uuid.uuid4()),
                requested_by=user_id,
                title=r["title"],
                author=r["author"],
                reason=r["reason"],
                status=r["status"]
            ))

        await db.commit()
        
        # Seed Book Issues
        now = datetime.now(timezone.utc)
        issues = [
            # Overdue issue
            BookIssue(
                id=str(uuid.uuid4()),
                book_id=seeded_books[0].id,
                user_id=user_id,
                issue_date=now - timedelta(days=20),
                due_date=now - timedelta(days=5),
                status="issued"
            ),
            # Normal issued
            BookIssue(
                id=str(uuid.uuid4()),
                book_id=seeded_books[2].id,
                user_id=user_id,
                issue_date=now - timedelta(days=2),
                due_date=now + timedelta(days=12),
                status="issued"
            ),
            # Returned issue
            BookIssue(
                id=str(uuid.uuid4()),
                book_id=seeded_books[1].id,
                user_id=user_id,
                issue_date=now - timedelta(days=30),
                due_date=now - timedelta(days=15),
                return_date=now - timedelta(days=16),
                status="returned"
            )
        ]
        db.add_all(issues)
        await db.commit()
        
        print("Librarian Mock Data Seeded Successfully!")
    finally:
        await db.close()

if __name__ == "__main__":
    asyncio.run(seed_librarian())
