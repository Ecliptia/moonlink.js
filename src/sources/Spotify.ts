import crypto from 'crypto';
import { Manager, ISource, encodeTrack } from '../../index';

export default class Spotify implements ISource {
  public name = 'Spotify';
  private manager: Manager;
  private accessToken: string | null = null;
  private clientToken: string | null = null;
  private tokenInitialized = false;

  private static TOTP_SECRET = new Uint8Array([
    53, 53, 48, 55, 49, 52, 53, 56, 53, 51, 52, 56, 55, 52, 57, 57,
    53, 57, 50, 50, 52, 56, 54, 51, 48, 51, 50, 57, 51, 52, 55,
  ]);

  constructor(manager: Manager) {
    this.manager = manager;
    this.manager.options.spotify = this.manager.options?.spotify ?? {};
    this.manager.emit('debug', 'Moonlink.js > Spotify > Source loaded');
    this.initTokens();
  }

  public match(url: string): boolean {
    return (
      url.includes('spotify.com') ||
      url.startsWith('spotify:') ||
      url.startsWith('spsearch:') ||
      url.startsWith('sprec:')
    );
  }

  private generateTotp(): [string, number] {
    const counter = Math.floor(Date.now() / 30000);
    const buf = Buffer.alloc(8);
    buf.writeBigInt64BE(BigInt(counter));
    const hmac = crypto.createHmac('sha1', Spotify.TOTP_SECRET).update(buf).digest();
    const offset = hmac[hmac.length - 1] & 0x0f;
    const bin =
      ((hmac[offset] & 0x7f) << 24) |
      ((hmac[offset + 1] & 0xff) << 16) |
      ((hmac[offset + 2] & 0xff) << 8) |
      (hmac[offset + 3] & 0xff);
    const totp = (bin % 1e6).toString().padStart(6, '0');
    return [totp, counter * 30000];
  }

  private async initTokens(): Promise<void> {
    if (this.tokenInitialized) return;
    const [totp, ts] = this.generateTotp();
    const params = new URLSearchParams({
      reason: 'init',
      productType: 'embed',
      totp,
      totpVer: '5',
      ts: ts.toString(),
    });

    const resp1 = await fetch(`https://open.spotify.com/api/token?${params}`, { headers: { accept: 'application/json' } });
    if (!resp1.ok) throw new Error('Failed to fetch Spotify access token');
    const tokenJson = (await resp1.json()) as { accessToken: string; clientId: string };

    const resp2 = await fetch('https://clienttoken.spotify.com/v1/clienttoken', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', accept: 'application/json' },
      body: JSON.stringify({
        client_data: {
          client_version: '1.2.9.2269',
          client_id: tokenJson.clientId,
          js_sdk_data: { device_type: 'computer' },
        },
      }),
    });
    if (!resp2.ok) this.manager.emit('debug', `Spotify client token error: ${resp2.status} ${resp2.statusText}`);
    const clientJson: any = await resp2.json();
    if (clientJson.response_type !== 'RESPONSE_GRANTED_TOKEN_RESPONSE') {
      this.manager.emit('debug', `Spotify client token error: ${clientJson.error}`);
    }

