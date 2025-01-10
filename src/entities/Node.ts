import { INodeStats, INode } from "../typings/Interfaces";
import {
  Manager,
  Player,
  Rest,
  Structure,
  Track,
  decodeTrack,
  generateShortUUID,
} from "../../index";
export class Node {
  public readonly manager: Manager;
  public readonly uuid: string;
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
  public info?: any;
  public version?: string;
  public url: string;
  public rest: Rest;
  constructor(manager: Manager, config: INode) {
    this.manager = manager;
    this.uuid = generateShortUUID(config.host, config.port);
    this.host = config.host;
    this.port = config.port;
    this.identifier = config.identifier;
    this.password = config.password || "youshallnotpass";
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
    this.socket = new WebSocket(`ws${this.secure ? "s" : ""}://${this.address}/v4/websocket`, {
      headers,
    });
    this.socket.addEventListener("open", this.open.bind(this), { once: true });
    this.socket.addEventListener("close", this.close.bind(this), { once: true });
    this.socket.addEventListener("message", this.message.bind(this));
    this.socket.addEventListener("error", this.error.bind(this));

    this.manager.emit(
      "debug",
      `Moonlink.js > Node (${
        this.identifier ? this.identifier : this.address
      }) is ready for attempting to connect.`
    );
    this.manager.emit("nodeCreate", this);
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

    this.manager.emit(
      "debug",
      `Moonlink.js > Node (${this.identifier ? this.identifier : this.address}) has connected.`
    );
    this.manager.emit("nodeConnected", this);
  }
  protected close({ code, reason }): void {
    if (this.connected) this.connected = false;

    this.socket.close();

    if (this.retryAmount > this.reconnectAttempts) {
      this.reconnect();
    } else {
      this.socket = null;
      this.destroyed = true;
    }
    this.manager.emit(
      "debug",
      `Moonlink.js > Node (${
        this.identifier ? this.identifier : this.address
      }) has disconnected with code ${code} and reason ${reason}.`
    );
    this.manager.emit("nodeDisconnect", this, code, reason);
  }
  protected async message({ data }): Promise<void> {
    let payload = JSON.parse(data);
    switch (payload.op) {
      case "ready":
        this.sessionId = payload.sessionId;
        this.info = await this.rest.getInfo();
        this.version = this.info.version;

        this.manager.emit(
          "debug",
          `Moonlink.js > Node (${this.identifier ? this.identifier : this.address}) has been ready.`
        );
        this.manager.emit("nodeReady", this, payload);
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

        if (!player.get("sendPlayerUpdateDebug")) {
          this.manager.emit(
            "debug",
            "Moonlink.js > Player " +
              player.guildId +
              " has been updated with position " +
              payload.state.position +
              " and time " +
              payload.state.time +
              " and ping " +
              payload.state.ping +
              "ms."
          );
          player.set("sendPlayerUpdateDebug", true);
        }
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
                " has started the track: " +
                player.current.title
            );
            break;
          case "TrackEndEvent":
            if (!player.current)
              this.manager.emit(
                "debug",
                "Moonlink.js > Player " +
                  player.guildId +
                  " has ended the track for reason " +
                  payload.reason +
                  ". But the current track is null. " +
                  player.current?.encoded
              );
            let track: Track = new (Structure.get("Track"))(
              { ...payload.track },
              player.current.requestedBy
            );
            player.playing = false;
            player.paused = false;
            player.set("sendPlayerUpdateDebug", false);
            this.manager.options.previousInArray
              ? (player.previous as Track[]).push(track)
              : (player.previous = track);

            this.manager.emit("trackEnd", player, player.current, payload.reason, payload);

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
                  "."
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
                "Moonlink.js > Player " + player.guildId + " is looping the track."
              );
              return;
            } else if (player.loop === "queue") {
              player.current.position = 0;
              player.current.time = 0;
              player.queue.add(player.current);
              player.play();

              this.manager.emit(
                "debug",
                "Moonlink.js > Player " + player.guildId + " is looping the queue."
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
              if (payload.reason === "stopped") {
                this.manager.emit(
                  "debug",
                  "Moonlink.js > Player " + player.guildId + " is autoplay payload reason stopped "
                );
              } else if (!res || !res.tracks || ["loadFailed", "cleanup"].includes(res.loadType)) {
                this.manager.emit(
                  "debug",
                  "Moonlink.js > Player " +
                    player.guildId +
                    " is autoplay payload is error loadType "
                );
              } else {
                let randomTrack = res.tracks[Math.floor(Math.random() * res.tracks.length)];
                if (randomTrack) {
                  player.queue.add(randomTrack as Track);
                  player.play();

                  this.manager.emit(
                    "debug",
                    "Moonlink.js > Player " +
                      player.guildId +
                      " is autoplaying track " +
                      randomTrack.title
                  );
                  return;
                } else {
                  this.manager.emit(
                    "debug",
                    "Moonlink.js > Player " + player.guildId + " is autoplay failed "
                  );
                }
              }
            }
            if (player.autoLeave) {
              player.destroy();
              this.manager.emit("autoLeaved", player, player.current);

              this.manager.emit("queueEnd", player, player.current);

              this.manager.emit(
                "debug",
                "Moonlink.js > Player " +
                  player.guildId +
                  " has been destroyed because of autoLeave."
              );
              return;
            }
            if (!player.queue.size) {
              player.current = null;
              player.queue.clear();

              this.manager.emit("queueEnd", player, player.current);

              this.manager.emit(
                "debug",
                "Moonlink.js > Player " +
                  player.guildId +
                  " has been cleared because of empty queue."
              );
            }
            break;

          case "TrackStuckEvent": {
            this.manager.emit("trackStuck", player, player.current, payload.thresholdMs);
            this.manager.emit(
              "debug",
              "Moonlink.js > Player " +
                player.guildId +
                " has been stuck for " +
                payload.thresholdMs +
                "ms."
            );
            break;
          }
          case "TrackExceptionEvent": {
            this.manager.emit("trackException", player, player.current, payload.exception);
            this.manager.emit(
              "debug",
              "Moonlink.js > Player " +
                player.guildId +
                " has an exception: " +
                JSON.stringify(payload.exception)
            );
            break;
          }
          case "WebSocketClosedEvent": {
            this.manager.emit(
              "socketClosed",
              player,
              payload.code,
              payload.reason,
              payload.byRemote
            );
            this.manager.emit(
              "debug",
              "Moonlink.js > Player " +
                player.guildId +
                " has been closed with code " +
                payload.code +
                " and reason " +
                payload.reason
            );
            break;
          }
        }

        break;
      }
    }
  }
  protected error({ error }): void {
    this.manager.emit("nodeError", this, error);
  }
  public destroy(): void {
    this.socket.close();
    this.destroyed = true;
  }
  public getPlayers() {
    return this.manager.players.all.filter(player => player.node.uuid === this.uuid);
  }
  public getPlayersCount() {
    return this.getPlayers().length;
  }
}
