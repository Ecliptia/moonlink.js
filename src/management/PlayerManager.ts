import { IPlayerConfig } from "../typings/Interfaces";
import { Structure, Manager, Player, delay, validateProperty } from "../../index";
export class PlayerManager {
  readonly manager: Manager;
  public cache: Map<string, Player> = new Map();
  constructor(manager: Manager) {
    this.manager = manager;
  }
  public create(config: IPlayerConfig): Player | undefined {
    const finalConfig = { ...this.manager.options.defaultPlayer, ...config };

    validateProperty(
      finalConfig.guildId,
      value => typeof value === "string",
      "(Moonlink.js) - Player > GuildId is required"
    );

    if (this.has(finalConfig.guildId)) return this.get(finalConfig.guildId);

    validateProperty(
      finalConfig.voiceChannelId,
      value => typeof value === "string",
      "(Moonlink.js) - Player > VoiceChannelId is required"
    );
    validateProperty(
      finalConfig.textChannelId,
      value => typeof value === "string",
      "(Moonlink.js) - Player > TextChannelId is required"
    );
    validateProperty(
      finalConfig.volume,
      value => value === undefined || value >= 0,
      "(Moonlink.js) - Player > Invalid volume value. Volume must be a number between 0."
    );

    if (finalConfig.node) {
      const node = this.manager.nodes.get(finalConfig.node);
      if (!node) {
        this.manager.emit("debug", `(Moonlink.js) - Player > Invalid node: ${finalConfig.node}`);
        return undefined;
      }
    } else {
      let node = this.manager.nodes.sortByUsage(this.manager.options.sortTypeNode || "players", finalConfig.voiceChannelId);
      if (!node) {
        this.manager.emit("debug", "(Moonlink.js) - Player > No available nodes to create a player.");
        return undefined;
      }

      finalConfig.node = node.identifier ?? node.uuid;
    }

    const player: Player = new (Structure.get("Player"))(this.manager, finalConfig);
    this.cache.set(finalConfig.guildId, player);

    this.manager.emit(
      "debug",
      "Moonlink.js - Player > Player for guildId " + finalConfig.guildId + " has been created",
      finalConfig
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
    await this.manager.database.remove(`players.${guildId}`);
    await this.manager.database.remove(`queues.${guildId}`);

    this.manager.emit(
      "debug",
      "Moonlink.js - Player > Player for guildId " + guildId + " has been deleted"
    );
  }

  public async autoJoin(options: { voiceChannelId: string; textChannelId: string; guildId: string } & Partial<IPlayerConfig>): Promise<Player | undefined> {
    const { voiceChannelId, textChannelId, guildId, ...rest } = options;

    let player = this.get(guildId);

    if (!player) {
      player = this.create({ voiceChannelId, textChannelId, guildId, ...rest });
      if (!player) return undefined;
    }

    if (player.voiceChannelId !== voiceChannelId) {
      player.setVoiceChannelId(voiceChannelId);
    }
    if (player.textChannelId !== textChannelId) {
      player.setTextChannelId(textChannelId);
    }

    player.connect();

    this.manager.emit(
      "debug",
      `Moonlink.js - PlayerManager > autoJoin: Player for guildId ${guildId} is ready.`
    );

    return player;
  }

  public get all(): Player[] {
    return [...this.cache.values()];
  }
}

export async function isVoiceStateAttempt(player: Player): Promise<boolean> {
  const logDebug = (message: string) => player.manager.emit("debug", `Moonlink.js > ${message}`);

  if (!player.voiceChannelId || !player.guildId) {
    logDebug(`isVoiceStateAttempt: Missing voiceChannelId or guildId for player ${player.guildId}.`);
    return false;
  }

  if (!player.connected && !player.voiceState?.attempt) {
    logDebug(`isVoiceStateAttempt: Player ${player.guildId} not connected, attempting to connect.`);
    await player.connect();
    await delay(2000);
  }

  const voiceState = await player.node.rest.getPlayer(player.node.sessionId, player.guildId);
    if (voiceState && voiceState.voice?.sessionId === player.voiceState?.sessionId) {
    logDebug(`isVoiceStateAttempt: Voice state update received and session valid for player ${player.guildId}.`);
    return true;
  }

  logDebug(
    `isVoiceStateAttempt: Failed to validate voice state for player ${player.guildId}. ` +
    `Connected: ${player.connected}, VoiceStateAttempt: ${player.voiceState?.attempt}, ` +
    `Lavalink SessionId: ${voiceState?.voice?.sessionId}, Player SessionId: ${player.voiceState?.sessionId}.`
  );
  return false;
}