    this.accessToken = tokenJson.accessToken;
    this.clientToken = clientJson.granted_token.token;
    this.tokenInitialized = true;
  }

  private async apiRequest(path: string): Promise<any> {
    await this.initTokens();
    const url = path.startsWith('http') ? path : `https://api.spotify.com/v1${path}`;
    const resp = await fetch(url, {
      headers: {
        Authorization: `Bearer ${this.accessToken}`,
        'client-token': this.clientToken!,
        accept: 'application/json',
      },
    });
    if (!resp.ok) {
      if (resp.status === 401) {
        this.tokenInitialized = false;
        return this.apiRequest(path);
      }
      this.manager.emit('debug', `Spotify API request failed: ${resp.status} ${resp.statusText}`);
    }
    return resp.json();
  }

  private getLinkType(url: string): { type: string; id: string } | null {
    try {
      const { pathname } = new URL(url);
      const parts = pathname.split('/').filter(Boolean);
      const types = ['track', 'album', 'playlist', 'artist'];
      for (const type of types) {
        const idx = parts.indexOf(type);
        if (idx !== -1 && parts[idx + 1]) {
          return { type, id: parts[idx + 1].split('?')[0] };
        }
      }
    } catch {}
    const patterns: Record<string, RegExp> = {
      track: /(?:track\/|spotify:track:)([\w-]+)/,
      album: /(?:album\/|spotify:album:)([\w-]+)/,
      playlist: /(?:playlist\/|spotify:playlist:)([\w-]+)/,
      artist: /(?:artist\/|spotify:artist:)([\w-]+)/,
    };
    for (const type of Object.keys(patterns)) {
      const m = patterns[type].exec(url);
      if (m) return { type, id: m[1] };
    }
    return null;
  }

  private buildTrack(item: any, uri: string) {
    const artists = item.artists?.map((a: any) => a.name).join(', ') || '';
    const artwork = item.album?.images?.[0]?.url;
    const info = {
      identifier: item.id ?? 'local',
      uri,
      title: item.name ?? item.track?.name,
      author: artists,
      length: item.duration_ms ?? item.track?.duration_ms,
      isSeekable: true,
      isStream: false,
      artworkUrl: artwork || item.track?.album?.images?.[0]?.url,
      sourceName: this.name,
      position: 0,
      isrc: item.external_ids?.isrc ?? item.track?.external_ids?.isrc,
    };
    return { info, encoded: encodeTrack(info), pluginInfo: { MoonlinkInternal: true, needsStream: true } };
  }

  private async recommendations(params: string): Promise<any> {
    const limit = this.manager.options.spotify?.limitLoadRecommendations;
    const qp = params + (limit != null ? `&limit=${limit}` : '');
    const data = await this.apiRequest(`/recommendations?${qp}`);
    if (data.error) return { loadType: 'error', data: { message: 'Recommendations failed' } };
    let tracks = data.tracks.map((t: any) => this.buildTrack(t, `https://open.spotify.com/track/${t.id}`));
    return {
      loadType: 'playlist',
      data: { info: { name: 'Spotify Recommendations', selectedTrack: 0 }, tracks },
    };
  }

  public async search(query: string): Promise<any> {
    const limit = this.manager.options.spotify?.limitLoadSearch ?? 20;
    const data = await this.apiRequest(`/search?q=${encodeURIComponent(query)}&type=track&limit=${limit}`);
    if (data.error) return { loadType: 'error', data: { message: 'Search failed' } };
    if (!data.tracks?.items?.length) return { loadType: 'empty', data: {} };
    const tracks = data.tracks.items.map((t: any) => this.buildTrack(t, t.external_urls.spotify));
    return { loadType: 'search', data: tracks };
  }

  public async load(url: string): Promise<any> {
    if (url.startsWith('spsearch:')) {
      const q = url.replace(/^spsearch:/, '').trim();
      return this.search(q);
    }
    if (url.startsWith('sprec:')) {
      const params = url.replace(/^sprec:/, '');
      return this.recommendations(params);
    }

    const link = this.getLinkType(url);
    if (!link) return { loadType: 'error', data: { message: 'Invalid Spotify URL' } };

    if (link.type === 'track') {
      const data = await this.apiRequest(`/tracks/${link.id}`);
      if (data.error) return { loadType: 'error', data: { message: 'Track not found' } };
      return { loadType: 'track', data: this.buildTrack(data, url) };
    }

    if (link.type === 'artist') {
      const artistData = await this.apiRequest(`/artists/${link.id}`);
      if (artistData.error) return { loadType: 'error', data: { message: 'Artist not found' } };
      const top = await this.apiRequest(`/artists/${link.id}/top-tracks?market=US`);
      if (top.error) return { loadType: 'error', data: { message: 'Top tracks not found' } };
      let tracks = top.tracks.map((t: any) => this.buildTrack(t, `https://open.spotify.com/track/${t.id}`));
      const limit = this.manager.options.spotify?.limitLoadArtist;
      if (limit != null) tracks = tracks.slice(0, limit);
      return { loadType: 'playlist', data: { info: { name: artistData.name, selectedTrack: 0 }, tracks } };
    }

    const path = link.type === 'album' ? '/albums/' : '/playlists/';
    const col = await this.apiRequest(`${path}${link.id}`);
    if (col.error) return { loadType: 'error', data: { message: `${link.type.charAt(0).toUpperCase() + link.type.slice(1)} not found` } };
    const items = link.type === 'playlist' ? col.tracks.items.map((i: any) => i.track) : col.tracks.items;
    let sliced = items;
    if (link.type === 'playlist') {
      const limit = this.manager.options.spotify?.limitLoadPlaylist;
      if (limit != null) sliced = sliced.slice(0, limit);
    } else if (link.type === 'album') {
      const limit = this.manager.options.spotify?.limitLoadAlbum;
      if (limit != null) sliced = sliced.slice(0, limit);
    }
    const tracks = sliced.map((item: any) => this.buildTrack(item, `https://open.spotify.com/track/${item.id}`));
    return { loadType: 'playlist', data: { info: { name: col.name, selectedTrack: 0 }, tracks } };
  }

  public resolve(url: string): Promise<any> {
    return this.load(url);
  }
}
