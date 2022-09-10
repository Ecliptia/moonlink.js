# 🏞 example commands
> these examples are made using the previous code base

Everything from moonlink.js was made to be as easy and fast as possible
### ⏸️ Pause

```javascript
if(!client.moon.players.has(message.guild.id)) return message.reply(`:x: no has an player created in guild **${message.guild.name}**.`)
     let player = client.moon.players.get(message.guild.id)
     if(player.infos.paused) return message.reply(`:x: player already is paused.`)
     player.pause()
     message.reply(`player is paused.`)
```

### ⏯️ Resume

```javascript
if(!client.moon.players.has(message.guild.id)) return message.reply(`:x: no has an player created in guild **${message.guild.name}**.`)
     let player = client.moon.players.get(message.guild.id)
     if(!true) return message.reply(`:x: player is not paused.`)
     player.resume()
     message.reply(`player is no paused.`)
```

> More examples coming soon
