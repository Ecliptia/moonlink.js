import { IManagerNodeConfig, INodeStats } from "../typings/Interfaces";
import type { Manager } from "../core/Manager";
import { Rest } from "./Rest";
import {
  Structure,
  generateUUID,
  stringifyWithReplacer,
  decodeTrack,
} from "../Util";
import { WebSocket } from "../services/WebSocket";
import { NodeState, VoiceState } from "../typings/types";
import { Track } from "./Track";

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
  private lastStats?: { players: number; playingPlayers: number };
  public state: NodeState = NodeState.DISCONNECTED;
  public capabilities: Set<string> = new Set();

  constructor(manager: Manager, config: IManagerNodeConfig) {
    this.manager = manager;
    this.uuid = generateUUID(config.host, config.port);
    this.host = config.host;
    this.port = config.port;
    this.identifier = config.identifier ?? this.uuid;
    this.password = config.password || "youshallnotpass";
    this.regions = config.regions;
    this.pathVersion = config.pathVersion || "v4";
    this.retryDelay = config.retryDelay || 30000;
    this.retryAmount = config.retryAmount || 5;
    this.secure = config.secure;
    this.resumeTimeout = this.manager.options.resumeTimeout ?? 60000;
    this.url = `${this.secure ? "https" : "http"}://${
      this.address
    }/${this.pathVersion}/`;
    this.rest = new (Structure.get("Rest"))(this);

    this.manager.emit(
      "debug",
      `Moonlink.js > Node >> New node initialized. Identifier: ${this.identifier} (${this.host}:${this.port}), UUID: ${this.uuid}`
    );
  }

  public get latency(): number {
    if (!this.socket) return -1;
    return this.socket.latency;
  }

  public getPenalties(): number {
    if (!this.stats) return 0;
    const cpuLoad = this.stats.cpu.systemLoad;
    const players = this.stats.playingPlayers;
    
    return players + (cpuLoad * 100);
  }

  public ping(): Promise<number> {
    if (!this.connected) {
      return Promise.reject(new Error("Node is not connected."));
    }
    return this.socket.ping();
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
      `Moonlink.js > Node -> Attempting connection to ${this.identifier} (${this.host}:${this.port}).`
    );

    const nodeData = await this.manager.database.get<{ sessionId: string }>(
      `nodes.${this.uuid}`
    );
    const sessionId = nodeData?.sessionId;

    let headers: Record<string, string> = {
      Authorization: this.password,
      "User-Id": this.manager.clientId,
      "Client-Name": this.manager.options.clientName || "Moonlink.js",
    };
    
    if (this.manager.options.resume && sessionId) {
      headers["Session-Id"] = sessionId;
      this.manager.emit(
        "debug",
        `Moonlink.js > Node > Connect > Using resume session ID: ${sessionId} for ${this.identifier}`
      );
    }

    this.manager.emit(
      "debug",
      `Moonlink.js > Node >> WebSocket headers for ${
        this.identifier
      }: ${stringifyWithReplacer(headers)}.`
    );

    this.socket = new (Structure.get("WebSocket"))(
      `ws${this.secure ? "s" : ""}://${
        this.address
      }/${this.pathVersion}/websocket`,
      {
        headers,
      }
    );
    this.socket.on("open", this.open.bind(this));
    this.socket.on("close", this.close.bind(this));
    this.socket.on("message", this.message.bind(this));
    this.socket.on("error", this.error.bind(this));
    this.socket.on("pong", (latency) => {
        this.manager.emit("debug", `Moonlink.js > Node >> Received pong from ${this.identifier}. Latency: ${latency}ms.`);
    });
  }

  public reconnect(): void {
    this.setState(NodeState.CONNECTING);
    
    let delay = Math.min(
      this.retryDelay * Math.pow(1.5, this.reconnectAttempts),
      300000
    );

    if (this.reconnectAttempts === 0) {
        delay = Math.min(this.retryDelay, 1000);
    }
    
    this.manager.emit("nodeReconnecting", this, this.reconnectAttempts + 1);
    this.manager.emit(
      "debug",
      `Moonlink.js > Node >> Reconnecting to ${this.identifier} in ${
        delay / 1000
      }s (Attempt ${this.reconnectAttempts + 1}/${this.retryAmount}).`
    );

    this.reconnectTimeout = setTimeout(() => {
      this.reconnectAttempts++;
      this.connect();
    }, delay);
  }

  protected async open(): Promise<void> {
    if (this.reconnectTimeout) clearTimeout(this.reconnectTimeout);
    this.reconnectAttempts = 0;
    this.connected = true;
    this.setState(NodeState.CONNECTED);
    this.manager.emit(
      "debug",
      `Moonlink.js > Node <- Connected to ${this.identifier}.`
    );

    try {
      const nodeInfo = await this.rest.getInfo();
      if (nodeInfo) {
        this.info = nodeInfo;
        this.version = nodeInfo.version?.semver;

        this.capabilities.clear();
        for (const source of nodeInfo.sourceManagers)
          this.capabilities.add(`source:${source}`);
        for (const filter of nodeInfo.filters)
          this.capabilities.add(`filter:${filter}`);

        this.manager.emit(
          "debug",
          `Moonlink.js > Node >> Node ${
            this.identifier
          } capabilities updated: ${[...this.capabilities].join(", ")}`
        );
      }
    } catch (error) {
      this.manager.emit(
        "debug",
        `Moonlink.js > Node >> Failed to get node info for ${this.identifier}. Error: ${error.message}`
      );
    }

    this.manager.emit("nodeConnected", this);
  }

  protected async close(event: { code; reason: string }): Promise<void> {
    const { code, reason } = event;
    if (this.connected) this.connected = false;
    this.setState(NodeState.DISCONNECTED);
    
    this.manager.emit("debug", `Moonlink.js > Node <- Disconnected from ${this.identifier}. Code: ${code}, Reason: ${reason}.`);
    this.manager.emit("nodeDisconnect", this, code, reason);

    if (this.socket) {
      this.socket.close();
      this.socket = null;
    }

    if (this.reconnectTimeout) clearTimeout(this.reconnectTimeout);

    const orphanedPlayers = this.manager.players.filter((p) => p.node.uuid === this.uuid);
    let moved = false;

    if (orphanedPlayers.length > 0 && this.manager.options.node?.autoMovePlayers) {
        const newNode = this.manager.nodes.findNode({ exclude: [this.identifier] });
        if (newNode) {
          moved = true;
          this.manager.emit("debug", `Moonlink.js > Node >> Found a new healthy node (${newNode.identifier}). Moving ${orphanedPlayers.length} players...`);
          await Promise.all(orphanedPlayers.map(p => p.transferNode(newNode)));
          this.manager.emit("playersMoved", orphanedPlayers, this, newNode);
        } else {
          this.manager.emit("debug", `Moonlink.js > Node >> No healthy nodes available to move players.`);
        }
    }

    if (this.destroyed || this.reconnectAttempts >= this.retryAmount) {
        if (!moved && orphanedPlayers.length > 0) {
            this.manager.emit("debug", `Moonlink.js > Node >> Node disconnected permanently. Destroying ${orphanedPlayers.length} players.`);
            for (const player of orphanedPlayers) {
                await player.destroy("Node disconnected permanently");
            }
            this.manager.emit("playersOrphaned", orphanedPlayers, this);
        }

        if (this.reconnectAttempts >= this.retryAmount && !this.destroyed) {
            this.destroyed = true;
            this.setState(NodeState.DESTROYED);
            this.manager.emit("debug", `Moonlink.js > Node >> Max reconnect attempts reached for ${this.identifier}. Node destroyed.`);
            this.manager.emit("nodeDestroy", this.identifier);
        }
    } else {
        if (!moved && orphanedPlayers.length > 0) {
             this.manager.emit("debug", `Moonlink.js > Node >> Node disconnected (Code ${code}). Attempting reconnect. Keeping ${orphanedPlayers.length} players waiting for resume.`);
        }
        this.reconnect();
    }
  }

  protected async message({ data }): Promise<void> {
    let payload;
    try {
      payload = JSON.parse(data);
    } catch (e) {
      this.manager.emit(
        "debug",
        `Moonlink.js > Node <- Received malformed payload from ${this.identifier}. Data: ${data}, Error: ${e}.`
      );
      return;
    }

    this.manager.emit("nodeRaw", this, payload);

    const player = this.manager.players.get(payload.guildId);
    if (!player && payload.guildId) {
      this.manager.emit(
        "debug",
        `Moonlink.js > Node >> Payload for non-existent player. GuildId: ${payload.guildId}, OP: ${payload.op}.`
      );
      return;
    }

    let loggedByCase = false;

    switch (payload.op) {
      case "ready":
        this.manager.emit(
          "debug",
          `Moonlink.js > Node >> READY payload: ${stringifyWithReplacer(
            payload
          )}`
        );

        this.sessionId = payload.sessionId;
        this.resumed = payload.resumed;
        this.setState(NodeState.READY);

        await this.manager.database.set(`nodes.${this.uuid}`, {
          sessionId: this.sessionId,
        });

        if (this.manager.options.resume) {
          await this.rest.updateSession(
            this.manager.options.resume,
            this.resumeTimeout / 1000
          );
          this.manager.emit(
            "debug",
            `Moonlink.js > Node > Resuming node ${this.uuid}.`
          );
        }

        this.manager.emit("nodeReady", this, payload);

        if (this.manager.options.resume) {
          if (this.resumed) {
            this.manager.emit("nodeResume", this);
            this._resumePlayers();
          } else {
            this.manager.emit("debug", `Moonlink.js > Node >> Session not resumed for node ${this.identifier}. Attempting disaster recovery...`);
            const playersOnNode = this.manager.players.filter(p => p.node.uuid === this.uuid);
            for (const player of playersOnNode) {
              this.manager.emit("playerRecoveryStarted", player);
              player.restart().then(success => {
                if (success) {
                  this.manager.emit("playerRecoverySuccess", player);
                } else {
                  this.manager.emit("playerRecoveryFailed", player);
                }
              }).catch(() => {
                this.manager.emit("playerRecoveryFailed", player);
              });
            }
          }
        }

        loggedByCase = true;
        break;
      case "stats":
        delete payload.op;
        this.stats = payload as INodeStats;
        if (
          !this.lastStats ||
          this.stats.players !== this.lastStats.players ||
          this.stats.playingPlayers !== this.lastStats.playingPlayers
        ) {
          this.lastStats = {
            players: this.stats.players,
            playingPlayers: this.stats.playingPlayers,
          };
          this.manager.emit(
            "debug",
            `Moonlink.js > Node <- Node ${
              this.identifier
            } STATS updated. Stats: ${stringifyWithReplacer(this.stats)}.`
          );
        }
        loggedByCase = true;
        break;
      case "playerUpdate":
        if (!player) {
          loggedByCase = true;
          break;
        }
        const currentState = payload.state;

        player.connected = currentState.connected;
        player.ping = currentState.ping;

        if (player.current) {
          player.current.position = currentState.position;
          player.current.time = currentState.time;
          player.updateData("current.position", currentState.position);
        }

        let logMessage = `Moonlink.js > Node#handleMessage >> Player ${
          player.guildId
        } state updated. CurrentState: ${stringifyWithReplacer(
          currentState
        )}.`;
        let shouldLog = false;

        const lastState = player.get<{
          connected: boolean;
          position: number;
          ping: number;
          time: number;
        }>("lastState");
        if (!lastState) {
          shouldLog = true;
          logMessage += ` Initial state: ${stringifyWithReplacer(
            currentState
          )} (skipping all normal logs).`;
        } else {
          if (currentState.connected !== lastState.connected) {
            shouldLog = true;
            logMessage += ` Connection status changed from ${lastState.connected} to ${currentState.connected}.`;
          }

          if (currentState.ping !== -1) {
            if (currentState.ping > 1000 && currentState.ping !== lastState.ping) {
              shouldLog = true;
              logMessage += ` High ping detected: ${currentState.ping}ms.`;
            } else if (
              lastState.ping &&
              lastState.ping !== -1 &&
              Math.abs(currentState.ping - lastState.ping) > 500
            ) {
              shouldLog = true;
              logMessage += ` Significant ping change: ${lastState.ping}ms -> ${currentState.ping}ms.`;
            }
          }

          if (player.playing && player.current) {
            if (currentState.position === 0 && lastState.position !== 0) {
              shouldLog = true;
              logMessage += ` Position reset to 0 while playing.`;
            } else if (
              currentState.position === lastState.position &&
              currentState.position !== 0
            ) {
              shouldLog = true;
              logMessage += ` Position stuck at ${currentState.position}ms while playing.`;
            }
          }
        }

        if (shouldLog) {
          this.manager.emit("debug", logMessage);
        }
        loggedByCase = true;
        player.set("lastState", {
          connected: currentState.connected,
          position: currentState.position,
          ping: currentState.ping,
          time: currentState.time,
        });

        player.voice.check(currentState.connected);
        break;
      case "event":
        if (!player) {
          loggedByCase = true;
          break;
        }
        this.manager.emit(
          "debug",
          `Moonlink.js > Node <- Player ${
            player.guildId
          } received event. Type: ${
            payload.type
          }, Payload: ${stringifyWithReplacer(payload)}.`
        );
        this.handleEvent(player, payload);
        loggedByCase = true;
        break;
      default:
        if (!loggedByCase) {
          this.manager.emit(
            "debug",
            `Moonlink.js > Node <- Received unhandled payload from ${this.identifier}. OP: ${payload.op}, Data: ${stringifyWithReplacer(payload)}.`
          );
        }
        loggedByCase = true;
        break;
    }
   }

  protected handleEvent(player: any, payload: any): void {
    switch (payload.type) {
        case "TrackStartEvent":
            this.handleTrackStart(player, payload);
            break;
        case "TrackEndEvent":
            this.handleTrackEnd(player, payload);
            break;
        case "TrackStuckEvent":
            this.handleTrackStuck(player, payload);
            break;
        case "TrackExceptionEvent":
            this.handleTrackException(player, payload);
            break;
        case "WebSocketClosedEvent":
            this.handleWebSocketClosed(player, payload);
            break;
    }
  }

  private async handleTrackStart(player: any, payload: any): Promise<void> {
    this.manager.emit("debug", `Moonlink.js > Node#handleTrackStart >> Track started for player ${player.guildId}: "${payload.track.info.title}". Track: ${stringifyWithReplacer(payload.track)}.`);
    
    player.playing = true;
    player.paused = false;
    
    if (player.current) {
        player.current.position = 0;
    }
    
    const reconnectAttempts = player.get("reconnectAttempts");
    if (reconnectAttempts && reconnectAttempts > 0) {
        this.manager.emit("debug", `Moonlink.js > Node#handleTrackStart >> Player ${player.guildId} successfully recovered after ${reconnectAttempts} reconnect attempts.`);
        player.set("reconnectAttempts", 0);
    }

    this.manager.emit("debug", `Moonlink.js > Node#handleTrackStart >> Resetting player state (stuckCount, exceptionCount, isResuming) for player ${player.guildId}.`);
    player.set("stuckCount", 0);
    player.set("exceptionCount", 0);
    player.isResuming = false;
    
    const trackData = payload.track;
    if (player.current && (!trackData.userData || Object.keys(trackData.userData).length === 0)) {
        trackData.userData = player.current.userData;
    }

    const trackForEvent = new (Structure.get("Track"))(trackData, player.current?.requester);
    this.manager.emit("trackStart", player, trackForEvent);
  }

  private async handleTrackEnd(player: any, payload: any): Promise<void> {
    const { reason } = payload;
    if (reason === "replaced") {
      return;
    }
    const trackData = payload.track;
    if (player.current && (!trackData.userData || Object.keys(trackData.userData).length === 0)) {
        trackData.userData = player.current.userData;
    }
    const trackForEvent = new (Structure.get("Track"))(trackData, player.current?.requester);

    if (reason !== "replaced") {
      player.playing = false;
      player.paused = false;
    }

    player.set("isBackPlay", false);
    
    this.manager.emit("trackEnd", player, trackForEvent, reason, payload);

    if (player.destroyed) {
      this.manager.emit("debug", `Moonlink.js > Node#handleTrackEnd >> Player ${player.guildId} is destroyed, skipping end handling.`);
      return;
    }

    if (reason === "loadFailed") {
        const trackHandling = this.manager.options.trackHandling;
        const trackToRetry = player.current;

        if (trackHandling?.retryFailedTracks && trackToRetry) {
            const maxRetries = trackHandling.maxRetryAttempts ?? 3;
            if (trackToRetry.retries < maxRetries) {
                trackToRetry.retries++;
                this.manager.emit("debug", `Moonlink.js > Node#handleTrackEnd >> Track failed to load. Retrying... (Attempt ${trackToRetry.retries}/${maxRetries}) for player ${player.guildId}.`);
                player.queue.unshift(trackToRetry);
                await player.play();
                return;
            }
             this.manager.emit("debug", `Moonlink.js > Node#handleTrackEnd >> Track failed to load after ${maxRetries} attempts for player ${player.guildId}.`);
        }
    }

    if (reason === "stopped") {
      this.manager.emit("debug", `Moonlink.js > Node#handleTrackEnd >> Track was ${reason}, skipping queue logic for player ${player.guildId}.`);
      return;
    }

    if (player.loop === "track" && player.current) {
      this.manager.emit("debug", `Moonlink.js > Node#handleTrackEnd >> Player ${player.guildId} is in track loop mode. Replaying track: ${player.current.title}.`);
      await this.rest.updatePlayer(player.guildId, {
        track: { encoded: player.current.encoded },
        position: 0,
      });
      return;
    }

    if (player.loop === "queue" && player.current) {
      this.manager.emit("debug", `Moonlink.js > Node#handleTrackEnd >> Player ${player.guildId} is in queue loop mode. Adding current track to the end of the queue: ${player.current.title}.`);
      player.current.position = 0;
      player.queue.add(player.current);
      this.manager.emit("debug", `Moonlink.js > Node#handleTrackEnd << Queue size is now ${player.queue.size}.`);
    }
    
    if (player.queue.size > 0) {
      this.manager.emit("debug", `Moonlink.js > Node#handleTrackEnd -> Playing next track from queue for player ${player.guildId} (${player.queue.size} tracks remaining).`);
      await player.play();
      return;
    }

    this.manager.emit("debug", `Moonlink.js > Node#handleTrackEnd >> Queue is empty for player ${player.guildId}. Proceeding to autoplay check.`);
    if (player.autoPlay) {
        this.manager.emit("debug", `Moonlink.js > Node#handleTrackEnd -> Attempting autoPlay for player ${player.guildId}. Previous track: ${trackForEvent.title}.`);
        const autoplayed = await this.handleAutoPlay(player, trackForEvent);
        
        if (autoplayed) {
            this.manager.emit("debug", `Moonlink.js > Node#handleTrackEnd << AutoPlay was successful for player ${player.guildId}.`);
            return;
        }
        
        this.manager.emit("debug", `Moonlink.js > Node#handleTrackEnd >> AutoPlay failed for player ${player.guildId}.`);
    }

    await this.handleQueueEnd(player, trackForEvent);
  }

  private async handleTrackStuck(player: any, payload: any): Promise<void> {
    const track = player.current;
    const thresholdMs = payload.thresholdMs;
    
    this.manager.emit("debug", `Moonlink.js > Node#handleTrackStuck >> Track stuck for player ${player.guildId}: "${track?.title}". Threshold: ${thresholdMs}ms. Payload: ${stringifyWithReplacer(payload)}.`);

    this.manager.emit("trackStuck", player, track, thresholdMs, payload);

    if (track && track.duration === -1) {
        this.manager.emit("debug", `Moonlink.js > Node#handleTrackStuck >> Track has -1 duration (stream?), skipping auto-recovery to prevent loops for player ${player.guildId}.`);
        return;
    }

    if (this.manager.options.trackHandling?.skipStuckTracks) {
        this.manager.emit("debug", `Moonlink.js > Node#handleTrackStuck >> 'skipStuckTracks' is true, skipping track for player ${player.guildId}.`);
        await player.skip();
        return;
    }

    const stuckCount = (player.get("stuckCount") || 0) + 1;
    player.set("stuckCount", stuckCount);

    if (stuckCount >= 3) {
        this.manager.emit("debug", `Moonlink.js > Node#handleTrackStuck >> Track stuck ${stuckCount} times for player ${player.guildId}, skipping track.`);
        player.set("stuckCount", 0);
        
        if (player.queue.size > 0) {
            this.manager.emit("debug", `Moonlink.js > Node#handleTrackStuck -> Skipping to next track for player ${player.guildId}.`);
            await player.skip();
        } else {
            this.manager.emit("debug", `Moonlink.js > Node#handleTrackStuck -> No tracks in queue, stopping player ${player.guildId}.`);
            await player.stop();
            this.manager.emit("queueEnd", player, track);
        }
    } else {
        this.manager.emit("debug", `Moonlink.js > Node#handleTrackStuck -> Attempting to restart playback for player ${player.guildId} (attempt ${stuckCount}/3).`);
        
        try {
            const currentPosition = player.current?.position || 0;
            this.manager.emit("debug", `Moonlink.js > Node#handleTrackStuck -> Seeking player ${player.guildId} to position ${currentPosition + 1000}ms.`);
            await player.seek(currentPosition + 1000);
            this.manager.emit("debug", `Moonlink.js > Node#handleTrackStuck >> Seeked forward 1s for player ${player.guildId}.`);
        } catch (error) {
            this.manager.emit("debug", `Moonlink.js > Node#handleTrackStuck >> Failed to seek, attempting full restart for player ${player.guildId}. Error: ${error.message}.`);
            await player.restart();
        }
    }
  }

  private async handleTrackException(player: any, payload: any): Promise<void> {
    const track = player.current;
    const exception = payload.exception;
    
    this.manager.emit("debug", `Moonlink.js > Node#handleTrackException >> Track exception for player ${player.guildId}: "${track?.title}". Severity: ${exception.severity}. Message: ${exception.message}. Payload: ${stringifyWithReplacer(payload)}.`);
    this.manager.emit("trackException", player, track, exception, payload);

    if (this.manager.options.trackHandling?.autoSkipOnError) {
        this.manager.emit("debug", `Moonlink.js > Node#handleTrackException >> 'autoSkipOnError' is true, skipping track for player ${player.guildId}.`);
        await player.skip();
        return;
    }

    const exceptionCount = (player.get("exceptionCount") || 0) + 1;
    player.set("exceptionCount", exceptionCount);

    if (exception.severity === "fault") {
        this.manager.emit("debug", `Moonlink.js > Node#handleTrackException >> Fatal exception detected for player ${player.guildId}, skipping track.`);
        
        if (player.queue.size > 0) {
            await player.skip();
        } else {
            await player.stop();
            this.manager.emit("queueEnd", player, track);
        }
        player.set("exceptionCount", 0);
    } else if (exception.severity === "suspicious" && exceptionCount >= 2) {
        this.manager.emit("debug", `Moonlink.js > Node#handleTrackException >> Suspicious exception repeated ${exceptionCount} times for player ${player.guildId}, skipping track.`);
        player.set("exceptionCount", 0);
        
        if (player.queue.size > 0) {
            await player.skip();
        } else {
            await player.stop();
            this.manager.emit("queueEnd", player, track);
        }
    } else if (exceptionCount >= 3) {
        this.manager.emit("debug", `Moonlink.js > Node#handleTrackException >> Track threw ${exceptionCount} exceptions for player ${player.guildId}, skipping track.`);
        player.set("exceptionCount", 0);
        
        if (player.queue.size > 0) {
            await player.skip();
        } else {
            await player.stop();
            this.manager.emit("queueEnd", player, track);
        }
    } else {
        this.manager.emit("debug", `Moonlink.js > Node#handleTrackException -> Exception count: ${exceptionCount}/3 for player ${player.guildId}, continuing playback.`);
    }
  }

  private async handleWebSocketClosed(player: any, payload: any): Promise<void> {
    const { code, reason, byRemote } = payload;
    
    if (player.destroyed) return;

    this.manager.emit("debug", `Moonlink.js > Node#handleWebSocketClosed >> WebSocket closed for player ${player.guildId}. Code: ${code}, Reason: "${reason}", By Remote: ${byRemote}. Payload: ${stringifyWithReplacer(payload)}.`);

    if (player.voice.isMoving && code === 4014) {
        this.manager.emit("debug", `Moonlink.js > Node#handleWebSocketClosed >> Ignoring WebSocket close (4014) for player ${player.guildId} due to channel move.`);
        return;
    }
    
    if (player.isResuming) {
        this.manager.emit("debug", `Moonlink.js > Node#handleWebSocketClosed >> Player ${player.guildId} is resuming, ignoring WebSocket close event.`);
        return;
    }

    const fatalCodes = [4004, 4014, 4015];
    if (fatalCodes.includes(code)) {
        this.manager.emit("debug", `Moonlink.js > Node#handleWebSocketClosed >> Fatal close code ${code} for player ${player.guildId}, destroying player.`);
        this.manager.emit("socketClosed", player, code, reason, byRemote, payload);
        await player.destroy(`WebSocket closed with fatal code: ${code}`);
        return;
    }

    const voiceOptions = this.manager.options.voiceConnection;
    if (!voiceOptions?.autoReconnect) {
        this.manager.emit("debug", `Moonlink.js > Node#handleWebSocketClosed >> Auto-reconnect is disabled for player ${player.guildId}.`);
        await player.destroy("Auto-reconnect disabled");
        return;
    }

    const reconnectAttempts = (player.get("wsReconnectAttempts") || 0) + 1;
    const maxReconnectAttempts = voiceOptions.maxReconnectAttempts ?? 5;

    if (reconnectAttempts > maxReconnectAttempts) {
        this.manager.emit("debug", `Moonlink.js > Node#handleWebSocketClosed >> Max reconnect attempts reached (${maxReconnectAttempts}) for player ${player.guildId}.`);
        this.manager.emit("socketClosed", player, code, reason, byRemote, payload);
        await player.destroy("Max reconnect attempts reached");
        return;
    }

    player.set("wsReconnectAttempts", reconnectAttempts);
    this.manager.emit("debug", `Moonlink.js > Node#handleWebSocketClosed -> Attempting reconnect ${reconnectAttempts}/${maxReconnectAttempts} for player ${player.guildId}.`);

    const reconnectDelay = voiceOptions.reconnectDelay ?? 5000;
    this.manager.emit("debug", `Moonlink.js > Node#handleWebSocketClosed -> Reconnect scheduled in ${reconnectDelay}ms for player ${player.guildId}.`);

    setTimeout(async () => {
        if (player.destroyed) {
            this.manager.emit("debug", `Moonlink.js > Node#handleWebSocketClosed >> Player ${player.guildId} was destroyed during reconnect delay.`);
            return;
        }

        try {
            this.manager.emit("debug", `Moonlink.js > Node#handleWebSocketClosed -> Step 1: Reconnecting voice for player ${player.guildId}.`);
            player.connect();
            
            const timeout = voiceOptions.timeout ?? 15000;
            await new Promise(resolve => setTimeout(resolve, timeout));

            this.manager.emit("debug", `Moonlink.js > Node#handleWebSocketClosed >> Voice reconnected for player ${player.guildId}. Lavalink should resume playback automatically if applicable.`);
            player.set("wsReconnectAttempts", 0);
        } catch (error) {
            this.manager.emit("debug", `Moonlink.js > Node#handleWebSocketClosed >> Reconnect attempt ${reconnectAttempts} failed for player ${player.guildId}. Error: ${error.message}.`);
            
            if (reconnectAttempts >= maxReconnectAttempts) {
                this.manager.emit("debug", `Moonlink.js > Node#handleWebSocketClosed >> All reconnect attempts exhausted for player ${player.guildId}.`);
                this.manager.emit("socketClosed", player, code, reason, byRemote, payload);
                await player.destroy("All reconnect attempts exhausted");
            }
        }
    }, reconnectDelay);
  }

  public async handleAutoPlay(player: any, previousTrack: any): Promise<boolean> {
    if (!previousTrack?.sourceName || !previousTrack.identifier) {
        this.manager.emit("debug", `Moonlink.js > Node#handleAutoPlay >> No source or identifier for autoPlay in player ${player.guildId}. PreviousTrack: ${stringifyWithReplacer(previousTrack)}.`);
        return false;
    }

    const source = previousTrack.sourceName.toLowerCase() as string;
    const identifier = previousTrack.identifier;
    
    let uri: string | undefined;
    let searchSource: string | undefined;

    switch (source) {
        case "youtube":
            uri = `https://www.youtube.com/watch?v=${identifier}&list=RD${identifier}`;
            searchSource = "youtube";
            this.manager.emit("debug", `Moonlink.js > Node#handleAutoPlay -> Using YouTube Mix for autoPlay in player ${player.guildId}. URI: ${uri}.`);
            break;

        case "spotify":
            if (this.capabilities.has("search:sprec")) {
                uri = `seed_tracks=${identifier}`;
                searchSource = "sprec";
                this.manager.emit("debug", `Moonlink.js > Node#handleAutoPlay -> Using Spotify recommendations for autoPlay in player ${player.guildId}. URI: ${uri}.`);
            }
            break;

        case "deezer":
            if (this.capabilities.has("search:dzrec")) {
                uri = identifier;
                searchSource = "dzrec";
                this.manager.emit("debug", `Moonlink.js > Node#handleAutoPlay -> Using Deezer recommendations for autoPlay in player ${player.guildId}. URI: ${uri}.`);
            }
            break;

        case "soundcloud":
            uri = `${previousTrack.author}`;
            searchSource = "soundcloud";
            this.manager.emit("debug", `Moonlink.js > Node#handleAutoPlay -> Using SoundCloud artist search for autoPlay in player ${player.guildId}. URI: ${uri}.`);
            break;

        case "applemusic":
            if (this.capabilities.has("search:amrec")) {
                uri = identifier;
                searchSource = "amrec";
                this.manager.emit("debug", `Moonlink.js > Node#handleAutoPlay -> Using Apple Music recommendations for autoPlay in player ${player.guildId}. URI: ${uri}.`);
            }
            break;
    }

    if (!uri || !searchSource) {
        this.manager.emit("debug", `Moonlink.js > Node#handleAutoPlay >> No valid autoPlay source found for ${source} in player ${player.guildId}.`);
        if (source !== "youtube") {
            this.manager.emit("debug", `Moonlink.js > Node#handleAutoPlay >> Falling back to YouTube Mix for autoPlay in player ${player.guildId}.`);
            const res = await this.manager.search({
              query: `${previousTrack.title} ${previousTrack.author}`,
            })

            if (res && res.tracks && res.tracks.length > 0) {
                const suposteousTrack = res.tracks[0];
                uri = `https://www.youtube.com/watch?v=${res.tracks[0].identifier}&list=RD${res.tracks[0].identifier}`;
                searchSource = "youtube";
                this.manager.emit("debug", `Moonlink.js > Node#handleAutoPlay -> YouTube Mix URI for autoPlay in player ${player.guildId}: ${uri}.`);
            } else {
                this.manager.emit("debug", `Moonlink.js > Node#handleAutoPlay >> YouTube Mix fallback failed for autoPlay in player ${player.guildId}.`);
                return false;
            }
        }
    }

    if (!uri || !searchSource) {
        this.manager.emit("debug", `Moonlink.js > Node#handleAutoPlay >> Unable to determine URI or search source for autoPlay in player ${player.guildId}.`);
        return false;
    }

    try {
        const res = await this.manager.search({
            query: uri,
            source: searchSource,
            requester: previousTrack.requester,
        });

        if (!res || !res.tracks || res.tracks.length === 0 || res.loadType === "error") {
            this.manager.emit("debug", `Moonlink.js > Node#handleAutoPlay >> No tracks found for autoPlay in player ${player.guildId}. LoadType: ${res?.loadType}.`);
            return false;
        }

        const filteredTracks = res.tracks.slice(0, 10);
        const randomTrack = filteredTracks[Math.floor(Math.random() * filteredTracks.length)];
        
        if (randomTrack) {
            player.queue.add(randomTrack);
            this.manager.emit("debug", `Moonlink.js > Node#handleAutoPlay >> AutoPlay track added for player ${player.guildId}: "${randomTrack.title}" by ${randomTrack.author}. Track: ${stringifyWithReplacer(randomTrack)}.`);
            
            await player.play();
            this.manager.emit("autoPlayed", player, randomTrack, previousTrack);
            return true;
        }
    } catch (error) {
        this.manager.emit("debug", `Moonlink.js > Node#handleAutoPlay >> AutoPlay error for player ${player.guildId}. Error: ${error.message}.`);
    }

    return false;
  }

  private async handleQueueEnd(player: any, lastTrack: any): Promise<void> {
    this.manager.emit("debug", `Moonlink.js > Node#handleQueueEnd >> Queue ended for player ${player.guildId}. LastTrack: ${lastTrack?.title || "None"}.`);
    
    player.current = null;
    player.playing = false;
    player.paused = false;
    this.manager.emit("debug", `Moonlink.js > Node#handleQueueEnd >> Player state updated: current=${player.current}, playing=${player.playing}, paused=${player.paused} for player ${player.guildId}.`);
    
    this.manager.emit("queueEnd", player, lastTrack);

    if (player.autoLeave) {
        this.manager.emit("debug", `Moonlink.js > Node#handleQueueEnd -> AutoLeave enabled, destroying player ${player.guildId}.`);
        this.manager.emit("autoLeaved", player, lastTrack);
        await player.destroy("AutoLeave enabled");
    }
  }

  protected error({ error }): void {
    this.manager.emit("debug", `Moonlink.js > Node !> Error on node ${this.identifier}. Error: ${error.message}.`);
    this.manager.emit("nodeError", this, error);
  }

  public async destroy(): Promise<void> {
    this.destroyed = true;
    this.setState(NodeState.DESTROYED);
    if(this.socket) {
      this.socket.close();
    }
    this.manager.emit("nodeDestroy", this.identifier);
    this.manager.emit("debug", `Moonlink.js > Node >> Node ${this.identifier} destroyed.`);
  }
  private async _resumePlayers(): Promise<void> {
    const players = await this.rest.getPlayers();
    if (!players || players?.length === 0) {
      this.manager.emit(
        "debug",
            `Moonlink.js > Node > No players to resume on node ${this.uuid}.`
          );
          return;
        }
    
        for (const playerInfo of players) {
          const guildId = playerInfo.guildId;
          const player = this.manager.players.get(guildId);

          if (player) {
            this.manager.emit(
              "debug",
              `Moonlink.js > Node > Player ${guildId} found in memory. Syncing state with Lavalink.`
            );
            player.isResuming = true;
            player.playing = playerInfo.paused === false;
            player.paused = playerInfo.paused ?? false;
            
            if (player.current) {
               player.current.position = playerInfo.state.position;
            }
            
            this.manager.emit("playerResumed", player);
            player.isResuming = false;
            continue;
          }

          const storage: any = await this.manager.database.get(
            `players.${guildId}`
          );
          if (!storage) {
            this.manager.emit(
              "debug",
              `Moonlink.js > Node > No stored data found for player ${guildId}, skipping resume.`
            );
            continue;
          }
    
          this.manager.emit(
            "debug",
            `Moonlink.js > Node > Attempting to resume player ${guildId} on node ${this.uuid}.`
          );
    
          const reconstructedPlayer = this.manager.players.create({
              guildId: guildId,
              voiceChannelId: storage.voiceChannelId,
              textChannelId: storage.textChannelId,
              selfDeaf: storage.selfDeaf,
              selfMute: storage.selfMute,
              volume: playerInfo.volume,
              node: this.identifier,
            });
    
          this.manager.emit("playerResuming", reconstructedPlayer);
          reconstructedPlayer.isResuming = true;
    
          reconstructedPlayer.connect();
    
          reconstructedPlayer.playing = playerInfo.paused === false;
          reconstructedPlayer.paused = playerInfo.paused ?? false;
    
          const currentTrackInfo = storage.current;
          if (currentTrackInfo && currentTrackInfo.encoded) {
            reconstructedPlayer.current = new Track(
              decodeTrack(currentTrackInfo.encoded),
              currentTrackInfo.requester
            );
            reconstructedPlayer.current.position = playerInfo.state.position;
          } else {
            reconstructedPlayer.playing = false;
            reconstructedPlayer.paused = true;
            this.manager.emit(
              "debug",
              `Moonlink.js > Node > No current track found for player ${guildId}.`
            );
          }
    
          const queueTracks = storage.queue;
          if (queueTracks && Array.isArray(queueTracks)) {
            for (const trackData of queueTracks) {
              if (trackData.encoded) {
                reconstructedPlayer.queue.add(
                  new Track(
                    decodeTrack(trackData.encoded),
                    trackData.requester
                  )
                );
              }
            }
          }
    
          this.manager.emit(
            "debug",
            `Moonlink.js > Player ${guildId} has been resumed on node ${this.uuid}.`
          );
          this.manager.emit("playerResumed", reconstructedPlayer);
          reconstructedPlayer.isResuming = false;
        }
      }
    }
    