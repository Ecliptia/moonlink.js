import { Plugin, MoonlinkManager, MoonlinkTrack, makeRequest, SearchResult, SearchQuery } from '../../index';

interface SpotifyOptions {
  clientSecret?: string;
  clientId?: string;
  searchMarket?: string;
  artistLimit?: number;
  albumLimit?: number;
}

export class Spotify  {
  private token: string | null = null;
  private interval: number | null = null;
  private clientId: string | null = null;
  private clientSecret: string | null = null;
  private authorization: string | null = null;
  private searchMarket: string | null = null;
  private artistLimit: number | null = null;
  private albumLimit: number | null = null;
  public manager: MoonlinkManager;
  private searchDefault: any;
  constructor(data: SpotifyOptions, manager: MoonlinkManager) {
    if (data?.clientSecret && data?.clientId) {
      this.clientSecret = data.clientSecret;
      this.clientId = data.clientId
    }
    this.manager = manager;
    this.searchMarket = data?.searchMarket || 'US';
    this.artistLimit = data?.artistLimit || null;
    this.albumLimit = data?.albumLimit || null;
		this.init()
  }
  private async init(): Promise<void> {
		await this.requestToken();
	}
  private handleError(message: string, err?: Error): void {
    this.manager.emit('debug', `[ @Moonlink/Spotify ]: ${message}`);
    if (err) {
      console.error(err);
    }
  }

  async fetchPlaylist(id: string): Promise<any> {
      const playlist = await this.request(`/playlists/${id}`);
			
      const allTracks = await this.fetchAllTracks(playlist.tracks);

      return {
        loadType: 'playlist',
        tracks: allTracks,
        playlistInfo: playlist.name ? { name: playlist.name } : {},
      };
  }

  private async fetchAllTracks(initialPage: any): Promise<any[]> {
  const items = initialPage.items || [];
  let nextPage = initialPage.next;
  const trackPromises = [];

  while (nextPage) {
		if (!nextPage) break;
    try {
      const req: any = await makeRequest(nextPage, {
        headers: { Authorization: this.token },
      });

      if (!req.error) {
        items.push(...(req.items || []));
        nextPage = req.next;
      } else {
        console.error("Error when searching for next page of tracks:", req.error);
        break;
      }
    } catch (error) {
      console.error("Error making HTTP request:", error);
      break;
    }
  }

  for (const item of items) {
    trackPromises.push(this.buildUnresolved(item.track));
  }

  return Promise.all(trackPromises);
}

  async requestToken(): Promise<void> {
  try {
    if (!this.clientId || !this.clientSecret) {
      const { accessToken, accessTokenExpirationTimestampMs } = await makeRequest(
        'https://open.spotify.com/get_access_token',
        { headers: {} }
      );

      this.token = `Bearer ${accessToken}`;
      this.interval = accessTokenExpirationTimestampMs * 1000;
    } else {
      this.authorization = Buffer.from(`${this.clientId}:${this.clientSecret}`).toString('base64');

      const { access_token, expires_in } = await makeRequest(
        'https://accounts.spotify.com/api/token?grant_type=client_credentials',
        {
          method: 'POST',
          headers: {
            Authorization: `Basic ${this.authorization}`,
            'Content-Type': 'application/x-www-form-urlencoded',
          },
        }
      );

      this.token = `Bearer ${access_token}`;
      this.interval = expires_in * 1000;
    }
  } catch (err) {
    this.handleError('[ @Moonlink/Spotify ]: An error occurred while making the request', err);
  }
}

  async renew(): Promise<void> {
    if (Date.now() >= (this.interval || 0)) {
      await this.requestToken();
    }
  }

  async request(endpoint: string): Promise<any> {
    await this.renew();

    const res = await makeRequest(
      `https://api.spotify.com/v1${
        /^\//.test(endpoint) ? endpoint : `/${endpoint}`
      }`,
      {
        headers: { Authorization: this.token },
      }
    ).catch((err) => {
      this.handleError(
        '[ @Moonlink/Spotify ]: unable to request Spotify ' + err
      );
    });
    return await res;
  }

