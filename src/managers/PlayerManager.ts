import { Manager } from "../core/Manager";
import { Node } from "../entities/Node";
import { Player } from "../entities/Player";
import { Structure, validate, delay } from "../Util";
import { PlayerOptions } from "../typings/types";

export class PlayerManager {
    public readonly manager: Manager;
    public readonly players: Map<string, Player> = new Map();

    constructor(manager: Manager) {
        this.manager = manager;
    }

    public get all(): Player[] {
        return [...this.players.values()];
    }

    public async _updateNodePlayersIndex(nodeUuid: string, guildId: string, action: 'add' | 'remove'): Promise<void> {
        const nodePlayersKey = `node-players-${nodeUuid}`;
        
        let nodePlayers = await this.manager.database.get<string[]>(nodePlayersKey) || [];
        
        if (action === 'add') {
            if (!nodePlayers.includes(guildId)) {
                nodePlayers.push(guildId);
                this.manager.emit("debug", `Moonlink.js > PlayerManager#_updateNodePlayersIndex >> Added guild ${guildId} to node-players index for node ${nodeUuid}. Index: ${JSON.stringify(nodePlayers)}.`);
            }
        } else { // 'remove'
            const index = nodePlayers.indexOf(guildId);
            if (index > -1) {
                nodePlayers.splice(index, 1);
                this.manager.emit("debug", `Moonlink.js > PlayerManager#_updateNodePlayersIndex >> Removed guild ${guildId} from node-players index for node ${nodeUuid}. Index: ${JSON.stringify(nodePlayers)}.`);
            }
        }
        
        await this.manager.database.set(nodePlayersKey, nodePlayers);
    }

