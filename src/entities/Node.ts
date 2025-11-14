import { IManagerNodeConfig, INodeStats } from "../typings/interfaces";
import type { Manager } from "../core/Manager";
import { Rest } from "./Rest";
import { Structure, generateUUID, stringifyWithReplacer } from "../Util";
import { WebSocket } from "../services/WebSocket";
import { NodeState } from "../typings/types";

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
  private lastStats?: { players: number; playingPlayers: number; };
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
    this.sessionId = config.sessionId;
    this.url = `${this.secure ? "https" : "http"}://${this.address}/${this.pathVersion}/`;
    this.rest = new (Structure.get("Rest"))(this);

    this.manager.emit(
      "debug",
      `Moonlink.js > Node >> New node initialized. Identifier: ${this.identifier} (${this.host}:${this.port}), UUID: ${this.uuid}`
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
      `Moonlink.js > Node -> Attempting connection to ${this.identifier} (${this.host}:${this.port}).`
    );

    const savedSession = await this.manager.database.get<{ sessionId: string; resumed: boolean; clientId: string }>(`node-${this.uuid}-session`);
    if (this.manager.options.resume && savedSession?.sessionId && savedSession.clientId === this.manager.clientId) {
        this.sessionId = savedSession.sessionId;
        this.resumed = savedSession.resumed;
        this.manager.emit("debug", `Moonlink.js > Node >> Found saved session for ${this.identifier}. SessionId: ${this.sessionId}, Resumed: ${this.resumed}, ClientId: ${savedSession.clientId}.`);
    }

    let headers: Record<string, string> = {
      Authorization: this.password,
      "User-Id": this.manager.clientId,
      "Client-Name": this.manager.options.clientName || "Moonlink.js",
    };

    if (this.manager.options.resume && this.sessionId) {
        headers["Session-Id"] = this.sessionId;
        this.setState(NodeState.RESUMING);
    }
    
    this.manager.emit("debug", `Moonlink.js > Node >> WebSocket headers for ${this.identifier}: ${stringifyWithReplacer(headers)}.`);

    this.socket = new (Structure.get("WebSocket"))(
      `ws${this.secure ? "s" : ""}://${this.address}/${this.pathVersion}/websocket`,
      {
        headers,
      }
    );
    this.socket.on("open", this.open.bind(this));
    this.socket.on("close", this.close.bind(this));
    this.socket.on("message", this.message.bind(this));
    this.socket.on("error", this.error.bind(this));
  }

  public reconnect(): void {
    this.setState(NodeState.CONNECTING);
    const delay = Math.min(this.retryDelay * Math.pow(1.5, this.reconnectAttempts), 300000);

    this.manager.emit(
      "debug",
      `Moonlink.js > Node >> Reconnecting to ${this.identifier} in ${delay / 1000}s (Attempt ${this.reconnectAttempts + 1}/${this.retryAmount}).`
    );

    this.reconnectTimeout = setTimeout(() => {
      this.reconnectAttempts++;
      this.connect();
    }, delay);
  }

  protected async open(): Promise<void> {
    if (this.reconnectTimeout) clearTimeout(this.reconnectTimeout);
    this.connected = true;
    this.setState(NodeState.CONNECTED);
    this.manager.emit("debug", `Moonlink.js > Node <- Connected to ${this.identifier}.`);
    
    if (this.manager.options.resume) {
        try {
            await this.rest.updateSession(this.manager.options.resume, this.manager.options.resumeTimeout || 60);
            this.manager.emit("debug", `Moonlink.js > Node >> Configured resuming for ${this.identifier}. Timeout: ${this.manager.options.resumeTimeout || 60}s`);
        } catch (error) {
            this.manager.emit("debug", `Moonlink.js > Node >> Failed to configure resuming for ${this.identifier}. Error: ${error.message}`);
        }
    }
    
    this.manager.emit("nodeConnected", this);
  }

  protected close(event: { code: number, reason: string }): void {
    const { code, reason } = event;
    if (this.connected) this.connected = false;

    if (this.socket) {
      this.socket.close();
    }

    if (this.manager.options.resume && this.sessionId) {
        this.manager.database.set(`node-${this.uuid}-session`, { sessionId: this.sessionId, resumed: this.resumed, clientId: this.manager.clientId });
        this.manager.emit("debug", `Moonlink.js > Node >> Saved session for ${this.identifier}. SessionId: ${this.sessionId}, Resumed: ${this.resumed}, ClientId: ${this.manager.clientId}. Code: ${code}, Reason: ${reason}.`);
    }

    const shouldMovePlayersOnDisconnect = this.manager.options.movePlayersOnNodeDisconnect ?? this.manager.options.playerAutoFailover ?? false;
    
    if (shouldMovePlayersOnDisconnect && this.manager.nodes.onlineNodes.length > 0) {
        this.manager.emit("debug", `Moonlink.js > Node >> Starting player failover from ${this.identifier}...`);
        this.handlePlayerFailover();
    }

    if (this.retryAmount > this.reconnectAttempts) {
      this.reconnect();
    } else {
      this.socket = null;
      this.destroyed = true;
      this.setState(NodeState.DESTROYED);
      this.manager.emit("debug", `Moonlink.js > Node >> Max reconnect attempts reached for ${this.identifier}. Node destroyed.`);
    }
    this.setState(NodeState.DISCONNECTED);
    this.manager.emit("debug", `Moonlink.js > Node <- Disconnected from ${this.identifier}. Code: ${code}, Reason: ${reason}.`);
    this.manager.emit("nodeDisconnect", this, code, reason);
  }

  protected async message({ data }): Promise<void> {
    let payload;
    try {
      payload = JSON.parse(data);
    } catch (e) {
      this.manager.emit("debug", `Moonlink.js > Node <- Received malformed payload from ${this.identifier}. Data: ${data}, Error: ${e}.`);
      return;
    }

    const player = this.manager.players.get(payload.guildId);
    if (!player && payload.guildId) {
        this.manager.emit("debug", `Moonlink.js > Node >> Payload for non-existent player. GuildId: ${payload.guildId}, OP: ${payload.op}.`);
        return;
    }
    
    let loggedByCase = false;

    switch (payload.op) {
      case "ready":
        this.sessionId = payload.sessionId;
        this.resumed = payload.resumed;
        this.setState(NodeState.READY);
        await this.manager.database.set(`node-${this.uuid}-session`, { sessionId: this.sessionId, resumed: this.resumed, clientId: this.manager.clientId });
        this.manager.emit("debug", `Moonlink.js > Node >> Node ${this.identifier} is READY. Session ID: ${this.sessionId}, Resumed: ${this.resumed}. Persisted to DB.`);
        this.manager.emit("nodeReady", this, payload);

        if (this.manager.options.autoResume && !payload.resumed) {
            this.manager.emit("debug", `Moonlink.js > Node >> AutoResume enabled and session not resumed. Attempting to restore players on node ${this.identifier}.`);
            const nodePlayersIndex = await this.manager.database.get<string[]>(`node-players-${this.uuid}`);
            if (nodePlayersIndex && nodePlayersIndex.length > 0) {
                this.manager.emit("debug", `Moonlink.js > Node >> Node ${this.identifier} found ${nodePlayersIndex.length} persisted players. Attempting to restore.`);
                for (const guildId of nodePlayersIndex) {
                    const playerState = await this.manager.database.get<any>(`player-${guildId}`);
                    if (playerState) {
                        try {
                            let player = this.manager.players.get(guildId);
                            
                            if (!player) {
                                player = new (Structure.get("Player"))(this.manager, this, {
                                    guildId: playerState.guildId,
                                    voiceChannelId: playerState.voiceChannelId,
                                    textChannelId: playerState.textChannelId,
                                    volume: playerState.volume,
                                    loop: playerState.loop,
                                    loopCount: playerState.loopCount,
                                    autoPlay: playerState.autoPlay,
                                    autoLeave: playerState.autoLeave,
                                    selfDeaf: playerState.selfDeaf,
                                    selfMute: playerState.selfMute,
                                });

                                player.playing = playerState.playing;
                                player.paused = playerState.paused;
                                player.connected = playerState.connected;
                                player.ping = playerState.ping;
                                player.data = playerState.data || {};
                                player.voiceState = playerState.voiceState || {};

                                if (playerState.currentTrack) {
                                    player.current = new (Structure.get("Track"))(playerState.currentTrack);
                                }
                                if (playerState.queue && playerState.queue.length > 0) {
                                    const tracks = playerState.queue.map(t => new (Structure.get("Track"))(t));
                                    player.queue.add(tracks);
                                }
                                if (playerState.previousTracks && playerState.previousTracks.length > 0) {
                                    player.previous = playerState.previousTracks.map(t => new (Structure.get("Track"))(t));
                                }

                                this.manager.players.players.set(guildId, player);
                                this.manager.emit("debug", `Moonlink.js > Node >> Player ${guildId} restored from DB on node ${this.identifier}.`);
                            }

                            if (player.voiceState.sessionId && player.voiceState.event) {
                                this.manager.emit("debug", `Moonlink.js > Node >> Reconnecting player ${guildId} to voice channel ${player.voiceChannelId}.`);
                                await player.node.rest.updatePlayer(player.guildId, { voice: player.voiceState });
                                
                                if (playerState.playing && player.current) {
                                    this.manager.emit("debug", `Moonlink.js > Node >> Resuming playback for player ${guildId}. Track: ${player.current.title} at position ${player.current.position || 0}ms.`);
                                    await player.play({ 
                                        track: player.current, 
                                        position: player.current.position || 0 
                                    });
                                }
                            }
                        } catch (error) {
                            this.manager.emit("debug", `Moonlink.js > Node >> Failed to restore player ${guildId} on node ${this.identifier}. Error: ${error.message}`);
                        }
                    } else {
                        this.manager.emit("debug", `Moonlink.js > Node >> Player state not found in DB for guild ${guildId}. Removing from node-players index.`);
                        await this.manager.players._updateNodePlayersIndex(this.uuid, guildId, 'remove');
                    }
                }
            }
        }
        loggedByCase = true;
        break;
      case "stats":
        delete payload.op;
        this.stats = payload as INodeStats;
        if (!this.lastStats || this.stats.players !== this.lastStats.players || this.stats.playingPlayers !== this.lastStats.playingPlayers) {
            this.lastStats = { players: this.stats.players, playingPlayers: this.stats.playingPlayers };
            this.manager.emit("debug", `Moonlink.js > Node <- Node ${this.identifier} STATS updated. Stats: ${stringifyWithReplacer(this.stats)}.`);
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
        }

        let logMessage = `Moonlink.js > Node#handleMessage >> Player ${player.guildId} state updated. CurrentState: ${stringifyWithReplacer(currentState)}.`;
        let shouldLog = false;

        const lastState = player.get<{ connected: boolean; position: number; ping: number; time: number }>("lastState");
        if (!lastState) {
            shouldLog = true;
            logMessage += ` Initial state: ${stringifyWithReplacer(currentState)} (skipping all normal logs).`;
        } else {
            if (currentState.connected !== lastState.connected) {
                shouldLog = true;
                logMessage += ` Connection status changed from ${lastState.connected} to ${currentState.connected}.`;
            }

            if (currentState.ping !== -1) {
                if (currentState.ping > 1000 && currentState.ping !== lastState.ping) {
                    shouldLog = true;
                    logMessage += ` High ping detected: ${currentState.ping}ms.`;
                } else if (lastState.ping && lastState.ping !== -1 && Math.abs(currentState.ping - lastState.ping) > 500) {
                    shouldLog = true;
                    logMessage += ` Significant ping change: ${lastState.ping}ms -> ${currentState.ping}ms.`;
                }
            }

            if (player.playing && player.current) {
                if (currentState.position === 0 && lastState.position !== 0) {
                    shouldLog = true;
                    logMessage += ` Position reset to 0 while playing.`;
                } else if (currentState.position === lastState.position && currentState.position !== 0) {
                    shouldLog = true;
                    logMessage += ` Position stuck at ${currentState.position}ms while playing.`;
                }
            }
        }

        if (shouldLog) {
            this.manager.emit("debug", logMessage);
        }
        loggedByCase = true;
        player.set("lastState", { connected: currentState.connected, position: currentState.position, ping: currentState.ping, time: currentState.time });
        break;
      case "event":
        if (!player) {
            loggedByCase = true;
            break;
        }
        this.manager.emit("debug", `Moonlink.js > Node <- Player ${player.guildId} received event. Type: ${payload.type}, Payload: ${stringifyWithReplacer(payload)}.`);
        this.handleEvent(player, payload);
        loggedByCase = true;
        break;
      default:
        if (!loggedByCase) {
            this.manager.emit("debug", `Moonlink.js > Node <- Received unhandled payload from ${this.identifier}. OP: ${payload.op}, Data: ${stringifyWithReplacer(payload)}.`);
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
    
    this.manager.emit("trackStart", player, player.current);
  }

  private async handleTrackEnd(player: any, payload: any): Promise<void> {
    const { reason } = payload;
    const trackForEvent = new (Structure.get("Track"))(payload.track, player.current?.requester);

    player.playing = false;
    player.paused = false;

    player.set("isBackPlay", false);
    
    this.manager.emit("trackEnd", player, trackForEvent, reason, payload);

    if (player.destroyed) {
      this.manager.emit("debug", `Moonlink.js > Node#handleTrackEnd >> Player ${player.guildId} is destroyed, skipping end handling.`);
      return;
    }

    if (reason === "replaced" || reason === "stopped") {
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
    
    this.manager.emit("debug", `Moonlink.js > Node#handleWebSocketClosed >> WebSocket closed for player ${player.guildId}. Code: ${code}, Reason: "${reason}", By Remote: ${byRemote}. Payload: ${stringifyWithReplacer(payload)}.`);

    if (player.isResuming) {
        this.manager.emit("debug", `Moonlink.js > Node#handleWebSocketClosed >> Player ${player.guildId} is resuming, ignoring WebSocket close event.`);
        return;
    }

    const fatalCodes = [4004, 4014, 4015, 4021, 4022];
    const clientErrorCodes = [4001, 4002, 4003, 4005, 4011, 4012, 4016];

    if (fatalCodes.includes(code)) {
        this.manager.emit("debug", `Moonlink.js > Node#handleWebSocketClosed >> Fatal close code ${code} for player ${player.guildId}, destroying player.`);
        this.manager.emit("socketClosed", player, code, reason, byRemote, payload);
        player.destroy();
        return;
    }

    if (clientErrorCodes.includes(code)) {
        this.manager.emit("debug", `Moonlink.js > Node#handleWebSocketClosed >> Client error code ${code} for player ${player.guildId}, destroying player.`);
        this.manager.emit("socketClosed", player, code, reason, byRemote, payload);
        player.destroy();
        return;
    }

    const reconnectAttempts = (player.get("wsReconnectAttempts") || 0) + 1;
    const maxReconnectAttempts = 5;

    if (reconnectAttempts > maxReconnectAttempts) {
        this.manager.emit("debug", `Moonlink.js > Node#handleWebSocketClosed >> Max reconnect attempts reached (${maxReconnectAttempts}) for player ${player.guildId}.`);
        this.manager.emit("socketClosed", player, code, reason, byRemote, payload);
        player.destroy();
        return;
    }

    player.set("wsReconnectAttempts", reconnectAttempts);
    this.manager.emit("debug", `Moonlink.js > Node#handleWebSocketClosed -> Attempting reconnect ${reconnectAttempts}/${maxReconnectAttempts} for player ${player.guildId}.`);

    const reconnectDelay = Math.min(1000 * Math.pow(2, reconnectAttempts - 1), 10000);
    this.manager.emit("debug", `Moonlink.js > Node#handleWebSocketClosed -> Reconnect scheduled in ${reconnectDelay}ms for player ${player.guildId}.`);

    setTimeout(async () => {
        if (player.destroyed) {
            this.manager.emit("debug", `Moonlink.js > Node#handleWebSocketClosed >> Player ${player.guildId} was destroyed during reconnect delay.`);
            return;
        }

        try {
            this.manager.emit("debug", `Moonlink.js > Node#handleWebSocketClosed -> Step 1: Disconnecting voice for player ${player.guildId}.`);
            player.disconnect();
            
            await new Promise(resolve => setTimeout(resolve, 1000));

            this.manager.emit("debug", `Moonlink.js > Node#handleWebSocketClosed -> Step 2: Reconnecting voice for player ${player.guildId}.`);
            player.connect();
            
            await new Promise(resolve => setTimeout(resolve, 2000));

            if (player.current) {
                this.manager.emit("debug", `Moonlink.js > Node#handleWebSocketClosed -> Step 3: Restoring playback for player ${player.guildId} at position ${player.current.position}ms. Track: ${player.current.title}.`);
                
                await player.play({
                    track: player.current,
                    position: player.current.position
                });
                
                this.manager.emit("debug", `Moonlink.js > Node#handleWebSocketClosed >> Successfully reconnected and restored playback for player ${player.guildId}.`);
                player.set("wsReconnectAttempts", 0);
            } else if (player.queue.size > 0) {
                this.manager.emit("debug", `Moonlink.js > Node#handleWebSocketClosed -> Step 3: Starting queue playback for player ${player.guildId}. Queue size: ${player.queue.size}.`);
                
                await player.play();
                
                this.manager.emit("debug", `Moonlink.js > Node#handleWebSocketClosed >> Successfully reconnected and started queue for player ${player.guildId}.`);
                player.set("wsReconnectAttempts", 0);
            } else {
                this.manager.emit("debug", `Moonlink.js > Node#handleWebSocketClosed >> No track or queue to resume for player ${player.guildId}.`);
                player.set("wsReconnectAttempts", 0);
            }
        } catch (error) {
            this.manager.emit("debug", `Moonlink.js > Node#handleWebSocketClosed >> Reconnect attempt ${reconnectAttempts} failed for player ${player.guildId}. Error: ${error.message}.`);
            
            if (reconnectAttempts >= maxReconnectAttempts) {
                this.manager.emit("debug", `Moonlink.js > Node#handleWebSocketClosed >> All reconnect attempts exhausted for player ${player.guildId}.`);
                this.manager.emit("socketClosed", player, code, reason, byRemote, payload);
                player.destroy();
            }
        }
    }, reconnectDelay);
  }

  private async handleAutoPlay(player: any, previousTrack: any): Promise<boolean> {
    if (!previousTrack?.sourceName || !previousTrack.identifier) {
        this.manager.emit("debug", `Moonlink.js > Node#handleAutoPlay >> No source or identifier for autoPlay in player ${player.guildId}. PreviousTrack: ${stringifyWithReplacer(previousTrack)}.`);
        return false;
    }

    const source = previousTrack.sourceName.toLowerCase();
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
        player.destroy();
    }
  }

  protected error({ error }): void {
    this.manager.emit("debug", `Moonlink.js > Node !> Error on node ${this.identifier}. Error: ${error.message}.`);
    this.manager.emit("nodeError", this, error);
  }

  private async handlePlayerFailover(): Promise<void> {
    const nodePlayersIndex = await this.manager.database.get<string[]>(`node-players-${this.uuid}`) || [];
    
    if (nodePlayersIndex.length === 0) {
        this.manager.emit("debug", `Moonlink.js > Node >> No players to failover from node ${this.identifier}.`);
        return;
    }

    const targetNode = this.manager.nodes.findNode();
    if (!targetNode || targetNode.uuid === this.uuid) {
        this.manager.emit("debug", `Moonlink.js > Node >> No available target node for failover from ${this.identifier}.`);
        return;
    }

    this.manager.emit("debug", `Moonlink.js > Node >> Starting failover of ${nodePlayersIndex.length} players from ${this.identifier} to ${targetNode.identifier}.`);

    for (const guildId of nodePlayersIndex) {
        try {
            const player = this.manager.players.get(guildId);
            if (!player) {
                this.manager.emit("debug", `Moonlink.js > Node >> Player ${guildId} not found in memory during failover.`);
                continue;
            }

            const oldNode = player.node;
            player.node = targetNode;

            await this.manager.players._updateNodePlayersIndex(this.uuid, guildId, 'remove');
            await this.manager.players._updateNodePlayersIndex(targetNode.uuid, guildId, 'add');

            this.manager.emit("debug", `Moonlink.js > Node >> Player ${guildId} moved from ${oldNode.identifier} to ${targetNode.identifier}.`);
            this.manager.emit("playerSwitchedNode", player, oldNode, targetNode);

            if (player.voiceState.sessionId && player.voiceState.event) {
                await player.node.rest.updatePlayer(player.guildId, { voice: player.voiceState });
                this.manager.emit("debug", `Moonlink.js > Node >> Updated voice state for player ${guildId} on new node.`);
            }

            if (player.playing && player.current) {
                await player.play({ 
                    track: player.current, 
                    position: player.current.position || 0 
                });
                this.manager.emit("debug", `Moonlink.js > Node >> Resumed playback for player ${guildId} on node ${targetNode.identifier}.`);
            }
        } catch (error) {
            this.manager.emit("debug", `Moonlink.js > Node >> Failed to failover player ${guildId}. Error: ${error.message}`);
        }
    }

    this.manager.emit("debug", `Moonlink.js > Node >> Failover completed from ${this.identifier} to ${targetNode.identifier}.`);
  }

  public async destroy(): Promise<void> {
    if(this.socket) {
      this.socket.close();
    }
    await this.manager.database.delete(`node-${this.uuid}-session`);
    await this.manager.database.delete(`node-players-${this.uuid}`);
    this.destroyed = true;
    this.setState(NodeState.DESTROYED);
    this.manager.emit("debug", `Moonlink.js > Node >> Node ${this.identifier} destroyed. Session data and node-players index removed from DB.`);
  }
}