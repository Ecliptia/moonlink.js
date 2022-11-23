# 🍄 play

> This function will be make your discord bot play an music in voice

way to use:

```javascript

let player = <client>.<moon>.players.get('GUILD_ID') or player.create
if(!player.connected) player.connect();
let res = await <client>.<moon>.search(query)
//res ifs....
player.queue.add(res.tracks[0])
if(!player.playing) player.play()
<message>.reply(`added track to queue.`)
```

> **Warning** if the bot does not connect to voice channel, will return an error in Lavalink.
