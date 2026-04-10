# Meeting Translator

## Overview

A macOS desktop app that captures English audio from meetings (Zoom, Teams, Google Meet, etc.) and provides real-time Vietnamese translation as floating subtitles.

## Architecture

```
Audio Capture (sounddevice + BlackHole)
       │
       ▼
Deepgram Streaming STT (English transcript)
       │
       ├── Interim results → Quick translate → Show immediately
       │
       └── Final results → Full translate → Replace interim
       │
       ▼
GPT-4o-mini Translation (English → Vietnamese)
       │
       ▼
PyQt6 Overlay Window (floating subtitle)
```

## Tech Stack

- **Language**: Python 3.9+
- **Audio Capture**: `sounddevice` (via BlackHole virtual audio device)
- **Speech-to-Text**: Deepgram Nova-2 (streaming WebSocket)
- **Translation**: OpenAI GPT-4o-mini (streaming)
- **UI**: PyQt6 (floating overlay window)

## Third-party APIs

- **Deepgram**: Speech-to-Text streaming — `DEEPGRAM_API_KEY`
- **OpenAI**: Translation via GPT-4o-mini — `OPENAI_API_KEY`

## Project Structure

```
meeting-translator/
├── src/
│   ├── main.py              # App entry point
│   ├── audio_capture.py     # System audio capture via sounddevice
│   ├── transcriber.py       # Deepgram streaming STT
│   ├── translator.py        # GPT-4o-mini translation + cache
│   ├── overlay.py           # PyQt6 floating overlay window
│   └── config.py            # Configuration and constants
├── .env                     # API keys (not committed)
├── .env.example             # API keys template
├── requirements.txt         # Python dependencies
├── CLAUDE.md                # This file
└── README.md                # Project documentation
```

## Key Design Decisions

### Two-pass Translation

1. **Interim pass**: Translate chunks quickly for immediate display
2. **Final pass**: Re-translate complete sentence for accuracy, replaces interim

### Translation Cache

- Cache frequently used phrases ("Any questions?", "Makes sense", etc.)
- Cache hit = 0ms delay

### Deepgram Config

- Model: `nova-2`
- `endpointing`: 500-800ms (natural pause detection for meetings)
- `smart_format`: true (punctuation, numbers)
- `keywords`: Boosted domain-specific terms
- `interim_results`: true

### Audio Capture

- Requires **BlackHole** virtual audio device installed on macOS
- Captures system audio output (not microphone)
- Sample rate: 16000 Hz, mono, 16-bit PCM

## Code Conventions

- Follow PEP 8
- Type hints for all functions
- Async/await for API calls
- 4 spaces indentation
- Max line length: 100 characters
- Docstrings for public functions

## Commands

```bash
# Setup
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt

# Run
python src/main.py

# Install BlackHole (required for audio capture)
brew install blackhole-2ch
```

## Environment Variables

```
DEEPGRAM_API_KEY=your_key_here
OPENAI_API_KEY=your_key_here
```
