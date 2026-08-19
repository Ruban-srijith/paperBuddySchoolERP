import sys
sys.path.insert(0, '.')
import asyncio
import os

# Set environment
os.environ['OPENROUTER_API_KEY'] = 'YOUR_API_KEY_HERE'
from backend.app.core.config import settings
settings.OPENROUTER_API_KEY = os.environ['OPENROUTER_API_KEY']

from backend.app.services.openrouter_service import openrouter_service
from backend.app.services.ocr_service import ocr_service

async def test():
    # Load dummy image (any image)
    with open('backend/static/uploads/documents/stp11111_aadhaar_5b5f90.jpeg', 'rb') as f:
        file_bytes = f.read()

    document_type = "marksheet"
    student_name = "Kishor Kumar"
    
    prompt_info = ocr_service.get_document_prompt(document_type, student_name)
    
    expected_keys_str = ", ".join([f'"{k}"' for k in prompt_info.get("expected_keys", [])])
    json_schema_prompt = f"\n\nYou MUST return the extracted data strictly as a JSON object using EXACTLY these keys: [{expected_keys_str}]. Do not use any other keys."
    
    prompt = f"{prompt_info['user_prompt']}{json_schema_prompt}"
    print("PROMPT:")
    print(prompt)
    
    res = await openrouter_service.generate_completion(
        prompt=prompt,
        system_prompt=prompt_info["system_prompt"],
        file_bytes=file_bytes
    )
    
    print("\nRESULT:")
    print(res)

asyncio.run(test())
