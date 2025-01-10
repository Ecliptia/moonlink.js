import fs from "fs";
import path from "path";
import { createHash } from "crypto";
import {
  Manager,
  Database,
  Player,
  Queue,
  Node,
  Rest,
  Filters,
  Track,
  Lyrics,
  Listen,
  NodeManager,
  PlayerManager,
  SearchResult,
  Extendable,
  ITrack,
  ITrackInfo,
} from "../index";

export function validateProperty<T>(
  prop: T | undefined,
  validator: (value: T) => boolean,
  errorMessage: string
) {
  if (!validator(prop)) {
    throw new Error(errorMessage);
  }
}

export function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// nodelink Decode was used as a base

export function decodeTrack(encoded: string): ITrack {
  const buffer = Buffer.from(encoded, "base64");
  let position = 0;

  const read = {
    byte: () => buffer[position++],
    ushort: () => {
      const value = buffer.readUInt16BE(position);
      position += 2;
      return value;
    },
    int: () => {
      const value = buffer.readInt32BE(position);
      position += 4;
      return value;
    },
    long: () => {
      const value = buffer.readBigInt64BE(position);
      position += 8;
      return value;
    },
    utf: () => {
      const length = read.ushort();
      const value = buffer.toString("utf8", position, position + length);
      position += length;
      return value;
    },
  };

  const firstInt = read.int();
  const isVersioned = ((firstInt & 0xc0000000) >> 30) & 1;
  const version = isVersioned ? read.byte() : 1;

  return {
    encoded: encoded,
    info: {
      title: read.utf(),
      author: read.utf(),
      length: Number(read.long()),
      identifier: read.utf(),
      isSeekable: true,
      isStream: !!read.byte(),
      uri: version >= 2 && read.byte() ? read.utf() : null,
      artworkUrl: version === 3 && read.byte() ? read.utf() : null,
      isrc: version === 3 && read.byte() ? read.utf() : null,
      sourceName: read.utf(),
      position: Number(read.long()),
    },
    pluginInfo: {},
    userData: {},
  };
}

export function encodeTrack(track: ITrackInfo): string {
  const bufferArray = [];

  function write(type, value) {
    if (type === "byte") bufferArray.push(Buffer.from([value]));
    if (type === "ushort") {
      const buf = Buffer.alloc(2);
      buf.writeUInt16BE(value);
      bufferArray.push(buf);
    }
    if (type === "int") {
      const buf = Buffer.alloc(4);
      buf.writeInt32BE(value);
      bufferArray.push(buf);
    }
    if (type === "long") {
      const buf = Buffer.alloc(8);
      buf.writeBigInt64BE(BigInt(value));
      bufferArray.push(buf);
    }
    if (type === "utf") {
      const strBuf = Buffer.from(value, "utf8");
      write("ushort", strBuf.length);
      bufferArray.push(strBuf);
    }
  }

  const version = track.artworkUrl || track.isrc ? 3 : track.uri ? 2 : 1;

  const isVersioned = version > 1 ? 1 : 0;
  const firstInt = isVersioned << 30;
  write("int", firstInt);

  if (isVersioned) {
    write("byte", version);
  }

  write("utf", track.title);
  write("utf", track.author);
  write("long", track.length);
  write("utf", track.identifier);
  write("byte", track.isStream ? 1 : 0);

  if (version >= 2) {
    write("byte", track.uri ? 1 : 0);
    if (track.uri) write("utf", track.uri);
  }

  if (version === 3) {
    write("byte", track.artworkUrl ? 1 : 0);
    if (track.artworkUrl) write("utf", track.artworkUrl);

    write("byte", track.isrc ? 1 : 0);
    if (track.isrc) write("utf", track.isrc);
  }

  write("utf", track.sourceName);
  write("long", track.position);

  return Buffer.concat(bufferArray).toString("base64");
}

export function generateShortUUID(host: string, port: number, identifier = ""): string {
  const data = `${host}:${port}:${identifier}`;
  const hash = createHash("sha256").update(data).digest("hex");
  return parseInt(hash.slice(0, 8), 16).toString(36).padEnd(8, "0");
}

export function Log(message: string, LogPath: string): void {
  const timestamp = new Date().toISOString();
  const logmessage = `[${timestamp}] ${message}\n`;

  const logpath = path.resolve(LogPath);

  fs.exists(logpath, (exists: boolean) => {
    if (!exists) {
      fs.mkdirSync(path.dirname(logpath), { recursive: true });
      fs.writeFileSync(logpath, "");
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
    .then(res => res.json().catch(() => res.text()))
    .then(json => json as T);

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
  Database: Database,
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
};

export abstract class Structure {
  public static manager: Manager;
  public static setManager(manager: Manager): void {
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
