from __future__ import annotations

import asyncio
import hashlib
import json
import logging
import os
import random
import re
import subprocess
import time
from datetime import datetime, timedelta
from html import escape as html_escape, unescape as html_unescape
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

# ---------------------------------------------------------------------------
# Config
# ---------------------------------------------------------------------------

TELEGRAM_BOT_TOKEN = os.getenv("TELEGRAM_BOT_TOKEN")
WHITELIST_USER_IDS = {
    int(uid.strip())
    for uid in os.getenv("WHITELIST_USER_IDS", "").split(",")
    if uid.strip()
}
CLAUDE_PATH = os.getenv("CLAUDE_PATH", "claude")
CLAUDE_MODEL = os.getenv("CLAUDE_MODEL", "haiku")
DATA_DIR = Path(os.getenv("DATA_DIR", "data"))
REMINDER_DEFAULT_TIME = os.getenv("REMINDER_DEFAULT_TIME", "09:00")

logging.basicConfig(
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
    level=logging.INFO,
)
logger = logging.getLogger(__name__)

# ---------------------------------------------------------------------------
# Prompts
# ---------------------------------------------------------------------------

SYSTEM_PROMPT = """\
You are an English learning companion. Your ONLY purpose is to help users learn English.

RULES:
1. REFUSE any request not related to English learning. No coding, no file access, no system commands, no other topics. Politely redirect to English learning.
2. Target level: A1 to B1 (beginner to intermediate).
3. Include both formal AND informal/slang expressions (gonna, wanna, goddamn, chill out, no way, dude, freak out, etc). Always explain when/where to use them.
4. Explain in BOTH English and Vietnamese (bilingual).
5. When the user writes in English:
   - REPLY to their message first (keep conversation flowing naturally)
   - Then gently correct any mistakes below your reply
6. Correction format:
   💬 [Your natural reply]

   ✏️ Small fix: "wrong part" → "correct part"
   → Vietnamese explanation
7. If the sentence is correct, just reply normally. No correction needed.
8. Keep responses concise and friendly — like chatting with a friend, not a textbook.
9. NEVER execute code, access files, or do anything outside English teaching."""

VOCAB_GEN_PROMPT = """\
Generate {count} English vocabulary entries for the topic: "{topic}"

Requirements:
- Level A1-B1 (beginner to intermediate)
- Include informal/slang expressions naturally
- Each entry: a natural, practical example sentence + Vietnamese meaning
- Sentences should be real daily-use, not textbook-style
- Mix formal and casual registers
- Include common phrases, idioms, and expressions people actually say

After showing the vocab to the user in a friendly format, include this JSON block at the END:
```json
[
  {{
    "word": "the word or phrase",
    "sentence": "A natural example sentence.",
    "meaning_vi": "Nghia tieng Viet + giai thich ngan",
    "context": "informal/formal/neutral - khi nao dung"
  }}
]
```"""

GRAMMAR_GEN_PROMPT = """\
Teach this English grammar topic: "{topic}"

Requirements:
- Level A1-B1
- Explain with real-life examples (not textbook)
- Include common mistakes Vietnamese speakers make
- Bilingual explanation (English + Vietnamese)
- 3-4 example pairs (wrong vs correct)

After your explanation, include this JSON block at the END:
```json
[
  {{
    "rule": "Short rule description in English",
    "examples": [
      {{"wrong": "incorrect sentence", "correct": "correct sentence"}}
    ],
    "meaning_vi": "Giai thich tieng Viet"
  }}
]
```"""

REVIEW_EVALUATE_PROMPT = """\
You are evaluating an English learner's answer. Be encouraging but honest.

Exercise: {exercise_type}
Target word/rule: {target}
Question shown to user: {question}
Expected answer reference: {reference}
User's answer: "{answer}"

Evaluate:
1. Is it correct? (meaning + grammar)
2. Rate: ✅ Correct / ⚠️ Almost / ❌ Incorrect
3. If not perfect, show the better version
4. Brief explanation in Vietnamese

Keep it short (3-4 lines max). Be encouraging."""

PRACTICE_START_PROMPT = """\
Start a realistic English conversation scenario for practice.
Pick a random everyday situation like:
- Ordering coffee, asking for directions, job small talk, making plans with friends,
  complaining about something, booking a hotel, chatting with a colleague, etc.

Set the scene briefly, then say your opening line IN CHARACTER.
The user will respond. Keep the conversation natural for 3-5 exchanges.
After each user response, reply in character AND note any language fixes.
Level: A1-B1. Use natural spoken English including contractions and casual expressions."""

# ---------------------------------------------------------------------------
# Default topic lists (bot picks from these if user doesn't specify)
# ---------------------------------------------------------------------------

DEFAULT_VOCAB_TOPICS = [
    "greetings-and-small-talk", "daily-routines", "food-and-restaurant",
    "shopping-and-money", "travel-and-transport", "work-and-office",
    "phone-calls-and-texting", "emotions-and-feelings", "weather",
    "hobbies-and-entertainment", "health-and-body", "family-and-friends",
    "opinions-and-disagreeing", "apologizing-and-thanking",
    "slang-and-casual-speech", "directions-and-places", "parties-and-events",
    "complaining-and-frustration", "making-plans", "online-and-social-media",
]

DEFAULT_GRAMMAR_TOPICS = [
    "present-simple-vs-continuous", "past-simple-vs-present-perfect",
    "future-will-vs-going-to", "articles-a-an-the",
    "prepositions-in-on-at", "modal-verbs-can-could-should-must",
    "conditionals-if-sentences", "comparisons-more-most-er-est",
    "question-forms", "passive-voice-basics",
    "countable-vs-uncountable", "conjunctions-but-however-although",
    "gerund-vs-infinitive", "relative-clauses-who-which-that",
    "reported-speech-basics",
]

