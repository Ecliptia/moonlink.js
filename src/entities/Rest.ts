import { makeRequest, stringifyWithReplacer, sources } from "../Util";
import { Node } from "./Node";
import { IRESTLoadTracks, IRESTGetLyrics, IRESTGetPlayers } from "../typings/interfaces";

export class Rest {
    private readonly node: Node;

    constructor(node: Node) {
        this.node = node;
    }

    public get url(): string {
        return `http${this.node.secure ? "s" : ""}://${this.node.host}:${this.node.port}`;
    }

    public async getPlayers(): Promise<IRESTGetPlayers[] | null> {
        const res = await makeRequest<IRESTGetPlayers[]>(`${this.url}/v4/sessions/${this.node.sessionId}/players`, {
            method: "GET",
            headers: {
                "Authorization": this.node.password
            }
        });
        return res || null;
    }

    public async getPlayer(guildId: string): Promise<any | null> {
        const res = await makeRequest<any>(`${this.url}/v4/sessions/${this.node.sessionId}/players/${guildId}`, {
            method: "GET",
            headers: {
                "Authorization": this.node.password
            }
        });
        return res || null;
    }

    public async updatePlayer(guildId: string, data: any): Promise<any | null> {
        const res = await makeRequest<any>(`${this.url}/v4/sessions/${this.node.sessionId}/players/${guildId}`, {
            method: "PATCH",
            headers: {
                "Authorization": this.node.password,
                "Content-Type": "application/json"
            },
            body: data
        });
        return res || null;
    }

    public async destroyPlayer(guildId: string): Promise<void> {
        await makeRequest(`${this.url}/v4/sessions/${this.node.sessionId}/players/${guildId}`, {
            method: "DELETE",
            headers: {
                "Authorization": this.node.password
            }
        });
    }

    public async loadTracks(identifier: string): Promise<IRESTLoadTracks> {
        const params = new URLSearchParams();
        params.append("identifier", identifier);

        const res = await makeRequest<any>(`${this.url}/v4/loadtracks?${params}`, {
            method: "GET",
            headers: {
                "Authorization": this.node.password
            }
        });

        return res || { loadType: "empty", data: {} };
    }

    public async getLyrics(trackId: string): Promise<IRESTGetLyrics | null> {
        const res = await makeRequest<IRESTGetLyrics>(`${this.url}/v4/lyrics/${trackId}`, {
            method: "GET",
            headers: {
                "Authorization": this.node.password
            }
        });
        return res || null;
    }

    public async updateSession(resuming: boolean, timeout: number): Promise<any | null> {
        const res = await makeRequest<any>(`${this.url}/v4/sessions/${this.node.sessionId}`, {
            method: "PATCH",
            headers: {
                "Authorization": this.node.password,
                "Content-Type": "application/json"
            },
            body: {
                resuming,
                timeout
            }
        });
        return res || null;
    }
}
