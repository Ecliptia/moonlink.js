const { spawn } = require('node:child_process');
const fs = require('node:fs/promises');
const path = require('node:path');
const { withBackendLab } = require('../tests/helpers/backend-lab.cjs');

const args = process.argv.slice(2);
if (args[0] === '--') args.shift();
const value = args[0] ?? '600';
if (args.length > 1 || !/^\d+$/.test(value) || Number(value) < 10 || Number(value) > 7200) {
  console.error('Usage: pnpm run test:endurance -- <seconds: 10..7200> (default: 600)');
  process.exitCode = 1;
} else {
  fs.rm(path.resolve(__dirname, '../.runtime/integration/endurance-report.json'), { force: true }).then(() => withBackendLab(async context => {
    const child = spawn(process.execPath, ['--expose-gc', '--max-old-space-size=512', 'scripts/endurance-worker.cjs', value], {
      stdio: 'inherit', env: { ...process.env, NYXLINK_BACKENDS_JSON: JSON.stringify(context) },
    });
    let killed = false;
    let force;
    const watchdog = setTimeout(() => {
      killed = true;
      child.kill('SIGTERM');
      force = setTimeout(() => child.kill('SIGKILL'), 5000);
    }, (Number(value) + 90) * 1000);
    try {
      const status = await new Promise((resolve, reject) => { child.once('error', reject); child.once('exit', resolve); });
      if (killed || status !== 0) throw new Error(`Endurance worker failed${killed ? ': watchdog expired' : ` (${status})`}`);
    } finally {
      clearTimeout(watchdog);
      clearTimeout(force);
    }
  })).catch(error => { console.error(error.message); process.exitCode = 1; });
}
