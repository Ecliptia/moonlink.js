import type { Node } from '../entities/Node';
import type { Player } from '../entities/Player';
import { playbackGuard } from '../players/PlaybackGuard';
import { delay } from '../Util';

export type FailoverOptions = { maxAttempts?: number; retryDelayMs?: number; preserveOnFailure?: boolean };
export type FailoverResult = { status: 'recovered' | 'failed' | 'cancelled'; attempts: number; node?: Node };
const pending = new WeakMap<Player, Promise<FailoverResult>>();

export class NodeFailover {
    public static move(player: Player, source: Node, options: FailoverOptions = player.manager.options.node?.failover ?? {}): Promise<FailoverResult> {
        const existing = pending.get(player);
        if (existing) return existing;
        const operation = this.attempt(player, source, options).finally(() => pending.delete(player));
        pending.set(player, operation);
        return operation;
    }

    private static async attempt(player: Player, source: Node, options: FailoverOptions): Promise<FailoverResult> {
        const maxAttempts = options.maxAttempts ?? 3;
        const retryDelay = options.retryDelayMs ?? 0;
        if (!Number.isInteger(maxAttempts) || maxAttempts < 0 || maxAttempts > 10 || !Number.isFinite(retryDelay) || retryDelay < 0 || retryDelay > 60000) {
            throw new TypeError('Failover requires maxAttempts 0..10 and retryDelayMs 0..60000');
        }
        const excluded = new Set([source.identifier]);
        // Unknown/confirmed identities cannot be treated as compatible codecs.
        for (const node of player.manager.nodes.nodes.values() as Iterable<Node>) {
            if (Boolean(node.backend) !== Boolean(source.backend)) excluded.add(node.identifier);
        }
        const guard = playbackGuard(player);
        let ticket = guard.ticket;
        let attempts = 0;
        while (attempts < maxAttempts) {
            if (player.destroyed || source.destroyed || !guard.isCurrent(ticket)) return { status: 'cancelled', attempts };
            const target = player.manager.nodes.findNode({ exclude: [...excluded], allowUnhealthyFallback: false });
            if (!target) break;
            excluded.add(target.identifier);
            attempts++;
            const transferring = player.transferNode(target);
            ticket = guard.ticket;
            let restored = false;
            try { restored = await transferring; } catch { /* A different candidate may still recover the snapshot. */ }
            if (player.destroyed || source.destroyed || !guard.isCurrent(ticket)) return { status: 'cancelled', attempts };
            if (restored && player.node === target && target.connected && !target.destroyed) {
                return { status: 'recovered', attempts, node: target };
            }
            if (retryDelay && attempts < maxAttempts) await delay(retryDelay);
        }
        player.manager.emit('playerRecoveryFailed', player);
        return { status: 'failed', attempts };
    }
}
