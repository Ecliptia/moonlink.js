# Imagine a Music 🎶

# Moonlink.js - Unleash Your Musical Creativity 🚀

<img src='https://cdn.discordapp.com/attachments/1019979902411350016/1082098052808052816/114_Sem_Titulo_20230222123935.png'></img>
[![NPM](https://nodei.co/npm/moonlink.js.png)](https://nodei.co/npm/moonlink.js)
[![Codacy Badge](https://app.codacy.com/project/badge/Grade/7dd9288acdc94dacaa11ad80f36a9bd3)](https://www.codacy.com/gh/1Lucas1apk/moonlink.js/dashboard?utm_source=github.com&utm_medium=referral&utm_content=1Lucas1apk/moonlink.js&utm_campaign=Badge_Grade) [![Downloads](https://img.shields.io/npm/dt/moonlink.js.svg?color=3884FF)](https://www.npmjs.com/package/moonlink.js) [![Version](https://img.shields.io/npm/v/moonlink.js.svg?color=3884FF&label=version)](https://www.npmjs.com/package/moonlink.js) [![install size](https://packagephobia.com/badge?p=moonlink.js)](https://packagephobia.com/result?p=moonlink.js) ![node](https://img.shields.io/node/v/moonlink.js) [![Netlify Status](https://api.netlify.com/api/v1/badges/4f4a2a64-a8db-4db3-ad1d-0c4ac7274d0e/deploy-status)](https://app.netlify.com/sites/moonlinkjs/deploys)

Imagine a musical journey where creativity knows no bounds. 🌌 Moonlink.js invites you to unlock your full musical potential, designed exclusively for Lavalink clients. Step into a world of seamless communication and fluid interaction, where Moonlink.js takes your projects to new heights. With full TypeScript support, it empowers your creativity and productivity. 🎵

## Features 🌟

Moonlink.js offers essential features to create exceptional music bots:

- **Seamless Communication**: Built for Lavalink clients, it ensures a music experience without interruptions. 🎧

- **Full TypeScript Support**: Take advantage of complete TypeScript support to boost your productivity and creativity. 💻

- **Active Community**: Be part of a community of passionate developers and benefit from our active support system. Our project isn't just about minimizing package size, but rather maximizing its quality and potential for developers. 🤝

## Documentation 📚

For comprehensive documentation and more examples, visit our [MoonLink Docs](https://moonlink.js.org) site. 📖

obs: the documentation is being redone, it may take a while...

## Getting Started 🚀

```javascript
const { Client, GatewayIntentBits } = require('discord.js');
const { MoonlinkManager } = require('moonlink.js');

// Creating an instance of the Discord.js client
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.GuildVoiceStates
  ]
});

// Moonlink.js package configuration
client.moon = new MoonlinkManager(
  [{
    host: 'localhost',
    port: 2333,
    secure: true,
    password: 'MyPassword'
  }],
  { /* Options */ },
  (guild, sPayload) => {
    // Send payload information to the server
    client.guilds.cache.get(guild).shard.send(JSON.parse(sPayload));
  }
);

// Event: Node created
client.moon.on('nodeCreate', (node) => {
  console.log(`${node.host} was connected`);
});

// Event: Track start
client.moon.on('trackStart', async (player, track) => {
  // Send a message when the track starts playing
  client.channels.cache.get(player.textChannel).send(`${track.title} is playing now`);
});

// Event: Track end
client.moon.on('trackEnd', async (player, track) => {
  // Send a message when the track finishes playing
  client.channels.cache.get(player.textChannel).send(`track is over`);
});

// Event: Ready
client.on('ready', () => {
  // Initialize the Moonlink.js package with the client's user ID
  client.moon.init(client.user.id);
});

// Event: Raw (raw data)
client.on('raw', (data) => {
  // Update the Moonlink.js package with the necessary data to function correctly
  client.moon.packetUpdate(data);
});

// Event: Interaction created
client.on('interactionCreate', async (interaction) => {
  if (!interaction.isChatInputCommand()) return;

  if (interaction.commandName === 'play') {
    if (!interaction.member.voice.channel) {
      // Respond with a message if the user is not in a voice channel
      return interaction.reply({
        content: `you are not on a voice channel`,
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
      // Connect to the voice channel if the player is not connected
      player.connect({
        setDeaf: true,
        setMute: false,
      });
    }

    let res = await client.moon.search(query);

    if (res.loadType === "loadfailed") {
      // Respond with an error message if loading fails
      return interaction.reply({
        content: `:x: Load failed. `,
      });
    } else if (res.loadType === "empty") {
      // Respond with a message if the search returns no results
      return interaction.reply({
        content: `:x: No matches!`,
      });
    }

    if (res.loadType === 'playlist') {
      interaction.reply({
        content: `${res.playlistInfo.name} this playlist has been added to the waiting list`,
      });

      for (const track of res.tracks) {
        // Add tracks to the queue if it's a playlist
        player.queue.add(track);
      }
    } else {
      player.queue.add(res.tracks[0]);
      interaction.reply({
        content: `${res.tracks[0].title} was added to the waiting list`,
      });
    }

    if (!player.playing) {
      // Start playing if it's not already playing
      player.play();
    }
  }
});

// Log in with the Discord token
client.login(process.env["DISCORD_TOKEN"]);
```

## Our Philosophy 💭

At Moonlink.js, our philosophy is clear: we don't limit ourselves to minimal package size. We believe that quality and completeness are essential to empower developers to achieve their musical goals. While some packages sacrifice functionality in pursuit of minimal sizes, Moonlink.js strikes a balance by offering a comprehensive package. We believe this complete and robust approach is crucial to simplify and inspire the creation of exceptional music bots. 🌟

## Support 🫶

We offer various forms of support for our project:

- **Code Assistance**: Our experienced developers and contributors are ready to help. Open an issue on our GitHub repository for prompt assistance. 💻

- **Community**: Join our Discord server at [Moonlink.js - Imagine a Music Bot](https://discord.gg/xQq2A8vku3) to connect with other users, ask questions, and participate in discussions. 🤝

For any inquiries or assistance, we're here to help! 🌟

