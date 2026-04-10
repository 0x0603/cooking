# Meeting Translator

## Overview

A macOS desktop app that captures English audio from meetings (Zoom, Teams, Google Meet, etc.) and provides real-time Vietnamese translation as a floating overlay. Also supports typing Vietnamese to translate to English.

## Architecture

```
ScreenCaptureKit (system audio capture, no virtual device needed)
       │
       ▼
Deepgram Streaming STT (English transcript)
       │
       ├── Interim results → Show English immediately (debounced 500ms)
       ├── Final results → Buffer until utterance end
       └── UtteranceEnd / timeout (2s) → Flush buffer → Translate
       │
       ▼
GPT-4o-mini Translation
       ├── EN → VI (streaming, live panel)
       └── VI → EN (input panel)
       │
       ▼
PyQt6 Overlay Window (floating, always-on-top, hidden from screen recording)
```

## Tech Stack

- **Language**: Python 3.12+
- **Audio Capture**: ScreenCaptureKit (macOS native, via pyobjc)
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
│   ├── main.py              # App entry point + controller
│   ├── audio_capture.py     # ScreenCaptureKit system audio capture
│   ├── transcriber.py       # Deepgram streaming STT with utterance buffering
│   ├── translator.py        # GPT-4o-mini EN↔VI translation
│   ├── overlay.py           # PyQt6 split-panel overlay window
│   └── config.py            # Configuration and constants
├── .env                     # API keys (not committed)
├── .env.example             # API keys template
├── requirements.txt         # Python dependencies
├── setup.py                 # py2app build config
├── CLAUDE.md                # This file
└── README.md                # Project documentation
```

## Key Design Decisions

### Two-panel UI

- **Left panel**: Live EN → VI translation (from meeting audio)
- **Right panel**: VI → EN input (type Vietnamese, get English)
- Splitter for resizable panels, 50/50 default

### Utterance Buffering

- Deepgram `is_final` results are buffered, not translated immediately
- Buffer flushes on `UtteranceEnd` event (3s silence) or auto-timeout (2s)
- Prevents sentence fragments from being translated separately

### Hidden from Screen Recording

- `NSWindow.setSharingType_(0)` hides overlay from screen share/recording
- Safe to use during interviews and meetings

### Audio Capture

- Uses **ScreenCaptureKit** (macOS 13+) — no BlackHole or virtual audio device needed
- Captures all system audio, excludes own process audio
- Requires Screen Recording permission for the terminal app

### Deepgram Config

- Model: `nova-2`
- `endpointing`: 2500ms
- `utterance_end_ms`: 3000ms
- `smart_format`: true
- `keywords`: IT + crypto domain terms boosted
- `diarize`: available but off by default

## Code Conventions

- Python 3.12+, `from __future__ import annotations` in all files
- Type hints for all functions
- Async/await for API calls
- 4 spaces indentation
- Max line length: 100 characters

## Commands

```bash
# Setup
python3.12 -m venv venv
source venv/bin/activate
pip install -r requirements.txt

# Run
python src/main.py

# Build .app (optional)
python setup.py py2app
```

## Environment Variables

```
DEEPGRAM_API_KEY=your_key_here
OPENAI_API_KEY=your_key_here
```

`.env` is searched in: project dir, `~/.meeting-translator.env`
