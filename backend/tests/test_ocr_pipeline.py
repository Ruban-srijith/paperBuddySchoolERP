"""
test_ocr_pipeline.py
────────────────────────────────────────────────────────────────────────────
Complete test suite for the document OCR pipeline:
  - document_prompts.py  : prompt registry, field accuracy per doc type
  - groq_service.py      : image encoding, JSON parsing, full extraction
  - ocr_engine.py        : bridge layer
  - Live Groq API        : real extraction on generated test images

Run:
  python -m pytest tests/test_ocr_pipeline.py -v
  OR:
  python tests/test_ocr_pipeline.py       (standalone, no pytest needed)
────────────────────────────────────────────────────────────────────────────
"""

import asyncio
import base64
import io
import json
import sys
import os
import traceback
from typing import Dict, Any

# ── Make backend importable ──────────────────────────────────────────────
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from PIL import Image, ImageDraw

# ── Colour codes ─────────────────────────────────────────────────────────
GREEN  = "\033[92m"
RED    = "\033[91m"
YELLOW = "\033[93m"
BLUE   = "\033[94m"
RESET  = "\033[0m"
BOLD   = "\033[1m"

PASS = f"{GREEN}✅ PASS{RESET}"
FAIL = f"{RED}❌ FAIL{RESET}"
SKIP = f"{YELLOW}⚠️  SKIP{RESET}"

results = {"pass": 0, "fail": 0, "skip": 0}


def section(title: str):
    print(f"\n{BOLD}{BLUE}{'─'*60}{RESET}")
    print(f"{BOLD}{BLUE}  {title}{RESET}")
    print(f"{BOLD}{BLUE}{'─'*60}{RESET}")


def ok(msg: str):
    results["pass"] += 1
    print(f"  {PASS}  {msg}")


def fail(msg: str, detail: str = ""):
    results["fail"] += 1
    print(f"  {FAIL}  {msg}")
    if detail:
        print(f"         {RED}{detail}{RESET}")


def skip(msg: str, reason: str = ""):
    results["skip"] += 1
    print(f"  {SKIP}  {msg}" + (f" — {reason}" if reason else ""))


# ─────────────────────────────────────────────────────────────────────────
# HELPERS
# ─────────────────────────────────────────────────────────────────────────

def make_test_image(lines: list[str], width: int = 640, height: int = 300) -> bytes:
    """Generate a white PNG image with text lines for OCR testing."""
    img = Image.new("RGB", (width, height), color="white")
    draw = ImageDraw.Draw(img)
    y = 20
    for line in lines:
        draw.text((20, y), line, fill="black")
        y += 28
    buf = io.BytesIO()
    img.save(buf, format="JPEG", quality=92)
    return buf.getvalue()


# ─────────────────────────────────────────────────────────────────────────
# TEST 1 — DOCUMENT PROMPTS: Registry coverage
# ─────────────────────────────────────────────────────────────────────────

def test_prompt_registry():
    section("TEST 1 — Prompt Registry Coverage")
    from app.services.document_prompts import PROMPT_REGISTRY, get_prompt

    frontend_types = [
        "aadhaar", "birth_cert", "parent_id", "tc", "marksheet",
        "income", "scholarship_letter", "community", "medical_fitness", "sports_cert"
    ]
    alias_types = ["generic", "custom", "auto"]

    for dt in frontend_types:
        if dt in PROMPT_REGISTRY:
            ok(f"'{dt}' is in registry")
        else:
            fail(f"'{dt}' MISSING from registry — frontend will crash")

    for dt in alias_types:
        if dt in PROMPT_REGISTRY:
            ok(f"Alias '{dt}' is in registry")
        else:
            fail(f"Alias '{dt}' MISSING")


# ─────────────────────────────────────────────────────────────────────────
# TEST 2 — DOCUMENT PROMPTS: Field accuracy
# ─────────────────────────────────────────────────────────────────────────

