import { IPlayerConfig } from "../typings/Interfaces";
import { Manager, Player, validateProperty } from "../../index";
export class PlayerManager {
  readonly manager: Manager;
  public cache: Map<string, Player> = new Map();
  constructor(manager: Manager) {
    this.manager = manager;
  }
  public create(config: IPlayerConfig): Player {
    validateProperty(
      config.guildId,
      (value) => value !== undefined || value !== "string",
      "(Moonlink.js) - Player > GuildId is required",
    );

    if (this.has(config.guildId)) return this.get(config.guildId);

    validateProperty(
      config.voiceChannelId,
      (value) => value !== undefined || value == "string",
      "(Moonlink.js) - Player > VoiceChannelId is required",
    );
    validateProperty(
      config.textChannelId,
      (value) => value !== undefined || value == "string",
      "(Moonlink.js) - Player > TextChannelId is required",
    );
    validateProperty(
      config.volume,
      (value) => value === undefined || value >= 0,
      "(Moonlink.js) - Player > Invalid volume value. Volume must be a number between 0.",
    );

    if (config.node) {
      validateProperty(
        this.manager.nodes.get(config.node),
        (value) => value !== undefined,
        "(Moonlink.js) - Player > Invalid node",
      );
    } else {
      let node = this.manager.nodes.sortByUsage(
        this.manager.options.sortTypeNode || "players",
      );
      if (!node) throw new Error("(Moonlink.js) - Player > No available nodes");

      config.node = node.identifier ?? node.host;
    }

    const player: Player = new Player(this.manager, config);
    this.cache.set(config.guildId, player);
    return player;
  }
  public has(guildId: string): boolean {
    return this.cache.has(guildId);
  }
  public get(guildId: string): Player {
    return this.cache.get(guildId);
  }
  public remove(guildId: string): void {
    this.cache.delete(guildId);
  }
}
