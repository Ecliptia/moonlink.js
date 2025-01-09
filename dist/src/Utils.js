"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Plugin = exports.Structure = exports.structures = exports.sources = void 0;
exports.validateProperty = validateProperty;
exports.isVoiceStateAttempt = isVoiceStateAttempt;
exports.Log = Log;
exports.makeRequest = makeRequest;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const index_1 = require("../index");
function validateProperty(prop, validator, errorMessage) {
    if (!validator(prop)) {
        throw new Error(errorMessage);
    }
}
async function isVoiceStateAttempt(player) {
    const voiceState = await player.node.rest.getPlayer(player.node.sessionId, player.guildId).voice;
    if (!player.voiceState && player.voiceChannelId && player.guildId && !player.connected) {
        await player.connect();
        player.manager.emit("debug", `Moonlink.js > Attempting to connect to voice channel ${player.voiceChannelId} for guild ${player.guildId}`);
        await delay(2000);
        if (!player.voiceState.attempt) {
            player.manager.emit("debug", `Moonlink.js > Failed to connect to voice channel ${player.voiceChannelId} for guild ${player.guildId}. Check if the packetUpdate function is getting data from Discord client side.`);
            return false;
        }
    }
    if (!player.voiceState.attempt && player.connected) {
        player.manager.emit("debug", `Moonlink.js > Waiting for voice state update for guild ${player.guildId}`);
        await delay(2000);
        if (!player.voiceState.attempt) {
            player.manager.emit("debug", `Moonlink.js > Failed to connect to voice channel ${player.voiceChannelId} for guild ${player.guildId}. Check if the packetUpdate function is getting data from Discord client side.`);
            return false;
        }
    }
    if (player.voiceState.attempt && voiceState?.sessionId === player.voiceState.session_id) {
        player.manager.emit("debug", `Moonlink.js > The voice state update for guild ${player.guildId} has been received`);
        return true;
    }
    return false;
}
function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}
function Log(message, LogPath) {
    const timestamp = new Date().toISOString();
    const logmessage = `[${timestamp}] ${message}\n`;
    const logpath = path_1.default.resolve(LogPath);
    fs_1.default.exists(logpath, (exists) => {
        if (!exists) {
            fs_1.default.mkdirSync(path_1.default.dirname(logpath), { recursive: true });
            fs_1.default.writeFileSync(logpath, '');
        }
        try {
            fs_1.default.appendFileSync(logpath, logmessage);
        }
        catch (error) {
            return false;
        }
    });
}
function makeRequest(url, options) {
    let request = fetch(url, options)
        .then((res) => res.json().catch(() => res.text()))
        .then((json) => json);
    if (!request)
        return;
    return request;
}
exports.sources = {
    youtube: "ytsearch",
    youtubemusic: "ytmsearch",
    soundcloud: "scsearch",
    local: "local",
};
exports.structures = {
    Database: index_1.Database,
    NodeManager: index_1.NodeManager,
    PlayerManager: index_1.PlayerManager,
    SearchResult: index_1.SearchResult,
    Player: index_1.Player,
    Queue: index_1.Queue,
    Node: index_1.Node,
    Rest: index_1.Rest,
    Filters: index_1.Filters,
    Track: index_1.Track,
    Lyrics: index_1.Lyrics,
    Listen: index_1.Listen,
};
class Structure {
    static manager;
    static setManager(manager) {
        this.manager = manager;
    }
    static getManager() {
        return this.manager;
    }
    static get(name) {
        const structure = exports.structures[name];
        if (!structure) {
            throw new TypeError(`"${name}" structure must be provided.`);
        }
        return structure;
    }
    static extend(name, extender) {
        exports.structures[name] = extender;
    }
}
exports.Structure = Structure;
class Plugin {
    name;
    load(manager) { }
    unload(manager) { }
}
exports.Plugin = Plugin;
//# sourceMappingURL=Utils.js.map