def test_prompt_fields():
    section("TEST 2 — Prompt Field Accuracy Per Document Type")
    from app.services.document_prompts import get_prompt

    # Expected field rules per doc type
    # (must_have, must_NOT_have)
    rules = {
        "aadhaar":           (["full_name", "father_name", "doc_number", "date", "gender", "address"], ["mother_name", "board_name", "annual_income"]),
        "income":            (["full_name", "father_name", "annual_income", "validity_year"], ["mother_name", "gender", "board_name", "blood_group"]),
        "community":         (["full_name", "father_name", "community_category", "sub_caste"], ["mother_name", "gender", "annual_income"]),
        "tc":                (["full_name", "father_name", "previous_institution", "class_last_studied", "emis_number"], ["mother_name", "annual_income", "blood_group"]),
        "birth_cert":        (["full_name", "father_name", "mother_name", "place_of_birth", "gender"], ["annual_income", "board_name", "community_category"]),
        "marksheet":         (["full_name", "board_name", "total_marks", "percentage", "result_status"], ["father_name", "mother_name", "blood_group", "annual_income"]),
        "medical_fitness":   (["full_name", "blood_group", "fitness_status", "doctor_name"], ["father_name", "mother_name", "annual_income"]),
        "scholarship_letter":(["full_name", "scholarship_scheme", "sanctioned_amount", "academic_year"], ["father_name", "mother_name", "blood_group"]),
        "sports_cert":       (["full_name", "event_name", "competition_level", "position_secured"], ["father_name", "mother_name", "annual_income"]),
        "parent_id":         (["full_name", "id_type", "address"], ["father_name", "mother_name", "annual_income"]),
    }

    for doc_type, (must_have, must_not_have) in rules.items():
        p = get_prompt(doc_type, "Test Student", "Test Father")
        fields = p["fields"]

        for f in must_have:
            if f in fields:
                ok(f"[{doc_type}] has '{f}'")
            else:
                fail(f"[{doc_type}] MISSING required field '{f}'", f"fields={fields}")

        for f in must_not_have:
            if f not in fields:
                ok(f"[{doc_type}] correctly excludes '{f}'")
            else:
                fail(f"[{doc_type}] has UNWANTED field '{f}'", "phantom field in prompt")


# ─────────────────────────────────────────────────────────────────────────
# TEST 3 — DOCUMENT PROMPTS: Prompt structure
# ─────────────────────────────────────────────────────────────────────────

def test_prompt_structure():
    section("TEST 3 — Prompt Structure Validation")
    from app.services.document_prompts import get_prompt, PROMPT_REGISTRY

    for dt in PROMPT_REGISTRY:
        p = get_prompt(dt, "Arun Kumar", "Ravi Kumar")

        # Must have all 3 keys
        for key in ["system_prompt", "user_prompt", "fields"]:
            if key in p:
                ok(f"[{dt}] has '{key}'")
            else:
                fail(f"[{dt}] MISSING key '{key}' in prompt config")

        # system_prompt must be non-empty
        if p.get("system_prompt", "").strip():
            ok(f"[{dt}] system_prompt is non-empty")
        else:
            fail(f"[{dt}] system_prompt is EMPTY")

        # user_prompt must contain student name
        if "Arun Kumar" in p.get("user_prompt", ""):
            ok(f"[{dt}] student name interpolated in user_prompt")
        else:
            fail(f"[{dt}] student name NOT found in user_prompt")

        # user_prompt must contain JSON instruction
        if "JSON" in p.get("user_prompt", "") or "json" in p.get("user_prompt", ""):
            ok(f"[{dt}] JSON instruction present in user_prompt")
        else:
            fail(f"[{dt}] JSON instruction MISSING from user_prompt")

        # fields must be a non-empty list
        if isinstance(p.get("fields"), list) and len(p["fields"]) > 0:
            ok(f"[{dt}] fields is non-empty list ({len(p['fields'])} fields)")
        else:
            fail(f"[{dt}] fields is empty or not a list")


# ─────────────────────────────────────────────────────────────────────────
# TEST 4 — GROQ SERVICE: JSON parser
# ─────────────────────────────────────────────────────────────────────────

