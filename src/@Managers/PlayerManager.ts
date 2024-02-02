import { MoonlinkPlayer, MoonlinkTracl } from "../../index";
export class Players {
    public _manager: MoonlinkManager;
    public cache: Record<string, MoonlinkPlayer> = {};
    private voices: Record<string, any> = {};
    constructor() {}
    public init(): void {
        this._manager = Structure.manager;
        this._manager.emit(
            "debug",
            "@Moonlink(Players) - Structure(Players) has been initialized, and assigned the value of the main class "
        );
    }
    public handleVoiceServerUpdate(update: any, guildId: string): void {
        voices[guildId] = {
            ...voices[guildId],
            endpoint: update.endpoint,
            token: update.token
        };

        this.attemptConnection(guildId);
    }
    public handlePlayerDisconnect(
        player: MoonlinkPlayer,
        guildId: string
    ): void {
        this._manager.emit("playerDisconnect");

        player.stop();
    }
    public handlePlayerMove(
        player: MoonlinkPlayer,
        newChannelId: string,
        oldChannelId: string,
        guildId: string
    ): void {
        this._manager.emit("playerMove", player, newChannelId, oldChannelId);
    }

    public updateVoiceStates(guildId: string, update: any): void {
        voices[guildId] = {
            ...voices[guildId],
            sessionId: update
        };
    }
    public async attemptConnection(guildId: string): Promise<boolean> {
        const voiceServer = this.map.get("voiceServer") || {};
        const voiceStates = this.map.get("voiceStates") || {};
        const players = this.map.get("players") || {};

        if (!players[guildId] || !voiceServer[guildId]) return false;

        /*
        if (this._manager.options?.balancingPlayersByRegion) {
            let voiceRegion = voices[guildId].endpoint
                ? voices[guildId].endpoint.match(/([a-zA-Z-]+)\d+/)
                : null;

            if (cache[guildId].voiceRegion) voiceRegion = null;
            else cache[guildId].voiceRegion = voiceRegion[1];

            if (voiceRegion) {
                const connectedNodes = [
                    ...this._manager.nodes.map.values()
                ].filter(node => node.state == State.READY);

                const matchingNode = connectedNodes.find(node =>
                    node.regions.includes(voiceRegion)
                );

                if (matchingNode) {
                    players[guildId] = {
                        node: matchingNode.identifier
                            ? matchingNode.identifier
                            : matchingNode.host,
                        ...players[guildId]
                    };
                    this.map.set("players", players);
                } else {
                    players[guildId] = {
                        voiceRegion,
                        ...players[guildId]
                    };
                    this.map.set("players", players);
                }
            }
        } else {
            if (!players[guildId].region) {
                let voiceRegion = voiceServer[guildId].event.endpoint
                    ? voiceServer[guildId].event.endpoint.match(
                          /([a-zA-Z-]+)\d+/
                      )
                    : null;

                players[guildId].voiceRegion = voiceRegion
                    ? voiceRegion[1]
                    : null;

                this.map.set("players", players);
            }
        }
*/

        await this.cache[guildId].node.rest.update({
            guildId,
            data: {
                voice: voices[guildId]
            }
        });

        return true;
    }
    public has(guildId: string): boolean {
        return !!this.cache[guildId];
    }
    public get(guildId: string): MoonlinkPlayer | null {
        if (!guildId && typeof guildId !== "string")
            throw new Error(
                '[ @Moonlink/Manager ]: "guildId" option in parameter to get player is empty or type is different from string'
            );
        if (!this.has(guildId)) return null;

        return voices[guildId];
    }
    public create(data: createOptions): MoonlinkPlayer {
        if (
            typeof data !== "object" ||
            !data.guildId ||
            typeof data.guildId !== "string" ||
            !data.textChannel ||
            typeof data.textChannel !== "string" ||
            !data.voiceChannel ||
            typeof data.voiceChannel !== "string" ||
            (data.autoPlay !== undefined &&
                typeof data.autoPlay !== "boolean") ||
            (data.node && typeof data.node !== "string")
        ) {
            const missingParams = [];
            if (!data.guildId || typeof data.guildId !== "string")
                missingParams.push("guildId");
            if (!data.textChannel || typeof data.textChannel !== "string")
                missingParams.push("textChannel");
            if (!data.voiceChannel || typeof data.voiceChannel !== "string")
                missingParams.push("voiceChannel");
            if (
                data.autoPlay !== undefined &&
                typeof data.autoPlay !== "boolean"
            )
                missingParams.push("autoPlay");
            if (data.node && typeof data.node !== "string")
                missingParams.push("node");

            throw new Error(
                `[ @Moonlink/Manager ]: Invalid or missing parameters for player creation: ${missingParams.join(
                    ", "
                )}`
            );
        }

        if (this.has(data.guildId)) return this.get(data.guildId);

        let nodeSorted = this._manager.nodes.sortByUsage(
            `${
                this._manager.options.sortNode
                    ? this._manager.options.sortNode
                    : "players"
            }`
        )[0];

        this._manager.emit(
            "debug",
            `@Moonlink(Players) - A server player was created (${data.guildId})`
        );
        this._manager.emit("playerCreated", data.guildId);
        let instance = new (Structure.get("MoonlinkPlayer"))(data);

        return instance;
    }
    public get all(): Record<string, any> | null {
        return this.cache ?? null;
    }
}
