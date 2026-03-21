from __future__ import annotations

import asyncio
import json
import logging
import os
import re
import subprocess
import tempfile
import time
from html import escape as html_escape
from pathlib import Path

from dotenv import load_dotenv
from telegram import Update
from telegram.constants import ChatAction
from telegram.ext import (
    Application,
    CommandHandler,
    ContextTypes,
    MessageHandler,
    filters,
)

load_dotenv()

TELEGRAM_BOT_TOKEN = os.getenv("TELEGRAM_BOT_TOKEN")
TELEGRAM_USER_ID = int(os.getenv("TELEGRAM_USER_ID", "0"))
REPO_PATH = os.getenv("REPO_PATH", ".")
CLAUDE_PATH = os.getenv("CLAUDE_PATH", "claude")
DATA_DIR = Path(os.getenv("DATA_DIR", "data"))
SESSIONS_FILE = DATA_DIR / "sessions.json"

logging.basicConfig(
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
    level=logging.INFO,
)
logger = logging.getLogger(__name__)


# --- Session persistence ---
# Structure: {chat_id: {"current": session_id|null, "saved": {name: session_id}}}

def _default_chat_data() -> dict:
    return {"current": None, "saved": {}}


def _load_sessions() -> dict[int, dict]:
    if SESSIONS_FILE.exists():
        try:
            data = json.loads(SESSIONS_FILE.read_text())
            result = {}
            for k, v in data.items():
                if isinstance(v, str):
                    # Migrate old format: {chat_id: session_id}
                    result[int(k)] = {"current": v, "saved": {}}
                else:
                    result[int(k)] = v
            return result
        except Exception:
            logger.warning("Failed to load sessions file, starting fresh")
    return {}


def _save_sessions():
    DATA_DIR.mkdir(parents=True, exist_ok=True)
    SESSIONS_FILE.write_text(json.dumps(
        {str(k): v for k, v in sessions.items()},
        indent=2,
    ))


def _get_current_session(chat_id: int) -> str | None:
    return sessions.get(chat_id, _default_chat_data()).get("current")


def _set_current_session(chat_id: int, session_id: str | None):
    if chat_id not in sessions:
        sessions[chat_id] = _default_chat_data()
    sessions[chat_id]["current"] = session_id
    _save_sessions()


# Store claude session data per telegram chat
sessions: dict[int, dict] = _load_sessions()
# Track message IDs for /clear
message_ids: dict[int, list[int]] = {}
# Per-chat lock to prevent concurrent Claude calls
chat_locks: dict[int, asyncio.Lock] = {}


def get_lock(chat_id: int) -> asyncio.Lock:
    if chat_id not in chat_locks:
        chat_locks[chat_id] = asyncio.Lock()
    return chat_locks[chat_id]


def track_message(chat_id: int, msg_id: int):
    message_ids.setdefault(chat_id, []).append(msg_id)


def is_authorized(update: Update) -> bool:
    return update.effective_user.id == TELEGRAM_USER_ID


# ---------------------------------------------------------------------------
# Markdown → Telegram HTML converter
# ---------------------------------------------------------------------------

def _convert_inline(text: str) -> str:
    """Convert inline markdown (bold, italic, strikethrough, code, links) to HTML.

    Process order: extract links and code spans first (protect their
    content), then convert bold/italic/strikethrough on the remaining text.
    """
    # Step 1: extract inline code and links into placeholders
    placeholders: list[str] = []

    def _placeholder(html: str) -> str:
        idx = len(placeholders)
        placeholders.append(html)
        return f"\x00PH{idx}\x00"

    # inline code  `code`
    def _code_repl(m):
        return _placeholder(f"<code>{html_escape(m.group(1))}</code>")

    text = re.sub(r"`([^`]+)`", _code_repl, text)

    # links [text](url) — extract before escaping so URL stays clean
    def _link_repl(m):
        label = html_escape(m.group(1))
        url = m.group(2)  # don't double-escape the URL
        return _placeholder(f'<a href="{url}">{label}</a>')

    text = re.sub(r"\[([^\]]+)\]\(([^)]+)\)", _link_repl, text)

    # Step 2: escape remaining text for HTML (quote=False to keep ' and " readable)
    t = html_escape(text, quote=False)

    # Step 3: bold / italic / strikethrough
    t = re.sub(r"\*\*(.+?)\*\*", r"<b>\1</b>", t)
    t = re.sub(r"__(.+?)__", r"<b>\1</b>", t)
    t = re.sub(r"(?<!\w)\*([^*]+?)\*(?!\w)", r"<i>\1</i>", t)
    t = re.sub(r"(?<!\w)_([^_]+?)_(?!\w)", r"<i>\1</i>", t)
    t = re.sub(r"~~(.+?)~~", r"<s>\1</s>", t)

    # Step 4: restore placeholders
    for idx, html in enumerate(placeholders):
        t = t.replace(f"\x00PH{idx}\x00", html)

    return t


