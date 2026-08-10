import re

with open('app/db/models.py', 'r') as f:
    content = f.read()

school_model = """
class School(Base):
    __tablename__ = "schools"
    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    name = Column(String(255), nullable=False)
    address = Column(Text, nullable=True)
    contact_email = Column(String(255), nullable=True)
    created_at = Column(DateTime(timezone=True), default=datetime.utcnow)
    updated_at = Column(DateTime(timezone=True), default=datetime.utcnow, onupdate=datetime.utcnow)

    users = relationship("User", back_populates="school", cascade="all, delete-orphan")
"""

content = re.sub(r'(class Department\(Base\):)', school_model + r'\n\1', content)

content = re.sub(
    r'(__tablename__ = "[^"]+")(\n)',
    r'\1\2    school_id = Column(String(36), ForeignKey("schools.id", ondelete="CASCADE"), nullable=True)\n',
    content
)

content = content.replace(
    '__tablename__ = "schools"\n    school_id = Column(String(36), ForeignKey("schools.id", ondelete="CASCADE"), nullable=True)\n',
    '__tablename__ = "schools"\n'
)

content = content.replace(
    'student_profile = relationship("Student",',
    'school = relationship("School", back_populates="users")\n    student_profile = relationship("Student",'
)

with open('app/db/models.py', 'w') as f:
    f.write(content)