# ---------------------------------------------------------------------------
# State management
# ---------------------------------------------------------------------------

claude_sessions: dict[int, str] = {}       # telegram_user_id -> claude session_id
active_reviews: dict[int, dict] = {}        # telegram_user_id -> review state
practice_sessions: set[int] = set()         # users in practice mode
practice_turns: dict[int, int] = {}         # user_id -> turn count
message_ids: dict[int, list[int]] = {}      # chat_id -> message ids for /clear

# ---------------------------------------------------------------------------
# Utilities
# ---------------------------------------------------------------------------


def hash_user_id(user_id: int) -> str:
    return hashlib.sha256(str(user_id).encode()).hexdigest()[:16]


def user_dir(user_id: int) -> Path:
    d = DATA_DIR / hash_user_id(user_id)
    d.mkdir(parents=True, exist_ok=True)
    (d / "vocab").mkdir(exist_ok=True)
    (d / "grammar").mkdir(exist_ok=True)
    return d


def load_json(path: Path) -> dict | list:
    if path.exists():
        return json.loads(path.read_text(encoding="utf-8"))
    return {}


def save_json(path: Path, data):
    path.write_text(json.dumps(data, ensure_ascii=False, indent=2), encoding="utf-8")


def get_profile(user_id: int) -> dict:
    p = load_json(user_dir(user_id) / "profile.json")
    if not p:
        p = {
            "reminder_enabled": True,
            "reminder_time": REMINDER_DEFAULT_TIME,
            "created_at": datetime.now().isoformat(),
        }
        save_json(user_dir(user_id) / "profile.json", p)
    return p


def get_stats(user_id: int) -> dict:
    s = load_json(user_dir(user_id) / "stats.json")
    if not s:
        s = {
            "total_vocab": 0,
            "total_grammar": 0,
            "vocab_mastered": 0,
            "grammar_mastered": 0,
            "total_reviews": 0,
            "streak_days": 0,
            "last_review_date": None,
        }
        save_json(user_dir(user_id) / "stats.json", s)
    return s


def update_stats(user_id: int, **kwargs):
    s = get_stats(user_id)
    s.update(kwargs)
    save_json(user_dir(user_id) / "stats.json", s)


def track_message(chat_id: int, msg_id: int):
    message_ids.setdefault(chat_id, []).append(msg_id)


def is_authorized(update: Update) -> bool:
    return update.effective_user.id in WHITELIST_USER_IDS


def parse_json_block(text: str) -> list | None:
    """Extract JSON array from ```json ... ``` block in Claude's response."""
    m = re.search(r"```json\s*\n(.*?)```", text, re.DOTALL)
    if not m:
        return None
    try:
        return json.loads(m.group(1))
    except json.JSONDecodeError:
        return None


def get_next_review_date(streak: int) -> str:
    """Spaced repetition: streak -> next review date."""
    intervals = {0: 0, 1: 1, 2: 3, 3: 7}
    days = intervals.get(streak, 14)
    return (datetime.now() + timedelta(days=days)).strftime("%Y-%m-%d")


def get_review_items(user_id: int, limit: int = 10) -> list[dict]:
    """Get items due for review (next_review <= today)."""
    today = datetime.now().strftime("%Y-%m-%d")
    items = []
    ud = user_dir(user_id)

    for folder, entry_type in [("vocab", "vocab"), ("grammar", "grammar")]:
        folder_path = ud / folder
        for fpath in folder_path.glob("*.json"):
            data = load_json(fpath)
            for entry in data.get("entries", []):
                nr = entry.get("next_review", today)
                if nr <= today and entry.get("correct_streak", 0) < 4:
                    items.append({
                        "entry": entry,
                        "type": entry_type,
                        "file": str(fpath),
                    })

    random.shuffle(items)
    return items[:limit]


def pick_unused_topic(user_id: int, topics: list[str], folder: str) -> str:
    """Pick a topic the user hasn't studied yet, or least studied."""
    ud = user_dir(user_id)
    existing = {f.stem for f in (ud / folder).glob("*.json")}
    unused = [t for t in topics if t not in existing]
    if unused:
        return random.choice(unused)
    return random.choice(topics)


# ---------------------------------------------------------------------------
# Markdown -> Telegram HTML (from tele-agent)
# ---------------------------------------------------------------------------


def _convert_inline(text: str) -> str:
    placeholders: list[str] = []

    def _placeholder(html: str) -> str:
        idx = len(placeholders)
        placeholders.append(html)
        return f"\x00PH{idx}\x00"

    def _code_repl(m):
        return _placeholder(f"<code>{html_escape(m.group(1), quote=False)}</code>")
    text = re.sub(r"`([^`]+)`", _code_repl, text)

    def _link_repl(m):
        label = html_escape(m.group(1), quote=False)
        url = m.group(2)
        return _placeholder(f'<a href="{url}">{label}</a>')
    text = re.sub(r"\[([^\]]+)\]\(([^)]+)\)", _link_repl, text)

    t = html_escape(text, quote=False)
    t = re.sub(r"\*\*(.+?)\*\*", r"<b>\1</b>", t)
    t = re.sub(r"__(.+?)__", r"<b>\1</b>", t)
    t = re.sub(r"(?<!\w)\*([^*]+?)\*(?!\w)", r"<i>\1</i>", t)
    t = re.sub(r"(?<!\w)_([^_]+?)_(?!\w)", r"<i>\1</i>", t)
    t = re.sub(r"~~(.+?)~~", r"<s>\1</s>", t)

    for idx, html in enumerate(placeholders):
        t = t.replace(f"\x00PH{idx}\x00", html)
    return t


