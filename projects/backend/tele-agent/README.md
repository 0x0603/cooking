# Tele Agent

Telegram bot powered by Claude Code CLI — hỗ trợ debug, review code, git operations qua Telegram.

## Features

- 💬 Chat trực tiếp với Claude về codebase
- 🖼️ Gửi ảnh (screenshot error, UI) → Claude phân tích
- 📎 Gửi file (logs, code) → Claude đọc và phân tích
- 🔍 Xem git changes, status, log
- 🔬 Auto review code changes

## Commands

| Command         | Description                            |
| --------------- | -------------------------------------- |
| `/start`        | Hiển thị help                          |
| `/changes`      | Git diff summary                       |
| `/review`       | Claude phân tích chi tiết code changes |
| `/status`       | Git status + current branch            |
| `/log`          | 10 commits gần nhất                    |
| `/branch`       | Danh sách branches                     |
| `/ask <prompt>` | Hỏi Claude về repo                     |

## Setup

### 1. Tạo Telegram Bot

- Chat với [@BotFather](https://t.me/BotFather) trên Telegram
- Gửi `/newbot`, đặt tên, lấy **token**

### 2. Lấy Telegram User ID

- Chat với [@userinfobot](https://t.me/userinfobot) trên Telegram
- Copy **ID** của bạn

### 3. Config

```bash
cp .env.example .env
```

Edit `.env`:

```
TELEGRAM_BOT_TOKEN=123456:ABC-DEF...
TELEGRAM_USER_ID=123456789
REPO_PATH=/Users/sangnguyen/Documents/GitHub/sodax-frontend
```

### 4. Install & Run

```bash
cd projects/backend/tele-agent
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
python main.py
```

## Security

- Bot chỉ respond cho `TELEGRAM_USER_ID` của bạn
- Không ai khác chat được với bot
- Claude CLI chạy với quyền user hiện tại
