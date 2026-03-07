"""Reports & AI insights route."""
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database import get_db
from app.middleware.auth import get_current_shopkeeper
from app.models import Shopkeeper
from app.schemas import InsightResponse
from app.services.insights import generate_insights

router = APIRouter(prefix="/api/reports", tags=["Reports & Insights"])


@router.get("/insights", response_model=InsightResponse)
def get_insights(
    db: Session = Depends(get_db),
    current: Shopkeeper = Depends(get_current_shopkeeper),
):
    """
    Returns an AI-generated business insight report:
    - Plain-language summary (in shopkeeper's language)
    - Top selling products (last 30 days)
    - Low-stock alerts with reorder predictions
    - Pricing optimisation suggestions
    """
    data = generate_insights(current, db)
    return InsightResponse(**data)