    public async loadPersistedPlayers(): Promise<void> {
        this.manager.emit("debug", `Moonlink.js > PlayerManager#loadPersistedPlayers -> Attempting to load persisted players.`);
        
        for (const node of this.manager.nodes.onlineNodes) {
            const nodePlayersKey = `node-players-${node.uuid}`;
            const guildIds = await this.manager.database.get<string[]>(nodePlayersKey) || [];

            if (guildIds.length === 0) {
                this.manager.emit("debug", `Moonlink.js > PlayerManager#loadPersistedPlayers >> No persisted players found for node ${node.identifier}.`);
                continue;
            }

            this.manager.emit("debug", `Moonlink.js > PlayerManager#loadPersistedPlayers -> Found ${guildIds.length} persisted players for node ${node.identifier}.`);

            for (const guildId of guildIds) {
                const playerState = await this.manager.database.get<any>(`player-${guildId}`);
                if (playerState) {
                    const player = new (Structure.get("Player"))(this.manager, node, {
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

                    player.current = playerState.currentTrack ? new (Structure.get("Track"))(playerState.currentTrack) : null;
                    player.queue.add(playerState.queue.map(trackData => new (Structure.get("Track"))(trackData)));
                    player.previous = playerState.previousTracks.map(trackData => new (Structure.get("Track"))(trackData));
                    player.voiceState = playerState.voiceState;
                    player.data = playerState.data;
                    player.playing = playerState.playing;
                    player.paused = playerState.paused;
                    player.connected = playerState.connected;
                    player.ping = playerState.ping;

                    this.players.set(guildId, player);
                    this.manager.emit("debug", `Moonlink.js > PlayerManager#loadPersistedPlayers >> Successfully loaded player for guild ${guildId} on node ${node.identifier}.`);
                } else {
                    this.manager.emit("debug", `Moonlink.js > PlayerManager#loadPersistedPlayers >> No player state found for guild ${guildId}, removing from index.`);
                    await this._updateNodePlayersIndex(node.uuid, guildId, 'remove');
                }
            }
        }
        this.manager.emit("debug", `Moonlink.js > PlayerManager#loadPersistedPlayers >> Finished loading persisted players.`);
    }

    public create(options: PlayerOptions): Player {
        validate(options.guildId, (v) => typeof v === "string", "PlayerOptions#guildId must be a string.");

        if (this.players.has(options.guildId)) {
            this.manager.emit("debug", `Moonlink.js > PlayerManager >> Player already exists for Guild: ${options.guildId}. Returning existing player.`);
            return this.players.get(options.guildId)!;
        }

        const node = this.manager.nodes.findNode();
        if (!node) {
            throw new Error("Moonlink.js > PlayerManager#create: No available nodes.");
        }

        const player = new (Structure.get("Player"))(this.manager, node, options);
        this.players.set(options.guildId, player);
        
        this.manager.emit("playerCreate", player);
        this.manager.emit("debug", `Moonlink.js > PlayerManager >> Player created. Guild: ${options.guildId}, Options: ${JSON.stringify(options)}`);
        return player;
    }

    public get(guildId: string): Player | undefined {
        return this.players.get(guildId);
    }

    public has(guildId: string): boolean {
        return this.players.has(guildId);
    }

    public get size(): number {
        return this.players.size;
    }

    public get playingPlayers(): Player[] {
        return this.all.filter(p => p.playing);
    }

    public get idlePlayers(): Player[] {
        return this.all.filter(p => !p.playing);
    }

    public filter(predicate: (player: Player) => boolean): Player[] {
        return this.all.filter(predicate);
    }

    public find(predicate: (player: Player) => boolean): Player | undefined {
        return this.all.find(predicate);
    }

    public map<T>(callback: (player: Player) => T): T[] {
        return this.all.map(callback);
    }

    public forEach(callback: (player: Player) => void): void {
        this.all.forEach(callback);
    }

    public clear(): void {
        for (const player of this.all) {
            player.destroy();
        }
        this.players.clear();
        this.manager.emit("debug", `Moonlink.js > PlayerManager >> All players cleared.`);
    }

    public destroyAll(): void {
        this.clear();
    }

    public destroy(guildId: string): boolean {
        const player = this.get(guildId);
        if (!player) {
            this.manager.emit("debug", `Moonlink.js > PlayerManager >> Attempted to destroy non-existent player for Guild: ${guildId}.`);
            return false;
        }

        this.manager.emit("playerDestroy", player);
        this.players.delete(guildId);
        
        this.manager.emit("debug", `Moonlink.js > PlayerManager >> Player destroyed for Guild: ${guildId}`);
        return true;
    }

    public async verifyVoiceState(player: Player): Promise<void> {
        this.manager.emit("debug", `Moonlink.js > PlayerManager -> Sending voice state to Lavalink for Guild: ${player.guildId}. VoiceState: ${JSON.stringify(player.voiceState)}`);
        await player.node.rest.updatePlayer(player.guildId, { voice: player.voiceState });
        

        for (let i = 0; i < 3; i++) {
            await delay(500);
            const lavalinkPlayer = await player.node.rest.getPlayer(player.guildId);
            if (lavalinkPlayer && lavalinkPlayer.voice?.endpoint) {
                this.manager.emit("debug", `Moonlink.js > PlayerManager >> Voice connection established successfully for Guild: ${player.guildId}.`);
                return;
            }
            this.manager.emit("debug", `Moonlink.js > PlayerManager >> Voice connection verification attempt ${i + 1} failed for Guild: ${player.guildId}. Retrying...`);
        }

        this.manager.emit("debug", `Moonlink.js > PlayerManager >> Voice connection failed after 3 attempts for Guild: ${player.guildId}. Resetting player.`);
        await player.node.rest.destroyPlayer(player.guildId);
        await delay(500);
        
        this.manager.emit("debug", `Moonlink.js > PlayerManager -> Re-sending voice update to Discord for Guild: ${player.guildId}.`);
        player.connect();
        
        await delay(1000);

        const finalPlayer = await player.node.rest.getPlayer(player.guildId);
        if (finalPlayer && finalPlayer.voice?.endpoint) {
            this.manager.emit("debug", `Moonlink.js > PlayerManager >> Voice connection established after reset for Guild: ${player.guildId}.`);
            return;
        }

        throw new Error("Moonlink.js > PlayerManager > Could not establish voice connection with Lavalink after multiple attempts.");
    }
}