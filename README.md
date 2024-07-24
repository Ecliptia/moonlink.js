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
const Discord = require("discord.js")
const { Manager } = require("moonlink.js")

const client = new Discord.Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.GuildVoiceStates
    ]
});

// Configuring the Moonlink.js package
client.moonlink = new Manager({
  nodes: [{
    identifier: "node_1",
    host: "localhost_exemple.com",
    port: 2333,
    secure: false,
    }],
  options: {
    // clientName: "MyApp/1.0.1"
    },
  sendPayload: (guildId, payload) => {
    const guild = client.guilds.cache.get(guildId);
    if (guild) guild.shard.send(JSON.parse(payload));
    }
})

// Event: Node created
client.moonlink.on("nodeCreate", node => {
    console.log(`${node.host} was connected, and the magic is in the air`);
});

// Event: Track start
client.moonlink.on("trackStart", async (player, track) => {
    // Sending a message when the track starts playing
    client.channels.cache
        .get(player.textChannelId)
        .send(`${track.title} is playing now, bringing holiday joy`);
});

// Event: Track end
client.moonlink.on("trackEnd", async (player, track) => {
    // Sending a message when the track finishes playing
    client.channels.cache
        .get(player.textChannelId)
        .send(`The track is over, but the magic continues`);
});

// Event: Ready
client.on("ready", () => {
    // Initializing the Moonlink.js package with the client's user ID
    client.moonlink.init(client.user.id);
});

// Event: Raw data
client.on("raw", data => {
    // Updating the Moonlink.js package with the necessary data
    client.moonlink.packetUpdate(data);
});

// Event: Interaction created
client.on("interactionCreate", async interaction => {
    if (!interaction.isChatInputCommand()) return;
    let commandName = interaction.commandName;
    if (commandName === "play") {
        if (!interaction.member.voice.channel) {
            // Responding with a message if the user is not in a voice channel
            return interaction.reply({
                content: `You are not in a voice channel`,
                ephemeral: true
            });
        }

        let query = interaction.options.getString("query");
        let player = client.moonlink.createPlayer({
            guildId: interaction.guild.id,
            voiceChannelId: interaction.member.voice.channel.id,
            textChannelId: interaction.channel.id,
            autoPlay: true
        });

        if (!player.connected) {
            // Connecting to the voice channel if not already connected
            player.connect({
                setDeaf: true,
                setMute: false
            });
        }

        let res = await client.moonlink.search({
            query,
            source: "youtube",
            requester: interaction.user.id
        });

        if (res.loadType === "loadfailed") {
            // Responding with an error message if loading fails
            return interaction.reply({
                content: `:x: Load failed - the system is not cooperating.`
            });
        } else if (res.loadType === "empty") {
            // Responding with a message if the search returns no results
            return interaction.reply({
                content: `:x: No matches found!`
            });
        }

        if (res.loadType === "playlist") {
            interaction.reply({
                content: `${res.playlistInfo.name} This playlist has been added to the waiting list, spreading joy`
            });

            for (const track of res.tracks) {
                // Adding tracks to the queue if it's a playlist
                player.queue.add(track);
            }
        } else {
            player.queue.add(res.tracks[0]);
            interaction.reply({
                content: `${res.tracks[0].title} was added to the waiting list`
            });
        }

        if (!player.playing) {
            // Starting playback if not already playing
            player.play();
        }
});

// Logging in with the Discord token
client.login(process.env["DISCORD_TOKEN"]);
```

## Support

Join our Discord server at [Moonlink.js - Imagine a Music Bot](https://discord.com/invite/xQq2A8vku3) to connect with other users, ask questions, and participate in discussions. 🤝

For any inquiries or assistance, we're here to help! 🌟

## Final Thanks

Thank you to everyone who contributed to the growth of moonlink.js, reporting bugs, installing the package and everyone else's patience, I apologize for any time I wasn't able to help someone

have a great day :)
