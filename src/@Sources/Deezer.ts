import { MoonlinkTrack } from "../@Rest/MoonlinkTrack";
import { makeRequest } from "../@Rest/MakeRequest";
import { MoonlinkManager } from "../@Moonlink/MoonlinkManager";
export class Deezer {
  public manager: MoonlinkManager;
  constructor(options: MoonlinkManager, others: any) {
    this.manager = options;
  }
  public check(uri: string): any {
    return /^(?:https?:\/\/|)?(?:www\.)?deezer\.com\/(?:\w{2}\/)?(track|album|playlist|artist)\/(\d+)/.test(
      uri,
    );
  }
  public async request(endpoint: string): Promise<any> {
    let res = await makeRequest(
      `http://api.deezer.com${
        /^\//.test(endpoint) ? endpoint : `/${endpoint}`
      }`,
      {
        method: "GET",
        headers: {
          "User-Agent": "MoonQuest/Requester",
        },
      },
    ).catch((err) => {
      this.manager.emit(
        "debug",
        "[ @Moonlink/Deezer ]: unable to request Deezer " + err,
      );
    });
    return res;
  }
  public async resolve(url: string): Promise<any> {
    const [, type, id] =
      /^(?:https?:\/\/|)?(?:www\.)?deezer\.com\/(?:\w{2}\/)?(track|album|playlist|artist)\/(\d+)/.exec(
        url,
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
    const playlist = await this.request(`/playlist/${id}`);

    const unresolvedPlaylistTracks = await Promise.all(
      playlist.tracks.data.map((x) => this.buildUnresolved(x)),
    );
    return {
      loadType: "playlist",
      data: unresolvedPlaylistTracks,
      playlistInfo: playlist.title ? { name: playlist.title } : {},
    };
  }
  public async fetchAlbum(id: string): Promise<any> {
    const album = await this.request(`/albums/${id}`);

    const unresolvedPlaylistTracks = await Promise.all(
      album.track.data.map((x) => this.buildUnresolved(x)),
    );
    return {
      loadType: "playlist",
      data: unresolvedPlaylistTracks,
      playlistInfo: album.name ? { name: album.name } : {},
    };
  }
  public async fetchArtist(id: string): Promise<any> {
    const artist = await this.request(`/artist/${id}/top`);
    let nextPage = artist.next;
    let pageLoaded = 1;
    while (nextPage) {
      if (!nextPage) break;
      const req: any = await makeRequest(nextPage, { method: "GET" });
      artist.data.push(...req.data);
      nextPage = req.next;
      pageLoaded++;
    }
    const unresolvedPlaylistTracks = await Promise.all(
      artist.data.map((x) => this.buildUnresolved(x)),
    );

    return {
      loadType: "playlist",
      data: unresolvedPlaylistTracks,
      playlistInfo: artist.name ? { name: artist.name } : {},
    };
  }
  public async fetchTrack(id: string): Promise<any> {
    const data = await this.request(`/tracks/${id}`);
    const unresolvedTrack = await this.buildUnresolved(data);

    return {
      loadType: "track",
      data: [unresolvedTrack],
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
      data: unresolvedTracks,
      playlistInfo: {},
    };
  }
  public async buildUnresolved(track: any): Promise<any> {
    let res: any = await this.manager.search(
      `${track.artist ? track.artist.name : "Unknown"} ${track.title}`,
    );
    return new MoonlinkTrack({
      encoded: res.data[0].encoded,
      info: {
        sourceName: "deezer",
        identifier: track.id,
        isSeekable: true,
        author: track.artist ? track.artist.name : "Unknown",
        artworkUrl: track.md5_image,
        length: res.data[0].duration,
        isStream: false,
        title: track.title,
        uri: track.link,
        position: 0,
        isrc: res.data[0].isrc,
      },
    });
  }
}
