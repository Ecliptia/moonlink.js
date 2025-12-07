import { INodeStats, INode } from "../typings/Interfaces";
import {
  Manager,
  Rest,
  Structure,
  Track,
  decodeTrack,
  generateUUID,
  Player,
} from "../../index";

import WebSocket from "../services/WebSocket"
import { NodeState } from "../typings/types";
import { AbstractPlugin } from "../plugins/AbstractPlugin";

export class Node {
  public readonly manager: Manager;
  public readonly uuid: string;
  public host: string;
  public port: number;
  public identifier: string;
  public password: string;
  public pathVersion: string;
  public connected: boolean = false;
  public destroyed: boolean = false;
  public reconnectTimeout?: NodeJS.Timeout;
  public reconnectAttempts: number = 0;
  public retryAmount: number;
  public retryDelay: number = 60000;
  public resumed: boolean = false;
  public resumeTimeout: number = 60000;
  public regions: string[];
  public secure: boolean;
  public sessionId: string;
  public priority?: number;
  public socket: WebSocket;
  public stats?: INodeStats;
  public info?: any;
  public version?: string;
  public url: string;
  public rest: Rest;
  public state: NodeState = NodeState.DISCONNECTED;
  public capabilities: Set<string> = new Set();
  public plugins: Map<string, AbstractPlugin> = new Map();

  constructor(manager: Manager, config: INode) {
    this.setState = this.setState.bind(this);
    this.manager = manager;
    this.uuid = generateUUID(config.host, config.port);
    this.host = config.host;
    this.port = config.port;
    this.identifier = config.identifier;
    this.password = config.password || "youshallnotpass";
    this.regions = config.regions;
    this.pathVersion = config.pathVersion || "v4";
    this.retryDelay = config.retryDelay || 30000;
    this.retryAmount = config.retryAmount || 5;
    this.secure = config.secure;
    this.sessionId = config.sessionId;
    this.url = `${this.secure ? "https" : "http"}://${this.address}/${this.pathVersion}/`;
    this.rest = new Rest(this);

    this.manager.emit(
      "debug",
      `Moonlink.js > Node > Constructor > New node initialized: ${this.identifier} (${this.host}:${this.port}) UUID: ${this.uuid}`
    );
  }

  public get address(): string {
    return `${this.host}:${this.port}`;
  }

  public setState(state: NodeState): void {
    const oldState = this.state;
    this.state = state;
    this.manager.emit("nodeStateChange", this, oldState, state);
  }

  public async connect(): Promise<void> {
    this.setState(NodeState.CONNECTING);
    this.manager.emit(
      "debug",
      `Moonlink.js > Node > Connect > Attempting connection to ${this.identifier} (${this.host}:${this.port}) UUID: ${this.uuid}`
    );

    let sessionId = await this.manager.database.get(`nodes.${this.uuid}.sessionId`);
    let headers = {
      Authorization: this.password,
      "User-Id": this.manager.options.clientId,
      "Client-Name": this.manager.options.clientName,
    };
    if (this.manager.options.resume && sessionId) {
      headers["Session-Id"] = sessionId;
      this.manager.emit(
        "debug",
        `Moonlink.js > Node > Connect > Using resume session ID: ${sessionId} for ${this.identifier}`
      );
    }
    this.socket = new WebSocket(
      `ws${this.secure ? "s" : ""}://${this.address}/${this.pathVersion}/websocket`,
      {
        headers,
      }
    );
    this.socket.once("open", this.open.bind(this));
    this.socket.once("close", this.close.bind(this));
    this.socket.on("message", this.message.bind(this));
    this.socket.on("error", this.error.bind(this));
    this.socket.on("debug", (message) => this.manager.emit("debug", `Moonlink.js > Node (${this.identifier}) > ${message}`));
    this.socket.on("warn", (message) => this.manager.emit("debug", `[WARN] Moonlink.js > Node (${this.identifier}) > ${message}`));

    this.manager.emit(
      "debug",
      `Moonlink.js > Node (${this.identifier ? this.identifier : this.address
      }) is ready for attempting to connect.`
    );
    this.manager.emit("nodeCreate", this);

    this.manager.emit(
      "debug",
      `Moonlink.js > Node > Connect > WebSocket handlers attached to ${this.identifier}`
    );
  }

