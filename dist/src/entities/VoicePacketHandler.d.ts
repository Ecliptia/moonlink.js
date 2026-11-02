import type { Manager } from '../core/Manager';
export declare class VoicePacketHandler {
    static handle(manager: Manager, packet: unknown): Promise<void>;
}
