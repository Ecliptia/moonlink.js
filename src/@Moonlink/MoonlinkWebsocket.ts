import * as tls from "tls";
import * as https from "https";
import * as http from "http";
import { URL } from "url";
import { EventEmitter } from "events";

interface WebSocketOptions {
  timeout?: number;
  headers?: Record<string, string>;
  secure?: boolean;
  host?: string;
  port?: number;
  maxConnections?: number;
}

class WebSocketError extends Error {
  public innerError: Error;
  public name: string;
  constructor(message: string, innerError: Error) {
    super(message);
    this.name = "WebSocketError";
    this.innerError = innerError;
  }
}

export class MoonlinkWebsocket extends EventEmitter {
  public options: WebSocketOptions;
  public socket: any = null;
  public agent: any;
  public url: URL;
  public connectionCount = 0;

  constructor(url: string, options: WebSocketOptions = {}) {
    super();
    this.url = new URL(url);
    this.options = {
      timeout: 1000,
      headers: {},
      maxConnections: 100,
      ...options,
    };
    this.agent = this.options.secure ? https : http;
  }

  public connect(): void {
    if (this.connectionCount < this.options.maxConnections) {
      const requestOptions: any = {
        hostname: this.url.hostname,
        port: this.url.port,
        method: "GET",
        timeout: this.options.timeout || 5000,
        headers: this.buildHeaders(),
        protocol: this.options.secure ? "https:" : "http:",
      };
      this.socket = this.agent.request(requestOptions);

      this.setupSocketListeners();
      this.incrementConnectionCount();
    } else {
      console.error("Maximum connection limit reached.");
    }
  }

  public send(data: string) {
    if (this.socket) {
      this.socket.write(data);
    } else {
      console.error("WebSocket is not connected for sending.");
      this.emit("error", new Error("WebSocket is not connected for sending."));
    }
  }

  public close(code?: number, reason?: string) {
    if (this.socket) {
      if (code && reason) {
        const closeFrame = this.createWebSocketCloseFrame(code, reason);
        this.socket.write(closeFrame);
      }
      this.socket.end();
    } else {
      console.error("WebSocket is not connected to close.");
      this.emit("error", new Error("WebSocket is not connected to close."));
    }
  }

  private setupSocketListeners() {
    this.socket.on("error", this.handleSocketError.bind(this));
    this.socket.on("upgrade", this.handleSocketUpgrade.bind(this));
    this.socket.on("socket", this.handleSocketConnection.bind(this));
  }

  private handleSocketError(err: Error) {
    console.error("WebSocket error:", err);
    this.emit("error", new WebSocketError("WebSocket error", err));
  }

  private handleSocketUpgrade(res: any, socket: any, head: any) {
    if (res.statusCode !== 101) {
      this.emit(
        "error",
        new Error(
          `[ @Moonlink/Websocket ]: ${res.statusCode} ${res.statusMessage}`,
        ),
      );
      return;
    }

    socket.on("data", (data: Buffer) => {
      const frameHeader = this.parseFrameHeader(data);
      const payload = data.subarray(frameHeader.payloadStartIndex);
      this.emit("message", payload.toString());
    });

    this.emit("open", socket);
  }

  private handleSocketConnection(req: any) {
    req.on(this.options.secure ? "secureConnect" : "connect", () => {
      req.write(this.buildUpgradeHeaders() + "\r\n\r\n");
    });
  }

  private buildHeaders(): Record<string, string> {
    const headers: Record<string, string> = {
      "Sec-WebSocket-Key": this.generateWebSocketKey(),
      "Sec-WebSocket-Version": "13",
      Upgrade: "websocket",
      Connection: "Upgrade",
      ...(this.options.headers || {}),
    };
    return headers;
  }

  private generateWebSocketKey(): string {
    const keyBytes = [];
    for (let i = 0; i < 16; i++) {
      keyBytes.push(Math.floor(Math.random() * 256));
    }
    return Buffer.from(keyBytes).toString("base64");
  }

  private createWebSocketCloseFrame(code: number, reason: string): Buffer {
    const buffer = Buffer.alloc(6);
    buffer.writeUInt16BE(code, 0);
    buffer.write(reason, 2, "utf8");
    return buffer;
  }

  private parseFrameHeader(data: Buffer) {
    if (data.length < 2) {
      throw new Error("WebSocket frame header is too short.");
    }

    const isFinalFrame = (data[0] & 0x80) !== 0;
    const opcode = data[0] & 0x0f;
    const isMasked = (data[1] & 0x80) !== 0;
    let payloadStartIndex = 2;
    let payloadLength = data[1] & 0x7f;

    if (payloadLength === 126) {
      if (data.length < 4) {
        throw new Error(
          "WebSocket frame header is too short for extended payload length.",
        );
      }
      payloadLength = data.readUInt16BE(2);
      payloadStartIndex = 4;
    } else if (payloadLength === 127) {
      if (data.length < 10) {
        throw new Error(
          "WebSocket frame header is too short for extended payload length.",
        );
      }
      const upperPart = data.readUInt32BE(6);
      const lowerPart = data.readUInt32BE(2);
      payloadLength = upperPart * Math.pow(2, 32) + lowerPart;
      payloadStartIndex = 10;
    }

    let mask: any | null = null;
    if (isMasked) {
      if (data.length < payloadStartIndex + 4) {
        throw new Error("WebSocket frame header is too short for masking key.");
      }
      mask = data.slice(payloadStartIndex, payloadStartIndex + 4);
      payloadStartIndex += 4;
    }

    return {
      isFinalFrame,
      opcode,
      payloadLength,
      isMasked,
      mask,
      payloadStartIndex,
    };
  }

  private buildUpgradeHeaders(): string {
    const headers = [
      `GET ${this.url.pathname}${this.url.search} HTTP/1.1`,
      `Host: ${this.url.host}`,
      "Upgrade: websocket",
      "Connection: Upgrade",
      `Sec-WebSocket-Key: ${this.generateWebSocketKey()}`,
      "Sec-WebSocket-Version: 13",
    ];

    if (this.options.headers) {
      Object.keys(this.options.headers).forEach((key) => {
        headers.push(`${key}: ${this.options.headers[key]}`);
      });
    }
    return headers.join("\r\n");
  }

  private incrementConnectionCount() {
    this.connectionCount++;
  }
}
