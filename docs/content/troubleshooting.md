---
title: Troubleshooting
description: "Find solutions to common problems and errors when using Moonlink.js."
icon: 'lucide:wrench'
---

## Troubleshooting Common Issues

This guide helps you resolve common issues you might encounter while using Moonlink.js. If you can't find a solution here, feel free to ask for help on our [Discord server](https://discord.gg/q8HzGuHuDY).

---

### Connection Issues
*Problems related to connecting to Lavalink or voice channels.*

::card
---
icon: lucide:x-circle
title: Error Connecting to Lavalink
---
  **Symptom:** You see `nodeError` events with messages like `ECONNREFUSED`, `401 Unauthorized`, or `Invalid password`.
  <br>
  **Solution:**
  1.  **Check Lavalink Status:** Ensure your Lavalink server is running correctly.
  2.  **Verify Configuration:** Double-check the `host`, `port`, and `password` in your Manager configuration. They must exactly match your Lavalink `application.yml`.
  3.  **Firewall:** Make sure your firewall is not blocking the connection between your bot and the Lavalink server.

  ::code-group
    ```js [Manager Config]
    const manager = new Manager({
      nodes: [{
        host: 'localhost', // Must match Lavalink host
        port: 2333,        // Must match Lavalink port
        password: 'youshallnotpass', // Must match Lavalink password
      }],
      // ...
    });
    ```
    ```yaml [application.yml]
    server:
      port: 2333
    lavalink:
      server:
        password: "youshallnotpass"
    ```
  ::
::

::card
---
icon: lucide:mic-off
title: Bot Doesn't Join Voice Channel
---
  **Symptom:** The bot doesn't join the voice channel, and no sound is played. You might not see any errors.
  <br>
  **Solution:**
  1.  **`sendPayload` Function:** Ensure you have correctly implemented the `sendPayload` function. This function is crucial for sending voice updates to Discord.
  2.  **Intents:** Verify that you have enabled the necessary Gateway Intents for your Discord client, especially `Guilds` and `GuildVoiceStates`.
  3.  **`packetUpdate`:** Make sure you are forwarding raw voice packets to the manager using `client.on('raw', (packet) => manager.packetUpdate(packet));`.

  ```js [Required Code]
  const client = new Client({
    intents: [
      GatewayIntentBits.Guilds,
      GatewayIntentBits.GuildVoiceStates, // Required for voice
    ],
  });

  const manager = new Manager({
    // ... nodes
    sendPayload: (guildId, payload) => {
      const guild = client.guilds.cache.get(guildId);
      if (guild) guild.shard.send(JSON.parse(payload));
    },
  });

  client.on('raw', (packet) => {
    manager.packetUpdate(packet);
  });
  ```
::

::card
---
icon: lucide:wifi-off
title: Node Disconnects Frequently
---
  **Symptom:** The `nodeDisconnect` event is emitted frequently, and the bot experiences interruptions.
  <br>
  **Solution:**
  1.  **Lavalink Server Health:** Check the logs and resource usage (CPU/Memory) of your Lavalink server. It might be overloaded or crashing.
  2.  **Network Stability:** Ensure a stable network connection between your bot and the Lavalink server.
  3.  **Retry Settings:** Adjust the `retryAmount` and `retryDelay` options in your node configuration to give the bot more time to reconnect.

  ```js [Node Configuration]
  {
    host: 'localhost',
    port: 2333,
    password: 'youshallnotpass',
    retryAmount: 10, // Increase attempts
    retryDelay: 15000 // Increase delay to 15 seconds
  }
  ```
::

