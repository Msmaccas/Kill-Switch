const assert = require('assert');
const fs = require('fs');
const path = require('path');

async function run() {
  const reports = require('../packages/reports/dist/index.js');
  // Create dummy board
  const board = [
    {
      thesis: {
        id: 't1',
        type: 'setup',
        description: 'desc',
        supports: ['s'],
        killConditions: ['drop 10%'],
        reviewCadenceDays: 1,
        horizonDays: 5,
        createdAt: new Date().toISOString(),
        lastReviewedAt: new Date().toISOString()
      },
      severity: 'SOFT',
      lastUpdate: new Date().toISOString(),
      notes: 'note',
      reviewDue: false
    }
  ];
  const text = reports.generateBoardReport(board);
  assert.ok(typeof text === 'string' && text.includes('t1'));
  // Save report to temporary directory
  const tmpDir = path.join(__dirname, '.tmp-reports');
  await reports.saveBoardReport(board, tmpDir, 'report');
  assert.ok(fs.existsSync(path.join(tmpDir, 'report.json')));
  assert.ok(fs.existsSync(path.join(tmpDir, 'report.txt')));
  // cleanup
  fs.rmSync(tmpDir, { recursive: true, force: true });
}

module.exports = { run };