def _markdown_table_to_list(table_lines: list[str]) -> str:
    rows: list[list[str]] = []
    for line in table_lines:
        stripped = line.strip().strip("|")
        if re.match(r"^[\s|:\-]+$", stripped):
            continue
        cells = [c.strip() for c in stripped.split("|")]
        rows.append(cells)
    if not rows:
        return ""
    headers = rows[0]
    data_rows = rows[1:]
    if not data_rows:
        return " | ".join(headers)
    out: list[str] = []
    for row in data_rows:
        for i, header in enumerate(headers):
            val = row[i] if i < len(row) else ""
            if val:
                out.append(f"<b>{html_escape(header, quote=False)}</b>: {_convert_inline(val)}")
        out.append("---")
    if out and out[-1] == "---":
        out.pop()
    return "\n".join(out)


def format_for_telegram(text: str) -> str:
    try:
        # Unescape any HTML entities from Claude's output first
        text = html_unescape(text)
        return _do_format(text)
    except Exception:
        logger.warning("Markdown->HTML conversion failed, sending plain text")
        return html_escape(text, quote=False)


def _do_format(text: str) -> str:
    lines = text.split("\n")
    result: list[str] = []
    i = 0
    while i < len(lines):
        line = lines[i]

        if line.strip().startswith("```"):
            block_lines: list[str] = []
            i += 1
            while i < len(lines) and not lines[i].strip().startswith("```"):
                block_lines.append(lines[i])
                i += 1
            if i < len(lines):
                i += 1
            code = html_escape("\n".join(block_lines), quote=False)
            result.append(f"<pre>{code}</pre>")
            continue

        if line.strip().startswith("|"):
            table_lines: list[str] = []
            while i < len(lines) and lines[i].strip().startswith("|"):
                table_lines.append(lines[i])
                i += 1
            result.append(_markdown_table_to_list(table_lines))
            continue

        hm = re.match(r"^(#{1,6})\s+(.+)$", line)
        if hm:
            result.append(f"<b>{_convert_inline(hm.group(2))}</b>")
            i += 1
            continue

        lm = re.match(r"^(\s*)[*\-]\s+(.+)$", line)
        if lm:
            indent = len(lm.group(1)) // 2
            result.append(f"{'  ' * indent}\u2022 {_convert_inline(lm.group(2))}")
            i += 1
            continue

        om = re.match(r"^(\s*)\d+\.\s+(.+)$", line)
        if om:
            indent = len(om.group(1)) // 2
            num_match = re.match(r"^(\s*)(\d+)\.\s+", line)
            num = num_match.group(2) if num_match else "\u2022"
            result.append(f"{'  ' * indent}{num}. {_convert_inline(om.group(2))}")
            i += 1
            continue

        if re.match(r"^[\s]*[-*_]{3,}\s*$", line):
            result.append("\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500")
            i += 1
            continue

        bq = re.match(r"^>\s*(.*)", line)
        if bq:
            result.append(f"\u258e <i>{_convert_inline(bq.group(1))}</i>")
            i += 1
            continue

        result.append(_convert_inline(line))
        i += 1

    return "\n".join(result)


def _strip_html(text: str) -> str:
    text = re.sub(r"<[^>]+>", "", text)
    text = text.replace("&lt;", "<").replace("&gt;", ">")
    text = text.replace("&amp;", "&").replace("&quot;", '"')
    return text


# ---------------------------------------------------------------------------
# Telegram message helpers
# ---------------------------------------------------------------------------


async def _safe_edit(message, text: str, parse_mode: str | None = "HTML"):
    try:
        await message.edit_text(text, parse_mode=parse_mode, disable_web_page_preview=True)
    except Exception as e:
        logger.warning("HTML edit failed: %s", e)
        try:
            await message.edit_text(_strip_html(text), disable_web_page_preview=True)
        except Exception:
            pass


async def _safe_reply(update_message, text: str, parse_mode: str | None = "HTML"):
    try:
        return await update_message.reply_text(text, parse_mode=parse_mode, disable_web_page_preview=True)
    except Exception as e:
        logger.warning("HTML reply failed: %s", e)
        return await update_message.reply_text(_strip_html(text), disable_web_page_preview=True)


async def send_long_message(update: Update, text: str, streaming_msg=None, *, raw_html: bool = False):
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

    if streaming_msg and chunks:
        await _safe_edit(streaming_msg, chunks[0])
        for chunk in chunks[1:]:
            msg = await _safe_reply(update.message, chunk)
            track_message(chat_id, msg.message_id)
    else:
        for chunk in chunks:
            msg = await _safe_reply(update.message, chunk)
            track_message(chat_id, msg.message_id)


# ---------------------------------------------------------------------------
# Claude CLI
# ---------------------------------------------------------------------------


