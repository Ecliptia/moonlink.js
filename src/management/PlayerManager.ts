import { IPlayerConfig } from "../typings/Interfaces";
import { Structure, Manager, Player, delay, validateProperty } from "../../index";
export class PlayerManager {
  readonly manager: Manager;
  public cache: Map<string, Player> = new Map();
  constructor(manager: Manager) {
    this.manager = manager;
  }
  public create(config: IPlayerConfig): Player {
    validateProperty(
      config.guildId,
      value => value !== undefined || value !== "string",
      "(Moonlink.js) - Player > GuildId is required"
    );

    if (this.has(config.guildId)) return this.get(config.guildId);

    validateProperty(
      config.voiceChannelId,
      value => value !== undefined || value == "string",
      "(Moonlink.js) - Player > VoiceChannelId is required"
    );
    validateProperty(
      config.textChannelId,
      value => value !== undefined || value == "string",
      "(Moonlink.js) - Player > TextChannelId is required"
    );
    validateProperty(
      config.volume,
      value => value === undefined || value >= 0,
      "(Moonlink.js) - Player > Invalid volume value. Volume must be a number between 0."
    );

    if (config.node) {
      validateProperty(
        this.manager.nodes.get(config.node),
        value => value !== undefined,
        "(Moonlink.js) - Player > Invalid node"
      );
    } else {
      let node = this.manager.nodes.sortByUsage(this.manager.options.sortTypeNode || "players");
      if (!node) throw new Error("(Moonlink.js) - Player > No available nodes");

      config.node = node.identifier ?? node.uuid;
    }

    const player: Player = new (Structure.get("Player"))(this.manager, config);
    this.cache.set(config.guildId, player);

    this.manager.emit(
      "debug",
      "Moonlink.js - Player > Player for guildId " + config.guildId + " has been created",
      config
    );

    return player;
  }
  public has(guildId: string): boolean {
    return this.cache.has(guildId);
  }
  public get(guildId: string): Player {
    return this.cache.get(guildId);
  }
  public async delete(guildId: string): Promise<void> {
    if (!this.has(guildId)) return;
    await this.get(guildId).node.rest.destroy(guildId);
    this.cache.delete(guildId);
    this.manager.database.delete(`players.${guildId}`);
    this.manager.database.delete(`queues.${guildId}`);

    this.manager.emit(
      "debug",
      "Moonlink.js - Player > Player for guildId " + guildId + " has been deleted"
    );
  }
  public get all(): Player[] {
    return [...this.cache.values()];
  }
}

export async function isVoiceStateAttempt(player): Promise<boolean> {
  const voiceState = await player.node.rest.getPlayer(player.node.sessionId, player.guildId).voice;

  const logDebug = (message: string) => player.manager.emit("debug", `Moonlink.js > ${message}`);

  const ensureConnection = async () => {
    if (
      !player.voiceState?.attempt &&
      player.voiceChannelId &&
      player.guildId &&
      !player.connected
    ) {
      logDebug(
        `Attempting to connect to voice channel ${player.voiceChannelId} for guild ${player.guildId}`
      );
      await player.connect();
      await delay(2000);
    }
    return player.voiceState?.attempt;
  };

  const verifyUpdate = async () => {
    if (!player.voiceState?.attempt && player.connected) {
      logDebug(`Waiting for voice state update for guild ${player.guildId}`);
      await delay(2000);
    }
    return player.voiceState?.attempt;
  };

  const validateSession = () => voiceState?.sessionId === player.voiceState?.session_id;

  const isConnected = await ensureConnection();
  if (!isConnected && !(await verifyUpdate())) {
    logDebug(
      `Failed to connect to voice channel ${player.voiceChannelId} for guild ${player.guildId}. Check if the packetUpdate function is getting data from Discord client side.`
    );
    return false;
  }

  if (validateSession()) {
    logDebug(`The voice state update for guild ${player.guildId} has been received`);
    return true;
  }

  return false;
}
