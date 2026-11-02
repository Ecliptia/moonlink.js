const test = require('node:test');
const assert = require('node:assert/strict');
const { VoiceConnectionState } = require('../dist/src/typings/types');
const { createPlayer, deferred } = require('./helpers/player.cjs');

const flush = () => new Promise(resolve => setImmediate(resolve));

function fixture(t) {
  const context = createPlayer(t);
  const { voice } = context.player;
  voice.sessionId = null;
  voice.token = null;
  voice.endpoint = null;
  context.manager.options.voiceConnection = { timeout: 100 };
  t.after(() => {
    clearTimeout(voice.connectionTimeout);
    clearTimeout(voice.reconnectionTimer);
    voice.removeAllListeners();
  });
  return { ...context, voice };
}

async function credentials(voice, player, token = 'local-test-token') {
  await voice.handleStateUpdate({ guild_id: player.guildId, channel_id: player.voiceChannelId, session_id: 'local-session' });
  voice.handleServerUpdate({ guild_id: player.guildId, token, endpoint: 'voice.test.invalid' });
}

for (const action of ['destroy', 'disconnect']) {
  test(`late voice acknowledgement cannot reconnect after ${action}`, async t => {
    const { player, voice } = fixture(t);
    const response = deferred();
    player.updateVoice = () => response.promise;
    let connects = 0;
    voice.on('connect', () => connects++);
    await credentials(voice, player);
    if (action === 'destroy') voice.destroy();
    else await voice.handleStateUpdate({ guild_id: player.guildId, channel_id: null });
    response.resolve({});
    await flush();
    assert.equal(voice.state, action === 'destroy' ? VoiceConnectionState.DESTROYED : VoiceConnectionState.DISCONNECTED);
    assert.equal(player.connected, false);
    assert.equal(connects, 0);
  });
}

test('duplicate gateway credentials in flight produce one backend voice update', async t => {
  const { player, voice } = fixture(t);
  const response = deferred();
  const payloads = [];
  player.updateVoice = payload => { payloads.push(payload); return response.promise; };
  await credentials(voice, player);
  await credentials(voice, player);
  response.resolve({});
  await flush();
  assert.equal(payloads.length, 1);
  assert.equal(voice.state, VoiceConnectionState.CONNECTED);
});

test('an older voice acknowledgement cannot mark newer credentials as connected', async t => {
  const { player, voice } = fixture(t);
  const old = deferred();
  const latest = deferred();
  const payloads = [];
  player.updateVoice = payload => {
    payloads.push(payload);
    return payload.token === 'old-token' ? old.promise : latest.promise;
  };
  let connects = 0;
  voice.on('connect', () => connects++);
  await credentials(voice, player, 'old-token');
  voice.handleServerUpdate({ guild_id: player.guildId, token: 'new-token', endpoint: 'new-voice.test.invalid' });
  old.resolve({});
  await flush();
  assert.equal(connects, 0);
  assert.notEqual(voice.state, VoiceConnectionState.CONNECTED);
  latest.resolve({});
  await flush();
  assert.equal(voice.state, VoiceConnectionState.CONNECTED);
  assert.equal(voice.token, 'new-token');
  assert.equal(connects, 1);
  assert.equal(payloads.filter(payload => payload.token === 'new-token').length, 1);
});

test('completed connect attempts remove their opposite-event listener', async t => {
  const { manager, player, voice } = fixture(t);
  const listenersAfterConnect = [];
  let cycle = 0;
  manager.send = (_guild, packet) => {
    queueMicrotask(() => {
      if (packet.d.channel_id === null) void voice.handleStateUpdate({ guild_id: player.guildId, channel_id: null });
      else void credentials(voice, player, `cycle-${++cycle}`);
    });
  };
  for (let index = 0; index < 3; index++) {
    await voice.connect({ selfDeaf: true, selfMute: false });
    listenersAfterConnect.push(voice.listenerCount('disconnect'));
    await voice.disconnect();
    assert.equal(voice.listenerCount('connect'), 0);
    assert.equal(voice.listenerCount('disconnect'), 0);
  }
  assert.deepEqual(listenersAfterConnect, [0, 0, 0]);
});

test('destroyed voice ignores a late gateway disconnect packet', async t => {
  const { player, voice } = fixture(t);
  voice.destroy();
  await voice.handleStateUpdate({ guild_id: player.guildId, channel_id: null });
  assert.equal(voice.state, VoiceConnectionState.DESTROYED);
});

