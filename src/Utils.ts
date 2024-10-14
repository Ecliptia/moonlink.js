import { Manager, Player, Queue, Node, Rest, Filters, Track, Lyrics, Listen, NodeManager, PlayerManager, Extendable } from "../index";

export function validateProperty<T>(
  prop: T | undefined,
  validator: (value: T) => boolean,
  errorMessage: string,
) {
  if (!validator(prop)) {
    throw new Error(errorMessage);
  }
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
