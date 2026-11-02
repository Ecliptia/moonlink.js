const { Client, GatewayIntentBits } = require('discord.js');
const { Manager, Connectors } = require('nyxlink');

// Call before client.login(token); importing this file never logs in.
function createMusicClient(nodes) {
    const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildVoiceStates] });
    const manager = new Manager({ nodes, options: { database: { type: 'memory' }, resume: false } });
    manager.use(new Connectors.DiscordJs(), client);
    return { client, manager, async close() { try { await manager.shutdown(); } finally { client.destroy(); } } };
}
async function queueTrack(manager, guildId, voiceChannelId, query, requester) {
    const result = await manager.search({ query, requester, signal: AbortSignal.timeout(10000) });
    const track = result.tracks[0];
    if (!track) return false;
    const player = manager.players.get(guildId) ?? manager.players.create({ guildId, voiceChannelId, volume: 50 });
    if (player.voiceChannelId !== voiceChannelId) throw new Error('Player belongs to another voice channel');
    player.queue.add(track);
    if (player.playing || player.paused) return true;
    return player.play();
}
module.exports = { createMusicClient, queueTrack };
