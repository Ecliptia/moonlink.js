# 🎶 MoonLink.js
<img src='https://media.discordapp.net/attachments/960186492653813862/978653257180254258/IMG_20220523_203520.png'></img>

> MoonLink.js is a simple package for lavalink client, perfect for you to create your discord bot with songs, and very simple and easy to use
## 📦 How to install
##### NpmJs
```js
npm install moonlink.js
```
##### Yarn
```js
yarn add moonlink.js
```
## 🎲 Requirements
> Requirements are, have a node above version `1.16 >==`
support packages
- [x] discord.js
- [x] eris

## 📚 How to use
> After you have installed the package, you first have to connect the nodes, as in the example below
##### CommonJs
```js
let { Client } = require('discord.js')
let client = new Client({
     intents: 32767
})
let { MoonlinkManager }= require('moonlink.js')
client.MoonLink = new MoonlinkManager([{
   host: 'localhost', //String (required)
   password: 'password', //String (optional)
   port: 443 //Number (optional)
}], { shards: 1}, (guildId, sPayload) => {
   let guild = client.guilds.cache.get(guildId)
   if(guild) {
   guild.shards.send(sPayload)
   }
})
```
##### ECMAScript
```js
import { Client } from 'discord.js'
let client = new Client({
     intents: 32767
})
import { MoonlinkManager } from 'moonlink.js'
client.MoonLink = new MoonlinkManager([{
   host: 'localhost', //String (required)
   password: 'password', //String (optional)
   port: 443 //Number (optional)
}], { shards: 1}, (guildId, sPayload) => {
   let guild = client.guilds.cache.get(guildId)
   if(guild) {
   guild.shards.send(sPayload)
   }
})
```
## 🐌 start the client 
> After we have connected the nodes, let's initialize the client 
```js
client.MoonLink.init(client.user.id)
```
`client.user.id` is mandatory for the package to work correctly 
## 📖 documentation 
> Enter the documentation site to understand more about the package, there are many more examples 
[MoonLink Docs](https://moonlinkjs.tk)
## 🎨 Suport 
> You can get support on our discord server 
[MoonLink - Suport](https://discord.gg/Gv8uxApUUY)
## 🎓 Contributors 
> 1Lucas1.apk

> MotoG.js

