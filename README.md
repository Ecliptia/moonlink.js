# Imagine a Music
## Moonlink.js

<img src='https://cdn.discordapp.com/attachments/1019979902411350016/1082098052808052816/114_Sem_Titulo_20230222123935.png'></img>
[![NPM](https://nodei.co/npm/moonlink.js.png)](\[https:/nodei.co/npm/moonlink.js) 
[![Codacy Badge](https://app.codacy.com/project/badge/Grade/7dd9288acdc94dacaa11ad80f36a9bd3)](https://www.codacy.com/gh/1Lucas1apk/moonlink.js/dashboard?utm\_source=github.com\&utm\_medium=referral\&utm\_content=1Lucas1apk/moonlink.js\&utm\_campaign=Badge\_Grade) [![Downloads](https://img.shields.io/npm/dt/moonlink.js.svg?color=3884FF)](https://www.npmjs.com/package/moonlink.js) [![Version](https://img.shields.io/npm/v/moonlink.js.svg?color=3884FF\&label=version)](https://www.npmjs.com/package/moonlink.js) [![install size](https://packagephobia.com/badge?p=moonlink.js)](https://packagephobia.com/result?p=moonlink.js) ![vulnabilites](https://img.shields.io/snyk/vulnerabilities/npm/moonlink.js) ![node](https://img.shields.io/node/v/moonlink.js)

• Documentation

[![Netlify Status](https://api.netlify.com/api/v1/badges/4f4a2a64-a8db-4db3-ad1d-0c4ac7274d0e/deploy-status)](https://app.netlify.com/sites/moonlinkjs/deploys)

> MoonLink.js is a simple package for lavalink client, perfect for you to create your discord bot with songs, and very simple and easy to use

## 📦 How to install
```js
npm: npm install moonlink.js
yarn: yarn add moonlink.js
pnpm: pnpm install moonlink.js
```
## 🎲 Requirements

> Requirements are, have a node above version `1.16 >==` support packages

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
}], {
  shards: 1
}, (guild, sPayload) => {
  client.guilds.cache.get(guild).shard.send(JSON.parse(sPayload))
})
client.moon.on('nodeCreate', (node) => {
  console.log(node + ' was connected')
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
  client.moon.updateVoiceState(data) //this will send to the package the information needed for the package to work properly
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
    textChannel: interaction.channel.id
  }); //creating a player
  if (!player.connected) player.connect({
    setDeaf: true,
    setMute: false
  }) // if the player is not connected it will connect to the voice channel
  let res = await client.moon.search(query) // will do a search on the video informed in the query
  if (res.loadType === "LOAD_FAILED") {
    return interaction.reply({
      content: `:x: Load failed. `
    }); //if there is an error when loading the tracks, it informs that there is an error
  } else if (res.loadType === "NO_MATCHES") {
    return interaction.reply({
      content: `:x: No matches!`
    }); // nothing was found
  }
  if (res.loadType === 'PLAYLIST_LOADED') {
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

## 🎨 Suport

> You can get support on our discord server [MoonLink - Support](https://discord.gg/xQq2A8vku3)(Updated)

## 🎓 Contributors 
meaning of [emojis](https://allcontributors.org/docs/en/emoji-key)

<table>
<tr>
<td align="center"><a href="https://github.com/1Lucas1apk"> <img src="https://cdn.discordapp.com/avatars/978981769661513758/438e182c14d5d28aa87ded076eca2755.webp?size=2048" width="100px;" alt="" /><br> <sub><b>1Lucas1.apk</b></sub><br> </a><a href="https://github.com/1Lucas1apk/Moonlink.js/commits?author=1Lucas1apk" title="Code">💻</a><a href="https://moonlink.js.org" title="Doc">📖</a><a href="https://moonlink.js.org/exemples" title="exemples">💡</a><a href="https://github.com/1Lucas1apk/Moonlink.js" title="infra">🚇</a><a href="https://github.com/1Lucas1apk/moonlink.js" title="ideas">🤔</a><br><a href="https://github.com/1Lucas1apk/moonlink.js" title="maintenance">🚧</a><a href="https://github.com/1Lucas1apk/moonlink.js/issues" title="question">💬</a><a href="https://github.com/1Lucas1apk/moonlink.js/" title="review">👀</a><a href="https://github.com/1Lucas1apk/moonlink.js/" title="Tools">🔧</a><a href="https://github.com/1Lucas1apk/moonlink.js/" title="Test">⚠️</a><a href="https://moonlink.js.org" title="tutorial">✅</a></td>
<td align="center"><a href="https://github.com/motoG100"> <img src="https://cdn.discordapp.com/attachments/1046805409169682482/1087397208795643996/motog.png" width="100px;" alt="" /><br> <sub><b>MotoG.js</b></sub><br> </a><a href="https://github.com/1Lucas1apk/Moonlink.js/commits?author=motoG100" title="Code">💻</a><a href="https://moonlink.js.org/exemples" title="exemples">💡</a><a href="https://github.com/1Lucas1apk/moonlink.js" title="ideas">🤔</a><a href="https://github.com/1Lucas1apk/moonlink.js/issues" title="question">💬</a><a href="https://moonlink.js.org" title="designer">🎨</a></td>
</tr>
<tr>
<td align="center"><a href="https://github.com/SudhanPlayz"> <img src="https://cdn.discordapp.com/attachments/990369914093207563/1087398012675952670/itzcuteklee.png" width="100px;" alt="" /><br> <sub><b>ItzCuteKlee</b></sub><br> <a href="https://github.com/1Lucas1apk/Moonlink.js/commits?author=SudhanPlayz" title="Code">💻</a></td>
<td align="center"><a href="https://github.com/NotWrench"> <img src="https://cdn.discordapp.com/attachments/990369914093207563/1087398932474245130/wrench.png" width="100px;" alt="" /><br> <sub><b>Wrench</b></sub><br><a href="https://github.com/1Lucas1apk/Moonlink.js/commits?author=NotWrench" title="Code">💻</a></td>
</tr>
<tr>
<td align="center"><a href="https://discord.com/users/912987919357190194"> <img src="https://cdn.discordapp.com/avatars/912987919357190194/bfb477ccd7ab6b4927f6d7e56acf1037.webp?size=2048" width="100px;" alt="" /><br> <sub><b>ItzGG</b></sub><br> </a><a href="https://discord.gg/gPw8ycW5wN" title="Bug">🐛</a></td>
<td align="center"><a href="https://discord.com/users/666270910692720661"> <img src="https://cdn.discordapp.com/avatars/666270910692720661/cf9ce4733dbeb61391eab6b16a56daef.webp?size=2048" width="100px;" alt="" /><br> <sub><b>Nah</b></sub><br> </a><a href="https://discord.com/channels/990369410344701964/1057275443587338262/1057275443587338262" title="Bug">🐛</a></td>
</tr>
<tr>
<td align="center"><a href="https://discord.com/users/666270910692720661"> <img src="asset://asset/images/default_avatar_0.png?size=2048" width="100px;" alt="" /><br> <sub><b>SuperPlayerBots</b></sub><br> </a><a href="https://discord.com/channels/990369410344701964/1070454617294516284/1071695070639702056" title="Bug">🐛</a></td>
</tr>
</table>