  public reconnect(): void {
    this.setState(NodeState.CONNECTING);
    const delay = Math.min(this.retryDelay * Math.pow(1.5, this.reconnectAttempts), 300000);

    this.manager.emit(
      "debug",
      `Moonlink.js > Node (${this.identifier}) attempting to reconnect in ${delay / 1000}s (Attempt ${this.reconnectAttempts + 1}/${this.retryAmount})`
    );

    this.reconnectTimeout = setTimeout(() => {
      this.reconnectAttempts++;
      this.connect();
    }, delay);

    if (this.getPlayersCount > 0) {
      this.getPlayers().forEach(player => {
        player.playing = false;
        player.connected = false;
      });
    }

    if (this.getPlayersCount > 0 && this.manager.options.movePlayersOnReconnect) {
      let node = this.manager.nodes.sortByUsage(this.manager.options.sortTypeNode || "players");
      if (!node) {
        this.manager.emit("debug", "Moonlink.js > Node > Wait node is avaliable.");
      } else {
        this.manager.emit(
          "debug",
          "Moonlink.js > Node > Moving " +
          this.getPlayersCount +
          "players from node " +
          this.uuid +
          " to node " +
          node.uuid +
          "."
        );
        this.getPlayers().forEach(player => {
          player.transferNode(node);
        });
      }
    }

    this.manager.emit(
      "debug",
      `Moonlink.js > Node (${this.identifier ? this.identifier : this.address
      }) is attempting to reconnect.`
    );
    this.manager.emit("nodeReconnect", this);
  }

  protected open(): void {
    if (this.reconnectTimeout) clearTimeout(this.reconnectTimeout);
    this.connected = true;
    this.setState(NodeState.CONNECTED);

    this.manager.emit(
      "debug",
      `Moonlink.js > Node (${this.identifier ? this.identifier : this.address}) has connected.`
    );
    this.manager.emit("nodeConnected", this);
    if (this.info && this.info.plugins) {
      this.manager.pluginManager.loadPluginsForNode(this, this.info.plugins);
    }
  }

  protected close(event: { code: number, reason: string }): void {
    this.manager.pluginManager.unloadPluginsForNode(this);
    const { code, reason } = event;
    if (this.connected) this.connected = false;

    if (this.socket) {
      this.socket.close();
    }

    if (this.retryAmount > this.reconnectAttempts) {
      this.reconnect();
    } else {
      if (this.getPlayersCount > 0) {
        this.manager.emit(
          "debug",
          `Moonlink.js > Node (${this.identifier}) exhausted reconnect attempts. Migrating ${this.getPlayersCount} players.`
        );
        this.migrateAllPlayers();
      }
      this.socket = null;
      this.destroyed = true;
      this.setState(NodeState.DESTROYED);
    }
    this.manager.emit(
      "debug",
      `Moonlink.js > Node (${this.identifier ? this.identifier : this.address
      }) has disconnected with code ${code} and reason ${reason}.`
    );

    this.setState(NodeState.DISCONNECTED);
    this.manager.emit("nodeDisconnect", this, code, reason);
  }