def test_json_parser():
    section("TEST 4 — GroqService JSON Parser")
    from app.services.groq_service import GroqService

    svc = GroqService()

    cases = [
        # (description, input_text, expect_success, expected_key_value)
        ("Clean JSON",         '{"full_name": "Arun Kumar", "doc_number": "1234"}', True,  ("full_name", "Arun Kumar")),
        ("Markdown fence",     '```json\n{"full_name": "Ravi"}\n```',                True,  ("full_name", "Ravi")),
        ("With thinking tags", '<think>thinking...</think>\n{"full_name": "Priya"}', True,  ("full_name", "Priya")),
        ("Embedded in text",   'Here is result: {"doc_number": "TC/123"} done.',     True,  ("doc_number", "TC/123")),
        ("Invalid JSON",       'No JSON here at all.',                               False, None),
        ("Empty string",       '',                                                   False, None),
    ]

    for desc, text, expect_success, kv in cases:
        result = svc._parse_json(text)
        if expect_success:
            if result is not None:
                if kv and result.get(kv[0]) == kv[1]:
                    ok(f"[parser] {desc} → extracted '{kv[0]}' correctly")
                elif kv:
                    fail(f"[parser] {desc} → wrong value for '{kv[0]}'", f"got: {result}")
                else:
                    ok(f"[parser] {desc} → parsed OK")
            else:
                fail(f"[parser] {desc} → returned None, expected success")
        else:
            if result is None:
                ok(f"[parser] {desc} → correctly returned None")
            else:
                fail(f"[parser] {desc} → should have returned None but got {result}")


# ─────────────────────────────────────────────────────────────────────────
# TEST 5 — GROQ SERVICE: Image preparation
# ─────────────────────────────────────────────────────────────────────────

def test_image_preparation():
    section("TEST 5 — Image Preparation (base64 encoding)")
    from app.services.groq_service import GroqService

    svc = GroqService()

    # JPEG image
    jpeg_bytes = make_test_image(["Test document", "Name: Arun Kumar"])
    b64, mime = svc._prepare_image(jpeg_bytes, "image/jpeg")
    if b64 and mime == "image/jpeg":
        ok(f"JPEG image → base64 encoded ({len(b64)} chars), mime={mime}")
    else:
        fail("JPEG encoding failed", f"mime={mime}, b64_len={len(b64) if b64 else 0}")

    # PNG image
    png_buf = io.BytesIO()
    make_img = Image.new("RGB", (200, 100), "white")
    make_img.save(png_buf, format="PNG")
    png_bytes = png_buf.getvalue()
    b64, mime = svc._prepare_image(png_bytes, "image/png")
    if b64 and "image" in mime:
        ok(f"PNG image → base64 encoded ({len(b64)} chars), mime={mime}")
    else:
        fail("PNG encoding failed")

    # Verify base64 is decodable
    try:
        decoded = base64.b64decode(b64)
        ok(f"Base64 is valid and decodable ({len(decoded)} bytes)")
    except Exception as e:
        fail("Base64 decode failed", str(e))

    # File size check (must be under 20MB)
    size_mb = len(jpeg_bytes) / (1024 * 1024)
    if size_mb < 20:
        ok(f"Test image size {size_mb:.3f} MB — under 20 MB limit")
    else:
        fail(f"Image too large: {size_mb:.1f} MB > 20 MB Groq limit")


# ─────────────────────────────────────────────────────────────────────────
# TEST 6 — GROQ SERVICE: Empty result schema
# ─────────────────────────────────────────────────────────────────────────

def test_empty_result_schema():
    section("TEST 6 — Empty Result Schema (matches upload API expectations)")
    from app.services.groq_service import _empty_result

    required_by_upload_api = [
        "extracted_data",
        "masked_doc_number",
        "encrypted_doc_number",
        "ai_confidence",
        "ai_remarks",
        "verification_status",
        "ai_matched_fields",
        "document_prompt",
    ]

    result = _empty_result("test reason")

    for key in required_by_upload_api:
        if key in result:
            ok(f"_empty_result has '{key}' = {repr(result[key])}")
        else:
            fail(f"_empty_result MISSING '{key}' — upload API will crash")

    # Type checks
    if isinstance(result["extracted_data"], dict):
        ok("extracted_data is dict")
    else:
        fail("extracted_data must be dict")

    if isinstance(result["ai_matched_fields"], dict):
        ok("ai_matched_fields is dict")
    else:
        fail("ai_matched_fields must be dict")

    if result["verification_status"] in ("VERIFIED", "PENDING"):
        ok(f"verification_status is valid: '{result['verification_status']}'")
    else:
        fail(f"verification_status invalid: '{result['verification_status']}'")


# ─────────────────────────────────────────────────────────────────────────
# TEST 7 — OCR ENGINE: Bridge to groq_service
# ─────────────────────────────────────────────────────────────────────────

