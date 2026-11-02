"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BackendAdapter = void 0;
class BackendAdapter {
    version;
    capabilities;
    protocolVersion = 4;
    observedFeatures = new Map();
    constructor(version, capabilities) {
        this.version = version;
        this.capabilities = capabilities;
        for (const feature of ['tracks:load', 'tracks:decode', 'player:update', 'session:resume']) {
            this.observedFeatures.set(feature, 'available');
        }
    }
    supports(feature) { return this.featureStatus(feature) === 'available'; }
    featureStatus(feature) {
        return this.observedFeatures.get(feature) ?? (this.capabilities.has(feature) ? 'available' : 'unknown');
    }
    recordFeature(feature, state) {
        this.observedFeatures.set(feature, state);
    }
}
exports.BackendAdapter = BackendAdapter;
//# sourceMappingURL=BackendAdapter.js.map