  protected async message({ data }): Promise<void> {
    let payload;
    try {
      payload = JSON.parse(data);
    } catch (e) {
      this.manager.emit("debug", `Moonlink.js > Node (${this.identifier}) received a malformed payload.`, data, e);
      return;
    }
    this.manager.emit("nodeRaw", this, payload)
    switch (payload.op) {
      case "ready":
        this.sessionId = payload.sessionId;
        this.info = await this.rest.getInfo();
        this.version = this.info.version;
        this.resumed = payload.resumed;
        await this.manager.database.set(`nodes.${this.uuid}`, { sessionId: this.sessionId });
        this.manager.pluginManager.updateNodePlugins(this);

        if (this.manager.options.resume) {
          this.rest.patch(`sessions/${this.sessionId}`, {
            resuming: this.manager.options.resume,
            timeout: this.resumeTimeout,
          });
          this.manager.emit("debug", "Moonlink.js > Node > Resuming node " + this.uuid + ".");
          this.setState(NodeState.RESUMING);
        }
        this.manager.emit(
          "debug",
          `Moonlink.js > Node (${this.identifier ? this.identifier : this.address}) has been ready.`
        );
        this.setState(NodeState.READY);
        this.manager.emit("nodeReady", this, payload);

        if (this.getPlayersCount > 0 && this.manager.options.autoResume) {
          this.manager.emit(
            "debug",
            "Moonlink.js > Node > Auto-resuming " +
            this.getPlayersCount +
            " players from node " +
            this.uuid +
            "."
          );

          const playersToResume = this.getPlayers();
          for (const player of playersToResume) {
            player.isResuming = true;
            await player.restart();
          }

          this.manager.emit(
            "debug",
            "Moonlink.js > Node > Auto-resumed " +
            playersToResume.length +
            " players from node " +
            this.uuid +
            "."
          );
          this.manager.emit("nodeAutoResumed", this, playersToResume);
        }

        if (this.manager.options.resume && this.resumed) {
          const players: any = await this.rest.getPlayers(this.sessionId);
          if (!players || players?.length === 0) {
            this.manager.emit("debug", `Moonlink.js > Node > No players to resume on node ${this.uuid}.`);
            return;
          }

          for (const playerInfo of players) {
            const guildId = playerInfo.guildId;
            const storage: any = await this.manager.database.get(`players.${guildId}`);
            const queue: any = await this.manager.database.get(`queues.${guildId}`);
            const current = storage?.current;

            if (!storage) {
              this.manager.emit("debug", `Moonlink.js > Node > No stored data found for player ${guildId}, skipping resume.`);
              continue;
            }

            this.manager.emit("debug", `Moonlink.js > Node > Attempting to resume player ${guildId} on node ${this.uuid}.`);

            const reconstructedPlayer = this.manager.createPlayer({
              ...storage,
              node: this.identifier ?? this.uuid,
            });

            if (!reconstructedPlayer) {
              this.manager.emit("debug", `Moonlink.js > Node > Failed to create player instance for ${guildId}, skipping resume.`);
              continue;
            }

            this.manager.emit("playerResuming", reconstructedPlayer);
            reconstructedPlayer.isResuming = true;

            reconstructedPlayer.connect({
              setDeaf: false,
              setMute: false,
            });

            reconstructedPlayer.playing = playerInfo.paused === false;
            reconstructedPlayer.paused = playerInfo.paused ?? false;
            if (current) {
              reconstructedPlayer.current = new Track(decodeTrack(current.encoded));
            } else {
              reconstructedPlayer.playing = false
              reconstructedPlayer.paused = true
              this.manager.emit("debug", `Moonlink.js > Node > No current track found for player ${guildId}.`);
            }


            if (queue?.tracks) {
              const tracks = queue.tracks.map((track: string) => new Track(decodeTrack(track)));

              await this.manager.database.remove(`queues.${guildId}`);

              for (const track of tracks) {
                reconstructedPlayer.queue.add(track);
              }
              reconstructedPlayer.queue.removeBlacklistedTracks();
            }

            this.manager.emit(
              "debug",
              `Moonlink.js > Player ${guildId} has been resumed on node ${this.uuid}.`
            );
            this.manager.emit("playerResumed", reconstructedPlayer);
          }
        }
        break;
      case "stats":
        delete payload.op;
        this.stats = payload as INodeStats;
        break;
      case "playerUpdate":
        const player = this.manager.getPlayer(payload.guildId);
        if (!player) return;
        if (!player.current) return;
        player.connected = payload.state.connected;
        player.paused = payload.state.paused ?? false;
        player.playing = player.connected && !player.paused && player.current !== null;
        if (payload.state.position > 0 || player.current.position === 0) {
          player.current.position = payload.state.position;
          player.saveCurrentPosition(payload.state.position);
        }
        player.current.time = payload.state.time;
        player.ping = payload.state.ping;

        this.manager.emit("playerUpdate", player, player.current, payload);

        if (player.playing) {
          player.scheduleHealthCheck();
        }

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
        const sponsorBlockPlugin = this.plugins.get("sponsorblock-plugin");
        if (sponsorBlockPlugin && (sponsorBlockPlugin as any).handleEvent) {
          (sponsorBlockPlugin as any).handleEvent(this, payload);
        }

        const lavaLyricsPlugin = this.plugins.get("lavalyrics-plugin");
        if (lavaLyricsPlugin && (lavaLyricsPlugin as any).handleEvent) {
          (lavaLyricsPlugin as any).handleEvent(this, payload);
        }

        let player = this.manager.getPlayer(payload.guildId);
        if (!player) return;

        switch (payload.type) {
          case "TrackStartEvent":
            player.playing = true;
            player.paused = false;
            player.current.position = payload.track.info?.position || 0;

            this.manager.clearLyricsCacheForGuild(player.guildId);

            this.manager.emit("trackStart", player, player.current);
            this.manager.emit(
              "debug",
              "Moonlink.js > Player " +
              player.guildId +
              " has started the track: " +
              player.current.title
            );

            if (player.get("attemptingToReconnect")) {
              player.set("attemptingToReconnect", 0);
              this.manager.emit(
                "debug",
                "Moonlink.js > Player " +
                player.guildId +
                " has successfully reconnected to the node " +
                this.uuid +
                "."
              );
            }
            player.isResuming = false;
            break;
          case "TrackEndEvent":
            if (!player.current) {
              this.manager.emit(
                "debug",
                "Moonlink.js > Player " +
                player.guildId +
                " has ended the track for reason " +
                payload.reason +
                ". But the current track is null."
              );
            }
            let track: Track = new (Structure.get("Track"))(
              { ...payload.track },
              player.current?.requestedBy
            );
            player.playing = false;
            player.paused = false;
            player.clearHealthCheck();
            player.set("sendPlayerUpdateDebug", false);
            if (!player.get("isBackPlay")) {
              player.previous.push(track);
              if (player.previous.length > player.historySize) {
                player.previous.shift();
              }
            }
            player.set("isBackPlay", false);

            const lyricsPlugin = this.plugins.get("lyrics");
            if (lyricsPlugin && (lyricsPlugin as any).onTrackEnd) {
              (lyricsPlugin as any).onTrackEnd(player);
            }

            this.manager.emit("trackEnd", player, player.current, payload.reason, payload);

            if (player.destroyed) {
              this.manager.emit(
                "debug",
                "Moonlink.js > Player " +
                player.guildId +
                " has been destroyed. No need to process the end of the track."
              );
              return;
            }

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
              if (player.loopCount !== undefined && player.loopCount > 0) {
                player.loopCount--;
                if (player.loopCount === 0) {
                  player.setLoop("off");
                }
              }
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
              if (player.loopCount !== undefined && player.loopCount > 0) {
                player.loopCount--;
                if (player.loopCount === 0) {
                  player.setLoop("off");
                }
              }
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
            if (player.autoPlay) {
              const autoplayed = await this._handleAutoplay(player, payload.reason);
              if (autoplayed) {
                return;
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
            if (player.isResuming) {
              this.manager.emit("debug", `Ignoring WebSocketClosedEvent for player ${player.guildId} because it is resuming.`);
              break;
            }
            this.manager.emit(
              "socketClosed",
              player,
              payload.code,
              payload.reason,
              payload.byRemote
            );
            this.manager.emit(
              "debug",
              `Player ${player.guildId} voice websocket closed with code ${payload.code}.`
            );

            const fatalCodes = [4004, 4021, 4022];
            const clientErrorCodes = [4001, 4002, 4003, 4005, 4012, 4016, 4020];

            if (fatalCodes.includes(payload.code) || clientErrorCodes.includes(payload.code)) {
              this.manager.emit("debug", `Received fatal/unrecoverable close code ${payload.code}. Destroying player.`);
              player.destroy();
              break;
            }

            if (player.playing) {
              const maxRetries = 5;
              const currentRetries = (player.get("attemptingToReconnect") ?? 0) as number;

              if (currentRetries < maxRetries) {
                player.set("attemptingToReconnect", currentRetries + 1);
                this.manager.emit("playerReconnect", player, "voiceSocketClosed");

                setTimeout(() => player.restart(), 2500);
              } else {
                this.manager.emit("debug", `Player ${player.guildId} exceeded reconnect attempts. Destroying player.`);
                player.destroy();
              }
            }
            break;
          }
        }

        break;
      }
    }
  }

