import fs from "node:fs";
import path from "node:path";
import { createHash } from "node:crypto";
import http from "node:http";
import https from "node:https";
import zlib from "node:zlib";
import type { ITrack, ITrackInfo } from "./typings/Interfaces";

export const structures: Record<string, any> = {};

export const sources = {
  youtube: "ytsearch",
  youtubemusic: "ytmsearch",
  soundcloud: "scsearch",
  local: "local",
};

export abstract class Structure {
  public static manager: any;

  public static setManager(manager: any): void {
    this.manager = manager;
  }

  public static getManager(): any {
    return this.manager;
  }

  public static get(name: string): any {
    const structure = structures[name];
    if (!structure) {
      throw new TypeError(`"${name}" structure must be provided.`);
    }
    return structure;
  }

  public static extend(name: string, extender: any): void {
    structures[name] = extender;
  }
}

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
  const bufferArray: Buffer[] = [];

  function write(type: string, value: any): void {
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

export function generateUUID(host: string, port: number): string {
  const data = `${host}:${port}`;
  const hash = createHash("sha256").update(data).digest("hex");
  return hash;
}

export function Log(message: string, LogPath: string): void {
  const timestamp = new Date().toISOString();
  const logmessage = `[${timestamp}] ${message}\n`;

  const logpath = path.resolve(LogPath);

  fs.exists(logpath, (exists: boolean) => {
    if (!exists) {
      try {
        fs.mkdirSync(path.dirname(logpath), { recursive: true });
        fs.writeFileSync(logpath, "");
      } catch (error) {
        console.error("Failed to create log file:", error);
        return;
      }
    }
    try {
      fs.appendFileSync(logpath, logmessage);
    } catch (error) {
      console.error("Failed to append to log file:", error);
    }
  });
}

/**
 * Realiza uma requisição HTTP/HTTPS com suporte a retentativas, timeouts e redirecionamentos.
 *
 * @param initialUrl URL inicial da requisição.
 * @param options Opções da requisição (node:http.RequestOptions).
 * @param timeout Tempo limite da requisição em milissegundos.
 * @param retries Número de retentativas em caso de falha.
 * @param retryDelay Atraso inicial para a retentativa (cresce exponencialmente).
 * @param maxRedirects Número máximo de redirecionamentos a seguir.
 * @returns Uma Promise que resolve com o corpo da resposta (T) ou undefined em caso de falha.
 */
export async function makeRequest<T = any>(
  initialUrl: string,
  options: http.RequestOptions & { body?: any },
  timeout = 10000,
  retries = 3,
  retryDelay = 1000,
  maxRedirects = 5
): Promise<T | undefined> {
  let currentUrl = initialUrl;

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      let redirectCount = 0;

      while (redirectCount <= maxRedirects) {
        const result = await new Promise<T | { _redirect: string }>(
          (resolve, reject) => {
            const urlObject = new URL(currentUrl);
            const transport = urlObject.protocol === "https:" ? https : http;

            const requestOptions: http.RequestOptions = {
              ...options,
              hostname: urlObject.hostname,
              port: urlObject.port || (urlObject.protocol === "https:" ? 443 : 80),
              path: urlObject.pathname + urlObject.search,
              headers: {
                ...options.headers,
                "Accept-Encoding": "gzip, deflate, br",
              },
            };
            delete requestOptions.headers["host"];

            const req = transport.request(requestOptions, (res) => {
              const { statusCode, headers } = res;

              if (
                statusCode &&
                (statusCode === 301 ||
                  statusCode === 302 ||
                  statusCode === 307 ||
                  statusCode === 308) &&
                headers.location
              ) {
                req.destroy();
                return resolve({ _redirect: headers.location });
              }

              if (statusCode && (statusCode < 200 || statusCode >= 300)) {
                req.destroy();
                return reject(
                  new Error(`Server responded with status ${statusCode}`)
                );
              }

              let stream:
                | http.IncomingMessage
                | zlib.Gunzip
                | zlib.Inflate
                | zlib.BrotliDecompress = res;
              const encoding = res.headers["content-encoding"];

              if (encoding === "gzip") {
                stream = res.pipe(zlib.createGunzip());
              } else if (encoding === "deflate") {
                stream = res.pipe(zlib.createInflate());
              } else if (encoding === "br") {
                stream = res.pipe(zlib.createBrotliDecompress());
              }

              const chunks: Buffer[] = [];
              stream.on("data", (chunk) => chunks.push(chunk));
              stream.on("error", (err) =>
                reject(new Error(`Stream error: ${err.message}`))
              );

              stream.on("end", () => {
                const body = Buffer.concat(chunks);
                const contentType = res.headers["content-type"] || "";

                if (body.length === 0) {
                  if (contentType.includes("application/json")) {
                    return resolve({} as T);
                  }
                  return resolve("" as any);
                }

                try {
                  if (contentType.includes("application/json")) {
                    try {
                      return resolve(JSON.parse(body.toString()) as T);
                    } catch (e) {
                      return resolve(body.toString() as any as T);
                    }
                  }
                  return resolve(body.toString() as any as T);
                } catch (err) {
                  return reject(
                    new Error(
                      `Failed to parse response: ${(err as Error).message}`
                    )
                  );
                }
              });
            });

            req.on("error", (err) =>
              reject(new Error(`Request error: ${err.message}`))
            );
            req.on("timeout", () => {
              req.destroy();
              reject(new Error("Request timed out"));
            });

            req.setTimeout(timeout);

            if (options.body) {
              const bodyData =
                typeof options.body === "object" && options.body !== null
                  ? JSON.stringify(options.body)
                  : options.body.toString();

              req.setHeader("Content-Length", Buffer.byteLength(bodyData));
              req.write(bodyData);
            }

            req.end();
          }
        );

        if (
          typeof result === "object" &&
          result !== null &&
          (result as any)._redirect
        ) {
          const newLocation = (result as any)._redirect;
          currentUrl = new URL(newLocation, currentUrl).href;
          redirectCount++;
          continue;
        }

        return result as T;
      }

      throw new Error("Too many redirects");
    } catch (error) {
      console.error(
        `Attempt ${attempt + 1}/${retries + 1} failed for ${initialUrl}: ${
          (error as Error).message
        }`
      );

      if (attempt < retries) {
        await delay(retryDelay * Math.pow(2, attempt));
        currentUrl = initialUrl;
      } else {
        return undefined;
      }
    }
  }

  return undefined;
}

export function compareVersions(current: string, required: string): number {
  const curr = current.split(".").map(Number);
  const req = required.split(".").map(Number);
  const len = Math.max(curr.length, req.length);
  for (let i = 0; i < len; i++) {
    const a = curr[i] || 0;
    const b = req[i] || 0;
    if (a !== b) return a - b;
  }
  return 0;
}

export function stringifyWithReplacer(obj: any): string {
  const cache = new Set();
  return JSON.stringify(obj, (_key, value) => {
    if (typeof value === 'object' && value !== null) {
      if (cache.has(value)) {
        return "[Circular Refs]";
      }
      cache.add(value);
    }
    return value;
  });
}

export class Plugin {
  public name: string;
  public version: string;
  public description?: string;
  public author?: string | Record<string, any>
  public minVersion?: string;
  public load(manager: any): void {}
  public unload(manager: any): void {}
}

export function isSourceBlacklisted(manager: any, sourceName: string): boolean {
  if (!manager || !manager.options || !manager.options.blacklistedSources) {
    return false;
  }
  return manager.options.blacklistedSources.includes(sourceName);
}

export function isValidDiscordId(id: string): boolean {
  return typeof id === "string" && /^\d{17,20}$/.test(id);
}