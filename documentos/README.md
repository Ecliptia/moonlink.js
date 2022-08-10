# Moonlink.js Docs 
Welcome to moonlink.js documentation on github, let's clear your doubts in an easy way
## Does moonlink support CommonJs?
Yes it has support for CommonJs and ECMAScript 
```js
const { MoonlinkManager } = require('moonlink.js')
```
```js
import { MoonlinkManager } from 'moonlink.js'
```
## My bot doesn't want to play, what do I do?
One of the brief reasons is that you didn't put an updateVoiceState event, an example below ↓
```js
import Discord from 'discord.js'
let client = new Discord.Client(/*config*/)
import { MoonlinkManager } from 'moonlink.js'
client.moon = new MoonlinkManager(/*config*/)

client.on('raw', (data) => {
   client.moon.updateVoiceState(data)
});

```
Or you accidentally misplaced the bot ID causing the system not to find the information needed to make it ring a voice channel:
```js
//🚫
client.moon.init('10000000000000')
//✅
client.moon.init(client.user.id)
```
Or unintentionally you used a different ID from your bot, making the package not work correctly

## Links to example commands or events 
