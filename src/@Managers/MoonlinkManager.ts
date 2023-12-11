import { EventEmitter } from "node:events";
import { Structure } from "../../index";
import { Players, Nodes } from "../@Utils/Structure";
import { INode, IOptions } from "../@Typings";

export class MoonlinkManager extends EventEmittir {
    public readonly _nodes: INode[];
    public readonly _SPayload: Function;
    public readonly players: Players;
    public readonly nodes: Nodes;
    public readonly version: number = require("../../index").version;
    public options: IOptions;
    public initiated: boolean = false;

    constructor(nodes: INode[], options: IOptions, SPayload: Function) {
        super();
        this._nodes = nodes;
        this._SPayload = SPayload;
        this.players = new Structure.get("Players");
        this.nodes = new Structure.get("Nodes");
        this.options = options;
        this.options.clientName
            ? (this.options.clientName = `Moonlink/${this.manager.version}`)
            : null;
    }
    public init(clientId?: number): this {
        if (this.initiated) return this;
        if (!clientId && !this.options.clientId)
            throw new TypeError(
                '[ @Moonlink/Manager ]: "clientId" option is required.'
            );
        this.clientId = this.options.clientId;
        Structure.init(this);
        this.nodes.init();
        this.players.init();
        this.initated = true;
        return this;
    }
    public packetUpdate(packet: VoicePacket): void {
        const { t, d } = packet;
        if (!["VOICE_STATE_UPDATE", "VOICE_SERVER_UPDATE"].includes(t)) return;

        const update: any = d;
        const guildId = update.guild_id;
        const player: MoonlinkPlayers = this.players.get(guildId);

        if (!update || (!update.token && !update.session_id)) return;

        if (t === "VOICE_SERVER_UPDATE") {
            this.players.handleVoiceServerUpdate(update, guildId);
        }

        if (t === "VOICE_STATE_UPDATE" && update.user_id === this.clientId) {
            if (!player) return;

            if (!update.channel_id) {
                this.players.handlePlayerDisconnect(player, guildId);
            }

            if (
                update.channel_id &&
                update.channel_id !== player.voiceChannel
            ) {
                this.players.handlePlayerMove(
                    player,
                    update.channel_id,
                    player.voiceChannel,
                    guildId
                );
            }

            this.players.updateVoiceStates(guildId, update);
            this.players.attemptConnection(guildId);
        }
    }
}
