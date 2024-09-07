<img src="/assets/moonlink_banner.png" alt="Moonlink.js - v4">
<div align = "center">
<hr>
<img src="https://img.shields.io/badge/Made_with_♥️_in-Brazil-ED186A?style=for-the-badge"><br>
<a href="https://discord.gg/q8HzGuHuDY">
<img src="https://img.shields.io/discord/990369410344701964?color=333&label=Support&logo=discord&style=for-the-badge" alt="Discord">
</a>
</a> 
</a href="https://www.npmjs.com/package/moonlink.js">
<img alt="NPM Downloads" src="https://img.shields.io/npm/d18m/moonlink.js?style=for-the-badge&logo=npm&color=333">
<a>
<a>
<img alt="NPM Version" src="https://img.shields.io/npm/v/moonlink.js?style=for-the-badge&logo=npm&color=333">
</a>
<br>
<a><img alt="GitHub forks" src="https://img.shields.io/github/forks/Ecliptia/moonlink.js?style=for-the-badge&logo=github&color=333">
</a>
<a>
<img alt="GitHub Repo stars" src="https://img.shields.io/github/stars/Ecliptia/moonlink.js?style=for-the-badge&logo=github&color=333">
</a>
<a>
<img alt="GitHub Sponsors" src="https://img.shields.io/github/sponsors/1lucas1apk?style=for-the-badge&logo=github&color=333">
</a>
  <br>
  Moonlink.js (Reimagined Version) - Envision a sonic adventure where imagination knows no bounds, wrapped in the magical spirit of the festivities. 🌌 Moonlink.js unlocks your musical talent, offering an intuitive and straightforward experience.
</div>
<hr>

## Table of Contents

-   [Documentation](#documentation)
-   [License](#license)
-   [Installation](#installation)
-   [Support](#support)
-   [How to Use](#how-to-use)
-   [Final Thanks](#final-thanks)
  
## Documentation

The Moonlink.js documentation helps you add and manage music in your projects. It covers installation, setup, and features like queue management and audio filters. The guide includes tutorials and easy-to-follow examples.

For more details, visit the [official Moonlink.js documentation](https://moonlink.js.org).

## License

This project is licensed under the [Open Software License ("OSL") v. 3.0](LICENSE) - see the [LICENSE](LICENSE) file for details.

## Installation

```bash
npm install moonlink.js
yarn add moonlink.js
pnpm install moonlink.js
bun install moonlink.js
```

## How to Use

```javascript
const { Client, GatewayIntentBits, REST, Routes } = require("discord.js");
const { Manager } = require("moonlink.js");
require("dotenv").config(); // Load environment variables, such as your bot token

// Creating the client with the necessary intents
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.GuildVoiceStates
    ]
});

// Setting up the Moonlink.js manager with your Lavalink nodes
client.moonlink = new Manager({
    nodes: [{
        identifier: "node_1",
        host: "localhost",
        password: "youshallnotpass",
        port: 2333,
        secure: false,
    }],
    options: {},
    sendPayload: (guildId, payload) => {
        const guild = client.guilds.cache.get(guildId);
        if (guild) guild.shard.send(payload); // Sending data to the shard if the guild is available
    }
});

// Event: When a node is successfully created and connected
client.moonlink.on("nodeCreate", node => {
    console.log(`${node.host} was connected`);
});

// Event: When a track starts playing
client.moonlink.on("trackStart", async (player, track) => {
    client.channels.cache
        .get(player.textChannelId)
        .send(`Now playing: ${track.title}`);
});

// Event: When a track finishes playing
client.moonlink.on("trackEnd", async (player, track) => {
    client.channels.cache
        .get(player.textChannelId)
        .send(`Track ended: ${track.title}`);
});

// Event: When the bot is ready to start working
client.on("ready", () => {
    client.moonlink.init(client.user.id); // Initializing Moonlink.js with the bot's ID
    console.log(`${client.user.tag} is ready!`);
});

// Event: Handling raw WebSocket events
client.on("raw", data => {
    client.moonlink.packetUpdate(data); // Passing raw data to Moonlink.js for handling
});

// Event: Handling interactions (slash commands)
client.on("interactionCreate", async interaction => {
    if (!interaction.isChatInputCommand()) return;

    if (interaction.commandName === "play") {
        if (!interaction.member.voice.channel) {
            return interaction.reply({
                content: `Error: You must be in a voice channel to execute this command.`,
                ephemeral: true
            });
        }

        const query = interaction.options.getString("query");
        const player = client.moonlink.createPlayer({
            guildId: interaction.guild.id,
            voiceChannelId: interaction.member.voice.channel.id,
            textChannelId: interaction.channel.id,
            autoPlay: true
        });

        if (!player.connected) {
            player.connect({
                setDeaf: true, // Deafens the bot upon joining
                setMute: false // Ensures the bot isn't muted
            });
        }

        const res = await client.moonlink.search({
            query,
            source: "youtube",
            requester: interaction.user.id
        });

        if (res.loadType === "loadfailed") {
            return interaction.reply({
                content: `Error: Failed to load the requested track.`,
                ephemeral: true
            });
        } else if (res.loadType === "empty") {
            return interaction.reply({
                content: `Error: No results found for the query.`,
                ephemeral: true
            });
        }

        if (res.loadType === "playlist") {
            interaction.reply({
                content: `Playlist ${res.playlistInfo.name} has been added to the queue.`
            });

            for (const track of res.tracks) {
                player.queue.add(track); // Add all tracks from the playlist to the queue
            }
        } else {
            player.queue.add(res.tracks[0]); // Add the first track from the search results
            interaction.reply({
                content: `Track added to the queue: ${res.tracks[0].title}`
            });
        }

        if (!player.playing) {
            player.play(); // Start playing if not already doing so
        }
    }
});

// Register slash commands with Discord
const commands = [
    {
        name: 'play',
        description: 'Play a song from YouTube',
        options: [
            {
                name: 'query',
                type: 3,
                description: 'The song you want to play',
                required: true,
            },
        ],
    },
];

const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_TOKEN);

(async () => {
    try {
        console.log('Updating slash commands...');

        await rest.put(
            Routes.applicationCommands(process.env.APPLICATION_ID),
            { body: commands },
        );

        console.log('Slash commands have been successfully registered!');
    } catch (error) {
        console.error('There was an error registering the slash commands:', error);
    }
})();

// Logging in the client
client.login(process.env.DISCORD_TOKEN);
```

## Support

Join our Discord server at [Moonlink.js - Imagine a Music Bot](https://discord.com/invite/xQq2A8vku3) to connect with other users, ask questions, and participate in discussions. 🤝

For any inquiries or assistance, we're here to help! 🌟

## Final Thanks

Thank you to everyone who contributed to the growth of moonlink.js, reporting bugs, installing the package and everyone else's patience, I apologize for any time I wasn't able to help someone

have a great day :)
