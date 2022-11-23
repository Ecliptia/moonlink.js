# ✨ search

> The function of search is to search for videos on YouTube with her name mode of use:

```javascript
await <client>.<moon>.search('background music')
// Other sources
await <client>.<moon>.search('background music', 'name_source')
// other forms
await <client>.<moon>.search({ query: 'background music', source: 'ytmusic' })
// This requires await because it returns a promise
// The search option has to be in string format 
```

> when you use this function it returns an object

```javascript
promise {
  loadType: '',
  playlistInfo: { Object },
  tracks: [ Object ]
}
```

loadType:

```javascript
SEARCH_RESULT // That's when search results are found
TRACK_LOADED // When a track is loaded
PLAYLIST_LOADED // That's when it's a playlist
LOAD_FAILED // When search is loading but fails 
NO_MATCHES // When nothing is found
```

playlistInfo:

```javascript
{ 
name: String,
selectedTrack: Number
}
```

tracks:

```javascript
[
    {
      track: String,
      identifier: String,
      isSeekable: Boolean,
      author: String,
      duration: Number,
      isStream: Boolean,
      position: Number,
      title: String,
      url: String,
      source: String 
    },
    ...
]
```

> for more information https://github.com/freyacodes/Lavalink/blob/master/IMPLEMENTATION.md
