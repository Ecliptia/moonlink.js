---
title: LavaSrcPlugin
description: "API reference for the LavaSrcPlugin in Moonlink.js"
icon: 'lucide:music'
authors:
  - avatar: https://www.npmjs.com/npm-avatar/eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhdmF0YXJVUkwiOiJodHRwczovL3MuZ3JhdmF2YXRhci5jb20vYXZhdGFyL2E2YTk0NWFhYjJiNzk1MjcyNzVjN2IwMWEyNWM1YzQ2NT9zaXplPTQ5NiZkZWZhdWx0PXJldHJvIn0.5hP6oyShhR-UWUi6KF-lA0cWmE_BJjvIFAwkYCGEZNo
    name: Lucas Morais Rodrigues
    username: 1Lucas1apk
    to: https://github.com/1Lucas1apk
    target: _blank
---

::card{icon="lucide:music"}
#title
LavaSrcPlugin Class

#description
The `LavaSrcPlugin` integrates with the LavaSrc Lavalink plugin to provide support for various music sources like Spotify, Apple Music, Deezer, Yandex Music, VK Music, Tidal, and Qobuz. It declares a wide range of search and direct capabilities for these sources.
<br>

::alert{type="info" icon="lucide:info"}
This plugin requires a Lavalink server running the `LavaSrc` plugin.
::

## Properties

| Property | Type | Description |
|----------|------|-------------|
| `name` | `string` | The name of the plugin: `lavasrc-plugin`. |
| `capabilities` | `string[]` | Declares various search and direct capabilities for supported sources. |

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
  Initializes the plugin for a given node. This plugin primarily declares capabilities and does not require complex initialization.
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
  Cleans up plugin resources. This plugin does not require complex cleanup.
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

#### onNodeInfoUpdate
::field{name="onNodeInfoUpdate" type="method"}
::stack
  ::card
  ---
  icon: 'lucide:info'
  ---
  #title
  On Node Info Update

  #description
  Called when the associated node's information is updated. This method logs debug information about the node update.
  <br>
  <h5>Parameters</h5>

  ::field-group
    ::field{name="node" type="Node" required}
    The node instance whose information has been updated.
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
