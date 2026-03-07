"""
Voice service
1. Transcribe audio with OpenAI Whisper
2. Detect intent with GPT-4
3. Execute intent against the database
4. Return text + TTS audio response
"""
import os
import tempfile
import uuid

from openai import OpenAI
from sqlalchemy.orm import Session

from app.config import settings
from app.models import Shopkeeper

client = OpenAI(api_key=settings.OPENAI_API_KEY)

SYSTEM_PROMPT = """
You are AI Bazaar, a friendly shop assistant for Indian small shopkeepers.
You understand Hindi, English, Marathi, Tamil, Telugu, and other Indian languages.

When the shopkeeper speaks, identify ONE intent from this list:
  check_stock | add_stock | record_sale | get_report | ask_price | generate_invoice | general_query

Reply ONLY in JSON with these keys:
{
  "intent": "<intent>",
  "entities": { ... extracted data like product name, quantity, price ... },
  "reply": "<short helpful reply in the same language the shopkeeper used>"
}
"""


def transcribe_audio(audio_bytes: bytes, filename: str) -> str:
    """Send audio to OpenAI Whisper and return transcript."""
    with tempfile.NamedTemporaryFile(suffix=os.path.splitext(filename)[1], delete=False) as tmp:
        tmp.write(audio_bytes)
        tmp_path = tmp.name

    try:
        with open(tmp_path, "rb") as audio_file:
            transcript = client.audio.transcriptions.create(
                model="whisper-1",
                file=audio_file,
                response_format="text",
            )
        return transcript.strip()
    finally:
        os.unlink(tmp_path)


def classify_intent(transcript: str, language: str = "en") -> dict:
    """Send transcript to GPT-4 and parse the JSON intent response."""
    import json

    response = client.chat.completions.create(
        model="gpt-4o",
        messages=[
            {"role": "system", "content": SYSTEM_PROMPT},
            {"role": "user", "content": f"Language preference: {language}\n\nShopkeeper said: {transcript}"},
        ],
        response_format={"type": "json_object"},
        temperature=0.3,
    )
    return json.loads(response.choices[0].message.content)


def text_to_speech(text: str, lang: str = "en") -> str:
    """Generate TTS audio using gTTS and return the saved file path."""
    from gtts import gTTS

    audio_dir = os.path.join(settings.UPLOAD_DIR, "audio")
    os.makedirs(audio_dir, exist_ok=True)
    filename = f"{uuid.uuid4().hex}.mp3"
    filepath = os.path.join(audio_dir, filename)

    tts_lang = _map_lang(lang)
    tts = gTTS(text=text, lang=tts_lang)
    tts.save(filepath)
    return filepath


def _map_lang(lang: str) -> str:
    """Map internal language code to gTTS language code."""
    mapping = {
        "hi": "hi", "en": "en", "mr": "mr",
        "ta": "ta", "te": "te", "kn": "kn", "bn": "bn",
    }
    return mapping.get(lang, "en")
