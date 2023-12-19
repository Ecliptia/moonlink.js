import {
    makeRequest,
    MoonlinkManager,
    MoonlinkNode,
    Structure
} from "../../index";
import { RestOptions, Endpoint } from "../@Typings";
export class MoonlinkRestFul {
    public manager: MoonlinkManager;
    public sessionId: string;
    public node: MoonlinkNode;
    public url: string;

    constructor(node: MoonlinkNode) {
        this.manager = Structure.manager;
        this.node = node;
    }

    public setSessionId(sessionId: string): void {
        this.sessionId = sessionId;
        this.ensureUrlIsSet();
    }

    public async update(data: RestOptions): Promise<object> {
        this.ensureUrlIsSet();
        return this.makePatchRequest(
            `sessions/${this.sessionId}/players/${data.guildId}`,
            data.data
        );
    }

    public async destroy(guildId: string): Promise<object> {
        return this.makeDeleteRequest(
            `sessions/${this.sessionId}/players/${guildId}`
        );
    }

    public async get(endpoint: Endpoint): Promise<object> {
        this.ensureUrlIsSet();
        return this.makeGetRequest(endpoint);
    }

    public async post(endpoint: Endpoint, data: RestOptions): Promise<object> {
        this.ensureUrlIsSet();
        return this.makePostRequest(endpoint, data);
    }

    public async patch(
        endpoint: Endpoint,
        data: RestOptions | any
    ): Promise<object> {
        this.ensureUrlIsSet();
        return this.makePatchRequest(endpoint, data.data);
    }

    public async delete(endpoint: Endpoint): Promise<object> {
        this.ensureUrlIsSet();
        return this.makeDeleteRequest(endpoint);
    }

    public async decodeTrack(encodedTrack: string): Promise<object> {
        return this.get(`decodetrack?encodedTrack=${encodedTrack}`);
    }

    public async decodeTracks(data: RestOptions): Promise<object> {
        return this.post("decodetracks", data);
    }

    public async getInfo(): Promise<object> {
        return this.get("info");
    }

    public async getStats(): Promise<object> {
        return this.get("stats");
    }

    public async getVersion(): Promise<object> {
        return this.get("version");
    }

    public async routePlannerFreeAddress(data: RestOptions): Promise<object> {
        return this.post("routeplanner/free/address", data);
    }

    public async routePlannerFreeAll(data: RestOptions): Promise<object> {
        return this.post("routeplanner/free/all", data);
    }

    private ensureUrlIsSet() {
        if (!this.url) {
            this.url = this.node.http;
        }
    }

    private async makeGetRequest(endpoint: string): Promise<object> {
        const headers = {
            Authorization: this.node.password
        };
        return makeRequest(this.url + endpoint, {
            method: "GET",
            headers
        }).catch(err => err);
    }

    private async makePostRequest(
        endpoint: string,
        data: RestOptions | any
    ): Promise<object> {
        const headers = {
            Authorization: this.node.password
        };
        return makeRequest(
            this.url + endpoint,
            {
                method: "POST",
                headers
            },
            data
        ).catch(err => err);
    }

    private async makePatchRequest(
        endpoint: string,
        data: RestOptions | any
    ): Promise<object> {
        const headers = {
            Authorization: this.node.password
        };
        return makeRequest(
            this.url + endpoint,
            {
                method: "PATCH",
                headers
            },
            data
        ).catch(err => err);
    }

    private async makeDeleteRequest(endpoint: string): Promise<object> {
        const headers = {
            Authorization: this.node.password
        };
        return makeRequest(this.url + endpoint, {
            method: "DELETE",
            headers
        }).catch(err => err);
    }
}
