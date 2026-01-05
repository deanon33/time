#!/usr/bin/env python3
"""
Telegram BIN Lookup & Card Generator Bot
Uses python-telegram-bot library
"""

import random
import logging
from io import BytesIO

import httpx
from telegram import Update, InputFile, InlineKeyboardButton, InlineKeyboardMarkup
from telegram.ext import Application, CommandHandler, CallbackQueryHandler, ContextTypes

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
🔹 /mgen - Multi BIN generate
🔹 /bin - Lookup BIN information
🔹 /mbin - Multi BIN lookup
🔹 /vcc - Filter valid CCs
🔹 /adbin - Filter by BIN
🔹 /help - Show detailed help

━━━━━━━━━━━━━━━━━━━━━━━━━━
⚡ <b>QUICK EXAMPLES</b>
━━━━━━━━━━━━━━━━━━━━━━━━━━

<code>/gen 531462 10</code>
<code>/mgen 531462,440393 10</code>
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

<b>Single BIN:</b>
<code>/gen [BIN]</code> - Default 10 cards
<code>/gen [BIN] [AMOUNT]</code>
<code>/gen [BIN|MM|YY] [AMOUNT]</code>

<b>Multiple BINs:</b>
<code>/mgen [BIN1,BIN2] [AMOUNT]</code>

<b>Examples:</b>
<code>/gen 531462</code>
<code>/gen 531462 100</code>
<code>/mgen 531462,440393 10</code>

━━━━━━━━━━━━━━━━━━━━━━━━━━
🔍 <b>BIN LOOKUP</b>
━━━━━━━━━━━━━━━━━━━━━━━━━━

<b>Format:</b>
<code>/bin [BIN]</code>

<b>Example:</b>
<code>/bin 531462</code>

━━━━━━━━━━━━━━━━━━━━━━━━━━
🔍 <b>MULTI BIN LOOKUP</b>
━━━━━━━━━━━━━━━━━━━━━━━━━━

Reply to a message or .txt file:
<code>/mbin</code>

<i>Checks up to 20 unique BINs at once.</i>

━━━━━━━━━━━━━━━━━━━━━━━━━━
✅ <b>VALID CC FILTER</b>
━━━━━━━━━━━━━━━━━━━━━━━━━━

Reply to a message or .txt file:
<code>/vcc</code>

<i>Filters valid CCs using Luhn validation.</i>

━━━━━━━━━━━━━━━━━━━━━━━━━━
🎯 <b>BIN FILTER</b>
━━━━━━━━━━━━━━━━━━━━━━━━━━

Reply to a message or .txt file:
<code>/adbin [BIN]</code>

<b>Example:</b>
<code>/adbin 460827</code>

