"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.VoicePacketHandler = void 0;
class VoicePacketHandler {
    static async handle(manager, packet) {
        if (!manager.initialized || !packet || typeof packet !== 'object' || Array.isArray(packet))
            return;
        const { t, d } = packet;
        if (t !== 'VOICE_STATE_UPDATE' && t !== 'VOICE_SERVER_UPDATE')
            return;
        if (!d || typeof d !== 'object' || Array.isArray(d) || typeof d.guild_id !== 'string')
            return;
        const player = manager.players.get(d.guild_id);
        if (!player || player.destroyed)
            return;
        if (t === 'VOICE_STATE_UPDATE') {
            if (d.user_id !== manager.clientId || !(d.channel_id === null || typeof d.channel_id === 'string' && d.channel_id.length > 0))
                return;
            if (d.channel_id !== null && (typeof d.session_id !== 'string' || !d.session_id))
                return;
            manager.emit('debug', `Moonlink.js > Manager <- Received VOICE_STATE_UPDATE. Guild: ${d.guild_id}, Data: ${JSON.stringify(d)}`);
            await player.voice.handleStateUpdate(d);
        }
        else {
            if (typeof d.token !== 'string' || !d.token || !(d.endpoint === null || typeof d.endpoint === 'string' && d.endpoint.length > 0))
                return;
            manager.emit('debug', `Moonlink.js > Manager <- Received VOICE_SERVER_UPDATE. Guild: ${d.guild_id}, Data: ${JSON.stringify(d)}`);
            player.voice.handleServerUpdate(d);
        }
    }
}
exports.VoicePacketHandler = VoicePacketHandler;
//# sourceMappingURL=VoicePacketHandler.js.map