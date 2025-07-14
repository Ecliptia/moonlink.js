---
title: Changelog
description: "Changelog for Moonlink.js"
icon: 'lucide:code-2'
authors:
  - avatar: https://www.npmjs.com/npm-avatar/eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhdmF0YXJVUkwiOiJodHRwczovL3MuZ3JhdmF0YXIuY29tL2F2YXRhci9hNmE5NDVhYjJiNzk1MjcyNzVjN2IwMWEyNWM1YzQ2NT9zaXplPTQ5NiZkZWZhdWx0PXJldHJvIn0.5hP6oyShhR-UWUi6KF-lA0cWmE_BJjvIFAwkYCGEZNo
    name: Lucas Morais Rodrigues
    username: 1Lucas1apk
    to: https://github.com/1Lucas1apk
    target: _blank
---

## Version v4.44.04 (Current)

### Fixed Issues
- `fix: update player state logic during play trigger`
- `fix: improve player reconstruction and state updates`
- `fix: update player reconstruction and state handling`
- `fix: refine live lyrics scheduling and debug logging`
- `fix: improve live lyrics scheduling logic`
- `fix: update YouTube plugin capabilities list`
- `fix: correct YouTube search identifier in LavaSrcPlugin`
- `fix: remove unnecessary semicolon in SponsorBlockPlugin`
- `fix: update bot node configuration`
- `fix: Update property validation to ensure correct type checks for guildId, voiceChannelId, and textChannelId in PlayerManager`
- `fix: improve validation logic for position in skip and seek methods`
- `fix: update validation logic in Player class methods`

### Refactors
- `refactor: update JavaLyricsPlugin source map compression`
- `refactor: remove `originNodeIdentifier` from typings`
- `refactor: optimize structure mapping and sourcemap generation`
- `refactor: simplify YouTubePlugin lifecycle methods`
- `refactor: improve debug logging in PluginManager`
- `refactor: simplify LavaSrcPlugin lifecycle methods`
- `refactor: remove deprecated Database class`

### New Features
- `feat: add LavaDSPXPlugin to extend plugin support`
- `feat: extend YouTube plugin capabilities`
- `feat: add new audio filter interfaces`
- `feat: add support for new audio filters and validations`
- `feat: add advanced audio filters with LavaDSPX support`
- `feat: implement JavaLavaLyricsPlugin for advanced lyrics handling`
- `feat: implement JavaLyricsPlugin for enhanced lyrics support`
- `feat: integrate track end handling for lyrics plugin`
- `feat: extend provider support for lyrics operations`
- `feat: improve live lyrics subscription handling`
- `feat: enhance live lyrics subscription display`
- `feat: add lyrics cache to Manager for performance`
- `feat: enhance static lyrics retrieval and fallback`
- `feat: implement LyricsKtPlugin for lyrics management`
- `feat: add provider support for lyrics subscription`
- `feat: improve lyrics handling with provider support`
- `feat: enhance lyrics management and search flexibility`
- `feat: enhance lyrics command functionality`
- `feat: enhance lyrics response mapping and handling`
- `feat: extend ILavaLyricsObject definition`
- `feat: extend search source types and add direct sources`
- `feat: add new track properties and methods`
- `feat: improve queue handling with blacklist integration`
- `feat: improve player handling and blacklist integration`
- `feat: add blacklist track removal during player resume`
- `feat: add blacklist tracking and Skybot provider support`
- `feat: extend partialTrack for position info`
- `feat: add Speak command and extend Skybot capabilities`
- `feat: add SkybotPlugin for extended bot capabilities`
- `feat: add LavaLyricsPlugin for lyrics support`
- `feat: add commands for live lyrics subscription`
- `feat: add POST method to Rest API client`
- `feat: add lyrics management methods to Player`
- `feat: integrate LavaLyrics plugin event handling`
- `feat: add lyrics subscription and retrieval methods`
- `feat: enhance lyrics retrieval and handling logic`
- `feat: add LavaLyrics typings for lyrics integration`
- `feat: add LavaSearchPlugin for advanced search functionality`
- `feat: enhance SearchResult with LavaSearch fields`
- `feat: enhance music search with LavaSearch support`
- `feat: add LavaSearch method to Manager typings`
- `feat: expand typings to support LavaSearch results`
- `feat: implement SponsorBlock plugin`
- `feat: add SponsorBlock and chapter navigation commands`
- `feat: add chapter-related fields and refactor origin handling`
- `feat: add REST methods for GET, PUT, and DELETE`
- `feat: improve PluginManager debug logging for plugins`
- `feat: enhance Player with TTS, chapter, and SponsorBlock features`
- `feat: add chapter display to now playing embed`
- `feat: introduce TTS improvements, chapters, and SponsorBlock API`
- `feat: add SponsorBlock plugin event handling`
- `feat: add chapter and segment support in player typings`
- `feat: enhance TTS query handling in Rest entity`
- `feat: enhance TTS support with multi-provider flexibility`
- `feat: update playerSpeak and introduce ISpeakOptions`
- `feat: add GoogleCloudTTSPlugin for TTS support`
- `feat(spotify): add clientId and clientSecret options for Spotify API authentication`
- `feat: reintroduce Database with WAL and snapshot support`
- `feat: add YouTubePlugin for YouTube search support`
- `feat: add LavaSrcPlugin for extended search support`
- `feat: introduce PluginManager for plugin registration`
- `feat: add AbstractPlugin class for plugin definition`
- `feat: extend search sources and partial track properties`
- `feat: add originNodeIdentifier to Track entity`
- `feat: improve node selection and add FloweryTTS support`
- `feat: enhance Node validation and add capability-based node selection`
- `feat: enhance node plugin and autoplay functionality`
- `feat: improve plugin management and refactor search logic`
- `feat: add playerSpeak event and FloweryTTS options`
- `feat: add PluginManager support to exports`

