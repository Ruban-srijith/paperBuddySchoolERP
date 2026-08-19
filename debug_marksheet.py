import sys
sys.path.insert(0, '.')
import asyncio
import os
from backend.app.db.database import AsyncSessionLocal
from backend.app.db.models import StudentDocument
from sqlalchemy.future import select
from backend.app.services.openrouter_service import openrouter_service
from backend.app.core.config import settings

os.environ['OPENROUTER_API_KEY'] = 'YOUR_API_KEY_HERE'
settings.OPENROUTER_API_KEY = os.environ['OPENROUTER_API_KEY']

async def debug_marksheet():
    db = AsyncSessionLocal()
    res = await db.execute(select(StudentDocument).where(StudentDocument.document_type == "marksheet"))
    doc = res.scalars().first()
    if not doc:
        print("No marksheet found!")
        return

    print("Found Marksheet:", doc.id)
    print("Extracted Data:", doc.extracted_data)
    print("AI Remarks:", doc.ai_remarks)
    print("AI Confidence:", doc.ai_confidence)
    
    # Process it again!
    file_path = "backend" + doc.file_url
    with open(file_path, "rb") as f:
        file_bytes = f.read()

    print("Running verify_student_document...")
    result = await openrouter_service.verify_student_document(
        file_bytes=file_bytes,
        document_type="marksheet",
        student_name="Of Thecandidate"
    )

    print("\nNEW RESULT:")
    print("Confidence:", result["ai_confidence"])
    print("Remarks:", result["ai_remarks"])
    print("Masked Doc Number:", result["masked_doc_number"])
    print("Extracted Data:", result["extracted_data"])
    
    await db.close()

if __name__ == "__main__":
    asyncio.run(debug_marksheet())
