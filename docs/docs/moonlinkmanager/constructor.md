# ☄️ Constructor 

### login a node:
> all MoonlinkManager types and functions class functions
```javascript
import { Client } from 'discord.js'
import { MoonlinkManager } from 'moonlink.js'
let client = new Client(/*options*/)
client.moon = new MoonlinkManager[{ 
       host: 'localhost', //String (Requires)
       port: 443, //Number | String (Optional)
       secure: false, //Boolean (Optional)
       password: '' //String (Optional)
}, /*second node {} */], { 
       shards: 1, // Number (Required)
       clientName: 'moonlink' // String (Optional)
}, (guild, sPayload) => { 
        client.guilds.cache.get(guild).shard.send(JSON.parse(sPayload)) 
})
client.login(/*token*/)
```

### Collect events:
> This will collect the events that moonlink emits.
```javascript
client.moon.on('nodeCreate', (node) => {
     console.log(node.host + ' has been connected')
});
```

### starting client:
> You will start MoonLink with the client.
```javascript
client.on('ready', (client) => {
   console.log(client.user.tag + ' was Initialized 
')
   client.moon.init(client.user.id)
});
```
