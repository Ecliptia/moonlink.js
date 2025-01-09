import fs from 'fs';
import path from 'path';
import { Manager, Player, Queue, Node, Rest, Filters, Track, Lyrics, Listen, NodeManager, PlayerManager, SearchResult ,Extendable } from "../index";

export function validateProperty<T>(
  prop: T | undefined,
  validator: (value: T) => boolean,
  errorMessage: string,
) {
  if (!validator(prop)) {
    throw new Error(errorMessage);
  }
}

export async function isVoiceStateAttempt(player): Promise<boolean> {
  const voiceState = await player.node.rest.getPlayer(player.node.sessionId, player.guildId).voice;

  if (!player.voiceState && player.voiceChannelId && player.guildId && !player.connected) {
    await player.connect();
    player.manager.emit("debug", `Moonlink.js > Attempting to connect to voice channel ${player.voiceChannelId} for guild ${player.guildId}`);
    await delay(2000);

    if (!player.voiceState.attempt) {
      player.manager.emit("debug", `Moonlink.js > Failed to connect to voice channel ${player.voiceChannelId} for guild ${player.guildId}. Check if the packetUpdate function is getting data from Discord client side.`);
      return false;
    }
  }

  if (!player.voiceState.attempt && player.connected) {
    player.manager.emit("debug", `Moonlink.js > Waiting for voice state update for guild ${player.guildId}`);
    await delay(2000);

    if (!player.voiceState.attempt) {
      player.manager.emit("debug", `Moonlink.js > Failed to connect to voice channel ${player.voiceChannelId} for guild ${player.guildId}. Check if the packetUpdate function is getting data from Discord client side.`);
      return false;
    }
  }

  if (player.voiceState.attempt && voiceState?.sessionId === player.voiceState.session_id) {
    player.manager.emit("debug", `Moonlink.js > The voice state update for guild ${player.guildId} has been received`);
    return true;
  }

  return false;
}

function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export function Log(message: string, LogPath: string): void {
  const timestamp = new Date().toISOString();
  const logmessage = `[${timestamp}] ${message}\n`;

  const logpath = path.resolve(LogPath); 

  fs.exists(logpath, (exists: boolean) => {
    if (!exists) {
      fs.mkdirSync(path.dirname(logpath), { recursive: true });  
      fs.writeFileSync(logpath, ''); 
    }
    try {
      fs.appendFileSync(logpath, logmessage);
    } catch (error) {
      return false;
    }
  });
}

export function makeRequest<T>(url: string, options: RequestInit): Promise<T> {
    let request = fetch(url, options)
    .then((res) => res.json().catch(() => res.text()))
    .then((json) => json as T)
    
    if (!request) return;
    return request;
}

export const sources = {
  youtube: "ytsearch",
  youtubemusic: "ytmsearch",
  soundcloud: "scsearch",
  local: "local",
};

export const structures: Extendable = {
  NodeManager: NodeManager,
  PlayerManager: PlayerManager,
  SearchResult: SearchResult,
  Player: Player,
  Queue: Queue,
  Node: Node,
  Rest: Rest,
  Filters: Filters,
  Track: Track,
  Lyrics: Lyrics,
  Listen: Listen,
}

export abstract class Structure {
  public static manager: Manager;
  public static setManager(manager: Manager) {
    this.manager = manager;
  }
  public static getManager(): Manager {
    return this.manager;
  }
  
  public static get<K extends keyof Extendable>(name: K): Extendable[K] {
    const structure = structures[name];
    if (!structure) {
        throw new TypeError(`"${name}" structure must be provided.`);
    }
    return structure;
  }
  public static extend<K extends keyof Extendable>(name: K, extender: Extendable[K]) {
    structures[name] = extender;
  }
}

export class Plugin {
  public name: string;
  public load(manager: Manager): void {}
  public unload(manager: Manager): void {}
}
