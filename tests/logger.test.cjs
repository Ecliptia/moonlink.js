const test = require('node:test');
const assert = require('node:assert/strict');
const { spawnSync } = require('node:child_process');
const path = require('node:path');

function run(source) {
  const result = spawnSync(process.execPath, ['-e', source], { cwd: path.resolve(__dirname, '..'), encoding: 'utf8', timeout: 5000 });
  assert.equal(result.status, 0, result.stderr);
  return result;
}

test('Logger defaults to silent, including banner, status and failover panels', () => {
  const output = run(`const {Logger}=require('./dist'); const logger=new Logger(); logger.info('test','hidden'); logger.banner(); logger.systemStatus([]); logger.failover({source:'a',target:'b',status:'failed'});`);
  assert.equal(output.stdout, '');
  assert.equal(output.stderr, '');
});

test('opt-in combined logger prints module messages and the NYXLINK banner', () => {
  const output = run(`const {Logger}=require('./dist'); const logger=new Logger({level:'info',color:false,timestamps:false}); logger.info('Node','connected'); logger.banner();`);
  assert.match(output.stdout, /INFO\s+\[Node\] connected/);
  assert.match(output.stdout, /AUDIO CLIENT/);
  assert.doesNotMatch(output.stdout, /\x1b\[/);
});

test('manager logging is silent without opt-in and preserves raw debug events', () => {
  const output = run(`const {Manager}=require('./dist'); const m=new Manager({nodes:[{host:'127.0.0.1',port:2333,password:'test',secure:false}]}); let seen; m.on('debug',message=>seen=message); m.emit('debug','raw-test-message'); if(seen!=='raw-test-message') throw new Error('debug lost');`);
  assert.equal(output.stdout, '');
  assert.equal(output.stderr, '');
});

test('attached manager logger shows real node counts and detaches all its listeners', () => {
  const output = run(`
    const {Manager,Logger}=require('./dist');
    const m=new Manager({nodes:[{identifier:'measured-node',host:'127.0.0.1',port:2333,password:'test',secure:false}]});
    m.nodes.add({identifier:'measured-node',host:'127.0.0.1',port:2333,password:'test',secure:false});
    const logger=new Logger({level:'debug',color:false,timestamps:false});
    const detach=logger.attachManager(m);
    m.emit('debug','Moonlink.js > Node >> visible-before-detach');
    logger.managerStatus(m);
    detach(); detach();
    m.emit('debug','Moonlink.js > Node >> hidden-after-detach');
    m.emit('nodeConnected',m.nodes.nodes.get('measured-node'));
  `);
  assert.match(output.stdout, /visible-before-detach/);
  assert.match(output.stdout, /SYSTEM STATUS/);
  assert.match(output.stdout, /measured-node/);
  assert.match(output.stdout, /0 players/);
  assert.match(output.stdout, /ATTENTION/);
  assert.doesNotMatch(output.stdout, /hidden-after-detach/);
  assert.equal((output.stdout.match(/SYSTEM STATUS/g) || []).length, 1);
});

test('manager options can opt into logging without printing an automatic banner', () => {
  const output = run(`const {Manager}=require('./dist'); const m=new Manager({nodes:[{host:'127.0.0.1',port:2333,password:'test',secure:false}],options:{logging:{level:'debug',color:false,timestamps:false}}}); m.emit('debug','Moonlink.js > Player >> enabled-by-config');`);
  assert.match(output.stdout, /enabled-by-config/);
  assert.doesNotMatch(output.stdout, /AUDIO CLIENT/);
});

test('failover panel follows the confirmed failure result and never prints Recovered', () => {
  const output = run(`
    const {Manager,Node,Player,Logger}=require('./dist');
    const m=new Manager({nodes:[{identifier:'old',host:'127.0.0.1',port:2333,password:'test',secure:false}]});
    m.database={set:async()=>{}};
    m.nodes.add({identifier:'old',host:'127.0.0.1',port:2333,password:'test',secure:false});
    const old=m.nodes.nodes.get('old'); old.rest.destroyPlayer=async()=>{};
    const target=new Node(m,{identifier:'target',host:'127.0.0.2',port:2333,password:'test',secure:false}); target.connected=true;
    const p=new Player(m,old,{guildId:'123456789012345678',voiceChannelId:'223456789012345678'}); p.stopHealthCheck(); p.restart=async()=>false;
    new Logger({level:'info',color:false}).attachManager(m);
    p.transferNode(target).then(result=>{if(result)throw new Error('false success');});
  `);
  assert.match(output.stdout, /In progress/);
  assert.match(output.stdout, /Failed/);
  assert.doesNotMatch(output.stdout, /Recovered/);
});
