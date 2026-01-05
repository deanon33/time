#!/usr/bin/env python3
"""
Telegram BIN Lookup & Card Generator Bot
Uses python-telegram-bot library
"""

import random
import logging
from io import BytesIO

import httpx
from telegram import Update, InputFile
from telegram.ext import Application, CommandHandler, ContextTypes

# Configure logging
logging.basicConfig(
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    level=logging.INFO
)
logger = logging.getLogger(__name__)

# Bot token - Replace with your bot token from @BotFather
BOT_TOKEN = "YOUR_BOT_TOKEN_HERE"

# BIN API URL
BIN_API_URL = "https://bin.hex-unit.com/{bin}"


def luhn_checksum(card_number: str) -> int:
    """Calculate Luhn checksum using the Luhn algorithm."""
    total = 0
    reverse_digits = card_number[::-1]
    
    for i, digit in enumerate(reverse_digits):
        n = int(digit)
        if i % 2 == 1:
            n *= 2
            if n > 9:
                n -= 9
        total += n
    
    return total % 10


def generate_luhn_card(bin_prefix: str) -> str:
    """Generate a valid 16-digit card number using Luhn algorithm."""
    # Ensure we generate a 16-digit card
    remaining = 15 - len(bin_prefix)
    
    # Generate random digits for the middle part
    middle = ''.join([str(random.randint(0, 9)) for _ in range(remaining)])
    partial = bin_prefix + middle
    
    # Calculate check digit using Luhn
    total = 0
    for i, digit in enumerate(partial[::-1]):
        n = int(digit)
        if i % 2 == 0:
            n *= 2
            if n > 9:
                n -= 9
        total += n
    
    check_digit = (10 - (total % 10)) % 10
    return partial + str(check_digit)


def validate_luhn(card_number: str) -> bool:
    """Validate card number using Luhn algorithm."""
    return luhn_checksum(card_number) == 0


def generate_expiry() -> str:
    """Generate random expiry MM|YY."""
    month = random.randint(1, 12)
    year = random.randint(25, 30)
    return f"{month:02d}|{year:02d}"


def generate_cvv() -> str:
    """Generate random 3-digit CVV."""
    return f"{random.randint(0, 999):03d}"


def generate_cards(bin_prefix: str, amount: int, fixed_month: str = None, fixed_year: str = None) -> list:
    """Generate cards with valid Luhn checksums."""
    cards = []
    for _ in range(amount):
        card_number = generate_luhn_card(bin_prefix)
        
        if fixed_month and fixed_year:
            expiry = f"{fixed_month}|{fixed_year}"
        else:
            expiry = generate_expiry()
        
        cvv = generate_cvv()
        cards.append(f"{card_number}|{expiry}|{cvv}")
    
    return cards


def get_brand_emoji(brand: str) -> str:
    """Get emoji for card brand."""
    brand_emojis = {
        'VISA': '💳',
        'MASTERCARD': '💳',
        'AMEX': '💳',
        'AMERICAN EXPRESS': '💳',
        'DISCOVER': '💳',
        'JCB': '💳',
        'DINERS': '💳',
        'UNIONPAY': '💳',
    }
    return brand_emojis.get(brand.upper(), '💳') if brand else '💳'


def format_file_size(size_bytes: int) -> str:
    """Format file size in human readable format."""
    if size_bytes >= 1024 * 1024:
        return f"{size_bytes / (1024 * 1024):.1f} MB"
    elif size_bytes >= 1024:
        return f"{size_bytes / 1024:.1f} KB"
    else:
        return f"{size_bytes} B"


async def fetch_bin_info(bin_number: str) -> dict | None:
    """Fetch BIN information from API."""
    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            response = await client.get(BIN_API_URL.format(bin=bin_number))
            if response.status_code == 200:
                return response.json()
            return None
    except Exception as e:
        logger.error(f"Error fetching BIN info: {e}")
        return None