<i>Filters cards matching a specific BIN.</i>

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
    if len(context.args) < 1:
        usage = """❌ <b>Invalid Usage</b>

<b>Format:</b>
<code>/gen [BIN]</code> - Generate 10 cards
<code>/gen [BIN] [AMOUNT]</code>
<code>/gen [BIN|MM|YY] [AMOUNT]</code>

<b>Examples:</b>
<code>/gen 531462</code>
<code>/gen 531462 100</code>
<code>/gen 440393|10|29 50</code>"""
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
    
    # Get amount (default to 10 if not provided)
    if len(context.args) >= 2:
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
    else:
        amount = 10  # Default amount
    
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
    
    # Extract info
    brand = bin_info.get('brand', 'N/A')
    bank = bin_info.get('bank', 'N/A')
    country_name = bin_info.get('country_name', 'N/A')
    country_flag = bin_info.get('country_flag', '🏳️')
    level = bin_info.get('level', 'N/A')
    card_type = bin_info.get('type', 'N/A')
    
    # Get user info with profile link
    user = update.effective_user
    user_link = f'<a href="tg://user?id={user.id}">{user.first_name or "User"}</a>'
    
    # Decide: show in message or send as file
    if amount <= 10:
        # Show cards in message
        cards_text = "\n".join(cards)
        
        response = f"""𝗕𝗜𝗡 ⇾ <code>{bin_number}</code>
𝗔𝗺𝗼𝘂𝗻𝘁 ⇾ {amount}

<code>{cards_text}</code>

𝗕𝗮𝗻𝗸: {bank}
𝗖𝗼𝘂𝗻𝘁𝗿𝘆: {country_name} {country_flag}
𝗕𝗜𝗡 𝗜𝗻𝗳𝗼: {level} - {card_type} - {brand}"""
        
        # Create Re-Generate button with callback data
        callback_data = f"regen:{bin_input}:{amount}"
        keyboard = InlineKeyboardMarkup([
            [InlineKeyboardButton("Re-Generate", callback_data=callback_data)]
        ])
        
        await update.message.reply_text(
            response,
            parse_mode='HTML',
            reply_markup=keyboard,
            reply_to_message_id=update.message.message_id
        )
    else:
        # Send as file for larger amounts
        file_content = "\n".join(cards)
        file_bytes = BytesIO(file_content.encode('utf-8'))
        
        response = f"""𝗕𝗜𝗡: <code>{bin_number}</code>
𝗔𝗺𝗼𝘂𝗻𝘁: {amount}
𝗕𝗮𝗻𝗸: {bank}
𝗖𝗼𝘂𝗻𝘁𝗿𝘆: {country_name} {country_flag}
𝗕𝗜𝗡 𝗜𝗻𝗳𝗼: {level} - {card_type} - {brand}
━━━━━━━━━━━━━━━━━━
𝗚𝗲𝗻𝗲𝗿𝗮𝘁𝗲 𝗕𝘆: {user_link}"""
        
        await update.message.reply_document(
            document=InputFile(file_bytes, filename=f"{bin_number} x Cards.txt"),
            caption=response,
            parse_mode='HTML',
            reply_to_message_id=update.message.message_id
        )


