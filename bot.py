import asyncio
import datetime as dt
import os
import random
import re
from dataclasses import dataclass
from typing import Any, Optional

import httpx
from telegram import InputFile, Update
from telegram.constants import ParseMode
from telegram.ext import (
    Application,
    CommandHandler,
    ContextTypes,
    MessageHandler,
    filters,
)


BIN_RE = re.compile(r"^\d{6,8}$")
GEN_RE = re.compile(r"^(?:/)?gen\s+(\d{6,8})\s+(\d+)\s*$", re.IGNORECASE)


@dataclass(frozen=True)
class BinInfo:
    bin: str
    brand: str
    country: str
    country_name: str
    country_flag: str
    bank: str
    level: str
    type: str

    @classmethod
    def from_api(cls, data: dict[str, Any]) -> "BinInfo":
        # Be resilient to missing keys / different casing.
        def get(key: str, default: str = "UNKNOWN") -> str:
            v = data.get(key)
            return default if v is None or v == "" else str(v)

        return cls(
            bin=get("bin"),
            brand=get("brand"),
            country=get("country"),
            country_name=get("country_name"),
            country_flag=get("country_flag", ""),
            bank=get("bank"),
            level=get("level"),
            type=get("type"),
        )


async def fetch_bin_info(bin_value: str, client: httpx.AsyncClient) -> BinInfo:
    url = f"https://bin.hex-unit.com/{bin_value}"
    resp = await client.get(url, timeout=15.0)
    resp.raise_for_status()
    data = resp.json()
    if not isinstance(data, dict):
        raise ValueError("Unexpected API response shape")
    return BinInfo.from_api(data)


def format_bin_info_text(info: BinInfo, amount: Optional[int] = None, generated_by: str = "Unknown") -> str:
    bin_info = f"{info.level} - {info.type} - {info.brand}"
    country = f"{info.country_name} {info.country_flag}".strip()
    lines = [
        f"BIN: {info.bin}",
    ]
    if amount is not None:
        lines.append(f"Amount: {amount}")
    lines.extend(
        [
            f"Bank: {info.bank}",
            f"Country: {country}",
            f"BIN Info: {bin_info}",
            "________________________________________",
            f"Generate By: {generated_by}",
        ]
    )
    return "\n".join(lines) + "\n"


def build_safe_placeholders(bin_value: str, count: int) -> list[str]:
    """
    Generate *non-payable placeholders*, not real card numbers:
    - Includes non-digit characters ("X") so it cannot be used as a PAN.
    - Uses "XXX" for CVV.
    """
    bin_len = len(bin_value)
    total_len = 16
    if bin_len >= total_len:
        prefix = bin_value[:6]
        bin_value = prefix
        bin_len = len(bin_value)
    middle_len = max(0, total_len - bin_len - 4)

    now = dt.datetime.utcnow()
    current_year = now.year % 100
    placeholders: list[str] = []
    for _ in range(count):
        last4 = "".join(str(random.randint(0, 9)) for _ in range(4))
        mm = random.randint(1, 12)
        yy = random.randint(max(current_year, 25), max(current_year, 25) + 6)
        pan = f"{bin_value}{'X' * middle_len}{last4}"
        placeholders.append(f"{pan}|{mm:02d}|{yy:02d}|XXX")
    return placeholders


def clamp_amount(n: int) -> int:
    # Keep memory/file sizes reasonable.
    return max(1, min(n, 2000))


async def cmd_start(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    text = (
        "Send:\n"
        "- /bin <6-8 digits>\n"
        "- /gen <6-8 digits> <amount>\n"
        "- or: gen <bin> <amount>\n\n"
        "Note: This bot only generates *placeholders* (not real card numbers)."
    )
    await update.effective_message.reply_text(text)


async def cmd_bin(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    if not context.args:
        await update.effective_message.reply_text("Usage: /bin <6-8 digits>")
        return
    bin_value = context.args[0].strip()
    if not BIN_RE.match(bin_value):
        await update.effective_message.reply_text("BIN must be 6-8 digits.")
        return

    client: httpx.AsyncClient = context.application.bot_data["httpx"]
    try:
        info = await fetch_bin_info(bin_value, client)
    except Exception as e:
        await update.effective_message.reply_text(f"BIN lookup failed: {e}")
        return

    # Keep it simple as a message.
    bin_info = f"{info.level} - {info.type} - {info.brand}"
    country = f"{info.country_name} {info.country_flag}".strip()
    msg = (
        f"*BIN:* `{info.bin}`\n"
        f"*Bank:* {info.bank}\n"
        f"*Country:* {country}\n"
        f"*BIN Info:* {bin_info}\n"
    )
    await update.effective_message.reply_text(msg, parse_mode=ParseMode.MARKDOWN)


async def cmd_gen(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    if len(context.args) < 2:
        await update.effective_message.reply_text("Usage: /gen <6-8 digits> <amount>")
        return
    await handle_gen(update, context, context.args[0].strip(), context.args[1].strip())


async def handle_gen(update: Update, context: ContextTypes.DEFAULT_TYPE, bin_value: str, amount_raw: str) -> None:
    if not BIN_RE.match(bin_value):
        await update.effective_message.reply_text("BIN must be 6-8 digits.")
        return

    try:
        amount = int(amount_raw)
    except ValueError:
        await update.effective_message.reply_text("Amount must be an integer.")
        return

    amount = clamp_amount(amount)

    client: httpx.AsyncClient = context.application.bot_data["httpx"]
    try:
        info = await fetch_bin_info(bin_value, client)
    except Exception as e:
        await update.effective_message.reply_text(f"BIN lookup failed: {e}")
        return

    user = update.effective_user
    generated_by = (user.first_name if user and user.first_name else "Unknown").strip() or "Unknown"

    header = format_bin_info_text(info, amount=amount, generated_by=generated_by)
    placeholders = build_safe_placeholders(bin_value, amount)
    content = header + "\n".join(placeholders) + "\n"

    filename = f"{bin_value} x {amount} Cards.txt"
    data = content.encode("utf-8")

    await update.effective_message.reply_document(
        document=InputFile(data, filename=filename),
        caption=f"{bin_value} x Cards.txt",
    )


async def on_text(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    text = (update.effective_message.text or "").strip()
    m = GEN_RE.match(text)
    if not m:
        return
    bin_value, amount_raw = m.group(1), m.group(2)
    await handle_gen(update, context, bin_value, amount_raw)


async def post_init(app: Application) -> None:
    # One shared HTTP client.
    app.bot_data["httpx"] = httpx.AsyncClient(headers={"User-Agent": "ptb-bin-bot/1.0"})


async def post_shutdown(app: Application) -> None:
    client: httpx.AsyncClient = app.bot_data.get("httpx")
    if client:
        await client.aclose()


def main() -> None:
    token = os.getenv("BOT_TOKEN", "").strip()
    if not token:
        raise SystemExit("Missing BOT_TOKEN environment variable.")

    app = (
        Application.builder()
        .token(token)
        .post_init(post_init)
        .post_shutdown(post_shutdown)
        .build()
    )

    app.add_handler(CommandHandler("start", cmd_start))
    app.add_handler(CommandHandler("bin", cmd_bin))
    app.add_handler(CommandHandler("gen", cmd_gen))
    app.add_handler(MessageHandler(filters.TEXT & ~filters.COMMAND, on_text))

    app.run_polling(allowed_updates=Update.ALL_TYPES)


if __name__ == "__main__":
    main()
