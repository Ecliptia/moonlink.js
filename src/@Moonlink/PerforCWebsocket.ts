import net from "node:net";
import tls from "node:tls";
import https from "node:https";
import http from "node:http";
import crypto from "node:crypto";
import EventEmitter from "node:events";
import { URL, UrlObject } from "node:url";

export type WebSocketOptions = {
  headers?: http.OutgoingHttpHeaders | undefined;
  timeout?: number;
};

export type FrameOptions = {
  fin: boolean;
  opcode: number;
  len: number;
};

function parsePacket(data: Buffer): Buffer {
  let payloadStartIndex: number = 2;

  const opcode: number = data[0] & 0b00001111;

  if (opcode == 0x0) payloadStartIndex += 2;

  let payloadLength: number = data[1] & 0b01111111;

  if (payloadLength == 126) {
    payloadStartIndex += 2;
    payloadLength = data.readUInt16BE(2);
  } else if (payloadLength == 127) {
    payloadStartIndex += 8;
    payloadLength = Number(data.readBigUInt64BE(2));
  }

  return data.subarray(payloadStartIndex);
}

export class WebSocket extends EventEmitter {
  private url: string;
  private options: WebSocketOptions;
  private socket: net.Socket | null;

  constructor(url: string, options: WebSocketOptions) {
    super();

    this.url = url;
    this.options = options;
    this.socket = null;

    this.connect();

    return this;
  }

  connect(): void {
    const parsedUrl: UrlObject = new URL(this.url);
    const isSecure: Boolean = parsedUrl.protocol == "wss:";
    const agent: typeof https | typeof http = isSecure ? https : http;
    const key = crypto.randomBytes(16).toString("base64");

    const request = agent.request(
      (isSecure ? "https://" : "http://") +
        parsedUrl.hostname +
        parsedUrl.pathname,
      {
        port: parsedUrl.port || (isSecure ? 443 : 80),
        timeout: 5000,
        createConnection: (options: http.ClientRequestArgs) => {
          if (isSecure) {
            options.path = undefined;

            if (
              !(options as tls.ConnectionOptions).servername &&
              (options as tls.ConnectionOptions).servername !== ""
            ) {
              (options as tls.ConnectionOptions).servername = net.isIP(
                options.host,
              )
                ? ""
                : options.host;
            }

            return tls.connect(options as tls.ConnectionOptions);
          } else {
            options.path = options.socketPath;

            return net.connect(options as net.NetConnectOpts);
          }
        },
        headers: {
          "Sec-WebSocket-Key": key,
          "Sec-WebSocket-Version": 13,
          Upgrade: "websocket",
          Connection: "Upgrade",
          ...(this.options.headers || {}),
        },
        method: "GET",
      },
    );

    request.on("error", (err: Error) => {
      this.emit("error", err);
      this.emit("close");
    });

    request.on(
      "upgrade",
      (res: http.IncomingMessage, socket: net.Socket, _head: any) => {
        this.emit("open");
        if (
          res.headers.upgrade &&
          res.headers.upgrade.toLowerCase() != "websocket"
        ) {
          socket.destroy();

          return;
        }

        const digest = crypto
          .createHash("sha1")
          .update(key + "258EAFA5-E914-47DA-95CA-C5AB0DC85B11")
          .digest("base64");

        if (res.headers["sec-websocket-accept"] != digest) {
          socket.destroy();

          return;
        }

        socket.on("data", (data: Buffer) =>
          this.emit("message", parsePacket(data).toString()),
        );

        socket.on("close", () => this.emit("close"));

        this.socket = socket;
      },
    );

    request.end();
  }

  sendFrame(data: Uint8Array, options: FrameOptions): boolean {
    if (!this.socket) return false;

    let startIndex = 2;

    if (options.len >= 65536) {
      startIndex += 8;
      options.len = 127;
    } else if (options.len > 125) {
      startIndex += 2;
      options.len = 126;
    }

    const header = Buffer.allocUnsafe(startIndex);
    header[0] = options.fin ? options.opcode | 0x80 : options.opcode;
    header[1] = options.len;

    if (options.len == 126) {
      header.writeUInt16BE(options.len, 2);
    } else if (options.len == 127) {
      header[2] = header[3] = 0;
      header.writeUIntBE(options.len, 4, 6);
    }

    if (!this.socket.write(Buffer.concat([header, data]))) {
      this.socket.end();

      return false;
    }

    return true;
  }

  close(code?: number, reason?: string) {
    const data = Buffer.allocUnsafe(
      2 + Buffer.byteLength(reason || "normal close"),
    );
    data.writeUInt16BE(code || 1000);
    data.write(reason || "normal close", 2);

    this.sendFrame(data, { len: data.length, fin: true, opcode: 0x08 });

    return true;
  }
}