  private async _handleAutoplay(player: Player, reason: string): Promise<boolean> {
    let uri: string | undefined;
    let prefix: string | undefined;

    if (!player.current?.sourceName || !player.current.identifier) {
      this.manager.emit(
        "debug",
        `Moonlink.js > Player ${player.guildId} is autoplay failed: no current track, sourceName or identifier`
      );
      return false;
    }

    const source = player.current.sourceName.toLowerCase();
    const identifier = player.current.identifier;

    if (source === "youtube") {
      uri = `https://www.youtube.com/watch?v=${identifier}&list=RD${identifier}`;
      prefix = "youtube";
    } else if (this.plugins.has("lavasrc-plugin")) {
      switch (source) {
        case "spotify":
          uri = `seed_tracks=${identifier}`;
          prefix = "sprec";
          break;
        case "deezer":
          uri = `${identifier}`;
          prefix = "dzrec";
          break;
        case "yandexmusic":
          uri = `${identifier}`;
          prefix = "ymrec";
          break;
        case "vkmusic":
          uri = `${identifier}`;
          prefix = "vkrec";
          break;
        case "tidal":
          uri = `${identifier}`;
          prefix = "tdrec";
          break;
        case "qobuz":
          uri = `${identifier}`;
          prefix = "qbrec";
          break;
      }
    }

    if (!uri) {
      this.manager.emit(
        "debug",
        `Moonlink.js > Player ${player.guildId} is autoplay failed: no valid URI for source ${player.current.sourceName}`
      );
      return false;
    }

    if (reason === "stopped") {
      this.manager.emit(
        "debug",
        `Moonlink.js > Player ${player.guildId} is autoplay payload reason stopped`
      );
      return false;
    }

    const res = await this.manager.search({ query: uri, source: prefix });

    if (!res || !res.tracks || res.tracks.length === 0 || ["loadFailed", "cleanup"].includes(res.loadType)) {
      this.manager.emit(
        "debug",
        `Moonlink.js > Player ${player.guildId} is autoplay payload is error loadType`
      );
      return false;
    }

    const randomTrack = res.tracks[Math.floor(Math.random() * res.tracks.length)];
    if (randomTrack) {
      player.queue.add(randomTrack as Track);
      player.play();
      this.manager.emit(
        "debug",
        `Moonlink.js > Player ${player.guildId} is autoplaying track ${randomTrack.title}`
      );
      return true;
    } else {
      this.manager.emit(
        "debug",
        `Moonlink.js > Player ${player.guildId} is autoplay failed: no random track found`
      );
      return false;
    }
  }