test('gateway packet handler ignores malformed payloads', async t => {
  const { manager, player } = fixture(t);
  manager.initialized = true;
  manager.clientId = '323456789012345678';
  let updates = 0;
  player.voice.handleStateUpdate = async () => { updates++; };
  player.voice.handleServerUpdate = () => { updates++; };
  const malformed = [null, undefined, {}, [], { t: 'VOICE_STATE_UPDATE' }, { t: 'VOICE_SERVER_UPDATE', d: null },
    { t: 'VOICE_STATE_UPDATE', d: { guild_id: player.guildId, user_id: manager.clientId } },
    { t: 'VOICE_SERVER_UPDATE', d: { guild_id: player.guildId, endpoint: 42, token: {} } }];
  const results = await Promise.allSettled(malformed.map(packet => manager.packetUpdate(packet)));
  assert.ok(results.every(result => result.status === 'fulfilled'));
  assert.equal(updates, 0);
});

test('gateway packet handler ignores other users, guilds and event types', async t => {
  const { manager, player } = fixture(t);
  manager.initialized = true;
  manager.clientId = '323456789012345678';
  let updates = 0;
  player.voice.handleStateUpdate = async () => { updates++; };
  player.voice.handleServerUpdate = () => { updates++; };
  for (const packet of [
    { t: 'VOICE_STATE_UPDATE', d: { guild_id: player.guildId, user_id: 'other-user', channel_id: player.voiceChannelId, session_id: 's' } },
    { t: 'VOICE_SERVER_UPDATE', d: { guild_id: 'other-guild', token: 't', endpoint: 'voice.test.invalid' } },
    { t: 'MESSAGE_CREATE', d: { guild_id: player.guildId } },
  ]) await manager.packetUpdate(packet);
  assert.equal(updates, 0);
});

test('server-before-state credentials complete a fresh connection', async t => {
  const { player, voice } = fixture(t);
  const payloads = [];
  player.updateVoice = async payload => { payloads.push(payload); return {}; };
  voice.handleServerUpdate({ guild_id: player.guildId, token: 'server-first-token', endpoint: 'voice.test.invalid' });
  assert.equal(payloads.length, 0);
  await voice.handleStateUpdate({ guild_id: player.guildId, channel_id: player.voiceChannelId, session_id: 'server-first-session' });
  await flush();
  assert.equal(voice.state, VoiceConnectionState.CONNECTED);
  assert.equal(payloads.length, 1);
  assert.deepEqual(payloads[0], { sessionId: 'server-first-session', token: 'server-first-token', endpoint: 'voice.test.invalid', channelId: player.voiceChannelId });
});

test('server-before-state move retains the new token even when the endpoint stays the same', async t => {
  const { player, voice } = fixture(t);
  const payloads = [];
  player.updateVoice = async payload => { payloads.push(payload); return {}; };
  await credentials(voice, player, 'old-channel-token');
  await flush();
  const previousUpdates = payloads.length;
  const newChannel = '423456789012345678';
  voice.handleServerUpdate({ guild_id: player.guildId, token: 'new-channel-token', endpoint: 'voice.test.invalid' });
  await voice.handleStateUpdate({ guild_id: player.guildId, channel_id: newChannel, session_id: 'moved-session' });
  await flush();
  assert.equal(voice.state, VoiceConnectionState.CONNECTED);
  assert.equal(player.voiceChannelId, newChannel);
  assert.equal(voice.token, 'new-channel-token');
  assert.equal(payloads.at(-1).channelId, newChannel);
  assert.equal(payloads.at(-1).sessionId, 'moved-session');
  assert.equal(payloads.at(-1).token, 'new-channel-token');
  assert.ok(payloads.slice(previousUpdates).every(payload => payload.token !== 'old-channel-token'));
});

test('null endpoint invalidates an in-flight acknowledgement until a fresh server arrives', async t => {
  const { player, voice } = fixture(t);
  const old = deferred();
  const payloads = [];
  player.updateVoice = payload => {
    payloads.push(payload);
    return payload.token === 'old-token' ? old.promise : Promise.resolve({});
  };
  let connects = 0;
  voice.on('connect', () => connects++);
  await credentials(voice, player, 'old-token');
  voice.handleServerUpdate({ guild_id: player.guildId, token: 'waiting-token', endpoint: null });
  old.resolve({});
  await flush();
  assert.notEqual(voice.state, VoiceConnectionState.CONNECTED);
  assert.equal(connects, 0);
  voice.handleServerUpdate({ guild_id: player.guildId, token: 'fresh-token', endpoint: 'fresh-voice.test.invalid' });
  await flush();
  assert.equal(voice.state, VoiceConnectionState.CONNECTED);
  assert.equal(connects, 1);
  assert.equal(payloads.at(-1).token, 'fresh-token');
});

