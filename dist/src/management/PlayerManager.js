"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PlayerManager = void 0;
const index_1 = require("../../index");
class PlayerManager {
    manager;
    cache = new Map();
    constructor(manager) {
        this.manager = manager;
    }
    create(config) {
        (0, index_1.validateProperty)(config.guildId, (value) => value !== undefined || value !== "string", "(Moonlink.js) - Player > GuildId is required");
        (0, index_1.validateProperty)(config.voiceChannelId, (value) => value !== undefined || value == "string", "(Moonlink.js) - Player > VoiceChannelId is required");
        (0, index_1.validateProperty)(config.textChannelId, (value) => value !== undefined || value == "string", "(Moonlink.js) - Player > TextChannelId is required");
        (0, index_1.validateProperty)(config.volume, (value) => value === undefined || value >= 0, "(Moonlink.js) - Player > Invalid volume value. Volume must be a number between 0.");
        const player = new index_1.Player(this.manager, config);
        this.cache.set(config.guildId, player);
        return player;
    }
    has(guildId) {
        return this.cache.has(guildId);
    }
    get(guildId) {
        return this.cache.get(guildId);
    }
    remove(guildId) {
        this.cache.delete(guildId);
    }
}
exports.PlayerManager = PlayerManager;
//# sourceMappingURL=PlayerManager.js.map