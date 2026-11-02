export type LogEntry = {
    type: string;
    tag?: string;
    args: unknown[];
    date?: Date;
};
export type FormatterOptions = {
    color?: boolean;
    timestamps?: boolean;
    width?: number;
};
export declare function ansi(text: string, code: number, enabled: boolean): string;
export declare function formatValue(value: unknown): string;
export declare function formatArgs(args: unknown[]): string;
export declare function formatBox(title: string, details?: Record<string, unknown>, width?: number): string;
export declare function formatEntry(entry: LogEntry, options?: FormatterOptions): string;
export type AudioNodeStatus = {
    name: string;
    backend: 'Lavalink' | 'NodeLink' | string;
    state: 'connected' | 'ready' | 'connecting' | 'disconnected' | 'degraded' | string;
    latencyMs?: number;
    players?: number;
};
export type FailoverReport = {
    source: string;
    target: string;
    status: 'recovered' | 'failed' | 'in-progress' | 'cancelled';
    positionMs?: number;
    guildId?: string;
    reason?: string;
};
export declare function formatSystemStatus(nodes: AudioNodeStatus[], options?: FormatterOptions): string;
export declare function formatFailover(event: FailoverReport, options?: FormatterOptions): string;
