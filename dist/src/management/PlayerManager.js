"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PlayerManager = void 0;
exports.isVoiceStateAttempt = isVoiceStateAttempt;
const index_1 = require("../../index");
class PlayerManager {
    manager;
    cache = new Map();
    constructor(manager) {
        this.manager = manager;
    }
    create(config) {
        (0, index_1.validateProperty)(config.guildId, value => value !== undefined || value !== "string", "(Moonlink.js) - Player > GuildId is required");
        if (this.has(config.guildId))
            return this.get(config.guildId);
        (0, index_1.validateProperty)(config.voiceChannelId, value => value !== undefined || value == "string", "(Moonlink.js) - Player > VoiceChannelId is required");
        (0, index_1.validateProperty)(config.textChannelId, value => value !== undefined || value == "string", "(Moonlink.js) - Player > TextChannelId is required");
        (0, index_1.validateProperty)(config.volume, value => value === undefined || value >= 0, "(Moonlink.js) - Player > Invalid volume value. Volume must be a number between 0.");
        if (config.node) {
            (0, index_1.validateProperty)(this.manager.nodes.get(config.node), value => value !== undefined, "(Moonlink.js) - Player > Invalid node");
        }
        else {
            let node = this.manager.nodes.sortByUsage(this.manager.options.sortTypeNode || "players");
            if (!node)
                throw new Error("(Moonlink.js) - Player > No available nodes");
            config.node = node.identifier ?? node.uuid;
        }
        const player = new (index_1.Structure.get("Player"))(this.manager, config);
        this.cache.set(config.guildId, player);
        this.manager.emit("debug", "Moonlink.js - Player > Player for guildId " + config.guildId + " has been created", config);
        return player;
    }
    has(guildId) {
        return this.cache.has(guildId);
    }
    get(guildId) {
        return this.cache.get(guildId);
    }
    async delete(guildId) {
        if (!this.has(guildId))
            return;
        await this.get(guildId).node.rest.destroy(guildId);
        this.cache.delete(guildId);
        this.manager.emit("debug", "Moonlink.js - Player > Player for guildId " + guildId + " has been deleted");
    }
    get all() {
        return [...this.cache.values()];
    }
}
exports.PlayerManager = PlayerManager;
async function isVoiceStateAttempt(player) {
    const voiceState = await player.node.rest.getPlayer(player.node.sessionId, player.guildId).voice;
    const logDebug = (message) => player.manager.emit("debug", `Moonlink.js > ${message}`);
    const ensureConnection = async () => {
        if (!player.voiceState?.attempt &&
            player.voiceChannelId &&
            player.guildId &&
            !player.connected) {
            logDebug(`Attempting to connect to voice channel ${player.voiceChannelId} for guild ${player.guildId}`);
            await player.connect();
            await (0, index_1.delay)(2000);
        }
        return player.voiceState?.attempt;
    };
    const verifyUpdate = async () => {
        if (!player.voiceState?.attempt && player.connected) {
            logDebug(`Waiting for voice state update for guild ${player.guildId}`);
            await (0, index_1.delay)(2000);
        }
        return player.voiceState?.attempt;
    };
    const validateSession = () => voiceState?.sessionId === player.voiceState?.session_id;
    const isConnected = await ensureConnection();
    if (!isConnected && !(await verifyUpdate())) {
        logDebug(`Failed to connect to voice channel ${player.voiceChannelId} for guild ${player.guildId}. Check if the packetUpdate function is getting data from Discord client side.`);
        return false;
    }
    if (validateSession()) {
        logDebug(`The voice state update for guild ${player.guildId} has been received`);
        return true;
    }
    return false;
}
//# sourceMappingURL=PlayerManager.js.map