async def run_claude_stream(
    prompt: str, message, chat_id: int,
    *, bot=None, system_prompt: str | None = None,
    use_session: bool = True, user_id: int | None = None,
):
    """Run Claude CLI with streaming, edit Telegram message as chunks arrive."""
    session_key = user_id or chat_id
    cmd = [CLAUDE_PATH, "-p", "--output-format", "stream-json", "--verbose", "--model", CLAUDE_MODEL]

    session_id = claude_sessions.get(session_key) if use_session else None
    if session_id:
        cmd.extend(["--resume", session_id])

    # First message in session: prepend system prompt
    if system_prompt and not session_id:
        full_prompt = f"{system_prompt}\n\n---\nUser message:\n{prompt}"
    else:
        full_prompt = prompt

    cmd.append(full_prompt)

    try:
        proc = await asyncio.create_subprocess_exec(
            *cmd,
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            cwd="/tmp",
        )

        full_text = ""
        has_content = False
        last_edit = 0
        edit_interval = 1.5
        done = False

        async def heartbeat():
            dots = ["\u23f3 Thinking", "\u23f3 Thinking.", "\u23f3 Thinking..", "\u23f3 Thinking..."]
            tick = 0
            while not done:
                if bot:
                    try:
                        await bot.send_chat_action(chat_id, ChatAction.TYPING)
                    except Exception:
                        pass
                if not has_content:
                    try:
                        await message.edit_text(dots[tick % len(dots)])
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

                if msg_type == "result" and data.get("session_id"):
                    if use_session:
                        claude_sessions[session_key] = data["session_id"]
                        logger.info("Session %s saved for user %s", data["session_id"], session_key)
                    if data.get("result"):
                        full_text = data["result"]
                        has_content = True

                elif msg_type == "assistant":
                    msg = data.get("message", data)
                    for block in msg.get("content", []):
                        if block.get("type") == "text":
                            full_text = block["text"]
                            has_content = True

                elif msg_type == "content_block_delta":
                    delta = data.get("delta", {})
                    if delta.get("type") == "text_delta":
                        full_text += delta.get("text", "")
                        has_content = True

                now = time.time()
                if full_text and (now - last_edit) >= edit_interval:
                    last_edit = now
                    truncated = full_text[:3000] if len(full_text) > 3000 else full_text
                    display = format_for_telegram(truncated)[:4096]
                    await _safe_edit(message, display)

        try:
            await asyncio.wait_for(read_stream(), timeout=120)
        except asyncio.TimeoutError:
            full_text += "\n\n\u23f0 Timeout (2 min)"
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
            full_text = f"\u274c Error:\n```\n{error}\n```" if error else "\u274c No response."

        return full_text

    except FileNotFoundError:
        return "\u274c Claude CLI not found. Check CLAUDE_PATH."


async def run_claude_oneshot(prompt: str) -> str:
    """Run Claude CLI once (no session, no streaming). For evaluations."""
    cmd = [CLAUDE_PATH, "-p", "--output-format", "text", "--model", CLAUDE_MODEL]
    cmd.append(prompt)

    try:
        proc = await asyncio.create_subprocess_exec(
            *cmd,
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            cwd="/tmp",
        )
        stdout, stderr = await asyncio.wait_for(proc.communicate(), timeout=60)
        if proc.returncode != 0:
            return f"\u274c Error: {stderr.decode().strip()}"
        return stdout.decode().strip()
    except asyncio.TimeoutError:
        return "\u23f0 Timeout."
    except FileNotFoundError:
        return "\u274c Claude CLI not found."


# ---------------------------------------------------------------------------
# Command handlers
# ---------------------------------------------------------------------------


async def cmd_start(update: Update, context: ContextTypes.DEFAULT_TYPE):
    if not is_authorized(update):
        await update.message.reply_text("\u26d4 You are not authorized to use this bot.")
        return

    user_id = update.effective_user.id
    get_profile(user_id)  # ensure profile exists

    await update.message.reply_text(
        "\U0001f4da <b>English Learning Agent</b>\n\n"
        "Chat with me in English! I'll help you improve.\n\n"
        "<b>Commands:</b>\n"
        "/vocab [topic] \u2014 Learn new vocabulary\n"
        "/grammar [topic] \u2014 Learn grammar\n"
        "/review \u2014 Review what you've learned\n"
        "/practice \u2014 Conversation practice\n"
        "/stats \u2014 Your progress\n"
        "/topics \u2014 Your word/grammar collections\n"
        "/reminder on|off|HH:MM \u2014 Daily reminder\n"
        "/new \u2014 New conversation\n"
        "/clear \u2014 Clear chat history\n\n"
        "\u2728 Or just send any message to chat in English!",
        parse_mode="HTML",
    )


async def cmd_vocab(update: Update, context: ContextTypes.DEFAULT_TYPE):
    if not is_authorized(update):
        return

    user_id = update.effective_user.id
    topic = " ".join(context.args).strip() if context.args else ""
    if not topic:
        topic = pick_unused_topic(user_id, DEFAULT_VOCAB_TOPICS, "vocab")

    topic_slug = re.sub(r"[^a-z0-9]+", "-", topic.lower()).strip("-")
    ud = user_dir(user_id)
    vocab_file = ud / "vocab" / f"{topic_slug}.json"
    existing = load_json(vocab_file) if vocab_file.exists() else {"topic": topic_slug, "entries": []}
    existing_words = {e["word"].lower() for e in existing.get("entries", [])}

    count = 10 if not existing.get("entries") else 5
    avoid_str = f"\nAvoid these words (already learned): {', '.join(existing_words)}" if existing_words else ""

    prompt = VOCAB_GEN_PROMPT.format(count=count, topic=topic) + avoid_str

    streaming_msg = await update.message.reply_text("\U0001f4d6 ...")
    track_message(update.effective_chat.id, streaming_msg.message_id)

    response = await run_claude_stream(
        prompt, streaming_msg, update.effective_chat.id,
        bot=update.get_bot(), use_session=False, user_id=user_id,
    )

    # Parse and save vocab entries
    entries = parse_json_block(response)
    if entries and isinstance(entries, list):
        today = datetime.now().strftime("%Y-%m-%d")
        for entry in entries:
            if entry.get("word", "").lower() not in existing_words:
                existing["entries"].append({
                    "word": entry.get("word", ""),
                    "sentence": entry.get("sentence", ""),
                    "meaning_vi": entry.get("meaning_vi", ""),
                    "context": entry.get("context", ""),
                    "added_at": today,
                    "correct_streak": 0,
                    "last_reviewed": None,
                    "next_review": today,
                })
        save_json(vocab_file, existing)

        stats = get_stats(user_id)
        total = sum(len(load_json(f).get("entries", [])) for f in (ud / "vocab").glob("*.json"))
        update_stats(user_id, total_vocab=total)

        saved_count = len(entries)
        await _safe_reply(
            update.message,
            f"\n\u2705 Saved <b>{saved_count}</b> words to <code>{topic_slug}</code>. "
            f"Total vocab: <b>{total}</b> words.\n"
            f"Use /review to practice!",
        )
    else:
        await send_long_message(update, response, streaming_msg)