### Chore
- `chore: update version and User-Agent headers`
- `chore: clean up comments and minor formatting in lyrics command`
- `chore: remove redundant comments in lyrics command`
- `chore: remove redundant comments from LavaLyricsPlugin`
- `chore: remove debug console statements in SearchResult`
- `chore: regenerate NodeManager.js sourcemap`
- `chore: update sourcemap for Manager.js`
- `chore: update sourcemap for Manager.js`
- `chore: update sourcemap for Manager.js`
- `chore: remove unused token URL`
- `chore: remove unnecessary newline at EOF in Utils.ts`
- `chore: update source maps for Track.js`
- `chore: remove unnecessary newline at EOF in PlayerManager.ts`
- `chore: bump version in package-lock.json`
- `chore: included the built code`

## Version v4.28.32 -> v4.28.34

### New Features
- `feat: add WebSocket type definitions and bump version`
- `feat: add WebSocket client implementation`

## Version v.4.6.18 -> v4.28.32

### Fixed Issues
- `fix: correct source map generation for Spotify`
- `fix: improve PlayerManager validation and error handling`
- `fix: correct WebSocket initialization in Listen entity`
- `fix: improve error handling and debug logs in Deezer API`
- `fix: improve error handling and add debug logs in Database`
- `fix: remove unused `nodeRaw` event listener`

### Refactors
- `refactor: enhance Player entity with readonly properties, refinements, and private methods`
- `refactor: simplify `player.previous` logic and add debug logging in Node entity`
- `refactor: remove `previousInArray` logic and add debug logging in Node entity`
- `refactor: remove unused `previousInArray` property from interfaces`

### New Features
- `feat: add retry logic to makeRequest function`
- `feat: extend type definitions with enums and new type`
- `feat: add support for YouTube thumbnail retrieval`
- `feat: improve loadFolder method with async and error handling`
- `feat: enhance Queue with sorting, range, and deduplication`
- `feat: enhance Player with history, looping, and events`
- `feat: improve NodeManager with health checks and node sorting`
- `feat: enhance Node with improved state management`
- `feat: enhance Manager with config validation and source fallback`
- `feat: add WebSocket service to Listen entity`
- `feat: extend event typings and configuration fields`
- `feat: emit `filtersUpdate` event on update`
- `feat: emit `filtersUpdate` event on filter modifications`
- `feat: implement Write-Ahead Logging (WAL) for Database persistence and improved performance`
- `feat: enhance Spotify and utility functionalities`

