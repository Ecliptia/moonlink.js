# introduction
Welcome to the comprehensive documentation of Moonlink.js, your gateway to navigating the intricate paths of digital melody. Here, we will delve into the features, functionalities, and best practices for integrating this Lavalink client package, offering an immersive and personalized auditory experience. Get ready to dive into the documented universe of Moonlink.js, where precision meets harmony.

## What is moonlink.js?

Moonlink.js is a [lavalink](https://lavalink.dev/) client to work together with a [discord client](https://discord.com/developers/docs) library or wrapper to be a discord client

It's an npmjs package, very simple and easy to use it.

## What is lavalink?

[lavalink](https://lavalink.dev/) in short is an audio playback server for discord applications, supporting audio streaming from the YouTube platform and among others

## How do I configure lavalink?

For more information related to configuration and other things, visit the official lavalink page https://lavalink.dev/

# How to download moonlink.js package?

use a package manager to download it, such as npm, yarn, pnpm and others.

::code-group
  ```bash [NPM]
  npm install moonlink.js
  ```
  ```bash [YARN]
  yarn add moonlink.js
  ```
  ```bash [PNPM]
  npm install moonlink.js
  ```
::

moonlink.js supports [Bun](https://bun.sh/)? 

::alert{type="danger"}
currently not, after moonlink.js has the [RFC 6455](https://datatracker.ietf.org/doc/html/rfc6455) code made using native packages, to reduce its weight, and there is a function that is not called by bun, net.createConnection()
::

and Deno? 

::alert{type="success"}
Ao deno a moonlink.js tem suporte, defina 
::

```js
import * as moonlink from "npm:moonlink.js"
```