async def cmd_grammar(update: Update, context: ContextTypes.DEFAULT_TYPE):
    if not is_authorized(update):
        return

    user_id = update.effective_user.id
    topic = " ".join(context.args).strip() if context.args else ""
    if not topic:
        topic = pick_unused_topic(user_id, DEFAULT_GRAMMAR_TOPICS, "grammar")

    topic_slug = re.sub(r"[^a-z0-9]+", "-", topic.lower()).strip("-")
    ud = user_dir(user_id)
    grammar_file = ud / "grammar" / f"{topic_slug}.json"

    prompt = GRAMMAR_GEN_PROMPT.format(topic=topic)

    streaming_msg = await update.message.reply_text("\U0001f4d6 ...")
    track_message(update.effective_chat.id, streaming_msg.message_id)

    response = await run_claude_stream(
        prompt, streaming_msg, update.effective_chat.id,
        bot=update.get_bot(), use_session=False, user_id=user_id,
    )

    entries = parse_json_block(response)
    if entries and isinstance(entries, list):
        today = datetime.now().strftime("%Y-%m-%d")
        existing = load_json(grammar_file) if grammar_file.exists() else {"topic": topic_slug, "entries": []}
        for entry in entries:
            existing["entries"].append({
                "rule": entry.get("rule", ""),
                "examples": entry.get("examples", []),
                "meaning_vi": entry.get("meaning_vi", ""),
                "added_at": today,
                "correct_streak": 0,
                "last_reviewed": None,
                "next_review": today,
            })
        save_json(grammar_file, existing)

        total = sum(len(load_json(f).get("entries", [])) for f in (ud / "grammar").glob("*.json"))
        update_stats(user_id, total_grammar=total)

        await _safe_reply(
            update.message,
            f"\n\u2705 Saved <b>{len(entries)}</b> rules to <code>{topic_slug}</code>. "
            f"Total grammar: <b>{total}</b> rules.\n"
            f"Use /review to practice!",
        )
    else:
        await send_long_message(update, response, streaming_msg)


async def cmd_review(update: Update, context: ContextTypes.DEFAULT_TYPE):
    if not is_authorized(update):
        return

    user_id = update.effective_user.id
    items = get_review_items(user_id)

    if not items:
        await update.message.reply_text(
            "\u2728 Nothing to review right now!\n"
            "Use /vocab or /grammar to learn new things first."
        )
        return

    active_reviews[user_id] = {
        "items": items,
        "current": 0,
        "score": {"correct": 0, "almost": 0, "wrong": 0},
    }

    await update.message.reply_text(
        f"\U0001f4dd <b>Review time!</b> {len(items)} items to practice.\n"
        f"Type /stop to end early.\n",
        parse_mode="HTML",
    )
    await send_review_question(update, user_id)


async def send_review_question(update: Update, user_id: int):
    review = active_reviews.get(user_id)
    if not review or review["current"] >= len(review["items"]):
        await finish_review(update, user_id)
        return

    item = review["items"][review["current"]]
    entry = item["entry"]
    entry_type = item["type"]

    n = review["current"] + 1
    total = len(review["items"])

    if entry_type == "vocab":
        streak = entry.get("correct_streak", 0)

        if streak <= 1:
            # Easy: fill in the blank
            sentence = entry.get("sentence", "")
            word = entry.get("word", "")
            # Create blank by removing the word/phrase from the sentence (case-insensitive)
            blank_sentence = re.sub(
                re.escape(word), "_______", sentence, count=1, flags=re.IGNORECASE,
            )
            # If word not found in sentence, fall back to write-sentence mode
            if blank_sentence == sentence:
                blank_sentence = None

            if blank_sentence:
                question = (
                    f"\U0001f4dd <b>[{n}/{total}] Fill in the blank</b>\n\n"
                    f"<code>{html_escape(blank_sentence, quote=False)}</code>\n\n"
                    f"Meaning: <i>{html_escape(entry['meaning_vi'], quote=False)}</i>\n"
                    f"\u270d Type the missing word/phrase:"
                )
                review["exercise_type"] = "fill-blank"
                review["target"] = entry["word"]
                review["reference"] = entry["sentence"]
                review["question_text"] = f"Fill: {blank_sentence} ({entry['meaning_vi']})"
            else:
                # Fallback to write sentence
                question = (
                    f"\U0001f4dd <b>[{n}/{total}] Write a sentence</b>\n\n"
                    f"Use the word/phrase: <b>{html_escape(entry['word'], quote=False)}</b>\n"
                    f"Meaning: <i>{html_escape(entry['meaning_vi'], quote=False)}</i>\n\n"
                    f"\u270d Write a sentence in English using this word:"
                )
                review["exercise_type"] = "write-sentence"
                review["target"] = entry["word"]
                review["reference"] = entry["sentence"]
                review["question_text"] = f"Use '{entry['word']}' ({entry['meaning_vi']}) in a sentence"
        else:
            # Harder: write a full sentence
            question = (
                f"\U0001f4dd <b>[{n}/{total}] Write a sentence</b>\n\n"
                f"Use the word/phrase: <b>{html_escape(entry['word'], quote=False)}</b>\n"
                f"Meaning: <i>{html_escape(entry['meaning_vi'], quote=False)}</i>\n\n"
                f"\u270d Write a sentence in English using this word:"
            )
            review["exercise_type"] = "write-sentence"
            review["target"] = entry["word"]
            review["reference"] = entry["sentence"]
            review["question_text"] = f"Use '{entry['word']}' ({entry['meaning_vi']}) in a sentence"

    else:  # grammar
        examples = entry.get("examples", [])
        if examples:
            ex = random.choice(examples)
            wrong = ex.get("wrong", "")
            if wrong:
                question = (
                    f"\u270f\ufe0f <b>[{n}/{total}] Fix the error</b>\n\n"
                    f"\u274c <code>{html_escape(wrong, quote=False)}</code>\n\n"
                    f"Rule: <i>{html_escape(entry.get('meaning_vi', ''), quote=False)}</i>\n"
                    f"Write the correct sentence:"
                )
                review["exercise_type"] = "fix-error"
                review["target"] = entry["rule"]
                review["reference"] = ex.get("correct", "")
                review["question_text"] = f"Fix: {wrong}"
            else:
                question = (
                    f"\U0001f4dd <b>[{n}/{total}] Grammar</b>\n\n"
                    f"Rule: <b>{html_escape(entry['rule'], quote=False)}</b>\n"
                    f"<i>{html_escape(entry.get('meaning_vi', ''), quote=False)}</i>\n\n"
                    f"Write a sentence that follows this rule:"
                )
                review["exercise_type"] = "apply-rule"
                review["target"] = entry["rule"]
                review["reference"] = ex.get("correct", "")
                review["question_text"] = f"Apply rule: {entry['rule']}"
        else:
            review["current"] += 1
            await send_review_question(update, user_id)
            return

    msg = await _safe_reply(update.message or update.effective_chat, question)
    if msg:
        track_message(update.effective_chat.id, msg.message_id)


