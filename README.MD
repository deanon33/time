### Telegram BIN Info Bot (python-telegram-bot)

This repo contains a simple Telegram bot that:

- **Looks up BIN info** using `https://bin.hex-unit.com/<bin>`
- Supports:
  - **`/bin <bin>`** (6–8 digits)
  - **`/gen <bin> <amount>`** or **`gen <bin> <amount>`**

Important: the `/gen` output is a **safe placeholder list** (contains non-digit characters and `XXX` CVV). It does **not** generate real card numbers.

### Setup

Create a bot token with [@BotFather](https://t.me/BotFather).

```bash
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
export BOT_TOKEN="YOUR_TELEGRAM_BOT_TOKEN"
python3 bot.py
```
