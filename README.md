# Imagine a Music
## Moonlink.js

<img src='https://cdn.discordapp.com/attachments/1019979902411350016/1082098052808052816/114_Sem_Titulo_20230222123935.png'></img>
[![NPM](https://nodei.co/npm/moonlink.js.png)](\[https:/nodei.co/npm/moonlink.js) 
[![Codacy Badge](https://app.codacy.com/project/badge/Grade/7dd9288acdc94dacaa11ad80f36a9bd3)](https://www.codacy.com/gh/1Lucas1apk/moonlink.js/dashboard?utm\_source=github.com\&utm\_medium=referral\&utm\_content=1Lucas1apk/moonlink.js\&utm\_campaign=Badge\_Grade) [![Downloads](https://img.shields.io/npm/dt/moonlink.js.svg?color=3884FF)](https://www.npmjs.com/package/moonlink.js) [![Version](https://img.shields.io/npm/v/moonlink.js.svg?color=3884FF\&label=version)](https://www.npmjs.com/package/moonlink.js) [![install size](https://packagephobia.com/badge?p=moonlink.js)](https://packagephobia.com/result?p=moonlink.js) ![vulnabilites](https://img.shields.io/snyk/vulnerabilities/npm/moonlink.js) ![node](https://img.shields.io/node/v/moonlink.js)

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
const { Client } = require('discord.js') // importing discord.js library
const { MoonlinkManager } = require('moonlink.js') // importing moonlink.js package 

const prefix = '?' // setting the prefix for the bot

const client = new Client({ intents: 131071 }) // creating a client for the bot 
//------- (package configuration) ----------//
client.moon = new MoonlinkManager(
  [{ 
    host: 'localhost', 
    port: 443, 
    secure: false, 
    password: 'moon'
  }],
  { shards: 1 },
  (guild, sPayload) => { 
    client.guilds.cache.get(guild).shard.send(JSON.parse(sPayload))
  }
)
client.moon.on('nodeCreate', (node) => console.log('connected')) // emit to the console the node was connected to 
client.moon.on('trackStart', async(player, track) => {
  client.channels.cache.get(player.textChannel).send(`${track.title} is playing now`) // when the player starts it will send a message to the channel where the command was executed
})
client.moon.on('trackEnd', async(player, track) => {
  client.channels.cache.get(player.textChannel).send(`Track is over`) // when the player starts it will send a message to the channel where the command was executed
})
client.on('ready', () => client.moon.init(client.user.id)) // initializing the package;
client.on('raw', (data) => {
  client.moon.updateVoiceState(data) //this will send to the package the information needed for the package to work properly 
})

client.on('messageCreate', async (message) => {
  if (message.author.bot || !message.content.startsWith(prefix)) return; // In case the author is a bot, or the message content doesn't start with the prefix, ignore it.
  
  let args = message.content.slice(prefix.length).trim().split(/ +/g)
  let cmd = args.shift().toLowerCase()
  
  if (cmd === 'play') {
    if (!message.member.voice.channel) return message.reply('You\'re not on a voice channel') 
      
    let query = args.join(' ')
    
    if (!query) return message.reply('You didn\'t put what you want me to play')
        
    let player = client.moon.players.create({
      guildId: message.guild.id,
      voiceChannel: message.member.voice.channel.id,
      textChannel: message.channel.id
    }) // Creates the player.

    if (!player.connected) player.connect() // Will connect the player to the voice channel.
      
    let res = await client.moon.search(query) // Will search for the track on youtube
    
    switch(res.loadType) {
      case 'LOAD_FAILED':
        // Something failed while loading the tracks.
        return message.reply(`:x: Load failed.`)
      case 'NO_MATCHES':
        // No music was found, so we inform the user.
        return message.reply(`:x: No matches!`)
      case 'PLAYLIST_LOADED':
        // If it's a playlist, proceed to add all tracks to the queue.
        for (const track of res.tracks) {
          player.queue.add(track)
        }
        break
      default:
        player.queue.add(res.tracks[0]) // if it's a single track it will add it to the queue
        message.reply('Added track in queue')
        break
    }

    if(!player.playing) player.play() // if the player is not playing it will play the track
  }
});
client.login('TOKEN') 
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
<td align="center"><a href="https://github.com/motoG100"> <img src="https://cdn.discordapp.com/avatars/882757043142950974/cecf0634ed25da5778312203117f40ac.webp?size=2048" width="100px;" alt="" /><br> <sub><b>MotoG.js</b></sub><br> </a><a href="https://github.com/1Lucas1apk/Moonlink.js/commits?author=motoG100" title="Code">💻</a><a href="https://moonlink.js.org/exemples" title="exemples">💡</a><a href="https://github.com/1Lucas1apk/moonlink.js" title="ideas">🤔</a><a href="https://github.com/1Lucas1apk/moonlink.js/issues" title="question">💬</a><a href="https://moonlink.js.org" title="designer">🎨</a></td>
<td align="center"><a href="https://github.com/thePedroo"> <img src="https://cdn.discordapp.com/avatars/639995261967663104/1d986d69a76c980049982f21f7b2a9ef.webp?size=2048" width="100px;" alt="" /><br> <sub><b>thePedroo</b></sub><br> </a><a href="https://github.com/1Lucas1apk/Moonlink.js/commits?author=thePedroo" title="Code">💻</a><a href="https://github.com/1Lucas1apk/moonlink.js" title="ideas">🤔</a></td>
<td align="center"><a href="https://discord.com/users/912987919357190194"> <img src="https://cdn.discordapp.com/avatars/912987919357190194/bfb477ccd7ab6b4927f6d7e56acf1037.webp?size=2048" width="100px;" alt="" /><br> <sub><b>ItzGG</b></sub><br> </a><a href="https://discord.gg/gPw8ycW5wN" title="Bug">🐛</a></td>
<td align="center"><a href="https://discord.com/users/666270910692720661"> <img src="https://cdn.discordapp.com/avatars/666270910692720661/cf9ce4733dbeb61391eab6b16a56daef.webp?size=2048" width="100px;" alt="" /><br> <sub><b>Nah</b></sub><br> </a><a href="https://discord.com/channels/990369410344701964/1057275443587338262/1057275443587338262" title="Bug">🐛</a></td>
<td align="center"><a href="https://discord.com/users/666270910692720661"> <img src="asset://asset/images/default_avatar_0.png?size=2048" width="100px;" alt="" /><br> <sub><b>SuperPlayerBots</b></sub><br> </a><a href="https://discord.com/channels/990369410344701964/1070454617294516284/1071695070639702056" title="Bug">🐛</a></td>

</tr>
</table>
