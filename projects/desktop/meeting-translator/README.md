# Meeting Translator

Real-time English → Vietnamese translator for macOS meetings with a Vietnamese → English input panel. Captures system audio from Zoom, Teams, Google Meet, etc. and displays translated subtitles as a floating overlay.

## Features

- **Live EN → VI**: Captures meeting audio and translates to Vietnamese in real-time
- **VI → EN Input**: Type Vietnamese, get English translation (for composing responses)
- **Hidden from screen share**: Overlay is invisible in Zoom/Meet/Teams screen sharing
- **No virtual audio device**: Uses macOS ScreenCaptureKit directly
- **IT & Crypto terminology**: Keeps technical terms in English, boosted keyword recognition
- **Utterance buffering**: Waits for complete sentences before translating
- **Always-on-top**: Floating overlay stays visible across all apps

## Prerequisites

- macOS 13+
- Python 3.12+

## Setup

```bash
# Create virtual environment
python3.12 -m venv venv
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Configure API keys
cp .env.example .env
# Edit .env with your API keys
```

### Permissions

First run will require **Screen & System Audio Recording** permission:

1. Go to **System Settings → Privacy & Security → Screen & System Audio Recording**
2. Enable your terminal app (Terminal, iTerm, Antigravity, VS Code, etc.)
3. Restart terminal

## Usage

```bash
source venv/bin/activate
python src/main.py
```

### Controls

| Button                   | Action                                      |
| ------------------------ | ------------------------------------------- |
| **Start/Stop Listening** | Toggle audio capture + transcription        |
| **Translate: ON/OFF**    | Toggle Vietnamese translation (default OFF) |
| **Flush**                | Force translate current buffered text       |
| **Clear**                | Clear all translation history               |
| **Enter** (in input box) | Translate Vietnamese → English              |

### UI Layout

```
┌──────────────────────────────────────────────┐
│ ● Meeting Translator  Listening...         x │
├──────────────────────┬───────────────────────┤
│  EN → VI (Live)      │  VI → EN (Type)       │
│                      │                       │
│  English text...     │  Vietnamese input...  │
│  Vietnamese text...  │  English output...    │
│                      ├───────────────────────┤
│                      │ [Input box]    [Dich] │
├──────────────────────┴───────────────────────┤
│ [Listen] [Translate] [Flush]         [Clear] │
└──────────────────────────────────────────────┘
```

## Cost Estimate

| Service                               | Cost per hour   |
| ------------------------------------- | --------------- |
| Deepgram (continuous speech)          | ~$0.26          |
| GPT-4o-mini translation               | ~$0.01-0.02     |
| **Realistic meeting (40-50% speech)** | **~$0.10-0.15** |

## Environment Variables

| Variable           | Description                                                                |
| ------------------ | -------------------------------------------------------------------------- |
| `DEEPGRAM_API_KEY` | Deepgram API key ([deepgram.com](https://deepgram.com) — $200 free credit) |
| `OPENAI_API_KEY`   | OpenAI API key ([platform.openai.com](https://platform.openai.com))        |
