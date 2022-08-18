# MoonLink.js

[![NPM](https://nodei.co/npm/moonlink.js.png)](\[https:/nodei.co/npm/moonlink.js) 
[![Codacy Badge](https://app.codacy.com/project/badge/Grade/7dd9288acdc94dacaa11ad80f36a9bd3)](https://www.codacy.com/gh/1Lucas1apk/moonlink.js/dashboard?utm\_source=github.com\&utm\_medium=referral\&utm\_content=1Lucas1apk/moonlink.js\&utm\_campaign=Badge\_Grade) [![Downloads](https://img.shields.io/npm/dt/moonlink.js.svg?color=3884FF)](https://www.npmjs.com/package/moonlink.js) [![Version](https://img.shields.io/npm/v/moonlink.js.svg?color=3884FF\&label=version)](https://www.npmjs.com/package/moonlink.js) [![install size](https://packagephobia.com/badge?p=moonlink.js)](https://packagephobia.com/result?p=moonlink.js) ![vulnabilites](https://img.shields.io/snyk/vulnerabilities/npm/moonlink.js) ![node](https://img.shields.io/node/v/moonlink.js)

> MoonLink.js is a simple package for lavalink client, perfect for you to create your discord bot with songs, and very simple and easy to use

## 📦 How to install

**NpmJs**

```js
npm install moonlink.js
```

**Yarn**

```js
yarn add moonlink.js
```

## 🎲 Requirements

> Requirements are, have a node above version `1.16 >==` support packages

* [x] discord.js
* [x] eris

## 📚 How to use

> After you have installed the package, you first have to connect the nodes, as in the example below

**CommonJs**

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

**ECMAScript**

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

> Enter the documentation site to understand more about the package, there are many more examples [MoonLink Docs](https://moonlinkjs.tk)

## 🎨 Suport

> You can get support on our discord server [MoonLink - Suport](https://discord.gg/Gv8uxApUUY)

## 🎓 Contributors

> 1Lucas1.apk

> MotoG.js
