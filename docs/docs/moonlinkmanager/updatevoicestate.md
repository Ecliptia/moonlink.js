# 🦎 updateVoiceState
> it will receive events that discord emits to your bot, and get information on these data to make connections from lavalink to discord 
```javascript
client.on('raw', (data) => {
<client>.<moon>.updateVoiceState(data)
}
```
If your bot does not play music, one of the probable errors could be this
