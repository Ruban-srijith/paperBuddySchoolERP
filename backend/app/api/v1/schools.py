from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from app.db.database import get_db
from app.db.models import School, User, UserRole
from app.schemas.schools import SchoolRegister, SchoolResponse
from app.core.auth import hash_password
import uuid

router = APIRouter(prefix="/schools", tags=["Schools"])

@router.get("/public", response_model=list[SchoolResponse])
async def get_schools_public(db: AsyncSession = Depends(get_db)):
    """Get a list of all registered schools."""
    result = await db.execute(select(School))
    return result.scalars().all()

@router.post("/register", response_model=SchoolResponse, status_code=status.HTTP_201_CREATED)
async def register_school(req: SchoolRegister, db: AsyncSession = Depends(get_db)):
    """Register a new school and its first admin user."""
    
    # Check if a user with the given admin email already exists globally
    existing_user = await db.execute(select(User).where(User.email == req.admin_user.email))
    if existing_user.scalars().first():
        raise HTTPException(status_code=409, detail="A user with this email already exists.")
        
    # Create the new School
    new_school = School(
        id=str(uuid.uuid4()),
        name=req.school.name,
        address=req.school.address,
        contact_email=req.school.contact_email
    )
    db.add(new_school)
    
    # Create the admin User for this school
    new_admin = User(
        id=str(uuid.uuid4()),
        school_id=new_school.id,
        email=req.admin_user.email,
        full_name=req.admin_user.full_name,
        role=UserRole.ADMIN,  # Force role to ADMIN
        password_hash=hash_password(req.admin_user.password),
    )
    db.add(new_admin)
    
    await db.commit()
    await db.refresh(new_school)
    
    return new_school
