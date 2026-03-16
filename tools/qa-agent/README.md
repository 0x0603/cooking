# QA Agent — DeFi UX Audit (PO Perspective)

An automated agent that acts as a Senior Product Owner, auditing DeFi app UX daily and reporting via Telegram.

## Structure

```
qa-agent/
├── personas/
│   ├── new-user.md        # Alex — first-time DeFi user
│   └── experienced.md     # Minh — experienced DeFi degen
├── rules.md               # 7 evaluation dimensions + severity levels
├── reports/               # Generated reports (per day)
├── run-qa.md              # Main prompt fed to Claude
├── run.sh                 # Runner script (Claude CLI + Telegram)
├── .env                   # Telegram credentials (git-ignored)
├── .env.example           # Template for .env
└── README.md
```

## Setup

### 1. Create Telegram Bot

1. Open [@BotFather](https://t.me/BotFather) on Telegram
2. Send `/newbot`, follow prompts, copy the **bot token**
3. Add the bot to your group/channel, or message it directly
4. Get your **chat ID** via `https://api.telegram.org/bot<TOKEN>/getUpdates`

### 2. Configure

```bash
cd tools/qa-agent
cp .env.example .env
# Edit .env with your credentials
```

### 3. Test Run

```bash
./run.sh
# Or with a custom URL:
./run.sh https://app.uniswap.org
```

### 4. Schedule (5 AM daily)

```bash
# Add cron job
(crontab -l 2>/dev/null; echo "0 5 * * * /Users/sangnguyen/Documents/GitHub/cooking/tools/qa-agent/run.sh") | crontab -

# Verify
crontab -l

# Remove cron job
crontab -r
```

## What You Get on Telegram

**Message 1 — Summary:**

```
📊 UX Audit Complete — sodax

🏆 Score: 6/10
⏱ Duration: 12 min
📅 Date: 2026-03-16

Issues Found:
🔴 Critical: 3
🟠 Major: 5
🟡 Minor: 8
🔵 Enhancement: 4

Top Priorities:
1. Slippage has no explanation
2. No confirmation for large swaps
3. Error messages not actionable

📎 Full report attached below.
```

**Message 2 — Full `.md` report file attached**

## Report Format

Each report includes:

- Executive Summary with overall UX score (1-10)
- Page-by-page review with scored issues
- End-to-end flow analysis (swap, bridge, liquidity)
- Priority backlog table
- Actionable recommendations (quick wins, next sprint, strategic)

## Evaluation Dimensions

| #   | Dimension       | What it catches                        |
| --- | --------------- | -------------------------------------- |
| 1   | Confusing UX    | Unclear labels, broken flows           |
| 2   | Missing Context | No tooltips, unexplained terms         |
| 3   | Cognitive Load  | Information overload, no hierarchy     |
| 4   | Trust & Safety  | Risk not communicated, no confirmation |
| 5   | Onboarding      | No guidance for first-time users       |
| 6   | Error Recovery  | Bad error messages, no retry           |
| 7   | Wording & Copy  | Vague CTAs, inconsistent terms         |

## Customization

- **Different app:** `./run.sh https://other-defi-app.com` or change `TARGET_URL` in `.env`
- **New personas:** Add files in `personas/`
- **Adjust rules:** Edit `rules.md`
- **Change schedule:** Edit crontab (`0 8 * * 1` = Monday 8 AM)
