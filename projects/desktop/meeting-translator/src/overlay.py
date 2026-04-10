from __future__ import annotations

from PyQt6.QtWidgets import (
    QMainWindow,
    QWidget,
    QVBoxLayout,
    QHBoxLayout,
    QLabel,
    QScrollArea,
    QPushButton,
    QSizeGrip,
    QApplication,
)
from PyQt6.QtCore import Qt, pyqtSignal, QPoint, QSize, QTimer
from PyQt6.QtGui import QFont, QCursor

from config import (
    OVERLAY_MIN_WIDTH,
    OVERLAY_MIN_HEIGHT,
    OVERLAY_DEFAULT_WIDTH,
    OVERLAY_DEFAULT_HEIGHT,
    OVERLAY_OPACITY,
    OVERLAY_FONT_SIZE_EN,
    OVERLAY_FONT_SIZE_VI,
    MAX_HISTORY_LINES,
)

# Colors
BG_PRIMARY = "#0f0f1a"
BG_SURFACE = "#1a1a2e"
BG_HOVER = "#252540"
TEXT_PRIMARY = "#f0f0f0"
TEXT_SECONDARY = "#8888aa"
TEXT_EN = "#c8c8d8"
TEXT_VI = "#64d2ff"
ACCENT = "#6c5ce7"
ACCENT_HOVER = "#7c6cf7"
RED = "#ff4757"
RED_HOVER = "#ff6b7a"
GREEN = "#2ed573"
YELLOW = "#ffa502"
BORDER = "#2a2a45"


GLOBAL_STYLE = f"""
    QWidget#central {{
        background-color: {BG_PRIMARY};
        border: 1px solid {BORDER};
        border-radius: 14px;
    }}
    QScrollArea {{
        border: none;
        background: transparent;
    }}
    QScrollArea > QWidget > QWidget {{
        background: transparent;
    }}
    QScrollBar:vertical {{
        width: 5px;
        background: transparent;
        margin: 4px 1px;
    }}
    QScrollBar::handle:vertical {{
        background: {BORDER};
        border-radius: 2px;
        min-height: 20px;
    }}
    QScrollBar::handle:vertical:hover {{
        background: {TEXT_SECONDARY};
    }}
    QScrollBar::add-line:vertical, QScrollBar::sub-line:vertical {{
        height: 0;
    }}
"""


class SubtitleEntry(QWidget):
    """A single subtitle entry with English and Vietnamese text."""

    def __init__(self, parent=None):
        super().__init__(parent)
        layout = QVBoxLayout(self)
        layout.setContentsMargins(14, 6, 14, 6)
        layout.setSpacing(3)

        self.en_label = QLabel()
        self.en_label.setWordWrap(True)
        self.en_label.setTextFormat(Qt.TextFormat.PlainText)
        self.en_label.setStyleSheet(f"""
            color: {TEXT_EN};
            font-size: {OVERLAY_FONT_SIZE_EN}px;
            font-family: 'SF Pro Text', 'Helvetica Neue', -apple-system, sans-serif;
            padding: 0;
            background: transparent;
        """)

        self.vi_label = QLabel()
        self.vi_label.setWordWrap(True)
        self.vi_label.setTextFormat(Qt.TextFormat.PlainText)
        self.vi_label.setStyleSheet(f"""
            color: {TEXT_VI};
            font-size: {OVERLAY_FONT_SIZE_VI}px;
            font-weight: 600;
            font-family: 'SF Pro Text', 'Helvetica Neue', -apple-system, sans-serif;
            padding: 0;
            background: transparent;
        """)

        layout.addWidget(self.en_label)
        layout.addWidget(self.vi_label)

        self.setStyleSheet(f"""
            SubtitleEntry {{
                background-color: {BG_SURFACE};
                border-radius: 8px;
            }}
        """)

    def set_text(self, en: str, vi: str) -> None:
        self.en_label.setText(en)
        if vi:
            self.vi_label.setText(vi)
            self.vi_label.show()
        else:
            self.vi_label.setText("")
            self.vi_label.hide()