  async resolve(url: string): Promise<any> {
    if (!this.token) {
      await this.requestToken();
    }
    const [, type, id] =
      /^(?:https:\/\/open\.spotify\.com\/(?:user\/[A-Za-z0-9]+\/)?|spotify:)(album|playlist|track|artist)(?:[/:])([A-Za-z0-9]+).*$/.exec(
        url
      ) || [];

    switch (type) {
      case 'playlist': {
        return this.fetchPlaylist(id);
      }
      case 'track': {
        return this.fetchTrack(id);
      }
      case 'album': {
        return this.fetchAlbum(id);
      }
      case 'artist': {
        return this.fetchArtist(id);
      }
      default: {
        return null;
      }
    }
  }

  async fetchAlbum(id: string): Promise<any> {
    const album = await this.request(`/albums/${id}`);
    const unresolvedPlaylistTracks = await Promise.all(
      album.tracks.items.map((x) => this.buildUnresolved(x))
    )
    return {
      loadType: 'playlist',
      tracks: unresolvedPlaylistTracks,
      playlistInfo: album.name ? { name: album.name } : {},
    };
  }

  async fetchArtist(id: string): Promise<any> {
    const artist = await this.request(`/artists/${id}`);
    const data = await this.request(
      `/artists/${id}/top-tracks?market=${this.searchMarket}`
    );
    const limitedTracks = this.artistLimit
      ? data.tracks.slice(0, this.artistLimit * 100)
      : data.tracks;
    const unresolvedPlaylistTracks = await Promise.all(
      limitedTracks.map((x) => this.buildUnresolved(x))
    );
    return {
      loadType: 'playlist',
      tracks: unresolvedPlaylistTracks,
      playlistInfo: artist.name ? { name: artist.name } : {},
    };
  }

  async fetchTrack(id: string): Promise<any> {
    const data = await this.request(`/tracks/${id}`);
    const unresolvedTrack = await this.buildUnresolved(data);
    return {
      loadType: 'track',
      tracks: [unresolvedTrack],
      playlistInfo: {},
    };
  }

  async fetch(query: string): Promise<any> {
    if (this.isSpotifyUrl(query)) return this.resolve(query);
    const data = await this.request(
      `/search/?q="${query}"&type=artist,album,track&market=${this.searchMarket}`
    );
    const unresolvedTracks = await Promise.all(
      data.tracks.items.map((x) => this.buildUnresolved(x))
    );
    return {
      loadType: 'track',
      tracks: unresolvedTracks,
      playlistInfo: {},
    };
  }

   isSpotifyUrl(url: string): boolean {
    return /^(?:https:\/\/open\.spotify\.com\/(?:user\/[A-Za-z0-9]+\/)?|spotify:)(album|playlist|track|artist)(?:[/:])([A-Za-z0-9]+).*$/.test(
      url
    );
  }

  async buildUnresolved(track: any): Promise<any> {
    if (!track) {
      throw new ReferenceError('The Spotify track object was not provided');
    }
    const res: any = await this.manager.search(
      `${track.artists ? track.artists[0]?.name : 'Unknown Artist'} ${
        track.name
      }`
    );
    return new MoonlinkTrack({
      encoded: res.tracks[0].encoded,
      info: {
        sourceName: 'spotify',
        identifier: track.id,
        isSeekable: true,
        author: track.artists ? track.artists[0]?.name : 'Unknown Artist',
        length: track.duration_ms,
        isStream: false,
        title: track.name,
        uri: `https://open.spotify.com/track/${track.id}`,
        position: 0,
        isrc: res.tracks[0].isrc,
				artworkUrl: res.tracks[0].artworkUrl,
      },
    });
  }
}