# Deno Music Bot

A simple Discord bot developed specifically for Deno that uses moonlink.js for music playback.

## Setup

1. Make sure you have Deno installed (version 1.36.0 or higher):
   ```
   curl -fsSL https://deno.land/x/install/install.sh | sh
   ```

2. Create a `.env` file in the project root with the following variable:
   ```
   TOKEN=your_discord_bot_token
   ```

3. Have a Lavalink server running on port 2333 with password "youshallnotpass"

## Features

The bot has only one basic command:

- `?play <song name or URL>` - Plays a song or adds it to the queue

## How to Start

To start the bot, run the following command:

```
deno task start
```

Or run directly:

```
deno run --allow-net --allow-read --allow-env testBot/denoBot/bot.js
```

## Troubleshooting

- If you encounter permission errors, make sure you're providing the necessary flags to Deno:
  - `--allow-net` for network connections (Discord API and Lavalink)
  - `--allow-read` for file reading
  - `--allow-env` for environment variables (TOKEN)

## Requirements

- Deno v2.22 or higher
- Lavalink v4 server running on port 2333 