async def handle_review_answer(update: Update, user_id: int):
    review = active_reviews.get(user_id)
    if not review:
        return

    answer = update.message.text
    item = review["items"][review["current"]]
    entry = item["entry"]

    eval_prompt = REVIEW_EVALUATE_PROMPT.format(
        exercise_type=review.get("exercise_type", "translate"),
        target=review.get("target", ""),
        question=review.get("question_text", ""),
        reference=review.get("reference", ""),
        answer=answer,
    )

    streaming_msg = await update.message.reply_text("\U0001f914 ...")
    track_message(update.effective_chat.id, streaming_msg.message_id)

    result = await run_claude_oneshot(eval_prompt)

    # Determine correctness from Claude's response
    result_lower = result.lower()
    if "\u2705" in result or "correct" in result_lower:
        entry["correct_streak"] = entry.get("correct_streak", 0) + 1
        review["score"]["correct"] += 1
    elif "\u26a0" in result or "almost" in result_lower:
        entry["correct_streak"] = max(0, entry.get("correct_streak", 0) - 1)
        review["score"]["almost"] += 1
    else:
        entry["correct_streak"] = 0
        review["score"]["wrong"] += 1

    entry["last_reviewed"] = datetime.now().strftime("%Y-%m-%d")
    entry["next_review"] = get_next_review_date(entry["correct_streak"])

    # Save updated entry back to file
    file_data = load_json(Path(item["file"]))
    for i, e in enumerate(file_data.get("entries", [])):
        if item["type"] == "vocab" and e.get("word") == entry.get("word"):
            file_data["entries"][i] = entry
            break
        elif item["type"] == "grammar" and e.get("rule") == entry.get("rule"):
            file_data["entries"][i] = entry
            break
    save_json(Path(item["file"]), file_data)

    await _safe_edit(streaming_msg, format_for_telegram(result))

    review["current"] += 1

    if review["current"] < len(review["items"]):
        await asyncio.sleep(1)
        await send_review_question(update, user_id)
    else:
        await finish_review(update, user_id)


async def finish_review(update: Update, user_id: int):
    review = active_reviews.pop(user_id, None)
    if not review:
        return

    score = review["score"]
    total = score["correct"] + score["almost"] + score["wrong"]

    stats = get_stats(user_id)
    stats["total_reviews"] = stats.get("total_reviews", 0) + 1

    today = datetime.now().strftime("%Y-%m-%d")
    if stats.get("last_review_date") == (datetime.now() - timedelta(days=1)).strftime("%Y-%m-%d"):
        stats["streak_days"] = stats.get("streak_days", 0) + 1
    elif stats.get("last_review_date") != today:
        stats["streak_days"] = 1
    stats["last_review_date"] = today

    # Count mastered
    ud = user_dir(user_id)
    mastered_v = sum(
        1 for f in (ud / "vocab").glob("*.json")
        for e in load_json(f).get("entries", [])
        if e.get("correct_streak", 0) >= 4
    )
    mastered_g = sum(
        1 for f in (ud / "grammar").glob("*.json")
        for e in load_json(f).get("entries", [])
        if e.get("correct_streak", 0) >= 4
    )
    stats["vocab_mastered"] = mastered_v
    stats["grammar_mastered"] = mastered_g
    save_json(ud / "stats.json", stats)

    text = (
        f"\U0001f3c1 <b>Review complete!</b>\n\n"
        f"\u2705 Correct: {score['correct']}\n"
        f"\u26a0\ufe0f Almost: {score['almost']}\n"
        f"\u274c Wrong: {score['wrong']}\n"
        f"\U0001f4ca Total: {total}\n\n"
        f"\U0001f525 Streak: {stats['streak_days']} days"
    )
    chat = update.effective_chat
    await chat.send_message(text, parse_mode="HTML")


async def cmd_practice(update: Update, context: ContextTypes.DEFAULT_TYPE):
    if not is_authorized(update):
        return

    user_id = update.effective_user.id

    # Clear any existing session for fresh practice
    if user_id in claude_sessions:
        del claude_sessions[user_id]

    practice_sessions.add(user_id)
    practice_turns[user_id] = 0

    streaming_msg = await update.message.reply_text("\U0001f3ad ...")
    track_message(update.effective_chat.id, streaming_msg.message_id)

    response = await run_claude_stream(
        PRACTICE_START_PROMPT, streaming_msg, update.effective_chat.id,
        bot=update.get_bot(), system_prompt=SYSTEM_PROMPT, user_id=user_id,
    )
    await send_long_message(update, response, streaming_msg)


