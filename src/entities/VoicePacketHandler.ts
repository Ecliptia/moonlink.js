import type { Manager } from '../core/Manager';
import type { VoiceStateUpdate, VoiceServerUpdate } from '../typings/types';

/** Validates the bot's guild voice events before they reach a player. */
export class VoicePacketHandler {
    public static async handle(manager: Manager, packet: unknown): Promise<void> {
        if (!manager.initialized || !packet || typeof packet !== 'object' || Array.isArray(packet)) return;
        const { t, d } = packet as { t?: unknown; d?: Record<string, unknown> };
        if (t !== 'VOICE_STATE_UPDATE' && t !== 'VOICE_SERVER_UPDATE') return;
        if (!d || typeof d !== 'object' || Array.isArray(d) || typeof d.guild_id !== 'string') return;
        const player = manager.players.get(d.guild_id);
        if (!player || player.destroyed) return;
        if (t === 'VOICE_STATE_UPDATE') {
            if (d.user_id !== manager.clientId || !(d.channel_id === null || typeof d.channel_id === 'string' && d.channel_id.length > 0)) return;
            if (d.channel_id !== null && (typeof d.session_id !== 'string' || !d.session_id)) return;
            manager.emit('debug', `Moonlink.js > Manager <- Received VOICE_STATE_UPDATE. Guild: ${d.guild_id}, Data: ${JSON.stringify(d)}`);
            await player.voice.handleStateUpdate(d as VoiceStateUpdate);
        } else {
            if (typeof d.token !== 'string' || !d.token || !(d.endpoint === null || typeof d.endpoint === 'string' && d.endpoint.length > 0)) return;
            manager.emit('debug', `Moonlink.js > Manager <- Received VOICE_SERVER_UPDATE. Guild: ${d.guild_id}, Data: ${JSON.stringify(d)}`);
            player.voice.handleServerUpdate(d as VoiceServerUpdate);
        }
    }
}
