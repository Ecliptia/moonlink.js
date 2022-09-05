# 🪗 players

> Players is a class that has four functions (create, get, all, edit, has)

## ⛰️ create

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
  current: Object | null ,
  queue: MoonQueue { guildId: String /* This will be auto */ },
  filters: MoonFilters {
    guildId: String,
    status: { Object }
  }
}
```
## 🍪 get
> this is to get information from the player or use the functions of this play
way to use:
```javascript
let player = <cliente>.<moon>.players.get('/* Server ID */')
```
> this will return the same information as create and also called the MoonlinkPlayer class 

> If the player does not exist, it will return undefined 
## 🍫 all
> This will return all players from the package database 
```javascript
Object
```

## 🍩 has

> Check if a server player exists
way to use:
```javascript
<client>.<moon>.players.has(' /* Server ID */ ')
```
This can return: false or true

## 📍 edit

> it will edit player information for example textChannel, voiceChannel, guildId, etc.
way to use:
```javascript

<client>.<moon>.players.edit({
guildId: String,
textChannel: String,
voiceChannel: String,
setDeaf: Boolean,
setMute: Boolean
})
```

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
  current: Object | null,
  queue: MoonQueue { guildId: String /* This will be auto */ },
  filters: MoonFilters {
    guildId: String,
    status: { Object }
  }
}
```