def _markdown_table_to_list(table_lines: list[str]) -> str:
    """Convert markdown table into a vertical list format for mobile-friendly display.

    Instead of trying to preserve columns (which wrap badly on mobile),
    render each data row as a labeled block:
        Header1: value1
        Header2: value2
        ───
    """
    rows: list[list[str]] = []
    for line in table_lines:
        stripped = line.strip().strip("|")
        # skip separator rows  |---|---|
        if re.match(r"^[\s|:\-]+$", stripped):
            continue
        cells = [c.strip() for c in stripped.split("|")]
        rows.append(cells)

    if not rows:
        return ""

    headers = rows[0]
    data_rows = rows[1:]

    if not data_rows:
        # header-only table — just show as a single line
        return " │ ".join(headers)

    out: list[str] = []
    for row in data_rows:
        for i, header in enumerate(headers):
            val = row[i] if i < len(row) else ""
            if val:
                out.append(f"<b>{html_escape(header)}</b>: {_convert_inline(val)}")
        out.append("───")

    # remove trailing separator
    if out and out[-1] == "───":
        out.pop()

    return "\n".join(out)


def format_for_telegram(text: str) -> str:
    """Convert Claude's GitHub-flavoured Markdown to Telegram HTML.

    Returns (html_string).  Caller should set parse_mode='HTML'.
    Falls back to escaped plain text if something goes wrong.
    """
    try:
        return _do_format(text)
    except Exception:
        logger.warning("Markdown→HTML conversion failed, sending plain text")
        return html_escape(text)


def _do_format(text: str) -> str:
    lines = text.split("\n")
    result: list[str] = []
    i = 0

    while i < len(lines):
        line = lines[i]

        # --- fenced code block ```
        if line.strip().startswith("```"):
            block_lines: list[str] = []
            i += 1
            while i < len(lines) and not lines[i].strip().startswith("```"):
                block_lines.append(lines[i])
                i += 1
            if i < len(lines):
                i += 1  # skip closing ```
            # else: unclosed block (streaming mid-chunk) — still render what we have
            code = html_escape("\n".join(block_lines))
            result.append(f"<pre>{code}</pre>")
            continue

        # --- markdown table (line starts with |)
        if line.strip().startswith("|"):
            table_lines: list[str] = []
            while i < len(lines) and lines[i].strip().startswith("|"):
                table_lines.append(lines[i])
                i += 1
            result.append(_markdown_table_to_list(table_lines))
            continue

        # --- headings  # ## ### etc.
        hm = re.match(r"^(#{1,6})\s+(.+)$", line)
        if hm:
            heading_text = _convert_inline(hm.group(2))
            result.append(f"<b>{heading_text}</b>")
            i += 1
            continue

        # --- unordered list  - or *
        lm = re.match(r"^(\s*)[*\-]\s+(.+)$", line)
        if lm:
            indent = len(lm.group(1)) // 2
            bullet = "  " * indent + "•"
            result.append(f"{bullet} {_convert_inline(lm.group(2))}")
            i += 1
            continue

        # --- ordered list  1. 2. etc.
        om = re.match(r"^(\s*)\d+\.\s+(.+)$", line)
        if om:
            indent = len(om.group(1)) // 2
            # keep the number
            num_match = re.match(r"^(\s*)(\d+)\.\s+", line)
            num = num_match.group(2) if num_match else "•"
            prefix = "  " * indent + num + "."
            result.append(f"{prefix} {_convert_inline(om.group(2))}")
            i += 1
            continue

        # --- horizontal rule
        if re.match(r"^[\s]*[-*_]{3,}\s*$", line):
            result.append("───────────")
            i += 1
            continue

        # --- blockquote > text
        bq = re.match(r"^>\s*(.*)", line)
        if bq:
            result.append(f"▎ <i>{_convert_inline(bq.group(1))}</i>")
            i += 1
            continue

        # --- normal line
        result.append(_convert_inline(line))
        i += 1

    return "\n".join(result)


