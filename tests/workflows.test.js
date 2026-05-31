const assert = require('assert');

async function run() {
  const data = require('../packages/data/dist/index.js');
  const core = require('../packages/core/dist/index.js');
  const workflows = require('../packages/workflows/dist/index.js');
  // reset
  delete process.env.DATA_DIR;
  await data.resetData();
  // add thesis
  const thesis = core.createThesis({
    type: 'setup',
    description: 'desc',
    supports: ['s'],
    killConditions: ['drop 10%'],
    reviewCadenceDays: 1,
    horizonDays: 5
  });
  await data.addThesis(thesis);
  // add events causing soft break
  await data.addEvent({
    id: 'ev1',
    type: 'price',
    description: 'drop -6%',
    timestamp: new Date().toISOString(),
    attributes: { percentageChange: -0.06 }
  });
  const board = await workflows.evaluateBoard();
  assert.strictEqual(board.length, 1);
  assert.strictEqual(board[0].severity, 'SOFT');
}

module.exports = { run };