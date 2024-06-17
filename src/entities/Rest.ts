import { Node, makeRequest, sources } from "../../index";
import { IRESTOptions, IRESTLoadTracks } from "../typings/Interfaces";
export class Rest {
  public node: Node;
  public url: string;
  public defaultHeaders: Record<string, string>;
  constructor(node: Node) {
    this.node = node;
    this.url = `http${this.node.secure ? "s" : ""}://${this.node.address}/v4`;
    this.defaultHeaders = {
      Authorization: this.node.password,
      Accept: "application/json",
      "User-Agent": "Moonlink.js/4 (Ghost)",
      "Content-Type": "application/json",
    };
  }
  public async loadTracks(source: string, query: string): Promise<any> {
    return new Promise(async (resolve) => {
      let identifier: string;
      if (query.startsWith("http://") || query.startsWith("https://"))
        identifier = query;
      else identifier = `${sources[source]}:${query}`;

      let params = new URLSearchParams({
        identifier,
      });
      let request: IRESTLoadTracks = await makeRequest(
        `${this.url}/loadtracks?${params}`,
        {
          method: "GET",
          headers: this.defaultHeaders,
        },
      );
      return resolve(request);
    });
  }
  public async update(data: IRESTOptions): Promise<unknown> {
    let request = await makeRequest(
      `${this.url}/sessions/${this.node.sessionId}/players/${data.guildId}`,
      {
        method: "PATCH",
        body: JSON.stringify(data.data) as any,
        headers: this.defaultHeaders,
      },
    );

    return request;
  }
  public async destroy(guildId: string): Promise<unknown> {
    let request = await makeRequest(
      `${this.url}/sessions/${this.node.sessionId}/players/${guildId}`,
      {
        method: "DELETE",
        headers: this.defaultHeaders,
      },
    );

    return request;
  }
}