test('synchronous gateway completion resolves connect without leaving connection timers', async t => {
  const { manager, player, voice } = fixture(t);
  player.updateVoice = async () => ({});
  manager.send = (_guild, packet) => {
    if (packet.d.channel_id !== null) {
      voice.handleServerUpdate({ guild_id: player.guildId, token: 'synchronous-token', endpoint: 'voice.test.invalid' });
      void voice.handleStateUpdate({ guild_id: player.guildId, channel_id: player.voiceChannelId, session_id: 'synchronous-session' });
    } else void voice.handleStateUpdate({ guild_id: player.guildId, channel_id: null });
  };
  const result = await Promise.allSettled([voice.connect({ selfDeaf: true, selfMute: false })]);
  assert.equal(result[0].status, 'fulfilled');
  assert.equal(voice.state, VoiceConnectionState.CONNECTED);
  assert.equal(voice.connectionTimeout, null);
  assert.equal(voice.listenerCount('connect'), 0);
  assert.equal(voice.listenerCount('disconnect'), 0);
});

test('a thrown gateway send rejects cleanly and a later connection can succeed', async t => {
  const { manager, player, voice } = fixture(t);
  manager.send = () => { throw new Error('local gateway send failed'); };
  await assert.rejects(voice.connect({ selfDeaf: true, selfMute: false }), /local gateway send failed/);
  const stateAfterFailure = voice.state;
  const listenersAfterFailure = voice.listenerCount('connect') + voice.listenerCount('disconnect');
  player.updateVoice = async () => ({});
  manager.send = (_guild, packet) => {
    queueMicrotask(() => {
      if (packet.d.channel_id === null) void voice.handleStateUpdate({ guild_id: player.guildId, channel_id: null });
      else void credentials(voice, player, 'retry-token');
    });
  };
  const result = await Promise.allSettled([voice.connect({ selfDeaf: true, selfMute: false })]);
  assert.equal(stateAfterFailure, VoiceConnectionState.DISCONNECTED);
  assert.equal(listenersAfterFailure, 0);
  assert.equal(result[0].status, 'fulfilled');
  assert.equal(voice.state, VoiceConnectionState.CONNECTED);
});

test('destroy from the CONNECTED state listener suppresses a stale connect event', async t => {
  const { player, voice } = fixture(t);
  let connects = 0;
  voice.on('stateChange', state => {
    if (state === VoiceConnectionState.CONNECTED) voice.destroy();
  });
  voice.on('connect', () => connects++);
  await credentials(voice, player);
  await flush();
  assert.equal(voice.state, VoiceConnectionState.DESTROYED);
  assert.equal(connects, 0);
  assert.equal(player.connected, false);
});

test('destroy from the CONNECTING state listener cancels the join before gateway send', async t => {
  const { manager, voice } = fixture(t);
  let joins = 0;
  manager.send = (_guild, packet) => { if (packet.d.channel_id !== null) joins++; };
  voice.on('stateChange', state => {
    if (state === VoiceConnectionState.CONNECTING) voice.destroy();
  });
  const result = await Promise.allSettled([voice.connect({ selfDeaf: true, selfMute: false })]);
  assert.equal(result[0].status, 'rejected');
  assert.equal(joins, 0);
  assert.equal(voice.state, VoiceConnectionState.DESTROYED);
  assert.equal(voice.connectionTimeout, null);
  assert.equal(voice.listenerCount('connect'), 0);
  assert.equal(voice.listenerCount('disconnect'), 0);
});

