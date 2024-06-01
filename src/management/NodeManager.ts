import { INode } from "../typings/Interfaces";
import { Manager, Node, validateProperty } from "../../index";
export class NodeManager {
    public readonly manager: Manager;
    public cache: Map<string | number, Node> = new Map();
    constructor(manager: Manager, nodes: INode[]) {
        nodes.forEach(node => {
           this.add(node);
        });
    }
    public check(node: INode): void {
        validateProperty(node.host, (value) => !!value, '(Moonlink.js) - Node > Host is required');
        validateProperty(node.port, (value) => value === undefined || (value >= 0 && value <= 65535), '(Moonlink.js) - Node > Invalid port value. Port must be a number between 0 and 65535.');
        validateProperty(node.password, (value) => value === undefined || typeof value === 'string', '(Moonlink.js) - Node > Invalid password value. Password must be a string.');
        validateProperty(node.secure, (value) => value === undefined || typeof value === 'boolean', '(Moonlink.js) - Node > Invalid secure value. Secure must be a boolean.');
        validateProperty(node.sessionId, (value) => value === undefined || typeof value === 'string', '(Moonlink.js) - Node > Invalid sessionId value. SessionId must be a string.');
        validateProperty(node.id, (value) => value === undefined || typeof value === 'number', '(Moonlink.js) - Node > Invalid id value. Id must be a number.');
        validateProperty(node.identifier, (value) => value === undefined || typeof value === 'string', '(Moonlink.js) - Node > Invalid identifier value. Identifier must be a string.');
        validateProperty(node.regions, (value) => value === undefined || Array.isArray(value), '(Moonlink.js) - Node > Invalid regions value. Regions must be an array.');
        validateProperty(node.retryDelay, (value) => value === undefined || value >= 0, '(Moonlink.js) - Node > Invalid retryDelay value. ReconnectTimeout must be a number greater than or equal to 0.');
        validateProperty(node.retryAmount, (value) => value === undefined || value >= 0, '(Moonlink.js) - Node > Invalid retryAmount value. ReconnectAmount must be a number greater than or equal to 0.');
    }
    public init(): void {
        this.cache.forEach(node => {
            node.connect();
        });
    }
    public add(node: INode): void {
        this.check(node);
        this.cache.set(node.id || node.identifier || node.identifier, new Node(this.manager, node));
    }
    public remove(identifier: string | number): void {
        this.cache.get(identifier)?.destroy();
        this.cache.delete(identifier);
    }
    public get(identifier: string | number): Node {
        return this.cache.get(identifier);
    }
    public get best(): Node {
        return [...this.cache.values()].filter(node => node.connected === true)
        .sort((a, b) => a.stats.players - b.stats.players)[0];
    }
}
