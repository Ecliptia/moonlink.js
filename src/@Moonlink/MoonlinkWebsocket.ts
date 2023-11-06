import { EventEmitter } from "events";
import http, { RequestOptions as HttpRequestOptions } from "http";
import https, { RequestOptions as HttpsRequestOptions } from "https";
import crypto from "crypto";
import { URL } from "url";

interface WebSocketOptions {
  timeout?: number;
  headers?: Record<string, string>;
  host?: string;
  port?: number;
  maxConnections?: number;
  secure?: boolean;
}

export class MoonlinkWebsocket extends EventEmitter {
  public options: WebSocketOptions;
  public socket: any = null;
  public url: any;
  public connectionCount = 0;
  private buffers: string[] = [];
  private established: boolean = false;
  constructor(url: string, options: WebSocketOptions = {}) {
    super();
    this.url = url;
    this.options = {
      timeout: 1000,
      headers: {},
      maxConnections: 100,
      secure: false,
      ...options,
    };
  }

  private buildRequestOptions(): HttpsRequestOptions | HttpRequestOptions {
    const requestOptions: HttpsRequestOptions | HttpRequestOptions = {
      port: this.options.port,
      headers: this.buildHeaders(),
      method: "GET",
    };

    return this.options.secure
      ? requestOptions
      : { ...requestOptions, protocol: "http:" };
  }

  private buildHeaders(): Record<string, string> {
    const headers: Record<string, string> = { ...this.options.headers };
    headers["Host"] = this.options.host;
    headers["Upgrade"] = "websocket";
    headers["Connection"] = "Upgrade";
    headers["Sec-WebSocket-Key"] = crypto.randomBytes(16).toString("hex");
    headers["Sec-WebSocket-Version"] = "13";

    return headers;
  }

  public connect(): void {
    try {
      new URL(this.url);
    } catch (error) {
      this.emit("error", error);
      this.emit("close", 1006, "Invalid URL");
      return;
    }
    const requestOptions = this.buildRequestOptions();
    const protocol = this.options.secure ? https : http;
    const req = protocol.request(this.url, requestOptions, (res) => {
      if (res.statusCode !== 101) {
        this.emit(
          "error",
          new Error(
            `WebSocket upgrade failed with status code ${res.statusCode}`,
          ),
        );
        this.emit("close", 1006, "Upgrade Failed");
        return;
      }
    });

    req.on("error", (error) => {
      this.emit("error", error);
      this.emit("close", 1006, "Request Error");
    });

    req.on("close", () => {
      if (!this.established) this.emit("close", 1006, "Connection Close");
    });
    req.on("upgrade", (res, socket) => {
      this.handleWebSocketConnection(socket);
    });
    req.end();
  }

  private handleWebSocketConnection(socket: any): void {
    this.socket = socket;
    this.emit("open", socket);
    this.established = true;
    this.socket.on("end", () => {
      this.emit("close", 1006, "desconnected");
    });
    this.socket.on("data", (data) => {
      this.handleWebSocketData(data);
    });

    this.socket.on("error", (error) => {
      this.emit("error", error);
    });
    this.socket.on("close", () => this.emit("close", 1006, "close"));
    this.socket.setEncoding("utf8");
  }

  private handleWebSocketData(data: any): void {
    this.buffers.push(data);
    this.emitMessagesFromBuffers();
  }

  private emitMessagesFromBuffers(): void {
    for (let i = 0; i < this.buffers.length; i++) {
      const jsonObjects = this.findJSONObjects(this.buffers[i]);
      if (jsonObjects.length > 0) {
        for (const jsonObj of jsonObjects) {
          const buffer = Buffer.from(JSON.stringify(jsonObj));
          this.emit("message", buffer);
        }
      }
    }

    this.buffers = [];
  }

  private findJSONObjects(input: string): object[] {
    const jsonObjects: object[] = [];
    const objectOpen = "{";
    const objectClose = "}";
    let currentObject = "";

    for (let i = 0; i < input.length; i++) {
      const char = input.charAt(i);

      if (char === objectOpen) {
        let objectCount = 1;
        currentObject = char;

        for (let j = i + 1; j < input.length; j++) {
          currentObject += input.charAt(j);
          if (input.charAt(j) === objectOpen) {
            objectCount++;
          } else if (input.charAt(j) === objectClose) {
            objectCount--;
            if (objectCount === 0) {
              try {
                const parsedObject = JSON.parse(currentObject);
                jsonObjects.push(parsedObject);
              } catch (error) {}

              i = j;
              break;
            }
          }
        }
      }
    }

    return jsonObjects;
  }

  public close(code?: number, reason?: string) {
    if (this.socket) {
      this.socket.end();
      if (code && reason) {
        this.emit("close", code || 1000, reason || "WebSocket is closed.");
      }
    } else {
      this.emit("close", 1006, "WebSocket is not connected.");
    }
  }
}
