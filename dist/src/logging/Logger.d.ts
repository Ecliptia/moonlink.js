import { type AudioNodeStatus, type FailoverReport } from './LogFormatter';
import { type NyxLogLevel } from './LogLevels';
import type { Manager } from '../core/Manager';
export type LoggerOptions = {
    level?: NyxLogLevel;
    color?: boolean;
    timestamps?: boolean;
    width?: number;
};
export type DebugSource = {
    on(event: 'debug', listener: (message: string) => void): unknown;
    off?(event: 'debug', listener: (message: string) => void): unknown;
    removeListener?(event: 'debug', listener: (message: string) => void): unknown;
};
export declare class Logger {
    private readonly instance;
    private readonly reporter;
    private readonly options;
    private currentLevel;
    constructor(options?: LoggerOptions);
    setLevel(level: NyxLogLevel): void;
    private canShowInfo;
    for(module: string): import("consola").ConsolaInstance;
    info(module: string, message: string, ...args: unknown[]): void;
    success(module: string, message: string, ...args: unknown[]): void;
    warn(module: string, message: string, ...args: unknown[]): void;
    error(module: string, message: string, ...args: unknown[]): void;
    debug(module: string, message: string, ...args: unknown[]): void;
    trace(module: string, message: string, ...args: unknown[]): void;
    box(module: string, title: string, fields: Record<string, unknown>): void;
    banner(): void;
    systemStatus(nodes: AudioNodeStatus[]): void;
    failover(event: FailoverReport): void;
    attachLegacyDebug(source: DebugSource): () => void;
    managerStatus(manager: Manager): void;
    attachManager(manager: Manager): () => void;
}
