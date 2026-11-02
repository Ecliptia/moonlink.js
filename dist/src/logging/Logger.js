"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Logger = void 0;
const consola_1 = require("consola");
const ConsoleReporter_1 = require("./ConsoleReporter");
const Banner_1 = require("./Banner");
const LogFormatter_1 = require("./LogFormatter");
const LogLevels_1 = require("./LogLevels");
const types_1 = require("../typings/types");
class Logger {
    instance;
    reporter;
    options;
    currentLevel;
    constructor(options = {}) {
        this.options = {
            color: options.color ?? Boolean(process.stdout.isTTY && !process.env.NO_COLOR),
            timestamps: options.timestamps ?? true,
            width: options.width ?? 72,
            level: options.level ?? 'silent',
        };
        this.currentLevel = this.options.level;
        this.reporter = new ConsoleReporter_1.ConsoleReporter(this.options);
        this.instance = (0, consola_1.createConsola)({
            level: LogLevels_1.consolaLevels[this.currentLevel],
            reporters: [this.reporter],
        });
    }
    setLevel(level) {
        this.currentLevel = level;
        this.instance.level = LogLevels_1.consolaLevels[level];
    }
    canShowInfo() {
        return LogLevels_1.consolaLevels[this.currentLevel] >= LogLevels_1.consolaLevels.info;
    }
    for(module) {
        return this.instance.withTag(module);
    }
    info(module, message, ...args) {
        this.for(module).info(message, ...args);
    }
    success(module, message, ...args) {
        this.for(module).success(message, ...args);
    }
    warn(module, message, ...args) {
        this.for(module).warn(message, ...args);
    }
    error(module, message, ...args) {
        this.for(module).error(message, ...args);
    }
    debug(module, message, ...args) {
        this.for(module).debug(message, ...args);
    }
    trace(module, message, ...args) {
        this.for(module).trace(message, ...args);
    }
    box(module, title, fields) {
        this.for(module).box(title, fields);
    }
    banner() {
        if (!this.canShowInfo())
            return;
        this.reporter.writePanel((0, Banner_1.createBanner)(this.options.color));
    }
    systemStatus(nodes) {
        if (!this.canShowInfo())
            return;
        this.reporter.writePanel((0, LogFormatter_1.formatSystemStatus)(nodes, this.options));
    }
    failover(event) {
        if (!this.canShowInfo())
            return;
        this.reporter.writePanel((0, LogFormatter_1.formatFailover)(event, this.options));
    }
    attachLegacyDebug(source) {
        const handle = (message) => {
            const module = /^(?:Moonlink\.js|NyxLink)\s*>\s*([A-Za-z][\w]*)/.exec(message)?.[1] ?? 'Legacy';
            this.debug(module, message);
        };
        source.on('debug', handle);
        return () => {
            if (source.off)
                source.off('debug', handle);
            else
                source.removeListener?.('debug', handle);
        };
    }
    managerStatus(manager) {
        const nodes = [...manager.nodes.nodes.values()];
        this.systemStatus(nodes.map(node => ({
            name: node.identifier,
            backend: node.backend?.kind === 'nodelink' ? 'NodeLink' : node.backend?.kind === 'lavalink' ? 'Lavalink' : 'Unknown',
            state: node.connected
                ? node.state === types_1.NodeState.READY ? 'ready' : 'connected'
                : types_1.NodeState[node.state]?.toLowerCase() ?? 'disconnected',
            latencyMs: node.latency >= 0 ? node.latency : undefined,
            players: manager.players.all.filter(player => player.node === node && !player.destroyed).length,
        })));
    }
    attachManager(manager) {
        const detachDebug = this.attachLegacyDebug(manager);
        const detachStatus = manager.on('nodeStateChange', () => this.managerStatus(manager));
        const detachReady = manager.on('nodeReady', () => this.managerStatus(manager));
        const detachDestroy = manager.on('nodeDestroy', () => this.managerStatus(manager));
        const detachFailover = manager.on('playerNodeFailover', (player, report) => {
            this.failover({ ...report, guildId: player.guildId });
        });
        let detached = false;
        return () => {
            if (detached)
                return;
            detached = true;
            detachDebug();
            detachStatus();
            detachReady();
            detachDestroy();
            detachFailover();
        };
    }
}
exports.Logger = Logger;
//# sourceMappingURL=Logger.js.map