---
title: LavaLyricsPlugin
description: "API reference for the LavaLyricsPlugin in Moonlink.js"
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
LavaLyricsPlugin Class

#description
The `LavaLyricsPlugin` integrates with the LavaLyrics Lavalink plugin to provide lyrics fetching and live lyrics subscription capabilities. It supports fetching lyrics for the current track or a specific encoded track.
<br>

::alert{type="info" icon="lucide:info"}
This plugin requires a Lavalink server running the `LavaLyrics` plugin.
::

## Properties

| Property | Type | Description |
|----------|------|-------------|
| `name` | `string` | The name of the plugin: `lavalyrics-plugin`. |
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
  Cleans up plugin resources.
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

#### getLyricsForTrack
::field{name="getLyricsForTrack" type="method"}
::stack
  ::card
  ---
  icon: 'lucide:file-text'
  ---
  #title
  Get Lyrics for Track

  #description
  Fetches lyrics for a specific encoded track.
  <br>
  <h5>Parameters</h5>

  ::field-group
    ::field{name="encodedTrack" type="string" required}
    The base64 encoded track string.
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
  const lyrics = await plugin.getLyricsForTrack('base64EncodedTrack');
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
  Subscribes to live lyrics updates for a specific guild.
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
  await plugin.subscribeToLiveLyrics('123456789');
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
  await plugin.unsubscribeFromLiveLyrics('123456789');
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
  plugin.registerLyricsCallback('123456789', (line) => console.log(line.line));
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
  plugin.unregisterLyricsCallback('123456789');
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
