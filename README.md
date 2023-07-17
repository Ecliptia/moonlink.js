# Imagine a Music

## Moonlink.js

<img src='https://cdn.discordapp.com/attachments/1019979902411350016/1082098052808052816/114_Sem_Titulo_20230222123935.png'></img>
[![NPM](https://nodei.co/npm/moonlink.js.png)](https://nodei.co/npm/moonlink.js)
[![Codacy Badge](https://app.codacy.com/project/badge/Grade/7dd9288acdc94dacaa11ad80f36a9bd3)](https://www.codacy.com/gh/1Lucas1apk/moonlink.js/dashboard?utm_source=github.com&utm_medium=referral&utm_content=1Lucas1apk/moonlink.js&utm_campaign=Badge_Grade) [![Downloads](https://img.shields.io/npm/dt/moonlink.js.svg?color=3884FF)](https://www.npmjs.com/package/moonlink.js) [![Version](https://img.shields.io/npm/v/moonlink.js.svg?color=3884FF&label=version)](https://www.npmjs.com/package/moonlink.js) [![install size](https://packagephobia.com/badge?p=moonlink.js)](https://packagephobia.com/result?p=moonlink.js) ![node](https://img.shields.io/node/v/moonlink.js) [![Netlify Status](https://api.netlify.com/api/v1/badges/4f4a2a64-a8db-4db3-ad1d-0c4ac7274d0e/deploy-status)](https://app.netlify.com/sites/moonlinkjs/deploys)

Unleash the power of your imagination with Moonlink.js!

- Moonlink.js invites you to embark on a musical journey like no other, designed exclusively for Lavalink clients.
- Step into a world of seamless communication and fluid interaction, where Moonlink.js takes your projects to new heights.
- Experience the magic of TypeScript, as Moonlink.js provides full support for this dynamic language, fueling your creativity and productivity.
- Immerse yourself in a thriving community of passionate developers and benefit from our active support system, including an intelligent bot, ready to assist you in unlocking the potential of your code.
- Let your imagination run wild and create extraordinary music bots with Moonlink.js.

## 📦 How to install

```js
npm: npm install moonlink.js
yarn: yarn add moonlink.js
pnpm: pnpm install moonlink.js
```

## 🎲 Requirements

> Requirements are, have a node above version `1.16 >==` support packages, Requires version 4 lavalinks

## 📚 Getting started

```js
const {
  Client,
  GatewayIntentBits
} = require('discord.js') //importing discord.js library
const {
  MoonlinkManager
} = require('moonlink.js') // importing moonlink.js package
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.GuildVoiceStates
  ]
}) //creating a client for the bot
//------- (package configuration) ----------//
client.moon = new MoonlinkManager([{
  host: 'localhost',
  port: 2333,
  secure: true,
  password: 'MyPassword'
}], { /* Option */ }, (guild, sPayload) => {
  client.guilds.cache.get(guild).shard.send(JSON.parse(sPayload))
})
client.moon.on('nodeCreate', (node) => {
  console.log(`${node.host} was connected`)
}) //emit to the console the node was connected to
client.moon.on('trackStart', async(player, track) => {
  client.channels.cache.get(player.textChannel).send(`${track.title} is playing now`) //when the player starts it will send a message to the channel where the command was executed
})
client.moon.on('trackEnd', async(player, track) => {
  client.channels.cache.get(player.textChannel).send(`track is over`) //when the player starts it will send a message to the channel where the command was executed
})
client.on('ready', () => {
  client.moon.init(client.user.id); //initializing the package
});
client.on('raw', (data) => {
  client.moon.packetUpdate(data) //this will send to the package the information needed for the package to work properly
})
client.on('interactionCreate', async(interaction) => {
  if (!interaction.isChatInputCommand()) return;
  if(interaction.commandName == 'play') {
  if (!interaction.member.voice.channel) return interaction.reply({
    content: `you are not on a voice channel`,
    ephemeral: true
  })
  let query = interaction.options.getString('query');
  let player = client.moon.players.create({
    guildId: interaction.guild.id,
    voiceChannel: interaction.member.voice.channel.id,
    textChannel: interaction.channel.id,
    autoPlay: true
  }); //creating a player
  if (!player.connected) player.connect({
    setDeaf: true,
    setMute: false
  }) // if the player is not connected it will connect to the voice channel
  let res = await client.moon.search(query) // will do a search on the video informed in the query
  if (res.loadType === "loadfailed") {
    return interaction.reply({
      content: `:x: Load failed. `
    }); //if there is an error when loading the tracks, it informs that there is an error
  } else if (res.loadType === "empty") {
    return interaction.reply({
      content: `:x: No matches!`
    }); // nothing was found
  }
  if (res.loadType === 'playlist') {
    interaction.reply({
      content: `${res.playlistInfo.name} this playlist has been added to the waiting list`
    })
    for (const track of res.tracks) {
      //if it's a playlist it will merge all the tracks and add it to the queue
      player.queue.add(track);
    }
  } else {
    player.queue.add(res.tracks[0])
    interaction.reply({
      content: `${res.tracks[0].name} was added to the waiting list`
    })
  }
  if (!player.playing) player.play()
  }
}
});
client.login(process.env["DISCORD_TOKEN"])
```

## 📖 documentation

> Enter the documentation site to understand more about the package, there are many more examples [MoonLink Docs](https://moonlink.js.org)

## 🛟 Support

We offer the following support for our project:

- **Code Assistance**: Need help with the code? Our experienced developers and contributors are available to assist you. Open an issue on our GitHub repository for prompt assistance.

- **Automated Bot**: We have an automated support bot that can provide answers to common questions and help troubleshoot known issues. It's available around the clock for your convenience.

- **Community**: Join our community Discord server at [Moonlink.js - Imagine a Music Bot](https://discord.gg/xQq2A8vku3) to connect with other users, ask questions, and participate in discussions.

For any inquiries or assistance, we're here to help!


## 🫶 Contributors

We would like to express our gratitude to the amazing individuals who contributed to this project. Their hard work and dedication have been instrumental in making it a success.

1. **1Lucas1apk** - Lead Developer responsible for the project architecture and implementation of key features.

2. **MotoG.js** - Project ideator and Designer, who came up with the concept and contributed to the visual design.

Bug Hunters 🐛:

- **Nah**
- **ItzGG**
- **SuperPlayerBots**
- **ddemile**
- **Tasty-Kiwi**

We want to extend our heartfelt thanks to all the contributors mentioned above and to everyone who has helped in any way with this project. Your support is truly appreciated.
