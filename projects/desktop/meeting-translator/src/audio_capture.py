from __future__ import annotations

import ctypes
import ctypes.util
import threading
import numpy as np

import objc
import ScreenCaptureKit
import CoreMedia

from config import SAMPLE_RATE, CHANNELS

# Load libdispatch for dispatch_queue_create
_libdispatch = ctypes.cdll.LoadLibrary(ctypes.util.find_library("dispatch"))
_libdispatch.dispatch_queue_create.restype = ctypes.c_void_p
_libdispatch.dispatch_queue_create.argtypes = [ctypes.c_char_p, ctypes.c_void_p]


# ObjC delegate class for SCStream output
class StreamOutputDelegate(ScreenCaptureKit.NSObject,
                           protocols=[
                               objc.protocolNamed("SCStreamOutput"),
                               objc.protocolNamed("SCStreamDelegate"),
                           ]):
    """Receives audio samples from SCStream."""

    audio_callback = None

    @objc.python_method
    def set_audio_callback(self, callback):
        self.audio_callback = callback

    def stream_didOutputSampleBuffer_ofType_(self, stream, sample_buffer, output_type):
        if output_type == ScreenCaptureKit.SCStreamOutputTypeAudio:
            if self.audio_callback:
                self.audio_callback(sample_buffer)


class AudioCapture:
    """Captures system audio using macOS ScreenCaptureKit (no virtual audio device needed)."""

    def __init__(self):
        self._callback = None
        self._stream = None
        self._delegate = None

    def set_callback(self, callback) -> None:
        """Set callback function that receives audio data chunks (numpy int16 arrays)."""
        self._callback = callback

    def start(self) -> None:
        """Start capturing system audio via ScreenCaptureKit."""
        semaphore = threading.Semaphore(0)
        content_result = {}

        def content_handler(content, error):
            if error:
                content_result["error"] = str(error)
            else:
                content_result["content"] = content
            semaphore.release()

        ScreenCaptureKit.SCShareableContent.getShareableContentExcludingDesktopWindows_onScreenWindowsOnly_completionHandler_(
            True, True, content_handler
        )
        semaphore.acquire(timeout=10)

        if "error" in content_result:
            raise RuntimeError(
                f"ScreenCaptureKit error: {content_result['error']}. "
                "Grant Screen Recording permission in System Settings -> Privacy & Security."
            )

        content = content_result.get("content")
        if not content:
            raise RuntimeError("Failed to get shareable content.")

        displays = content.displays()
        if not displays:
            raise RuntimeError("No displays found.")

        # Capture all system audio
        filter_ = ScreenCaptureKit.SCContentFilter.alloc().initWithDisplay_excludingApplications_exceptingWindows_(
            displays[0], [], []
        )

        # Configure for audio capture
        config = ScreenCaptureKit.SCStreamConfiguration.alloc().init()
        config.setCapturesAudio_(True)
        config.setExcludesCurrentProcessAudio_(True)
        config.setSampleRate_(SAMPLE_RATE)
        config.setChannelCount_(CHANNELS)

        # Minimize video (required by API but we don't use it)
        config.setWidth_(2)
        config.setHeight_(2)
        config.setMinimumFrameInterval_(CoreMedia.CMTimeMake(1, 1))

        # Create delegate
        self._delegate = StreamOutputDelegate.alloc().init()
        self._delegate.set_audio_callback(self._on_audio_buffer)

        # Create stream
        self._stream = ScreenCaptureKit.SCStream.alloc().initWithFilter_configuration_delegate_(
            filter_, config, self._delegate
        )

        # Add audio output
        queue = objc.objc_object(c_void_p=ctypes.c_void_p(
            _libdispatch.dispatch_queue_create(b"audio_queue", None)
        ))
        success, error = self._stream.addStreamOutput_type_sampleHandlerQueue_error_(
            self._delegate,
            ScreenCaptureKit.SCStreamOutputTypeAudio,
            queue,
            None,
        )

        if not success:
            raise RuntimeError(f"Failed to add stream output: {error}")

        # Start capture
        start_semaphore = threading.Semaphore(0)
        start_error = {}

        def start_handler(error):
            if error:
                start_error["msg"] = str(error)
            start_semaphore.release()

        self._stream.startCaptureWithCompletionHandler_(start_handler)
        start_semaphore.acquire(timeout=10)

        if start_error:
            raise RuntimeError(f"Failed to start capture: {start_error['msg']}")

    def stop(self) -> None:
        """Stop capturing audio."""
        if self._stream:
            semaphore = threading.Semaphore(0)
            self._stream.stopCaptureWithCompletionHandler_(lambda err: semaphore.release())
            semaphore.acquire(timeout=5)
            self._stream = None

    def _on_audio_buffer(self, sample_buffer) -> None:
        """Convert CMSampleBuffer to numpy array and forward to callback."""
        if not self._callback:
            return

        try:
            block_buffer = CoreMedia.CMSampleBufferGetDataBuffer(sample_buffer)
            if block_buffer is None:
                return

            length = CoreMedia.CMBlockBufferGetDataLength(block_buffer)
            if length == 0:
                return

            status, data = CoreMedia.CMBlockBufferCopyDataBytes(block_buffer, 0, length, None)
            if status != 0 or data is None:
                return

            # ScreenCaptureKit outputs float32 PCM, convert to int16 for Deepgram
            audio_float = np.frombuffer(data, dtype=np.float32)
            audio_int16 = (audio_float * 32767).clip(-32768, 32767).astype(np.int16)
            self._callback(audio_int16.reshape(-1, 1))

        except Exception:
            pass
