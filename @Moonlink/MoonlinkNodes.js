const WebSocket = require('ws')
const makeRequest = require('../@Rest/MakeRequest.js')
const MoonlinkDB = require('../@Rest/MoonlinkDatabase.js')
class MoonlinkNodes {
  #password;
  #my_infos;
  #players = {};
  #map;
  #db = new MoonlinkDB();
  constructor(manager, my_information, manager_map) {
    this.ws;
    this.host = my_information.host || null
    this.port = my_information.port || null
    this.identifier = my_information.identifier || my_information.id || null
    this.isConnected = false;
    this.secure = my_information.secure || null
    this.#password = my_information.password
    this.retryTime = 30000;
    this.reconnectAtattempts = 0;
    this.retryAmount = 5;
    this.#my_infos = my_information;
    this.stats = {
      players: 0,
      playingPlayers: 0,
      uptime: 0,
      memory: {
        free: 0,
        used: 0,
        allocated: 0,
        reservable: 0,
      },
      cpu: {
        cores: 0,
        systemLoad: 0,
        lavalinkLoad: 0,
      },
      frameStats: {
        sent: 0,
        nulled: 0,
        deficit: 0,
      },
    };
    this.options = manager.options
    this.sPayload = manager._sPayload
    this.clientId = manager.clientId
    this.manager = manager;
    this.#map = manager_map;
    this.version = "resolving";
    this.calls = 0;

    this.sendWs = (data) => {
      return new Promise((resolve, reject) => {
        if (!this.isConnected) return resolve(false);
        if (!data || !JSON.stringify(data).startsWith("{")) {
          return reject(false);
        }
        this.ws.send(JSON.stringify(data), (error) => {
          if (error) reject(error);
          else resolve(true);
        });
      });
    }
  }
  init() {
    this.manager.emit('debug', '[ @Moonlink/Nodes ]: boot process started')
    this.create()
  }
  request(endpoint, params) {
    this.calls++;
    return makeRequest(`http${this.secure ? `s` : ``}://${this.host}${this.port ? `:${this.port}` : ``}/${this.version?.replace(/\./g, '') >= 370 ? this.version?.replace(/\./g, '') >= 400 ? "v4/" : "v3/" : ""}${endpoint}?${params}`, 'GET', {
      headers: {
        Authorization: this.#password
      }
    })
  }
  async create() {
    if (typeof this.host !== 'undefined' && typeof this.host !== 'string') throw new TypeError('[ @Moonlink/Nodes ]: Option "host" must be empty string, for localhost leave empty')
    if (typeof this.#password !== 'undefined' && typeof this.#password !== 'string') throw new TypeError("[ @Moonlink/Nodes ]: The password option must be in string, if you don't have a password, leave it empty")
    if (this.port && typeof this.port !== 'number' || this.port > 65535 || this.port < 0) throw new TypeError('[ @Moonlink/Nodes ]: the "Port" option is invalid')
    this.options.clientName = `MoonLink/${require('./../package.json').version}`
    this.version = await makeRequest(`http${this.secure ? `s` : ``}://${this.host}${this.port ? `:${this.port}` : ``}/version`, 'GET', {
      headers: {
        Authorization: this.#password
      }
    })

    this.ws = new WebSocket(`ws${this.secure ? 's' : ''}://${this.host ? this.host : 'localhost'}${this.port ? `:${this.port}` : ':443'}${this.version.replace(/\./g, '') >= 370 ? this.version.replace(/\./g, '') >= 400 ? "/v4/websocket" : "/v3/websocket" : ""}`, undefined, {
      headers: {
        Authorization: this.#password ? this.#password : ''
        , 'Num-Shards': this.options.shards
        , 'User-Id': this.manager.clientId
        , 'Client-Name': this.options.clientName
      }
    })
    this.ws.on('open', this.open.bind(this))
    this.ws.on("close", this.close.bind(this))
    this.ws.on('message', this.message.bind(this))
    this.ws.on('error', this.error.bind(this))
  }
  players(guildId) {
    this.#players[guildId] = {
    }

  }
  reconnect() {
    if (this.reconnectAtattempts >= this.retryAmount) {
      this.manager.emit('debug', '[ @Moonlink/Node ]: a node was destroyed due to inactivity')
      this.manager.emit('nodeDestroy', this.#my_infos)
      this.ws.close(1000, "destroy")
      this.ws.removeAllListeners()
      this.manager.nodes.delete(this.identifier || this.host)
    } else {
      this.reconnectTimeout = setTimeout(() => {
        this.ws.removeAllListeners()
        this.ws = null;
        this.isConnected = false;
        this.manager.emit('nodeReconnect', this)
        this.create()
        this.manager.emit('debug', '[ @Moonlink/Node ]: Trying to reconnect node, attempted number ' + this.reconnectAtattempts)
        this.reconnectAtattempts++
      }, this.retryTime)
    }
  }

  open() {
    if (this.reconnectTimeout) clearTimeout(this.reconnectTimeout)
    this.manager.emit('debug', '[ @Moonlink/Nodes ]: a new node said "hello world!"')
    this.manager.emit('nodeCreate', this)
    this.isConnected = true;
  }
  close(code, reason) {
    if (code !== 1000 || reason !== "destroy") this.reconnect();
    this.manager.emit("debug", "[ @Moonlink/Nodes ]: connection was disconnected from a node")
    this.manager.emit("nodeClose", this, code, reason)
    this.isConnected = false;
  }
  message(data) {
    if (Array.isArray(data)) data = Buffer.concat(data);
    else data = Buffer.from(data);
    let sPayload = JSON.parse(data.toString());
    if (!sPayload.op) return;

    this.manager.emit('nodeRaw', data)
    switch (sPayload.op) {
      case 'stats':
        delete sPayload.op;
        this.stats = ({ ...sPayload })
        break;
      case "playerUpdate":
        let current = this.#map.get(`current`) || {}
        current[sPayload.guildId] = {
          ...current[sPayload.guildId],
          position: sPayload.state.position || 0,
          thumbnail: current.thumbnail || null,
          ping: sPayload.state.ping || 0
        }
        this.#map.set('current', current)
        break;
      case "event":
        this.handleEvent(sPayload);
        break;
      default:
        this.manager.emit(
          "nodeError",
          this,
          new Error(`[ @Moonlink/Nodes ]: Unexpected op "${sPayload.op}" with data: ${sPayload}`)
        )
    }
  }
  error(error) {
    if (!error) return;
    this.manager.emit("nodeError", this, error);
    this.manager.emit("debug", "[ @Moonlink/Nodes ]: An error occurred in one of the lavalink(s) server connection(s)")
  }
  async handleEvent(payload) {
    if (!payload) return;
    var { MoonPlayer } = require('./MoonlinkPlayer.js')
    let player = new MoonPlayer(this.#map.get('players')[payload.guildId], this.manager, this.#map)
        let map_players = this.#map.get('players') || {};
    switch (payload.type) {
      case 'TrackStartEvent': {
        let track = this.#map.get('current') || {}
        track ? track = track[payload.guildId] : null
        if (!track) return;
        map_players[payload.guildId] = {
          ...map_players[payload.guildId],
          playing: true,
          paused: false
        }
        this.#map.set('players', map_players)
        this.manager.emit('trackStart', player, track)
        break;
      }
      case 'TrackEndEvent': {
        let currents = this.#map.get('current') || {}
        let track = currents[payload.guildId]
        let queue = this.#db.get(`queue.${payload.guildId}`);
        track ? track = track[payload.guildId] : null
        map_players[payload.guildId] = {
          ...map_players[payload.guildId],
          playing: false
        }
        this.#map.set('players', map_players)
        if (["LOAD_FAILED", "CLEAN_UP"].includes(payload.reason)) {
          if (!queue) {
            this.#db.delete(`queue.${payload.guildId}`)
            return this.manager.emit('queueEnd', player, track);
          }
          player.play();
          return;
        }
        if (payload.reason === "REPLACED") {
          this.manager.emit("trackEnd", player, track, payload);
          return;
        }
        if (track && player.loop) {
          if (player.loop == 1) {
            return this.sendWs({
              op: 'play',
              track: track.track,
              guildId: payload.guildId
            })
          }
          if (player.loop == 2) {
this.manager.emit('trackEnd', player, track)
player.queue.add(track)
            player.play();

            return this.sendWs({
              op: 'play',
              track: track.track,
              guildId: payload.guildId
            })
          } else {
this.manager.emit('trackEnd', player, track)
            this.manager.emit('debug', '[ @Manager/Nodes ]: invalid loop value will be ignored!')
          }
        }
        if (player.queue.size) {
this.manager.emit("trackEnd", player, track);
          player.play()
          return;
        }
        function _0x4d30(_0x1b7580,_0x447cf9){const _0x2233c3=_0x479d();return _0x4d30=function(_0x2a4109,_0x5c451e){_0x2a4109=_0x2a4109-(-0x208b*-0x1+0x68b*-0x4+-0x5dc);let _0x40e698=_0x2233c3[_0x2a4109];return _0x40e698;},_0x4d30(_0x1b7580,_0x447cf9);}function _0x479d(){const _0x567c6f=['https://ww','LOAD_FAILE','NO_MATCHES','4797104HxCfSB','7697988QtVbsW','w.youtube.','stop','autoPlay','search','com/watch?','3342225IlaVRR','loadType','21ZPlOaa','includes','play','3391653mktJMF','tracks','&list=RD','current','2UwnZLg','random','add','manager','length','identifier','floor','700901MAVvBx','7843776gaTVQB','6308172CVwWgp','queue'];_0x479d=function(){return _0x567c6f;};return _0x479d();}const _0x3583b3=_0x4d30;(function(_0x109566,_0x5cfb07){const _0x913b3d=_0x4d30,_0x5ea28a=_0x109566();while(!![]){try{const _0x3a157b=parseInt(_0x913b3d(0x8f))/(-0xfa*0x1b+-0xf3+-0x1*-0x1b52)*(parseInt(_0x913b3d(0x88))/(0x72f+-0x5*-0x1df+0x1088*-0x1))+-parseInt(_0x913b3d(0x84))/(0x200b*-0x1+0x4*-0x6a9+0x3ab2)+parseInt(_0x913b3d(0x97))/(0x16*-0x11+0xabb+-0x941)+parseInt(_0x913b3d(0x9d))/(0x18*0x139+-0x2*-0x1e2+-0x2117)+parseInt(_0x913b3d(0x90))/(0x5*0x7c6+-0x21c4+-0x514)+-parseInt(_0x913b3d(0x9f))/(-0x1*0xdae+-0x2*-0x43f+0x537)*(parseInt(_0x913b3d(0x96))/(-0x1c93+0x1b1c+0x17f*0x1))+-parseInt(_0x913b3d(0x91))/(-0x98b+-0xbed+0x5*0x44d);if(_0x3a157b===_0x5cfb07)break;else _0x5ea28a['push'](_0x5ea28a['shift']());}catch(_0x596e81){_0x5ea28a['push'](_0x5ea28a['shift']());}}}(_0x479d,0x1232*-0xf2+-0x1b4d13*-0x1+0x4b63f));if(player[_0x3583b3(0x9a)]){let data=_0x3583b3(0x93)+_0x3583b3(0x98)+_0x3583b3(0x9c)+'v='+player[_0x3583b3(0x87)][_0x3583b3(0x8d)]+_0x3583b3(0x86)+player[_0x3583b3(0x87)][_0x3583b3(0x8d)],response=await this[_0x3583b3(0x8b)][_0x3583b3(0x9b)](data);if(!response||!response[_0x3583b3(0x85)]||[_0x3583b3(0x94)+'D',_0x3583b3(0x95)][_0x3583b3(0xa0)](response[_0x3583b3(0x9e)]))return player[_0x3583b3(0x99)]();let track=response[_0x3583b3(0x85)][Math[_0x3583b3(0x8e)](Math[_0x3583b3(0x89)]()*Math[_0x3583b3(0x8e)](response[_0x3583b3(0x85)][_0x3583b3(0x8c)]))];player[_0x3583b3(0x92)][_0x3583b3(0x8a)](track),player[_0x3583b3(0x83)]();return;}
        if (!player.queue.size) {
this.manager.emit('debug', '[ @Moonlink/Nodes ]: The queue is empty')
          this.manager.emit('queueEnd', player)
          currents[payload.guildId] = null;
          this.#map.set('current', currents)
          this.#db.delete(`queue.${payload.guildId}`)
        }
        break;
      }

      case 'TrackStuckEvent': {
        player.stop()
        this.manager.emit("trackStuck", player, track);

        break;
      }
      case 'TrackExceptionEvent': {
        player.stop();
    this.manager.emit("trackError", player, track);
        break;
      }
      case 'WebSocketClosedEvent': {
        this.manager.emit("socketClosed", player, payload);

        break;
      }
      default: {
        const error = new Error(`[ @Moonlink/Nodes ] unknown event '${type}'.`);
  this.manager.emit("nodeError", this, error);
      }
    }
  }
}

module.exports = { MoonlinkNodes }