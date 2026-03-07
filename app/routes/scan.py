"""OCR route – upload a bill image, get back parsed line items."""
from fastapi import APIRouter, Depends, File, HTTPException, UploadFile
from sqlalchemy.orm import Session

from app.database import get_db
from app.middleware.auth import get_current_shopkeeper
from app.models import Shopkeeper
from app.schemas import OCRResult
from app.services.ocr import ocr_image, parse_bill_items

router = APIRouter(prefix="/api/scan", tags=["Bill Scan / OCR"])

ALLOWED_IMAGE_TYPES = {"image/jpeg", "image/jpg", "image/png", "image/webp", "image/bmp"}


@router.post("/", response_model=OCRResult)
async def scan_bill(
    image: UploadFile = File(...),
    db: Session = Depends(get_db),
    current: Shopkeeper = Depends(get_current_shopkeeper),
):
    """
    Upload a bill/receipt image.
    Returns raw OCR text + AI-parsed line items (name, qty, price).
    """
    if image.content_type not in ALLOWED_IMAGE_TYPES:
        raise HTTPException(
            status_code=415,
            detail=f"Unsupported file type: {image.content_type}. Use JPEG/PNG/WebP.",
        )

    image_bytes = await image.read()
    if len(image_bytes) > 10 * 1024 * 1024:
        raise HTTPException(status_code=413, detail="Image exceeds 10 MB limit")

    raw_text = ocr_image(image_bytes, image.filename)
    parsed_items = parse_bill_items(raw_text)

    return OCRResult(raw_text=raw_text, parsed_items=parsed_items)
