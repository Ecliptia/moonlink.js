---
title: SponsorBlockPlugin
description: "API reference for the SponsorBlockPlugin in Moonlink.js"
icon: 'lucide:shield-check'
authors:
  - avatar: https://www.npmjs.com/npm-avatar/eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhdmF0YXJVUkwiOiJodHRwczovL3MuZ3JhdmF2YXRhci5jb20vYXZhdGFyL2E2YTk0NWFhYjJiNzk1MjcyNzVjN2IwMWEyNWM1YzQ2NT9zaXplPTQ5NiZkZWZhdWx0PXJldHJvIn0.5hP6oyShhR-UWUi6KF-lA0cWmE_BJjvIFAwkYCGEZNo
    name: Lucas Morais Rodrigues
    username: 1Lucas1apk
    to: https://github.com/1Lucas1apk
    target: _blank
---

::card{icon="lucide:shield-check"}
#title
SponsorBlockPlugin Class

#description
The `SponsorBlockPlugin` integrates with the SponsorBlock Lavalink plugin to provide functionality for skipping sponsored segments in YouTube videos. It also handles loading and starting chapters.
<br>

::alert{type="info" icon="lucide:info"}
This plugin requires a Lavalink server running the `SponsorBlock` plugin.
::

## Properties

| Property | Type | Description |
|----------|------|-------------|
| `name` | `string` | The name of the plugin: `sponsorblock-plugin`. |
| `capabilities` | `string[]` | Currently empty, but can declare capabilities related to SponsorBlock. |
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

#### getCategories
::field{name="getCategories" type="method"}
::stack
  ::card
  ---
  icon: 'lucide:list'
  ---
  #title
  Get Categories

  #description
  Retrieves the currently configured SponsorBlock categories for a guild.
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
  • **`Promise<string[]>`** — An array of category strings.

  ```js
  const categories = await plugin.getCategories('123456789');
  console.log('SponsorBlock Categories:', categories);
  ```
  ::
::
::

#### setCategories
::field{name="setCategories" type="method"}
::stack
  ::card
  ---
  icon: 'lucide:settings'
  ---
  #title
  Set Categories

  #description
  Sets the SponsorBlock categories for a guild.
  <br>
  <h5>Parameters</h5>

  ::field-group
    ::field{name="guildId" type="string" required}
    The ID of the guild.
    ::
    ::field{name="categories" type="string[]" required}
    An array of category strings to set.
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
  await plugin.setCategories('123456789', ['sponsor', 'selfpromo']);
  ```
  ::
::
::

#### clearCategories
::field{name="clearCategories" type="method"}
::stack
  ::card
  ---
  icon: 'lucide:eraser'
  ---
  #title
  Clear Categories

  #description
  Clears all configured SponsorBlock categories for a guild.
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
  await plugin.clearCategories('123456789');
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
  Handles incoming events from the Lavalink node related to SponsorBlock. This method is called internally by the Node.
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
