# Pause command
Let's make a command to make the player pause.
```js
if(command === 'pause') {
// Checking is command
if(!message.member.voice.channel) return msg.reply(`join in voice channel!`)
// Checking user is on voice channel.
if(!client.moon.players.has(msg.guild.id)) return msg.reply(`No Players created in this guild.`)
// Checking has player in guild
let player = client.moon.players.get(msg.guild.id)
player.pause()
msg.reply(`paused music`)
}
// Done! Your player's pause on your execute your command bot, 
```
#### keeping more functions... [resume](https://github.com/1Lucas1apk/moonlink.js/edit/master/docs/pause.md) thanks for viewning this docs ;)
