import { Manager } from "../core/Manager";
import { Node } from "../entities/Node";
import { AbstractPlugin } from "../plugins/AbstractPlugin";
import { INodeInfo } from "../typings/Interfaces";

export class PluginManager {
  private registeredPlugins: Map<string, new (...args: any[]) => AbstractPlugin> = new Map();
  private manager: Manager;

  constructor(manager: Manager) {
    this.manager = manager;
  }

  public registerPlugin(pluginClass: new (...args: any[]) => AbstractPlugin): void {
    const pluginInstance = new pluginClass();
    if (this.registeredPlugins.has(pluginInstance.name)) {
      this.manager.emit("debug", `Moonlink.js > PluginManager > Plugin ${pluginInstance.name} is already registered.`);
      return;
    }
    this.registeredPlugins.set(pluginInstance.name, pluginClass);
    this.manager.emit("debug", `Moonlink.js > PluginManager > Plugin ${pluginInstance.name} registered successfully.`);
  }

  private _processPlugin(node: Node, lavalinkPlugin: { name: string; version: string; }): void {
    const registeredPluginClass = this.registeredPlugins.get(lavalinkPlugin.name);
    if (registeredPluginClass) {
      const existingPluginInstance = node.plugins.get(lavalinkPlugin.name);
      if (!existingPluginInstance) {
        try {
          const pluginInstance = new registeredPluginClass();
          pluginInstance.load(node);
          node.plugins.set(pluginInstance.name, pluginInstance);
          pluginInstance.capabilities.forEach(cap => node.capabilities.add(cap));
          this.manager.emit("debug", `Moonlink.js > PluginManager > Plugin ${pluginInstance.name} (v${lavalinkPlugin.version}) loaded for node ${node.identifier}.${pluginInstance.capabilities.length > 0 ? ` Capabilities: [${pluginInstance.capabilities.join(', ')}]` : ''}`);
        } catch (e: any) {
          this.manager.emit("debug", `Moonlink.js > PluginManager > Failed to load plugin ${lavalinkPlugin.name} for node ${node.identifier}: ${e.message}`);
        }
      } else if (existingPluginInstance.onNodeInfoUpdate) {
        try {
          existingPluginInstance.onNodeInfoUpdate(node);
          this.manager.emit("debug", `Moonlink.js > PluginManager > Plugin ${lavalinkPlugin.name} (v${lavalinkPlugin.version}) updated for node ${node.identifier}.`);
        } catch (e: any) {
          this.manager.emit("debug", `Moonlink.js > PluginManager > Failed to update plugin ${lavalinkPlugin.name} for node ${node.identifier}: ${e.message}`);
        }
      }
    } else {
      this.manager.emit("debug", `Moonlink.js > PluginManager > No moonlink.js plugin registered for Lavalink plugin: ${lavalinkPlugin.name}`);
    }
  }

  public loadPluginsForNode(node: Node, lavalinkPlugins: INodeInfo['plugins']): void {
    node.capabilities.clear();
    node.plugins.clear();

    for (const lavalinkPlugin of lavalinkPlugins) {
      this._processPlugin(node, lavalinkPlugin);
    }
  }

  public unloadPluginsForNode(node: Node): void {
    for (const pluginInstance of node.plugins.values()) {
      try {
        pluginInstance.unload(node);
        this.manager.emit("debug", `Moonlink.js > PluginManager > Plugin ${pluginInstance.name} unloaded for node ${node.identifier ?? node.uuid}.`);
      } catch (e: any) {
        this.manager.emit("debug", `Moonlink.js > PluginManager > Failed to unload plugin ${pluginInstance.name} for node ${node.identifier ?? node.uuid}: ${e.message}`);
      }
    }
    node.capabilities.clear();
    node.plugins.clear();
  }

  public updateNodePlugins(node: Node): void {
    if (!node.info) {
      this.manager.emit("debug", `Moonlink.js > PluginManager > Node ${node.identifier} has no info to update.`);
      return;
    }

    const lavalinkPlugins = node.info.plugins || [];

    if (node.info.sourceManagers && Array.isArray(node.info.sourceManagers)) {
      for (const sourceManager of node.info.sourceManagers) {
        const capability = `search:${sourceManager}`;
        if (!node.capabilities.has(capability)) {
          node.capabilities.add(capability);
        }
      }
    }

    for (const [pluginName, pluginInstance] of node.plugins.entries()) {
      const lavalinkPlugin = lavalinkPlugins.find((p: any) => p.name === pluginName);
      if (!lavalinkPlugin) {
        this.manager.emit("debug", `Moonlink.js > PluginManager > Unloading plugin ${pluginName} from node ${node.identifier} (no longer reported by Lavalink).`);
        pluginInstance.unload(node);
        node.plugins.delete(pluginName);
        pluginInstance.capabilities.forEach(cap => node.capabilities.delete(cap));
      }
    }

    for (const lavalinkPlugin of lavalinkPlugins) {
      this._processPlugin(node, lavalinkPlugin);
    }
  }
}