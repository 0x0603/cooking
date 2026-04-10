from __future__ import annotations

import os
from dotenv import load_dotenv

load_dotenv()

DEEPGRAM_API_KEY = os.getenv("DEEPGRAM_API_KEY", "")
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY", "")

# Audio settings
SAMPLE_RATE = 16000
CHANNELS = 1
DTYPE = "int16"

# Deepgram settings
DEEPGRAM_MODEL = "nova-2"
DEEPGRAM_LANGUAGE = "en"
DEEPGRAM_ENDPOINTING = 2500  # ms of silence before finalizing (longer = wait for full sentence)
DEEPGRAM_DIARIZE = False  # Distinguish different speakers

# Debounce settings
INTERIM_DEBOUNCE_MS = 500  # Only update interim display every 500ms
DEEPGRAM_KEYWORDS = []  # Add domain-specific terms: ["Kubernetes:2", "CICD:2"]

# Translation settings
OPENAI_MODEL = "gpt-4o-mini"
TRANSLATION_SYSTEM_PROMPT = (
    "You are a real-time meeting translator. "
    "Translate English to Vietnamese. "
    "Keep technical terms (deploy, API, database, etc.) in English. "
    "Be concise and natural. Only return the translation, nothing else."
)

# Cache for common phrases
TRANSLATION_CACHE: dict[str, str] = {
    "Any questions?": "Co cau hoi nao khong?",
    "Makes sense": "Hop ly",
    "Let's move on": "Chuyen sang phan tiep nhe",
    "Can you hear me?": "Moi nguoi nghe ro khong?",
    "You're on mute": "Ban dang bi tat mic",
    "Let me share my screen": "De minh chia se man hinh",
    "Sounds good": "Nghe on do",
    "I agree": "Minh dong y",
    "Go ahead": "Ban noi di",
    "One moment please": "Cho minh mot chut",
}

# UI settings
OVERLAY_MIN_WIDTH = 500
OVERLAY_MIN_HEIGHT = 250
OVERLAY_DEFAULT_WIDTH = 400
OVERLAY_DEFAULT_HEIGHT = 1000
OVERLAY_OPACITY = 0.92
OVERLAY_FONT_SIZE_EN = 13
OVERLAY_FONT_SIZE_VI = 14
MAX_HISTORY_LINES = 50
