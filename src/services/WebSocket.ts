import { EventEmitter } from 'events';
import { randomBytes, createHash } from 'crypto';
import http from 'http';
import https from 'https';
import { URL } from 'url';

export default class WebSocket extends EventEmitter {
    private url: URL;
    private headers: Record<string, string>;
    private socket: http.ClientRequest | null = null;
    private netSocket: any;
    private connected: boolean = false;
    private buffer: Buffer = Buffer.alloc(0);
    private fragmentedPayload: Buffer[] = [];
    private fragmentedOpCode: number | null = null;
    private readonly MAX_PAYLOAD_SIZE = 16 * 1024 * 1024;

    constructor(url: string, options?: { headers?: Record<string, string> }) {
        super();
        this.url = new URL(url);
        this.headers = options?.headers || {};
        this.connect();
    }

    private connect() {
        const key = randomBytes(16).toString('base64');
        const protocol = this.url.protocol === 'wss:' ? https : http;
        const port = this.url.port || (this.url.protocol === 'wss:' ? 443 : 80);

        const baseHeaders: Record<string, string> = {
            'Connection': 'Upgrade',
            'Upgrade': 'websocket',
            'Sec-WebSocket-Version': '13',
            'Sec-WebSocket-Key': key,
        };

        const allowedExtraHeaders = ['authorization', 'user-id', 'client-name'];
        for (const [h, v] of Object.entries(this.headers)) {
            if (allowedExtraHeaders.includes(h.toLowerCase())) {
                baseHeaders[h] = v;
            }
        }

        const options = {
            port,
            host: this.url.hostname,
            headers: baseHeaders,
            path: this.url.pathname + this.url.search,
            timeout: 10000,
        };

        this.socket = protocol.request(options);

        this.socket.on('upgrade', (res, socket, head) => {
            const expectedKey = createHash('sha1')
              .update(key + '258EAFA5-E914-47DA-95CA-C5AB0DC85B11')
              .digest('base64');

            if (res.headers['sec-websocket-accept'] !== expectedKey) {
                socket.destroy();
                this.emit('error', { error: new Error('Invalid Sec-WebSocket-Accept header') });
                return;
            }

            this.netSocket = socket;
            this.connected = true;
            this.buffer = head;

            this.emit('open');

            this.netSocket.on('data', (data: Buffer) => this.handleData(data));
            this.netSocket.on('close', () => this.handleClose(1006, 'Connection closed'));
            this.netSocket.on('error', (err: Error) => this.emit('error', { error: err }));
        });

        this.socket.on('error', (err) => {
            this.emit('error', { error: err });
            if (!this.connected) {
                this.emit('close', { code: 1006, reason: err.message });
                if (this.socket) {
                    this.socket.destroy();
                    this.socket = null;
                }
            }
        });

        this.socket.on('timeout', () => {
            this.emit('error', { error: new Error("Connection timed out") });
            if (!this.connected) {
                this.emit('close', { code: 1006, reason: "Connection timed out" });
                if (this.socket) {
                    this.socket.destroy();
                    this.socket = null;
                }
            }
        });

        this.socket.end();
    }

    private handleData(data: Buffer) {
        this.buffer = Buffer.concat([this.buffer, data]);
        this.processBuffer();
    }

    private processBuffer() {
        while (this.buffer.length >= 2) {
            const firstByte = this.buffer[0];
            const secondByte = this.buffer[1];

            const fin = (firstByte & 0x80) !== 0;
            const opCode = firstByte & 0x0f;

            if ((secondByte & 0x80) !== 0) {
                this.emit('error', { error: new Error('Received a masked frame from server.') });
                this.close(1002, 'Protocol Error');
                return;
            }

            let payloadLength = secondByte & 0x7f;
            let offset = 2;

            if (payloadLength === 126) {
                if (this.buffer.length < 4) break;
                payloadLength = this.buffer.readUInt16BE(offset);
                offset += 2;
            } else if (payloadLength === 127) {
                if (this.buffer.length < 10) break;
                payloadLength = Number(this.buffer.readBigUInt64BE(offset));
                offset += 8;
            }

            if (payloadLength > this.MAX_PAYLOAD_SIZE) {
                this.emit('error', { error: new Error(`Payload too large: ${payloadLength}`) });
                this.close(1009, 'Message too big');
                return;
            }

            if (this.buffer.length < offset + payloadLength) {
                break;
            }

            const payload = this.buffer.slice(offset, offset + payloadLength);
            this.buffer = this.buffer.slice(offset + payloadLength);

            this.handleFrame(opCode, payload, fin);
        }
    }

