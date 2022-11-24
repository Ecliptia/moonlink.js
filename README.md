# Imagine a Music
## Moonlink.js

<img src='https://cdn.discordapp.com/attachments/1019979902411350016/1044230708685713438/IMG_20221121_083735.png'></img>
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
const { Client } = require('discord.js') //importing discord.js library
const { MoonlinkManager } = require('moonlink.js') // importing moonlink.js package 
const client = new Client({
    intents: 131071
}) //creating a client for the bot 
//------- (package configuration) ----------//
client.moon = new MoonlinkManager([{ 
    host: 'localhost', 
    port: 443, 
    secure: false, 
    password: 'moon'
}], { shards: 1 }, (guild, sPayload) => { 
client.guilds.cache.get(guild).shard.send(JSON.parse(sPayload))
    })
client.moon.on('nodeCreate', (node) => console.log('connected')) //emit to the console the node was connected to 
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
const prefix = '?'
client.on('messageCreate', async(message) => {
    
    if(message.author.bot) return; // if the message is from a bot just ignore it
       if(!message.content.startsWith(prefix)) return; //if content doesn't start with the prefix, make it ignore 
    let args = message.content.slice(prefix.length).trim().split(/ +/g); 
    let cmd = args.shift().toLowerCase();
    if(cmd === 'play') {
   if(!message.member.voice.channel) return message.reply(`you are not on a voice channel`) 
        let query = args.join(' ')
        if(!query) return message.reply("you didn't put what you want me to play")
        let player = client.moon.players.create({
     guildId: message.guild.id,
     voiceChannel: message.member.voice.channel.id,
     textChannel: message.channel.id
  }); //creating a player
        if(!player.connected) player.connect() // if the player is not connected it will connect to the voice channel
        let res = await client.moon.search(query) // will do a search on the video informed in the query
        if (res.loadType === "LOAD_FAILED") {
    return message.reply(`:x: Load failed. `); //if there is an error when loading the tracks, it informs that there is an error
  } else if (res.loadType === "NO_MATCHES") {
    return message.reply(`:x: No matches!`); // nothing was found 
  }
        if (res.loadType === 'PLAYLIST_LOADED') {

    for (const track of res.tracks) {
        //if it's a playlist it will merge all the tracks and add it to the queue
        player.queue.add(track);
}
    } else {
    player.queue.add(res.tracks[0]) 
    message.reply('added track in queue')
    }
    if(!player.playing) player.play()
}
    });
client.login('TOKEN') 
```

## 📖 documentation

> Enter the documentation site to understand more about the package, there are many more examples [MoonLink Docs](https://moonlinkjs.netlify.app/)

## 🎨 Suport

> You can get support on our discord server [MoonLink - Support](https://discord.gg/xQq2A8vku3)(Updated)

## 🎓 Contributors

> 1Lucas1.apk, MotoG.js
