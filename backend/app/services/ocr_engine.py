import asyncio
import json
import random
from typing import Dict, Any, List, Tuple
from app.schemas.ocr import StudentDataExtraction, ModelExtractionResult

class MultiModelOCREngine:
    """
    Simulates a multi-model Vision OCR pipeline running 3 vision models in parallel:
    - Vision Model 1 (e.g., Gemini 1.5 Flash)
    - Vision Model 2 (e.g., Llama-3.2-Vision)
    - Vision Model 3 (e.g., Qwen2-VL)

    Then feeds extractions into an LLM Judge consensus layer.
    """

    async def _extract_gemini(self, file_bytes: bytes) -> ModelExtractionResult:
        await asyncio.sleep(0.15) # simulate async network API call
        return ModelExtractionResult(
            model_name="Gemini 1.5 Flash",
            confidence=0.98,
            data={
                "full_name": "Kishor Kumar",
                "email": "kishor.k@school.edu",
                "admission_number": "ADM-2026-042",
                "roll_number": "10B-14",
                "father_name": "Ramesh Kumar",
                "mother_name": "Anita Kumar",
                "guardian_phone": "+919876543210",
                "date_of_birth": "2008-05-14",
                "blood_group": "O+",
                "address": "123 Main St, Sector 4, New Delhi"
            }
        )

    async def _extract_llama_vision(self, file_bytes: bytes) -> ModelExtractionResult:
        await asyncio.sleep(0.20)
        return ModelExtractionResult(
            model_name="Llama-3.2 Vision",
            confidence=0.94,
            data={
                "full_name": "Kishor Kumar",
                "email": "kishor.k@school.edu",
                "admission_number": "ADM-2026-042",
                "roll_number": "10B-14",
                "father_name": "Ramesh Kumar",
                "mother_name": "Anita Kumar",
                "guardian_phone": "+919876543210",
                "date_of_birth": "2008-05-14",
                "blood_group": "O+",
                "address": "123 Main St, Sector 4, New Delhi"
            }
        )

    async def _extract_qwen_vl(self, file_bytes: bytes) -> ModelExtractionResult:
        await asyncio.sleep(0.18)
        return ModelExtractionResult(
            model_name="Qwen2-VL",
            confidence=0.96,
            data={
                "full_name": "Kishor Kumar",
                "email": "kishor.k@school.edu",
                "admission_number": "ADM-2026-042",
                "roll_number": "10B-14",
                "father_name": "Ramesh Kumar",
                "mother_name": "Anita Kumar",
                "guardian_phone": "+919876543210",
                "date_of_birth": "2008-05-14",
                "blood_group": "O+",
                "address": "123 Main St, Sector 4"
            }
        )

    async def process_form(self, file_bytes: bytes) -> Tuple[StudentDataExtraction, List[ModelExtractionResult], str]:
        # Step 1: Parallel asynchronous vision model API calls using asyncio.gather
        results: List[ModelExtractionResult] = await asyncio.gather(
            self._extract_gemini(file_bytes),
            self._extract_llama_vision(file_bytes),
            self._extract_qwen_vl(file_bytes)
        )

        # Step 2: LLM Judge Consensus Layer
        consensus_fields: Dict[str, Any] = {}
        all_keys = ["full_name", "email", "admission_number", "roll_number", "father_name", "mother_name", "guardian_phone", "date_of_birth", "blood_group", "address"]

        for key in all_keys:
            votes = [m.data.get(key) for m in results if m.data.get(key) is not None]
            if not votes:
                consensus_fields[key] = None
                continue
            
            # Majority voting
            most_common = max(set(votes), key=votes.count)
            consensus_fields[key] = most_common

        verified_data = StudentDataExtraction(**consensus_fields)
        judge_notes = "Unanimous consensus achieved across 3 vision models (Gemini Flash, Llama-Vision, Qwen2-VL) for primary identifiers (admission_number, full_name, roll_number). Minor address whitespace reconciled."

        return verified_data, results, judge_notes

ocr_engine = MultiModelOCREngine()
