import { Socket } from "net";
import { EventEmitter } from "events";
import http, { RequestOptions as HttpRequestOptions } from "http";
import https, { RequestOptions as HttpsRequestOptions } from "https";
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
  public socket: Socket | null = null;
  public url: URL;
  public connectionCount = 0;
  private buffers: string[] = [];

  constructor(url: string, options: WebSocketOptions = {}) {
    super();
    this.url = new URL(url);
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
      hostname: this.options.host,
      port: this.options.port,
      headers: this.buildHeaders(),
      method: "GET",
      path: "/v4/websocket",
    };

    return this.options.secure
      ? requestOptions
      : { ...requestOptions, protocol: "http:" };
  }

  private buildHeaders(): Record<string, string> {
    const headers: Record<string, string> = { ...this.options.headers };

    headers["Host"] = this.url.host;
    headers["Upgrade"] = "websocket";
    headers["Connection"] = "Upgrade";
    headers["Sec-WebSocket-Key"] = this.generateWebSocketKey();
    headers["Sec-WebSocket-Version"] = "13";

    return headers;
  }

  public connect(): void {
    const requestOptions = this.buildRequestOptions();
    const req = this.options.secure
      ? https.request(requestOptions)
      : http.request(requestOptions);

    req.on("upgrade", (res, socket) => {
      this.handleWebSocketConnection(socket);
    });

    req.end();
  }

  private handleWebSocketConnection(socket: Socket): void {
    this.socket = socket;

    this.socket.on("connect", () => {
      this.emit("open");
    });

    this.socket.on("data", (data) => {
      this.handleWebSocketData(data);
    });

    this.socket.on("close", () => {
      this.emit("close");
    });

    this.socket.on("error", (error) => {
      this.emit("error", error);
    });

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

  private generateWebSocketKey(): string {
    const keyBytes = new Array(16);
    for (let i = 0; i < 16; i++) {
      keyBytes[i] = Math.floor(Math.random() * 256);
    }
    const key = Buffer.from(keyBytes).toString("base64");
    return key;
  }

  public close(code: number, reason: string): void {
    if (this.socket) {
      const closeFrame = this.generateCloseFrame(code, reason);
      this.socket.write(closeFrame);
    }
  }

  private generateCloseFrame(code: number, reason: string): Buffer {
    const codeBuffer = Buffer.allocUnsafe(2);
    codeBuffer.writeUInt16BE(code, 0);

    let reasonBuffer = Buffer.from(reason, "utf8");
    if (reasonBuffer.length > 123) {
      reasonBuffer = reasonBuffer.slice(0, 123);
    }

    const frameBuffer = Buffer.allocUnsafe(2 + reasonBuffer.length);

    codeBuffer.copy(frameBuffer, 0);
    reasonBuffer.copy(frameBuffer, 2);

    frameBuffer[0] = 0x88;

    return frameBuffer;
  }
}
