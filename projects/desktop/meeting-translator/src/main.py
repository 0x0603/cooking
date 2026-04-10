from __future__ import annotations

import sys
import asyncio
import signal
import time
import threading

from PyQt6.QtWidgets import QApplication
from PyQt6.QtCore import QTimer

from audio_capture import AudioCapture
from transcriber import Transcriber
from translator import Translator
from overlay import OverlayWindow
from config import DEEPGRAM_API_KEY, OPENAI_API_KEY, INTERIM_DEBOUNCE_MS


class MeetingTranslator:
    """Main application controller."""

    def __init__(self):
        self.audio = AudioCapture()
        self.transcriber = Transcriber()
        self.translator = Translator()
        self.overlay: OverlayWindow | None = None
        self.loop: asyncio.AbstractEventLoop | None = None
        self._current_en_text = ""
        self._last_interim_time = 0.0
        self._is_listening = False
        self._is_translating = True
        self._thread: threading.Thread | None = None

    def setup(self, overlay: OverlayWindow) -> None:
        self.overlay = overlay
        self.loop = asyncio.new_event_loop()

        self.transcriber.set_callbacks(
            on_interim=self._on_interim_transcript,
            on_final=self._on_final_transcript,
        )

        self.audio.set_callback(self._on_audio_data)

        # Connect UI buttons
        overlay.toggle_listen_signal.connect(self._toggle_listen)
        overlay.toggle_translate_signal.connect(self._toggle_translate)
        overlay.flush_signal.connect(self._flush)

    def _on_audio_data(self, audio_data) -> None:
        if self.loop and self.loop.is_running():
            asyncio.run_coroutine_threadsafe(
                self.transcriber.send_audio(audio_data),
                self.loop,
            )

    def _on_interim_transcript(self, text: str) -> None:
        self._current_en_text = text
        now = time.time()
        if now - self._last_interim_time < INTERIM_DEBOUNCE_MS / 1000:
            return
        self._last_interim_time = now
        if self.overlay:
            self.overlay.update_interim_signal.emit(text)

    def _on_final_transcript(self, text: str) -> None:
        self._current_en_text = text
        if self._is_translating and self.loop:
            asyncio.run_coroutine_threadsafe(
                self._translate_and_display(text),
                self.loop,
            )
        elif self.overlay:
            # Not translating — show English only
            self.overlay.update_final_signal.emit(text, "")

    async def _translate_and_display(self, en_text: str) -> None:
        def on_chunk(vi_text: str) -> None:
            if self.overlay:
                self.overlay.update_translation_signal.emit(vi_text)

        vi_text = await self.translator.translate_streaming(en_text, on_chunk)

        if self.overlay:
            self.overlay.update_final_signal.emit(en_text, vi_text)

    async def _start_capture(self) -> None:
        await self.transcriber.start()
        self.audio.start()

    async def _stop_capture(self) -> None:
        self.audio.stop()
        await self.transcriber.stop()

    def _toggle_listen(self) -> None:
        if self._is_listening:
            self.stop_listening()
        else:
            self.start_listening()

    def _toggle_translate(self) -> None:
        self._is_translating = not self._is_translating

    def _flush(self) -> None:
        """Force flush the transcriber buffer — translate immediately."""
        self.transcriber._flush_buffer()

    def start_listening(self) -> None:
        self._is_listening = True

        def run_async_loop():
            asyncio.set_event_loop(self.loop)
            self.loop.run_until_complete(self._start_capture())
            self.loop.run_forever()

        self._thread = threading.Thread(target=run_async_loop, daemon=True)
        self._thread.start()

        if self.overlay:
            self.overlay.set_listening(True)

    def stop_listening(self) -> None:
        self._is_listening = False
        if self.loop and self.loop.is_running():
            asyncio.run_coroutine_threadsafe(self._stop_capture(), self.loop)
            self.loop.call_soon_threadsafe(self.loop.stop)
        # Create a fresh loop for next start
        self.loop = asyncio.new_event_loop()
        if self.overlay:
            self.overlay.set_listening(False)

    def stop(self) -> None:
        if self._is_listening:
            self.stop_listening()


def check_prerequisites() -> list[str]:
    errors = []
    if not DEEPGRAM_API_KEY:
        errors.append("DEEPGRAM_API_KEY not set in .env file")
    if not OPENAI_API_KEY:
        errors.append("OPENAI_API_KEY not set in .env file")
    return errors


def main():
    print("Meeting Translator - Starting...")
    print()

    errors = check_prerequisites()
    if errors:
        print("Prerequisites not met:")
        for error in errors:
            print(f"  - {error}")
        sys.exit(1)

    app = QApplication(sys.argv)
    app.setQuitOnLastWindowClosed(True)

    overlay = OverlayWindow()
    overlay.show()

    translator = MeetingTranslator()
    translator.setup(overlay)

    # Handle Ctrl+C
    signal.signal(signal.SIGINT, lambda *args: app.quit())
    timer = QTimer()
    timer.timeout.connect(lambda: None)
    timer.start(100)

    print("Ready. Click 'Start Listening' to begin.")
    print()

    exit_code = app.exec()
    translator.stop()
    sys.exit(exit_code)


if __name__ == "__main__":
    main()
