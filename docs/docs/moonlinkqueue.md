# 🎼 MoonlinkQueue

> This is the class where it comes into play The queue is separated by the servers id, this is automatically filled

## ⛰️ Add

> way to use

```javascript
let player = <client>.<moon>.players.create(/*options*/) // This also works with the get function
player.queue.add(/*track*/) // This will add the track to the queue
// these tracks are saved in database.json, a local database that only takes up disk memory space
```

## 🌋 All

> way to use

```javascript
[{\*track_1\*}, {\*Other tracks if any\*}]
```

## 🎒 Size

> It will return the total number of tracks that are in the queue

```javascript
let player = <client>.<moon>.players.create(/*options*/) // It also works with get
player.queue.size
```

will return number
