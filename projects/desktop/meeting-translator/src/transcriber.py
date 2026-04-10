from __future__ import annotations

import asyncio
import time
from typing import Callable, Optional

import numpy as np
from deepgram import (
    DeepgramClient,
    LiveTranscriptionEvents,
    LiveOptions,
)

from config import (
    DEEPGRAM_API_KEY,
    DEEPGRAM_MODEL,
    DEEPGRAM_LANGUAGE,
    DEEPGRAM_ENDPOINTING,
    DEEPGRAM_DIARIZE,
    DEEPGRAM_KEYWORDS,
    SAMPLE_RATE,
)

# Auto-flush buffer if no new final result after this many seconds
BUFFER_FLUSH_TIMEOUT = 2.0


class Transcriber:
    """Real-time speech-to-text using Deepgram streaming.

    Buffers final results and flushes on UtteranceEnd or timeout.
    """

    def __init__(self):
        self.client = DeepgramClient(DEEPGRAM_API_KEY)
        self.connection = None
        self.on_interim: Optional[Callable[[str], None]] = None
        self.on_final: Optional[Callable[[str], None]] = None
        self._final_buffer: list[str] = []
        self._last_final_time: float = 0
        self._flush_task: Optional[asyncio.Task] = None

    def set_callbacks(
        self,
        on_interim: Callable[[str], None],
        on_final: Callable[[str], None],
    ) -> None:
        self.on_interim = on_interim
        self.on_final = on_final

    async def start(self) -> None:
        self._final_buffer.clear()
        self._last_final_time = 0
        self.connection = self.client.listen.asynclive.v("1")

        self.connection.on(LiveTranscriptionEvents.Transcript, self._on_transcript)
        self.connection.on(LiveTranscriptionEvents.UtteranceEnd, self._on_utterance_end)
        self.connection.on(LiveTranscriptionEvents.Error, self._on_error)

        options = LiveOptions(
            model=DEEPGRAM_MODEL,
            language=DEEPGRAM_LANGUAGE,
            smart_format=True,
            interim_results=True,
            utterance_end_ms="3000",
            endpointing=DEEPGRAM_ENDPOINTING,
            diarize=DEEPGRAM_DIARIZE,
            sample_rate=SAMPLE_RATE,
            channels=1,
            encoding="linear16",
        )

        if DEEPGRAM_KEYWORDS:
            options.keywords = DEEPGRAM_KEYWORDS

        await self.connection.start(options)

    async def send_audio(self, audio_data: np.ndarray) -> None:
        if self.connection:
            await self.connection.send(audio_data.tobytes())

    async def stop(self) -> None:
        self._flush_buffer()
        if self._flush_task:
            self._flush_task.cancel()
            self._flush_task = None
        if self.connection:
            await self.connection.finish()
            self.connection = None

    def _get_speaker_text(self, result) -> str:
        """Extract transcript with speaker labels from result."""
        alt = result.channel.alternatives[0]
        transcript = alt.transcript.strip()
        if not transcript:
            return ""

        # Try to get speaker from words
        if DEEPGRAM_DIARIZE and hasattr(alt, "words") and alt.words:
            segments = []
            current_speaker = None
            current_words = []

            for word in alt.words:
                speaker = getattr(word, "speaker", None)
                if speaker != current_speaker and current_words:
                    label = f"[S{current_speaker}]" if current_speaker is not None else ""
                    segments.append(f"{label} {' '.join(current_words)}")
                    current_words = []
                current_speaker = speaker
                current_words.append(word.word)

            if current_words:
                label = f"[S{current_speaker}]" if current_speaker is not None else ""
                segments.append(f"{label} {' '.join(current_words)}")

            return " ".join(segments).strip()

        return transcript

    async def _on_transcript(self, _self, result, **kwargs) -> None:
        transcript = result.channel.alternatives[0].transcript
        if not transcript.strip():
            return

        is_final = result.is_final

        if is_final:
            speaker_text = self._get_speaker_text(result)
            self._final_buffer.append(speaker_text)
            self._last_final_time = time.time()

            if self.on_interim:
                full_text = " ".join(self._final_buffer)
                self.on_interim(full_text)

            self._schedule_flush()
        elif self.on_interim:
            parts = self._final_buffer + [transcript.strip()]
            self.on_interim(" ".join(parts))

    async def _on_utterance_end(self, _self, utterance_end=None, **kwargs) -> None:
        """Speaker stopped talking — flush buffer and translate."""
        self._flush_buffer()

    def _schedule_flush(self) -> None:
        """Schedule a buffer flush after timeout, cancel previous if exists."""
        if self._flush_task:
            self._flush_task.cancel()

        loop = asyncio.get_event_loop()
        self._flush_task = loop.create_task(self._delayed_flush())

    async def _delayed_flush(self) -> None:
        """Wait for timeout, then flush if no new finals arrived."""
        await asyncio.sleep(BUFFER_FLUSH_TIMEOUT)
        # Only flush if nothing new came in during the wait
        if self._final_buffer and time.time() - self._last_final_time >= BUFFER_FLUSH_TIMEOUT - 0.1:
            self._flush_buffer()

    def _flush_buffer(self) -> None:
        if self._final_buffer and self.on_final:
            full_text = " ".join(self._final_buffer)
            self.on_final(full_text)
        self._final_buffer.clear()
        if self._flush_task:
            self._flush_task.cancel()
            self._flush_task = None

    async def _on_error(self, _self, error, **kwargs) -> None:
        pass