### Chore
- `chore: update `User-Agent` and bump package version`
- `chore: update package versions and cleanup dependencies`
- `chore: update .npmignore to exclude tests directory`
- `chore: update utils API icon to `lucide:tool-case` in documentation`
- `chore: update bot settings to include `disableNativeSources` configuration`
- `chore: update Player.js.map file to reflect latest mappings`
- `chore: update Manager.js.map file to reflect latest mappings`

## Version v4.6.18 (Current)

### Fixed Issues
- `fix: Update User-Agent string in headers with updated version info.`
- `fix: Update typings, SourceManager, and bot settings; improve error handling and add debug logging.`
- `fix: Spotify endpoint change.`
- `fix: Update bot.js and index.js for new Lavalink server configuration; enhance nowplaying and search commands for better track information.`

### Refactors
- `refactor: Simplify pluginInfo assignment in Track class constructor.`
- `refactor: Simplify default position fallback to 0.`
- `refactor: Update User-Agent in defaultHeaders to reflect new version and branding.`
- `refactor: Update Manager configuration and modify track search query in index.js; adjust partialTrack options in bot.js.`
- `refactor: Rename isLinkMatch to match in ISource interface and add Spotify options to IOptionsManager.`
- `refactor: Update isLinkMatch method to return match status and source name.`

### New Features
- `feat: Add Deezer source integration with configurable options.`
- `feat: Refactor Spotify source implementation.`
- `feat: Add resolve method to Track class for plugin-specific track resolution.`
- `feat: Implement Spotify autoplay functionality for players.`

### Chore
- `chore: Update version to 4.5.3.dev.2 in package.json.`
- `chore: Bump version to 4.5.3 in package.json.`
- `chore: Update version to 4.4.62-dev.3 for development purposes.`
- `chore: Update version to 4.4.62 and enhance changelog with new updates (#144).`
- `chore: Update version to 4.4.62 and enhance changelog with new updates.`
- `chore: Update User-Agent string and version in headers; add changelog and update version in package.json.`
- `chore: Update bot configuration with new host and port settings; remove unused parameters.`

### Documentation
- `docs: Update README for clarity and structure; enhance documentation sections and improve phrasing.`
- `docs: Update release version to v4.4.28 and enhance documentation with new bot applications section.`

## Version v4.6.3 -> v4.6.18

### Fixed Issues
- `fix: update User-Agent string in headers with updated version info`
- `fix: update typings, SourceManager, and bot settings; improve error handling and add debug logging`
- `fix: Spotify endpoint change`
- `fix: update bot.js and index.js for new Lavalink server configuration; enhance nowplaying and search commands for better track information`
- `fix: update User-Agent version in headers for consistency`
- `fix: enhance Deezer URL matching and fetch logic for short links`
- `fix: replace error throwing with debug logging for Deezer API request failures`

### Refactors
- `refactor: simplify pluginInfo assignment in Track class constructor`
- `refactor: simplify default position fallback to 0`
- `refactor: Update User-Agent in defaultHeaders to reflect new version and branding`
- `refactor: Update Manager configuration and modify track search query in index.js; adjust partialTrack options in bot.js`
- `refactor: Rename isLinkMatch to match in ISource interface and add Spotify options to IOptionsManager`
- `refactor: Update isLinkMatch method to return match status and source name`

### New Features
- `feat: add Deezer source integration with configurable options`
- `feat: Refactor Spotify source implementation`
- `feat: Add resolve method to Track class for plugin-specific track resolution`
- `feat: Implement Spotify autoplay functionality for players`

## Version v4.5.3 -> v4.6.3

