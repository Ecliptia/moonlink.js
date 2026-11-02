const test = require('node:test');
const assert = require('node:assert/strict');
const { Manager } = require('../dist');
const { NodeState } = require('../dist/src/typings/types.js');

function audioNode(identifier, overrides = {}) {
  return {
    identifier, uuid: identifier, connected: true, destroyed: false,
    state: NodeState.READY,
    stats: {
      players: 3, playingPlayers: 2, uptime: 1000,
      cpu: { systemLoad: 0.1, lavalinkLoad: 0.1 },
      memory: { used: 10, allocated: 100 },
    },
    ...overrides,
  };
}

function managerWith(nodes, options = {}) {
  const manager = new Manager({
    nodes: [{ host: '127.0.0.1', port: 2333, password: 'test', secure: false }],
    options: { node: options, database: { type: 'memory' } },
  });
  for (const node of nodes) manager.nodes.nodes.set(node.identifier, node);
  return manager;
}

test('excluding the only READY node still permits a connected fallback node', () => {
  const excluded = audioNode('ready');
  const fallback = audioNode('connected', { state: NodeState.CONNECTED });
  const manager = managerWith([excluded, fallback]);
  assert.equal(manager.nodes.findNode({ exclude: ['ready'] }), fallback);
});

test('a destroyed node is ineligible even when stale flags say connected and READY', () => {
  const destroyed = audioNode('destroyed', { destroyed: true });
  const available = audioNode('available', { state: NodeState.CONNECTED });
  const manager = managerWith([destroyed, available]);
  assert.equal(manager.nodes.findNode(), available);
});

test('a disconnected node is ineligible even when its stale state says READY', () => {
  const disconnected = audioNode('disconnected', { connected: false });
  const available = audioNode('available', { state: NodeState.CONNECTED });
  const manager = managerWith([disconnected, available]);
  assert.equal(manager.nodes.findNode(), available);
});

test('health filtering tolerates partial server stats without throwing', () => {
  const partial = audioNode('partial', { stats: { players: 0 } });
  const measured = audioNode('measured');
  const manager = managerWith([partial, measured], { avoidUnhealthyNodes: true });
  let selected;
  assert.doesNotThrow(() => { selected = manager.nodes.findNode(); });
  assert.ok([partial, measured].includes(selected));
});

test('a nonfinite player score cannot beat a finite measured player score', () => {
  const invalid = audioNode('invalid');
  invalid.stats.players = NaN;
  const measured = audioNode('measured');
  const manager = managerWith([invalid, measured], { selectionStrategy: 'leastPlayers' });
  assert.equal(manager.nodes.findNode(), measured);
});

test('health filtering avoids nonfinite load and zero allocated memory when a healthy node exists', () => {
  const invalid = audioNode('invalid');
  invalid.stats.cpu.systemLoad = NaN;
  invalid.stats.memory.allocated = 0;
  const measured = audioNode('measured');
  const manager = managerWith([invalid, measured], { avoidUnhealthyNodes: true });
  assert.equal(manager.nodes.findNode(), measured);
});

test('priority selection preserves the lower-number-wins convention', () => {
  const lowerPriority = audioNode('later', { priority: 10 });
  const preferred = audioNode('preferred', { priority: 1 });
  const manager = managerWith([lowerPriority, preferred], { selectionStrategy: 'priority' });
  assert.equal(manager.nodes.findNode(), preferred);
});

test('uptime selection prefers the larger measured uptime', () => {
  const newer = audioNode('newer');
  const older = audioNode('older');
  older.stats.uptime = 5000;
  const manager = managerWith([newer, older], { selectionStrategy: 'uptime' });
  assert.equal(manager.nodes.findNode(), older);
});

test('leastPlayers selection chooses fewer players and preserves insertion order on ties', () => {
  const busy = audioNode('busy');
  const firstIdle = audioNode('first-idle');
  const secondIdle = audioNode('second-idle');
  firstIdle.stats.players = secondIdle.stats.players = 0;
  const manager = managerWith([busy, firstIdle, secondIdle], { selectionStrategy: 'leastPlayers' });
  assert.equal(manager.nodes.findNode(), firstIdle);
});

test('selecting a node for new work never migrates an existing player', () => {
  const existing = audioNode('existing');
  const idle = audioNode('idle');
  idle.stats.players = 0;
  const manager = managerWith([existing, idle], { selectionStrategy: 'leastPlayers' });
  const player = { node: existing, transferNode() { throw new Error('unexpected migration'); } };
  manager.players.players.set('123456789012345678', player);
  assert.equal(manager.nodes.findNode(), idle);
  assert.equal(player.node, existing);
});

test('health preference considers a healthy connected fallback before an overloaded READY node', () => {
  const overloaded = audioNode('overloaded');
  overloaded.stats.cpu.systemLoad = 0.99;
  const fallback = audioNode('fallback', { state: NodeState.CONNECTED });
  const manager = managerWith([overloaded, fallback], { avoidUnhealthyNodes: true });
  assert.equal(manager.nodes.findNode(), fallback);
});

test('failover selection can disallow the legacy overloaded-node fallback', () => {
  const overloaded = audioNode('overloaded');
  overloaded.stats.cpu.systemLoad = 0.99;
  const manager = managerWith([overloaded], { avoidUnhealthyNodes: true });
  assert.equal(manager.nodes.findNode({ allowUnhealthyFallback: false }), undefined);
  assert.equal(manager.nodes.findNode(), overloaded);
});