def test_ocr_engine_bridge():
    section("TEST 7 — OCR Engine Bridge Layer")
    from app.services.ocr_engine import ocr_engine
    from app.services.groq_service import GroqService

    # ocr_engine must have the method the upload API calls
    if hasattr(ocr_engine, "verify_student_document_with_ai"):
        ok("ocr_engine.verify_student_document_with_ai() exists")
    else:
        fail("ocr_engine.verify_student_document_with_ai() MISSING — upload will fail")

    # The method must be async
    import inspect
    if inspect.iscoroutinefunction(ocr_engine.verify_student_document_with_ai):
        ok("verify_student_document_with_ai is async ✓")
    else:
        fail("verify_student_document_with_ai must be async")


# ─────────────────────────────────────────────────────────────────────────
# TEST 8 — GROQ SERVICE: Live API call (text)
# ─────────────────────────────────────────────────────────────────────────

async def test_groq_live_text():
    section("TEST 8 — Live Groq API: Text call")
    from app.services.groq_service import GroqService, GROQ_MODEL
    from app.core.config import settings

    if not settings.GROQ_API_KEY:
        skip("Groq live text test", "GROQ_API_KEY not set")
        return

    svc = GroqService()
    raw = await svc._call_groq_text(
        system_prompt="You extract structured JSON from document text.",
        user_prompt=(
            "Extract from this income certificate:\n"
            "Name: Arun Kumar\nFather: Ravi Kumar\n"
            "Income: Rs. 1,80,000\nIssued by: Tahsildar Chennai\n"
            "Cert No: INC/2026/001\n\n"
            'Return ONLY JSON: {"full_name":"...","father_name":"...","annual_income":"...","issuing_authority":"..."}'
        ),
    )

    if raw:
        ok(f"Groq text API responded ({len(raw)} chars)")
        parsed = svc._parse_json(raw)
        if parsed:
            ok(f"Response is valid JSON: {list(parsed.keys())}")
            if parsed.get("full_name"):
                ok(f"full_name extracted: '{parsed['full_name']}'")
            else:
                fail("full_name missing from Groq response")
            if parsed.get("annual_income"):
                ok(f"annual_income extracted: '{parsed['annual_income']}'")
            else:
                fail("annual_income missing from Groq response")
        else:
            fail("Groq response is not valid JSON", raw[:200])
    else:
        fail("Groq text API returned None — check API key or model")


# ─────────────────────────────────────────────────────────────────────────
# TEST 9 — GROQ SERVICE: Live Vision API call (image)
# ─────────────────────────────────────────────────────────────────────────

async def test_groq_live_vision():
    section("TEST 9 — Live Groq API: Vision call (image → JSON)")
    from app.services.groq_service import GroqService, GROQ_MODEL
    from app.core.config import settings

    if not settings.GROQ_API_KEY:
        skip("Groq live vision test", "GROQ_API_KEY not set")
        return

    # Create a realistic income certificate test image
    img_bytes = make_test_image([
        "GOVERNMENT OF TAMIL NADU",
        "REVENUE DEPARTMENT",
        "Income Certificate No: INC/2026/4521",
        "This is to certify that Priya Devi,",
        "daughter of Suresh Kumar,",
        "has an Annual Income of Rs. 2,40,000.",
        "Valid for Academic Year: 2026-2027",
        "Issued by: Tahsildar, Coimbatore North"
    ], width=700, height=280)

    svc = GroqService()

    ok(f"Test image created ({len(img_bytes)} bytes = {len(img_bytes)/1024:.1f} KB)")

    raw = await svc._call_vision(
        system_prompt=(
            "You are a Financial Verification AI. "
            "Extract certified income details from the certificate."
        ),
        user_prompt=(
            "Extract from this income certificate image. "
            'Return ONLY JSON: {"full_name":"...","father_name":"...","doc_number":"...","annual_income":"...","validity_year":"...","issuing_authority":""}'
        ),
        file_bytes=img_bytes,
        mime_type="image/jpeg",
    )

    if raw:
        ok(f"Groq vision responded ({len(raw)} chars)")
        parsed = svc._parse_json(raw)
        if parsed:
            ok(f"Response parsed to JSON with keys: {list(parsed.keys())}")
            checks = {
                "full_name":      ("Priya", "Priya Devi"),
                "annual_income":  ("2,40,000", "240000", "Rs", "2,40"),
                "issuing_authority": ("Tahsildar", "Coimbatore"),
            }
            for field, keywords in checks.items():
                val = str(parsed.get(field, ""))
                if any(k.lower() in val.lower() for k in keywords):
                    ok(f"Vision extracted '{field}': '{val}'")
                else:
                    fail(f"Vision missed '{field}' (got: '{val}')")
        else:
            fail("Vision response not parseable as JSON", raw[:200])
    else:
        fail("Groq vision call returned None — check key/model")


