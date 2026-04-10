# Meeting Translator

Real-time English → Vietnamese translator for macOS meetings. Captures system audio from Zoom, Teams, Google Meet, etc. and displays Vietnamese subtitles as a floating overlay.

## How It Works

1. **BlackHole** captures system audio (meeting audio)
2. **Deepgram Nova-2** transcribes English speech in real-time (streaming)
3. **GPT-4o-mini** translates to Vietnamese with streaming response
4. **PyQt6** overlay window shows subtitles on top of all windows

## Prerequisites

- macOS 13+
- Python 3.9+
- BlackHole virtual audio device

## Setup

```bash
# Install BlackHole for system audio capture
brew install blackhole-2ch

# Create virtual environment
python3 -m venv venv
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Configure API keys
cp .env.example .env
# Edit .env with your API keys
```

### Audio Routing (BlackHole)

To capture meeting audio, set up a **Multi-Output Device** in macOS:

1. Open **Audio MIDI Setup** (search in Spotlight)
2. Click **+** → **Create Multi-Output Device**
3. Check both **BlackHole 2ch** and your **speakers/headphones**
4. Set this Multi-Output Device as your **system output** in System Settings → Sound

This routes audio to both your ears and the translator.

## Usage

```bash
source venv/bin/activate
python src/main.py
```

- The overlay window stays on top of all windows
- Drag to reposition
- Click **x** to close
- Press **Ctrl+C** in terminal to stop

## Cost Estimate

| Service                   | Cost            |
| ------------------------- | --------------- |
| Deepgram (1 hour meeting) | ~$0.26          |
| GPT-4o-mini translation   | ~$0.01-0.02     |
| **Total per hour**        | **~$0.05-0.10** |

## Environment Variables

| Variable           | Description                                                                |
| ------------------ | -------------------------------------------------------------------------- |
| `DEEPGRAM_API_KEY` | Deepgram API key ([deepgram.com](https://deepgram.com) — $200 free credit) |
| `OPENAI_API_KEY`   | OpenAI API key                                                             |
