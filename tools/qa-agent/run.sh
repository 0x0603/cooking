#!/bin/bash
# QA Agent Runner — daily UX review via Claude CLI + Telegram report
# Usage: ./run.sh [url]
# Default: https://www.sodax.com/

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"

# Load config
if [ -f "$SCRIPT_DIR/.env" ]; then
  set -a
  source "$SCRIPT_DIR/.env"
  set +a
fi

TARGET_URL="${1:-${TARGET_URL:-https://www.sodax.com/}}"
DATE=$(date +%Y-%m-%d)
TIME=$(date +%H:%M)
APP_NAME=$(echo "$TARGET_URL" | sed -E 's|https?://||;s|www\.||;s|/.*||;s|\..*||')
REPORT_FILE="$SCRIPT_DIR/reports/${APP_NAME}-${DATE}.md"
LOG_FILE="$SCRIPT_DIR/reports/${APP_NAME}-${DATE}.log"

mkdir -p "$SCRIPT_DIR/reports"

# ── Telegram helpers ──────────────────────────────────────────────

send_telegram() {
  local text="$1"
  if [ -n "${TELEGRAM_BOT_TOKEN:-}" ] && [ -n "${TELEGRAM_CHAT_ID:-}" ]; then
    curl -s -X POST "https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage" \
      -d chat_id="$TELEGRAM_CHAT_ID" \
      -d parse_mode="HTML" \
      -d text="$text" \
      >/dev/null 2>&1
  fi
}

send_telegram_file() {
  local file="$1"
  local caption="$2"
  if [ -n "${TELEGRAM_BOT_TOKEN:-}" ] && [ -n "${TELEGRAM_CHAT_ID:-}" ]; then
    curl -s -X POST "https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendDocument" \
      -F chat_id="$TELEGRAM_CHAT_ID" \
      -F document=@"$file" \
      -F caption="$caption" \
      -F parse_mode="HTML" \
      >/dev/null 2>&1
  fi
}

# ── Build prompt ──────────────────────────────────────────────────

PERSONAS_NEW=$(cat "$SCRIPT_DIR/personas/new-user.md")
PERSONAS_EXP=$(cat "$SCRIPT_DIR/personas/experienced.md")
RULES=$(cat "$SCRIPT_DIR/rules.md")
SYSTEM_PROMPT=$(cat "$SCRIPT_DIR/run-qa.md")

PROMPT=$(cat <<PROMPT_EOF
You are running an automated daily UX review.

Target: $TARGET_URL
Date: $DATE

=== SYSTEM PROMPT ===
$SYSTEM_PROMPT

=== PERSONA: NEW USER ===
$PERSONAS_NEW

=== PERSONA: EXPERIENCED USER ===
$PERSONAS_EXP

=== EVALUATION RULES ===
$RULES

=== TASK ===
Review the DeFi app at $TARGET_URL.

Steps:
1. Navigate to $TARGET_URL using the browser
2. Take screenshots of each main page (Swap, Bridge, Pools, Portfolio, etc.)
3. For each page, role-play as both personas (Alex and Minh)
4. Evaluate against all 7 UX dimensions
5. Generate the full PO review report in the EXACT format specified in the system prompt

Important:
- Use Playwright to navigate and screenshot real pages
- Be thorough — check every page accessible from the navigation
- Output the complete report in markdown format
- Follow the report template EXACTLY as specified
PROMPT_EOF
)

# ── Notify start ──────────────────────────────────────────────────

send_telegram "$(cat <<EOF
🔍 <b>QA Agent Starting</b>

📱 <b>App:</b> $APP_NAME
🔗 <b>URL:</b> $TARGET_URL
📅 <b>Date:</b> $DATE $TIME
⏳ <b>Status:</b> Running...
EOF
)"

echo "[$DATE $TIME] Starting QA review for $TARGET_URL..."

# ── Run Claude CLI ────────────────────────────────────────────────

STARTED_AT=$(date +%s)

claude -p "$PROMPT" \
  --allowedTools "mcp__playwright__*,Read,Write,Glob" \
  >"$REPORT_FILE" \
  2>"$LOG_FILE"

ENDED_AT=$(date +%s)
DURATION=$(( (ENDED_AT - STARTED_AT) / 60 ))

echo "[$DATE] Report saved to $REPORT_FILE (${DURATION}min)"

# ── Extract summary for Telegram ─────────────────────────────────

# Pull key stats from the report
SCORE=$(grep -oP 'Overall UX Score: \K[0-9]+/10' "$REPORT_FILE" 2>/dev/null || echo "N/A")
CRITICAL=$(grep -c '🔴' "$REPORT_FILE" 2>/dev/null || echo "0")
MAJOR=$(grep -c '🟠' "$REPORT_FILE" 2>/dev/null || echo "0")
MINOR=$(grep -c '🟡' "$REPORT_FILE" 2>/dev/null || echo "0")
ENHANCE=$(grep -c '🔵' "$REPORT_FILE" 2>/dev/null || echo "0")

# Extract top 3 priorities (lines after "Top 3 Priority Fixes:")
TOP3=$(awk '/Top 3 Priority Fixes/{found=1; next} found && /^[0-9]/{print; count++} count>=3{exit}' "$REPORT_FILE" 2>/dev/null || echo "See full report")

# ── Send Telegram summary ────────────────────────────────────────

SUMMARY=$(cat <<EOF
📊 <b>UX Audit Complete — ${APP_NAME}</b>

🏆 <b>Score:</b> ${SCORE}
⏱ <b>Duration:</b> ${DURATION} min
📅 <b>Date:</b> ${DATE}

<b>Issues Found:</b>
🔴 Critical: ${CRITICAL}
🟠 Major: ${MAJOR}
🟡 Minor: ${MINOR}
🔵 Enhancement: ${ENHANCE}

<b>Top Priorities:</b>
${TOP3}

📎 Full report attached below.
EOF
)

send_telegram "$SUMMARY"

# Send full report as file
send_telegram_file "$REPORT_FILE" "Full UX Audit Report — ${APP_NAME} — ${DATE}"

echo "[$DATE] Telegram report sent."