def _strip_html(text: str) -> str:
    """Remove HTML tags and unescape entities so fallback plain text is clean."""
    text = re.sub(r"<[^>]+>", "", text)
    # unescape HTML entities back to plain characters
    text = text.replace("&lt;", "<").replace("&gt;", ">")
    text = text.replace("&amp;", "&").replace("&quot;", '"')
    return text


async def _safe_edit(message, text: str, parse_mode: str | None = "HTML"):
    """Edit a message with HTML, fallback to plain text if parse fails."""
    try:
        await message.edit_text(text, parse_mode=parse_mode, disable_web_page_preview=True)
    except Exception as e:
        logger.warning("HTML edit failed: %s", e)
        try:
            await message.edit_text(_strip_html(text), disable_web_page_preview=True)
        except Exception:
            pass


async def _safe_reply(update_message, text: str, parse_mode: str | None = "HTML"):
    """Reply with HTML, fallback to plain text if parse fails."""
    try:
        return await update_message.reply_text(text, parse_mode=parse_mode, disable_web_page_preview=True)
    except Exception as e:
        logger.warning("HTML reply failed: %s", e)
        return await update_message.reply_text(_strip_html(text), disable_web_page_preview=True)


async def run_claude_stream(
    prompt: str, message, chat_id: int, image_path: str | None = None,
    *, bot=None,
):
    """Run claude CLI in streaming mode, edit Telegram message as chunks arrive."""
    cmd = [CLAUDE_PATH, "-p", "--output-format", "stream-json", "--verbose", "--dangerously-skip-permissions"]

    # Resume existing session if available
    session_id = _get_current_session(chat_id)
    if session_id:
        cmd.extend(["--resume", session_id])

    if image_path:
        cmd.extend(["--input-file", image_path])
    cmd.append(prompt)

    try:
        proc = await asyncio.create_subprocess_exec(
            *cmd,
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            cwd=REPO_PATH,
        )

        full_text = ""
        has_content = False  # True once first text delta arrives
        last_edit = 0
        edit_interval = 1.5  # seconds between edits (Telegram rate limit)
        done = False  # signal for heartbeat to stop

        # --- heartbeat: keep user informed while waiting ---
        async def heartbeat():
            """Show typing indicator + animated dots until first content or done."""
            dots_cycle = ["⏳ Đang xử lý", "⏳ Đang xử lý.", "⏳ Đang xử lý..", "⏳ Đang xử lý..."]
            tick = 0
            while not done:
                # Send typing action
                if bot:
                    try:
                        await bot.send_chat_action(chat_id, ChatAction.TYPING)
                    except Exception:
                        pass

                # Animate dots only while no content yet
                if not has_content:
                    try:
                        await message.edit_text(dots_cycle[tick % len(dots_cycle)])
                    except Exception:
                        pass
                    tick += 1

                await asyncio.sleep(2)

        heartbeat_task = asyncio.create_task(heartbeat())

        async def read_stream():
            nonlocal full_text, last_edit, has_content
            async for line in proc.stdout:
                line = line.decode().strip()
                if not line:
                    continue
                try:
                    data = json.loads(line)
                except json.JSONDecodeError:
                    continue

                msg_type = data.get("type")

                # Capture session ID from result message
                if msg_type == "result" and data.get("session_id"):
                    _set_current_session(chat_id, data["session_id"])
                    logger.info("Session %s saved for chat %s", data["session_id"], chat_id)
                    # Also grab final result text
                    if data.get("result"):
                        full_text = data["result"]
                        has_content = True

                # assistant message contains full content
                elif msg_type == "assistant":
                    msg = data.get("message", data)
                    for block in msg.get("content", []):
                        if block.get("type") == "text":
                            full_text = block["text"]
                            has_content = True

                # streaming deltas
                elif msg_type == "content_block_delta":
                    delta = data.get("delta", {})
                    if delta.get("type") == "text_delta":
                        full_text += delta.get("text", "")
                        has_content = True

                now = time.time()
                if full_text and (now - last_edit) >= edit_interval:
                    last_edit = now
                    # Truncate raw markdown first (keep ~3000 chars to leave
                    # room for HTML tags), then format.
                    truncated = full_text[:3000] if len(full_text) > 3000 else full_text
                    display = format_for_telegram(truncated)[:4096]
                    await _safe_edit(message, display)

        try:
            await asyncio.wait_for(read_stream(), timeout=300)
        except asyncio.TimeoutError:
            full_text += "\n\n⏰ Timeout (5 phút)"
        finally:
            done = True
            heartbeat_task.cancel()
            try:
                await heartbeat_task
            except asyncio.CancelledError:
                pass

        await proc.wait()

        if not full_text:
            stderr = await proc.stderr.read()
            error = stderr.decode().strip()
            if error:
                full_text = f"❌ Claude error:\n```\n{error}\n```"
            else:
                full_text = "❌ Không có response."

        return full_text

    except FileNotFoundError:
        return "❌ Claude CLI không tìm thấy. Kiểm tra CLAUDE_PATH."


