# learning to use moonlink.js
Hello world, I am Lucas, one of the developers of this package, I will teach you step by step how to use the package "moonlink.js"

## first step
To start using the package, first we need a support library to use the package, I will use "discord.js"

installation using npmjs
```js
npm install discord.js
```
installation using yarn
```js
yarn add discord.js
```
### Creating a bot client
Well, each developer has their way of programming, so do it the way you know how so you don't complicate your life later. 
Let's create a client
#### COMMONJS
```js
let Discord = require('discord.js')
let client = new Discord.Client(/*config*/)
client.login('Create an application, and create a bot and put the token here')
```
#### ECMASCRIPT
```js
import Discord from 'discord.js'
let client = new Discord.Client(/*config*/)
client.login('Create an application, and create a bot and put the token here')
```
### Installing moonlink.js and configuring 
Now let's install the music pack
Installing using npmjs
```js
npm install moonlink.js
```
Installing using yarn
```js
yarn add moonlink.js
```

### Start login node

#### index.js:
Let's connect the lavalink node.
```js
let Discord = require('discord.js')
let client = new Discord.Client(/*config*/)
client.login('Create an application, and create a bot and put the token here')
let { MoonlinkManager } = require('moonlink.js')

client.moon = new MoonLinkManager([{
   host: 'example.com',
   password: 'mommy long legs',
   port: 1234
}], [{ /*Second node...*/ }], (sPayload, guild) => {
   let guild = client.guilds.cache.get(guild)
    if(!guild) return;
    guild.send(sPayload)
})
```
#### ready.js 
Identifying the client, and run.

Events folder:
```js
module.exports = {
    name: 'ready',
    run: async(client, message) => {
   client.moon.init(client.id) 
   console.log(client.user.tag + ' is online!')
}
}
```
index.js:
```js
client.on('ready', (client, message) {
   client.moon.init(client.id) 
   console.log(client.user.tag + ' is online!')
})
```

#### raw.js
Events folder: 
Sending the discord data json to lavalink.
```js
module.exports = {
   name:'raw',
   run: async(client, data) => {
  client.moon.updateVoiceState(data) 
}
```

index.js:
```js
client.on('ready', (client, data) {
   client.moon.updateVoiceState(data)
})
```
