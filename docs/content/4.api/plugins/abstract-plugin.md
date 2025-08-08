---
title: PluginManager
description: "API reference for the PluginManager class in Moonlink.js"
icon: 'lucide:puzzle'
authors:
  - avatar: https://www.npmjs.com/npm-avatar/eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhdmF0YXJVUkwiOiJodHRwczovL3MuZ3JhdmF0YXIuY29tL2F2YXRhci9hNmE5NDVhYjJiNzk1MjcyNzVjN2IwMWEyNWM1YzQ2NT9zaXplPTQ5NiZkZWZhdWx0PXJldHJvIn0.5hP6oyShhR-UWUi6KF-lA0cWmE_BJjvIFAwkYCGEZNo
    name: Lucas Morais Rodrigues
    username: 1Lucas1apk
    to: https://github.com/1Lucas1apk
    target: _blank
---

::card{icon="lucide:puzzle"}
#title
AbstractPlugin Class

#description
The `AbstractPlugin` class serves as the base for all Moonlink.js plugins. It defines the essential structure and lifecycle methods that concrete plugin implementations must adhere to.
<br>

::alert{type="info" icon="lucide:info"}
This is an abstract class and cannot be instantiated directly. You must extend it to create your own custom plugins.
::

## Properties

| Property | Type | Description |
|----------|------|-------------|
| `name` | `string` | The unique name of the plugin. |
| `capabilities` | `string[]` | An array of capabilities provided by this plugin (e.g., `"lavadspx"`, `"search:spotify"`). |

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
  Called when the plugin is loaded for a specific node. This method should contain the plugin's initialization logic.
  <br>
  <h5>Parameters</h5>

  ::field-group
    ::field{name="node" type="Node" required}
    The `Node` instance for which the plugin is being loaded.
    ::
  ::
  ::

  ::card
  ---
  icon: 'lucide:fold-horizontal'
  icon-size: 26
  horizontal: true
  ---
  #title
  Returns & Example

  #description
  **Returns**
  • **`void`**

  ```js
  class MyPlugin extends AbstractPlugin {
    // ... constructor and other methods
    load(node) {
      node.manager.emit('debug', `MyPlugin loaded for node ${node.identifier}`);
    }
  }
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
  Called when the plugin is unloaded from a specific node. This method should contain the plugin's cleanup logic.
  <br>
  <h5>Parameters</h5>

  ::field-group
    ::field{name="node" type="Node" required}
    The `Node` instance from which the plugin is being unloaded.
    ::
  ::
  ::

  ::card
  ---
  icon: 'lucide:fold-horizontal'
  icon-size: 26
  horizontal: true
  ---
  #title
  Returns & Example

  #description
  **Returns**
  • **`void`**

  ```js
  class MyPlugin extends AbstractPlugin {
    // ... constructor and other methods
    unload(node) {
      node.manager.emit('debug', `MyPlugin unloaded from node ${node.identifier}`);
    }
  }
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
  Optional method called when the associated node's information is updated. Useful for plugins that need to react to changes in node capabilities or other properties.
  <br>
  <h5>Parameters</h5>

  ::field-group
    ::field{name="node" type="Node" required}
    The `Node` instance whose information has been updated.
    ::
  ::
  ::

  ::card
  ---
  icon: 'lucide:fold-horizontal'
  icon-size: 26
  horizontal: true
  ---
  #title
  Returns & Example

  #description
  **Returns**
  • **`void`**

  ```js
  class MyPlugin extends AbstractPlugin {
    // ... constructor and other methods
    onNodeInfoUpdate(node) {
      node.manager.emit('debug', `MyPlugin received node info update for node ${node.identifier}`);
      // React to updated node.info.plugins or other properties
    }
  }
  ```
  ::
::
::

## Official Plugins

::card{icon="lucide:package"}
#title
Available Plugins

#description
List of official plugins available for Moonlink.js.

#content
| Plugin | Description | Version |
|--------|-------------|---------|
| [`GoogleCloudTTSPlugin`](/api/plugins/google-cloud-tts-plugin) | Provides Text-to-Speech (TTS) functionality using Google Cloud TTS. | N/A |
| [`JavaLavaLyricsPlugin`](/api/plugins/java-lavalyrics-plugin) | Provides lyrics functionality using the Java LavaLyrics plugin. | N/A |
| [`JavaLyricsPlugin`](/api/plugins/java-lyrics-plugin) | Provides lyrics functionality using the Java Lyrics plugin. | N/A |
| [`LavaDSPXPlugin`](/api/plugins/lava-dspx-plugin) | Provides advanced digital signal processing (DSP) filters. | N/A |
| [`LavaLyricsPlugin`](/api/plugins/lava-lyrics-plugin) | Provides lyrics functionality using the LavaLyrics plugin. | N/A |
| [`LavaSearchPlugin`](/api/plugins/lava-search-plugin) | Provides advanced search capabilities using the LavaSearch plugin. | N/A |
| [`LavaSrcPlugin`](/api/plugins/lava-src-plugin) | Provides support for various music sources like Spotify, Apple Music, Deezer, etc. | N/A |
| [`LyricsKtPlugin`](/api/plugins/lyrics-kt-plugin) | Provides lyrics functionality using the Lyrics.kt plugin. | N/A |
| [`SkybotPlugin`](/api/plugins/skybot-plugin) | Provides additional search capabilities for various direct sources. | N/A |
| [`SponsorBlockPlugin`](/api/plugins/sponsor-block-plugin) | Provides SponsorBlock integration for skipping sponsored segments in YouTube videos. | N/A |
| [`YouTubePlugin`](/api/plugins/youtube-plugin) | Provides YouTube search capabilities. | N/A |
| **Native Sources** | For documentation on native source integrations (e.g., Spotify, Deezer), please refer to the [Sources section](/api/sources). | N/A |

::alert{type="info" icon="lucide:info"}
moonlink does not yet have official plugins, nor plugins created by the community.
::
