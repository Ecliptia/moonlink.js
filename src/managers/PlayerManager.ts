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
        const nodePlayersKey = `moonlink.${this.manager.clientId}.node-players.${nodeUuid}`;
        
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

    public async clear(): Promise<void> {
        if (this.players.size === 0) return;
        await Promise.all([...this.all].map(p => p.destroy("clear")));
    }

    public async destroyAll(): Promise<void> {
        await this.clear();
    }

    public async destroy(guildId: string, reason?: string): Promise<boolean> {
        const player = this.get(guildId);
        if (!player) {
            return false;
        }
        await player.destroy(reason);
        return true;
    }

    public async ensureVoiceConnection(player: Player): Promise<void> {
        this.manager.emit("debug", `Moonlink.js > PlayerManager#ensureVoiceConnection -> Checking voice connection for Guild: ${player.guildId}`);

        const hasCompleteVoiceState = player.voiceState.sessionId && 
                                      player.voiceState.token && 
                                      player.voiceState.endpoint;

        if (hasCompleteVoiceState && player._voiceStateReady) {
            this.manager.emit("debug", `Moonlink.js > PlayerManager#ensureVoiceConnection >> Voice state already complete and ready for Guild: ${player.guildId}`);
            return;
        }

        if (!hasCompleteVoiceState) {
            this.manager.emit("debug", `Moonlink.js > PlayerManager#ensureVoiceConnection >> Incomplete voice state detected. Awaiting packets... Guild: ${player.guildId}`);
            
            const startTime = Date.now();
            const timeout = 10000;
            
            while (Date.now() - startTime < timeout) {
                await delay(500);
                
                const isComplete = player.voiceState.sessionId && 
                                 player.voiceState.token && 
                                 player.voiceState.endpoint;
                
                if (isComplete) {
                    this.manager.emit("debug", `Moonlink.js > PlayerManager#ensureVoiceConnection >> Voice packets received successfully for Guild: ${player.guildId}`);
                    break;
                }
            }

            const finalCheck = player.voiceState.sessionId && 
                             player.voiceState.token && 
                             player.voiceState.endpoint;

            if (!finalCheck) {
                const errorDetails = {
                    hasSessionId: !!player.voiceState.sessionId,
                    hasToken: !!player.voiceState.token,
                    hasEndpoint: !!player.voiceState.endpoint,
                    voiceState: player.voiceState
                };

                const errorMessage = [
                    `FATAL ERROR: Voice connection information not obtained for Guild: ${player.guildId}`,
                    ``,
                    `Missing voice packets from Discord. This usually indicates a configuration issue:`,
                    ``,
                    `1. Verify the 'send' function is properly configured in Manager options`,
                    `2. Ensure bot has GUILD_VOICE_STATES intent enabled`,
                    `3. Check Discord Developer Portal for proper gateway intents`,
                    `4. Verify packetUpdate() is being called with Discord gateway packets`,
                    `5. Ensure client is properly connected to Discord gateway`,
                    ``,
                    `Voice State Status:`,
                    `  - Session ID: ${errorDetails.hasSessionId ? '✓ Received' : '✗ Missing'}`,
                    `  - Token: ${errorDetails.hasToken ? '✓ Received' : '✗ Missing'}`,
                    `  - Endpoint: ${errorDetails.hasEndpoint ? '✓ Received' : '✗ Missing'}`,
                    ``,
                    `Debug info: ${JSON.stringify(errorDetails.voiceState)}`
                ].join('\n');

                throw new Error(errorMessage);
            }
        }

        await this.verifyVoiceState(player);
        player._voiceStateReady = true;
        player._awaitingVoiceConnection = false;
    }

    public async verifyVoiceState(player: Player): Promise<void> {
        this.manager.emit("debug", `Moonlink.js > PlayerManager#verifyVoiceState -> Verifying voice state for Guild: ${player.guildId}.`);

        if (player._lastVoiceState &&
            player._lastVoiceState.sessionId === player.voiceState.sessionId &&
            player._lastVoiceState.token === player.voiceState.token &&
            player._lastVoiceState.endpoint === player.voiceState.endpoint) {
            this.manager.emit("debug", `Moonlink.js > PlayerManager#verifyVoiceState -> Voice state for Guild: ${player.guildId} is unchanged. Skipping update.`);
        } else {
            this.manager.emit("debug", `Moonlink.js > PlayerManager#verifyVoiceState -> Sending voice state to Lavalink for Guild: ${player.guildId}. VoiceState: ${JSON.stringify(player.voiceState)}`);
            await player.node.rest.updatePlayer(player.guildId, { voice: player.voiceState });
            player._lastVoiceState = { ...player.voiceState };
        }
        

        for (let i = 0; i < 3; i++) {
            await delay(500);
            const lavalinkPlayer = await player.node.rest.getPlayer(player.guildId);
            if (lavalinkPlayer && lavalinkPlayer.voice?.endpoint) {
                this.manager.emit("debug", `Moonlink.js > PlayerManager#verifyVoiceState >> Voice connection established successfully for Guild: ${player.guildId}.`);
                return;
            }
            this.manager.emit("debug", `Moonlink.js > PlayerManager#verifyVoiceState >> Voice connection verification attempt ${i + 1} failed for Guild: ${player.guildId}. Retrying...`);
        }

        this.manager.emit("debug", `Moonlink.js > PlayerManager#verifyVoiceState >> Voice connection failed after 3 attempts for Guild: ${player.guildId}. Attempting reconnection...`);
        await player.node.rest.destroyPlayer(player.guildId);
        await delay(500);
        
        this.manager.emit("debug", `Moonlink.js > PlayerManager#verifyVoiceState -> Re-sending voice update to Discord for Guild: ${player.guildId}.`);
        player.connect();
        
        await delay(1000);

        const finalPlayer = await player.node.rest.getPlayer(player.guildId);
        if (finalPlayer && finalPlayer.voice?.endpoint) {
            this.manager.emit("debug", `Moonlink.js > PlayerManager#verifyVoiceState >> Voice connection established after reset for Guild: ${player.guildId}.`);
            return;
        }

        const errorMessage = [
            `FATAL ERROR: Could not establish voice connection with Lavalink for Guild: ${player.guildId}`,
            ``,
            `The voice state was sent to Lavalink but the connection could not be verified.`,
            `This may indicate:`,
            ``,
            `1. Network issues between Lavalink and Discord voice servers`,
            `2. Lavalink configuration problems`,
            `3. Discord voice server temporary unavailability`,
            `4. Incorrect voice state data`,
            ``,
            `Current voice state: ${JSON.stringify(player.voiceState)}`,
            ``,
            `Try again or check Lavalink logs for more details.`
        ].join('\n');

        throw new Error(errorMessage);
    }
}