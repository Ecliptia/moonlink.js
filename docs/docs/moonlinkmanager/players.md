# 🪗 players

> Players is a class that has four functions (create, get, all, edit, has)

## ☄️ create

> The create function will create a new player in the package map

```javascript
let player = <client>.<moon>.players.create({
guildId: String,
textChannel: String,
voiceChannel: String,
setDeaf: Boolean,
setMute: Boolean
})
```

> When a new player is created it will call the [MoonlinkPlayer](https://moonlink.js.org/docs/moonlinkplayer) class

