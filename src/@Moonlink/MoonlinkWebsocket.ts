import * as tls from 'tls';
import * as net from 'net';
import * as https from 'https';
import * as http from 'http';
import { URL } from 'url';
import { EventEmitter } from 'events';

interface WebSocketOptions {
  timeout?: number;
  headers?: Record<string, string>;
  secure?: boolean;
  host?: string;
  port?: number;
  keyGenerator?: () => string;
}

export class MoonlinkWebsocket extends EventEmitter {
  public options: WebSocketOptions;
  public socket: any = null;
  public agent: any;
  public url: any;

  constructor(url: string, options: WebSocketOptions = {}) {
    super();
    this.url = new URL(url);
    this.options = {
      timeout: 1000,
      headers: {},
      keyGenerator: () => this.generateWebSocketKey(),
      ...options,
    };
    this.agent = this.options.secure ? https : http;
  }

  public connect(): void {
    const requestOptions: any = {
      hostname: this.options.host,
      port: this.options.port,
      method: 'GET',
      timeout: this.options.timeout || 5000,
      headers: {
        'Sec-WebSocket-Key': this.options.keyGenerator(),
        'Sec-WebSocket-Version': 13,
        'Upgrade': 'websocket',
        'Connection': 'Upgrade',
        ...(this.options.headers || {}),
      },
    };
    this.options.secure ? requestOptions.protocol = 'https:' : requestOptions.protocol = 'http:';
		
    this.socket = this.agent.request(requestOptions);

    this.socket.on('error', (err) => {
      this.emit('error', err);
    });

    this.socket.on('upgrade', (res, socket, head) => {
      if (res.statusCode !== 101) {
        this.emit('error', new Error(`[ @Moonlink/Websocket ]: ${res.statusCode} ${res.statusMessage}`));
        return;
      }

      socket.on('data', (data) => {
        const frameHeader = this.parseFrameHeader(data);
        const payload = data.subarray(frameHeader.payloadStartIndex);
        this.emit('message', payload.toString());
      });

      socket.on('error', (err) => {
        console.error('WebSocket error:', err);
        this.emit('error', err);
      });

      this.emit('open', socket);
    });

    this.socket.on('socket', (req) => {
      req.on('close', () => this.emit('close'));
      req.on('end', () => this.emit('end'));
      req.on('timeout', () => this.emit('timeout'));

      req.on(this.options.secure ? 'secureConnect' : 'connect', () => {
        const headers = [
          `GET ${this.url.pathname}${this.url.search} HTTP/1.1`,
          `Host: ${this.options.host}`,
          'Upgrade: websocket',
          'Connection: Upgrade',
          `Sec-WebSocket-Key: ${this.options.keyGenerator()}`,
          'Sec-WebSocket-Version: 13',
        ];

        if (this.options.headers) {
          Object.keys(this.options.headers).forEach((key) => {
            headers.push(`${key}: ${this.options.headers[key]}`);
          });
        }
        req.write(headers.join('\r\n') + '\r\n\r\n');
      });
    });
  }