async def run_git(args: list[str]) -> str:
    """Run git command in repo directory."""
    cmd = ["git", *args]
    proc = await asyncio.create_subprocess_exec(
        *cmd,
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE,
        cwd=REPO_PATH,
    )
    stdout, stderr = await proc.communicate()

    if proc.returncode != 0:
        return stderr.decode().strip()
    return stdout.decode().strip()


async def send_long_message(
    update: Update, text: str, streaming_msg=None, *, raw_html: bool = False,
) -> None:
    """Split and send messages exceeding Telegram's 4096 char limit.

    By default, *text* is treated as Claude markdown and converted to
    Telegram HTML.  Set ``raw_html=True`` if the text is already formatted.
    """
    chat_id = update.effective_chat.id

    if not text:
        text = "(empty response)"

    formatted = text if raw_html else format_for_telegram(text)

    chunks: list[str] = []
    remaining = formatted
    while remaining:
        if len(remaining) <= 4096:
            chunks.append(remaining)
            break

        split_at = remaining.rfind("\n", 0, 4096)
        if split_at == -1:
            split_at = 4096

        chunks.append(remaining[:split_at])
        remaining = remaining[split_at:].lstrip("\n")

    # Use streaming message for the first chunk (edit it), send rest as new
    if streaming_msg and chunks:
        await _safe_edit(streaming_msg, chunks[0])
        for chunk in chunks[1:]:
            msg = await _safe_reply(update.message, chunk)
            track_message(chat_id, msg.message_id)
    else:
        for chunk in chunks:
            msg = await _safe_reply(update.message, chunk)
            track_message(chat_id, msg.message_id)


# --- Command Handlers ---


