export type BackendKind = 'lavalink' | 'nodelink';
export type CapabilityState = 'available' | 'unavailable' | 'unknown';
export declare abstract class BackendAdapter {
    readonly version: string;
    readonly capabilities: Set<string>;
    abstract readonly kind: BackendKind;
    readonly protocolVersion = 4;
    private readonly observedFeatures;
    constructor(version: string, capabilities: Set<string>);
    supports(feature: string): boolean;
    featureStatus(feature: string): CapabilityState;
    recordFeature(feature: string, state: CapabilityState): void;
}