::card
---
icon: lucide:server-off
title: No Active Lavalink Node
---
  **Symptom:** Searches fail with an `empty` result, and you see debug messages like `No connected node available to handle the request.` or `No available nodes`.
  <br>
  **Solution:**
  1.  **Node Status:** Ensure at least one of your Lavalink nodes in the `Manager` configuration is running and accessible from your bot.
  2.  **Initial Connection:** The `nodeReady` event should be emitted for each node that successfully connects when your bot starts. If you don't see this, re-check your node configuration (`host`, `port`, `password`).
  3.  **Node Failure:** If a node disconnects, Moonlink.js will attempt to reconnect based on your `retryAmount` and `retryDelay` settings. If all nodes are offline, all player actions and searches will fail until one reconnects.
  4.  **Check for `nodeError`:** Listen for the `nodeError` event to catch connection problems as they happen.

  ```js [Event Listener]
  manager.on('nodeError', (node, error) => {
    console.error(`Node ${node.identifier} encountered an error:`, error.message);
  });
  ```
::

---

### Playback Issues
*Problems related to playing tracks, audio quality, and track events.*

::card
---
icon: lucide:volume-x
title: No Sound is Playing
---
  **Symptom:** The bot joins the voice channel, a `trackStart` event is emitted, but no audio is heard.
  <br>
  **Solution:**
  1.  **Lavalink Logs:** Check the Lavalink server console for errors like `TrackExceptionEvent` or `WebSocketClosedEvent`. These often provide clues.
  2.  **Track Loading:** Ensure the track was loaded successfully. A `loadFailed` result from `manager.search()` will cause this.
  3.  **Volume:** Make sure the player's volume is not set to 0. Also, check that the bot is not server-muted.
::

::card
---
icon: lucide:alert-triangle
title: Track Stuck or Exception Events
---
  **Symptom:** You receive `trackStuck` or `trackException` events.
  <br>
  **Solution:**
  - **`trackStuck`**: This usually indicates a network issue between Lavalink and the audio source (e.g., YouTube). It can be temporary. You can handle this by skipping to the next track.
  - **`trackException`**: This means Lavalink failed to play the track. The `exception` payload will contain details. Common reasons include age-restricted content, region-locked videos, or private tracks. It's best to log the error and skip the track.

  ```js [Event Handling]
  manager.on('trackStuck', (player, track, threshold) => {
    console.error(`Track ${track.title} got stuck. Threshold: ${threshold}ms`);
    player.skip();
  });

  manager.on('trackException', (player, track, exception) => {
    console.error(`Track ${track.title} failed to play:`, exception);
    player.skip();
  });
  ```
::

