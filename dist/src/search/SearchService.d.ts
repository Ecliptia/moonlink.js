import type { Manager } from '../core/Manager';
import type { IRESTLoadTracks, ISearchQuery } from '../typings/Interfaces';
export declare class SearchService {
    private readonly manager;
    private readonly native;
    private readonly cache;
    private readonly pending;
    constructor(manager: Manager, native: (query: ISearchQuery) => Promise<IRESTLoadTracks | null>);
    close(): void;
    private wait;
    private validate;
    private present;
    search(query: ISearchQuery): Promise<any>;
}
