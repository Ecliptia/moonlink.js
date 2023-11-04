import { MoonlinkTrack } from "../@Rest/MoonlinkTrack";
import { makeRequest } from "../@Rest/MakeRequest";
import { MoonlinkManager } from "../@Moonlink/MoonlinkManager";

export class Deezer {
  public manager: MoonlinkManager;

  constructor(options: MoonlinkManager) {
    this.manager = options;
  }

  public check(uri: string): boolean {
    const deezerRegex =
      /^(?:https?:\/\/|)?(?:www\.)?deezer\.com\/(?:\w{2}\/)?(track|album|playlist|artist)\/(\d+)/;
    return deezerRegex.test(uri);
  }

  public async request(endpoint: string): Promise<any> {
    try {
      const url = `https://api.deezer.com${
        endpoint.startsWith("/") ? endpoint : `/${endpoint}`
      }`;
      const headers = {
        method: "GET",
        headers: {
          "User-Agent": "Moonlink/2.0",
        },
      };
      const res = await makeRequest(url, headers);
      return res;
    } catch (err) {
      this.manager.emit(
        "debug",
        "[ @Moonlink/Deezer ]: unable to request Deezer " + err,
      );
      throw err;
    }
  }

  public async resolve(url: string): Promise<any> {
    const [, type, id] =
      url.match(
        /(?:https?:\/\/|)?(?:www\.)?deezer\.com\/(?:\w{2}\/)?(track|album|playlist|artist)\/(\d+)/,
      ) || [];

    switch (type) {
      case "playlist":
        return await this.fetchPlaylist(id);
      case "track":
        return this.fetchTrack(id);
      case "album":
        return this.fetchAlbum(id);
      case "artist":
        return this.fetchArtist(id);
    }
  }

  public async fetchPlaylist(id: string): Promise<any> {
    const playlist = await this.request(`/playlist/${id}`);
    const unresolvedPlaylistTracks = await Promise.all(
      playlist.tracks.data.map((x) => this.buildUnresolved(x)),
    );

    return {
      loadType: "playlist",
      tracks: unresolvedPlaylistTracks,
      playlistInfo: playlist.title ? { name: playlist.title } : {},
    };
  }

  public async fetchAlbum(id: string): Promise<any> {
    const album = await this.request(`/album/${id}`);
    const unresolvedAlbumTracks = await Promise.all(
      album.tracks.data.map((x) => this.buildUnresolved(x)),
    );
    return {
      loadType: "playlist",
      tracks: unresolvedAlbumTracks,
      playlistInfo: album.title ? { name: album.title } : {},
    };
  }

  public async fetchArtist(id: string): Promise<any> {
    const artist = await this.request(`/artist/${id}/top?limit=50`);
    let nextPage = artist.next;
    let pageLoaded = 1;

    while (nextPage) {
      if (!nextPage) break;
      const req: any = await makeRequest(nextPage, { method: "GET" });
      artist.data.push(...req.data);
      nextPage = req.next;
      pageLoaded++;
    }

    const unresolvedArtistTracks = await Promise.all(
      artist.data.map((x) => this.buildUnresolved(x)),
    );

    return {
      loadType: "playlist",
      tracks: unresolvedArtistTracks,
      playlistInfo: artist.name ? { name: artist.name } : {},
    };
  }

  public async fetchTrack(id: string): Promise<any> {
    const data = await this.request(`/track/${id}`);
    const unresolvedTrack = await this.buildUnresolved(data);

    return {
      loadType: "track",
      tracks: [unresolvedTrack],
      playlistInfo: {},
    };
  }

  public async fetch(query: string): Promise<any> {
    if (this.check(query)) return this.resolve(query);

    const data = await this.request(`/search?q="${query}"`);
    const unresolvedTracks = await Promise.all(
      data.data.map((x) => this.buildUnresolved(x)),
    );

    return {
      loadType: "track",
      tracks: [unresolvedTracks],
      playlistInfo: {},
    };
  }

  public async buildUnresolved(track: any): Promise<any> {
    let res: any = await this.manager.search(
      `${track.artist ? track.artist.name : "Unknown"} ${track.title}`,
    );
    return new MoonlinkTrack({
      encoded: res.tracks[0].encoded,
      info: {
        sourceName: "deezer",
        identifier: track.id,
        isSeekable: true,
        author: track.artist ? track.artist.name : "Unknown",
        artworkUrl: res.tracks[0].artworkUrl,
        length: res.tracks[0].duration,
        isStream: false,
        title: track.title,
        uri: track.link,
        position: 0,
        isrc: track.isrc,
      },
    });
  }
}
