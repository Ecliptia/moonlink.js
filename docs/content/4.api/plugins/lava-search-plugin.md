---
title: LavaSearchPlugin
description: "API reference for the LavaSearchPlugin in Moonlink.js"
icon: 'lucide:search'
authors:
  - avatar: https://www.npmjs.com/npm-avatar/eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhdmF0YXJVUkwiOiJodHRwczovL3MuZ3JhdmF2YXRhci5jb20vYXZhdGFyL2E2YTk0NWFhYjJiNzk1MjcyNzVjN2IwMWEyNWM1YzQ2NT9zaXplPTQ5NiZkZWZhdWx0PXJldHJvIn0.5hP6oyShhR-UWUi6KF-lA0cWmE_BJjvIFAwkYCGEZNo
    name: Lucas Morais Rodrigues
    username: 1Lucas1apk
    to: https://github.com/1Lucas1apk
    target: _blank
---

::card{icon="lucide:search"}
#title
LavaSearchPlugin Class

#description
The `LavaSearchPlugin` integrates with the LavaSearch Lavalink plugin to provide advanced search capabilities. It allows searching for various content types like tracks, albums, artists, playlists, and text.
<br>

::alert{type="info" icon="lucide:info"}
This plugin requires a Lavalink server running the `LavaSearch` plugin.
::

## Properties

| Property | Type | Description |
|----------|------|-------------|
| `name` | `string` | The name of the plugin: `lavasearch-plugin`. |
| `capabilities` | `string[]` | Declares `lavasearch` capability. |
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

#### search
::field{name="search" type="method"}
::stack
  ::card
  ---
  icon: 'lucide:search'
  ---
  #title
  Perform LavaSearch

  #description
  Performs a search using the LavaSearch API, supporting various content types.
  <br>
  <h5>Parameters</h5>

  ::field-group
    ::field{name="query" type="string" required}
    The search query.
    ::
    ::field{name="options" type="Object"}
    Search options.
    ::
    ::field{name="options.source" type="string"}
    Optional: The source to search within (e.g., `youtube`, `spotify`).
    ::
    ::field{name="options.types" type="string"}
    Optional: Comma-separated string of result types to return (e.g., `track,album,artist`). Defaults to `track,album,artist,playlist,text`.
    ::
  ::
  ::

  ::card
  #title
  Returns & Example

  #description
  **Returns**
  • **`Promise<ILavaSearchResultData>`** — The search results data.

  ```js
  const results = await plugin.search('Never Gonna Give You Up', { types: 'track,artist' });
  console.log(results.tracks);
  console.log(results.artists);
  ```
  ::
::
::
