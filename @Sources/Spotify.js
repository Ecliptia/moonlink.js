
const { MoonlinkTrack } = require('../@Rest/MoonlinkTrack.js')

const makeRequest = require('../@Rest/MakeRequest.js')
class Spotify {
  //based: https://github.com/parasop/poru/blob/main/src/platform/Spotify.js
  #token;
  #interval;
  #authorization;
  constructor(options, others) {
    this.manager = options
    this.options = others
    this.clientId = this.options.clientId || null;
    this.clientSecret = this.options.clientSecret || null
    this.requestToken()
  }
  check(uri) {
    return /^(?:https:\/\/open\.spotify\.com\/(?:user\/[A-Za-z0-9]+\/)?|spotify:)(album|playlist|track|artist)(?:[/:])([A-Za-z0-9]+).*$/.test(uri);
  }
  async requestToken() {
    if (!this.clientId && !this.clientSecret) {
      let res = await makeRequest('https://open.spotify.com/get_access_token', 'GET', {
        headers: {}
      }).catch(err => {
        this.manager.emit('debug', '[ Moonlink/Sources/Spotify ]: An error occurred while making the request')
        return;
      })

      let access = res.accessToken

      this.#token = `Bearer ${access}`;
      this.#interval = res.accessTokenExpirationTimestampMs * 1000;
      return;
    }
    this.#authorization = Buffer.from(`${this.clientID}:${this.clientSecret}`).toString("base64");
    let res = await makeRequest("https://accounts.spotify.com/api/token?grant_type=client_credentials", "POST", {
      headers: {
        Authorization: `Basic ${this.#authorization}`,
        "Content-Type": "application/x-www-form-urlencoded",
      }
    }).catch(err => {
      this.manager.emit('debug', '[ @Moonlink/Sources/Spotify ]: There was an error requesting your Spotify authorization')
      return;
    })
    this.#token = `Bearer ${res.access_token}`;
    this.#interval = res.expires_in * 1000;
  }
  async renew() {
    if (Date.now() >= this.#interval) {
      await this.requestToken();
    }
  }
  async request(endpoint) {
    await this.renew();

    let res = await makeRequest(`https://api.spotify.com/v1${/^\//.test(endpoint) ? endpoint : `/${endpoint}`}`, "GET",
      {
        headers: { Authorization: this.#token },
      }).catch(err => {

        this.manager.emit('debug', "[ @Moonlink/Sources/Spotify ]: unable to request Spotify " + err)

      })
    return res;
  }
  async resolve(url) {
    if (!this.token) await this.requestToken();
    await this.renew();
    const [, type, id] = /^(?:https:\/\/open\.spotify\.com\/(?:user\/[A-Za-z0-9]+\/)?|spotify:)(album|playlist|track|artist)(?:[/:])([A-Za-z0-9]+).*$/.exec(url) ?? [];

    switch (type) {
      case "playlist": {
        return this.fetchPlaylist(id);
      }
      case "track": {
        return this.fetchTrack(id);
      }
      case "album": {
        return this.fetchAlbum(id);
      }
      case "artist": {
        return this.fetchArtist(id);
      }
    }
  }
  async fetchPlaylist(id) {
    const playlist = await this.request(`/playlists/${id}`);
    let nextPage = playlist.tracks.next;
    let pageLoaded = 1;
    while (nextPage) {
      if (!nextPage) break;
      const req = await makeRequest(nextPage, "GET", {
        headers: { Authorization: this.#token },
      });
      if (req.error) break;
      playlist.tracks.items.push(...req.items);
      nextPage = req.next;
      pageLoaded++;
    }
    const limitedTracks = this.options.playlistLimit
      ? playlist.tracks.items.slice(0, this.options.playlistLimit * 100)
      : playlist.tracks.items;
    const unresolvedPlaylistTracks = await Promise.all(
      limitedTracks.map((x) => this.buildUnresolved(x.track))
    );
    return {
      loadType: "PLAYLIST_LOADED",
      tracks: unresolvedPlaylistTracks,
      playlistInfo: playlist.name ? { name: playlist.name } : {},
    }
  }
  async fetchAlbum(id) {
    const album = await this.request(`/albums/${id}`);

    const limitedTracks = this.options.albumLimit
      ? album.tracks.items.slice(0, this.options.albumLimit * 100)
      : album.tracks.items;

    const unresolvedPlaylistTracks = await Promise.all(
      limitedTracks.map((x) => this.buildUnresolved(x))
    );
    return {
      loadType: "PLAYLIST_LOADED",
      tracks: unresolvedPlaylistTracks,
      playlistInfo: album.name ? { name: album.name } : {}
    }
  }
  async fetchArtist(id) {
    const artist = await this.request(`/artists/${id}`);
    const data = await this.request(
      `/artists/${id}/top-tracks?market=${this.options.searchMarket ?? "US"}`
    );

    const limitedTracks = this.options.artistLimit
      ? data.tracks.slice(0, this.options.artistLimit * 100)
      : data.tracks;

    const unresolvedPlaylistTracks = await Promise.all(
      limitedTracks.map((x) => this.buildUnresolved(x))
    );

    return {
      loadType: "PLAYLIST_LOADED",
      tracks: unresolvedPlaylistTracks,
      playlistInfo: artist.name ? { name: artist.name } : {}
    }
  }
  async fetchTrack(id) {
    const data = await this.request(`/tracks/${id}`);
    const unresolvedTrack = await this.buildUnresolved(data);

    return {
      loadType: "TRACK_LOADED", tracks: [unresolvedTrack],
      playlistInfo: {}
    }
  }
  async fetch(query) {
    if (this.check(query)) return this.resolve(query);

    const data = await this.request(
      `/search/?q="${query}"&type=artist,album,track&market=${this.options.searchMarket ?? "US"
      }`
    );
    const unresolvedTracks = await Promise.all(
      data.tracks.items.map((x) => this.buildUnresolved(x))
    );
    return {
      loadType: "TRACK_LOADED", tracks: unresolvedTracks, playlistInfo: {}
    }

  }
  async buildUnresolved(track) {
    if (!track)
      throw new ReferenceError("The Spotify track object was not provided");
    let res = await this.manager.search(`${track.artists ? track.artists[0]?.name : "Unknown Artist"} ${track.name}`)

    let encodedTrack;
    res.tracks[0].encodedTrack ? encodedTrack = res.tracks[0].encodedTrack : encodedTrack = res.tracks[0].track
    return new MoonlinkTrack({
      track: encodedTrack,
      info: {
        sourceName: "spotify",
        identifier: track.id,
        isSeekable: true,
        author: track.artists ? track.artists[0]?.name : "Unknown Artist",
        length: track.duration_ms,
        isStream: false,
        title: track.name,
        uri: `https://open.spotify.com/track/${track.id}`,
        image: track.album?.images[0]?.url,
      },
    })
  }
}
module.exports = Spotify;