  protected error({ error }): void {
    this.manager.emit("nodeError", this, error);
  }

  public destroy(): void {
    if(this.socket) {
      this.socket.close();
    }
    this.destroyed = true;
  }

  public getSystemStats(): { cpuLoad: number; memoryUsage: number } {
    if (!this.stats) return { cpuLoad: 0, memoryUsage: 0 };
    return {
      cpuLoad: this.stats.cpu ? this.stats.cpu.systemLoad : 0,
      memoryUsage: this.stats.memory ? this.stats.memory.used : 0
    };
  }

  public isOverloaded(cpuThreshold: number = 80, memoryThreshold: number = 80): boolean {
    const stats = this.getSystemStats();
    return stats.cpuLoad > cpuThreshold || stats.memoryUsage > memoryThreshold;
  }

  public async migrateAllPlayers(targetNode?: Node): Promise<void> {
    if (!this.getPlayersCount) return;

    const destination = targetNode || this.manager.nodes.sortByUsage(this.manager.options.sortTypeNode || "players")[0];
    if (!destination) {
      this.manager.emit('debug', 'Moonlink.js > Node > No nodes available for migration');
      return;
    }

    for (const player of this.getPlayers()) {
      try {
        await player.transferNode(destination);
        this.manager.emit(
          'debug',
          `Moonlink.js > Node > Player ${player.guildId} successfully migrated to ${destination.identifier}`
        );
      } catch (error) {
        this.manager.emit(
          'debug',
          `Moonlink.js > Node > Error migrating player ${player.guildId}: ${error}`
        );
      }
    }
  }

