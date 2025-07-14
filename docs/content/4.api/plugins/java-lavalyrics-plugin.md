---
title: JavaLavaLyricsPlugin
description: "API reference for the JavaLavaLyricsPlugin in Moonlink.js"
icon: 'lucide:file-text'
authors:
  - avatar: https://www.npmjs.com/npm-avatar/eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhdmF0YXJVUkwiOiJodHRwczovL3MuZ3JhdmF2YXRhci5jb20vYXZhdGFyL2E2YTk0NWFhYjJiNzk1MjcyNzVjN2IwMWEyNWM1YzQ2NT9zaXplPTQ5NiZkZWZhdWx0PXJldHJvIn0.5hP6oyShhR-UWUi6KF-lA0cWmE_BJjvIFAwkYCGEZNo
    name: Lucas Morais Rodrigues
    username: 1Lucas1apk
    to: https://github.com/1Lucas1apk
    target: _blank
---

::card{icon="lucide:file-text"}
#title
JavaLavaLyricsPlugin Class

#description
The `JavaLavaLyricsPlugin` integrates with the Java LavaLyrics Lavalink plugin to provide advanced lyrics fetching and live lyrics subscription capabilities. It supports searching for lyrics by query or video ID, and fetching lyrics for the currently playing track.
<br>

::alert{type="info" icon="lucide:info"}
This plugin requires a Lavalink server running the `Java LavaLyrics` plugin.
::

## Properties

| Property | Type | Description |
|----------|------|-------------|
| `name` | `string` | The name of the plugin: `java-lavalyrics`. |
| `capabilities` | `string[]` | Declares `lavalyrics` capability. |
| `node` | `Node` | The associated Node instance. |

## Methods

#### load
::field{name="load" type="method"}
::stack
  ::card
  ---
  icon: 'lucide:download'
  ---
  #title
  Load Plugin

  #description
  Initializes the plugin for a given node.
  <br>
  <h5>Parameters</h5>

  ::field-group
    ::field{name="node" type="Node" required}
    The node instance.
    ::
  ::
  ::

  ::card
  #title
  Returns & Example

  #description
  **Returns**
  • **`void`**

  ```js
  // Called internally by PluginManager
  ```
  ::
::
::

#### unload
::field{name="unload" type="method"}
::stack
  ::card
  ---
  icon: 'lucide:upload'
  ---
  #title
  Unload Plugin

  #description
  Cleans up plugin resources, including clearing caches and timeouts.
  <br>
  <h5>Parameters</h5>

  ::field-group
    ::field{name="node" type="Node" required}
    The node instance.
    ::
  ::
  ::

  ::card
  #title
  Returns & Example

  #description
  **Returns**
  • **`void`**

  ```js
  // Called internally by PluginManager
  ```
  ::
::
::

#### onTrackEnd
::field{name="onTrackEnd" type="method"}
::stack
  ::card
  ---
  icon: 'lucide:music-off'
  ---
  #title
  On Track End

  #description
  Handles cleanup for live lyrics subscriptions when a track ends.
  <br>
  <h5>Parameters</h5>

  ::field-group
    ::field{name="player" type="Player" required}
    The player instance.
    ::
  ::
  ::

  ::card
  #title
  Returns & Example

  #description
  **Returns**
  • **`void`**

  ```js
  // Called internally by Node when a track ends
  ```
  ::
::
::

#### search
::field{name="search" type="method"}
::stack
  ::card
  ---
  icon: 'lucide:search'
  ---
  #title
  Search Lyrics

  #description
  Searches for lyrics based on a query.
  <br>
  <h5>Parameters</h5>

  ::field-group
    ::field{name="query" type="string" required}
    The search query.
    ::
    ::field{name="source" type="string"}
    Optional: The source to search within.
    ::
  ::
  ::

  ::card
  #title
  Returns & Example

  #description
  **Returns**
  • **`Promise<any[]>`** — An array of search results.

  ```js
  const results = await plugin.search('Never Gonna Give You Up');
  ```
  ::
::
::

#### getLyricsByVideoId
::field{name="getLyricsByVideoId" type="method"}
::stack
  ::card
  ---
  icon: 'lucide:youtube'
  ---
  #title
  Get Lyrics by Video ID

  #description
  Fetches lyrics for a YouTube video by its ID.
  <br>
  <h5>Parameters</h5>

  ::field-group
    ::field{name="videoId" type="string" required}
    The YouTube video ID.
    ::
  ::
  ::

  ::card
  #title
  Returns & Example

  #description
  **Returns**
  • **`Promise<ILavaLyricsObject | null>`** — Lyrics data or `null` if not found.

  ```js
  const lyrics = await plugin.getLyricsByVideoId('dQw4w9WgXcQ');
  ```
  ::
::
::

