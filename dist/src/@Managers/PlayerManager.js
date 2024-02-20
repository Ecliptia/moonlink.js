"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PlayerManager = void 0;
const index_1 = require("../../index");
class PlayerManager {
    _manager;
    cache = {};
    voices = {};
    constructor() { }
    init() {
        this._manager = index_1.Structure.manager;
        this._manager.emit("debug", "@Moonlink(Players) - Structure(Players) has been initialized, and assigned the value of the main class ");
    }
    handleVoiceServerUpdate(update, guildId) {
        this.voices[guildId] = {
            ...this.voices[guildId],
            endpoint: update.endpoint,
            token: update.token
        };
        this.attemptConnection(guildId);
    }
    handlePlayerDisconnect(guildId) {
        this._manager.emit("playerDisconnect", this.cache[guildId]);
        this._manager.emit("debug", `@Moonlink(PlayerManager) - a player(${guildId}) was disconnected, issuing stop and resolving information`);
        Object.assign(this.cache[guildId], {
            connected: false,
            voiceChannel: null,
            playing: false
        });
        this.cache[guildId].stop();
    }
    handlePlayerMove(newChannelId, oldChannelId, guildId) {
        this._manager.emit("playerMove", this.cache[guildId], newChannelId, oldChannelId);
        this._manager.emit("debug", `@Moonlink(PlayerManager) - a player(${guildId}) was moved channel, resolving information`);
        this.cache[guildId].voiceChannel = newChannelId;
    }
    updateVoiceStates(guildId, update) {
        this.voices[guildId] = {
            ...this.voices[guildId],
            sessionId: update.session_id
        };
    }
    async attemptConnection(guildId) {
        if (!this.cache[guildId] ||
            (!this.voices &&
                !(this.voices[guildId]?.token &&
                    this.voices[guildId]?.endpoint &&
                    this.voices[guildId]?.sessionId))) {
            return false;
        }
        if (this._manager.options?.balancingPlayersByRegion) {
            const voiceRegion = this.voices[guildId]?.endpoint?.match(/([a-zA-Z-]+)\d+/)?.[1];
            if (!this.cache[guildId].voiceRegion) {
                const connectedNodes = [
                    ...this._manager.nodes.map.values()
                ].filter(node => node.state == index_1.State.READY);
                const matchingNode = connectedNodes.find(node => node.regions.includes(voiceRegion));
                this.cache[guildId].voiceRegion = voiceRegion;
                if (matchingNode) {
                    this.cache[guildId].node = matchingNode;
                }
            }
        }
        else if (!this.cache[guildId].voiceRegion) {
            const voiceRegion = this.voices[guildId]?.endpoint?.match(/([a-zA-Z-]+)\d+/)?.[1];
            this.cache[guildId].voiceRegion = voiceRegion;
        }
        await this.cache[guildId].node.rest.update({
            guildId,
            data: {
                voice: this.voices[guildId]
            }
        });
        return true;
    }
    has(guildId) {
        return !!this.cache[guildId];
    }
    get(guildId) {
        if (!guildId && typeof guildId !== "string")
            throw new Error('@Moonlink(PlayerManager) - "guildId" option in parameter to get player is empty or type is different from string');
        if (!this.has(guildId))
            return null;
        return this.cache[guildId];
    }
    create(data) {
        if (typeof data !== "object" ||
            !data.guildId ||
            typeof data.guildId !== "string" ||
            !data.textChannel ||
            typeof data.textChannel !== "string" ||
            !data.voiceChannel ||
            typeof data.voiceChannel !== "string" ||
            (data.autoPlay !== undefined &&
                typeof data.autoPlay !== "boolean") ||
            (data.node && typeof data.node !== "string")) {
            const missingParams = [];
            if (!data.guildId || typeof data.guildId !== "string")
                missingParams.push("guildId");
            if (!data.textChannel || typeof data.textChannel !== "string")
                missingParams.push("textChannel");
            if (!data.voiceChannel || typeof data.voiceChannel !== "string")
                missingParams.push("voiceChannel");
            if (data.autoPlay !== undefined &&
                typeof data.autoPlay !== "boolean")
                missingParams.push("autoPlay");
            if (data.node && typeof data.node !== "string")
                missingParams.push("node");
            throw new Error(`@Moonlink(PlayerManager) - Missing parameters for player creation: ${missingParams.join(", ")}`);
        }
        if (this.has(data.guildId))
            return this.get(data.guildId);
        let nodeSorted = this._manager.nodes.sortByUsage(`${this._manager.options.sortNode ?? "players"}`)[0];
        data.node = nodeSorted.identifier ?? nodeSorted.host;
        this._manager.emit("debug", `@Moonlink(Players) - A server player was created (${data.guildId})`);
        this._manager.emit("playerCreated", data.guildId);
        this.cache[data.guildId] = new (index_1.Structure.get("MoonlinkPlayer"))(data);
        return this.cache[data.guildId];
    }
    get all() {
        return this.cache ?? null;
    }
    delete(guildId) {
        delete this.cache[guildId];
    }
}
exports.PlayerManager = PlayerManager;
