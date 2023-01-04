import { EventEmitter } from 'events';
import WebSocket from 'ws';
import * as utils from '../@Rest/MoonlinkUtils.js';
import * as Nodes from './MoonlinkNodes.js';

let manager: MoonlinkManager;

class MoonlinkManager extends EventEmitter {
  #reconnectAtattempts = 0;
  #retryAmount = 5;
  #retryTime = 300000;
  #TokenSpotify = 'anonymous';
  #request = utils.request;
  #on = false;
  #ws: WebSocket;
  #options: any;
  #sPayload: Function;
  #nodes: any;

  constructor(lavalinks: any, options: any, sPayload: Function) {
    super();
    if (!lavalinks) throw new Error('[ Moonlink.js ]: Options is empty');
    if (lavalinks && !Array.isArray(lavalinks)) throw new Error('[ Moonlink.js ]: Option "nodes" must be in an array.');
    if (lavalinks.length === 0) throw new Error('[ Moonlink.js ]: Parament of "nodes" must contain an object');
    if (typeof options.shard !== 'number' && typeof options.shard !== 'undefined') throw new TypeError('[ Moonlink.js ]: Option "shards" must be in number. ');
    if (typeof options.clientName !== 'undefined' && typeof options.clientName !== 'string') throw new TypeError('[ Moonlink.js ]: The "clientname" option must be in string.');
    if (typeof sPayload !== 'function') throw new TypeError('[ MoonLink ]: The "send" option must be a function');
    if (sPayload) utils.esdw(sPayload);
    this.#sPayload = sPayload;
    this.#nodes = lavalinks;
    this.#options = options;
    this.version = require('./../package.json').version;
    this.nodes: any;
    this.sendWs: any;

    manager = this;
  }

  init(clientId: string) {
    if (!clientId) throw new TypeError('[ MoonLink ]: "clientId" option is required.');
    this.nodes = new Nodes(this, this.#nodes, this.#options, this.#sPayload, clientId);
    this.nodes.init();

    this.sendWs = (json: any) => {
      return this.nodes.sendWs(json);
    };
    this.clientId = clientId;
  }

  updateVoiceState(packet: any) {
    const map = utils.map;
    if (packet.t === 'VOICE_SERVER_UPDATE') {
      const voiceServer = {};
      voiceServer[packet.d.guild_id] = {
        event: packet.d,
      };
      map.set('voiceServer', voiceServer);
      return this.#attemptConnection(packet.d.guild_id);
    }
