import { Agent } from "node:https";
import { Node, makeRequest } from "../../index";
import { IVoiceState, IRESTOptions } from "../typings/Interfaces";
export class Rest {
  public node: Node;
  public url: string;
  public defaultHeaders: Record<string, string>;
  constructor(node: Node) {
    this.node = node;
    this.url = `http${this.node.secure ? "s" : ""}://${this.node.address}`;
    this.defaultHeaders = {
      Authorization: this.node.password,
      Accept: "application/json",
      "User-Agent": "Moonlink.js/4 (Ghost)",
      "Content-Type": "application/json",
    };
  }
  public async loadTracks(source: string, query: string): Promise<unknown> {
    let request = await makeRequest(
      `${this.url}/loadtracks?identifier=${source}:${encodeURIComponent(query)}`,
      {
        method: "GET",
        headers: this.defaultHeaders,
      },
    );
    return request;
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
}
