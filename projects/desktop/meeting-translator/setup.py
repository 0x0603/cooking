from setuptools import setup

APP = ["src/main.py"]
DATA_FILES = []
OPTIONS = {
    "argv_emulation": False,
    "packages": [
        "PyQt6",
        "deepgram",
        "openai",
        "numpy",
        "dotenv",
        "objc",
        "ScreenCaptureKit",
        "CoreMedia",
        "AVFoundation",
        "CoreAudio",
    ],
    "includes": [
        "config",
        "audio_capture",
        "transcriber",
        "translator",
        "overlay",
    ],
    "plist": {
        "CFBundleName": "Meeting Translator",
        "CFBundleDisplayName": "Meeting Translator",
        "CFBundleIdentifier": "com.sangnguyen.meeting-translator",
        "CFBundleVersion": "1.0.0",
        "CFBundleShortVersionString": "1.0.0",
        "LSMinimumSystemVersion": "13.0",
        "NSMicrophoneUsageDescription": "Meeting Translator needs microphone access to capture audio.",
        "NSScreenCaptureUsageDescription": "Meeting Translator needs screen recording access to capture system audio.",
    },
}

setup(
    app=APP,
    data_files=DATA_FILES,
    options={"py2app": OPTIONS},
    setup_requires=["py2app"],
)
