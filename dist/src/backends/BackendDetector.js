"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BackendDetector = void 0;
const LavalinkAdapter_1 = require("./LavalinkAdapter");
const NodeLinkAdapter_1 = require("./NodeLinkAdapter");
class BackendDetector {
    static detect(info, headers = {}, capabilities = new Set()) {
        capabilities.clear();
        if (!info || typeof info !== 'object' || Array.isArray(info))
            return undefined;
        const data = info;
        const version = data.version?.semver;
        if (typeof version !== 'string' || !/^\d+\.\d+\.\d+(?:[-+][\w.+-]+)?$/.test(version))
            return undefined;
        const marker = headers.iamnodelink;
        const header = Array.isArray(marker) ? marker[0] : marker;
        const nodeLink = data.isNodelink === true || (typeof header === 'string' && header.trim().toLowerCase() === 'true');
        if (!nodeLink && !version.startsWith('4.'))
            return undefined;
        for (const [field, prefix] of [['sourceManagers', 'source'], ['filters', 'filter']]) {
            if (!Array.isArray(data[field]))
                continue;
            for (const name of data[field]) {
                if (typeof name === 'string' && /^[a-z0-9][\w.-]*$/i.test(name))
                    capabilities.add(`${prefix}:${name.toLowerCase()}`);
            }
        }
        return nodeLink ? new NodeLinkAdapter_1.NodeLinkAdapter(version, capabilities) : new LavalinkAdapter_1.LavalinkAdapter(version, capabilities);
    }
}
exports.BackendDetector = BackendDetector;
//# sourceMappingURL=BackendDetector.js.map