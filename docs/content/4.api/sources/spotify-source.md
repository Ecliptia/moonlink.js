---
title: SpotifySource
description: "API reference for the SpotifySource in Moonlink.js"
icon: 'line-md:spotify-filled'
authors:
  - avatar: https://www.npmjs.com/npm-avatar/eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhdmF0YXJVUkwiOiJodHRwczovL3MuZ3JhdmF2YXRhci5jb20vYXZhdGFyL2E2YTk0NWFhYjJiNzk1MjcyNzVjN2IwMWEyNWM1YzQ2NT9zaXplPTQ5NiZkZWZhdWx0PXJldHJvIn0.5hP6oyShhR-UWUi6KF-lA0cWmE_BJjvIFAwkYCGEZNo
    name: Lucas Morais Rodrigues
    username: 1Lucas1apk
    to: https://github.com/1Lucas1apk
    target: _blank
---

::card{icon="lucide:spotify"}
#title
SpotifySource Class

#description
The `SpotifySource` provides integration with the Spotify API, allowing Moonlink.js to search for and load tracks, albums, playlists, and artists from Spotify. It handles authentication using client credentials and API requests internally.
<br>

::alert{type="info" icon="lucide:info"}
This source is automatically loaded if `disableNativeSources` is not set to `true` in the Manager options. You must provide `clientId` and `clientSecret` in the Manager's `spotify` options for this source to function.
::

## Properties

| Property | Type | Description |
|----------|------|-------------|
| `name` | `string` | The name of the source: `Spotify`. |

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
  Checks if a given URL or query string matches a Spotify track, album, playlist, or artist URL, or a `spsearch:` or `sprec:` query.
  <br>
  <h5>Parameters</h5>

  ::field-group
    ::field{name="url" type="string" required}
    The URL or query string to check.
    ::
  ::
  ::

  ::card
  #title
  Returns & Example

  #description
  **Returns**
  • **`boolean`** — `true` if the query matches a Spotify pattern, `false` otherwise.

  ```js
  const isSpotifyLink = source.match('https://open.spotify.com/track/12345');
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
  Search Spotify

  #description
  Searches for tracks on Spotify based on a query. Results are limited by `manager.options.spotify.limitLoadSearch`.
  <br>
  <h5>Parameters</h5>

  ::field-group
    ::field{name="query" type="string" required}
    The search query.
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
  const results = await source.search('Never Gonna Give You Up');
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
  Load Spotify Content

  #description
  Loads content from a Spotify URL (track, album, playlist, artist) or a `sprec:` recommendation query. Handles URL normalization and limits results based on `manager.options.spotify` configurations.
  <br>
  <h5>Parameters</h5>

  ::field-group
    ::field{name="rawUrl" type="string" required}
    The Spotify URL or recommendation query to load.
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
  const track = await source.load('https://open.spotify.com/track/12345');
  const playlist = await source.load('https://open.spotify.com/playlist/67890');
  const recommendations = await source.load('sprec:seed_tracks=12345');
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
  Resolve Spotify Content

  #description
  Resolves Spotify content from a URL. This method is an alias for `load`.
  <br>
  <h5>Parameters</h5>

  ::field-group
    ::field{name="url" type="string" required}
    The Spotify URL to resolve.
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
  const resolvedTrack = await source.resolve('https://open.spotify.com/track/12345');
  ```
  ::
::
::