async def cmd_start(update: Update, context: ContextTypes.DEFAULT_TYPE):
    if not is_authorized(update):
        return

    chat_id = update.effective_chat.id
    current = _get_current_session(chat_id)
    saved = sessions.get(chat_id, _default_chat_data()).get("saved", {})
    saved_count = len(saved)

    await update.message.reply_text(
        "🤖 Tele Agent — Claude Code qua Telegram\n\n"
        "Commands:\n"
        "/changes — Xem code changes (git diff)\n"
        "/review — Claude review code changes\n"
        "/status — Git status\n"
        "/log — 10 commits gần nhất\n"
        "/branch — Danh sách branches\n"
        "/ask <prompt> — Hỏi Claude về repo\n\n"
        "Conversations:\n"
        "/new — Bắt đầu conversation mới\n"
        "/save <tên> — Lưu conversation hiện tại\n"
        "/list — Xem danh sách conversations\n"
        "/switch <tên> — Chuyển conversation\n"
        "/delete <tên> — Xoá conversation\n\n"
        "Hoặc gửi tin nhắn/ảnh trực tiếp để chat với Claude.\n\n"
        f"Session: {'✅ active' if current else '🆕 chưa có'}"
        f"{f' | 💾 {saved_count} saved' if saved_count else ''}"
    )


async def cmd_changes(update: Update, context: ContextTypes.DEFAULT_TYPE):
    if not is_authorized(update):
        return

    thinking = await update.message.reply_text("🔍 Đang check changes...")

    diff = await run_git(["diff", "--stat"])
    staged = await run_git(["diff", "--cached", "--stat"])

    await thinking.delete()

    if not diff and not staged:
        await update.message.reply_text("✅ Không có changes nào.")
        return

    result = ""
    if staged:
        result += f"📦 <b>Staged:</b>\n<pre>{html_escape(staged)}</pre>\n\n"
    if diff:
        result += f"📝 <b>Unstaged:</b>\n<pre>{html_escape(diff)}</pre>"

    await send_long_message(update, result, raw_html=True)


async def cmd_changes_detail(
    update: Update, context: ContextTypes.DEFAULT_TYPE
):
    """Show detailed diff and ask Claude to analyze."""
    if not is_authorized(update):
        return

    chat_id = update.effective_chat.id
    lock = get_lock(chat_id)

    if lock.locked():
        await _safe_reply(update.message, "⏳ Đang xử lý tin nhắn trước, vui lòng đợi...")
        return

    async with lock:
        thinking = await update.message.reply_text("🔍 Đang phân tích changes...")

        diff = await run_git(["diff"])
        staged = await run_git(["diff", "--cached"])
        full_diff = f"{staged}\n{diff}".strip()

        await thinking.delete()

        if not full_diff:
            await update.message.reply_text("✅ Không có changes nào.")
            return

        prompt = (
            f"Phân tích code changes sau đây. "
            f"Tóm tắt những gì đã thay đổi, highlight potential issues:\n\n"
            f"```diff\n{full_diff[:10000]}\n```"
        )

        streaming_msg = await update.message.reply_text("🔍 ...")
        track_message(chat_id, streaming_msg.message_id)
        response = await run_claude_stream(prompt, streaming_msg, chat_id, bot=update.get_bot())
        await send_long_message(update, response, streaming_msg)


async def cmd_new(update: Update, context: ContextTypes.DEFAULT_TYPE):
    """Reset conversation — start fresh."""
    if not is_authorized(update):
        return

    chat_id = update.effective_chat.id
    if _get_current_session(chat_id):
        _set_current_session(chat_id, None)
        await update.message.reply_text("🆕 Conversation mới. Context đã reset.")
    else:
        await update.message.reply_text("🆕 Chưa có session nào. Gửi tin nhắn để bắt đầu.")


async def cmd_save(update: Update, context: ContextTypes.DEFAULT_TYPE):
    """Save current conversation with a name."""
    if not is_authorized(update):
        return

    name = " ".join(context.args).strip() if context.args else ""
    if not name:
        await update.message.reply_text("Usage: /save <tên conversation>")
        return

    chat_id = update.effective_chat.id
    current = _get_current_session(chat_id)

    if not current:
        await update.message.reply_text("❌ Chưa có conversation nào để lưu.")
        return

    if chat_id not in sessions:
        sessions[chat_id] = _default_chat_data()
    sessions[chat_id]["saved"][name] = current
    _save_sessions()

    await update.message.reply_text(f"💾 Đã lưu conversation: <b>{html_escape(name)}</b>", parse_mode="HTML")


