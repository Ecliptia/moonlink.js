# Imagine Music 🎄

# Moonlink.js - Awaken Your Musical Creativity with Holiday Magic 🚀

<img src='https://media.discordapp.net/attachments/987017309325492275/1178469144480469162/IMG_20221121_083735.png?ex=657641ea&is=6563ccea&hm=73fe8252eebed251ef5f6c486ff52a06e6ece9abae7e1cc566306922ef73b185&'></img>
[![NPM](https://nodei.co/npm/moonlink.js.png)](https://nodei.co/npm/moonlink.js)

[![Made with ♥️ in - Brazil](https://img.shields.io/badge/Made_with_♥️_in-Brazil-ED186A?style=for-the-badge)](https://github.com/1Lucas1apk)

[![Codacy Badge](https://app.codacy.com/project/badge/Grade/7dd9288acdc94dacaa11ad80f36a9bd3)](https://www.codacy.com/gh/1Lucas1apk/moonlink.js/dashboard?utm_source=github.com&utm_medium=referral&utm_content=1Lucas1apk/moonlink.js&utm_campaign=Badge_Grade) [![Downloads](https://img.shields.io/npm/dt/moonlink.js.svg?color=3884FF)](https://www.npmjs.com/package/moonlink.js) [![Version](https://img.shields.io/npm/v/moonlink.js.svg?color=3884FF&label=version)](https://www.npmjs.com/package/moonlink.js) [![install size](https://packagephobia.com/badge?p=moonlink.js)](https://packagephobia.com/result?p=moonlink.js) ![node](https://img.shields.io/node/v/moonlink.js) [![Netlify Status](https://api.netlify.com/api/v1/badges/4f4a2a64-a8db-4db3-ad1d-0c4ac7274d0e/deploy-status)](https://app.netlify.com/sites/moonlinkjs/deploys)

Envision a musical journey where creativity knows no bounds, accompanied by the enchantment of the holiday season. 🌌 Moonlink.js invites you to unlock your complete musical potential, designed exclusively for Lavalink clients. Step into a world of seamless communication and fluid interaction, where Moonlink.js elevates your projects to new heights, sprinkled with holiday charm. With full TypeScript support, it empowers your creativity and productivity. 🎵

## Enchanting Features 🌟

Moonlink.js offers magical features to craft exceptional music bots:

- **Seamless Communication with Holiday Spirit**: Crafted for Lavalink clients, it ensures a music experience without interruptions, with a touch of holiday joy. 🎧🎄

- **Full TypeScript Support with Festive Style**: Leverage complete TypeScript support to boost your productivity and creativity, with a dash of holiday magic. 💻🎅

- **Active and Festive Community**: Be part of a community of passionate developers and benefit from our active support system, now with a festive touch. Our project isn't just about minimizing package size; it's about maximizing its quality and potential for developers. 🤝🎉

## Magical Documentation 📚

For comprehensive documentation and more examples, visit the [MoonLink Docs](https://moonlink.js.org) site. 📖

Note: The documentation is being revamped; it may take some time...

## Getting Started with Holiday Cheer 🚀

```javascript
const { Client, GatewayIntentBits } = require('discord.js');
const { MoonlinkManager } = require('moonlink.js');

// Creating a magical instance of the Discord.js client
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.GuildVoiceStates
  ]
});

// Magical configuration of the Moonlink.js package
client.moon = new MoonlinkManager(
  [{
    host: 'localhost',
    port: 2333,
    secure: true,
    password: 'MyPassword',
    pathVersion: 'v4' // If Lavalink is in version 3, change this parameter to 'v3'
  }],
  { /* Magical Options */ },
  (guild, sPayload) => {
    // Send magical payload information to the server
    client.guilds.cache.get(guild).shard.send(JSON.parse(sPayload));
  }
);

// Event: Magical Node created
client.moon.on('nodeCreate', (node) => {
  console.log(`${node.host} was connected, and the magic is in the air`);
});

// Event: Magical Track start
client.moon.on('trackStart', async (player, track) => {
  // Send a magical message when the track starts playing
  client.channels.cache.get(player.textChannel).send(`${track.title} is playing now, bringing holiday joy`);
});

// Event: Magical Track end
client.moon.on('trackEnd', async (player, track) => {
  // Send a magical message when the track finishes playing
  client.channels.cache.get(player.textChannel).send(`The track is over, but the magic continues`);
});

// Event: Ready with Magic
client.on('ready', () => {
  // Initialize the Moonlink.js package with the magical client's user ID
  client.moon.init(client.user.id);
});

// Event: Raw with Magic (raw data)
client.on('raw', (data) => {
  // Update the Moonlink.js package with the magical data necessary to function correctly
  client.moon.packetUpdate(data);
});

// Event: Magical Interaction created
client.on('interactionCreate', async (interaction)

 => {
  if (!interaction.isChatInputCommand()) return;

  if (interaction.commandName === 'play') {
    if (!interaction.member.voice.channel) {
      // Respond with a magical message if the user is not in a voice channel
      return interaction.reply({
        content: `You are not in a magical voice channel`,
        ephemeral: true,
      });
    }

    let query = interaction.options.getString('query');
    let player = client.moon.players.create({
      guildId: interaction.guild.id,
      voiceChannel: interaction.member.voice.channel.id,
      textChannel: interaction.channel.id,
      autoPlay: true,
    });

    if (!player.connected) {
      // Connect to the magical voice channel if the player is not connected
      player.connect({
        setDeaf: true,
        setMute: false,
      });
    }

    let res = await client.moon.search(query);

    if (res.loadType === "loadfailed") {
      // Respond with a magical error message if loading fails
      return interaction.reply({
        content: `:x: Load failed - the magic is not cooperating.`,
      });
    } else if (res.loadType === "empty") {
      // Respond with a magical message if the search returns no results
      return interaction.reply({
        content: `:x: No magical matches!`,
      });
    }

    if (res.loadType === 'playlist') {
      interaction.reply({
        content: `${res.playlistInfo.name} This playlist has been added to the magical waiting list, spreading holiday joy`,
      });

      for each (const track of res.tracks) {
        // Add magical tracks to the queue if it's a playlist
        player.queue.add(track);
      }
    } else {
      player.queue.add(res.tracks[0]);
      interaction.reply({
        content: `${res.tracks[0].title} was added to the magical waiting list`,
      });
    }

    if (!player.playing) {
      // Start playing magically if it's not already playing
      player.play();
    }
  }
});

// Log in with the magical Discord token
client.login(process.env["DISCORD_TOKEN"]);
```

## Magical Open Source License:
Code: [PerforWebsocket](https://github.com/1Lucas1apk/moonlink.js/blob/v2/src/@Moonlink/PerforWebsocket.ts) Copyright for the PerformanC organization, more specifically from the [Fastlink](https://github.com/PerformanC/FastLink) package, from [ws.js](https://github.com/PerformanC/FastLink/blob/main/src/ws.js) code; Maintained by the organization "Pedro.js"

## Magical Contributors 🎅

We would like to express our gratitude to the amazing individuals who contributed to this project. Their hard work and dedication have been instrumental in making it a success. 🎉

1. **1Lucas1apk** - Lead Developer, responsible for project architecture and key feature implementation. 🚀

2. **MotoG.js** - Project Ideator and Designer, contributing to the concept and visual design with a touch of holiday magic. 🎨🎅

3. **WilsontheWolf** - Contributed to the real-time track position logic, rather than just receiving the payload from lavalink

4. **PiscesXD** - First sponsor and contributed to making the shuffle method reversible, and autoLeave

Bug Hunters 🐛:

- **Nah**
- **ItzGG**
- **SuperPlayerBots**
- **ddemile**
- **Tasty-Kiwi**
- **rrm**
- **WilsontheWolf**

We sincerely thank all the contributors mentioned above and everyone who contributed to this project in any way. Your support is truly appreciated. 🙏
