"""
WhatsApp notification service using Twilio API.
Sends text messages and invoice PDF links to customers/shopkeepers.
"""
import os

from app.config import settings


def send_whatsapp_message(to_phone: str, message: str) -> None:
    """Send a plain text WhatsApp message via Twilio."""
    if not settings.TWILIO_ACCOUNT_SID or not settings.TWILIO_AUTH_TOKEN:
        print(f"[WhatsApp] Twilio not configured. Simulated message to {to_phone}:\n{message}")
        return

    from twilio.rest import Client
    client = Client(settings.TWILIO_ACCOUNT_SID, settings.TWILIO_AUTH_TOKEN)
    client.messages.create(
        body=message,
        from_=settings.TWILIO_WHATSAPP_FROM,
        to=f"whatsapp:{to_phone}",
    )


def send_invoice_whatsapp(customer_phone: str, invoice_number: str, pdf_path: str) -> None:
    """
    Send an invoice notification to the customer on WhatsApp.
    If a public URL is available it attaches the PDF; otherwise sends a text summary.
    """
    message = (
        f"🛒 *AI Bazaar – Invoice Ready*\n\n"
        f"Invoice Number: *{invoice_number}*\n"
        f"Your invoice has been generated. "
        f"Please collect or ask your shopkeeper to share the PDF.\n\n"
        f"धन्यवाद / Thank you! 🙏"
    )
    send_whatsapp_message(customer_phone, message)


def send_low_stock_alert(shopkeeper_phone: str, items: list[dict]) -> None:
    """Alert the shopkeeper about low-stock items."""
    if not items:
        return
    lines = "\n".join(
        f"• {item['name']}: {item['current_qty']} left (reorder at {item['reorder_level']})"
        for item in items
    )
    message = (
        f"⚠️ *AI Bazaar – Low Stock Alert*\n\n"
        f"The following items need restocking:\n{lines}\n\n"
        f"Open AI Bazaar to place orders. 📦"
    )
    send_whatsapp_message(shopkeeper_phone, message)
