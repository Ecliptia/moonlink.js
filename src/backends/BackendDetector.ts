import type { BackendAdapter } from './BackendAdapter';
import { LavalinkAdapter } from './LavalinkAdapter';
import { NodeLinkAdapter } from './NodeLinkAdapter';

export class BackendDetector {
    /**
     * /v4/info: https://lavalink.dev/api/rest#get-info
     * NodeLink marker: https://github.com/PerformanC/NodeLink/blob/804e0d6d0f1af30384e0a2d12ddbc8d79e85cf35/src/api/info.ts
     */
    public static detect(info: unknown, headers: Record<string, unknown> = {}, capabilities = new Set<string>()): BackendAdapter | undefined {
        capabilities.clear();
        if (!info || typeof info !== 'object' || Array.isArray(info)) return undefined;
        const data = info as Record<string, any>;
        const version = data.version?.semver;
        if (typeof version !== 'string' || !/^\d+\.\d+\.\d+(?:[-+][\w.+-]+)?$/.test(version)) return undefined;
        const marker = headers.iamnodelink;
        const header = Array.isArray(marker) ? marker[0] : marker;
        const nodeLink = data.isNodelink === true || (typeof header === 'string' && header.trim().toLowerCase() === 'true');
        if (!nodeLink && !version.startsWith('4.')) return undefined;
        for (const [field, prefix] of [['sourceManagers', 'source'], ['filters', 'filter']]) {
            if (!Array.isArray(data[field])) continue;
            for (const name of data[field]) {
                if (typeof name === 'string' && /^[a-z0-9][\w.-]*$/i.test(name)) capabilities.add(`${prefix}:${name.toLowerCase()}`);
            }
        }
        return nodeLink ? new NodeLinkAdapter(version, capabilities) : new LavalinkAdapter(version, capabilities);
    }
}