### Fixed Issues
- `fix: Improve search method in Manager class to handle sources more effectively and ensure proper query validation.`
- `fix: Update version to 4.4.62-dev.22 in package.json.`
- `fix: Update version to 4.4.62-dev.5 in package.json.`
- `fix: Set player loop mode to "track" and ensure playback starts correctly.`
- `fix: Prevent processing track end for destroyed players.`
- `fix: Add destroyed flag to Player class to prevent multiple destroy calls.`
- `fix: When bot disconnected and played again, it played 3s from the beginning and went back.`
- `fix: Improve player reconnection logic and add player reconnect event.`
- `fix: Parse payload as JSON before sending in sendPayload method.`
- `fix: Parse payload before sending in sendPayload method; update search command to use object syntax.`

### New Features
- `feat: Add isLinkMatch method to SourceManager and Spotify classes.`
- `feat: Adapt structure to receive SourceManager, to load sources natively and dynamically.`
- `feat: Add GalaxyBot team card and update avatar for xotakfr.`
- `feat: Add ws dependency and improve environment detection.`
- `feat: Update package description for clarity; simplify duration display in play command; set developer ID in config.`
- `feat: Add search command, improve play command, and add join command improvements.`
- `feat: Integrate nuxt-gtag module for Google Analytics tracking; update bot configuration with local host and port settings.`
- `feat: Add disableDatabase and blacklisteSources options to IOptionsManager interface.`
- `feat: Enhance SearchResult class with LoadType and additional methods for track management.`
- `feat: Add find, move, slice, filter, reverse methods and position/previous properties to Queue class for enhanced track management.`
- `feat: Add has and delete methods to Player class; refactor data management with updateData method.`
- `feat: Add system monitoring and player migration methods to Node class for improved performance management.`
- `feat: Implement disableDatabase functionality in Database class to control data loading and saving.`
- `feat: Add disableDatabase option to Manager configuration and deprecate player management methods for improved clarity.`

### Refactors
- `refactor: Rename generateShortUUID to generateUUID and update its implementation; add disableDatabase and blacklisteSources options to IOptionsManager interface.`
- `refactor: Replace generateShortUUID with generateUUID in NodeManager for consistency.`
- `refactor: Remove trailing comma in accept-encoding header for consistency in Rest class.`
- `refactor: Rename generateShortUUID to generateUUID for clarity and update UUID generation logic.`
- `refactor: Streamline Player data management by replacing direct database calls with updateData method; update installation documentation for clarity and structure.`

### Chore
- `chore: Update version to 4.5.3.dev.2 in package.json.`
- `chore: Bump version to 4.5.3 in package.json.`
- `chore: Update version to 4.4.62-dev.3 for development purposes.`
- `chore: Update version to 4.4.62 and enhance changelog with new updates (#144).`
- `chore: Update version to 4.4.62 and enhance changelog with new updates.`
- `chore: Update User-Agent string and version in headers; add changelog and update version in package.json.`
- `chore: Update bot configuration with new host and port settings; remove unused parameters.`

### Documentation
- `docs: Update README for clarity and structure; enhance documentation sections and improve phrasing.`
- `docs: Update release version to v4.4.28 and enhance documentation with new bot applications section.`

## Version v4.4.36 -> v4.5.3

### Fixed Issues
- `fix: update User-Agent string in headers with updated version info`
- `fix: update typings, SourceManager, and bot settings; improve error handling and add debug logging`
- `fix: Spotify endpoint change`
- `fix: update bot.js and index.js for new Lavalink server configuration; enhance nowplaying and search commands for better track information`
- `fix: update User-Agent version in headers for consistency`
- `fix: enhance Deezer URL matching and fetch logic for short links`
- `fix: replace error throwing with debug logging for Deezer API request failures`

### Refactors
- `refactor: simplify pluginInfo assignment in Track class constructor`
- `refactor: simplify default position fallback to 0`
- `refactor: Update User-Agent in defaultHeaders to reflect new version and branding`
- `refactor: Update Manager configuration and modify track search query in index.js; adjust partialTrack options in bot.js`
- `refactor: Rename isLinkMatch to match in ISource interface and add Spotify options to IOptionsManager`
- `refactor: Update isLinkMatch method to return match status and source name`

