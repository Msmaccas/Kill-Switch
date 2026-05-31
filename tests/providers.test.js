const assert = require('assert');
const path = require('path');

async function run() {
  const providers = require('../packages/providers/dist/index.js');
  // FixtureEventProvider with existing file
  const fixturePath = path.join(__dirname, '..', 'fixtures', 'raw', 'events.json');
  const fixtureProvider = new providers.FixtureEventProvider(fixturePath);
  const result = await fixtureProvider.fetch();
  // Should return OK state and array of events (may be empty)
  assert.strictEqual(result.state, 'OK');
  assert.ok(Array.isArray(result.value));
  // FixtureEventProvider with missing file
  const missingProvider = new providers.FixtureEventProvider('nonexistent.json');
  const missingResult = await missingProvider.fetch();
  assert.strictEqual(missingResult.state, 'NOT_AVAILABLE');
  // PriceEventGenerator generates events one by one
  const gen = new providers.PriceEventGenerator([-0.1, 0.05], 'ABC');
  const r1 = await gen.fetch();
  assert.strictEqual(r1.state, 'OK');
  assert.strictEqual(r1.value.length, 1);
  const r2 = await gen.fetch();
  assert.strictEqual(r2.value.length, 1);
  const r3 = await gen.fetch();
  assert.strictEqual(r3.value.length, 0);
}

module.exports = { run };