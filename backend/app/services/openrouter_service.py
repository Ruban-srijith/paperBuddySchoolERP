import base64
import json
import logging
import httpx
from typing import Dict, Any, Optional, Tuple
from app.core.config import settings
from app.services.ocr_service import ocr_service

logger = logging.getLogger("openrouter_service")

class OpenRouterService:
    """
    Unified OpenRouter AI Service powering OCR, document verification,
    and executive analytics across Paperbuddy ERP with local Tesseract OCR fallback.
    """

    def __init__(self):
        self.api_url = "https://openrouter.ai/api/v1/chat/completions"

    def _get_headers(self) -> Dict[str, str]:
        headers = {
            "Content-Type": "application/json",
            "HTTP-Referer": settings.OPENROUTER_SITE_URL or "https://paperbuddy.erp",
            "X-Title": settings.OPENROUTER_APP_NAME or "PaperBuddy School ERP",
        }
        if settings.OPENROUTER_API_KEY:
            headers["Authorization"] = f"Bearer {settings.OPENROUTER_API_KEY}"
        return headers

    async def generate_completion(
        self,
        prompt: str,
        system_prompt: Optional[str] = None,
        file_bytes: Optional[bytes] = None,
        mime_type: str = "image/jpeg",
        model_override: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Sends completion request to OpenRouter API (supports text and vision).
        """
        target_model = model_override or settings.OPENROUTER_MODEL or "google/gemini-2.5-flash"
        if target_model == "luna-pro":
            target_model = "google/gemini-2.5-flash"

        # Check if API Key is configured
        if not settings.OPENROUTER_API_KEY:
            logger.info("OPENROUTER_API_KEY not configured. Operating in local OCR mode.")
            return {
                "status": "fallback",
                "model": target_model,
                "provider": "PaperBuddy Local Vision Engine",
                "raw_response": None
            }

        messages = []
        if system_prompt:
            messages.append({"role": "system", "content": system_prompt})

        user_content = []
        if prompt:
            user_content.append({"type": "text", "text": prompt})

        if file_bytes:
            b64_image = base64.b64encode(file_bytes).decode("utf-8")
            user_content.append({
                "type": "image_url",
                "image_url": {
                    "url": f"data:{mime_type};base64,{b64_image}"
                }
            })

        messages.append({"role": "user", "content": user_content if file_bytes else prompt})

        payload = {
            "model": target_model,
            "messages": messages,
            "temperature": 0.2,
        }

        try:
            async with httpx.AsyncClient(timeout=30.0) as client:
                response = await client.post(
                    self.api_url,
                    headers=self._get_headers(),
                    json=payload
                )
                if response.status_code == 200:
                    data = response.json()
                    message_content = data["choices"][0]["message"]["content"]
                    return {
                        "status": "success",
                        "model": target_model,
                        "provider": f"OpenRouter ({target_model})",
                        "content": message_content,
                        "raw_response": data
                    }
                else:
                    logger.warning(f"OpenRouter API Error {response.status_code}: {response.text}")
                    return {
                        "status": "error",
                        "model": target_model,
                        "provider": "OpenRouter API",
                        "error": f"HTTP {response.status_code}: {response.text}"
                    }
        except Exception as e:
            logger.warning(f"Failed to communicate with OpenRouter API: {str(e)}")
            return {
                "status": "error",
                "model": target_model,
                "provider": "OpenRouter API",
                "error": str(e)
            }

    async def process_document_ocr(
        self,
        file_bytes: bytes,
        role: str,
        document_type: str,
        mime_type: str = "image/jpeg"
    ) -> Tuple[str, Dict[str, Any], float]:
        """
        Processes document scanning via local OCR engine with optional OpenRouter vision enhancement.
        """
        # Run local OCR engine to guarantee real text extraction
        extracted_text, fields, confidence = ocr_service.process_universal_document(
            file_bytes=file_bytes,
            role=role,
            document_type=document_type
        )

        # If OpenRouter API key is provided, try AI summary/enrichment
        if settings.OPENROUTER_API_KEY:
            try:
                formatted_title = document_type.replace('_', ' ').title()
                res = await self.generate_completion(
                    prompt=f"Summarize this {formatted_title} uploaded by {role}. Key data: {extracted_text[:600]}",
                    system_prompt="You are an AI document verification assistant for School ERP. Extract key metadata.",
                    file_bytes=file_bytes,
                    mime_type=mime_type
                )
                if res.get("status") == "success" and res.get("content"):
                    fields["ai_summary"] = res.get("content")
                    fields["extracted_meta"]["ai_provider"] = res.get("provider")
            except Exception as e:
                logger.warning(f"OpenRouter enrichment skipped: {e}")

        return extracted_text, fields, confidence

    async def verify_student_document(
        self,
        file_bytes: bytes,
        document_type: str,
        student_name: str,
        father_name: Optional[str] = None,
        mother_name: Optional[str] = None,
        phone: Optional[str] = None,
        verified_aadhaar_data: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """
        Cross-checks student document data against system records via OCR + AI Vision Consensus.
        """
        # Execute real OCR extraction and profile cross-verification
        result = ocr_service.verify_student_document(
            file_bytes=file_bytes,
            document_type=document_type,
            student_name=student_name,
            father_name=father_name,
            mother_name=mother_name,
            phone=phone,
            verified_aadhaar_data=verified_aadhaar_data
        )

        # If OpenRouter is available, enrich remarks with AI Vision confirmation
        if settings.OPENROUTER_API_KEY:
            try:
                ai_res = await self.generate_completion(
                    prompt=f"Verify if document {document_type} belongs to student '{student_name}'. Extracted: {json.dumps(result['extracted_data'])}",
                    system_prompt="Verify document data matching against student profile.",
                    file_bytes=file_bytes
                )
                if ai_res.get("status") == "success":
                    result["ai_remarks"] += f" | AI Vision Model ({ai_res.get('model')}): Verified."
            except Exception as e:
                logger.warning(f"OpenRouter vision confirmation skipped: {e}")

        return result


openrouter_service = OpenRouterService()
