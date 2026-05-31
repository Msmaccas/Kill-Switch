const assert = require('assert');
const fs = require('fs');
const path = require('path');

async function run() {
  // Use temporary data directory to avoid interfering with actual data.  Note
  // that DATA_DIR must be set before requiring the module because the
  // constant is captured at module import time.
  const tmpDir = path.join(__dirname, '.tmp-data');
  process.env.DATA_DIR = tmpDir;
  const data = require('../packages/data/dist/index.js');
  await data.resetData();
  // Add thesis and event
  const thesis = {
    id: 't1',
    type: 'setup',
    description: 'desc',
    supports: ['s'],
    killConditions: ['drop 20%'],
    reviewCadenceDays: 1,
    horizonDays: 5,
    createdAt: new Date().toISOString(),
    lastReviewedAt: new Date().toISOString()
  };
  await data.addThesis(thesis);
  const theses = await data.loadTheses();
  assert.strictEqual(theses.length, 1);
  assert.strictEqual(theses[0].id, 't1');
  // Add event
  const event = {
    id: 'e1',
    type: 'price',
    description: 'desc',
    timestamp: new Date().toISOString(),
    attributes: { percentageChange: -0.05 }
  };
  await data.addEvent(event);
  const events = await data.loadEvents();
  assert.strictEqual(events.length, 1);
  assert.strictEqual(events[0].id, 'e1');
  // Ensure files exist
  assert.ok(fs.existsSync(path.join(tmpDir, 'theses.json')));
  assert.ok(fs.existsSync(path.join(tmpDir, 'events.json')));
  // Clean up
  await data.resetData();
}

module.exports = { run };