async def regen_callback(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    """Handle Re-Generate button callback."""
    query = update.callback_query
    await query.answer()
    
    # Parse callback data: regen:bin_input:amount
    data = query.data.split(':')
    if len(data) < 3:
        return
    
    bin_input = data[1]
    amount = int(data[2])
    
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
    
    # Fetch BIN info
    bin_info = await fetch_bin_info(bin_number[:6])
    
    if not bin_info:
        await query.answer("BIN Not Found!", show_alert=True)
        return
    
    # Generate new cards
    cards = generate_cards(bin_number, amount, fixed_month, fixed_year)
    
    # Extract info
    brand = bin_info.get('brand', 'N/A')
    bank = bin_info.get('bank', 'N/A')
    country_name = bin_info.get('country_name', 'N/A')
    country_flag = bin_info.get('country_flag', '🏳️')
    level = bin_info.get('level', 'N/A')
    card_type = bin_info.get('type', 'N/A')
    
    cards_text = "\n".join(cards)
    
    response = f"""𝗕𝗜𝗡 ⇾ <code>{bin_number}</code>
𝗔𝗺𝗼𝘂𝗻𝘁 ⇾ {amount}

<code>{cards_text}</code>

𝗕𝗮𝗻𝗸: {bank}
𝗖𝗼𝘂𝗻𝘁𝗿𝘆: {country_name} {country_flag}
𝗕𝗜𝗡 𝗜𝗻𝗳𝗼: {level} - {card_type} - {brand}"""
    
    # Keep the same button
    callback_data = f"regen:{bin_input}:{amount}"
    keyboard = InlineKeyboardMarkup([
        [InlineKeyboardButton("Re-Generate", callback_data=callback_data)]
    ])
    
    await query.edit_message_text(
        response,
        parse_mode='HTML',
        reply_markup=keyboard
    )


async def bin_command(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    """Handle /bin command."""
    if len(context.args) < 1:
        usage = """
❌ <b>Invalid Usage</b>

<b>Format:</b> <code>/bin [BIN or CARD]</code>
<b>Examples:</b>
<code>/bin 531462</code>
<code>/bin 4390930039505670|04|28|846</code>
"""
        await update.message.reply_text(usage, parse_mode='HTML')
        return
    
    input_value = context.args[0]
    
    # Extract BIN from various formats (card|mm|yy|cvv or just BIN)
    if '|' in input_value:
        bin_number = input_value.split('|')[0]
    else:
        bin_number = input_value
    
    # Extract first 6 digits for BIN lookup
    bin_number = ''.join(filter(str.isdigit, bin_number))
    
    if len(bin_number) < 6:
        await update.message.reply_text(
            "❌ <b>Invalid BIN!</b>\n\n<i>BIN must be at least 6 digits.</i>",
            parse_mode='HTML'
        )
        return
    
    # Use first 6 digits for API lookup, but display full input
    bin_lookup = bin_number[:6]
    bin_display = bin_number[:8] if len(bin_number) >= 8 else bin_number[:6]
    
    # Fetch BIN info
    bin_info = await fetch_bin_info(bin_lookup)
    
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
    level = bin_info.get('level', 'N/A')
    card_type = bin_info.get('type', 'N/A')
    
    response = f"""🔍 𝗕𝗜𝗡 𝗗𝗲𝘁𝗮𝗶𝗹𝘀 📋
━━━━━━━━━━━━━━━━━━
• 𝗕𝗜𝗡: <code>{bin_display}</code>
• 𝗜𝗡𝗙𝗢: {level} - {card_type} - {brand}
• 𝗕𝗔𝗡𝗞: {bank}
• 𝗖𝗢𝗨𝗡𝗧𝗥𝗬: {country_name} {country_flag}"""
    
    await update.message.reply_text(
        response,
        parse_mode='HTML',
        reply_to_message_id=update.message.message_id
    )


def extract_bins_from_text(text: str) -> list:
    """Extract BINs from text (cards or BIN numbers)."""
    bins = []
    seen = set()
    
    lines = text.strip().split('\n')
    for line in lines:
        line = line.strip()
        if not line:
            continue
        
        # Extract card number (first part before |)
        if '|' in line:
            card_part = line.split('|')[0]
        else:
            card_part = line
        
        # Get only digits
        digits = ''.join(filter(str.isdigit, card_part))
        
        if len(digits) >= 6:
            bin_6 = digits[:6]
            if bin_6 not in seen:
                seen.add(bin_6)
                bins.append(bin_6)
    
    return bins[:20]  # Limit to 20 BINs


async def mgen_command(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    """Handle /mgen command - Generate cards from multiple BINs."""
    if len(context.args) < 2:
        usage = """❌ <b>Invalid Usage</b>

<b>Format:</b>
<code>/mgen [BINs] [AMOUNT]</code>

<b>Examples:</b>
<code>/mgen 460827,537637 10</code>
<code>/mgen 44039344|10|29,518507|09|27 10</code>

<i>Generates cards from multiple BINs at once.</i>"""
        await update.message.reply_text(usage, parse_mode='HTML')
        return
    
    bins_input = context.args[0]
    
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
    
    # Parse multiple BINs (separated by comma)
    bin_entries = bins_input.split(',')
    
    if len(bin_entries) > 10:
        await update.message.reply_text(
            "❌ <b>Too many BINs!</b>\n\n<i>Maximum 10 BINs allowed.</i>",
            parse_mode='HTML'
        )
        return
    
    # Get user info
    user = update.effective_user
    user_link = f'<a href="tg://user?id={user.id}">{user.first_name or "User"}</a>'
    
    all_cards = []
    bin_infos = []
    
    for entry in bin_entries:
        entry = entry.strip()
        if not entry:
            continue
        
        fixed_month = None
        fixed_year = None
        
        # Parse BIN|MM|YY format
        if '|' in entry:
            parts = entry.split('|')
            bin_number = parts[0]
            if len(parts) >= 3:
                fixed_month = parts[1].zfill(2)
                fixed_year = parts[2].zfill(2)
        else:
            bin_number = entry
        
        # Validate BIN
        if not bin_number.isdigit() or len(bin_number) < 6:
            continue
        
        # Fetch BIN info
        bin_info = await fetch_bin_info(bin_number[:6])
        
        if bin_info:
            # Generate cards for this BIN
            cards = generate_cards(bin_number, amount, fixed_month, fixed_year)
            all_cards.extend(cards)
            
            brand = bin_info.get('brand', 'N/A')
            bank = bin_info.get('bank', 'N/A')
            country_name = bin_info.get('country_name', 'N/A')
            country_flag = bin_info.get('country_flag', '🏳️')
            level = bin_info.get('level', 'N/A')
            card_type = bin_info.get('type', 'N/A')
            
            bin_infos.append({
                'bin': bin_number,
                'brand': brand,
                'bank': bank,
                'country': f"{country_name} {country_flag}",
                'info': f"{level} - {card_type} - {brand}",
                'count': amount
            })
    
    if not all_cards:
        await update.message.reply_text(
            "❌ <b>No valid BINs found!</b>\n\n<i>Could not generate cards.</i>",
            parse_mode='HTML'
        )
        return
    
    # Create file
    file_content = "\n".join(all_cards)
    file_bytes = BytesIO(file_content.encode('utf-8'))
    
    # Build response
    total_cards = len(all_cards)
    total_bins = len(bin_infos)
    
    bins_summary = "\n".join([f"• <code>{b['bin']}</code> - {b['info']}" for b in bin_infos])
    
    response = f"""𝗠𝘂𝗹𝘁𝗶 𝗚𝗲𝗻𝗲𝗿𝗮𝘁𝗲 ✅
━━━━━━━━━━━━━━━━━━
𝗧𝗼𝘁𝗮𝗹 𝗕𝗜𝗡𝘀: {total_bins}
𝗧𝗼𝘁𝗮𝗹 𝗖𝗮𝗿𝗱𝘀: {total_cards}
𝗔𝗺𝗼𝘂𝗻𝘁 𝗣𝗲𝗿 𝗕𝗜𝗡: {amount}
━━━━━━━━━━━━━━━━━━
{bins_summary}
━━━━━━━━━━━━━━━━━━
𝗚𝗲𝗻𝗲𝗿𝗮𝘁𝗲 𝗕𝘆: {user_link}"""
    
    await update.message.reply_document(
        document=InputFile(file_bytes, filename=f"MultiGen x {total_cards} Cards.txt"),
        caption=response,
        parse_mode='HTML',
        reply_to_message_id=update.message.message_id
    )


async def vcc_command(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    """Handle /vcc command - Filter valid CCs from text or file."""
    reply_message = update.message.reply_to_message
    
    if not reply_message:
        usage = """❌ <b>Invalid Usage</b>

<b>Reply to a message or .txt file with /vcc</b>

<b>Example:</b>
Reply to a message containing cards and send <code>/vcc</code>

<i>Filters and extracts valid CC data using Luhn validation.</i>"""
        await update.message.reply_text(usage, parse_mode='HTML')
        return
    
    text_content = ""
    
    # Check if reply contains a document
    if reply_message.document:
        file_name = reply_message.document.file_name or ""
        if file_name.endswith('.txt'):
            try:
                file = await reply_message.document.get_file()
                file_bytes = await file.download_as_bytearray()
                text_content = file_bytes.decode('utf-8')
            except Exception as e:
                logger.error(f"Error reading file: {e}")
                await update.message.reply_text(
                    "❌ <b>Error reading file!</b>",
                    parse_mode='HTML'
                )
                return
        else:
            await update.message.reply_text(
                "❌ <b>Please reply to a .txt file!</b>",
                parse_mode='HTML'
            )
            return
    elif reply_message.text:
        text_content = reply_message.text
    else:
        await update.message.reply_text(
            "❌ <b>No text or file found in the replied message!</b>",
            parse_mode='HTML'
        )
        return
    
    # Extract and validate cards
    valid_cards = []
    invalid_cards = []
    
    lines = text_content.strip().split('\n')
    for line in lines:
        line = line.strip()
        if not line:
            continue
        
        # Try to parse card format: card|mm|yy|cvv or similar
        parts = line.split('|')
        if len(parts) >= 1:
            card_number = ''.join(filter(str.isdigit, parts[0]))
            
            if len(card_number) >= 13 and len(card_number) <= 19:
                if validate_luhn(card_number):
                    valid_cards.append(line)
                else:
                    invalid_cards.append(line)
    
    total_checked = len(valid_cards) + len(invalid_cards)
    
    if total_checked == 0:
        await update.message.reply_text(
            "❌ <b>No card data found!</b>\n\n<i>Make sure the message contains valid card formats.</i>",
            parse_mode='HTML'
        )
        return
    
    # Build response
    if len(valid_cards) == 0:
        response = f"""❌ 𝗩𝗮𝗹𝗶𝗱 𝗖𝗖 𝗙𝗶𝗹𝘁𝗲𝗿
━━━━━━━━━━━━━━━━━━
𝗧𝗼𝘁𝗮𝗹 𝗖𝗵𝗲𝗰𝗸𝗲𝗱: {total_checked}
✅ 𝗩𝗮𝗹𝗶𝗱: 0
❌ 𝗜𝗻𝘃𝗮𝗹𝗶𝗱: {len(invalid_cards)}
━━━━━━━━━━━━━━━━━━
<i>No valid cards found!</i>"""
        await update.message.reply_text(
            response,
            parse_mode='HTML',
            reply_to_message_id=update.message.message_id
        )
    elif len(valid_cards) <= 15:
        # Show in message
        cards_text = "\n".join(valid_cards)
        response = f"""✅ 𝗩𝗮𝗹𝗶𝗱 𝗖𝗖 𝗙𝗶𝗹𝘁𝗲𝗿
━━━━━━━━━━━━━━━━━━
𝗧𝗼𝘁𝗮𝗹 𝗖𝗵𝗲𝗰𝗸𝗲𝗱: {total_checked}
✅ 𝗩𝗮𝗹𝗶𝗱: {len(valid_cards)}
❌ 𝗜𝗻𝘃𝗮𝗹𝗶𝗱: {len(invalid_cards)}
━━━━━━━━━━━━━━━━━━

<code>{cards_text}</code>"""
        await update.message.reply_text(
            response,
            parse_mode='HTML',
            reply_to_message_id=update.message.message_id
        )
    else:
        # Send as file
        file_content = "\n".join(valid_cards)
        file_bytes = BytesIO(file_content.encode('utf-8'))
        
        response = f"""✅ 𝗩𝗮𝗹𝗶𝗱 𝗖𝗖 𝗙𝗶𝗹𝘁𝗲𝗿
━━━━━━━━━━━━━━━━━━
𝗧𝗼𝘁𝗮𝗹 𝗖𝗵𝗲𝗰𝗸𝗲𝗱: {total_checked}
✅ 𝗩𝗮𝗹𝗶𝗱: {len(valid_cards)}
❌ 𝗜𝗻𝘃𝗮𝗹𝗶𝗱: {len(invalid_cards)}
━━━━━━━━━━━━━━━━━━"""
        
        await update.message.reply_document(
            document=InputFile(file_bytes, filename=f"Valid_Cards_{len(valid_cards)}.txt"),
            caption=response,
            parse_mode='HTML',
            reply_to_message_id=update.message.message_id
        )


async def adbin_command(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    """Handle /adbin command - Filter specific BIN cards from a combo."""
    reply_message = update.message.reply_to_message
    
    if not reply_message or len(context.args) < 1:
        usage = """❌ <b>Invalid Usage</b>

<b>Reply to a message or .txt file with /adbin [BIN]</b>

<b>Example:</b>
Reply to a combo and send <code>/adbin 460827</code>

<i>Filters cards matching the specified BIN.</i>"""
        await update.message.reply_text(usage, parse_mode='HTML')
        return
    
    target_bin = context.args[0]
    
    # Validate BIN
    if not target_bin.isdigit() or len(target_bin) < 6:
        await update.message.reply_text(
            "❌ <b>Invalid BIN!</b>\n\n<i>BIN must be at least 6 digits.</i>",
            parse_mode='HTML'
        )
        return
    
    text_content = ""
    
    # Check if reply contains a document
    if reply_message.document:
        file_name = reply_message.document.file_name or ""
        if file_name.endswith('.txt'):
            try:
                file = await reply_message.document.get_file()
                file_bytes = await file.download_as_bytearray()
                text_content = file_bytes.decode('utf-8')
            except Exception as e:
                logger.error(f"Error reading file: {e}")
                await update.message.reply_text(
                    "❌ <b>Error reading file!</b>",
                    parse_mode='HTML'
                )
                return
        else:
            await update.message.reply_text(
                "❌ <b>Please reply to a .txt file!</b>",
                parse_mode='HTML'
            )
            return
    elif reply_message.text:
        text_content = reply_message.text
    else:
        await update.message.reply_text(
            "❌ <b>No text or file found in the replied message!</b>",
            parse_mode='HTML'
        )
        return
    
    # Filter cards matching the BIN
    matched_cards = []
    total_cards = 0
    
    lines = text_content.strip().split('\n')
    for line in lines:
        line = line.strip()
        if not line:
            continue
        
        # Extract card number
        parts = line.split('|')
        if len(parts) >= 1:
            card_number = ''.join(filter(str.isdigit, parts[0]))
            
            if len(card_number) >= 13:
                total_cards += 1
                # Check if card starts with target BIN
                if card_number.startswith(target_bin):
                    matched_cards.append(line)
    
    if total_cards == 0:
        await update.message.reply_text(
            "❌ <b>No card data found!</b>\n\n<i>Make sure the message contains valid card formats.</i>",
            parse_mode='HTML'
        )
        return
    
    if len(matched_cards) == 0:
        response = f"""❌ 𝗕𝗜𝗡 𝗙𝗶𝗹𝘁𝗲𝗿
━━━━━━━━━━━━━━━━━━
𝗧𝗮𝗿𝗴𝗲𝘁 𝗕𝗜𝗡: <code>{target_bin}</code>
𝗧𝗼𝘁𝗮𝗹 𝗖𝗮𝗿𝗱𝘀: {total_cards}
✅ 𝗠𝗮𝘁𝗰𝗵𝗲𝗱: 0
━━━━━━━━━━━━━━━━━━
<i>No cards found with this BIN!</i>"""
        await update.message.reply_text(
            response,
            parse_mode='HTML',
            reply_to_message_id=update.message.message_id
        )
    elif len(matched_cards) <= 15:
        # Show in message
        cards_text = "\n".join(matched_cards)
        response = f"""✅ 𝗕𝗜𝗡 𝗙𝗶𝗹𝘁𝗲𝗿
━━━━━━━━━━━━━━━━━━
𝗧𝗮𝗿𝗴𝗲𝘁 𝗕𝗜𝗡: <code>{target_bin}</code>
𝗧𝗼𝘁𝗮𝗹 𝗖𝗮𝗿𝗱𝘀: {total_cards}
✅ 𝗠𝗮𝘁𝗰𝗵𝗲𝗱: {len(matched_cards)}
━━━━━━━━━━━━━━━━━━

<code>{cards_text}</code>"""
        await update.message.reply_text(
            response,
            parse_mode='HTML',
            reply_to_message_id=update.message.message_id
        )
    else:
        # Send as file
        file_content = "\n".join(matched_cards)
        file_bytes = BytesIO(file_content.encode('utf-8'))
        
        response = f"""✅ 𝗕𝗜𝗡 𝗙𝗶𝗹𝘁𝗲𝗿
━━━━━━━━━━━━━━━━━━
𝗧𝗮𝗿𝗴𝗲𝘁 𝗕𝗜𝗡: <code>{target_bin}</code>
𝗧𝗼𝘁𝗮𝗹 𝗖𝗮𝗿𝗱𝘀: {total_cards}
✅ 𝗠𝗮𝘁𝗰𝗵𝗲𝗱: {len(matched_cards)}
━━━━━━━━━━━━━━━━━━"""
        
        await update.message.reply_document(
            document=InputFile(file_bytes, filename=f"BIN_{target_bin}_{len(matched_cards)}_Cards.txt"),
            caption=response,
            parse_mode='HTML',
            reply_to_message_id=update.message.message_id
        )


async def mbin_command(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    """Handle /mbin command - Multi BIN lookup."""
    reply_message = update.message.reply_to_message
    
    if not reply_message:
        usage = """❌ <b>Invalid Usage</b>

<b>Reply to a message or .txt file with /mbin</b>

<b>Example:</b>
Reply to a message containing cards or BINs and send <code>/mbin</code>

<i>Checks up to 20 unique BINs at once.</i>"""
        await update.message.reply_text(usage, parse_mode='HTML')
        return
    
    text_content = ""
    
    # Check if reply contains a document
    if reply_message.document:
        file_name = reply_message.document.file_name or ""
        if file_name.endswith('.txt'):
            try:
                file = await reply_message.document.get_file()
                file_bytes = await file.download_as_bytearray()
                text_content = file_bytes.decode('utf-8')
            except Exception as e:
                logger.error(f"Error reading file: {e}")
                await update.message.reply_text(
                    "❌ <b>Error reading file!</b>",
                    parse_mode='HTML'
                )
                return
        else:
            await update.message.reply_text(
                "❌ <b>Please reply to a .txt file!</b>",
                parse_mode='HTML'
            )
            return
    elif reply_message.text:
        text_content = reply_message.text
    else:
        await update.message.reply_text(
            "❌ <b>No text or file found in the replied message!</b>",
            parse_mode='HTML'
        )
        return
    
    # Extract BINs
    bins = extract_bins_from_text(text_content)
    
    if not bins:
        await update.message.reply_text(
            "❌ <b>No valid BINs found!</b>\n\n<i>Make sure the message contains valid card numbers or BINs.</i>",
            parse_mode='HTML'
        )
        return
    
    # Send processing message
    processing_msg = await update.message.reply_text(
        f"🔍 <b>Checking {len(bins)} BIN(s)...</b>",
        parse_mode='HTML'
    )
    
    # Lookup each BIN
    results = []
    for bin_number in bins:
        bin_info = await fetch_bin_info(bin_number)
        
        if bin_info:
            brand = bin_info.get('brand', 'N/A')
            bank = bin_info.get('bank', 'N/A')
            country_name = bin_info.get('country_name', 'N/A')
            country_flag = bin_info.get('country_flag', '🏳️')
            level = bin_info.get('level', 'N/A')
            card_type = bin_info.get('type', 'N/A')
            
            result = f"""• 𝗕𝗜𝗡: <code>{bin_number}</code>
  𝗜𝗡𝗙𝗢: {level} - {card_type} - {brand}
  𝗕𝗔𝗡𝗞: {bank}
  𝗖𝗢𝗨𝗡𝗧𝗥𝗬: {country_name} {country_flag}"""
            results.append(result)
        else:
            results.append(f"• 𝗕𝗜𝗡: <code>{bin_number}</code>\n  ❌ Not Found")
    
    # Build response
    response = f"""🔍 𝗠𝘂𝗹𝘁𝗶 𝗕𝗜𝗡 𝗟𝗼𝗼𝗸𝘂𝗽 📋
━━━━━━━━━━━━━━━━━━
𝗧𝗼𝘁𝗮𝗹: {len(bins)} BIN(s)
━━━━━━━━━━━━━━━━━━

""" + "\n\n".join(results)
    
    # Delete processing message and send results
    await processing_msg.delete()
    await update.message.reply_text(
        response,
        parse_mode='HTML',
        reply_to_message_id=update.message.message_id
    )


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
    application.add_handler(CommandHandler("mgen", mgen_command))
    application.add_handler(CommandHandler("bin", bin_command))
    application.add_handler(CommandHandler("mbin", mbin_command))
    application.add_handler(CommandHandler("vcc", vcc_command))
    application.add_handler(CommandHandler("adbin", adbin_command))
    application.add_handler(CallbackQueryHandler(regen_callback, pattern=r"^regen:"))
    application.add_error_handler(error_handler)
    
    logger.info("Bot is starting...")
    application.run_polling(allowed_updates=Update.ALL_TYPES)


if __name__ == "__main__":
    main()
