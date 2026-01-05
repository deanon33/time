# 🎴 Telegram BIN Lookup & Card Generator Bot

A Telegram bot built with `python-telegram-bot` that looks up BIN (Bank Identification Number) information and generates test cards.

## Features

- 🔍 **BIN Lookup** - Fetches bank, country, card type, and brand information
- 🎴 **Card Generation** - Generates valid test card numbers with Luhn checksum
- 📁 **File Export** - Exports generated cards as a downloadable text file
- 🏳️ **Country Flags** - Displays country flags with BIN information

## Screenshot

The bot responds with:
- A downloadable text file containing generated cards
- BIN information including bank, country, and card type
- Username of the person who generated the cards

## Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd <repository-folder>
   ```

2. **Install dependencies**
   ```bash
   pip install -r requirements.txt
   ```

3. **Set up your bot token**
   
   Get a bot token from [@BotFather](https://t.me/BotFather) on Telegram.
   
   Open `bot.py` and replace `YOUR_BOT_TOKEN_HERE` with your token:
   ```python
   BOT_TOKEN = "your_bot_token_here"
   ```

4. **Run the bot**
   ```bash
   python bot.py
   ```

## Usage

### Commands

| Command | Description |
|---------|-------------|
| `/start` | Show welcome message and available commands |
| `/help` | Show help information |
| `/gen <BIN> <amount>` | Generate cards with BIN lookup |

### Examples

```
/gen 531462 100
```
This generates 100 cards with BIN 531462 and displays the BIN information.

```
/gen 419011000705 500
```
This generates 500 cards with the specified BIN.

## API

The bot uses the BIN lookup API:
```
https://bin.hex-unit.com/{BIN}
```

### Example Response

```json
{
  "bin": "531462",
  "brand": "MASTERCARD",
  "country": "US",
  "country_name": "UNITED STATES",
  "country_flag": "🇺🇸",
  "country_currencies": ["USD"],
  "bank": "PATHWARD, NATIONAL ASSOCIATION",
  "level": "CIRRUS",
  "type": "DEBIT",
  "bin_api": "Voidex"
}
```

## Output Format

### Generated Cards File
Each line in the generated file contains:
```
CARD_NUMBER|MM|YY|CVV
```

### Bot Response
```
⬇️ 531462 x Cards.txt
13.1 KB

BIN: 531462
Amount: 500
Bank: PATHWARD, NATIONAL ASSOCIATION
Country: UNITED STATES 🇺🇸
BIN Info: CIRRUS - DEBIT - MASTERCARD

🎴 Generate By: Username
```

## Requirements

- Python 3.10+
- python-telegram-bot 21.7+
- httpx 0.28+

## License

MIT License