async def cmd_list(update: Update, context: ContextTypes.DEFAULT_TYPE):
    """List all saved conversations."""
    if not is_authorized(update):
        return

    chat_id = update.effective_chat.id
    saved = sessions.get(chat_id, _default_chat_data()).get("saved", {})
    current = _get_current_session(chat_id)

    if not saved and not current:
        await update.message.reply_text("📭 Chưa có conversation nào.")
        return

    lines = ["📋 <b>Conversations:</b>\n"]

    if current:
        # Check if current matches any saved name
        active_name = None
        for name, sid in saved.items():
            if sid == current:
                active_name = name
                break
        if active_name:
            lines.append(f"▶️ Active: <b>{html_escape(active_name)}</b>")
        else:
            lines.append(f"▶️ Active: <i>(chưa lưu)</i>")

    if saved:
        lines.append("")
        for name, sid in saved.items():
            marker = " 🟢" if sid == current else ""
            lines.append(f"• <code>{html_escape(name)}</code>{marker}")

    await _safe_reply(update.message, "\n".join(lines))


async def cmd_switch(update: Update, context: ContextTypes.DEFAULT_TYPE):
    """Switch to a saved conversation."""
    if not is_authorized(update):
        return

    name = " ".join(context.args).strip() if context.args else ""
    if not name:
        await update.message.reply_text("Usage: /switch <tên conversation>")
        return

    chat_id = update.effective_chat.id
    saved = sessions.get(chat_id, _default_chat_data()).get("saved", {})

    if name not in saved:
        available = ", ".join(f"<code>{html_escape(n)}</code>" for n in saved) if saved else "không có"
        await _safe_reply(update.message, f"❌ Không tìm thấy: <b>{html_escape(name)}</b>\nCó: {available}")
        return

    _set_current_session(chat_id, saved[name])
    await _safe_reply(update.message, f"🔄 Đã chuyển sang: <b>{html_escape(name)}</b>")


async def cmd_delete_conv(update: Update, context: ContextTypes.DEFAULT_TYPE):
    """Delete a saved conversation."""
    if not is_authorized(update):
        return

    name = " ".join(context.args).strip() if context.args else ""
    if not name:
        await update.message.reply_text("Usage: /delete <tên conversation>")
        return

    chat_id = update.effective_chat.id
    saved = sessions.get(chat_id, _default_chat_data()).get("saved", {})

    if name not in saved:
        await update.message.reply_text(f"❌ Không tìm thấy: {name}")
        return

    # If deleting the active conversation, clear current
    if saved[name] == _get_current_session(chat_id):
        _set_current_session(chat_id, None)

    del sessions[chat_id]["saved"][name]
    _save_sessions()

    await _safe_reply(update.message, f"🗑️ Đã xoá: <b>{html_escape(name)}</b>")


async def cmd_clear(update: Update, context: ContextTypes.DEFAULT_TYPE):
    """Clear all messages in chat + reset session."""
    if not is_authorized(update):
        return

    chat_id = update.effective_chat.id

    # Delete tracked messages
    ids = message_ids.get(chat_id, [])
    # Also delete the /clear command message itself
    ids.append(update.message.message_id)

    for msg_id in ids:
        try:
            await context.bot.delete_message(chat_id, msg_id)
        except Exception:
            pass

    message_ids[chat_id] = []

    # Reset claude session too
    _set_current_session(chat_id, None)

    msg = await update.effective_chat.send_message("🧹 Đã xoá lịch sử. Session mới.")
    track_message(chat_id, msg.message_id)


async def cmd_status(update: Update, context: ContextTypes.DEFAULT_TYPE):
    if not is_authorized(update):
        return

    status = await run_git(["status", "--short"])
    branch = await run_git(["branch", "--show-current"])

    result = f"🌿 Branch: <code>{html_escape(branch)}</code>\n\n"
    if status:
        result += f"<pre>{html_escape(status)}</pre>"
    else:
        result += "✅ Working tree clean"

    await _safe_reply(update.message, result)