### New Features
- `feat: add Deezer source integration with configurable options`
- `feat: Refactor Spotify source implementation`
- `feat: Add resolve method to Track class for plugin-specific track resolution`
- `feat: Implement Spotify autoplay functionality for players`

## Version v4.5.3

### New Features
- `feat: SourceManager class introduced for managing native sources like Spotify.`
- `feat: Spotify source integration added.`
- `feat: Track class now has a resolve() method for internal plugin resolution.`
- `feat: Player class now has a destroyed property to prevent multiple destroy calls.`
- `feat: Player class's play() method now checks pluginInfo.MoonlinkInternal and calls track.resolve() if true.`
- `feat: Player class's play() method now sets position to 0 if looping.`
- `feat: Player class's destroy() method now accepts a reason parameter.`
- `feat: Node class's reconnect() method now includes a delayed reconnect logic with exponential backoff.`
- `feat: Node class's TrackEndEvent now checks if the player is destroyed before processing.`
- `feat: Node class's TrackStartEvent now sets player.playing = true during auto-resume.`
- `feat: Node class's WebSocketClosedEvent now attempts to reconnect the player up to 6 times before destroying it.`
- `feat: Manager class now has a sources property for SourceManager.`
- `feat: Manager class's search() method now uses SourceManager for native source matching and searching.`
- `feat: Manager class's init() method now logs the environment and version.`
- `feat: Manager class's packetUpdate() method now emits playerReconnect event.`
- `feat: Queue class now has find(), move(), slice(), filter(), reverse(), position, and previous getters.`
- `feat: IOptionsManager now includes disableNativeSources and spotify options.`
- `feat: ISource interface added for source management.`

### Fixed Issues
- `fix: Player's requestedBy handling in play method improved for correct requester data.`
- `fix: Player's playing status now correctly set to true during auto-resume.`
- `fix: Track's pluginInfo handling.`

### Refactors
- `refactor: generateShortUUID renamed to generateUUID.`
- `refactor: Manager's createPlayer(), getPlayer(), hasPlayer(), deletePlayer()' methods are now deprecated, encouraging the use of players.create(), players.get(), etc.`
- `refactor: Database now has disabled flag and improved logging for errors.`
- `refactor: Node's uuid generation now uses generateUUID.`
- `refactor: Player's data management now uses updateData method.`
- `refactor: Queue's add method now accepts a single track or an array of tracks.`
- `refactor: Rest class uses stringifyWithReplacer.`
- `refactor: Track class now uses partialTrack option for selective property loading.`
- `refactor: Rest class's User-Agent updated.`

### Chore
- `chore: .gitignore updated.`
- `chore: Version bumped to 4.5.3.`
- `chore: pnpm-lock.yaml updated.`
- `chore: README.md updated.`
- `chore: Docs updated.`

## Version 4.4.28 -> 4.4.36

### New Features
- `feat: Added 'disableDatabase' option to Manager configuration.`
- `feat: Added 'blacklisteSources' option to Manager configuration.`
- `feat: 'getSystemStats()', 'isOverloaded()', 'getNodeInfo()', 'migrateAllPlayers()', 'needsRestart()', 'getNodeStatus()', 'checkHealth()' methods added to Node class.`
- `feat: 'find()', 'move()', 'slice()', 'filter()', 'reverse()', 'position', 'previous' getters added to Queue class.`
- `feat: 'has()', 'delete()', 'updateData()' methods added to Player class.`

### Fixed Issues
- `fix: Player's 'requestedBy' handling in 'play' method improved for correct requester data.`
- `fix: Player's 'playing' status now correctly set to true during auto-resume.`
- `fix: Track's 'pluginInfo' handling.`