def _btn_style(bg: str, bg_hover: str, fg: str = "white", radius: int = 8) -> str:
    return f"""
        QPushButton {{
            background-color: {bg};
            color: {fg};
            border: none;
            border-radius: {radius}px;
            font-size: 12px;
            font-weight: 600;
            font-family: 'SF Pro Text', -apple-system, sans-serif;
            padding: 5px 14px;
        }}
        QPushButton:hover {{
            background-color: {bg_hover};
        }}
        QPushButton:pressed {{
            opacity: 0.8;
        }}
    """


class OverlayWindow(QMainWindow):
    """Floating overlay window for displaying translated subtitles."""

    update_interim_signal = pyqtSignal(str)
    update_final_signal = pyqtSignal(str, str)
    update_translation_signal = pyqtSignal(str)

    # Signals to main controller
    toggle_listen_signal = pyqtSignal()
    toggle_translate_signal = pyqtSignal()
    flush_signal = pyqtSignal()

    def __init__(self):
        super().__init__()
        self._drag_position: QPoint | None = None
        self._is_listening = False
        self._is_translating = True
        self._entries: list[SubtitleEntry] = []
        self._current_interim: SubtitleEntry | None = None

        self._setup_window()
        self._setup_ui()
        self._connect_signals()

    def _setup_window(self) -> None:
        self.setWindowTitle("Meeting Translator")
        self.setMinimumSize(OVERLAY_MIN_WIDTH, OVERLAY_MIN_HEIGHT)
        self.resize(OVERLAY_DEFAULT_WIDTH, OVERLAY_DEFAULT_HEIGHT)
        self.setWindowFlags(
            Qt.WindowType.WindowStaysOnTopHint
            | Qt.WindowType.FramelessWindowHint
        )
        self.setAttribute(Qt.WidgetAttribute.WA_TranslucentBackground)
        self.setWindowOpacity(OVERLAY_OPACITY)

        # Hide from screen recording / screenshots
        try:
            from AppKit import NSWindow
            ns_window = self.winId().__int__()
            cocoa_window = NSWindow.alloc().initWithWindowRef_(ns_window)
            cocoa_window.setSharingType_(0)  # NSWindowSharingNone
        except Exception:
            pass

    def _setup_ui(self) -> None:
        central = QWidget()
        central.setObjectName("central")
        central.setStyleSheet(GLOBAL_STYLE)
        self.setCentralWidget(central)

        main_layout = QVBoxLayout(central)
        main_layout.setContentsMargins(0, 0, 0, 0)
        main_layout.setSpacing(0)

        # === Title bar ===
        title_bar = QWidget()
        title_bar.setFixedHeight(42)
        title_bar.setStyleSheet(f"""
            QWidget {{
                background-color: {BG_SURFACE};
                border-top-left-radius: 14px;
                border-top-right-radius: 14px;
                border-bottom: 1px solid {BORDER};
            }}
        """)
        title_layout = QHBoxLayout(title_bar)
        title_layout.setContentsMargins(14, 0, 10, 0)
        title_layout.setSpacing(8)

        # Status dot + label
        self._status_dot = QLabel()
        self._status_dot.setFixedSize(8, 8)
        self._update_status_dot(False)

        title_label = QLabel("Meeting Translator")
        title_label.setStyleSheet(f"""
            color: {TEXT_PRIMARY};
            font-size: 13px;
            font-weight: 600;
            font-family: 'SF Pro Text', -apple-system, sans-serif;
            background: transparent;
            border: none;
        """)

        self.status_label = QLabel("Stopped")
        self.status_label.setStyleSheet(f"""
            color: {TEXT_SECONDARY};
            font-size: 11px;
            font-family: 'SF Pro Text', -apple-system, sans-serif;
            background: transparent;
            border: none;
        """)

        title_layout.addWidget(self._status_dot)
        title_layout.addWidget(title_label)
        title_layout.addWidget(self.status_label)
        title_layout.addStretch()

        # Close button
        close_btn = QPushButton("x")
        close_btn.setFixedSize(26, 26)
        close_btn.setCursor(QCursor(Qt.CursorShape.PointingHandCursor))
        close_btn.setStyleSheet(f"""
            QPushButton {{
                background-color: transparent;
                color: {TEXT_SECONDARY};
                border: none;
                border-radius: 13px;
                font-size: 14px;
                font-weight: bold;
            }}
            QPushButton:hover {{
                background-color: {RED};
                color: white;
            }}
        """)
        close_btn.clicked.connect(self.close)

        title_layout.addWidget(close_btn)
        main_layout.addWidget(title_bar)

        # === Subtitle area ===
        scroll = QScrollArea()
        scroll.setWidgetResizable(True)
        scroll.setHorizontalScrollBarPolicy(Qt.ScrollBarPolicy.ScrollBarAlwaysOff)

        self.scroll_content = QWidget()
        self.scroll_content.setStyleSheet("background: transparent;")
        self.scroll_layout = QVBoxLayout(self.scroll_content)
        self.scroll_layout.setContentsMargins(8, 8, 8, 8)
        self.scroll_layout.setSpacing(6)
        self.scroll_layout.addStretch()

        scroll.setWidget(self.scroll_content)
        self.scroll_area = scroll
        main_layout.addWidget(scroll, 1)

        # === Bottom toolbar ===
        toolbar = QWidget()
        toolbar.setFixedHeight(46)
        toolbar.setStyleSheet(f"""
            QWidget {{
                background-color: {BG_SURFACE};
                border-bottom-left-radius: 14px;
                border-bottom-right-radius: 14px;
                border-top: 1px solid {BORDER};
            }}
        """)
        toolbar_layout = QHBoxLayout(toolbar)
        toolbar_layout.setContentsMargins(12, 0, 12, 0)
        toolbar_layout.setSpacing(8)

        # Listen button
        self._listen_btn = QPushButton("Start Listening")
        self._listen_btn.setFixedHeight(30)
        self._listen_btn.setCursor(QCursor(Qt.CursorShape.PointingHandCursor))
        self._listen_btn.setStyleSheet(_btn_style(ACCENT, ACCENT_HOVER))
        self._listen_btn.clicked.connect(self._on_toggle_listen)

        # Translate toggle button
        self._translate_btn = QPushButton("Translate: ON")
        self._translate_btn.setFixedHeight(30)
        self._translate_btn.setCursor(QCursor(Qt.CursorShape.PointingHandCursor))
        self._translate_btn.setStyleSheet(_btn_style(GREEN, "#3ae080", fg="black"))
        self._translate_btn.clicked.connect(self._on_toggle_translate)

        # Flush button — force translate current buffer
        flush_btn = QPushButton("Flush")
        flush_btn.setFixedHeight(30)
        flush_btn.setCursor(QCursor(Qt.CursorShape.PointingHandCursor))
        flush_btn.setStyleSheet(_btn_style(YELLOW, "#ffb732", fg="black"))
        flush_btn.clicked.connect(lambda: self.flush_signal.emit())

        # Clear button
        clear_btn = QPushButton("Clear")
        clear_btn.setFixedHeight(30)
        clear_btn.setCursor(QCursor(Qt.CursorShape.PointingHandCursor))
        clear_btn.setStyleSheet(_btn_style(BG_HOVER, BORDER, fg=TEXT_SECONDARY))
        clear_btn.clicked.connect(self._clear_entries)

        toolbar_layout.addWidget(self._listen_btn)
        toolbar_layout.addWidget(self._translate_btn)
        toolbar_layout.addWidget(flush_btn)
        toolbar_layout.addStretch()
        toolbar_layout.addWidget(clear_btn)

        # Resize grip
        grip = QSizeGrip(self)
        grip.setFixedSize(14, 14)
        grip.setStyleSheet("background: transparent;")
        toolbar_layout.addWidget(grip, 0, Qt.AlignmentFlag.AlignBottom)

        main_layout.addWidget(toolbar)

    def _connect_signals(self) -> None:
        self.update_interim_signal.connect(self._on_interim)
        self.update_final_signal.connect(self._on_final)
        self.update_translation_signal.connect(self._on_translation_update)

    def _update_status_dot(self, active: bool) -> None:
        color = RED if active else TEXT_SECONDARY
        self._status_dot.setStyleSheet(f"""
            background-color: {color};
            border-radius: 4px;
            border: none;
        """)

    def _on_toggle_listen(self) -> None:
        self.toggle_listen_signal.emit()

    def _on_toggle_translate(self) -> None:
        self._is_translating = not self._is_translating
        if self._is_translating:
            self._translate_btn.setText("Translate: ON")
            self._translate_btn.setStyleSheet(_btn_style(GREEN, "#3ae080", fg="black"))
        else:
            self._translate_btn.setText("Translate: OFF")
            self._translate_btn.setStyleSheet(_btn_style(TEXT_SECONDARY, BORDER, fg="white"))
        self.toggle_translate_signal.emit()

    def is_translating(self) -> bool:
        return self._is_translating

    def set_listening(self, listening: bool) -> None:
        self._is_listening = listening
        self._update_status_dot(listening)
        if listening:
            self.status_label.setText("Listening...")
            self._listen_btn.setText("Stop Listening")
            self._listen_btn.setStyleSheet(_btn_style(RED, RED_HOVER))
        else:
            self.status_label.setText("Stopped")
            self._listen_btn.setText("Start Listening")
            self._listen_btn.setStyleSheet(_btn_style(ACCENT, ACCENT_HOVER))

    def _on_interim(self, text: str) -> None:
        if not self._current_interim:
            self._current_interim = SubtitleEntry()
            insert_pos = self.scroll_layout.count() - 1
            self.scroll_layout.insertWidget(insert_pos, self._current_interim)

        self._current_interim.set_text(text, "")
        self._scroll_to_bottom()

    def _on_final(self, en_text: str, vi_text: str) -> None:
        if self._current_interim:
            self._current_interim.set_text(en_text, vi_text)
            self._entries.append(self._current_interim)
            self._current_interim = None
        else:
            entry = SubtitleEntry()
            entry.set_text(en_text, vi_text)
            insert_pos = self.scroll_layout.count() - 1
            self.scroll_layout.insertWidget(insert_pos, entry)
            self._entries.append(entry)

        self._scroll_to_bottom()
        self._trim_old_entries()

    def _on_translation_update(self, vi_text: str) -> None:
        if self._current_interim:
            en_text = self._current_interim.en_label.text()
            self._current_interim.set_text(en_text, vi_text)

    def _scroll_to_bottom(self) -> None:
        QTimer.singleShot(10, lambda: self.scroll_area.verticalScrollBar().setValue(
            self.scroll_area.verticalScrollBar().maximum()
        ))

    def _trim_old_entries(self) -> None:
        while len(self._entries) > MAX_HISTORY_LINES:
            old = self._entries.pop(0)
            self.scroll_layout.removeWidget(old)
            old.deleteLater()

    def _clear_entries(self) -> None:
        for entry in self._entries:
            self.scroll_layout.removeWidget(entry)
            entry.deleteLater()
        self._entries.clear()
        if self._current_interim:
            self.scroll_layout.removeWidget(self._current_interim)
            self._current_interim.deleteLater()
            self._current_interim = None

    # Drag support — only from title bar area (top 42px)
    def mousePressEvent(self, event) -> None:
        if event.button() == Qt.MouseButton.LeftButton and event.position().y() < 42:
            self._drag_position = (
                event.globalPosition().toPoint() - self.frameGeometry().topLeft()
            )

    def mouseMoveEvent(self, event) -> None:
        if self._drag_position and event.buttons() == Qt.MouseButton.LeftButton:
            self.move(event.globalPosition().toPoint() - self._drag_position)

    def mouseReleaseEvent(self, event) -> None:
        self._drag_position = None
