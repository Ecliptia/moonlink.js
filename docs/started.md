## 🍪 Getting started
> An example of a bot made with the discord.js library
```javascript
const { Client } = require('discord.js') //importing discord.js library
const { MoonlinkManager } = require('moonlink.js') // importing moonlink.js package 
const client = new Client({
    intents: 131071
}) //creating a client for the bot 
//------- (package configuration) ----------//
client.moon = new MoonlinkManager([{ 
    host: 'localhost', 
    port: 443, 
    secure: false, 
    password: 'moon'
}], { shards: 1 }, (guild, sPayload) => { 
client.guilds.cache.get(guild).shard.send(JSON.parse(sPayload))
    })
client.moon.on('nodeCreate', (node) => console.log('connected')) //emit to the console the node was connected to 
client.moon.on('trackStart', async(player, track) => {
    client.channels.cache.get(player.textChannel).send(`${track.title} is playing now`) //when the player starts it will send a message to the channel where the command was executed
})
client.moon.on('trackEnd', async(player, track) => {
    client.channels.cache.get(player.textChannel).send(`track is over`) //when the player starts it will send a message to the channel where the command was executed
})
client.on('ready', () => {
 client.moon.init(client.user.id); //initializing the package
});
client.on('raw', (data) => {
    client.moon.updateVoiceState(data) //this will send to the package the information needed for the package to work properly 
})
const prefix = '?'
client.on('messageCreate', async(message) => {
    
    if(message.author.bot) return; // if the message is from a bot just ignore it
       if(!message.content.startsWith(prefix)) return; //if content doesn't start with the prefix, make it ignore 
    let args = message.content.slice(prefix.length).trim().split(/ +/g); 
    let cmd = args.shift().toLowerCase();
    if(cmd === 'play') {
   if(!message.member.voice.channel) return message.reply(`you are not on a voice channel`) 
        let query = args.join(' ')
        if(!query) return message.reply("you didn't put what you want me to play")
        let player = client.moon.players.create({
     guildId: message.guild.id,
     voiceChannel: message.member.voice.channel.id,
     textChannel: message.channel.id
  }); //creating a player
        if(!player.connected) player.connect() // if the player is not connected it will connect to the voice channel
        let res = await client.moon.search(query) // will do a search on the video informed in the query
        if (res.loadType === "LOAD_FAILED") {
    return message.reply(`:x: Load failed. `); //if there is an error when loading the tracks, it informs that there is an error
  } else if (res.loadType === "NO_MATCHES") {
    return message.reply(`:x: No matches!`); // nothing was found 
  }
        if (res.loadType === 'PLAYLIST_LOADED') {

    for (const track of res.tracks) {
        //if it's a playlist it will merge all the tracks and add it to the queue
        player.queue.add(track);
}
    } else {
        player.queue.add(res.tracks[0]) 
 if(!player.playing) player.play()
  message.reply('added track in queue')
    }
}
    });
client.login('TOKEN') 
```
> This code will be updated in all new moonlink.js updates
