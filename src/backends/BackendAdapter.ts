export type BackendKind = 'lavalink' | 'nodelink';
export type CapabilityState = 'available' | 'unavailable' | 'unknown';

/** Metadata/capability contract; both backends continue to share the v4 Rest transport. */
export abstract class BackendAdapter {
    public abstract readonly kind: BackendKind;
    public readonly protocolVersion = 4;
    private readonly observedFeatures = new Map<string, CapabilityState>();

    constructor(public readonly version: string, public readonly capabilities: Set<string>) {
        for (const feature of ['tracks:load', 'tracks:decode', 'player:update', 'session:resume']) {
            this.observedFeatures.set(feature, 'available');
        }
    }

    public supports(feature: string): boolean { return this.featureStatus(feature) === 'available'; }

    public featureStatus(feature: string): CapabilityState {
        return this.observedFeatures.get(feature) ?? (this.capabilities.has(feature) ? 'available' : 'unknown');
    }

    /** An endpoint response may refine support without guessing from a product name. */
    public recordFeature(feature: string, state: CapabilityState): void {
        this.observedFeatures.set(feature, state);
    }
}
