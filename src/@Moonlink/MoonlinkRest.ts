import { MoonlinkNode } from "./MoonlinkNodes";
import { MoonlinkManager } from "./MoonlinkManager";
import { makeRequest } from "../@Rest/MakeRequest";

export interface VoiceOptions {
  endpoint: string;
  token: string;
  sessionId: string;
  connected?: boolean;
  ping?: number;
}

export interface RestOptions {
  guildId: string;
  data: {
    encodedTrack?: string;
    identifier?: string;
    startTime?: number;
    endTime?: number;
    volume?: number;
    position?: number;
    paused?: Boolean;
    filters?: Object;
    voice?: VoiceOptions;
  };
}

export type Endpoint = string;

export class MoonlinkRest {
  public manager: MoonlinkManager;
  public sessionId: string;
  public node: MoonlinkNode;
  public url: string;
  constructor(manager: MoonlinkManager, node: MoonlinkNode) {
    this.manager = manager;
    this.node = node;
  }

  public setSessionId(sessionId: string): void {
    this.sessionId = sessionId;
    this.ensureUrlIsSet();
  }

  public async update(data: RestOptions): Promise<object> {
    this.ensureUrlIsSet();
    return await this.makePatchRequest(`sessions/${this.sessionId}/players/${data.guildId}`, data.data);
  }

  public async destroy(guildId: string): Promise<object> {
    return await this.makeDeleteRequest(`sessions/${this.sessionId}/players/${guildId}`);
  }

  public async get(endpoint: Endpoint): Promise<object> {
    this.ensureUrlIsSet();
    return await this.makeGetRequest(endpoint);
  }

  public async post(endpoint: Endpoint, data: RestOptions): Promise<object> {
    this.ensureUrlIsSet();
    return await this.makePostRequest(endpoint, data);
  }

  public async patch(endpoint: Endpoint, data: RestOptions | any): Promise<object> {
    this.ensureUrlIsSet();
    return await this.makePatchRequest(endpoint, data.data);
  }

  public async delete(endpoint: Endpoint): Promise<object> {
    this.ensureUrlIsSet();
    return await this.makeDeleteRequest(endpoint);
  }

  private ensureUrlIsSet() {
    if (!this.url) this.url = this.node.restUri;
  }
  
  private async makeGetRequest(endpoint: string): Promise<object> {
    const headers = {
      Authorization: this.node.password,
    };
    return await makeRequest(this.url + endpoint, {
      method: "GET",
      headers,
    }).catch((err) => {
      return err;
    });
  }

  private async makePostRequest(endpoint: string, data: RestOptions | any): Promise<object> {
    const headers = {
      Authorization: this.node.password,
    };
    return await makeRequest(this.url + endpoint, {
      method: "POST",
      headers,
    }, data).catch((err) => {
      return err;
    });
  }

  private async makePatchRequest(endpoint: string, data: RestOptions | any): Promise<object> {
    const headers = {
      Authorization: this.node.password,
    };
    return await makeRequest(this.url + endpoint, {
      method: "PATCH",
      headers,
    }, data).catch((err) => {
      return err;
    });
  }

  private async makeDeleteRequest(endpoint: string): Promise<object> {
    const headers = {
      Authorization: this.node.password,
    };
    return await makeRequest(this.url + endpoint, {
      method: "DELETE",
      headers,
    }).catch((err) => {
      return err;
    });
  }
}