# 🎯 Constructor
> MoonlinkManager is a class, and its constructor has three objects (nodes, options, sPayload)
## 🌋 Nodes, What is it and what is it for?
> The nodes option is an array with information about your lavalink to make the connection, Her options are
```javascript
{[{
host: String,
port: Number | String, //optional
password: String, //optional
secure: Boolean //optional
}], [/*another node*/]}
```
## 📍 Options
> The options are additional options that you can use, like in lavalink login you want to put the name of your bot logged in instead of the package name
```javascript
 { 
clientName: 'moon-bot', //String (optional)
shards: 2, //Number | String (optional)
// More options to be added 
 }
```
## 📎 sPayload, What is it for and what does it do?
> sPayload is a function, it makes package requirements for the support package to connect, disconnect, mute and so on.
```javascript
(guildId, sPayload) => {
let guild = client.guilds.cache.get(guildId)
if(guild) { // The package will send the requested guild
   guild.shard.send(sPayload) //This will require discord to connect the bot to the voice channel
  }
}
```