  public getPlayers() {
    return this.manager.players.all.filter(player => player.node.uuid === this.uuid);
  }

  public get getPlayersCount() {
    return this.getPlayers().length;
  }

  public async getNodeStatus(timeout: number = 2000): Promise<{
    identifier: string;
    connected: boolean;
    version?: string;
    stats: {
      cpu: number;
      memory: number;
      uptime: number;
    };
    players: {
      total: number;
      active: number;
      paused: number;
      idle: number;
    };
    health: {
      status: 'overloaded' | 'stable';
      needsRestart: boolean;
      responding: boolean;
      performance: 'excellent' | 'good' | 'poor';
    };
  }> {
    const players = this.getPlayers();
    const { cpuLoad, memoryUsage } = this.stats?.cpu ? {
      cpuLoad: this.stats.cpu.systemLoad,
      memoryUsage: this.stats.memory.used
    } : { cpuLoad: 0, memoryUsage: 0 };

    const isNodeOverloaded = cpuLoad > 80 || memoryUsage > 80;
    const needsRestart = isNodeOverloaded || this.reconnectAttempts > 3;

    let responding = false;
    let performance: 'excellent' | 'good' | 'poor' = 'poor';

    try {
      const start = Date.now();
      await Promise.race([
        this.rest.getVersion(),
        new Promise((_, reject) => setTimeout(() => reject(new Error("Timeout")), timeout))
      ]);
      responding = true;
      const responseTime = Date.now() - start;
      performance = responseTime < 100 ? 'excellent' : responseTime < 200 ? 'good' : 'poor';
    } catch {
      responding = false;
      performance = 'poor';
    }

    return {
      identifier: this.identifier,
      connected: this.connected,
      version: this.version,
      stats: {
        cpu: cpuLoad,
        memory: memoryUsage,
        uptime: this.stats?.uptime || 0,
      },
      players: {
        total: this.getPlayersCount,
        active: players.filter(p => p.playing).length,
        paused: players.filter(p => p.paused).length,
        idle: players.filter(p => !p.playing && !p.paused).length
      },
      health: {
        status: isNodeOverloaded ? 'overloaded' : 'stable',
        needsRestart: needsRestart,
        responding: responding,
        performance: performance
      }
    };
  }
}