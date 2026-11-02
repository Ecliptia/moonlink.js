"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NodeFailover = void 0;
const PlaybackGuard_1 = require("../players/PlaybackGuard");
const Util_1 = require("../Util");
const pending = new WeakMap();
class NodeFailover {
    static move(player, source, options = player.manager.options.node?.failover ?? {}) {
        const existing = pending.get(player);
        if (existing)
            return existing;
        const operation = this.attempt(player, source, options).finally(() => pending.delete(player));
        pending.set(player, operation);
        return operation;
    }
    static async attempt(player, source, options) {
        const maxAttempts = options.maxAttempts ?? 3;
        const retryDelay = options.retryDelayMs ?? 0;
        if (!Number.isInteger(maxAttempts) || maxAttempts < 0 || maxAttempts > 10 || !Number.isFinite(retryDelay) || retryDelay < 0 || retryDelay > 60000) {
            throw new TypeError('Failover requires maxAttempts 0..10 and retryDelayMs 0..60000');
        }
        const excluded = new Set([source.identifier]);
        for (const node of player.manager.nodes.nodes.values()) {
            if (Boolean(node.backend) !== Boolean(source.backend))
                excluded.add(node.identifier);
        }
        const guard = (0, PlaybackGuard_1.playbackGuard)(player);
        let ticket = guard.ticket;
        let attempts = 0;
        while (attempts < maxAttempts) {
            if (player.destroyed || source.destroyed || !guard.isCurrent(ticket))
                return { status: 'cancelled', attempts };
            const target = player.manager.nodes.findNode({ exclude: [...excluded], allowUnhealthyFallback: false });
            if (!target)
                break;
            excluded.add(target.identifier);
            attempts++;
            const transferring = player.transferNode(target);
            ticket = guard.ticket;
            let restored = false;
            try {
                restored = await transferring;
            }
            catch { }
            if (player.destroyed || source.destroyed || !guard.isCurrent(ticket))
                return { status: 'cancelled', attempts };
            if (restored && player.node === target && target.connected && !target.destroyed) {
                return { status: 'recovered', attempts, node: target };
            }
            if (retryDelay && attempts < maxAttempts)
                await (0, Util_1.delay)(retryDelay);
        }
        player.manager.emit('playerRecoveryFailed', player);
        return { status: 'failed', attempts };
    }
}
exports.NodeFailover = NodeFailover;
//# sourceMappingURL=NodeFailover.js.map