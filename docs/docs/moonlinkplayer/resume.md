# 🎙 resume

> This function will be make your discord bot resume song paused.

way to use: 
```javascript

let player = <client>.<moon>.players.get('GUILD_ID')
if(!player.infos.paused) return <message>.reply(`playee not paused`)
player.resume()
```

> **Note** 
> If your view, in the player infos paused is false.

