# 🍨 connect

> Will connect the discord bot on voice channel.
way to use:

```javascript

let player = <client>.<moon>.players.get('GUILD_ID');
if(!<player>.connected) <player>.connect(); or if(!<player>.connected) <player>.connect({ selfDean: boolean, selfMute: boolean })
```


> **Warning**
> If unable to send a request the guild will return an error
