import { Node, makeRequest, sources, stringifyWithReplacer } from "../../index";
import {
  IRESTOptions,
  IRESTLoadTracks,
  IRESTGetLyrics,
  IRESTGetPlayers,
} from "../typings/Interfaces";
export class Rest {
  public node: Node;
  public url: string;
  public defaultHeaders: Record<string, string>;
  constructor(node: Node) {
    this.node = node;
    this.url = `http${this.node.secure ? "s" : ""}://${this.node.address}/${this.node.pathVersion}`;
    this.defaultHeaders = {
      Authorization: this.node.password,
      Accept: "application/json",
      "User-Agent": `Moonlink.js/${node.manager.version} (BurntToast/25.12.2025)`,
      "Content-Type": "application/json",
      "accept-encoding": "br, gzip, deflate"
    };
  }
  public async loadTracks(source: string, query: string): Promise<any> {
    return new Promise(async resolve => {
      let identifier: string;
      if (query.startsWith("http://") || query.startsWith("https://")) {
        identifier = query;
      } else if (source === "flowerytts" || source === "tts") {
        identifier = query;
      } else {
        identifier = `${sources[source] ?? source}:${query}`;
      }

      let params = new URLSearchParams({
        identifier,
      });
      let request: IRESTLoadTracks = await makeRequest(`${this.url}/loadtracks?${params}`, {
        method: "GET",
        headers: this.defaultHeaders,
      });
      return resolve(request);
    });
  }
  public async update(data: IRESTOptions): Promise<unknown> {
    let request = await makeRequest(
      `${this.url}/sessions/${this.node.sessionId}/players/${data.guildId}`,
      {
        method: "PATCH",
        body: stringifyWithReplacer(data.data) as any,
        headers: this.defaultHeaders,
      }
    );

    return request;
  }
  public async destroy(guildId: string): Promise<unknown> {
    let request = await makeRequest(
      `${this.url}/sessions/${this.node.sessionId}/players/${guildId}`,
      {
        method: "DELETE",
        headers: this.defaultHeaders,
      }
    );

    return request;
  }
  public getInfo(): Promise<unknown> {
    return makeRequest(`${this.url}/info`, {
      method: "GET",
      headers: this.defaultHeaders,
    });
  }
  public getStats(): Promise<unknown> {
    return makeRequest(`${this.url}/stats`, {
      method: "GET",
      headers: this.defaultHeaders,
    });
  }
  public getVersion(): Promise<unknown> {
    return makeRequest(`http${this.node.secure ? "s" : ""}://${this.node.address}/version`, {
      method: "GET",
      headers: this.defaultHeaders,
    });
  }
  public getLyrics(data: { encoded: string }): Promise<IRESTGetLyrics> {
    return makeRequest(`${this.url}/loadlyrics?encodedTrack=${encodeURIComponent(data.encoded)}`, {
      method: "GET",
      headers: this.defaultHeaders,
    });
  }
  public async updateSession(sessionId: string, data: any): Promise<any> {
    return makeRequest(`${this.url}/sessions/${sessionId}`, {
      method: "PATCH",
      body: stringifyWithReplacer(data),
      headers: this.defaultHeaders,
    });
  }
  public async decodeTrack(encodedTrack: string): Promise<any> {
    return makeRequest(`${this.url}/decodetrack?encodedTrack=${encodeURIComponent(encodedTrack)}`, {
      method: "GET",
      headers: this.defaultHeaders,
    });
  }
  public async decodeTracks(encodedTracks: string[]): Promise<any> {
    return makeRequest(`${this.url}/decodetracks`, {
      method: "POST",
      body: stringifyWithReplacer(encodedTracks),
      headers: this.defaultHeaders,
    });
  }
  public async getPlayers(sessionId: string): Promise<IRESTGetPlayers> {
    return makeRequest(`${this.url}/sessions/${sessionId}/players`, {
      method: "GET",
      headers: this.defaultHeaders,
    });
  }
  public async getPlayer(sessionId: string, guildId: string): Promise<any> {
    return makeRequest(`${this.url}/sessions/${sessionId}/players/${guildId}`, {
      method: "GET",
      headers: this.defaultHeaders,
    });
  }
  public async getRoutePlannerStatus(): Promise<any> {
    return makeRequest(`${this.url}/routeplanner/status`, {
      method: "GET",
      headers: this.defaultHeaders,
    });
  }
  public async unmarkFailedAddress(address: string): Promise<any> {
    return makeRequest(`${this.url}/routeplanner/free/address`, {
      method: "POST",
      body: stringifyWithReplacer({ address }),
      headers: this.defaultHeaders,
    });
  }
  public async unmarkAllFailedAddresses(): Promise<any> {
    return makeRequest(`${this.url}/routeplanner/free/all`, {
      method: "POST",
      headers: this.defaultHeaders,
    });
  }
  public async patch(path: string, data: any): Promise<unknown> {
    return makeRequest(`${this.url}/${path}`, {
      method: "PATCH",
      body: stringifyWithReplacer(data),
      headers: this.defaultHeaders,
    });
  }
  public async get(path: string): Promise<unknown> {
    return makeRequest(`${this.url}/${path}`, {
      method: "GET",
      headers: this.defaultHeaders,
    });
  }
  public async put(path: string, data: any): Promise<unknown> {
    return makeRequest(`${this.url}/${path}`, {
      method: "PUT",
      body: stringifyWithReplacer(data),
      headers: this.defaultHeaders,
    });
  }
  public async post(path: string, data?: any): Promise<unknown> {
    return makeRequest(`${this.url}/${path}`, {
      method: "POST",
      body: data ? stringifyWithReplacer(data) : undefined,
      headers: this.defaultHeaders,
    });
  }
  public async delete(path: string): Promise<unknown> {
    return makeRequest(`${this.url}/${path}`, {
      method: "DELETE",
      headers: this.defaultHeaders,
    });
  }
}