async def cmd_stop(update: Update, context: ContextTypes.DEFAULT_TYPE):
    if not is_authorized(update):
        return

    user_id = update.effective_user.id

    if user_id in active_reviews:
        await finish_review(update, user_id)
        await update.message.reply_text("\u23f9 Review ended early.")
        return

    if user_id in practice_sessions:
        practice_sessions.discard(user_id)
        practice_turns.pop(user_id, None)
        if user_id in claude_sessions:
            del claude_sessions[user_id]
        await update.message.reply_text("\u23f9 Practice ended.")
        return

    await update.message.reply_text("Nothing to stop.")


async def cmd_stats(update: Update, context: ContextTypes.DEFAULT_TYPE):
    if not is_authorized(update):
        return

    user_id = update.effective_user.id
    stats = get_stats(user_id)

    text = (
        f"\U0001f4ca <b>Your Progress</b>\n\n"
        f"\U0001f4d6 Vocab: <b>{stats.get('vocab_mastered', 0)}</b>/{stats.get('total_vocab', 0)} mastered\n"
        f"\U0001f4d0 Grammar: <b>{stats.get('grammar_mastered', 0)}</b>/{stats.get('total_grammar', 0)} mastered\n"
        f"\U0001f4dd Reviews: {stats.get('total_reviews', 0)}\n"
        f"\U0001f525 Streak: {stats.get('streak_days', 0)} days\n"
        f"\U0001f4c5 Last review: {stats.get('last_review_date', 'never')}"
    )
    await _safe_reply(update.message, text)


async def cmd_topics(update: Update, context: ContextTypes.DEFAULT_TYPE):
    if not is_authorized(update):
        return

    user_id = update.effective_user.id
    ud = user_dir(user_id)

    text = "\U0001f4da <b>Your Collections</b>\n\n"

    vocab_files = list((ud / "vocab").glob("*.json"))
    if vocab_files:
        text += "<b>Vocabulary:</b>\n"
        for f in sorted(vocab_files):
            data = load_json(f)
            entries = data.get("entries", [])
            mastered = sum(1 for e in entries if e.get("correct_streak", 0) >= 4)
            text += f"\u2022 <code>{f.stem}</code> \u2014 {mastered}/{len(entries)} mastered\n"
    else:
        text += "<i>No vocabulary yet. Try /vocab</i>\n"

    text += "\n"

    grammar_files = list((ud / "grammar").glob("*.json"))
    if grammar_files:
        text += "<b>Grammar:</b>\n"
        for f in sorted(grammar_files):
            data = load_json(f)
            entries = data.get("entries", [])
            mastered = sum(1 for e in entries if e.get("correct_streak", 0) >= 4)
            text += f"\u2022 <code>{f.stem}</code> \u2014 {mastered}/{len(entries)} mastered\n"
    else:
        text += "<i>No grammar yet. Try /grammar</i>\n"

    await _safe_reply(update.message, text)


async def cmd_reminder(update: Update, context: ContextTypes.DEFAULT_TYPE):
    if not is_authorized(update):
        return

    user_id = update.effective_user.id
    profile = get_profile(user_id)
    arg = " ".join(context.args).strip().lower() if context.args else ""

    if arg == "on":
        profile["reminder_enabled"] = True
        save_json(user_dir(user_id) / "profile.json", profile)
        await update.message.reply_text(f"\U0001f514 Reminder ON \u2014 {profile.get('reminder_time', '09:00')}")
    elif arg == "off":
        profile["reminder_enabled"] = False
        save_json(user_dir(user_id) / "profile.json", profile)
        await update.message.reply_text("\U0001f515 Reminder OFF")
    elif re.match(r"^\d{1,2}:\d{2}$", arg):
        profile["reminder_enabled"] = True
        profile["reminder_time"] = arg
        save_json(user_dir(user_id) / "profile.json", profile)
        await update.message.reply_text(f"\U0001f514 Reminder set to {arg}")
    else:
        status = "ON" if profile.get("reminder_enabled") else "OFF"
        t = profile.get("reminder_time", "09:00")
        await update.message.reply_text(
            f"\U0001f514 Reminder: <b>{status}</b> at {t}\n\n"
            f"Usage:\n"
            f"/reminder on\n"
            f"/reminder off\n"
            f"/reminder 09:00",
            parse_mode="HTML",
        )


async def cmd_new(update: Update, context: ContextTypes.DEFAULT_TYPE):
    if not is_authorized(update):
        return

    user_id = update.effective_user.id
    if user_id in claude_sessions:
        del claude_sessions[user_id]
    practice_sessions.discard(user_id)
    practice_turns.pop(user_id, None)
    active_reviews.pop(user_id, None)

    await update.message.reply_text("\U0001f195 New conversation started!")


async def cmd_clear(update: Update, context: ContextTypes.DEFAULT_TYPE):
    if not is_authorized(update):
        return

    chat_id = update.effective_chat.id
    user_id = update.effective_user.id

    ids = message_ids.get(chat_id, [])
    ids.append(update.message.message_id)
    for msg_id in ids:
        try:
            await context.bot.delete_message(chat_id, msg_id)
        except Exception:
            pass
    message_ids[chat_id] = []

    if user_id in claude_sessions:
        del claude_sessions[user_id]
    practice_sessions.discard(user_id)
    active_reviews.pop(user_id, None)

    msg = await update.effective_chat.send_message("\U0001f9f9 Chat cleared. Fresh start!")
    track_message(chat_id, msg.message_id)


# ---------------------------------------------------------------------------
# Message handlers
# ---------------------------------------------------------------------------


