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
a code example 
```javascript
let player = <client>.<moon>.players.create({
guildId: message.guild.id,
textChannel: message.channel.id,
voiceChannel: message.member.voice.channel.id,
setDeaf: true,
setMute: true
})
```


> When a new player is created it will call the [MoonlinkPlayer](https://moonlink.js.org/docs/moonlinkplayer) class

> he will return
```javascript

MoonPlayer {
  infos: {
    guildId: '990369410344701964', // All these objects have to return in string, if they come in another type, errors can occur
    voiceChannel: '1012808511949905961', //If this information is blank, post reporting may be a possible error
    textChannel: '991752219634438235',
    playing: true,
    paused: false,
    loop: 1,
    connected: true
  },
  playing: true,
  connected: true,
  current: null, //When it is created there is no track yet, so it will return null
  queue: MoonQueue { guildId: '990369410344701964' },
  filters: MoonFilters {
    guildId: '990369410344701964',
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
guildId: message.guild.id, //string
textChannel: message.channel.id, //string
voiceChannel: message.member.voice.channel.id, //string
setDeaf: true, //boolean (optional)
setMute: false //boolean (optional)
})
```

> he will return
```javascript

MoonPlayer {
  infos: {
    guildId: '990369410344701964', // All these objects have to return in string, if they come in another type, errors can occur
    voiceChannel: '1012808511949905961', //If this information is blank, post reporting may be a possible error
    textChannel: '991752219634438235',
    playing: true,
    paused: false,
    loop: 1,
    connected: true
  },
  playing: true,
  connected: true,
  current: MoonTrack { 
position: 198860,
title: "Billie Eilish - lovely (Lyrics) ft. Khalid",
author: "SyrebralVibes",
thumbnail: "a function"
url: "https://www.youtube.com/watch?v=xirk18P889U",
identifier: "xirk18P889U",
duration: 201000,
isSeekable: true,
track: "QAAAkQIAKkJpbGxpZSBFaWxpc2ggLSBsb3ZlbHkgKEx5cmljcykgZnQuIEtoYWxpZAANU3lyZWJyYWxWaWJlcwAAAAAAAxEoAAt4aXJrMThQODg5VQABACtodHRwczovL3d3dy55b3V0dWJlLmNvbS93YXRjaD92PXhpcmsxOFA4ODlVAAd5b3V0dWJlAAAAAAAAAAA=",
source: "youtube"},
  queue: MoonQueue { guildId: '990369410344701964' },
  filters: MoonFilters {
    guildId: '990369410344701964',
    status: { Object }
  }
}
```