async def cmd_log(update: Update, context: ContextTypes.DEFAULT_TYPE):
    if not is_authorized(update):
        return

    log = await run_git(
        ["log", "--oneline", "--graph", "--decorate", "-10"]
    )
    await send_long_message(
        update, f"📜 <b>Recent commits:</b>\n<pre>{html_escape(log)}</pre>", raw_html=True,
    )


async def cmd_branch(update: Update, context: ContextTypes.DEFAULT_TYPE):
    if not is_authorized(update):
        return

    branches = await run_git(["branch", "-a", "--sort=-committerdate"])
    await send_long_message(
        update, f"🌿 <b>Branches:</b>\n<pre>{html_escape(branches)}</pre>", raw_html=True,
    )


async def cmd_ask(update: Update, context: ContextTypes.DEFAULT_TYPE):
    if not is_authorized(update):
        return

    prompt = " ".join(context.args) if context.args else ""
    if not prompt:
        await update.message.reply_text("Usage: /ask <câu hỏi về code>")
        return

    chat_id = update.effective_chat.id
    lock = get_lock(chat_id)

    if lock.locked():
        await _safe_reply(update.message, "⏳ Đang xử lý tin nhắn trước, vui lòng đợi...")
        return

    async with lock:
        streaming_msg = await update.message.reply_text("🤔 ...")
        track_message(chat_id, streaming_msg.message_id)
        response = await run_claude_stream(prompt, streaming_msg, chat_id, bot=update.get_bot())
        await send_long_message(update, response, streaming_msg)


# --- Message Handlers ---


async def handle_text(update: Update, context: ContextTypes.DEFAULT_TYPE):
    """Handle direct text messages — chat with Claude."""
    if not is_authorized(update):
        return

    chat_id = update.effective_chat.id
    lock = get_lock(chat_id)

    if lock.locked():
        await _safe_reply(update.message, "⏳ Đang xử lý tin nhắn trước, vui lòng đợi...")
        return

    async with lock:
        prompt = update.message.text
        streaming_msg = await update.message.reply_text("🤔 ...")

        response = await run_claude_stream(prompt, streaming_msg, chat_id, bot=update.get_bot())
        await send_long_message(update, response, streaming_msg)


async def handle_photo(update: Update, context: ContextTypes.DEFAULT_TYPE):
    """Handle photos — download and send to Claude for analysis."""
    if not is_authorized(update):
        return

    chat_id = update.effective_chat.id
    lock = get_lock(chat_id)

    if lock.locked():
        await _safe_reply(update.message, "⏳ Đang xử lý tin nhắn trước, vui lòng đợi...")
        return

    async with lock:
        streaming_msg = await update.message.reply_text("🖼️ ...")
        track_message(chat_id, streaming_msg.message_id)

        photo = update.message.photo[-1]  # highest resolution
        file = await photo.get_file()

        with tempfile.NamedTemporaryFile(
            suffix=".jpg", delete=False
        ) as tmp:
            tmp_path = tmp.name
            await file.download_to_drive(tmp_path)

        try:
            caption = update.message.caption or "Phân tích ảnh này. Nếu là code hoặc error, giải thích và đề xuất fix."
            response = await run_claude_stream(caption, streaming_msg, chat_id, image_path=tmp_path, bot=update.get_bot())
            await send_long_message(update, response, streaming_msg)
        finally:
            Path(tmp_path).unlink(missing_ok=True)


