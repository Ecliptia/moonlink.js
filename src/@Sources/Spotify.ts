import { MoonlinkTrack } from "../@Rest/MoonlinkTrack";
import { makeRequest } from "../@Rest/MakeRequest";
import { MoonlinkManager } from "../@Moonlink/MoonlinkManager";
export class Spotify {
 private token: string | null;
 private interval: number | null;
 private authorization: string | null;
 public manager: MoonlinkManager;
 public options: any;
 public clientId: string | null;
 public clientSecret: string | null;
 constructor(options: MoonlinkManager, others: any) {
  this.manager = options;
  this.options = others;
  this.clientId = this.options.clientId || null;
  this.clientSecret = this.options.clientSecret || null;
  this.requestToken();
 }
 public check(uri: string): any {
  return /^(?:https:\/\/open\.spotify\.com\/(?:user\/[A-Za-z0-9]+\/)?|spotify:)(album|playlist|track|artist)(?:[/:])([A-Za-z0-9]+).*$/.test(
   uri
  );
 }
 public async requestToken(): Promise<void> {
  if (!this.clientId && !this.clientSecret) {
   let res: any = await makeRequest(
    "https://open.spotify.com/get_access_token",
    {
     headers: {},
    }
   ).catch((err) => {
    this.manager.emit(
     "debug",
     "[ @Moonlink/Spotify ]: An error occurred while making the request"
    );
    return;
   });

   let access: any = res.accessToken;

   this.token = `Bearer ${access}`;
   this.interval = res.accessTokenExpirationTimestampMs * 1000;
   return;
  }
  this.authorization = Buffer.from(
   `${this.clientId}:${this.clientSecret}`
  ).toString("base64");
  let res: any = await makeRequest(
   "https://accounts.spotify.com/api/token?grant_type=client_credentials",
   {
    method: "POST",
    headers: {
     Authorization: `Basic ${this.authorization}`,
     "Content-Type": "application/x-www-form-urlencoded",
    },
   }
  ).catch((err) => {
   this.manager.emit(
    "debug",
    "[ @Moonlink/Spotify ]: There was an error requesting your Spotify authorization"
   );
   return;
  });
  this.token = `Bearer ${res.access_token}`;
  this.interval = res.expires_in * 1000;
 }
 public async renew(): Promise<void> {
  if (Date.now() >= this.interval) {
   await this.requestToken();
  }
 }
 public async request(endpoint: string): Promise<any> {
  await this.renew();

  let res = await makeRequest(
   `https://api.spotify.com/v1${
    /^\//.test(endpoint) ? endpoint : `/${endpoint}`
   }`,
   {
    headers: { Authorization: this.token },
   }
  ).catch((err) => {
   this.manager.emit(
    "debug",
    "[ @Moonlink/Spotify ]: unable to request Spotify " + err
   );
  });
  return res;
 }
 public async resolve(url: string): Promise<any> {
  if (!this.token) await this.requestToken();
  await this.renew();
  const [, type, id] =
   /^(?:https:\/\/open\.spotify\.com\/(?:user\/[A-Za-z0-9]+\/)?|spotify:)(album|playlist|track|artist)(?:[/:])([A-Za-z0-9]+).*$/.exec(
    url
   ) ?? [];

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
 public async fetchPlaylist(id: string): Promise<any> {
  const playlist = await this.request(`/playlists/${id}`);
  let nextPage = playlist.tracks.next;
  let pageLoaded = 1;
  while (nextPage) {
   if (!nextPage) break;
   const req: any = await makeRequest(nextPage, {
    headers: { Authorization: this.token },
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
  };
 }
 public async fetchAlbum(id: string): Promise<any> {
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
   playlistInfo: album.name ? { name: album.name } : {},
  };
 }
 public async fetchArtist(id: string): Promise<any> {
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
   playlistInfo: artist.name ? { name: artist.name } : {},
  };
 }
 public async fetchTrack(id: string): Promise<any> {
  const data = await this.request(`/tracks/${id}`);
  const unresolvedTrack = await this.buildUnresolved(data);

  return {
   loadType: "TRACK_LOADED",
   tracks: [unresolvedTrack],
   playlistInfo: {},
  };
 }
 public async fetch(query: string): Promise<any> {
  if (this.check(query)) return this.resolve(query);

  const data = await this.request(
   `/search/?q="${query}"&type=artist,album,track&market=${
    this.options.searchMarket ?? "US"
   }`
  );
  const unresolvedTracks = await Promise.all(
   data.tracks.items.map((x) => this.buildUnresolved(x))
  );
  return {
   loadType: "TRACK_LOADED",
   tracks: unresolvedTracks,
   playlistInfo: {},
  };
 }
 public async buildUnresolved(track: any): Promise<any> {
  if (!track)
   throw new ReferenceError("The Spotify track object was not provided");
  let res: any = await this.manager.search(
   `${track.artists ? track.artists[0]?.name : "Unknown Artist"} ${track.name}`
  );

  let enTrack: any;
  res.tracks[0].encodedTrack
   ? (enTrack = res.tracks[0].encodedTrack)
   : res.tracks[0].encoded
   ? (enTrack = res.tracks[0].encoded)
   : (enTrack = res.tracks[0].track);
  return new MoonlinkTrack({
   track: enTrack,
   encoded: null,
   trackEncoded: null,
   info: {
    sourceName: "spotify",
    identifier: track.id,
    isSeekable: true,
    author: track.artists ? track.artists[0]?.name : "Unknown Artist",
    length: track.duration_ms,
    isStream: false,
    title: track.name,
    uri: `https://open.spotify.com/track/${track.id}`,
    position: 0,
   },
  });
 }
}