### Refactors
- `refactor: 'generateShortUUID' renamed to 'generateUUID'.`
- `refactor: Manager's 'createPlayer()', 'getPlayer()', 'hasPlayer()', 'deletePlayer()' methods are now deprecated, encouraging the use of 'players.create()', 'players.get()', etc.`
- `refactor: Database now has 'disabled' flag and improved logging for errors.`
- `refactor: Node's 'uuid' generation now uses 'generateUUID'.`
- `refactor: Player's data management now uses 'updateData' method.`
- `refactor: Queue's 'add' method now accepts a single track or an array of tracks.`
- `refactor: Rest class uses 'stringifyWithReplacer'.`
- `refactor: Track class now uses 'partialTrack' option for selective property loading.`

### Chore
- `chore: .gitignore updated.`
- `chore: Version bumped to 4.4.36.`
- `chore: 'pnpm-lock.yaml' updated.`
- `chore: 'README.md' updated.`
- `chore: Docs updated.`

## Version v4.4.14 -> v4.4.28

### New Features
- `feat: Added 'sortPlayersByRegion' option to Manager configuration for regional player sorting.`
- `feat: Introduced 'pathVersion' in Node configuration for specifying Lavalink API version.`
- `feat: Implemented new documentation site using Nuxt.js and Shadcn Docs.`
- `feat: Added new test bot commands: 'join' and 'search'.`
- `feat: 'partialTrack' option added to Manager configuration for selective track property loading.`
- `feat: 'compareVersions' and 'stringifyWithReplacer' utility functions added.`
- `feat: 'pluginInfo', 'isPartial', 'createPropertySetters', 'resolveData', 'isPartialTrack', 'raw', and 'unresolvedTrack' added to 'Track' class.`
- `feat: 'duration', 'isEmpty', 'first', 'last', and 'all' getters added to 'Queue' class.`
- `feat: 'Database' class now handles loading/parsing errors by emitting debug messages.`
- `feat: 'Register' module introduced to register structures.`

### Fixed Issues
- `fix: Player's 'requestedBy' handling in 'play' method improved for correct requester data.`
- `fix: Player's 'playing' status now correctly set to true during auto-resume.`
- `fix: 'Track' class constructor now correctly handles 'pluginInfo'.`

### Refactors
- `refactor: 'requester' removed from Manager's 'search' options, now handled internally by 'SearchResult'.`
- `refactor: Node's 'url' construction now dynamically uses 'pathVersion'.`
- `refactor: 'Track's 'requestedBy' property updated to directly accept Object or string, with a new 'setRequester' method.`
- `refactor: Database error handling improved to emit debug messages instead of throwing errors.`
- `refactor: 'Track' class now uses 'partialTrack' option for selective property loading.`
- `refactor: 'Queue's 'add' method now accepts a single track or an array of tracks.`
- `refactor: 'Rest' class now uses 'stringifyWithReplacer' for JSON stringification.`
- `refactor: 'index.ts' updated to use 'structures' from 'Utils' for exporting.`

### Chore
- `chore: .gitignore updated to ignore 'docs/node_modules', 'docs/.nuxt', 'docs/.output', 'docs/.vscode'.`
- `chore: Version bumped to 4.4.28.`
- `chore: 'pnpm-lock.yaml' updated.`
- `chore: 'README.md' updated with new badges and description.`
- `chore: 'docs/' directory added with new documentation.`

## Version v4.4.14

### New Features
- `feat: Added 'sortPlayersByRegion' option to Manager configuration for regional player sorting.`
- `feat: Introduced 'pathVersion' in Node configuration for specifying Lavalink API version.`
- `feat: Implemented new documentation site using Nuxt.js and Shadcn Docs.`
- `feat: Added new test bot commands: 'join' and 'search'.`

### Fixed Issues
- `fix: Player's 'requestedBy' handling in 'play' method improved for correct requester data.`
- `fix: Player's 'playing' status now correctly set to true during auto-resume.`

### Refactors
- `refactor: Removed 'requester' from Manager's 'search' options, now handled internally by SearchResult.`
- `refactor: Node's 'url' construction now dynamically uses 'pathVersion'.`
- `refactor: Track's 'requestedBy' property updated to directly accept Object or string, with a new 'setRequester' method.`
- `refactor: Database error handling improved to emit debug messages instead of throwing errors.`

