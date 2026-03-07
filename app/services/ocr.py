"""
OCR Service
- Uses Tesseract (local) for bill/receipt scanning
- Falls back to Google Cloud Vision if configured
- GPT-4 then parses raw text into structured line items
"""
import json
import os
import re
import tempfile
from pathlib import Path

from PIL import Image

from app.config import settings
from openai import OpenAI

client = OpenAI(api_key=settings.OPENAI_API_KEY)

PARSE_PROMPT = """
You are given raw OCR text from an Indian shop bill or purchase receipt.
Extract all line items and return a JSON array like:
[
  { "name": "Product Name", "quantity": 2, "unit": "piece", "unit_price": 45.0, "total": 90.0 },
  ...
]
If a field is missing, set it to null.
Return ONLY the JSON array, no extra text.
"""


def ocr_image(image_bytes: bytes, filename: str) -> str:
    """Extract raw text from image using pytesseract."""
    try:
        import pytesseract
    except ImportError:
        raise RuntimeError("pytesseract not installed. Run: pip install pytesseract")

    suffix = Path(filename).suffix or ".jpg"
    with tempfile.NamedTemporaryFile(suffix=suffix, delete=False) as tmp:
        tmp.write(image_bytes)
        tmp_path = tmp.name

    try:
        img = Image.open(tmp_path)
        # Try English + Hindi Devanagari
        text = pytesseract.image_to_string(img, lang="eng+hin" if _has_hin_tessdata() else "eng")
        return text.strip()
    finally:
        os.unlink(tmp_path)


def parse_bill_items(raw_text: str) -> list[dict]:
    """Send raw OCR text to GPT-4 to extract structured line items."""
    response = client.chat.completions.create(
        model="gpt-4o",
        messages=[
            {"role": "system", "content": PARSE_PROMPT},
            {"role": "user", "content": raw_text},
        ],
        response_format={"type": "json_object"},
        temperature=0.1,
    )
    content = response.choices[0].message.content

    # GPT may wrap in {"items": [...]} or return bare array
    parsed = json.loads(content)
    if isinstance(parsed, list):
        return parsed
    # Find first list value
    for v in parsed.values():
        if isinstance(v, list):
            return v
    return []


def _has_hin_tessdata() -> bool:
    """Check if Hindi tessdata is installed."""
    try:
        import subprocess
        result = subprocess.run(["tesseract", "--list-langs"], capture_output=True, text=True)
        return "hin" in result.stdout
    except Exception:
        return False
