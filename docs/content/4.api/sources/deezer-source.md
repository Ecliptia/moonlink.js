---
title: DeezerSource
description: "API reference for the DeezerSource in Moonlink.js"
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
DeezerSource Class

#description
The `DeezerSource` provides integration with the Deezer API, allowing Moonlink.js to search for and load tracks, albums, playlists, and artists from Deezer. It handles authentication and API requests internally.
<br>

::alert{type="info" icon="lucide:info"}
This source is automatically loaded if `disableNativeSources` is not set to `true` in the Manager options.
::

## Properties

| Property | Type | Description |
|----------|------|-------------|
| `name` | `string` | The name of the source: `Deezer`. |

## Methods

#### match
::field{name="match" type="method"}
::stack
  ::card
  ---
  icon: 'lucide:check-circle'
  ---
  #title
  Match URL

  #description
  Checks if a given URL or query string matches a Deezer track, album, playlist, or artist URL, or a `dzsearch:` query.
  <br>
  <h5>Parameters</h5>

  ::field-group
    ::field{name="query" type="string" required}
    The URL or query string to check.
    ::
  ::
  ::

  ::card
  #title
  Returns & Example

  #description
  **Returns**
  • **`boolean`** — `true` if the query matches a Deezer pattern, `false` otherwise.

  ```js
  const isDeezerLink = source.match('https://deezer.com/track/12345');
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
  Search Deezer

  #description
  Searches for tracks on Deezer based on a query. Results are limited by `manager.options.deezer.maxSearchResults`.
  <br>
  <h5>Parameters</h5>

  ::field-group
    ::field{name="query" type="string" required}
    The search query (e.g., `dzsearch:song title`).
    ::
  ::
  ::

  ::card
  #title
  Returns & Example

  #description
  **Returns**
  • **`Promise<any>`** — A search result object containing `loadType` and `data`.

  ```js
  const results = await source.search('dzsearch:Never Gonna Give You Up');
  ```
  ::
::
::

#### load
::field{name="load" type="method"}
::stack
  ::card
  ---
  icon: 'lucide:download'
  ---
  #title
  Load Deezer Content

  #description
  Loads content from a Deezer URL (track, album, playlist, artist). Handles short links and limits results based on `manager.options.deezer` configurations.
  <br>
  <h5>Parameters</h5>

  ::field-group
    ::field{name="query" type="string" required}
    The Deezer URL to load.
    ::
  ::
  ::

  ::card
  #title
  Returns & Example

  #description
  **Returns**
  • **`Promise<any>`** — A load result object containing `loadType` and `data`.

  ```js
  const track = await source.load('https://deezer.com/track/12345');
  const playlist = await source.load('https://deezer.com/playlist/67890');
  ```
  ::
::
::

#### resolve
::field{name="resolve" type="method"}
::stack
  ::card
  ---
  icon: 'lucide:check-circle'
  ---
  #title
  Resolve Deezer Content

  #description
  Resolves Deezer content from a URL. This method is an alias for `load`.
  <br>
  <h5>Parameters</h5>

  ::field-group
    ::field{name="query" type="string" required}
    The Deezer URL to resolve.
    ::
  ::
  ::

  ::card
  #title
  Returns & Example

  #description
  **Returns**
  • **`Promise<any>`** — A load result object.

  ```js
  const resolvedTrack = await source.resolve('https://deezer.com/track/12345');
  ```
  ::
::
::
