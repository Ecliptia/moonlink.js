declare let MemoryNode: any[];
declare let IdealNode: any;
declare let CurrentTrack: any;
declare let sendDiscord: any;
declare let skipMem: any;
declare let database: any;
declare let makeRequest: any;
declare let db: any;
declare let track: {
    skip: () => any;
    skipEdit: (i: any) => void;
    current: () => any;
    editCurrent: (track: any) => void;
};
declare function esdw(x: any): void;
declare function sendDs(): any;
declare function request(node: any, endpoint: any, params: any): any;
export { MemoryNode, IdealNode, CurrentTrack, sendDiscord, skipMem, database, makeRequest, db, track, esdw, sendDs, request };