async def start_command(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    """Handle /start command."""
    user = update.effective_user
    welcome = f"""
╔══════════════════════════════════╗
       🎴 <b>CC GENERATOR BOT</b> 🎴
╚══════════════════════════════════╝

👋 <b>Welcome, {user.first_name}!</b>

━━━━━━━━━━━━━━━━━━━━━━━━━━
📌 <b>AVAILABLE COMMANDS</b>
━━━━━━━━━━━━━━━━━━━━━━━━━━

🔹 /gen - Generate credit cards
🔹 /bin - Lookup BIN information
🔹 /help - Show detailed help

━━━━━━━━━━━━━━━━━━━━━━━━━━
⚡ <b>QUICK EXAMPLES</b>
━━━━━━━━━━━━━━━━━━━━━━━━━━

<code>/gen 531462 10</code>
<code>/gen 531462|05|28 100</code>
<code>/bin 531462</code>

━━━━━━━━━━━━━━━━━━━━━━━━━━
✨ <i>Powered by Luhn Algorithm</i>
"""
    await update.message.reply_text(welcome, parse_mode='HTML')


async def help_command(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    """Handle /help command."""
    help_text = """
╔══════════════════════════════════╗
          📖 <b>HELP MENU</b> 📖
╚══════════════════════════════════╝

━━━━━━━━━━━━━━━━━━━━━━━━━━
🎴 <b>GENERATE CARDS</b>
━━━━━━━━━━━━━━━━━━━━━━━━━━

<b>Format:</b>
<code>/gen [BIN] [AMOUNT]</code>
<code>/gen [BIN|MM|YY] [AMOUNT]</code>

<b>Examples:</b>
<code>/gen 531462 100</code>
<code>/gen 440393|10|29 50</code>

━━━━━━━━━━━━━━━━━━━━━━━━━━
🔍 <b>BIN LOOKUP</b>
━━━━━━━━━━━━━━━━━━━━━━━━━━

<b>Format:</b>
<code>/bin [BIN]</code>

<b>Example:</b>
<code>/bin 531462</code>

━━━━━━━━━━━━━━━━━━━━━━━━━━
📋 <b>PARAMETERS</b>
━━━━━━━━━━━━━━━━━━━━━━━━━━

• <b>BIN</b> - 6-16 digit Bank ID Number
• <b>MM</b> - Expiry Month (01-12)
• <b>YY</b> - Expiry Year (25-30)
• <b>AMOUNT</b> - Cards count (1-1000)

━━━━━━━━━━━━━━━━━━━━━━━━━━
✅ <i>All cards pass Luhn validation</i>
"""
    await update.message.reply_text(help_text, parse_mode='HTML')


async def gen_command(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    """Handle /gen command."""
    if len(context.args) < 2:
        usage = """
❌ <b>Invalid Usage</b>

<b>Correct Format:</b>
<code>/gen [BIN] [AMOUNT]</code>
<code>/gen [BIN|MM|YY] [AMOUNT]</code>

<b>Examples:</b>
<code>/gen 531462 100</code>
<code>/gen 440393|10|29 50</code>
"""
        await update.message.reply_text(usage, parse_mode='HTML')
        return
    
    bin_input = context.args[0]
    fixed_month = None
    fixed_year = None
    
    # Parse BIN|MM|YY format
    if '|' in bin_input:
        parts = bin_input.split('|')
        bin_number = parts[0]
        if len(parts) >= 3:
            fixed_month = parts[1].zfill(2)
            fixed_year = parts[2].zfill(2)
    else:
        bin_number = bin_input
    
    # Validate BIN
    if not bin_number.isdigit() or len(bin_number) < 6:
        await update.message.reply_text(
            "❌ <b>Invalid BIN!</b>\n\n<i>BIN must be at least 6 digits.</i>",
            parse_mode='HTML'
        )
        return
    
    # Validate amount
    try:
        amount = int(context.args[1])
        if amount < 1 or amount > 1000:
            raise ValueError()
    except ValueError:
        await update.message.reply_text(
            "❌ <b>Invalid Amount!</b>\n\n<i>Enter a number between 1-1000.</i>",
            parse_mode='HTML'
        )
        return
    
    # Get user info with profile link
    user = update.effective_user
    user_link = f'<a href="tg://user?id={user.id}">{user.first_name or "User"}</a>'
    
    # Fetch BIN info
    bin_info = await fetch_bin_info(bin_number[:6])
    
    if not bin_info:
        await update.message.reply_text(
            "❌ <b>BIN Not Found!</b>\n\n<i>Could not fetch BIN information.</i>",
            parse_mode='HTML'
        )
        return
    
    # Generate cards
    cards = generate_cards(bin_number, amount, fixed_month, fixed_year)
    
    # Create file
    file_content = "\n".join(cards)
    file_bytes = BytesIO(file_content.encode('utf-8'))
    file_size = format_file_size(len(file_content.encode('utf-8')))
    
    # Extract info
    brand = bin_info.get('brand', 'N/A')
    bank = bin_info.get('bank', 'N/A')
    country_name = bin_info.get('country_name', 'N/A')
    country_flag = bin_info.get('country_flag', '🏳️')
    level = bin_info.get('level', 'N/A')
    card_type = bin_info.get('type', 'N/A')
    
    # Build response
    response = f"""
╔══════════════════════════════════╗
     ⬇️ <b>CARDS GENERATED</b> ⬇️
╚══════════════════════════════════╝

📁 <b>{bin_number} x Cards.txt</b>
📊 <b>Size:</b> {file_size}

━━━━━━━━━━━━━━━━━━━━━━━━━━
💳 <b>BIN INFORMATION</b>
━━━━━━━━━━━━━━━━━━━━━━━━━━

🔢 <b>BIN:</b> <code>{bin_number}</code>
🔢 <b>Amount:</b> <code>{amount}</code>
🏦 <b>Bank:</b> {bank}
🌍 <b>Country:</b> {country_name} {country_flag}
💎 <b>Info:</b> {level} - {card_type} - {brand}

━━━━━━━━━━━━━━━━━━━━━━━━━━
👤 <b>Generated By:</b> {user_link}
✅ <b>Luhn:</b> Valid
━━━━━━━━━━━━━━━━━━━━━━━━━━
"""
    
    await update.message.reply_document(
        document=InputFile(file_bytes, filename=f"{bin_number} x Cards.txt"),
        caption=response,
        parse_mode='HTML'
    )


async def bin_command(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    """Handle /bin command."""
    if len(context.args) < 1:
        usage = """
❌ <b>Invalid Usage</b>

<b>Format:</b> <code>/bin [BIN]</code>
<b>Example:</b> <code>/bin 531462</code>
"""
        await update.message.reply_text(usage, parse_mode='HTML')
        return
    
    bin_number = context.args[0]
    
    if not bin_number.isdigit() or len(bin_number) < 6:
        await update.message.reply_text(
            "❌ <b>Invalid BIN!</b>\n\n<i>BIN must be at least 6 digits.</i>",
            parse_mode='HTML'
        )
        return
    
    # Fetch BIN info
    bin_info = await fetch_bin_info(bin_number[:6])
    
    if not bin_info:
        await update.message.reply_text(
            "❌ <b>BIN Not Found!</b>\n\n<i>Could not fetch BIN information.</i>",
            parse_mode='HTML'
        )
        return
    
    # Extract info
    brand = bin_info.get('brand', 'N/A')
    bank = bin_info.get('bank', 'N/A')
    country_name = bin_info.get('country_name', 'N/A')
    country_flag = bin_info.get('country_flag', '🏳️')
    country_code = bin_info.get('country', 'N/A')
    level = bin_info.get('level', 'N/A')
    card_type = bin_info.get('type', 'N/A')
    currencies = bin_info.get('country_currencies', [])
    currency_str = ', '.join(currencies) if currencies else 'N/A'
    
    response = f"""
╔══════════════════════════════════╗
        🔍 <b>BIN LOOKUP</b> 🔍
╚══════════════════════════════════╝

━━━━━━━━━━━━━━━━━━━━━━━━━━
📋 <b>CARD DETAILS</b>
━━━━━━━━━━━━━━━━━━━━━━━━━━

🔢 <b>BIN:</b> <code>{bin_number}</code>
💳 <b>Brand:</b> {brand}
📊 <b>Type:</b> {card_type}
💎 <b>Level:</b> {level}

━━━━━━━━━━━━━━━━━━━━━━━━━━
🏦 <b>BANK DETAILS</b>
━━━━━━━━━━━━━━━━━━━━━━━━━━

🏛️ <b>Bank:</b> {bank}
🌍 <b>Country:</b> {country_name} {country_flag}
🔤 <b>Code:</b> {country_code}
💵 <b>Currency:</b> {currency_str}

━━━━━━━━━━━━━━━━━━━━━━━━━━
"""
    
    await update.message.reply_text(response, parse_mode='HTML')


async def error_handler(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    """Handle errors."""
    logger.error(f"Update {update} caused error {context.error}")


def main() -> None:
    """Main function."""
    if BOT_TOKEN == "YOUR_BOT_TOKEN_HERE":
        logger.error("Please set your bot token in BOT_TOKEN variable!")
        return
    
    application = Application.builder().token(BOT_TOKEN).build()
    
    application.add_handler(CommandHandler("start", start_command))
    application.add_handler(CommandHandler("help", help_command))
    application.add_handler(CommandHandler("gen", gen_command))
    application.add_handler(CommandHandler("bin", bin_command))
    application.add_error_handler(error_handler)
    
    logger.info("Bot is starting...")
    application.run_polling(allowed_updates=Update.ALL_TYPES)


if __name__ == "__main__":
    main()
