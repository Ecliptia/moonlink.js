const { spawn } = require('node:child_process');
const { withBackendLab } = require('../tests/helpers/backend-lab.cjs');

withBackendLab(async context => {
  console.log('Isolated backend versions:', context.backends.map(({ kind, version }) => `${kind} ${version}`).join(', '));
  const child = spawn(process.execPath, ['--test', 'tests/integration/backends.test.cjs'], {
    stdio: 'inherit',
    env: { ...process.env, NYXLINK_BACKENDS_JSON: JSON.stringify(context) },
  });
  const status = await new Promise((resolve, reject) => { child.once('error', reject); child.once('exit', resolve); });
  if (status !== 0) process.exitCode = status || 1;
}).catch(error => { console.error(error.message); process.exitCode = 1; });
