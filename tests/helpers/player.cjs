const { Manager, Node, Player, Track } = require('../../dist/index.js');
const { DatabaseManager } = require('../../dist/src/managers/DatabaseManager.js');
const { NodeState } = require('../../dist/src/typings/types.js');

function deferred() {
  let resolve;
  let reject;
  const promise = new Promise((yes, no) => { resolve = yes; reject = no; });
  return { promise, resolve, reject };
}

function createTrack(identifier) {
  return new Track({
    encoded: `encoded-${identifier}`,
    info: {
      identifier,
      title: `Track ${identifier}`,
      author: 'Test artist',
      length: 180000,
      sourceName: 'youtube',
      isSeekable: true,
      isStream: false,
      uri: `https://www.youtube.com/watch?v=${identifier}`,
      position: 0,
    },
  });
}

function createPlayer(t) {
  const config = { identifier: 'test-node', host: '127.0.0.1', port: 2333, password: 'test-only' };
  const manager = new Manager({
    nodes: [config],
    send() {},
    options: { database: { type: 'memory' } },
  });
  manager.database = new DatabaseManager(manager);
  const node = new Node(manager, config);
  node.connected = true;
  node.state = NodeState.READY;
  manager.nodes.nodes.set(node.identifier, node);
  const requests = [];
  node.rest.updatePlayer = async (guildId, payload) => {
    requests.push({ guildId, payload });
    return { guildId, ...payload };
  };
  node.rest.destroyPlayer = async () => null;
  manager.search = async () => ({ loadType: 'empty', tracks: [] });
  const player = new Player(manager, node, {
    guildId: '123456789012345678',
    voiceChannelId: '223456789012345678',
    autoPlay: true,
  });
  manager.players.players.set(player.guildId, player);
  player.stopHealthCheck();
  player.voice.sessionId = 'test-session';
  player.voice.token = 'test-voice-token';
  player.voice.endpoint = 'test.invalid';
  t.after(async () => { player.stopHealthCheck(); await node.destroy(); });
  return { manager, node, player, requests };
}

module.exports = { createPlayer, createTrack, deferred };