async def handle_document(
    update: Update, context: ContextTypes.DEFAULT_TYPE
):
    """Handle file uploads (screenshots, logs, etc.)."""
    if not is_authorized(update):
        return

    doc = update.message.document
    if not doc:
        return

    # Accept images and text files
    mime = doc.mime_type or ""
    is_image = mime.startswith("image/")
    is_text = mime.startswith("text/") or doc.file_name.endswith(
        (".log", ".txt", ".json", ".ts", ".tsx", ".js", ".py", ".go", ".md")
    )

    if not is_image and not is_text:
        await update.message.reply_text(
            "⚠️ Chỉ hỗ trợ ảnh và text files."
        )
        return

    chat_id = update.effective_chat.id
    lock = get_lock(chat_id)

    if lock.locked():
        await _safe_reply(update.message, "⏳ Đang xử lý tin nhắn trước, vui lòng đợi...")
        return

    async with lock:
        streaming_msg = await update.message.reply_text("📎 ...")
        track_message(chat_id, streaming_msg.message_id)

        file = await doc.get_file()
        suffix = Path(doc.file_name).suffix if doc.file_name else ".tmp"

        with tempfile.NamedTemporaryFile(
            suffix=suffix, delete=False
        ) as tmp:
            tmp_path = tmp.name
            await file.download_to_drive(tmp_path)

        try:
            caption = update.message.caption or "Phân tích file này."

            if is_image:
                response = await run_claude_stream(caption, streaming_msg, chat_id, image_path=tmp_path, bot=update.get_bot())
            else:
                content = Path(tmp_path).read_text(errors="replace")[:15000]
                prompt = f"{caption}\n\nFile: {doc.file_name}\n```\n{content}\n```"
                response = await run_claude_stream(prompt, streaming_msg, chat_id, bot=update.get_bot())

            await send_long_message(update, response, streaming_msg)
        finally:
            Path(tmp_path).unlink(missing_ok=True)


def main():
    if not TELEGRAM_BOT_TOKEN:
        logger.error("TELEGRAM_BOT_TOKEN is not set")
        return

    if TELEGRAM_USER_ID == 0:
        logger.error("TELEGRAM_USER_ID is not set")
        return

    logger.info("Starting Tele Agent...")
    logger.info("Repo: %s", REPO_PATH)

    app = Application.builder().token(TELEGRAM_BOT_TOKEN).build()

    # Register command menu on Telegram
    async def post_init(application):
        await application.bot.set_my_commands([
            ("new", "Conversation mới"),
            ("save", "Lưu conversation"),
            ("list", "Danh sách conversations"),
            ("switch", "Chuyển conversation"),
            ("delete", "Xoá conversation"),
            ("clear", "Xoá lịch sử + reset"),
            ("changes", "Xem code changes"),
            ("review", "Claude review changes"),
            ("status", "Git status"),
            ("log", "10 commits gần nhất"),
            ("branch", "Danh sách branches"),
            ("ask", "Hỏi Claude về repo"),
            ("help", "Hiển thị help"),
        ])

    app.post_init = post_init

    # Commands
    app.add_handler(CommandHandler("start", cmd_start))
    app.add_handler(CommandHandler("help", cmd_start))
    app.add_handler(CommandHandler("new", cmd_new))
    app.add_handler(CommandHandler("save", cmd_save))
    app.add_handler(CommandHandler("list", cmd_list))
    app.add_handler(CommandHandler("switch", cmd_switch))
    app.add_handler(CommandHandler("delete", cmd_delete_conv))
    app.add_handler(CommandHandler("clear", cmd_clear))
    app.add_handler(CommandHandler("changes", cmd_changes))
    app.add_handler(CommandHandler("review", cmd_changes_detail))
    app.add_handler(CommandHandler("status", cmd_status))
    app.add_handler(CommandHandler("log", cmd_log))
    app.add_handler(CommandHandler("branch", cmd_branch))
    app.add_handler(CommandHandler("ask", cmd_ask))

    # Track all incoming messages for /clear
    async def track_incoming(update: Update, context: ContextTypes.DEFAULT_TYPE):
        if update.message:
            track_message(update.effective_chat.id, update.message.message_id)

    app.add_handler(MessageHandler(filters.ALL, track_incoming), group=-1)

    # Messages
    app.add_handler(
        MessageHandler(filters.TEXT & ~filters.COMMAND, handle_text)
    )
    app.add_handler(MessageHandler(filters.PHOTO, handle_photo))
    app.add_handler(MessageHandler(filters.Document.ALL, handle_document))

    app.run_polling(allowed_updates=Update.ALL_TYPES)


if __name__ == "__main__":
    main()
