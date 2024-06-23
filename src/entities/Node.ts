import WebSocket from "ws";
import { INodeStats, INode } from "../typings/Interfaces";
import { Manager, Rest, Track } from "../../index";
export class Node {
  public readonly manager: Manager;
  public host: string;
  public port: number;
  public identifier: string;
  public password: string;
  public connected: boolean = false;
  public destroyed: boolean = false;
  public reconnectTimeout?: NodeJS.Timeout;
  public reconnectAttempts: number = 0;
  public retryAmount: number;
  public retryDelay: number = 60000;
  public regions: String[];
  public secure: boolean;
  public sessionId: string;
  public socket: WebSocket;
  public stats?: INodeStats;
  public url: string;
  public rest: Rest;
  constructor(manager: Manager, config: INode) {
    this.manager = manager;
    this.host = config.host;
    this.port = config.port;
    this.identifier = config.identifier;
    this.password = config.password;
    this.regions = config.regions;
    this.retryDelay = config.retryDelay || 30000;
    this.retryAmount = config.retryAmount || 5;
    this.secure = config.secure;
    this.sessionId = config.sessionId;
    this.url = `${this.secure ? "https" : "http"}://${this.address}/v4/`;
    this.rest = new Rest(this);
  }
  public get address(): string {
    return `${this.host}:${this.port}`;
  }
  public connect(): void {
    let headers = {
      Authorization: this.password,
      "User-Id": this.manager.options.clientId,
      "Client-Name": this.manager.options.clientName,
    };
    this.socket = new WebSocket(
      `ws${this.secure ? "s" : ""}://${this.address}/v4/websocket`,
      { headers },
    );
    this.socket.on("open", this.open.bind(this));
    this.socket.on("close", this.close.bind(this));
    this.socket.on("message", this.message.bind(this));
    this.socket.on("error", this.error.bind(this));
  }
  public reconnect(): void {
    this.reconnectTimeout = setTimeout(() => {
      this.reconnectAttempts++;
      this.connect();
    }, this.retryDelay);

    this.manager.emit("nodeReconnect", this);
  }
  protected open(): void {
    if (this.reconnectTimeout) clearTimeout(this.reconnectTimeout);
    this.connected = true;

    this.manager.emit("nodeConnected", this);
  }
  protected close(code: number, reason: string): void {
    if (this.connected) this.connected = false;

    this.socket.removeAllListeners();
    this.socket.close();

    if (this.retryAmount > this.reconnectAttempts) {
      this.reconnect();
    } else {
      this.socket = null;
      this.destroyed = true;
    }

    this.manager.emit("nodeDisconnect", this, code, reason);
  }
  protected async message(data: Buffer): Promise<void> {
    if (Array.isArray(data)) data = Buffer.concat(data);
    else if (data instanceof ArrayBuffer) data = Buffer.from(data);

    let payload = JSON.parse(data.toString("utf8"));
    switch (payload.op) {
      case "ready":
        this.sessionId = payload.sessionId;
        break;
      case "stats":
        delete payload.op;
        this.stats = payload as INodeStats;
        break;
      case "playerUpdate":
        const player = this.manager.getPlayer(payload.guildId);
        if (!player) return;
        if (!player.current) return;
        if (player.connected !== payload.state.connected)
          player.connected = payload.state.connected;
        player.current.position = payload.state.position;
        player.current.time = payload.state.time;
        player.ping = payload.state.ping;

        this.manager.emit("playerUpdate", player, player.current, payload);
        this.manager.emit(
          "debug",
          "Moonlink.js > Player " + player.guildId + " has updated the player.",
        );
        break;
      case "event": {
        let player = this.manager.getPlayer(payload.guildId);
        if (!player) return;

        this.manager.emit("nodeRaw", this, player, payload);
        switch (payload.type) {
          case "TrackStartEvent":
            player.playing = true;
            player.paused = false;

            this.manager.emit("trackStart", player, player.current);
            this.manager.emit(
              "debug",
              "Moonlink.js > Player " +
                player.guildId +
                " has started the track.",
            );
            break;
          case "TrackEndEvent":
            player.playing = false;
            player.paused = false;

            this.manager.emit(
              "trackEnd",
              player,
              player.current,
              payload.reason,
              payload,
            );

            if (["loadFailed", "cleanup"].includes(payload.reason)) {
              if (player.queue.size) {
                player.play();
              } else {
                player.queue.clear();
              }

              this.manager.emit(
                "debug",
                "Moonlink.js > Player " +
                  player.guildId +
                  " has ended the track for reason " +
                  payload.reason +
                  ".",
              );
              return;
            }
            if (payload.reason === "replaced") {
              return;
            }
            if (player.loop === "track") {
              await this.rest.update({
                guildId: player.guildId,
                data: {
                  track: {
                    encoded: player.current.encoded,
                  },
                },
              });

              this.manager.emit(
                "debug",
                "Moonlink.js > Player " +
                  player.guildId +
                  " is looping the track.",
              );
              return;
            } else if (player.loop === "queue") {
              player.current.position = 0;
              player.current.time = 0;
              player.queue.add(player.current);
              player.play();

              this.manager.emit(
                "debug",
                "Moonlink.js > Player " +
                  player.guildId +
                  " is looping the queue.",
              );
              return;
            }
            if (player.queue.size) {
              player.play();
              return;
            }
            if (player.autoPlay && player.current.sourceName === "youtube") {
              let uri = `https://www.youtube.com/watch?v=${player.current.identifier}&list=RD${player.current.identifier}`;
              let res = await this.manager.search({
                query: uri,
              });
              if (
                !res ||
                !res.tracks ||
                ["loadFailed", "cleanup"].includes(res.loadType)
              )
                return;
              let randomTrack =
                res.tracks[Math.floor(Math.random() * res.tracks.length)];
              player.queue.add(randomTrack as Track);
              player.play();

              this.manager.emit(
                "debug",
                "Moonlink.js > Player " +
                  player.guildId +
                  " is autoplaying track " +
                  randomTrack.title,
              );
              return;
            }
            if (player.autoLeave) {
              player.destroy();

              this.manager.emit(
                "debug",
                "Moonlink.js > Player " +
                  player.guildId +
                  " has been destroyed because of autoLeave.",
              );
              return;
            }
            if (!player.queue.size) {
              player.current = null;
              player.queue.clear();

              this.manager.emit(
                "debug",
                "Moonlink.js > Player " +
                  player.guildId +
                  " has been cleared because of empty queue.",
              );
            }
            break;

          case "TrackStuckEvent": {
            this.manager.emit(
              "trackStuck",
              player,
              player.current,
              payload.thresholdMs,
            );
            this.manager.emit(
              "debug",
              "Moonlink.js > Player " +
                player.guildId +
                " has been stuck for " +
                payload.thresholdMs +
                "ms.",
            );
            break;
          }
          case "TrackExceptionEvent": {
            this.manager.emit(
              "trackException",
              player,
              player.current,
              payload.exception,
            );
            this.manager.emit(
              "debug",
              "Moonlink.js > Player " +
                player.guildId +
                " has an exception: " +
                payload.exception,
            );
            break;
          }
          case "WebSocketClosedEvent": {
            this.manager.emit(
              "socketClosed",
              player,
              payload.code,
              payload.reason,
              payload.byRemote,
            );
            this.manager.emit(
              "debug",
              "Moonlink.js > Player " +
                player.guildId +
                " has been closed with code " +
                payload.code +
                " and reason " +
                payload.reason,
            );
            break;
          }
        }

        break;
      }
    }
  }
  protected error(error: Error): void {
    this.manager.emit("nodeError", this, error);
  }
  public destroy(): void {
    this.socket.close();
    this.destroyed = true;
  }
}
