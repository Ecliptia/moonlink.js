# Moonlink.js Docs 
Welcome to moonlink.js documentation on github, let's clear your doubts in an easy way?
## My player is not switching... What to do?
One of the brief reasons is that you didn't put an updateVoiceState event, an example below ↓
```js
import Discord from 'discord.js'
let client = New Discord.Client(/*config*/)
import { MoonlinkManager } from 'moonlink.js'
client.moon = new MoonlinkManager(/*config*/)

client.on('raw', (data) => {
   client.moon.updateVoiceState(data)
});

```
Or you accidentally misplaced the bot ID, such as using a different bot ID when initializing the package
```js
//🚫
client.moon.init('10000000000000')
//✅
client.moon.init(client.user.id)
```
Or if the player doesn't play, look for support to solve your problem or if it's a bug in the package itself, create an issue so we can fix it!

