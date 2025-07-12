import { Manager, ISource } from '../../index';
export declare class SourceManager {
    readonly manager: Manager;
    sources: Record<string, ISource>;
    constructor(manager: Manager);
    add(source: ISource): void;
    get(name: string): ISource | undefined;
    has(name: string): boolean;
    remove(name: string): void;
    clear(): void;
    getAll(): ISource[];
    loadFolder(): Promise<void>;
    isLinkMatch(url: string, _unusedSourceParam?: string): [boolean, string | null];
}
