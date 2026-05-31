const path = require('path');

async function runTest(name, fn) {
  try {
    await fn();
    console.log(`✓ ${name}`);
    return true;
  } catch (err) {
    console.error(`✗ ${name}`);
    console.error(err);
    return false;
  }
}

async function main() {
  const tests = [
    require('./core.test.js'),
    require('./data.test.js'),
    require('./providers.test.js'),
    require('./workflows.test.js'),
    require('./reports.test.js'),
    require('./server.test.js')
  ];
  let passed = 0;
  let total = 0;
  for (const mod of tests) {
    if (typeof mod.run !== 'function') {
      console.warn('Test file does not export run()');
      continue;
    }
    total++;
    const ok = await runTest(mod.name || mod.description || mod.constructor.name, mod.run);
    if (ok) passed++;
  }
  console.log(`${passed}/${total} tests passed`);
  if (passed !== total) {
    process.exit(1);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});