::card
---
icon: 'lucide:radio-tower'
title: Choosing Between Native Sources and LavaSrc
---
  **Context:** Moonlink.js has its own internal (native) sources for platforms like Spotify and Deezer. However, for full-featured and more reliable playback, using a Lavalink plugin like [LavaSrc](https://github.com/topi314/LavaSrc) is highly recommended.
  <br>
  **Problem:** You're not sure why Spotify/Deezer links aren't working as expected, or you want the best performance.
  <br>
  **Solution:**
  1.  **Use LavaSrc:** For the best experience, install the LavaSrc plugin on your Lavalink server.
  2.  **Disable Native Sources:** To ensure all requests go through LavaSrc, disable the native sources in the manager options. This prevents potential conflicts or unexpected behavior.

  When using LavaSrc, you do **not** need to provide Spotify `clientId` and `clientSecret` in the Moonlink.js manager options. Those should be configured in your Lavalink server's `application.yml` file for the LavaSrc plugin.

  ::code-group
    ```js [Manager Config for LavaSrc]
    const manager = new Manager({
      nodes: [/* ... */],
      sendPayload: (guildId, payload) => { /* ... */ },
      options: {
        // Disable internal sources to prioritize LavaSrc
        disableNativeSources: true,
      }
    });
    ```
    ```yaml [Lavalink application.yml for LavaSrc]
    lavalink:
      server:
        sources:
          youtube: true
          soundcloud: true
        plugins:
          - dependency: "com.github.topi314.lavasrc:lavasrc-plugin:4.0.0" # Use the latest version
            repository: "[https://maven.lavalink.dev/releases](https://maven.lavalink.dev/releases)"
    plugins:
      lavasrc:
        sources:
          spotify:
            clientId: "YOUR_SPOTIFY_CLIENT_ID"
            clientSecret: "YOUR_SPOTIFY_CLIENT_SECRET"
            market: "US"
          deezer:
            masterKey: "YOUR_DEEZER_MASTER_KEY"
    ```
  ::
  **Note:** If you choose to use the **native** Spotify source (by setting `disableNativeSources: false`), you must provide the `clientId` and `clientSecret` in the `manager.options.spotify` object. However, this method is generally less reliable for playback.
::

---

### General Errors & Tips
*Common JavaScript errors and debugging advice.*

::card
---
icon: lucide:code
title: "TypeError: Cannot read properties of undefined"
---
  **Symptom:** You get an error like `TypeError: Cannot read properties of undefined (reading 'play')`.
  <br>
  **Solution:**
  This almost always means you are trying to access a property or method on an object that is `undefined`. The most common cause in Moonlink.js is trying to use a player that doesn't exist.

  **Always check if the player exists before using it:**
  ```js
  const player = manager.players.get(guildId);

  if (!player) {
    console.log('No player found for this guild.');
    return;
  }

  // Now it's safe to use the player
  player.pause();
  ```
::

::card
---
icon: lucide:bug
title: Using the Debug Event
---
  **Symptom:** You are not sure what is happening internally.
<br>
  **Solution:**
  Moonlink.js provides a `debug` event that emits detailed information about internal operations. This is incredibly useful for understanding the library's behavior and diagnosing complex issues.

  ```js
  manager.on('debug', (message) => {
    console.log(`[MOONLINK DEBUG] ${message}`);
  });
  ```
::

::card
---
icon: lucide:file-text
title: Checking Lavalink Logs
---
  **Symptom:** You suspect the issue might be on the Lavalink side.
  <br>
  **Solution:**
  Always check the console output of your Lavalink server. It provides crucial information about track loading, playback errors, and connection statuses. Look for messages containing `WARN`, `ERROR`, or `Exception`.
::

::card
---
icon: 'lucide:search-check'
title: Search Fails or Returns No Tracks
---
  **Symptom:** `manager.search()` returns a `loadType` of `empty` or `error`, even for valid queries.
<br>
  **Solution:**
  1.  **Source Fallback:** If you are using `enableSourceFallback: true`, a search might fail on the primary source and then silently fail on fallback sources if none are available or suitable. Enable the `debug` event to see the search process in detail.
  2.  **Node Capabilities:** When you search for a track from a specific source (e.g., Spotify), Moonlink.js tries to find a connected node that has the required capability (e.g., `search:spotify`). If no such node is found, the search will fail for that source. Ensure your Lavalink plugins (like LavaSrc) are correctly loaded and reported by the node.
  3.  **Track Resolution:** If a track from a specific source (e.g., a Spotify track in the queue) is about to be played on a node that doesn't support it, the `play` function will attempt to find a new, suitable node. If that fails, it will try to search for the track by its title and author on a default platform (like YouTube). If all these steps fail, playback will stop. Check the debug logs for messages like `No suitable node found` or `Generic search fallback failed`.
::

::card
---
icon: 'lucide:save'
title: Auto-Resume Not Working
---
  **Symptom:** Players and queues are not restored after a bot restart, even with `autoResume: true`.
<br>
  **Solution:**
  1.  **Database Enabled:** The `autoResume` feature depends on the internal database to store player state. Ensure you have **not** set `disableDatabase: true` in the manager options.
  2.  **Persistent Storage:** The database writes to files in the `src/datastore` directory. Make sure your deployment environment has persistent storage and that these files are not deleted between restarts.
  3.  **Graceful Shutdown:** While not strictly required, ensuring a graceful shutdown allows the database to compact and save its final state correctly, which can prevent data loss.
::