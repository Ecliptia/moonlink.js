import { IPlaylistInfo, Track, ILavaSearchAlbum, ILavaSearchArtist, ILavaSearchPlaylist, ILavaSearchText, IRESTLoadTracks, ILavaSearchResultData } from "../../index";

export type LoadType = 'track' | 'search' | 'playlist' | 'error' | 'empty' | 'short';

export interface SearchResultOptions {
  query: string;
  source?: string;
  requester?: unknown;
}

export class SearchResult {
  public query: string;
  public source: string;
  public tracks: Track[];
  public loadType: LoadType;
  public playlistInfo: IPlaylistInfo;
  public error?: string;
  public albums?: ILavaSearchAlbum[];
  public artists?: ILavaSearchArtist[];
  public playlists?: ILavaSearchPlaylist[];
  public texts?: ILavaSearchText[];
  public lavasearchPluginInfo?: Object;
  public isLavaSearchResult?: boolean;

  constructor(req: any, options: SearchResultOptions) {
    this.query = options.query;
    this.source = options.source || "unknown";

    if (req?.albums || req?.artists || req?.playlists || req?.texts) {
      this.isLavaSearchResult = true;
      this.loadType = "search";

      if (req.tracks) {
        this.tracks = req.tracks.map((data) => new Track(data, options.requester));
      } else {
        this.tracks = [];
      }
      this.albums = req.albums;
      this.artists = req.artists;
      this.playlists = req.playlists;
      this.texts = req.texts;
      this.lavasearchPluginInfo = req.plugin;
      if (this.tracks.length > 0 && !this.albums && !this.artists && !this.playlists && !this.texts) {
        this.loadType = "track";
      } else if (this.playlists && this.playlists.length > 0) {
        this.loadType = "playlist";
        this.playlistInfo = this.playlists[0].info;
      }

    } else {
      this.isLavaSearchResult = false;
      this.loadType = req.loadType;
      this.tracks = this.resolveTracks(req, options.requester);
    }

    if (req.loadType === "error" || req.loadType === "empty") {
      this.error = req.data;
    }
  }

  private resolveTracks(req: any, requester: unknown): Track[] {
    let rawTracks: any[] = [];
    switch (req.loadType) {
      case "track":
      case "short":
        rawTracks = [req.data];
        break;
      case "search":
        rawTracks = req.data;
        break;
      case "playlist":
        rawTracks = req.data.tracks;
        this.playlistInfo = {
            duration: req.data.tracks.reduce(
                (acc, cur) => acc + cur.info.length,
                0,
              ),
            name: req.data.info.name,
            selectedTrack: req.data.info.selectedTrack,
        };
        break;
    }

    return rawTracks.map((data) => new Track(data, requester));
  }
  
  public getFirst(): Track | undefined {
    return this.tracks[0];
  }

  public getTotalDuration(): number {
    return this.tracks.reduce((acc, track) => acc + (track.duration || 0), 0);
  }
}
