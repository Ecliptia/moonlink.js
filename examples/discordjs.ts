import { Client, GatewayIntentBits } from 'discord.js';
import { Manager, Connectors, type IManagerConfig } from 'nyxlink';

/** Call before client.login(token); this factory never logs in automatically. */
export function createMusicClient(nodes: IManagerConfig['nodes']) {
    const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildVoiceStates] });
    const manager = new Manager({ nodes, options: { database: { type: 'memory' }, resume: false } });
    manager.use(new Connectors.DiscordJs(), client);
    // Register nodeError/trackException handlers in your application before login.
    return { client, manager, async close() { try { await manager.shutdown(); } finally { client.destroy(); } } };
}

/** Invoke from your authorized command handler once a backend has emitted nodeReady. */
export async function queueTrack(manager: Manager, guildId: string, voiceChannelId: string, query: string, requester: unknown) {
    const result = await manager.search({ query, requester, signal: AbortSignal.timeout(10000) });
    const track = result.tracks[0];
    if (!track) return false;
    const player = manager.players.get(guildId) ?? manager.players.create({ guildId, voiceChannelId, volume: 50 });
    if (player.voiceChannelId !== voiceChannelId) throw new Error('Player belongs to another voice channel');
    player.queue.add(track);
    if (player.playing || player.paused) return true;
    return player.play();
}
