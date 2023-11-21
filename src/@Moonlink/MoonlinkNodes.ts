import { WebSocket } from "./PerforCWebsocket";
import {
  MoonlinkManager,
  Options,
  SearchResult,
  MoonlinkPlayer,
  MoonlinkDatabase,
  MoonlinkRest,
  makeRequest,
  MoonlinkTrack,
} from "../../index";

export declare interface Node {
  host: string;
  password?: string;
  port?: number;
  secure?: boolean;
  identifier?: string;
  pathVersion?: string;
}
export interface NodeStats {
  players: number;
  playingPlayers: number;
  uptime: number;
  memory: {
    reservable: number;
    used: number;
    free: number;
    allocated: number;
  };

  frameStats: {
    sent: number;
    deficit: number;
    nulled: number;
  };
  cpu: {
    cores: number;
    systemLoad: number;
    lavalinkLoad: number;
  };
}

export class MoonlinkNode {
  public manager: MoonlinkManager;
  public host: string;
  public port: number;
  public password: string | null;
  public identifier: string | null;
  public secure: boolean | null;
  public version: string | number | unknown;
  public pathVersion: string | null;
  public options: Options;
  public sPayload: Function;
  public socketUri: string | null;
  public restUri: any;
  public rest: MoonlinkRest;
  public resume: boolean | null;
  public resumed: boolean;
  public sessionId: string;
  public isConnected: boolean;
  public ws: WebSocket | null;
  public stats: NodeStats;
  public retryTime: number | null;
  public reconnectAtattempts: number | null;
  public reconnectTimeout: any;
  public resumeStatus: boolean | null;
  public resumeTimeout: number;
  public calls: number;
  public retryAmount: number | null;
  public sendWs: Function;
  private node: Node;
  private map: Map<string, any[]>;
  public db: MoonlinkDatabase;
  constructor(manager: MoonlinkManager, node: Node, map: Map<string, any[]>) {
    this.manager = manager;
    this.map = map;
    this.node = node;
    this.host = node.host;
    this.port = node.port || null;
    this.secure = node.secure || null;
    this.options = this.manager.options;
    this.identifier = node.identifier || null;
    this.password = node.password || "youshallnotpass";
    this.calls = 0;
    this.resume = manager.options.resume || null;
    this.resumeStatus = manager.options.resumeStatus || true;
    this.resumeTimeout = manager.options.resumeTimeout || 30000;
    this.retryTime = this.manager.options.retryTime || 30000;
    this.reconnectAtattempts = this.manager.options.reconnectAtattemps || 0;
    this.retryAmount = this.manager.options.retryAmount || 5;
    this.db = new MoonlinkDatabase(this.manager.clientId);
    this.rest = new MoonlinkRest(this.manager, this);
    this.stats = {
      players: 0,
      playingPlayers: 0,
      uptime: 0,
      memory: {
        free: 0,
        used: 0,
        allocated: 0,
        reservable: 0,
      },
      cpu: {
        cores: 0,
        systemLoad: 0,
        lavalinkLoad: 0,
      },
      frameStats: {
        sent: 0,
        nulled: 0,
        deficit: 0,
      },
    };
  }
  public request(endpoint: string, params: any): Promise<object> {
    this.calls++;
    return this.rest.get(`${endpoint}?${params}`);
  }
  public init(): void {
    this.manager.emit(
      "debug",
      "[ @Moonlink/Node ]: starting server connection process",
    );
    this.connect();
  }
  public async connect(): Promise<any> {
    if (typeof this.host !== "string" && typeof this.host !== "undefined")
      throw new Error(
        '[ @Moonlink/Node ]: "host" option is not configured correctly',
      );
    if (
      typeof this.password !== "string" &&
      typeof this.password !== "undefined"
    )
      throw new Error(
        '[ @Moonlink/Node ]: the option "password" is not set correctly',
      );
    if (
      (this.port && typeof this.port !== "number") ||
      this.port > 65535 ||
      this.port < 0
    )
      throw new Error(
        '[ @Moonlink/Node ]: the "port" option is not set correctly',
      );
    this.options.clientName
      ? this.options.clientName
      : (this.options.clientName = `Moonlink/${this.manager.version}`);
    this.version = "discontinued";
    this.node.pathVersion
      ? (this.pathVersion = this.node.pathVersion)
      : (this.pathVersion = "v4");
    let headers: any = {
      Authorization: this.password,
      "User-Id": this.manager.clientId,
      "Client-Name": this.options.clientName,
    };
    if (this.resume)
      headers["Session-Id"] = this.db.get("sessionId")
        ? this.db.get("sessionId")
        : null;
    this.socketUri = `ws${this.secure ? "s" : ""}://${
      this.host ? this.host : "localhost"
    }${this.port ? `:${this.port}` : ":443"}/${this.pathVersion}/websocket`;
    this.restUri = `http${this.secure ? "s" : ""}://${
      this.host ? this.host : "localhost"
    }${this.port ? `:${this.port}` : ":443"}/${this.pathVersion}/`;
    this.ws = new WebSocket(this.socketUri, {
      headers,
    });
    this.ws.on("open", this.open.bind(this));
    this.ws.on("close", this.close.bind(this));
    this.ws.on("message", this.message.bind(this));
    this.ws.on("error", this.error.bind(this));
  }
  protected async open(socket): Promise<void> {
    if (this.reconnectTimeout) clearTimeout(this.reconnectTimeout);
    this.manager.emit(
      "debug",
      '[ @Moonlink/Nodes ]: a new node said "hello world!"',
    );
    this.manager.emit("nodeCreate", this);
    this.isConnected = true;
    this.rest.url = this.restUri;
  }
  private reconnect(): void {
    if (this.reconnectAtattempts >= this.retryAmount) {
      this.manager.emit(
        "debug",
        "[ @Moonlink/Node ]: a node was destroyed due to inactivity",
      );
      this.manager.emit("nodeDestroy", this);
      this.ws.close(1000, "destroy");
      this.ws.removeAllListeners();
      this.manager.nodes.delete(this.identifier || this.host);
    } else {
      this.reconnectTimeout = setTimeout(() => {
        this.ws.removeAllListeners();
        this.ws = null;
        this.isConnected = false;
        this.manager.emit("nodeReconnect", this);
        this.connect();
        this.manager.emit(
          "debug",
          "[ @Moonlink/Node ]: Trying to reconnect node, attempted number " +
            this.reconnectAtattempts,
        );
        this.reconnectAtattempts++;
      }, this.retryTime);
    }
  }
  protected close(code: number, reason: any): void {
    if (code !== 1000 || reason !== "destroy") this.reconnect();
    this.manager.emit(
      "debug",
      "[ @Moonlink/Nodes ]: connection was disconnected from a node",
    );
    this.manager.emit("nodeClose", this, code, reason);
    this.isConnected = false;
  }
  protected async message(data: Buffer | string): Promise<void> {
    if (Array.isArray(data)) data = Buffer.concat(data);
    else if (data instanceof ArrayBuffer) data = Buffer.from(data);

    let payload = JSON.parse(data.toString("utf8"));

    if (!payload.op) return;
    this.manager.emit("nodeRaw", this, payload);
    switch (payload.op) {
      case "ready":
        this.sessionId = payload.sessionId;
        this.resume ? this.db.set("sessionId", this.sessionId) : null;

        this.resumed = payload.resumed;
        this.manager.map.set("sessionId", payload.sessionId);
        this.rest.setSessionId(this.sessionId);
        if (!this.manager.initiated && !this.resumed) {
          this.db.delete("queue");
          this.db.delete("players");
        }
        this.manager.emit(
          "debug",
          `[ @Moonlink/Node ]:${
            this.resumed ? ` session was resumed, ` : ``
          } session is currently ${this.sessionId}`,
        );
        if (this.resume && this.resumeStatus) {
          this.rest.patch(`sessions/${this.sessionId}`, {
            data: {
              resuming: this.resumeStatus,
              timeout: this.resumeTimeout,
            },
          });
          this.manager.emit(
            "debug",
            `[ @Moonlink/Node ]: Resuming configured on Lavalink`,
          );
        }
        if (this.manager.options.autoResume) {
          let obj = this.manager.map.get("players") || [];
          const players = Object.keys(obj);
          for (const player of players) {
            if (obj[player].node == this.host) {
              await this.manager.attemptConnection(obj[player].guildId);
              this.manager.emit(
                "playerResume",
                this.manager.players.get(obj[player].guildId),
              );
              this.manager.players.get(obj[player].guildId).restart();
            }
          }
        }
        if (this.resumed) {
          let players: any = await this.rest.get(
            `sessions/${this.sessionId}/players`,
          );
          for (const player of players) {
            let previousInfosPlayer =
              this.db.get(`players.${player.guildId}`) || {};
            let playerClass = this.manager.players.create({
              guildId: player.guildId,
              voiceChannel: previousInfosPlayer.voiceChannel,
              textChannel: previousInfosPlayer.textChannel,
              node: this.host,
            });
            playerClass.connect({
              setDeaf: true,
              setMute: false,
            });
            playerClass.set("playing", true);
            playerClass.set("conneted", true);
            let track = new MoonlinkTrack(player.track);
            let current: any = this.map.get("current") || {};
            current[player.guildId] = track;
            this.map.set("current", current);
          }
        }
        break;
      case "stats":
        delete payload.op;
        this.stats = { ...payload };
        break;
      case "playerUpdate":
        let current: any = this.map.get(`current`) || {};
        let player = this.manager.players.get(payload.guildId);
        const manager = this.manager;
        current[payload.guildId] = {
          ...current[payload.guildId],
          get position() {
            /* 
						 @Author: WilsontheWolf
						*/
            let player = manager.players.get(payload.guildId);
            if (player && player.paused) {
              return payload.state.position;
            }
            if (player && !player.node.isConnected) {
              return payload.state.position;
            }
            if (!player) return payload.state.position;
            return payload.state.position + (Date.now() - payload.state.time);
          },
          time: payload.state.time,
          ping: payload.state.ping,
        };
        this.map.set("current", current);
        break;
      case "event":
        this.handleEvent(payload);
        break;
      default:
        this.manager.emit(
          "nodeError",
          this,
          new Error(
            `[ @Moonlink/Nodes ]: Unexpected op "${payload.op}" with data: ${payload}`,
          ),
        );
    }
  }
  protected error(error: Error): void {
    if (!error) return;
    this.manager.emit("nodeError", this, error);
    this.manager.emit(
      "debug",
      "[ @Moonlink/Nodes ]: An error occurred in one of the lavalink(s) server connection(s)",
      error,
    );
  }
  protected async handleEvent(payload: any): Promise<any> {
    if (!payload) return;
    if (!payload.guildId) return;
    if (!this.map.get("players")[payload.guildId]) return;
    let player: MoonlinkPlayer = new MoonlinkPlayer(
      this.map.get("players")[payload.guildId],
      this.manager,
      this.map,
    );
    let players: any = this.map.get("players") || {};
    switch (payload.type) {
      case "TrackStartEvent": {
        let current: any = null;
        let currents: any = this.map.get("current") || {};
        current = currents[payload.guildId] || null;
        if (!current) return;
        players[payload.guildId] = {
          ...players[payload.guildId],
          playing: true,
          paused: false,
        };
        this.map.set("players", players);
        this.manager.emit("trackStart", player, current);
        break;
      }
      case "TrackEndEvent": {
        let currents: any = this.map.get("current") || {};
        let previousData: any = this.map.get("previous") || {};
        let track: any = currents[payload.guildId] || null;
        let queue = this.db.get(`queue.${payload.guildId}`);
        players[payload.guildId] = {
          ...players[payload.guildId],
          playing: false,
        };
        previousData[payload.guildId] = {
          ...track,
        };
        this.map.set("players", players);
        this.map.set("previous", previousData);
        if (["loadFailed", "cleanup"].includes(payload.reason)) {
          if (!queue) {
            this.db.delete(`queue.${payload.guildId}`);
            return this.manager.emit("queueEnd", player, track);
          }
          player.play();
          return;
        }
        if (payload.reason === "replaced") {
          this.manager.emit("trackEnd", player, track, payload);
          return;
        }
        if (track && player.loop) {
          if (player.loop == 1) {
            await this.rest.update({
              guildId: payload.guildId,
              data: {
                encodedTrack: track.encoded,
              },
            });
            return;
          }
          if (player.loop == 2) {
            player.queue.add(track);
            if (!queue || queue.length === 0)
              return this.manager.emit("trackEnd", player, track, payload);
            player.current = queue.shift();
            player.play();
            return;
          } else {
            this.manager.emit("trackEnd", player, track);
            this.manager.emit(
              "debug",
              "[ @Manager/Nodes ]: invalid loop value will be ignored!",
            );
          }
        }
        /* 
					@Author: PiscesXD
					Track shuffling logic
				*/
        if (player.queue.size && player.data.shuffled) {
          let currentQueue = this.db.get(`queue.${payload.guildId}`);
          const randomIndex = Math.floor(Math.random() * currentQueue.length);
          const shuffledTrack = currentQueue.splice(randomIndex, 1)[0];
          currentQueue.unshift(shuffledTrack);
          this.db.set(`queue.${payload.guildId}`, currentQueue);
          player.play();
          return;
        }

        if (player.queue.size) {
          this.manager.emit("trackEnd", player, track);
          player.play();
          return;
        }
        if (typeof player.autoPlay === "boolean" && player.autoPlay === true) {
          if (payload.reason == "stopped") return;
          let uri = `https://www.youtube.com/watch?v=${track.identifier}&list=RD${track.identifier}`;
          let req: SearchResult = await this.manager.search(uri);
          if (
            !req ||
            !req.tracks ||
            ["loadFailed", "cleanup"].includes(req.loadType)
          )
            return player.stop();
          let data: any =
            req.tracks[
              Math.floor(Math.random() * Math.floor(req.tracks.length))
            ];
          player.queue.add(data);
          player.play();
          return;
        }
        /* Logic created by PiscesXD */
        if (player.data.autoLeave) {
          player.destroy();
          this.manager.emit("autoLeaved", player, track);
        }
        if (!player.queue.size) {
          this.manager.emit("debug", "[ @Moonlink/Nodes ]: The queue is empty");
          this.manager.emit("queueEnd", player);
          currents[payload.guildId] = null;
          this.map.set("current", currents);
          this.db.delete(`queue.${payload.guildId}`);
        }
        break;
      }

      case "TrackStuckEvent": {
        let currents: any = this.map.get("current") || {};
        let track: any = currents[payload.guildId] || null;
        player.stop();
        this.manager.emit("trackStuck", player, track);
        break;
      }
      case "TrackExceptionEvent": {
        let currents: any = this.map.get("current") || {};
        let track: any = currents[payload.guildId] || null;
        player.stop();
        this.manager.emit("trackError", player, track);
        break;
      }
      case "WebSocketClosedEvent": {
        this.manager.emit("socketClosed", player, payload);
        break;
      }
      default: {
        const error = new Error(
          `[ @Moonlink/Nodes ] unknown event '${payload.type}'.`,
        );
        this.manager.emit("nodeError", this, error);
      }
    }
  }
}
