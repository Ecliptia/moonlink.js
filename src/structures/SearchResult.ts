import { IPlaylistInfo, Track } from "../../index";

export class SearchResult {
  public query: string;
  public source: string;
  public tracks: Track[];
  public loadType: string;
  public playlistInfo: IPlaylistInfo;
  public error?: string;

  constructor(req: any, options: { query: string; source?: string; requester?: unknown }) {
    this.query = options.query;
    this.source = options.source || "unknown";
    this.loadType = req.loadType;
    this.tracks = this.resolveTracks(req, options.requester);
  }

  private resolveTracks(req: any, requester: unknown): Track[] {
    if (req.loadType === "error" || req.loadType === "empty") {
        this.error = req.data;
      return [];
    }

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

    return rawTracks.map((data: any) => new Track(data, requester));
  }
}
