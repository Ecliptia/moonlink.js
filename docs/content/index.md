---
title: Moonlink.js | The Definitive Library for Discord Music Bots with Node.js
navigation: false
description: Build powerful Discord music bots with Moonlink.js, a feature-rich and flexible library for Node.js and Lavalink. Offers advanced queue management, audio filters, and integration with Spotify, Deezer, and more.
---
<div style="display: flex; justify-content: center;">

![Moonlink](https://moonlink.js.org/moonlink_banner.png){lifted}

</div>

::alert{type="note" icon="lucide:pencil"}
**Heads up:** Only use with `nodejs` version `v18.x.x` or higher.
::

::hero
---
announcement:
  title: 'New Release v4.60.4'
  icon: '🎉'
  to: https://github.com/Ecliptia/moonlink.js/releases/tag/v4.60.4
  target: _blank
actions:
- name: Get Started
  to: /getting-started/introduction
  leftIcon: lucide:arrow-up-right
- name: GitHub
  variant: outline
  to: https://github.com/Ecliptia/moonlink.js/
  leftIcon: 'lucide:github'
  mobileRight: 'top'
---

#title
Imagine the Perfect Music Bot...

#description
**Moonlink.js (Reimagined Version)** — A sonic adventure where your imagination is the only limit. Designed to be powerful, flexible, and intuitive, Moonlink.js is the ideal tool for creating unforgettable music bots on Discord.
::

# Features
> - `Queue Management`: Queue is integrated with a local database, to retrieve data if necessary.
> - `Audio Filters`: Apply various audio filters.
> - `Auto Resume`: Automatically resumes playing after a disconnect.
> - `Logging`: Logging options with log file support.
> - `Node Management`: Management of different Lavalink nodes.
> - `Filters Management`: Various audio filters like Equalizer, Karaoke, Timescale, Tremolo, Vibrato, Rotation, Distortion, Channel Mix, and LowPass.
> - `Player Management`: Manage player configurations and states.
> - `Plugin Management`: Lavalink plugin support.
> - `Structure`: Allows you to extend classes by complementing with your own functionalities.

## What's New ✨

From `v4.6.18` to `v4.44.04`, Moonlink.js has evolved. We've added features, improvements, and refactors to supercharge your music bot development.

### New Features 🚀
::card-group
  ::card
  --- 
  title: Lyrics Integration
  icon: lucide:file-text
  description: Full-fledged lyrics management with plugins (LavaLyrics, JavaLyrics) and methods to fetch, display, and sync lyrics in real-time.
  ---
  ::

  ::card
  --- 
  title: Advanced Audio Filters (LavaDSPX)
  icon: lucide:sliders
  description: Explore new sound dimensions with DSP filters like HighPass, Normalization, and Echo, powered by the LavaDSPX plugin.
  ---
  ::

  ::card
  --- 
  title: Powerful Search with LavaSearch
  icon: lucide:search
  description: Take your bot's search to the next level. Find albums, artists, playlists, and tracks with precision using the LavaSearchPlugin.
  ---
  ::

  ::card
  --- 
  title: SponsorBlock Integration
  icon: lucide:shield-check
  description: Automatically skip sponsored segments in YouTube videos, ensuring an uninterrupted listening experience for your users.
  ---
  ::

  ::card
  --- 
  title: Text-to-Speech (TTS)
  icon: lucide:megaphone
  description: Give your bot a voice! Use the `Player.speak` method with various providers to convert text to audio for innovative interactions.
  ---
  ::

  ::card
  --- 
  title: Track History
  icon: lucide:history
  description: Allow users to navigate through previously played songs with the new `Player.back()` method, accessing the player's history.
  ---
  ::

  ::card
  --- 
  title: Total Queue Control
  icon: lucide:list-ordered
  description: New methods for flawless queue management, including duplicate removal, sorting, moving, and much more.
  ---
  ::

  ::card
  --- 
  title: Node Health Checks
  icon: lucide:heart-pulse
  description: The `NodeManager` now performs periodic health checks and automatically migrates players from unstable nodes, ensuring stability.
  ---
  ::

  ::card
  --- 
  title: Source Blacklisting
  icon: lucide:ban
  description: Gain full control over allowed music sources by blocking those you don't want with the `blacklistedSources` option.
  ---
  ::

  ::card
  --- 
  title: Modular Plugin System
  icon: lucide:puzzle
  description: A flexible and extensible plugin architecture with `PluginManager` and `AbstractPlugin` for you to customize Moonlink as you wish.
  ---
  ::

  ::card
  --- 
  title: Custom WebSocket Client
  icon: lucide:message-circle
  description: A new WebSocket client implementation for greater control and reliability in communication with Lavalink.
  ---
  ::

  ::card
  --- 
  title: Track Chapters
  icon: lucide:book-open
  description: Full support for chapters in long tracks, with the `player.skipChapter()` method for easy and intuitive navigation.
  ---
  ::

  ::card
  --- 
  title: Improved Spotify & Deezer Sources
  icon: lucide:music
  description: Enhanced native integration, authentication, and error handling for a more robust experience with Spotify and Deezer.
  ---
  ::

  ::card
  --- 
  title: General Utilities
  icon: lucide:tool
  description: New functions like `makeRequest` with retry logic and `isSourceBlacklisted` for better control and debugging of your bot.
  ---
  ::
::

### Refactors & Improvements 🛠️
::card-group
  ::card
  --- 
  title: Database Refactor
  icon: lucide:database
  description: A complete rewrite of the database to use Write-Ahead Logging (WAL), resulting in greater data persistence and performance.
  ---
  ::

  ::card
  --- 
  title: Deprecated Player Methods
  icon: lucide:alert-triangle
  description: Direct Manager methods have been deprecated in favor of `manager.players`, promoting a cleaner and more organized API.
  ---
  ::

  ::card
  --- 
  title: UUID Generation
  icon: lucide:key
  description: The `generateShortUUID` function has been renamed to `generateUUID` for greater clarity and consistency across the codebase.
  ---
  ::

  ::card
  --- 
  title: Player State Management
  icon: lucide:activity
  description: More robust handling of the player state, with improved reconnection attempts and skipping of blacklisted tracks.
  ---
  ::

  ::card
  --- 
  title: Node State Management
  icon: lucide:server
  description: Introduction of the `NodeState` enum for clearer, more explicit, and reliable node status tracking.
  ---
  ::
::

## Harnessing the Power of Lavalink Plugins
Moonlink.js harnesses the power of the extensive Lavalink plugin ecosystem to offer advanced, cutting-edge features. These plugins allow for immense customization and extension of your music bot's capabilities. Many of the standout features in Moonlink.js are made possible by these powerful additions.

::alert{type="info" icon="lucide:book-marked"}
  You can explore the full list of plugins and their features in the [official Lavalink documentation](https://lavalink.dev/plugins.html).
::

::card-group
  ::card
  ---
  title: LavaSrc Plugin
  icon: lucide:radio
  description: Adds **Lavalink-side** support for Spotify, Apple Music, and Deezer, allowing your bot to play music from the most popular streaming services via your Lavalink server.
  ---
  ::

  ::card
  ---
  title: LavaSearch Plugin
  icon: lucide:search-check
  description: Provides advanced search to find albums, artists, playlists, and tracks with precision, enhancing the user experience.
  ---
  ::

  ::card
  ---
  title: LavaDSPX Plugin
  icon: lucide:equalizer
  description: Unleash creative audio effects with a suite of additional filters like HighPass and Normalization, offering unique listening tools.
  ---
  ::

  ::card
  ---
  title: SponsorBlock Plugin
  icon: lucide:skip-forward
  description: Automatically skips sponsored segments in YouTube videos, providing a seamless and uninterrupted listening experience.
  ---
  ::

  ::card
  ---
  title: Lyrics Plugins
  icon: lucide:mic-vocal
  description: Moonlink.js supports various lyrics plugins like LavaLyrics, Lyrics.kt, and others, allowing you to fetch and display synchronized lyrics in real-time.
  ---
  ::

  ::card
  ---
  title: Text-to-Speech (TTS) Plugins
  icon: lucide:audio-lines
  description: Give your bot a voice! Through plugins like Google Cloud TTS, DuncteBot's free TTS, and Flowery TTS (via LavaSrc), your bot can convert text to audio.
  ---
  ::
::

## Practical Example

::alert{type="example" icon="lucide:test-tube"}
  Check out a simple and functional bot example in our repository: [testBot](https://github.com/Ecliptia/moonlink.js/tree/v4/testBot)
::

## Need Help?
::hero-alt
---
announcement:
  title: 'Support'
  icon: 'lucide:pie-chart'
actions:
  - name: 
    to: https://discord.gg/q8HzGuHuDY
    leftIcon: logos:discord
    variant: outline
---

#title
Questions or Problems?

#description
Get in touch with us! The best way to get help is by joining our support server on Discord.
::

## Found a Bug?

<p>If you found a bug and want to report it, please create an "Issue" on our GitHub. We will look into it as soon as possible to fix the problem.</p>
<br>

::button-link{left-icon="lucide:github" to="https://github.com/Ecliptia/moonlink.js/issues" target="_blank"}
  Report Bug on GitHub
::

<p>Want to contribute by fixing the problem or adding a new feature? Send a "Pull Request"! Your name will be forever registered in the project's code.</p>
<br>

::button-link{left-icon="lucide:github" to="https://github.com/Ecliptia/moonlink.js/pulls" target="_blank"}
  Submit a Pull Request
::

## Used By
::card
---
icon: 'lucide:bot-message-square'
icon-size: 26
horizontal: true
---
#title
Discord Bots that Use and Trust Moonlink.js

#description
A showcase for our amazing community

#content
::team-card-group
  ::team-card
  ---
  avatar: https://s3.galaxybot.app/media/brand/GalaxyBot.png
  center: false
  name: GalaxyBot
  title: "Used by over 48k guilds; Team: galaxybot.app"
  links:
    - icon: lucide:bot
      to: https://galaxybot.app/go/invite
    - icon: line-md:discord
      to: https://galaxybot.app/go/support
    - icon: lucide:unlink-2
      to: https://galaxybot.app
    - icon: lucide:users-round
      to: https://galaxybot.app/en/team
  ---
  ::
  ::team-card
  ---
  avatar: 
  center: false
  name: YADB (Yet Another Discord Bot)
  title: by Xotak
  links:
    - icon: line-md:github-loop
      to: https://framagit.org/xotak/yadb
    - icon: line-md:discord
      to: https://discord.com/oauth2/authorize?client_id=1174614219560341586&permissions=2033703774278&scope=bot+applications.commands
    - icon: material-symbols:docs-outline
      to: https://xotak.frama.io/yadb-docs/
  ---
  ::
  ::team-card
  ---
  avatar: https://camo.githubusercontent.com/1108dccb9fc7b98242def6ba2a98f76832dec5050f1384bcf2a6e94aa37e1bae/68747470733a2f2f692e696d6775722e636f6d2f39396d6e776a672e706e67
  center: false
  name: ComicallyBot
  title: by Comicallybad
  links:
    - icon: line-md:github-loop
      to: https://github.com/comicallybad/ComicallyBot
  ---
  ::
  ::team-card
  --- 
  avatar: https://github.com/khouwdevin/stalker-discord/raw/master/images/spy.png
  center: false
  name: stalker-discord
  title: by khouwdevin
  links:
    - icon: line-md:github-loop
      to: https://github.com/khouwdevin/stalker-discord
  ---
  ::
::

#footer
  ::alert{type="note" icon="lucide:pencil"}
  Want to add your bot to the list? Join our Discord or open a Pull Request at `docs/content/index.md`.
  ::
::

## Meet the Team

### Development Team & Collaborators
::team-card-group
  ::team-card
  ---
  center: false
  avatar: https://www.npmjs.com/npm-avatar/eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhdmF0YXJVUkwiOiJodHRwczovL3MuZ3JhdmF0YXIuY29tL2F2YXRhci9hNmE5NDVhYjJiNzk1MjcyNzVjN2IwMWEyNWM1YzQ2NT9zaXplPTQ5NiZkZWZhdWx0PXJldHJvIn0.5hP6oyShhR-UWUi6KF-lA0cWmE_BJjvIFAwkYCGEZNo
  name: Lucas Morais (1Lucas1apk)
  title: Project Maintainer
  links:
    - icon: lucide:github
      to: https://github.com/1Lucas1apk
    - icon: lucide:coffee
      to: https://github.com/sponsors/1Lucas1apk
  ---
  ::
  ::team-card
  ---
  center: false
  avatar: https://cdn.discordapp.com/avatars/882757043142950974/652c890e45a0c01b8daec3510b51596a.png?size=2048
  name: MotoG
  title: Creator & Designer
  links:
    - icon: lucide:github
      to: https://github.com/Moto65075
  ---
  ::
  ::team-card
  ---
  center: false
  avatar: https://avatars.githubusercontent.com/u/50148901?s=60&v=4
  name: Comicallybad
  title: Collaborator & Developer
  links:
    - icon: lucide:github
      to: https://github.com/comicallybad
  ---
  ::
  ::team-card
  ---
  center: false
  avatar: https://avatars.githubusercontent.com/u/76094069?v=4
  name: UnschooledGamer
  title: Collaborator
  links:
    - icon: lucide:github
      to: https://github.com/UnschooledGamer
  ---
  ::
  ::team-card
  ---
  center: false
  avatar: https://cdn.discordapp.com/avatars/336885637934481409/371faca58eb88781b922d4967b91fab4.png?size=2048
  name: xotakfr
  title: Collaborator
  links:
    - icon: lucide:github
      to: https://github.com/xotakfr
  ---
  ::
::

### Our Amazing Contributors
::team-card-group
  ::team-card
  ---
  center: false
  avatar: https://images-ext-1.discordapp.net/external/EzD_6L_K28EMUN8RwQhssNUaZEyVN1H3dG6VIHczPvc/%3Fsize%3D2048/https/cdn.discordapp.com/avatars/389709853511122944/cd8fa0420ae13e16f5bfd87340da35d8.png?format=webp&quality=lossless&width=810&height=810
  name: iamforster
  title: Tester & Bug Hunter
  ---
  ::
  ::team-card
  ---
  center: false
  avatar: https://avatars.githubusercontent.com/u/88549470?s=60&v=4
  name: PiscesXD
  title: Ideas, Features, Fixes & Sponsor
  links:
    - icon: lucide:github
      to: https://github.com/PiscesXD
  ---
  ::
::

::alert{type="note" icon="lucide:pencil"}
  Join us and contribute to the v4 version of moonlink.js!
::
::alert{type="success" icon="lucide:lightbulb"}
  We thank everyone who joins the server and reports bugs, thus helping to make the project increasingly stable and amazing for the developer community.
::

## amidst the hive 🐝
<div style="font-style: italic; text-align: center; margin-top: 2rem; margin-bottom: 2rem; padding: 1rem; border-left: 3px solid #ccc;">
<p>i feel out of place<br>
amidst the beehive…<br>
they look at me<br>
with disapproval in their eyes —<br>
as if they could see<br>
the secrets of my heart.</p>

<p>they say i am a rebel<br>
for not serving —<br>
with devotion —<br>
the queen bee.</p>

<p>but if i serve,<br>
what good will it do,<br>
if it is not what my soul<br>
has chosen to love?</p>

<p>i wish i could fly,<br>
free among the garden flowers,<br>
without worrying about returning —<br>
to the place i no longer know how to inhabit.</p>

<p>but i believe that one day,<br>
i will break this prison,<br>
and i will finally be able to fly<br>
wherever i want —<br>
with my own wings and<br>
my own direction.</p>
</div>
<p style="text-align: right; margin-right: 1rem;">
  <strong>— <a href="https://www.instagram.com/geovanazlw" target="_blank" rel="noopener noreferrer">Geo</a></strong>
</p>

<div style="text-align: center; margin-top: 3rem; margin-bottom: 3rem;">
<p style="font-size: 1.1rem; font-style: italic;">With Love, 💕</p>
<p style="font-size: 1.3rem; font-weight: bold;">The Ecliptia Team 😊</p>
</div>