#### getLyricsForCurrentTrack
::field{name="getLyricsForCurrentTrack" type="method"}
::stack
  ::card
  ---
  icon: 'lucide:music'
  ---
  #title
  Get Lyrics for Current Track

  #description
  Fetches lyrics for the currently playing track of a specific player.
  <br>
  <h5>Parameters</h5>

  ::field-group
    ::field{name="guildId" type="string" required}
    The ID of the guild.
    ::
    ::field{name="skipTrackSource" type="boolean"}
    Optional: Whether to skip the track's original source when searching for lyrics.
    ::
  ::
  ::

  ::card
  #title
  Returns & Example

  #description
  **Returns**
  • **`Promise<ILavaLyricsObject | null>`** — Lyrics data or `null` if not found.

  ```js
  const lyrics = await plugin.getLyricsForCurrentTrack('123456789');
  ```
  ::
::
::

#### getStaticLyricsForTrack
::field{name="getStaticLyricsForTrack" type="method"}
::stack
  ::card
  ---
  icon: 'lucide:file-text'
  ---
  #title
  Get Static Lyrics for Track

  #description
  Attempts to find static (un-timed) lyrics for the currently playing track by searching with a cleaned track title.
  <br>
  <h5>Parameters</h5>

  ::field-group
    ::field{name="guildId" type="string" required}
    The ID of the guild.
    ::
  ::
  ::

  ::card
  #title
  Returns & Example

  #description
  **Returns**
  • **`Promise<ILavaLyricsObject | null>`** — Lyrics data or `null` if not found.

  ```js
  const staticLyrics = await plugin.getStaticLyricsForTrack('123456789');
  ```
  ::
::
::

#### subscribeToLiveLyrics
::field{name="subscribeToLiveLyrics" type="method"}
::stack
  ::card
  ---
  icon: 'lucide:message-square'
  ---
  #title
  Subscribe to Live Lyrics

  #description
  Subscribes to live lyrics updates for a specific guild. The plugin will schedule callbacks based on track position.
  <br>
  <h5>Parameters</h5>

  ::field-group
    ::field{name="guildId" type="string" required}
    The ID of the guild.
    ::
    ::field{name="skipTrackSource" type="boolean"}
    Optional: Whether to skip the track's original source when searching for lyrics.
    ::
  ::
  ::

  ::card
  #title
  Returns & Example

  #description
  **Returns**
  • **`Promise<void>`**

  ```js
  // Called internally by Manager.subscribeLyrics
  ```
  ::
::
::

#### unsubscribeFromLiveLyrics
::field{name="unsubscribeFromLiveLyrics" type="method"}
::stack
  ::card
  ---
  icon: 'lucide:message-square-off'
  ---
  #title
  Unsubscribe from Live Lyrics

  #description
  Unsubscribes from live lyrics updates for a specific guild.
  <br>
  <h5>Parameters</h5>

  ::field-group
    ::field{name="guildId" type="string" required}
    The ID of the guild.
    ::
  ::
  ::

  ::card
  #title
  Returns & Example

  #description
  **Returns**
  • **`Promise<void>`**

  ```js
  // Called internally by Manager.unsubscribeLyrics
  ```
  ::
::
::

#### registerLyricsCallback
::field{name="registerLyricsCallback" type="method"}
::stack
  ::card
  ---
  icon: 'lucide:check-circle'
  ---
  #title
  Register Lyrics Callback

  #description
  Registers a callback function to receive live lyrics line updates for a specific guild.
  <br>
  <h5>Parameters</h5>

  ::field-group
    ::field{name="guildId" type="string" required}
    The ID of the guild.
    ::
    ::field{name="callback" type="(line: ILavaLyricsLine) => void" required}
    The callback function to invoke with each lyrics line.
    ::
  ::
  ::

  ::card
  #title
  Returns & Example

  #description
  **Returns**
  • **`void`**

  ```js
  // Called internally by Manager.subscribeLyrics
  ```
  ::
::
::

#### unregisterLyricsCallback
::field{name="unregisterLyricsCallback" type="method"}
::stack
  ::card
  ---
  icon: 'lucide:x-circle'
  ---
  #title
  Unregister Lyrics Callback

  #description
  Unregisters the lyrics callback function for a specific guild.
  <br>
  <h5>Parameters</h5>

  ::field-group
    ::field{name="guildId" type="string" required}
    The ID of the guild.
    ::
  ::
  ::

  ::card
  #title
  Returns & Example

  #description
  **Returns**
  • **`void`**

  ```js
  // Called internally by Manager.unsubscribeLyrics
  ```
  ::
::
::

#### handleEvent
::field{name="handleEvent" type="method"}
::stack
  ::card
  ---
  icon: 'lucide:zap'
  ---
  #title
  Handle Event

  #description
  Handles incoming events from the Lavalink node related to lyrics. This method is called internally by the Node.
  <br>
  <h5>Parameters</h5>

  ::field-group
    ::field{name="node" type="Node" required}
    The node instance.
    ::
    ::field{name="payload" type="any" required}
    The event payload from Lavalink.
    ::
  ::
  ::

  ::card
  #title
  Returns & Example

  #description
  **Returns**
  • **`void`**

  ```js
  // Called internally by Node
  ```
  ::
::
::