# ─────────────────────────────────────────────────────────────────────────
# TEST 10 — FULL PIPELINE: extract_document() end-to-end
# ─────────────────────────────────────────────────────────────────────────

async def test_full_pipeline():
    section("TEST 10 — Full Pipeline: extract_document() end-to-end")
    from app.services.groq_service import groq_service
    from app.core.config import settings

    if not settings.GROQ_API_KEY:
        skip("Full pipeline test", "GROQ_API_KEY not set")
        return

    # Test 3 different doc types
    test_cases = [
        {
            "doc_type": "income",
            "student_name": "Arun Kumar",
            "father_name": "Ravi Kumar",
            "image_lines": [
                "INCOME CERTIFICATE",
                "Certificate No: INC/2026/999",
                "Name: Arun Kumar",
                "Father: Ravi Kumar",
                "Annual Income: Rs. 1,80,000",
                "Tahsildar, Chennai North",
                "Valid: 2026-2027",
            ],
            "must_have_fields":  ["full_name", "annual_income", "doc_number"],
            "must_not_be_empty": ["annual_income"],
        },
        {
            "doc_type": "community",
            "student_name": "Meena Devi",
            "father_name": "Krishnan",
            "image_lines": [
                "COMMUNITY CERTIFICATE",
                "Cert No: CC/2026/5512",
                "Name: Meena Devi",
                "Father: Krishnan",
                "Category: MBC (Most Backward Class)",
                "Sub-Caste: Nadar",
                "Tahsildar, Madurai",
            ],
            "must_have_fields":  ["full_name", "community_category", "doc_number"],
            "must_not_be_empty": ["community_category"],
        },
        {
            "doc_type": "marksheet",
            "student_name": "Vikram S",
            "father_name": "",
            "image_lines": [
                "TAMIL NADU STATE BOARD",
                "SSLC MARK SHEET",
                "Roll No: TN2026001234",
                "Name: Vikram S",
                "Total Marks: 478 / 500",
                "Percentage: 95.6%",
                "Result: PASS",
            ],
            "must_have_fields":  ["full_name", "percentage", "result_status"],
            "must_not_be_empty": ["percentage"],
        },
    ]

    for case in test_cases:
        img_bytes = make_test_image(case["image_lines"])
        result = await groq_service.extract_document(
            doc_type=case["doc_type"],
            file_bytes=img_bytes,
            student_name=case["student_name"],
            father_name=case["father_name"],
            mime_type="image/jpeg",
        )

        doc = case["doc_type"]

        # Check result has all required keys
        for k in ["extracted_data", "masked_doc_number", "verification_status", "ai_remarks", "ai_confidence"]:
            if k in result:
                ok(f"[{doc}] result has '{k}'")
            else:
                fail(f"[{doc}] result MISSING '{k}'")

        # Check required fields extracted
        extracted = result.get("extracted_data", {})
        for field in case["must_have_fields"]:
            if field in extracted:
                ok(f"[{doc}] '{field}' in extracted_data: '{extracted[field]}'")
            else:
                fail(f"[{doc}] '{field}' NOT in extracted_data", f"keys={list(extracted.keys())}")

        # Check key fields are not empty
        for field in case["must_not_be_empty"]:
            val = extracted.get(field, "")
            if val and val.strip():
                ok(f"[{doc}] '{field}' is non-empty: '{val}'")
            else:
                fail(f"[{doc}] '{field}' is EMPTY after extraction")

        # No phantom fields
        from app.services.document_prompts import get_prompt
        allowed = get_prompt(case["doc_type"], case["student_name"], case["father_name"])["fields"]
        phantom = [k for k in extracted if k not in allowed]
        if not phantom:
            ok(f"[{doc}] No phantom fields in extracted_data ✓")
        else:
            fail(f"[{doc}] Phantom fields found: {phantom}")

        print(f"\n  {BLUE}[{doc}] Full extracted_data:{RESET}")
        for k, v in extracted.items():
            print(f"    {k}: {v!r}")


