---
title: LavaDSPXPlugin
description: "API reference for the LavaDSPXPlugin in Moonlink.js"
icon: 'lucide:sliders'
authors:
  - avatar: https://www.npmjs.com/npm-avatar/eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhdmF0YXJVUkwiOiJodHRwczovL3MuZ3JhdmF2YXRhci5jb20vYXZhdGFyL2E2YTk0NWFhYjJiNzk1MjcyNzVjN2IwMWEyNWM1YzQ2NT9zaXplPTQ5NiZkZWZhdWx0PXJldHJvIn0.5hP6oyShhR-UWUi6KF-lA0cWmE_BJjvIFAwkYCGEZNo
    name: Lucas Morais Rodrigues
    username: 1Lucas1apk
    to: https://github.com/1Lucas1apk
    target: _blank
---

::card{icon="lucide:sliders"}
#title
LavaDSPXPlugin Class

#description
The `LavaDSPXPlugin` integrates with the LavaDSPX Lavalink plugin to provide advanced digital signal processing (DSP) filters. It declares the `lavadspx` capability, enabling the use of filters like HighPass, LowPass (DSPX), Normalization, and Echo.
<br>

::alert{type="info" icon="lucide:info"}
This plugin requires a Lavalink server running the `LavaDSPX` plugin.
::

## Properties

| Property | Type | Description |
|----------|------|-------------|
| `name` | `string` | The name of the plugin: `lavadspx-plugin`. |
| `capabilities` | `string[]` | Declares `lavadspx` capability. |
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