  public send(data: string) {
    if (this.socket) {
      this.socket.write(data);
    } else {
      console.error('WebSocket is not connected for sending.');
      this.emit('error', new Error('WebSocket is not connected for sending.'));
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
      console.error('WebSocket is not connected to close.');
      this.emit('error', new Error('WebSocket is not connected to close.'));
    }
  }

private parseFrameHeader(data: Buffer) {
  if (data.length < 2) {
    throw new Error('WebSocket frame header is too short.');
  }

  const isFinalFrame = (data[0] & 0x80) !== 0;
  const opcode = data[0] & 0x0F;
  const isMasked = (data[1] & 0x80) !== 0;
  let payloadStartIndex = 2;
  let payloadLength = data[1] & 0x7F;

  if (payloadLength === 126) {
    if (data.length < 4) {
      throw new Error('WebSocket frame header is too short for extended payload length.');
    }
    payloadLength = data.readUInt16BE(2);
    payloadStartIndex = 4;
  } else if (payloadLength === 127) {
    if (data.length < 10) {
      throw new Error('WebSocket frame header is too short for extended payload length.');
    }
    const upperPart = data.readUInt32BE(6);
    const lowerPart = data.readUInt32BE(2);
    payloadLength = upperPart * Math.pow(2, 32) + lowerPart;
    payloadStartIndex = 10;
  }

  let mask: any | null = null;
  if (isMasked) {
    if (data.length < payloadStartIndex + 4) {
      throw new Error('WebSocket frame header is too short for masking key.');
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

  private generateWebSocketKey(): string {
    const keyBytes = [];
    for (let i = 0; i < 16; i++) {
      keyBytes.push(Math.floor(Math.random() * 256));
    }
    return Buffer.from(keyBytes).toString('base64');
  }

  private createWebSocketCloseFrame(code: number, reason: string): Buffer {
    const buffer = Buffer.alloc(6);
    buffer.writeUInt16BE(code, 0);
    buffer.write(reason, 2, 'utf8');
    return buffer;
  }

  public isOpen(): boolean {
    return this.socket ? !this.socket.destroyed : false;
  }

  public getRemoteAddress(): string | null {
    return this.socket ? this.socket.remoteAddress : null;
  }

  public getRemotePort(): number | null {
    return this.socket ? this.socket.remotePort : null;
  }

  public upgradeConnection(newSocket: tls.TLSSocket | net.Socket) {
    if (this.socket) {
      this.socket.end();
    }

    this.socket = newSocket;

    this.socket.on('data', (data: Buffer) => {
      this.handleWebSocketData(data);
    });

    this.socket.on('close', (code: number, reason: string) => {
      this.emit('close', code, reason);
    });

    this.socket.on('error', (error: Error) => {
      this.emit('error', error);
    });
  }

private handleWebSocketData(data: Buffer) {
  const frames = this.decodeWebSocketFrames(data);
  if (frames) {
    frames.forEach((frame) => {
      const frameString = frame.toString();
      const jsons = this.extractJSONs(frameString);
      jsons.forEach((data) => {
          this.emit('message', data);
      });
    });
  }
}

private extractJSONs(frameString: string): string[] {
  const jsons = [];
  let startIndex = 0;

  while (startIndex < frameString.length) {
    const start = frameString.indexOf('{', startIndex);
    const end = frameString.indexOf('}', start + 1);

    if (start !== -1 && end !== -1) {
      jsons.push(frameString.substring(start, end + 1));
      startIndex = end + 1;
    } else {
      break;
    }
  }

  return jsons;
}

	
private bufferedData: Buffer = Buffer.from([]);

private applyMask(data: Buffer, mask: number[]): Buffer {
  const unmaskedData = Buffer.alloc(data.length);
  for (let i = 0; i < data.length; i++) {
    unmaskedData[i] = data[i] ^ mask[i % 4];
  }
  return unmaskedData;
}

private decodeWebSocketFrames(data: Buffer): string[] | null {
  const frames: string[] = [];
  let currentFrameStart = 0;

  for (let i = 0; i < data.length; i++) {
    if (data[i] === 0x81) {
      if (i > currentFrameStart) {
        const frameData = data.slice(currentFrameStart, i);
        const frameHeader = this.parseFrameHeader(frameData);
        if (!frameHeader.isMasked) {
          throw new Error('Received unmasked frame.');
        }
        const unmaskedPayload = this.applyMask(frameData.slice(frameHeader.payloadStartIndex), frameHeader.mask!);
        frames.push(unmaskedPayload.toString('utf-8'));
      }
      currentFrameStart = i + 1;
    }
  }

  if (currentFrameStart < data.length) {
    const remainingData = data.slice(currentFrameStart);
    const frameHeader = this.parseFrameHeader(remainingData);
    if (!frameHeader.isMasked) {
      throw new Error('Received unmasked frame.');
    }
    const unmaskedPayload = this.applyMask(remainingData.slice(frameHeader.payloadStartIndex), frameHeader.mask!);
    frames.push(unmaskedPayload.toString('utf-8'));
  }

  return frames.length > 0 ? frames : null;
}
}
