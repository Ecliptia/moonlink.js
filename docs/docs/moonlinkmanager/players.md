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

> he will return
```javascript

MoonPlayer {
  infos: {
    guildId: String, // All these objects have to return in string, if they come in another type, errors can occur
    voiceChannel: String,
    textChannel: String,
    playing: Boolean | null,
    paused: Boolean | null,
    loop: Boolean | null,
    connected: Boolean | null
  },
  playing: Boolean | null,
  connected: Boolean| null,
  current: Boolean | null,
  queue: MoonQueue { guildId: String /* This will be auto */ },
  filters: MoonFilters {
    guildId: String,
    status: { Object }
  }
}
```
