
import { Manager, ISource, encodeTrack } from '../../index';

const SPOTIFY_API_BASE_URL = 'https://api.spotify.com/v1';

export default class Spotify implements ISource {
  public name = 'Spotify';
  private manager: Manager;
  private accessToken: string | null = null;
  private clientId: string | null = null;
  private clientSecret: string | null = null;
  private tokenInitialized = false;

  constructor(manager: Manager) {
    this.manager = manager;
    this.manager.options.spotify = this.manager.options?.spotify ?? {};
    this.manager.emit('debug', 'Moonlink.js > Spotify > source loaded');
  }

  public match(url: string): boolean {
    return (
      url.includes('spotify.com') ||
      url.startsWith('spotify:') ||
      url.startsWith('spsearch:') ||
      url.startsWith('sprec:')
    );
  }

  private async initTokens(): Promise<void> {
    if (this.tokenInitialized) return;

    try {
      this.clientId = this.manager.options.spotify?.clientId;
      this.clientSecret = this.manager.options.spotify?.clientSecret;

      if (!this.clientId || !this.clientSecret) {
        this.manager.emit('debug', 'Moonlink.js > Spotify > Client ID or Client Secret not provided.');
        return;
      }

      const auth = Buffer.from(`${this.clientId}:${this.clientSecret}`).toString('base64');

      const tokenResponse = await fetch('https://accounts.spotify.com/api/token', {
        method: 'POST',
        headers: {
          Authorization: `Basic ${auth}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: 'grant_type=client_credentials',
      });

      if (!tokenResponse.ok) {
        const errorBody = await tokenResponse.text();
        this.manager.emit(
          'debug',
          `Moonlink.js > Spotify > Error initializing token: ${tokenResponse.status} - ${errorBody}`
        );
        return;
      }

      const { access_token: accessToken } = (await tokenResponse.json()) as any;
      this.accessToken = accessToken;
      this.tokenInitialized = true;
      this.manager.emit('debug', 'Moonlink.js > Spotify > Tokens initialized successfully');
    } catch (e: any) {
      this.manager.emit('debug', `Error initializing Spotify tokens: ${e.message}`);
    }
  }

  private async apiRequest(path: string): Promise<any> {
    await this.initTokens();

    if (!this.accessToken || !this.clientId) {
      this.manager.emit('debug', 'Moonlink.js > Spotify > API request failed: Tokens not available');
      return null;
    }

    try {
      const url = path.startsWith('http') ? path : `${SPOTIFY_API_BASE_URL}${path}`;

      const res = await fetch(url, {
        headers: {
          Authorization: `Bearer ${this.accessToken}`,
          Accept: 'application/json',
        },
      });

      if (res.status === 401) {
        this.tokenInitialized = false;
        return this.apiRequest(path);
      }

      if (!res.ok) {
        this.manager.emit('debug', `Moonlink.js > Spotify > API error: ${res.status} ${res.statusText}`);
        return null;
      }

      return res.json();
    } catch (e: any) {
      this.manager.emit('debug', `Error in Spotify apiRequest: ${e.message}`);
      return null;
    }
  }

  private buildTrack(item: any, uri?: string) {
    const trackUri = uri ?? item.uri ?? `https://open.spotify.com/track/${item.id}`;

    const info = {
      identifier: item.id ?? 'local',
      uri: trackUri,
      title: item.name ?? 'Unknown Title',
      author: item.artists?.map((a: any) => a.name).join(', ') ?? 'Unknown Artist',
      length: item.duration_ms ?? 0,
      isSeekable: true,
      isStream: false,
      artworkUrl: item.album?.images?.[0]?.url,
      sourceName: this.name,
      position: 0,
      isrc: item.external_ids?.isrc,
    };

    return {
      info,
      encoded: encodeTrack(info),
      pluginInfo: { MoonlinkInternal: true, needsStream: true },
    };
  }

  public async search(query: string, options?: { limit?: number }) {
    const limit = options?.limit ?? this.manager.options.spotify?.limitLoadSearch ?? 20;
    const data = await this.apiRequest(
      `/search?q=${encodeURIComponent(query)}&type=track&limit=${limit}`
    );

    if (!data || data.error) {
      this.manager.emit('debug', `Moonlink.js > Spotify > Search failed: ${data?.error?.message}`);
      return { loadType: 'error', data: { message: 'Search failed on Spotify.' } };
    }

    if (!data.tracks?.items?.length) {
      return { loadType: 'empty', data: {} };
    }

    return {
      loadType: 'search',
      data: data.tracks.items.map((t: any) => this.buildTrack(t)),
    };
  }

  private async recommendations(params: string) {
    const limit = this.manager.options.spotify?.limitLoadRecommendations ?? 20;
    const queryString = `${params}&limit=${limit}`;
    const data = await this.apiRequest(`/recommendations?${queryString}`);

    if (!data || data.error) {
      this.manager.emit('debug', `Moonlink.js > Spotify > Recommendations failed: ${data?.error?.message}`);
      return { loadType: 'error', data: { message: 'Failed to load recommendations.' } };
    }

    if (!data.tracks?.length) {
      return { loadType: 'empty', data: {} };
    }

    return {
      loadType: 'playlist',
      data: {
        info: { name: 'Spotify Recommendations', selectedTrack: 0 },
        tracks: data.tracks.map((t: any) => this.buildTrack(t)),
      },
    };
  }

  public async load(rawUrl: string, options?: { limit?: number }) {
    const normalized = rawUrl
      .replace(/open\.spotify\.com\/intl-[^/]+\//, 'open.spotify.com/')
      .split('?')[0];

    if (normalized.startsWith('spsearch:')) {
      return this.search(normalized.slice(9).trim());
    }

    if (normalized.startsWith('sprec:')) {
      return this.recommendations(normalized.slice(6));
    }

    const link = this.getLinkType(normalized);
    if (!link) {
      return { loadType: 'error', data: { message: 'Invalid Spotify URL' } };
    }

    switch (link.type) {
      case 'track': {
        const data = await this.apiRequest(`/tracks/${link.id}`);
        if (!data || data.error) {
          return { loadType: 'error', data: { message: 'Track not found.' } };
        }
        return { loadType: 'track', data: this.buildTrack(data, normalized) };
      }

      case 'artist': {
        const artistInfo = await this.apiRequest(`/artists/${link.id}`);
        const topTracks = await this.apiRequest(`/artists/${link.id}/top-tracks?market=US`);
        if (!artistInfo || !topTracks?.tracks) {
          return { loadType: 'error', data: { message: 'Artist not found.' } };
        }

        let tracks = topTracks.tracks.map((t: any) => this.buildTrack(t));
        const max = options?.limit ?? this.manager.options.spotify?.limitLoadArtist;
        if (max != null) tracks = tracks.slice(0, max);

        return {
          loadType: 'playlist',
          data: { info: { name: `${artistInfo.name}'s Top Tracks`, selectedTrack: 0 }, tracks },
        };
      }

      case 'album':
      case 'playlist': {
        const base = link.type === 'album' ? 'albums' : 'playlists';
        const pageLimit = 
          link.type === 'playlist'
            ? this.manager.options.spotify?.limitLoadPlaylistPage ?? 100
            : this.manager.options.spotify?.limitLoadAlbumPage ?? 50;

        const data = await this.apiRequest(`/${base}/${link.id}?limit=${pageLimit}`);
        if (!data || data.error) {
          return { loadType: 'error', data: { message: `${link.type} not found.` } };
        }

        let items =
          link.type === 'playlist'
            ? data.tracks.items.map((i: any) => i.track)
            : data.tracks.items;
        items = items.filter(Boolean);

        let next = data.tracks.next;
        const max =
          options?.limit ??
          (link.type === 'playlist'
            ? this.manager.options.spotify?.limitLoadPlaylist ??
              this.manager.options.playlistLoadLimit
            : this.manager.options.spotify?.limitLoadAlbum ??
              this.manager.options.playlistLoadLimit);

        while (next && (!max || items.length < max)) {
          const nextPage = await this.apiRequest(next);
          if (!nextPage || nextPage.error) break;
          const newItems =
            link.type === 'playlist'
              ? nextPage.items.map((i: any) => i.track)
              : nextPage.items;
          items.push(...newItems.filter(Boolean));
          next = nextPage.next;
        }

        if (max != null) items = items.slice(0, max);

        const tracks = items.map((item: any) =>
          this.buildTrack(item, item.external_urls?.spotify)
        );
        return {
          loadType: 'playlist',
          data: { info: { name: data.name, selectedTrack: 0 }, tracks },
        };
      }

      default:
        return { loadType: 'error', data: { message: 'Unsupported Spotify URL type' } };
    }
  }

  private getLinkType(url: string): { type: string; id: string } | null {
    const regex: Record<string, RegExp> = {
      track: /(?:open\.spotify\.com\/(?:intl-[^/]+\/)?track\/|spotify:track:)(\w+)/,
      album: /(?:open\.spotify\.com\/(?:intl-[^/]+\/)?album\/|spotify:album:)(\w+)/,
      playlist: /(?:open\.spotify\.com\/(?:intl-[^/]+\/)?playlist\/|spotify:playlist:)(\w+)/,
      artist: /(?:open\.spotify\.com\/(?:intl-[^/]+\/)?artist\/|spotify:artist:)(\w+)/,
    };

    for (const type in regex) {
      const match = url.match(regex[type]);
      if (match) {
        return { type, id: match[1] };
      }
    }

    return null;
  }

  public resolve(url: string) {
    return this.load(url);
  }
}
