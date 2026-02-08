"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PlayerManager = void 0;
const Util_1 = require("../Util");
class PlayerManager {
    manager;
    players = new Map();
    constructor(manager) {
        this.manager = manager;
    }
    get all() {
        return [...this.players.values()];
    }
    create(options) {
        (0, Util_1.validate)(options.guildId, (v) => typeof v === "string" && /^\d{17,20}$/.test(v), "IPlayerConfig#guildId must be a valid Discord Snowflake string.");
        (0, Util_1.validate)(options.voiceChannelId, (v) => typeof v === "string" && /^\d{17,20}$/.test(v), "IPlayerConfig#voiceChannelId must be a valid Discord Snowflake string.");
        if (options.textChannelId) {
            (0, Util_1.validate)(options.textChannelId, (v) => typeof v === "string" && /^\d{17,20}$/.test(v), "IPlayerConfig#textChannelId must be a valid Discord Snowflake string.");
        }
        if (options.volume) {
            (0, Util_1.validate)(options.volume, (v) => typeof v === 'number' && v >= 0 && v <= 1000, "IPlayerConfig#volume must be a number between 0 and 1000.");
        }
        if (this.players.has(options.guildId)) {
            this.manager.emit("debug", `Moonlink.js > PlayerManager >> Player already exists for Guild: ${options.guildId}. Returning existing player.`);
            return this.players.get(options.guildId);
        }
        const node = this.manager.nodes.findNode();
        if (!node) {
            throw new Error("Moonlink.js > PlayerManager#create: No available nodes.");
        }
        const player = new (Util_1.Structure.get("Player"))(this.manager, node, options);
        this.players.set(options.guildId, player);
        this.manager.emit("playerCreate", player);
        this.manager.emit("debug", `Moonlink.js > PlayerManager >> Player created. Guild: ${options.guildId}, Options: ${JSON.stringify(options)}`);
        return player;
    }
    get(guildId) {
        return this.players.get(guildId);
    }
    has(guildId) {
        return this.players.has(guildId);
    }
    get size() {
        return this.players.size;
    }
    get playingPlayers() {
        return this.all.filter(p => p.playing);
    }
    get idlePlayers() {
        return this.all.filter(p => !p.playing);
    }
    filter(predicate) {
        return this.all.filter(predicate);
    }
    find(predicate) {
        return this.all.find(predicate);
    }
    map(callback) {
        return this.all.map(callback);
    }
    forEach(callback) {
        this.all.forEach(callback);
    }
    async clear() {
        if (this.players.size === 0)
            return;
        await Promise.all([...this.all].map(p => p.destroy("clear")));
    }
    async destroyAll() {
        await this.clear();
    }
    async destroy(guildId, reason) {
        const player = this.get(guildId);
        if (!player) {
            return false;
        }
        await player.destroy(reason ?? "PlayerManager destroy");
        return true;
    }
}
exports.PlayerManager = PlayerManager;
//# sourceMappingURL=PlayerManager.js.map