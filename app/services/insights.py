"""
AI Insights Service (GPT-4)
- Sales summary & top-sellers
- Demand prediction (suggest reorder quantities)
- Pricing optimisation suggestions
- Plain-language report in shopkeeper's language
"""
import json
from datetime import datetime, timedelta

from openai import OpenAI
from sqlalchemy import func
from sqlalchemy.orm import Session

from app.config import settings
from app.models import Product, Sale, SaleItem, Shopkeeper

client = OpenAI(api_key=settings.OPENAI_API_KEY)


# ── Data collection helpers ──────────────────────────────────────

def _sales_last_n_days(db: Session, shopkeeper_id: int, days: int = 30) -> list[dict]:
    since = datetime.utcnow() - timedelta(days=days)
    rows = (
        db.query(
            SaleItem.product_name,
            func.sum(SaleItem.quantity).label("total_qty"),
            func.sum(SaleItem.line_total).label("total_revenue"),
        )
        .join(Sale)
        .filter(Sale.shopkeeper_id == shopkeeper_id, Sale.created_at >= since)
        .group_by(SaleItem.product_name)
        .order_by(func.sum(SaleItem.line_total).desc())
        .all()
    )
    return [{"product": r.product_name, "qty_sold": r.total_qty, "revenue": r.total_revenue} for r in rows]


def _low_stock_items(db: Session, shopkeeper_id: int) -> list[dict]:
    items = (
        db.query(Product)
        .filter(
            Product.shopkeeper_id == shopkeeper_id,
            Product.is_active == True,
            Product.quantity <= Product.reorder_level,
        )
        .all()
    )
    return [{"name": p.name, "current_qty": p.quantity, "reorder_level": p.reorder_level} for p in items]


def _all_products(db: Session, shopkeeper_id: int) -> list[dict]:
    products = db.query(Product).filter(
        Product.shopkeeper_id == shopkeeper_id,
        Product.is_active == True,
    ).all()
    return [
        {
            "name": p.name, "category": p.category,
            "purchase_price": p.purchase_price, "selling_price": p.selling_price,
            "quantity": p.quantity, "gst_rate": p.gst_rate,
        }
        for p in products
    ]


# ── GPT-4 calls ──────────────────────────────────────────────────

def generate_insights(shopkeeper: Shopkeeper, db: Session) -> dict:
    """Full AI insight report: summary, top sellers, demand, pricing."""
    sales_data = _sales_last_n_days(db, shopkeeper.id, days=30)
    low_stock = _low_stock_items(db, shopkeeper.id)
    products = _all_products(db, shopkeeper.id)

    lang_instruction = f"Respond in {'Hindi' if shopkeeper.language == 'hi' else 'English'} when writing the summary."

    prompt = f"""
You are an AI business advisor for a small Indian shopkeeper.

Shopkeeper: {shopkeeper.name}  |  Shop: {shopkeeper.shop_name or 'N/A'}
Language: {shopkeeper.language}

SALES DATA (last 30 days):
{json.dumps(sales_data, indent=2)}

LOW STOCK ITEMS:
{json.dumps(low_stock, indent=2)}

ALL PRODUCTS (with prices):
{json.dumps(products, indent=2)}

Tasks:
1. Write a 3-4 sentence plain-language business summary. {lang_instruction}
2. List top 5 selling products.
3. Predict reorder quantities for the next 30 days for each low-stock item.
4. Suggest better selling prices for any product where the margin is below 15%.

Return ONLY a JSON object with keys:
  summary (string), top_sellers (array), demand_predictions (array), pricing_suggestions (array)
"""

    response = client.chat.completions.create(
        model="gpt-4o",
        messages=[{"role": "user", "content": prompt}],
        response_format={"type": "json_object"},
        temperature=0.4,
    )

    result = json.loads(response.choices[0].message.content)
    result["low_stock_items"] = low_stock
    return result
