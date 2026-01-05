#!/usr/bin/env python3
"""
Telegram BIN Lookup & Card Generator Bot
Uses python-telegram-bot library
"""

import random
import logging
from datetime import datetime
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
    """Calculate Luhn checksum digit."""
    def digits_of(n):
        return [int(d) for d in str(n)]
    
    digits = digits_of(card_number)
    odd_digits = digits[-1::-2]
    even_digits = digits[-2::-2]
    
    checksum = sum(odd_digits)
    for d in even_digits:
        checksum += sum(digits_of(d * 2))
    
    return checksum % 10


def generate_card_number(bin_prefix: str) -> str:
    """Generate a valid card number with Luhn checksum."""
    # Card number is typically 16 digits
    # BIN is 6-8 digits, we need to generate the rest
    remaining_length = 15 - len(bin_prefix)
    
    # Generate random middle digits
    middle = ''.join([str(random.randint(0, 9)) for _ in range(remaining_length)])
    partial_card = bin_prefix + middle
    
    # Calculate Luhn check digit
    checksum = luhn_checksum(partial_card + '0')
    check_digit = (10 - checksum) % 10
    
    return partial_card + str(check_digit)


def generate_expiry() -> str:
    """Generate a random expiry date (MM/YY format)."""
    month = random.randint(1, 12)
    year = random.randint(25, 30)  # 2025-2030
    return f"{month:02d}|{year:02d}"


def generate_cvv() -> str:
    """Generate a random 3-digit CVV."""
    return f"{random.randint(0, 999):03d}"


def generate_cards(bin_prefix: str, amount: int) -> list:
    """Generate a list of cards with the given BIN prefix."""
    cards = []
    for _ in range(amount):
        card_number = generate_card_number(bin_prefix)
        expiry = generate_expiry()
        cvv = generate_cvv()
        cards.append(f"{card_number}|{expiry}|{cvv}")
    return cards


async def fetch_bin_info(bin_number: str) -> dict | None:
    """Fetch BIN information from the API."""
    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            response = await client.get(BIN_API_URL.format(bin=bin_number))
            if response.status_code == 200:
                return response.json()
            else:
                logger.error(f"BIN API returned status {response.status_code}")
                return None
    except Exception as e:
        logger.error(f"Error fetching BIN info: {e}")
        return None


async def start_command(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    """Handle /start command."""
    welcome_message = """
🎴 *BIN Lookup & Card Generator Bot*

*Available Commands:*
• `/gen <BIN> <amount>` - Generate cards with BIN lookup

*Example:*
`/gen 531462 10`

_This will generate 10 cards with BIN 531462 and show BIN information._
    """
    await update.message.reply_text(welcome_message, parse_mode='Markdown')


async def help_command(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    """Handle /help command."""
    help_text = """
📖 *Help*

*Usage:*
`/gen <BIN> <amount>`

*Parameters:*
• `BIN` - 6-8 digit Bank Identification Number
• `amount` - Number of cards to generate (1-1000)

*Example:*
`/gen 419011000705 500`
    """
    await update.message.reply_text(help_text, parse_mode='Markdown')


async def gen_command(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    """Handle /gen command - Generate cards and lookup BIN info."""
    # Parse arguments
    if len(context.args) < 2:
        await update.message.reply_text(
            "❌ *Usage:* `/gen <BIN> <amount>`\n*Example:* `/gen 531462 100`",
            parse_mode='Markdown'
        )
        return
    
    bin_number = context.args[0]
    
    # Validate BIN
    if not bin_number.isdigit() or len(bin_number) < 6:
        await update.message.reply_text(
            "❌ *Invalid BIN!* BIN must be at least 6 digits.",
            parse_mode='Markdown'
        )
        return
    
    # Validate amount
    try:
        amount = int(context.args[1])
        if amount < 1 or amount > 1000:
            raise ValueError("Amount out of range")
    except ValueError:
        await update.message.reply_text(
            "❌ *Invalid amount!* Please enter a number between 1 and 1000.",
            parse_mode='Markdown'
        )
        return
    
    # Get user info
    user = update.effective_user
    username = user.username or user.first_name or "User"
    
    # Fetch BIN information
    bin_info = await fetch_bin_info(bin_number[:6])  # API typically uses first 6 digits
    
    if not bin_info:
        await update.message.reply_text(
            "❌ *Failed to fetch BIN information.* Please try again later.",
            parse_mode='Markdown'
        )
        return
    
    # Generate cards
    cards = generate_cards(bin_number, amount)
    
    # Create file content
    file_content = "\n".join(cards)
    file_bytes = BytesIO(file_content.encode('utf-8'))
    file_bytes.name = f"{bin_number} x Cards.txt"
    
    # Extract BIN info
    brand = bin_info.get('brand', 'N/A')
    bank = bin_info.get('bank', 'N/A')
    country_name = bin_info.get('country_name', 'N/A')
    country_flag = bin_info.get('country_flag', '🏳️')
    level = bin_info.get('level', 'N/A')
    card_type = bin_info.get('type', 'N/A')
    
    # Format BIN info string
    bin_info_str = f"{level} - {card_type} - {brand}"
    
    # Calculate file size
    file_size = len(file_content.encode('utf-8'))
    if file_size >= 1024:
        size_str = f"{file_size / 1024:.1f} KB"
    else:
        size_str = f"{file_size} B"
    
    # Create response message
    response_message = f"""
⬇️ *{bin_number} x Cards.txt*
{size_str}

*BIN:* `{bin_number}`
*Amount:* `{amount}`
*Bank:* {bank}
*Country:* {country_name} {country_flag}
*BIN Info:* {bin_info_str}

🎴 *Generate By:* {username}
    """
    
    # Send the file with caption
    await update.message.reply_document(
        document=InputFile(file_bytes, filename=f"{bin_number} x Cards.txt"),
        caption=response_message,
        parse_mode='Markdown'
    )


async def error_handler(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    """Handle errors."""
    logger.error(f"Update {update} caused error {context.error}")


def main() -> None:
    """Main function to run the bot."""
    if BOT_TOKEN == "YOUR_BOT_TOKEN_HERE":
        logger.error("Please set your bot token in BOT_TOKEN variable!")
        return
    
    # Create application
    application = Application.builder().token(BOT_TOKEN).build()
    
    # Add handlers
    application.add_handler(CommandHandler("start", start_command))
    application.add_handler(CommandHandler("help", help_command))
    application.add_handler(CommandHandler("gen", gen_command))
    
    # Add error handler
    application.add_error_handler(error_handler)
    
    # Run the bot
    logger.info("Bot is starting...")
    application.run_polling(allowed_updates=Update.ALL_TYPES)


if __name__ == "__main__":
    main()