async def handle_text(update: Update, context: ContextTypes.DEFAULT_TYPE):
    if not is_authorized(update):
        return

    user_id = update.effective_user.id

    # Review mode: handle answer
    if user_id in active_reviews:
        await handle_review_answer(update, user_id)
        return

    # Practice mode: continue conversation
    if user_id in practice_sessions:
        practice_turns[user_id] = practice_turns.get(user_id, 0) + 1
        prompt = update.message.text

        if practice_turns[user_id] >= 5:
            prompt += "\n\n[This is the last exchange. Please wrap up the conversation naturally and give a brief summary of the user's English performance: what was good, what to improve. Bilingual.]"
            practice_sessions.discard(user_id)

        streaming_msg = await update.message.reply_text("\U0001f4ac ...")
        track_message(update.effective_chat.id, streaming_msg.message_id)

        response = await run_claude_stream(
            prompt, streaming_msg, update.effective_chat.id,
            bot=update.get_bot(), user_id=user_id,
        )
        await send_long_message(update, response, streaming_msg)
        return

    # Normal chat mode
    prompt = update.message.text
    streaming_msg = await update.message.reply_text("\U0001f4ac ...")
    track_message(update.effective_chat.id, streaming_msg.message_id)

    response = await run_claude_stream(
        prompt, streaming_msg, update.effective_chat.id,
        bot=update.get_bot(), system_prompt=SYSTEM_PROMPT, user_id=user_id,
    )
    await send_long_message(update, response, streaming_msg)


# ---------------------------------------------------------------------------
# Reminder job
# ---------------------------------------------------------------------------


async def check_reminders(context: ContextTypes.DEFAULT_TYPE):
    """Run periodically to send review reminders."""
    if not DATA_DIR.exists():
        return

    now = datetime.now()
    current_time = now.strftime("%H:%M")
    today = now.strftime("%Y-%m-%d")

    for user_hash_dir in DATA_DIR.iterdir():
        if not user_hash_dir.is_dir():
            continue

        profile = load_json(user_hash_dir / "profile.json")
        if not profile.get("reminder_enabled"):
            continue

        reminder_time = profile.get("reminder_time", "09:00")
        if current_time != reminder_time:
            continue

        stats = load_json(user_hash_dir / "stats.json")
        if stats.get("last_review_date") == today:
            continue

        # Count items due for review
        due_count = 0
        for folder in ["vocab", "grammar"]:
            folder_path = user_hash_dir / folder
            for fpath in folder_path.glob("*.json"):
                data = load_json(fpath)
                for entry in data.get("entries", []):
                    nr = entry.get("next_review", today)
                    if nr <= today and entry.get("correct_streak", 0) < 4:
                        due_count += 1

        if due_count == 0:
            continue

        # Find the actual telegram user ID from whitelist
        for uid in WHITELIST_USER_IDS:
            if hash_user_id(uid) == user_hash_dir.name:
                try:
                    await context.bot.send_message(
                        uid,
                        f"\U0001f4da Good morning! You have <b>{due_count}</b> items to review today.\n"
                        f"Type /review to start! \U0001f525",
                        parse_mode="HTML",
                    )
                except Exception as e:
                    logger.warning("Failed to send reminder to %s: %s", uid, e)
                break


# ---------------------------------------------------------------------------
# Main
# ---------------------------------------------------------------------------


def main():
    if not TELEGRAM_BOT_TOKEN:
        logger.error("TELEGRAM_BOT_TOKEN is not set")
        return

    if not WHITELIST_USER_IDS:
        logger.error("WHITELIST_USER_IDS is not set")
        return

    DATA_DIR.mkdir(parents=True, exist_ok=True)

    logger.info("Starting English Learning Agent...")
    logger.info("Whitelisted users: %d", len(WHITELIST_USER_IDS))

    app = Application.builder().token(TELEGRAM_BOT_TOKEN).build()

    async def post_init(application):
        await application.bot.set_my_commands([
            ("vocab", "Learn new vocabulary"),
            ("grammar", "Learn grammar"),
            ("review", "Review learned items"),
            ("practice", "Conversation practice"),
            ("stats", "Your progress"),
            ("topics", "Your collections"),
            ("reminder", "Set daily reminder"),
            ("new", "New conversation"),
            ("clear", "Clear chat history"),
            ("stop", "Stop review/practice"),
            ("help", "Show help"),
        ])

    app.post_init = post_init

    # Commands
    app.add_handler(CommandHandler("start", cmd_start))
    app.add_handler(CommandHandler("help", cmd_start))
    app.add_handler(CommandHandler("vocab", cmd_vocab))
    app.add_handler(CommandHandler("grammar", cmd_grammar))
    app.add_handler(CommandHandler("review", cmd_review))
    app.add_handler(CommandHandler("practice", cmd_practice))
    app.add_handler(CommandHandler("stop", cmd_stop))
    app.add_handler(CommandHandler("stats", cmd_stats))
    app.add_handler(CommandHandler("topics", cmd_topics))
    app.add_handler(CommandHandler("reminder", cmd_reminder))
    app.add_handler(CommandHandler("new", cmd_new))
    app.add_handler(CommandHandler("clear", cmd_clear))

    # Track messages for /clear
    async def track_incoming(update: Update, context: ContextTypes.DEFAULT_TYPE):
        if update.message:
            track_message(update.effective_chat.id, update.message.message_id)

    app.add_handler(MessageHandler(filters.ALL, track_incoming), group=-1)

    # Text messages
    app.add_handler(MessageHandler(filters.TEXT & ~filters.COMMAND, handle_text))

    # Reminder job: check every minute
    app.job_queue.run_repeating(check_reminders, interval=60, first=10)

    app.run_polling(allowed_updates=Update.ALL_TYPES)


if __name__ == "__main__":
    main()