### Chore
- `chore: .gitignore updated to include 'docs/' directory.`
- `chore: Version bumped to 4.4.14 and 'packageManager' field added to package.json.`
- `chore: pnpm-lock.yaml added.`
- `chore: README.md updated with new badges and description.`

## Version v4.4.7

### Fixed Issues
- `fix: Player playing status reset to false on node reconnect to prevent incorrect state.`
- `fix: Player requestedBy handling improved to correctly manage string or object user data.`

### Chore
- `chore: Version bumped to 4.4.7.`
- `chore: Added decodeTrack utility to test bot for debugging.`

### Refactors
- `refactor: Player queue add method in test bot now passes requester ID.`

## Version v4.4.6

### New Features
- `feat: Added 'resume' and 'autoResume' options to Manager configuration.`

### Fixed Issues
- `fix: Corrected 'Session-Id' handling in WebSocket headers, now conditionally set based on manager options.`
- `fix: Updated 'requestedBy.userData' handling in Player.ts to ensure proper data structure.`

### Chore
- `chore: Version bumped to 4.4.6.`
- `chore: Removed 'movePlayersOnReconnect', 'autoResume', and 'resume' from test bot manager options.`

## Version v4.4.4

### Fixed Issues
- `fix: User-Agent string in headers updated with correct version information.`
- `fix: Typings and SourceManager settings updated; improved error handling and added debug logging for node raw events.`
- `fix: Spotify endpoint change addressed for token fetching.`
- `fix: Bot settings updated for new Lavalink server configuration; nowplaying and search commands enhanced for better track information display.`
- `fix: User-Agent version in headers for consistency.`
- `fix: Deezer URL matching and fetch logic enhanced for short links.`
- `fix: Error throwing replaced with debug logging for Deezer API request failures.`
- `fix: Corrected 'Session-Id' handling in WebSocket headers, now conditionally set based on manager options.`
- `fix: Updated 'requestedBy.userData' handling in Player.ts to ensure proper data structure.`

### New Features
- `feat: New GitHub Actions workflow for publishing approved pull requests.`
- `feat: New Database class introduced for data persistence.`
- `feat: SearchResult class added to encapsulate search results.`
- `feat: Added 'previousInArray' option to Manager options.`
- `feat: Added 'attempt' property to IVoiceState.`
- `feat: Added player control buttons and commands to test bot.`
- `feat: Added 'logFile' option to Manager options for logging.`
- `feat: Added 'movePlayersOnReconnect' option to Manager options.`
- `feat: Added 'autoResume' and 'resume' options to Manager options.`
- `feat: Added replay, restart, and transferNode methods to Player class.`
- `feat: Added getPlayers and getPlayersCount to Node class.`
- `feat: Added all getter to PlayerManager.`
- `feat: Added queueEnd event to IEvents.`
- `feat: Added IRESTGetPlayers interface.`

### Refactors
- `refactor: Manager's search method now returns SearchResult directly.`
- `refactor: Manager's packetUpdate method is now async.`
- `refactor: Manager's attemptConnection now includes debug logging and an attempt flag for voiceState.`
- `refactor: Player constructor now uses Structure.get for Queue, Filters, Listen, and Lyrics.`
- `refactor: Player's play method now calls isVoiceStateAttempt.`
- `refactor: Player's skip method now handles autoPlay.`
- `refactor: NodeManager and PlayerManager now use Structure.get for Node and Player creation respectively.`
- `refactor: MoonlinkFilters renamed to Filters, and validation added for filter setters.`
- `refactor: Structure class moved from src/core to src/Utils.`
- `refactor: Queue methods now update database.`
- `refactor: Rest class now includes patch method.`
- `refactor: Track's requestedBy property now uses userData.`
- `refactor: Player's setVoiceChannelId, setTextChannelId, setAutoPlay, setAutoLeave, pause, resume, seek, setVolume, setLoop methods now update database.`
- `refactor: Node's message handling improved with debug logging and auto-resume logic.`
- `refactor: NodeManager now uses UUID for node identification.`
- `refactor: PlayerManager's create method now uses UUID for node identification.`
- `refactor: PlayerManager's delete method now deletes player and queue data from database.`
- `refactor: isVoiceStateAttempt moved to PlayerManager.`

