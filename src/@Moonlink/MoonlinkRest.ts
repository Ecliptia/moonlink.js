import { MoonlinkNode } from "./MoonlinkNodes";
import { MoonlinkManager } from "./MoonlinkManager";
import { makeRequest } from "../@Rest/MakeRequest";
export interface voiceOptions {
 endpoint: string;
 token: string;
 sessionId: string;
 connected?: boolean;
 ping?: number;
}
export interface restOptions {
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
  voice?: voiceOptions;
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
 public setSessionId(sessionId): void {
  this.sessionId = sessionId;
  this.url = this.node.restUri;
 }
 public async update(data: restOptions): Promise<object> {
  return await this.patch(
   `sessions/${this.sessionId}/players/${data.guildId}`,
   data
  );
 }
 public async destroy(guildId: string): Promise<object> {
  return await this.delete(`sessions/${this.sessionId}/players/${guildId}`);
 }
 public async get(endpoint: Endpoint): Promise<object> {
  let req: any = await makeRequest(this.url + endpoint, {
   method: "GET",
   headers: {
    Authorization: this.node.password,
   },
  }).catch((err) => {
   return err;
  });
  return req;
 }
 public async post(endpoint: Endpoint, data: restOptions): Promise<object> {
  let req: any = await makeRequest(
   this.url + endpoint,
   {
    method: "POST",
    headers: {
     Authorization: this.node.password,
    },
   },
   data
  ).catch((err) => {
   return err;
  });
  return req;
 }
 public async patch(endpoint: Endpoint, data: restOptions): Promise<object> {
  let req: any = await makeRequest(
   this.url + endpoint,
   {
    method: "PATCH",
    headers: {
     Authorization: this.node.password,
    },
   },
   data.data
  ).catch((err) => {
   return err;
  });
  return req;
 }
 public async delete(endpoint: Endpoint): Promise<object> {
  let req: any = await makeRequest(this.url + endpoint, {
   method: "DELETE",
   headers: {
    Authorization: this.node.password,
   },
  }).catch((err) => {
   return err;
  });
  return req;
 }
}
