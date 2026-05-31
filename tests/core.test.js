const assert = require('assert');

/** Test core module functionality. */
async function run() {
  const core = require('../packages/core/dist/index.js');
  const validators = require('../packages/core/dist/validators.js');
  // Test createThesis assigns id and timestamps
  const thesis = core.createThesis({
    type: 'setup',
    description: 'test',
    supports: ['s'],
    killConditions: ['drop 20%'],
    reviewCadenceDays: 1,
    horizonDays: 5
  });
  assert.ok(thesis.id && typeof thesis.id === 'string');
  assert.ok(thesis.createdAt && thesis.lastReviewedAt);
  // Test evaluateThesis returns drift events based on kill conditions
  const events = [
    {
      id: 'ev1',
      type: 'price',
      description: 'price drop 15%',
      timestamp: new Date().toISOString(),
      attributes: { percentageChange: -0.15 }
    }
  ];
  const drifts = core.evaluateThesis(thesis, events);
  assert.strictEqual(drifts.length, 1);
  // Should be soft break because half threshold is -10% and -15% is beyond hard threshold? Wait, kill condition is drop 20% so hard threshold is -0.20; half is -0.10; -0.15 <= -0.10 so this is soft break
  assert.strictEqual(drifts[0].severity, 'SOFT');
  // Test maxSeverity
  const max = core.maxSeverity(drifts);
  assert.strictEqual(max, 'SOFT');
  // Test isReviewDue
  const due = core.isReviewDue({ ...thesis, lastReviewedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString() }, new Date());
  assert.strictEqual(due, true);
  // Validate thesis
  validators.validateThesis(thesis);
}

module.exports = { run };