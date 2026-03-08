"""
WhatsApp Webhook route
Handles incoming messages from customers/shopkeepers via Twilio's webhook.
Supports simple commands: balance, stock, sales
"""
from fastapi import APIRouter, Form, Request, Response
from sqlalchemy.orm import Session

from app.database import SessionLocal
from app.models import Shopkeeper
from app.services.whatsapp import send_whatsapp_message

router = APIRouter(prefix="/api/whatsapp", tags=["WhatsApp Webhook"])


@router.post("/webhook")
async def whatsapp_webhook(
    request: Request,
    From: str = Form(...),
    Body: str = Form(...),
):
    """
    Twilio sends a POST to this endpoint when a WhatsApp message arrives.
    We look up the shopkeeper by phone and respond to simple commands.
    """
    sender = From.replace("whatsapp:", "").strip()
    text = Body.strip().lower()

    db: Session = SessionLocal()
    try:
        shopkeeper = db.query(Shopkeeper).filter(
            Shopkeeper.whatsapp_number == sender
        ).first()

        if not shopkeeper:
            reply = "👋 You are not registered on AI Bazaar. Please sign up at our app."
        elif text in ("hi", "hello", "help", "start"):
            reply = (
                f"🙏 Namaste {shopkeeper.name}!\n\n"
                f"*AI Bazaar Commands:*\n"
                f"  📦 *stock* – Check inventory\n"
                f"  📊 *sales* – Today's sales summary\n"
                f"  ⚠️  *alerts* – Low stock alerts\n\n"
                f"Or open the app for full features."
            )
        elif text == "stock":
            from app.models import Product
            items = (
                db.query(Product)
                .filter(Product.shopkeeper_id == shopkeeper.id, Product.is_active == True)
                .limit(10)
                .all()
            )
            if items:
                lines = "\n".join(f"• {p.name}: {p.quantity} {p.unit}" for p in items)
                reply = f"📦 *Inventory (top 10)*\n\n{lines}"
            else:
                reply = "No products found. Add products in the app."
        elif text == "alerts":
            from app.models import Product
            low = (
                db.query(Product)
                .filter(
                    Product.shopkeeper_id == shopkeeper.id,
                    Product.is_active == True,
                    Product.quantity <= Product.reorder_level,
                )
                .all()
            )
            if low:
                lines = "\n".join(f"• {p.name}: {p.quantity} left" for p in low)
                reply = f"⚠️ *Low Stock Items*\n\n{lines}\n\nRestock soon!"
            else:
                reply = "✅ All items are adequately stocked."
        elif text == "sales":
            from datetime import date
            from sqlalchemy import func
            from app.models import Sale
            today = date.today()
            result = (
                db.query(func.count(Sale.id), func.sum(Sale.total))
                .filter(
                    Sale.shopkeeper_id == shopkeeper.id,
                    func.date(Sale.created_at) == today,
                )
                .first()
            )
            count, total = result
            reply = (
                f"📊 *Today's Sales ({today})*\n\n"
                f"Transactions: {count or 0}\n"
                f"Total Revenue: ₹{total or 0:.2f}"
            )
        else:
            reply = f"Sorry, I didn't understand '{Body}'. Send *help* to see available commands."

        # Send reply via Twilio
        send_whatsapp_message(sender, reply)

    finally:
        db.close()

    # Twilio expects a 200 OK (empty TwiML is fine here since we sent manually)
    return Response(content="", media_type="text/xml")
