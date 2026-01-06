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
    welcome = f"""👋 𝗛𝗶 {user.first_name}! 𝗪𝗲𝗹𝗰𝗼𝗺𝗲 𝘁𝗼 𝘁𝗵𝗶𝘀 𝗯𝗼𝘁
━━━━━━━━━━━━━━━━━━━━━━

💳 <b>XCardsΞBot &lt;/&gt;</b> is your all-in-one Telegram toolkit for BIN checking, CC filtering and card generation.

✨ Fast, reliable and easy to use!

━━━━━━━━━━━━━━━━━━━━━━"""
    
    keyboard = InlineKeyboardMarkup([
        [InlineKeyboardButton("⚙️ Main Menu", callback_data="mainmenu")]
    ])
    
    await update.message.reply_text(
        welcome,
        parse_mode='HTML',
        reply_markup=keyboard
    )


async def mainmenu_callback(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    """Handle Main Menu button callback."""
    query = update.callback_query
    await query.answer()
    
    menu_text = """𝗛𝗲𝗿𝗲 𝗮𝗿𝗲 𝘁𝗵𝗲 𝗫𝗖𝗮𝗿𝗱𝘀-𝗕𝗼𝘁 𝗢𝗽𝘁𝗶𝗼𝗻𝘀: 👇"""
    
    keyboard = InlineKeyboardMarkup([
        [
            InlineKeyboardButton("🏦 BIN Check", callback_data="menu:bin"),
            InlineKeyboardButton("🧾 Card Generate", callback_data="menu:gen")
        ],
        [
            InlineKeyboardButton("💳 CC Filter", callback_data="menu:filter"),
            InlineKeyboardButton("🏠 Random Address", callback_data="menu:fake")
        ],
        [
            InlineKeyboardButton("📖 All Commands", callback_data="menu:help"),
            InlineKeyboardButton("❌ Close", callback_data="menu:close")
        ]
    ])
    
    await query.edit_message_text(
        menu_text,
        parse_mode='HTML',
        reply_markup=keyboard
    )


async def menu_callback(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    """Handle menu option callbacks."""
    query = update.callback_query
    await query.answer()
    
    action = query.data.split(':')[1]
    
    back_button = InlineKeyboardMarkup([
        [InlineKeyboardButton("⬅️ Back", callback_data="mainmenu")]
    ])
    
    if action == "bin":
        text = """🏦 𝗕𝗜𝗡 𝗖𝗵𝗲𝗰𝗸 𝗧𝗼𝗼𝗹𝘀
━━━━━━━━━━━━━━━━━━━━━━
<b>USAGE:</b>
Check and analyze BIN information using the following commands:

➢ <code>/bin [BIN]</code> - Check and validate BIN details.
   • Example: <code>/bin 460827</code>
   • Returns issuer, country, and card type details

➢ <code>/mbin</code> - Check up to 20 BINs at once.
   • Reply to a message or .txt file and use /mbin
   • Extracts and checks unique BINs automatically

━━━━━━━━━━━━━━━━━━━━━━"""
        await query.edit_message_text(text, parse_mode='HTML', reply_markup=back_button)
    
    elif action == "gen":
        text = """🧾 𝗖𝗮𝗿𝗱 𝗚𝗲𝗻𝗲𝗿𝗮𝘁𝗶𝗼𝗻 𝗧𝗼𝗼𝗹𝘀
━━━━━━━━━━━━━━━━━━━━━━
<b>USAGE:</b>
Generate CC details using the following commands:

➢ <code>/gen [BIN] [Amount]</code> - Generate credit card details.
   • Example: <code>/gen 460827</code> (Generates 10 by default)
   • Example: <code>/gen 460827 100</code> (Generates 100 CCs)
   • Example: <code>/gen 460827|10|29 50</code> (With fixed expiry)

➢ <code>/mgen [BINs] [Amount]</code> - Generate from multiple BINs.
   • Example: <code>/mgen 460827,537637 10</code>
   • Example: <code>/mgen 460827|10|29,537637|09|27 10</code>
   • Generates 10 cards from each BIN
   • Supports fixed expiry dates per BIN

<b>NOTE:</b>
✅ All cards are Luhn-valid
✅ Supports custom expiry dates (MM|YY format)

━━━━━━━━━━━━━━━━━━━━━━"""
        await query.edit_message_text(text, parse_mode='HTML', reply_markup=back_button)
    
    elif action == "filter":
        text = """💳 𝗖𝗖 𝗙𝗶𝗹𝘁𝗲𝗿𝗶𝗻𝗴 𝗧𝗼𝗼𝗹𝘀
━━━━━━━━━━━━━━━━━━━━━━
<b>USAGE:</b>
Perform credit card filtering and BIN-based extraction:

➢ <code>/vcc</code> - Filter valid CCs from text or file.
   • Reply to a message or .txt file with /vcc
   • Extracts only Luhn-valid card numbers

➢ <code>/adbin [BIN]</code> - Filter specific BIN cards.
   • Example: <code>/adbin 460827</code>
   • Keeps only cards matching the BIN

➢ <code>/rmbin [BIN]</code> - Remove specific BIN cards.
   • Example: <code>/rmbin 460827</code>
   • Removes cards matching the BIN

➢ <code>/topbin</code> - Find top 20 most used BINs.
   • Reply to a .txt file with /topbin
   • Shows BIN frequency analysis

━━━━━━━━━━━━━━━━━━━━━━"""
        await query.edit_message_text(text, parse_mode='HTML', reply_markup=back_button)
    
    elif action == "fake":
        text = """🏠 𝗥𝗮𝗻𝗱𝗼𝗺 𝗔𝗱𝗱𝗿𝗲𝘀𝘀 𝗚𝗲𝗻𝗲𝗿𝗮𝘁𝗼𝗿
━━━━━━━━━━━━━━━━━━━━━━
<b>USAGE:</b>
Generate random fake addresses for specific countries:

➢ <code>/fake [Country Code or Name]</code>
   • Example: <code>/fake US</code> or <code>/fake United States</code>
   • Example: <code>/fake DE</code> or <code>/fake Germany</code>

<b>SUPPORTED COUNTRIES:</b>
🇺🇸 US | 🇬🇧 GB | 🇨🇦 CA | 🇦🇺 AU | 🇩🇪 DE
🇫🇷 FR | 🇪🇸 ES | 🇮🇳 IN | 🇧🇷 BR | 🇲🇽 MX
🇳🇱 NL | 🇮🇪 IE | 🇳🇴 NO | 🇫🇮 FI | 🇩🇰 DK
🇨🇭 CH | 🇳🇿 NZ | 🇹🇷 TR | 🇺🇦 UA | 🇷🇸 RS

<b>NOTE:</b>
1️⃣ Use country code (US) or full name (United States)
2️⃣ Includes name, address, phone, email, DOB

━━━━━━━━━━━━━━━━━━━━━━"""
        await query.edit_message_text(text, parse_mode='HTML', reply_markup=back_button)
    
    elif action == "help":
        text = """📖 𝗔𝗹𝗹 𝗖𝗼𝗺𝗺𝗮𝗻𝗱𝘀
━━━━━━━━━━━━━━━━━━━━━━

<b>🧾 GENERATION:</b>
• /gen - Generate credit cards
• /mgen - Multi BIN generate

<b>🏦 BIN CHECK:</b>
• /bin - Single BIN lookup
• /mbin - Multi BIN lookup

<b>💳 CC FILTER:</b>
• /vcc - Filter valid CCs
• /adbin - Filter by BIN
• /rmbin - Remove by BIN
• /topbin - Top 20 BINs

<b>🏠 OTHER:</b>
• /fake - Random address
• /start - Welcome message
• /help - This help menu

━━━━━━━━━━━━━━━━━━━━━━"""
        await query.edit_message_text(text, parse_mode='HTML', reply_markup=back_button)
    
    elif action == "close":
        await query.delete_message()


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
🎯 <b>BIN FILTER / REMOVE</b>
━━━━━━━━━━━━━━━━━━━━━━━━━━

Reply to a message or .txt file:
<code>/adbin [BIN]</code> - Keep only this BIN
<code>/rmbin [BIN]</code> - Remove this BIN

<b>Examples:</b>
<code>/adbin 460827</code>
<code>/rmbin 460827</code>

━━━━━━━━━━━━━━━━━━━━━━━━━━
📊 <b>TOP BINS ANALYSIS</b>
━━━━━━━━━━━━━━━━━━━━━━━━━━

Reply to a .txt file:
<code>/topbin</code>

<i>Shows top 20 most used BINs.</i>

━━━━━━━━━━━━━━━━━━━━━━━━━━
🏠 <b>FAKE ADDRESS</b>
━━━━━━━━━━━━━━━━━━━━━━━━━━

<code>/fake [Country]</code>

<b>Examples:</b>
<code>/fake US</code>
<code>/fake Germany</code>

<i>Generates random fake address.</i>

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
    elif len(valid_cards) <= 10:
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
    elif len(matched_cards) <= 10:
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


async def rmbin_command(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    """Handle /rmbin command - Remove specific BIN cards from a combo."""
    reply_message = update.message.reply_to_message
    
    if not reply_message or len(context.args) < 1:
        usage = """❌ <b>Invalid Usage</b>

<b>Reply to a message or .txt file with /rmbin [BIN]</b>

<b>Example:</b>
Reply to a combo and send <code>/rmbin 460827</code>

<i>Removes cards matching the specified BIN.</i>"""
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
    
    # Filter cards NOT matching the BIN
    remaining_cards = []
    removed_count = 0
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
                    removed_count += 1
                else:
                    remaining_cards.append(line)
    
    if total_cards == 0:
        await update.message.reply_text(
            "❌ <b>No card data found!</b>\n\n<i>Make sure the message contains valid card formats.</i>",
            parse_mode='HTML'
        )
        return
    
    if len(remaining_cards) == 0:
        response = f"""❌ 𝗥𝗲𝗺𝗼𝘃𝗲 𝗕𝗜𝗡
━━━━━━━━━━━━━━━━━━
𝗧𝗮𝗿𝗴𝗲𝘁 𝗕𝗜𝗡: <code>{target_bin}</code>
𝗧𝗼𝘁𝗮𝗹 𝗖𝗮𝗿𝗱𝘀: {total_cards}
🗑 𝗥𝗲𝗺𝗼𝘃𝗲𝗱: {removed_count}
✅ 𝗥𝗲𝗺𝗮𝗶𝗻𝗶𝗻𝗴: 0
━━━━━━━━━━━━━━━━━━
<i>All cards were removed!</i>"""
        await update.message.reply_text(
            response,
            parse_mode='HTML',
            reply_to_message_id=update.message.message_id
        )
    else:
        # Send as file
        file_content = "\n".join(remaining_cards)
        file_bytes = BytesIO(file_content.encode('utf-8'))
        
        response = f"""✅ 𝗥𝗲𝗺𝗼𝘃𝗲 𝗕𝗜𝗡
━━━━━━━━━━━━━━━━━━
𝗧𝗮𝗿𝗴𝗲𝘁 𝗕𝗜𝗡: <code>{target_bin}</code>
𝗧𝗼𝘁𝗮𝗹 𝗖𝗮𝗿𝗱𝘀: {total_cards}
🗑 𝗥𝗲𝗺𝗼𝘃𝗲𝗱: {removed_count}
✅ 𝗥𝗲𝗺𝗮𝗶𝗻𝗶𝗻𝗴: {len(remaining_cards)}
━━━━━━━━━━━━━━━━━━"""
        
        await update.message.reply_document(
            document=InputFile(file_bytes, filename=f"Removed_{target_bin}_{len(remaining_cards)}_Cards.txt"),
            caption=response,
            parse_mode='HTML',
            reply_to_message_id=update.message.message_id
        )


# Country codes mapping for /fake command
COUNTRY_CODES = {
    'au': 'AU', 'australia': 'AU',
    'br': 'BR', 'brazil': 'BR',
    'ca': 'CA', 'canada': 'CA',
    'ch': 'CH', 'switzerland': 'CH',
    'de': 'DE', 'germany': 'DE',
    'dk': 'DK', 'denmark': 'DK',
    'es': 'ES', 'spain': 'ES',
    'fi': 'FI', 'finland': 'FI',
    'fr': 'FR', 'france': 'FR',
    'gb': 'GB', 'uk': 'GB', 'united kingdom': 'GB', 'england': 'GB',
    'ie': 'IE', 'ireland': 'IE',
    'in': 'IN', 'india': 'IN',
    'ir': 'IR', 'iran': 'IR',
    'mx': 'MX', 'mexico': 'MX',
    'nl': 'NL', 'netherlands': 'NL',
    'no': 'NO', 'norway': 'NO',
    'nz': 'NZ', 'new zealand': 'NZ',
    'rs': 'RS', 'serbia': 'RS',
    'tr': 'TR', 'turkey': 'TR',
    'ua': 'UA', 'ukraine': 'UA',
    'us': 'US', 'usa': 'US', 'united states': 'US', 'america': 'US',
}


async def fake_command(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    """Handle /fake command - Generate random fake address."""
    if len(context.args) < 1:
        usage = """🏠 𝗥𝗮𝗻𝗱𝗼𝗺 𝗔𝗱𝗱𝗿𝗲𝘀𝘀 𝗚𝗲𝗻𝗲𝗿𝗮𝘁𝗼𝗿
━━━━━━━━━━━━━━━━━━

<b>Usage:</b>
<code>/fake [Country Code or Name]</code>

<b>Examples:</b>
<code>/fake US</code>
<code>/fake United States</code>
<code>/fake Germany</code>

<b>Supported Countries:</b>
🇺🇸 US | 🇬🇧 GB | 🇨🇦 CA | 🇦🇺 AU
🇩🇪 DE | 🇫🇷 FR | 🇪🇸 ES | 🇮🇳 IN
🇧🇷 BR | 🇲🇽 MX | 🇳🇱 NL | 🇮🇪 IE
🇳🇴 NO | 🇫🇮 FI | 🇩🇰 DK | 🇨🇭 CH
🇳🇿 NZ | 🇹🇷 TR | 🇺🇦 UA | 🇷🇸 RS"""
        await update.message.reply_text(usage, parse_mode='HTML')
        return
    
    # Get country input
    country_input = ' '.join(context.args).lower().strip()
    
    # Find country code
    country_code = COUNTRY_CODES.get(country_input)
    
    if not country_code:
        await update.message.reply_text(
            "❌ <b>Country not supported!</b>\n\n<i>Use /fake to see supported countries.</i>",
            parse_mode='HTML'
        )
        return
    
    # Fetch random user data
    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            response = await client.get(f"https://randomuser.me/api?nat={country_code}")
            if response.status_code != 200:
                await update.message.reply_text(
                    "❌ <b>Failed to generate address!</b>\n\n<i>Please try again later.</i>",
                    parse_mode='HTML'
                )
                return
            data = response.json()
    except Exception as e:
        logger.error(f"Error fetching fake data: {e}")
        await update.message.reply_text(
            "❌ <b>Failed to generate address!</b>\n\n<i>Please try again later.</i>",
            parse_mode='HTML'
        )
        return
    
    # Extract data
    result = data['results'][0]
    
    # Name
    title = result['name'].get('title', '')
    first_name = result['name'].get('first', '')
    last_name = result['name'].get('last', '')
    full_name = f"{title} {first_name} {last_name}".strip()
    
    # Gender
    gender = result.get('gender', 'Unknown').capitalize()
    
    # Location
    location = result['location']
    street_number = location['street'].get('number', '')
    street_name = location['street'].get('name', '')
    street = f"{street_number} {street_name}".strip()
    city = location.get('city', 'N/A')
    state = location.get('state', 'N/A')
    postcode = location.get('postcode', 'N/A')
    country = location.get('country', 'N/A')
    
    # Contact
    phone = result.get('phone', 'N/A')
    email = result.get('email', 'N/A')
    
    # DOB
    dob = result['dob'].get('date', '')[:10] if result.get('dob') else 'N/A'
    
    # Build response
    response = f"""🏠 𝗔𝗱𝗱𝗿𝗲𝘀𝘀 𝗳𝗼𝗿 {country}
━━━━━━━━━━━━━━━━━━
👤 𝗡𝗮𝗺𝗲: {full_name}
⚧ 𝗚𝗲𝗻𝗱𝗲𝗿: {gender}
🏠 𝗦𝘁𝗿𝗲𝗲𝘁: {street}
🏙 𝗖𝗶𝘁𝘆: {city}
🗺 𝗦𝘁𝗮𝘁𝗲: {state}
📮 𝗣𝗼𝘀𝘁𝗮𝗹 𝗖𝗼𝗱𝗲: {postcode}
📞 𝗣𝗵𝗼𝗻𝗲: {phone}
📧 𝗘𝗺𝗮𝗶𝗹: {email}
🎂 𝗗𝗢𝗕: {dob}
🌍 𝗖𝗼𝘂𝗻𝘁𝗿𝘆: {country}"""
    
    # Re-generate button
    callback_data = f"fake:{country_code}"
    keyboard = InlineKeyboardMarkup([
        [InlineKeyboardButton("🔄 Generate New", callback_data=callback_data)]
    ])
    
    await update.message.reply_text(
        response,
        parse_mode='HTML',
        reply_markup=keyboard,
        reply_to_message_id=update.message.message_id
    )


async def fake_callback(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    """Handle fake address regenerate callback."""
    query = update.callback_query
    await query.answer()
    
    # Parse callback data
    data = query.data.split(':')
    if len(data) < 2:
        return
    
    country_code = data[1]
    
    # Fetch random user data
    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            response = await client.get(f"https://randomuser.me/api?nat={country_code}")
            if response.status_code != 200:
                await query.answer("Failed to generate!", show_alert=True)
                return
            data = response.json()
    except Exception as e:
        logger.error(f"Error fetching fake data: {e}")
        await query.answer("Failed to generate!", show_alert=True)
        return
    
    # Extract data
    result = data['results'][0]
    
    # Name
    title = result['name'].get('title', '')
    first_name = result['name'].get('first', '')
    last_name = result['name'].get('last', '')
    full_name = f"{title} {first_name} {last_name}".strip()
    
    # Gender
    gender = result.get('gender', 'Unknown').capitalize()
    
    # Location
    location = result['location']
    street_number = location['street'].get('number', '')
    street_name = location['street'].get('name', '')
    street = f"{street_number} {street_name}".strip()
    city = location.get('city', 'N/A')
    state = location.get('state', 'N/A')
    postcode = location.get('postcode', 'N/A')
    country = location.get('country', 'N/A')
    
    # Contact
    phone = result.get('phone', 'N/A')
    email = result.get('email', 'N/A')
    
    # DOB
    dob = result['dob'].get('date', '')[:10] if result.get('dob') else 'N/A'
    
    # Build response
    response_text = f"""🏠 𝗔𝗱𝗱𝗿𝗲𝘀𝘀 𝗳𝗼𝗿 {country}
━━━━━━━━━━━━━━━━━━
👤 𝗡𝗮𝗺𝗲: {full_name}
⚧ 𝗚𝗲𝗻𝗱𝗲𝗿: {gender}
🏠 𝗦𝘁𝗿𝗲𝗲𝘁: {street}
🏙 𝗖𝗶𝘁𝘆: {city}
🗺 𝗦𝘁𝗮𝘁𝗲: {state}
📮 𝗣𝗼𝘀𝘁𝗮𝗹 𝗖𝗼𝗱𝗲: {postcode}
📞 𝗣𝗵𝗼𝗻𝗲: {phone}
📧 𝗘𝗺𝗮𝗶𝗹: {email}
🎂 𝗗𝗢𝗕: {dob}
🌍 𝗖𝗼𝘂𝗻𝘁𝗿𝘆: {country}"""
    
    # Keep the button
    callback_data = f"fake:{country_code}"
    keyboard = InlineKeyboardMarkup([
        [InlineKeyboardButton("🔄 Generate New", callback_data=callback_data)]
    ])
    
    await query.edit_message_text(
        response_text,
        parse_mode='HTML',
        reply_markup=keyboard
    )


async def topbin_command(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    """Handle /topbin command - Find top 20 most used BINs from a combo."""
    reply_message = update.message.reply_to_message
    
    if not reply_message:
        usage = """❌ <b>Invalid Usage</b>

<b>Reply to a .txt file with /topbin</b>

<b>Example:</b>
Reply to a combo file and send <code>/topbin</code>

<i>Finds the top 20 most used BINs.</i>"""
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
    
    # Count BINs
    bin_counts = {}
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
            
            if len(card_number) >= 6:
                total_cards += 1
                bin_6 = card_number[:6]
                bin_counts[bin_6] = bin_counts.get(bin_6, 0) + 1
    
    if total_cards == 0:
        await update.message.reply_text(
            "❌ <b>No card data found!</b>\n\n<i>Make sure the file contains valid card formats.</i>",
            parse_mode='HTML'
        )
        return
    
    # Sort by count and get top 20
    sorted_bins = sorted(bin_counts.items(), key=lambda x: x[1], reverse=True)[:20]
    
    # Build response
    bin_lines = []
    medals = ["🥇", "🥈", "🥉"]
    
    for i, (bin_num, count) in enumerate(sorted_bins, 1):
        if i <= 3:
            prefix = medals[i-1]
        else:
            prefix = f"{i:02d}."
        bin_lines.append(f"{prefix} <code>{bin_num}</code> → <b>{count}</b>")
    
    bins_text = "\n".join(bin_lines)
    unique_bins = len(bin_counts)
    
    response = f"""📊 𝗧𝗼𝗽 𝗕𝗜𝗡 𝗔𝗻𝗮𝗹𝘆𝘀𝗶𝘀
━━━━━━━━━━━━━━━━━━
📁 𝗖𝗮𝗿𝗱𝘀: {total_cards} | 🔢 𝗕𝗜𝗡𝘀: {unique_bins}
━━━━━━━━━━━━━━━━━━

{bins_text}"""
    
    await update.message.reply_text(
        response,
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
    application.add_handler(CommandHandler("rmbin", rmbin_command))
    application.add_handler(CommandHandler("topbin", topbin_command))
    application.add_handler(CommandHandler("fake", fake_command))
    application.add_handler(CallbackQueryHandler(regen_callback, pattern=r"^regen:"))
    application.add_handler(CallbackQueryHandler(fake_callback, pattern=r"^fake:"))
    application.add_handler(CallbackQueryHandler(mainmenu_callback, pattern=r"^mainmenu$"))
    application.add_handler(CallbackQueryHandler(menu_callback, pattern=r"^menu:"))
    application.add_error_handler(error_handler)
    
    logger.info("Bot is starting...")
    application.run_polling(allowed_updates=Update.ALL_TYPES)


if __name__ == "__main__":
    main()
