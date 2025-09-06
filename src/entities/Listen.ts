import { Player } from "./Player";
import { EventEmitter } from "events";
import WebSocket from "../services/WebSocket";
export class Listen {
  public player: Player;
  public voiceReceiverWs: WebSocket;
  constructor(player: Player) {
    this.player = player;
  }
  public start(): EventEmitter {
    if (!this.player.node.info.isNodeLink)
      throw new Error("Moonlink.js > Listen#start - Node not is a NodeLink, switch to a NodeLink");
    this.voiceReceiverWs = new WebSocket(
      `ws${this.player.node.secure ? "s" : ""}://${this.player.node.address}/connection/data`,
      {
        headers: {
          Authorization: this.player.node.password,
          "Client-Name": `Moonlink.js/${this.player.manager.version}`,
          "guild-id": this.player.guildId,
          "user-id": this.player.manager.options.clientId,
        },
      }
    );
    const listener = new EventEmitter();

    this.voiceReceiverWs.on("message", ({ data }) => {
      const payload = JSON.parse(data);

      switch (payload?.type) {
        case "startSpeakingEvent": {
          listener.emit("start", {
            ...payload.data,
          });

          break;
        }
        case "endSpeakingEvent": {
          payload.data.data = Buffer.from(payload.data.data, "base64");

          listener.emit("end", {
            ...payload.data,
          });

          break;
        }
        default: {
          listener.emit("unknown", {
            ...payload,
          });
        }
      }
    });

    this.voiceReceiverWs.on("close", () => {
      listener.emit("close");
    });

    this.voiceReceiverWs.on("error", error => {
      listener.emit("error", error);
    });

    return listener;
  }
  public stop(): boolean {
    if (!this.voiceReceiverWs) return;

    this.voiceReceiverWs.close();
    this.voiceReceiverWs = null;
    return true;
  }
}