### Chore
- `chore: .gitignore updated to ignore docs/.`
- `chore: package.json and package-lock.json updated version.`
- `chore: Added .prettierrc.`
- `chore: Updated node engine version.`
- `chore: Updated dependencies.`
- `chore: Added moonlink.log to .npmignore.`
- `chore: Added dist/src/datastore to .gitignore.`

### Documentation
- `docs: README.md updated with new example code for Discord bot, including slash commands and player controls.`

## Version v4.2.1

### Fixed Issues
- `fix: User-Agent string in headers updated with correct version information.`
- `fix: Typings and SourceManager settings updated; improved error handling and added debug logging for node raw events.`
- `fix: Spotify endpoint change addressed for token fetching.`
- `fix: Bot settings updated for new Lavalink server configuration; nowplaying and search commands enhanced for better track information display.`
- `fix: User-Agent version in headers for consistency.`
- `fix: Deezer URL matching and fetch logic enhanced for short links.`
- `fix: Error throwing replaced with debug logging for Deezer API request failures.`

### New Features
- `feat: Deezer source integration added with configurable options.`
- `feat: Spotify source implementation refactored.`
- `feat: Resolve method added to Track class for plugin-specific track resolution.`
- `feat: Spotify autoplay functionality implemented for players.`
- `feat: New GitHub Actions workflow for publishing approved pull requests.`
- `feat: New Database class introduced for data persistence.`
- `feat: SearchResult class added to encapsulate search results.`
- `feat: Added 'previousInArray' option to Manager options.`
- `feat: Added 'attempt' property to IVoiceState.`
- `feat: Added player control buttons and commands to test bot.`

### Refactors
- `refactor: Manager's search method now returns SearchResult directly.`
- `refactor: Manager's packetUpdate method is now async.`
- `refactor: Manager's attemptConnection now includes debug logging and an attempt flag for voiceState.`
- `refactor: Player constructor now uses Structure.get for Queue, Filters, Listen, and Lyrics.`
- `refactor: Player's play method now calls isVoiceStateAttempt.`
- `refactor: Player's skip method now handles autoPlay.`
- `refactor: NodeManager and PlayerManager now use Structure.get for Node and Player creation respectively.`
- `refactor: MoonlinkFilters renamed to Filters, and validation added for filter setters.`
- `refactor: Structure class moved from src/core to src/Utils.`

### Chore
- `chore: .gitignore updated to ignore docs/.`
- `chore: package.json and package-lock.json updated version.`

### Documentation
- `docs: README.md updated with new example code for Discord bot, including slash commands and player controls.`

## Version v4.0.2

### Fixed Issues
- `fix: Player stop method now correctly clears the queue, preventing unintended skips.`
- `fix: Player destruction logic improved in stop method, allowing proper player disposal.`
- `fix: Default password for nodes is now correctly set to "youshallnotpass" if not provided.`
- `fix: Search functionality now correctly handles sources not explicitly present in source variables and includes 'deflate' in 'accept-encoding' headers for improved compatibility.`
- `fix: User-Agent string in headers updated with correct version information.`
- `fix: Typings and SourceManager settings updated; improved error handling and added debug logging for node raw events.`
- `fix: Spotify endpoint change addressed for token fetching.`
- `fix: Bot settings updated for new Lavalink server configuration; nowplaying and search commands enhanced for better track information display.`

### Refactors
- `refactor: makeRequest function in Utils.ts now handles non-JSON responses gracefully by attempting to read as text.`
- `refactor: Manager's loadTracks method now returns early if loadType is error or empty.`
- `refactor: Player constructor now checks for NodeLinkFeatures or node.info.isNodeLink for Listen and Lyrics initialization.`

### Miscellaneous
- `misc: Version bumped to 4.0.2.`
- `misc: Debug message for exceptions in Node.ts now stringifies the payload exception for better readability.`