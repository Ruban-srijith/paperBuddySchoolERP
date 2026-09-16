from typing import Dict, Any, Optional
from .groq_service import groq_service


class OpenRouterOCREngine:
    """
    Unified AI Vision & OCR Engine for Student Profile Documents.
    All AI extraction is now routed through Groq Vision (llama-4-scout).
    Local Tesseract OCR runs as the baseline; Groq enriches and verifies.
    """

    async def verify_student_document_with_ai(
        self,
        file_bytes: bytes,
        document_type: str,
        student_name: str,
        father_name: Optional[str] = None,
        mother_name: Optional[str] = None,
        phone: Optional[str] = None,
        verified_aadhaar_data: Optional[Dict[str, Any]] = None,
        filename: str = "",
    ) -> Dict[str, Any]:
        """
        Run Groq Vision + local OCR on a student document.
        Extracts, cross-checks, and returns structured verification result.
        """
        # Infer mime type from filename extension
        mime_type = "image/jpeg"
        if filename:
            ext = filename.lower().rsplit(".", 1)[-1]
            mime_map = {
                "pdf": "application/pdf",
                "png": "image/png",
                "jpg": "image/jpeg",
                "jpeg": "image/jpeg",
                "webp": "image/webp",
            }
            mime_type = mime_map.get(ext, "image/jpeg")

        return await groq_service.verify_student_document(
            file_bytes=file_bytes,
            document_type=document_type,
            student_name=student_name,
            father_name=father_name,
            mother_name=mother_name,
            phone=phone,
            verified_aadhaar_data=verified_aadhaar_data,
            mime_type=mime_type,
        )


ocr_engine = OpenRouterOCREngine()