    private handleFrame(opCode: number, payload: Buffer, fin: boolean) {
        if (opCode > 0xA) {
            this.close(1002, 'Unknown opcode');
            return;
        }

        switch (opCode) {
            case 0x0:
                if (this.fragmentedOpCode === null) {
                    this.close(1002, 'Unexpected continuation frame');
                    return;
                }
                this.fragmentedPayload.push(payload);
                if (fin) {
                    const fullPayload = Buffer.concat(this.fragmentedPayload);
                    this.handleFrame(this.fragmentedOpCode, fullPayload, true);
                    this.fragmentedPayload = [];
                    this.fragmentedOpCode = null;
                }
                break;

            case 0x1:
            case 0x2:
                if (this.fragmentedOpCode !== null) {
                    this.close(1002, 'New data frame before finishing fragmented one');
                    return;
                }
                if (!fin) {
                    this.fragmentedOpCode = opCode;
                    this.fragmentedPayload.push(payload);
                } else {
                    this.emit('message', { data: opCode === 0x1 ? payload.toString('utf8') : payload });
                }
                break;

            case 0x8:
                const code = payload.length >= 2 ? payload.readUInt16BE(0) : 1005;
                const reason = payload.length > 2 ? payload.slice(2).toString('utf8') : '';
                if (this.connected) this.sendFrame(payload, 0x8);
                this.handleClose(code, reason);
                break;

            case 0x9:
                this.sendFrame(payload, 0xA);
                break;

            case 0xA:
                this.emit('pong');
                break;
        }
    }

    private handleClose(code: number, reason: string) {
        if (!this.connected) return;
        this.connected = false;
        if (this.netSocket) {
            this.netSocket.destroy();
            this.netSocket = null;
        }
        if (this.socket) {
            this.socket.destroy();
            this.socket = null;
        }
        this.emit('close', { code, reason });
    }

    public send(data: string | Buffer, cb?: (err?: Error) => void) {
        const buffer = Buffer.isBuffer(data) ? data : Buffer.from(data, 'utf8');
        const opCode = Buffer.isBuffer(data) ? 0x2 : 0x1;
        this.sendFrame(buffer, opCode, cb);
    }

    private sendFrame(payload: Buffer, opCode: number, cb?: (err?: Error) => void) {
        if (!this.connected) {
            const err = new Error('Not connected');
            if (cb) cb(err);
            else this.emit('error', { error: err });
            return;
        }

        const payloadLength = payload.length;
        let headerLength = 2 + 4;
        if (payloadLength > 65535) {
            headerLength += 8;
        } else if (payloadLength > 125) {
            headerLength += 2;
        }

        const header = Buffer.alloc(headerLength);
        header[0] = 0x80 | opCode;

        if (payloadLength > 65535) {
            header[1] = 0x80 | 127;
            header.writeBigUInt64BE(BigInt(payloadLength), 2);
        } else if (payloadLength > 125) {
            header[1] = 0x80 | 126;
            header.writeUInt16BE(payloadLength, 2);
        } else {
            header[1] = 0x80 | payloadLength;
        }

        const mask = randomBytes(4);
        mask.copy(header, headerLength - 4);

        const maskedPayload = Buffer.alloc(payloadLength);
        for (let i = 0; i < payloadLength; i++) {
            maskedPayload[i] = payload[i] ^ mask[i % 4];
        }

        this.netSocket.write(Buffer.concat([header, maskedPayload]), cb);
    }

    public close(code: number = 1000, reason: string = '') {
        if (!this.connected) {
            this.handleClose(code, reason);
            return;
        }
        const reasonBuffer = Buffer.from(reason, 'utf8');
        const payload = Buffer.alloc(2 + reasonBuffer.length);
        payload.writeUInt16BE(code, 0);
        reasonBuffer.copy(payload, 2);
        this.sendFrame(payload, 0x8, () => {
            if (this.netSocket) this.netSocket.end();
        });
    }

    public addEventListener(event: string, listener: (...args: any[]) => void, options?: { once?: boolean }) {
        if (options?.once) {
            this.once(event, listener);
        } else {
            this.on(event, listener);
        }
    }
}
