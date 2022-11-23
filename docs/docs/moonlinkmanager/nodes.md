# ⚜ nodes
> information about nodes
### 📦 Get
This function will get information about name, ws, status among others
```javascript
client.moon.nodes.get(0)
//this will get the information from the first node that is saved
//If you want to specify which node
client.moon.nodes.get({ node: 'lavalink.moon.exemple', port: 1234 })
```
An example is getting node status
```javascript
client.moon.nodes.get(client.moon.nodesinfos[0]).stats
```
Will return
```javascript
{
  playingPlayers: 0,
  op: 'stats',
  memory: [Object],
  players: 2,
  cpu: [Object],
  uptime: 3091990198
}
```
### 🎈 ALL
This will return all node information

a return example
```javascript
[ 'localhost:443': [Object] ]
```
Inside the object has information about ws, status and others
