import { Manager } from "../core/Manager";
import { Node } from "../entities/Node";
import { AbstractPlugin } from "../plugins/AbstractPlugin";
import { INodeInfo } from "../typings/Interfaces";
export declare class PluginManager {
    private registeredPlugins;
    private manager;
    constructor(manager: Manager);
    registerPlugin(pluginClass: new (...args: any[]) => AbstractPlugin): void;
    private _processPlugin;
    loadPluginsForNode(node: Node, lavalinkPlugins: INodeInfo['plugins']): void;
    unloadPluginsForNode(node: Node): void;
    updateNodePlugins(node: Node): void;
}
