# Play command
Let go make an play command, will make your discord music bot play a music.
```js
if(command === 'play') {
// Check is a command
if(message.member.voice.channel) return msg.reply(`join a voice channel!`)
// Checking user is in voice channel.
let musicTerm = args.join(' ')
if(!musicTerm) musicTerm = 'how to learn to write?'
// Enter a term of play.
let player = client.moon.players.create({
   textChannel: msg.channel.id,
   voiceChannel: msg.member.voice.channel,
   guildId: msg.guild.id
});
// Creating a player.
let track = await client.moon.search(musicTerm)
//Searching a term
player.queue.add(track.tracks[0])
//BAdding track to queue, After doing everything, let's connect the application to the voice channel and make it play the music.
if(!player.connected) player.connect()
if(!player.infos.playing) player.play()
// Done! Enjoy your bot playing a song on your server's voice channel, if bugs or errors please report. 
msg.reply(`playing Ꮚ˘ ꈊ ˘ Ꮚ`)
```
}



#### Keep seeing more functions... [pause](https://github.com/1Lucas1apk/moonlink.js/docs/pause.md) thanks for viewning this docs ;)
