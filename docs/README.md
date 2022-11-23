---
description: information on how to install and use the package
---
# Imagine a Music
## Moonlink.js

<img src='https://cdn.discordapp.com/attachments/1019979902411350016/1044230708685713438/IMG_20221121_083735.png'></img>
[![Codacy Badge](https://app.codacy.com/project/badge/Grade/7dd9288acdc94dacaa11ad80f36a9bd3)](https://www.codacy.com/gh/1Lucas1apk/moonlink.js/dashboard?utm\_source=github.com\&utm\_medium=referral\&utm\_content=1Lucas1apk/moonlink.js\&utm\_campaign=Badge\_Grade) [![Downloads](https://img.shields.io/npm/dt/moonlink.js.svg?color=3884FF)](https://www.npmjs.com/package/moonlink.js) [![Version](https://img.shields.io/npm/v/moonlink.js.svg?color=3884FF\&label=version)](https://www.npmjs.com/package/moonlink.js) [![install size](https://packagephobia.com/badge?p=moonlink.js)](https://packagephobia.com/result?p=moonlink.js) ![vulnabilites](https://img.shields.io/snyk/vulnerabilities/npm/moonlink.js) ![node](https://img.shields.io/node/v/moonlink.js)

> MoonLink.js is a simple package for lavalink client, perfect for you to create your discord bot with songs, and very simple and easy to use

## 📦 How to install?

```
npm install moonlink.js
yarn add moonlink.js
pnpm install moonlink.js
```
## 📚 document map


## ☃️ How to use?

> An example of how to add nodes and start them

### 🍭 CommonJs

```javascript
let { Client } = require('discord.js')
let { MoonlinkManager } = require('moonlink.js')
let client = new Client(/*options*/)
client.moon = new MoonlinkManager[{ 
       host: 'localhost', //String (Requires)
       port: 443, //Number | String (Optional)
       secure: false, //Boolean (Optional)
       password: '' //String (Optional)
}, /*second node {} */], { 
       shards: 1, // Number (Required)
       clientName: 'moonlink' // String (Optional)
}, (guild, sPayload) => { 
        client.guilds.cache.get(guild).shard.send(JSON.parse(sPayload)) 
})
client.login(/*token*/)
client.on('ready', () => client.moon.init(cliente.user.id))
```

### 🍩 EcmaScript

```javascript
import { Client } from 'discord.js'
import { MoonlinkManager } from 'moonlink.js'
let client = new Client(/*options*/)
client.moon = new MoonlinkManager([{ 
       host: 'localhost', //String (Requires)
       port: 443, //Number | String (Optional)
       secure: false, //Boolean (Optional)
       password: '' //String (Optional)
}, /*second node {} */], { 
       shards: 1, // Number (Required)
       clientName: 'moonlink' // String (Optional)
}, (guild, sPayload) => { 
        client.guilds.cache.get(guild).shard.send(JSON.parse(sPayload)) 
})
client.login(/*token*/)
client.on('ready', () => client.moon.init(cliente.user.id))
```
