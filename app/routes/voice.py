"""Voice route – receive audio, return transcript + AI reply + TTS audio URL."""
from fastapi import APIRouter, Depends, HTTPException, Request, UploadFile, File
from sqlalchemy.orm import Session

from app.database import get_db
from app.middleware.auth import get_current_shopkeeper
from app.models import Shopkeeper
from app.schemas import VoiceResponse
from app.services.voice import classify_intent, text_to_speech, transcribe_audio

router = APIRouter(prefix="/api/voice", tags=["Voice"])

ALLOWED_AUDIO_TYPES = {"audio/mpeg", "audio/wav", "audio/ogg", "audio/webm", "audio/mp4", "audio/m4a"}


@router.post("/", response_model=VoiceResponse)
async def process_voice(
    request: Request,
    audio: UploadFile = File(...),
    tts: bool = True,
    db: Session = Depends(get_db),
    current: Shopkeeper = Depends(get_current_shopkeeper),
):
    """
    Upload an audio file → transcribe → detect intent → return text + optional TTS URL.
    Supports Hindi, English, Marathi, Tamil, Telugu and other Indian languages.
    """
    if audio.content_type not in ALLOWED_AUDIO_TYPES:
        raise HTTPException(
            status_code=415,
            detail=f"Unsupported audio type: {audio.content_type}. Use mp3/wav/ogg/webm.",
        )

    audio_bytes = await audio.read()
    if len(audio_bytes) > 25 * 1024 * 1024:   # Whisper limit: 25 MB
        raise HTTPException(status_code=413, detail="Audio file exceeds 25 MB limit")

    # Step 1 – Transcribe
    transcript = transcribe_audio(audio_bytes, audio.filename)

    # Step 2 – GPT-4 intent classification
    result = classify_intent(transcript, current.language)
    intent = result.get("intent", "general_query")
    reply_text = result.get("reply", "Understood!")

    # Step 3 – Optional TTS audio
    audio_url = None
    if tts:
        try:
            audio_path = text_to_speech(reply_text, current.language)
            base_url = str(request.base_url).rstrip("/")
            audio_url = f"{base_url}/static/audio/{audio_path.split('/')[-1]}"
        except Exception:
            pass  # TTS failure is non-critical

    return VoiceResponse(
        transcript=transcript,
        intent=intent,
        reply_text=reply_text,
        reply_audio_url=audio_url,
    )