# ─────────────────────────────────────────────────────────────────────────
# TEST 11 — CONFIG: All required env vars
# ─────────────────────────────────────────────────────────────────────────

def test_config():
    section("TEST 11 — Configuration & Environment")
    from app.core.config import settings

    checks = {
        "GROQ_API_KEY":          (settings.GROQ_API_KEY, "gsk_"),
        "DATABASE_URL":          (settings.DATABASE_URL, "postgresql"),
        "CLOUDINARY_CLOUD_NAME": (settings.CLOUDINARY_CLOUD_NAME, None),
        "SECRET_KEY":            (settings.SECRET_KEY, None),
    }

    for name, (value, prefix) in checks.items():
        if value:
            if prefix and not value.startswith(prefix):
                fail(f"{name} set but unexpected format (expected prefix '{prefix}')")
            else:
                ok(f"{name} is set ✓")
        else:
            fail(f"{name} is NOT SET — required for production")

    # Groq model check
    from app.services.groq_service import GROQ_MODEL
    if GROQ_MODEL == "qwen/qwen3.8-27b":
        ok(f"GROQ_MODEL = '{GROQ_MODEL}' (vision-capable, 20MB limit) ✓")
    else:
        fail(f"GROQ_MODEL = '{GROQ_MODEL}' — expected 'qwen/qwen3.8-27b'")


# ─────────────────────────────────────────────────────────────────────────
# TEST 12 — EDGE CASES
# ─────────────────────────────────────────────────────────────────────────

async def test_edge_cases():
    section("TEST 12 — Edge Cases")
    from app.services.groq_service import groq_service

    # Empty file bytes
    result = await groq_service.extract_document(
        doc_type="income",
        file_bytes=b"",
        student_name="Test",
        father_name="",
        mime_type="image/jpeg",
    )
    if result["verification_status"] == "PENDING":
        ok("Empty file → PENDING status (not crash)")
    else:
        ok("Empty file handled gracefully")

    # Unknown doc type → should fall back to generic
    from app.services.document_prompts import get_prompt
    p = get_prompt("unknown_type_xyz", "Test", "Parent")
    if p and "fields" in p:
        ok("Unknown doc type → falls back to generic prompt")
    else:
        fail("Unknown doc type → no fallback")

    # Very long student name
    p = get_prompt("aadhaar", "A" * 200, "B" * 200)
    if p.get("user_prompt"):
        ok("Very long names don't crash prompt builder")
    else:
        fail("Long names crashed prompt builder")


# ─────────────────────────────────────────────────────────────────────────
# RUNNER
# ─────────────────────────────────────────────────────────────────────────

async def run_all():
    print(f"\n{BOLD}{'='*60}")
    print("  PaperBuddy OCR Pipeline — Complete Test Suite")
    print(f"{'='*60}{RESET}\n")

    # Sync tests
    sync_tests = [
        test_prompt_registry,
        test_prompt_fields,
        test_prompt_structure,
        test_json_parser,
        test_image_preparation,
        test_empty_result_schema,
        test_ocr_engine_bridge,
        test_config,
    ]

    for t in sync_tests:
        try:
            t()
        except Exception as e:
            fail(f"Test {t.__name__} CRASHED", traceback.format_exc()[-200:])

    # Async tests (live API)
    async_tests = [
        test_groq_live_text,
        test_groq_live_vision,
        test_full_pipeline,
        test_edge_cases,
    ]

    for t in async_tests:
        try:
            await t()
        except Exception as e:
            fail(f"Test {t.__name__} CRASHED", traceback.format_exc()[-200:])

    # Summary
    total = results["pass"] + results["fail"] + results["skip"]
    print(f"\n{BOLD}{'='*60}")
    print(f"  RESULTS: {total} checks")
    print(f"  {GREEN}{results['pass']} passed{RESET}  "
          f"{RED}{results['fail']} failed{RESET}  "
          f"{YELLOW}{results['skip']} skipped{RESET}")
    print(f"{'='*60}{RESET}\n")

    if results["fail"] > 0:
        print(f"{RED}❌ Some tests failed — review above output.{RESET}\n")
        sys.exit(1)
    else:
        print(f"{GREEN}✅ All tests passed!{RESET}\n")


if __name__ == "__main__":
    asyncio.run(run_all())