test('an acknowledged standalone server refresh cannot supply credentials for a later channel move', async t => {
  const { player, voice } = fixture(t);
  const payloads = [];
  player.updateVoice = async payload => { payloads.push(payload); return {}; };
  await credentials(voice, player, 'initial-token');
  await flush();
  voice.handleServerUpdate({ guild_id: player.guildId, token: 'standalone-refresh-token', endpoint: 'voice.test.invalid' });
  await flush();
  assert.equal(voice.state, VoiceConnectionState.CONNECTED);
  const beforeMove = payloads.length;
  const nextChannel = '423456789012345678';
  await voice.handleStateUpdate({ guild_id: player.guildId, channel_id: nextChannel, session_id: 'later-move-session' });
  await flush();
  assert.equal(payloads.length, beforeMove);
  assert.notEqual(voice.state, VoiceConnectionState.CONNECTED);
  voice.handleServerUpdate({ guild_id: player.guildId, token: 'later-move-token', endpoint: 'voice.test.invalid' });
  await flush();
  assert.equal(voice.state, VoiceConnectionState.CONNECTED);
  assert.equal(payloads.at(-1).token, 'later-move-token');
  assert.equal(payloads.at(-1).channelId, nextChannel);
});

test('explicit disconnect ignores late gateway credentials until a new connect attempt', async t => {
  const { manager, player, voice } = fixture(t);
  const payloads = [];
  player.updateVoice = async payload => { payloads.push(payload); return {}; };
  await credentials(voice, player, 'initial-token');
  await flush();
  manager.send = (_guild, packet) => {
    if (packet.d.channel_id === null) void voice.handleStateUpdate({ guild_id: player.guildId, channel_id: null });
    else queueMicrotask(() => { void credentials(voice, player, 'reopened-token'); });
  };
  await voice.disconnect();
  const beforeLatePackets = payloads.length;
  await credentials(voice, player, 'late-token');
  await flush();
  assert.equal(voice.state, VoiceConnectionState.DISCONNECTED);
  assert.equal(payloads.length, beforeLatePackets);
  await voice.connect({ selfDeaf: true, selfMute: false });
  await flush();
  assert.equal(voice.state, VoiceConnectionState.CONNECTED);
  assert.equal(payloads.at(-1).token, 'reopened-token');
});

test('reconnect from a disconnect listener waits until the leave has been acknowledged', async t => {
  const { manager, player, voice } = fixture(t);
  player.updateVoice = async () => ({});
  await credentials(voice, player); await flush();
  const sent = [];
  manager.send = (_guild, packet) => { sent.push(packet.d.channel_id); };
  let reconnecting;
  voice.once('disconnect', () => { reconnecting = voice.connect({ selfDeaf: true, selfMute: false }); });
  const leaving = voice.disconnect();
  assert.deepEqual(sent, [null]);
  await voice.handleStateUpdate({ guild_id: player.guildId, channel_id: null });
  await leaving; await flush();
  assert.deepEqual(sent, [null, player.voiceChannelId]);
  await credentials(voice, player, 'new-token');
  await reconnecting;
  assert.equal(voice.state, VoiceConnectionState.CONNECTED);
});

test('connect timeout sends a gateway leave and serializes retry after its acknowledgement', async t => {
  const { manager, player, voice } = fixture(t);
  manager.options.voiceConnection.timeout = 25;
  t.after(() => voice.destroy());
  const sent = [];
  let joins = 0;
  manager.send = (_guild, packet) => {
    sent.push(packet.d.channel_id);
    if (packet.d.channel_id !== null && ++joins > 1) {
      queueMicrotask(() => { void credentials(voice, player, 'timeout-retry-token'); });
    }
  };
  const connecting = voice.connect({ selfDeaf: true, selfMute: false });
  // Give the leave acknowledgement and retry a separate, generous deadline.
  manager.options.voiceConnection.timeout = 1000;
  await assert.rejects(connecting, /Voice connection timed out after 25ms/);
  assert.deepEqual(sent, [player.voiceChannelId, null]);
  const retry = voice.connect({ selfDeaf: true, selfMute: false });
  const settled = Promise.allSettled([retry]);
  await flush();
  assert.deepEqual(sent, [player.voiceChannelId, null]);
  await voice.handleStateUpdate({ guild_id: player.guildId, channel_id: null });
  const [result] = await settled;
  assert.equal(result.status, 'fulfilled');
  assert.deepEqual(sent, [player.voiceChannelId, null, player.voiceChannelId]);
  assert.equal(voice.state, VoiceConnectionState.CONNECTED);
  assert.equal(voice.token, 'timeout-retry-token');
  assert.equal(voice.connectionTimeout, null);
  assert.equal(voice.listenerCount('connect'), 0);
  assert.equal(voice.listenerCount('disconnect'), 0);
});
